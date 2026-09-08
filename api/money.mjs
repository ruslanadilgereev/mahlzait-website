// Geld — die Gewinnrechnung: Umsatz minus Abgaben minus Werbe- und AI-Kosten, pro Tag.
// GET  /api/money?pw=X            → Tageshistorie aus Firestore
// GET  /api/money?pw=X&refresh=1  → RC + ASA + Google Ads + AI-Cache ziehen, mergen, speichern
//
// Auth: DASHBOARD_PASSWORD env (wie die anderen Boards).
// RC:   RC_SECRET_API_KEY env, project proj41604426 (charts/revenue, Tagesauflösung).
// ASA:  ASA_* envs — über fetchAsaDailySpend() aus apple-ads-leaderboard.mjs.
// GAds: GOOGLE_ADS_* envs — über fetchGoogleCampaignsWithSpend() aus google-ads-leaderboard.mjs.
// GCP:  GOOGLE_SA_KEY (base64 SA json) für Firestore.
// State: Firestore mytemple-460913 → `money_dashboard_cache` → `state`.
//
// ── Warum dieser Endpunkt eine eigene Historie führt ───────────────────────
// Apple und Google geben Tages-Spend nur 90 Tage zurück. Wer länger als ein
// Quartal zurückschauen will, muss die Zahlen wegschreiben, BEVOR sie aus dem
// Fenster fallen. Genau das passiert hier: jeder Refresh mergt die frischen
// Tage in `days` und lässt alles Ältere unangetastet stehen. Der auswertbare
// Zeitraum wächst damit ab dem ersten Refresh mit.
//
// Gemergt wird FELDWEISE und nur innerhalb des Fensters, aus dem die jeweilige
// Quelle gerade geliefert hat. Sonst würde ein Tag, den Apple nicht mehr
// ausliefert, beim nächsten Refresh auf 0 zurückgesetzt — der Verlust wäre
// endgültig, weil die Quelle ihn nicht mehr hergibt.
//
// ── Was NICHT gerechnet wird ───────────────────────────────────────────────
// RC liefert Umsatz ausschliesslich in USD (Charts-API, `unit: "$"`; der
// dokumentierte `revenue_type`-Selektor wird still ignoriert). Deshalb wird
// der Rohwert in USD gespeichert und erst bei der Ausgabe mit EUR_PER_USD
// umgerechnet — ändert sich der Kurs, bewertet sich die ganze Historie neu,
// statt auf einem alten Kurs einzufrieren.
// Ad-Spend (ASA localSpend, Google account currency) und AI-Kosten sind bereits
// EUR und werden nicht angefasst.

import { google } from "googleapis";
import { gunzipSync } from "node:zlib";
import { fetchAsaDailySpend } from "./apple-ads-leaderboard.mjs";
import { fetchGoogleCampaignsWithSpend } from "./google-ads-leaderboard.mjs";

export const config = { maxDuration: 60 }; // 1 RC-Call + 1 ASA-Report + 2 GAQL + 3 Firestore-Ops

const GCP_PROJECT = "mytemple-460913";
const COLLECTION = "money_dashboard_cache";
const DOC_ID = "state";
const DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/${COLLECTION}/${DOC_ID}`;
// Der AI-Tab hat seine Kosten schon berechnet (inkl. Preistabelle je Modell und
// USD→EUR). Wir lesen sein Ergebnis, statt Query und Preistabelle zu duplizieren
// — eine zweite Preistabelle würde irgendwann auseinanderlaufen.
const AI_DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/ai_usage_dashboard_cache/state`;

const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";

// Kurs wie in ai-usage.mjs (Stand Juli 2026). Bewusst EINE Zahl im Projekt:
// das Frontend zeigte bisher 0.92, was veraltet ist.
const EUR_PER_USD = 0.875;

// Abzüge, einzeln statt als Sammelfaktor — sie sollen im UI je eine Zeile sein.
const VAT_RATE = 0.19;    // deutsche Umsatzsteuer, im Store-Preis enthalten
const STORE_RATE = 0.15;  // Apple + Google Small Business Program
const RC_RATE = 0.01;     // RevenueCat

const AD_LOOKBACK_DAYS = 90;   // Apple-API-Limit; Google spiegelt es
const RC_LOOKBACK_DAYS = 400;  // ein Jahr plus Puffer, kostet trotzdem nur einen Call

const DAY_MS = 24 * 3600 * 1000;

// ---------- Firestore typed-value codec (mirror of the other boards) ----------
function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return { nullValue: null };
    if (Number.isInteger(v) && Math.abs(v) < Number.MAX_SAFE_INTEGER) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (typeof v === "boolean") return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = encodeValue(val);
    return { mapValue: { fields: out } };
  }
  return { stringValue: String(v) };
}
function decodeValue(f) {
  if (!f || typeof f !== "object") return null;
  if ("nullValue" in f) return null;
  if ("stringValue" in f) return f.stringValue;
  if ("integerValue" in f) return Number(f.integerValue);
  if ("doubleValue" in f) return f.doubleValue;
  if ("booleanValue" in f) return f.booleanValue;
  if ("timestampValue" in f) return f.timestampValue;
  if ("arrayValue" in f) return (f.arrayValue.values || []).map(decodeValue);
  if ("mapValue" in f) {
    const out = {};
    for (const [k, v] of Object.entries(f.mapValue.fields || {})) out[k] = decodeValue(v);
    return out;
  }
  return null;
}
function encodeFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[k] = encodeValue(v);
  return out;
}
function decodeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) out[k] = decodeValue(v);
  return out;
}

let cachedAuth = null;
function getGoogleAuth() {
  if (cachedAuth) return cachedAuth;
  if (!process.env.GOOGLE_SA_KEY) throw new Error("GOOGLE_SA_KEY env missing");
  const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf-8"));
  cachedAuth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
  return cachedAuth;
}

async function loadDoc(firestore, path) {
  try {
    const r = await firestore.projects.databases.documents.get({ name: path });
    return decodeFields(r.data.fields);
  } catch (e) {
    const status = e?.code || e?.response?.status;
    if (status === 404) return null;
    throw e;
  }
}
async function saveState(firestore, state) {
  await firestore.projects.databases.documents.patch({
    name: DOC_PATH,
    requestBody: { fields: encodeFields(state) },
  });
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} env missing`);
  return v;
}

function ymd(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
const r2 = (n) => Math.round(n * 100) / 100;
const r4 = (n) => Math.round(n * 10000) / 10000;

// ---------- RevenueCat: Tagesumsatz, ALLE Transaktionen ----------
// Ohne `segment` liefert die Charts-API New UND Renewals, abzüglich Refunds —
// also das, was tatsächlich reinkommt. (Der Tagesform-Tab filtert bewusst auf
// "New", das ist eine andere Frage und hier falsch.)
async function rcDailyRevenue(startYmd, endYmd) {
  const key = requireEnv("RC_SECRET_API_KEY");
  const qs = new URLSearchParams({ start_date: startYmd, end_date: endYmd, resolution: "day" });
  const r = await fetch(`${RC_BASE}/projects/${RC_PROJECT}/charts/revenue?${qs}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!r.ok) throw new Error(`RC ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();

  const out = new Map(); // day -> { rev_usd, tx, incomplete }
  for (const v of j.values || []) {
    const day = ymd(new Date(v.cohort * 1000));
    if (!out.has(day)) out.set(day, { rev_usd: 0, tx: 0, incomplete: false });
    const e = out.get(day);
    if (v.measure === 0) e.rev_usd += Number(v.value || 0);
    else if (v.measure === 1) e.tx += Number(v.value || 0);
    if (v.incomplete) e.incomplete = true;
  }
  return out;
}

// ---------- Ad-Spend: je Tag über alle Kampagnen summiert ----------
// Für die Geldrechnung zählt nur, was insgesamt abgeflossen ist; die
// Aufschlüsselung je Kampagne haben die beiden Ads-Tabs.
async function appleDailySpend(startYmd, endYmd) {
  const byCampaign = await fetchAsaDailySpend(startYmd, endYmd);
  const out = new Map();
  for (const daily of Object.values(byCampaign || {})) {
    for (const d of daily || []) {
      if (!d.date) continue;
      out.set(d.date, (out.get(d.date) || 0) + Number(d.spend || 0));
    }
  }
  return out;
}

/**
 * Alle Google-Ads-Konten, aus denen Kosten kommen. Das erste ist das
 * Hauptkonto aus den Standard-Variablen; ab GOOGLE_ADS_REFRESH_TOKEN_2 kommt
 * ein zweites dazu.
 *
 * Hintergrund: Die Kampagnen liefen bis zum 17.08.2026 auf dem alten Konto und
 * laufen seit dem 18.08.2026 auf "Mahlzait2", das einem anderen Google-Konto
 * gehoert und deshalb einen eigenen Refresh-Token braucht. Beide zusammen
 * ergeben die lueckenlose Kostenreihe; nur das neue abzufragen wuerde die
 * Historie davor auf null setzen.
 */
function googleAccounts() {
  const list = [undefined]; // Hauptkonto: Standard-Umgebungsvariablen
  if (process.env.GOOGLE_ADS_REFRESH_TOKEN_2 && process.env.GOOGLE_ADS_CUSTOMER_ID_2) {
    list.push({
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN_2,
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID_2,
      // Standalone-Konto ohne Verwaltungsebene: login == customer.
      loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID_2 || process.env.GOOGLE_ADS_CUSTOMER_ID_2,
    });
  }
  return list;
}

/**
 * Tages-Spend ueber ALLE Google-Konten summiert.
 *
 * Faellt auch nur EIN Konto aus, wirft die Funktion — der Aufrufer behaelt dann
 * den letzten bekannten Stand. Eine Teilsumme waere gefaehrlicher als gar keine
 * Zahl: sie sieht plausibel aus, ist aber zu niedrig, und ein zu niedriger
 * Kostenblock laesst das Ergebnis besser aussehen, als es ist.
 */
async function googleDailySpend(startYmd, endYmd) {
  const accounts = googleAccounts();
  const perAccount = await Promise.all(
    accounts.map((acc) => fetchGoogleCampaignsWithSpend(startYmd, endYmd, acc))
  );
  const out = new Map();
  for (const campaigns of perAccount) {
    for (const c of campaigns || []) {
      for (const d of c.daily || []) {
        if (!d.date) continue;
        out.set(d.date, (out.get(d.date) || 0) + Number(d.spend || 0));
      }
    }
  }
  return out;
}

// ---------- AI-Kosten aus dem Cache des AI-Tabs ----------
// Records: { month: "YYYY-MM", days: { "07": [req, in, cached, out, thinking, cost_eur] } }
// Der Tageswert ist eine anteilige Aufteilung der Monatskosten nach Token-
// Gewicht (ai-usage.mjs splitDays) — der Monat stimmt exakt, ein Einzeltag ist
// eine Schätzung. Das Frontend weist genau darauf hin.
function aiDailyCost(aiState) {
  const out = new Map();
  if (!aiState || !aiState.data_b64) return { days: out, cacheTs: null, available: false };
  let records = [];
  try {
    records = JSON.parse(gunzipSync(Buffer.from(aiState.data_b64, "base64")).toString("utf-8"));
  } catch {
    return { days: out, cacheTs: aiState.last_pull_ts_ms || null, available: false };
  }
  for (const rec of records) {
    if (!rec || !rec.month || !rec.days) continue;
    for (const [dd, arr] of Object.entries(rec.days)) {
      if (!Array.isArray(arr)) continue;
      const day = `${rec.month}-${dd}`;
      out.set(day, (out.get(day) || 0) + Number(arr[5] || 0));
    }
  }
  return { days: out, cacheTs: aiState.last_pull_ts_ms || null, available: true };
}

// ---------- Merge: frische Tage rein, alte Tage stehen lassen ----------
// `fresh` überschreibt NUR Tage im Fenster [fromYmd, toYmd] und NUR das eigene
// Feld. Ein Tag ausserhalb behält seinen historischen Wert — dort liefert die
// Quelle nichts mehr, eine 0 wäre eine Lüge und nicht mehr rückholbar.
//
// Innerhalb des Fensters wird das Feld ZUERST auf 0 gesetzt und dann neu
// befüllt. Das ist wichtig: fetchAsaDailySpend und fetchGoogleCampaignsWithSpend
// lassen Tage ohne Spend ganz weg (`if (spend === 0 && …) continue`). Ohne den
// Reset bliebe ein nachträglich auf 0 korrigierter Tag für immer auf seinem
// alten Betrag stehen, weil die Quelle ihn nie wieder erwähnt. Die Quelle hat
// für ihr Fenster vollständig geantwortet — was sie nicht nennt, ist eine Null.
function mergeField(target, fresh, field, fromYmd, toYmd) {
  for (const [day, row] of target) {
    if (day < fromYmd || day > toYmd) continue;
    row[field] = 0;
  }
  for (const [day, val] of fresh) {
    if (day < fromYmd || day > toYmd) continue;
    if (!target.has(day)) target.set(day, { d: day });
    target.get(day)[field] = val;
  }
}

/**
 * Die gesamte Zusammenführung, frei von Netzwerk und Firestore, damit sie
 * prüfbar ist. Gibt die neue, nach Datum sortierte Tagesliste zurück.
 *
 * `apple`, `gads` und `aiDays` dürfen null sein — dann bleibt das jeweilige
 * Feld unangetastet und behält seinen historischen Wert.
 */
export function mergeHistory({ prev, rc, apple, gads, aiDays, aiFrom, rcFrom, adFrom, today }) {
  const days = new Map();
  for (const row of (prev?.days || [])) {
    if (row && row.d) days.set(row.d, { ...row });
  }

  // RC: Umsatz + Transaktionen. Innerhalb des Fensters ist ein fehlender Tag
  // eine echte Null (kein Umsatz), deshalb wird die Achse lückenlos gefüllt.
  for (let t = Date.parse(rcFrom); t <= Date.parse(today); t += DAY_MS) {
    const day = ymd(new Date(t));
    const e = rc.get(day);
    if (!days.has(day)) days.set(day, { d: day });
    const row = days.get(day);
    row.rev_usd = r4(e?.rev_usd || 0);
    row.tx = e?.tx || 0;
    if (e?.incomplete) row.incomplete = true;
    else delete row.incomplete;
  }

  if (apple) mergeField(days, apple, "apple", adFrom, today);
  if (gads) mergeField(days, gads, "google", adFrom, today);
  if (aiDays && aiFrom) mergeField(days, aiDays, "ai", aiFrom, today);

  return [...days.values()]
    .map((r) => ({
      d: r.d,
      rev_usd: r4(r.rev_usd || 0),
      tx: r.tx || 0,
      apple: r2(r.apple || 0),
      google: r2(r.google || 0),
      ai: r4(r.ai || 0),
      ...(r.incomplete ? { incomplete: true } : {}),
    }))
    .sort((a, b) => (a.d < b.d ? -1 : 1));
}

/**
 * Schutz gegen einen stillen Totalverlust: Wenn RevenueCat einmal antwortet,
 * ohne Zahlen zu liefern (Ausfall, gedrosselter Key, geänderte Antwortform),
 * wären alle Tage im 400-Tage-Fenster plötzlich 0 — und dieser Nullstand würde
 * den guten Stand in Firestore überschreiben. Deshalb wird der neue Umsatz
 * gegen den alten geprüft, BEVOR gespeichert wird.
 *
 * Gibt einen Klartext-Grund zurück, wenn nicht gespeichert werden darf,
 * sonst null.
 */
export function refuseIfImplausible(prevRows, nextRows) {
  if (!prevRows || !prevRows.length) return null;
  const sum = (rows, field) => rows.reduce((a, r) => a + (r[field] || 0), 0);
  const prevRev = sum(prevRows, "rev_usd");
  const nextRev = sum(nextRows, "rev_usd");
  if (prevRev > 0 && nextRev === 0) {
    return "Der Umsatz-Pull ergab über den ganzen Zeitraum 0 — das ist ein Quellenfehler, kein Nullmonat. Vorheriger Stand behalten.";
  }
  // Ein Einbruch auf unter ein Fünftel ist über 400 Tage praktisch unmöglich
  // und deutet auf eine unvollständige Antwort hin.
  if (prevRev > 0 && nextRev < prevRev * 0.2) {
    return `Der Umsatz-Pull liefert nur ${Math.round(nextRev / prevRev * 100)} % des bisherigen Stands — sieht nach einer unvollständigen Antwort aus. Vorheriger Stand behalten.`;
  }
  return null;
}

async function doRefresh(firestore, prev) {
  const t0 = Date.now();
  const now = new Date();
  const today = ymd(now);
  const adFrom = ymd(new Date(now.getTime() - AD_LOOKBACK_DAYS * DAY_MS));
  const rcFrom = ymd(new Date(now.getTime() - RC_LOOKBACK_DAYS * DAY_MS));

  const [rc, apple, gads, aiState] = await Promise.all([
    rcDailyRevenue(rcFrom, today),
    appleDailySpend(adFrom, today).catch((e) => {
      console.error("[money] ASA-Spend fehlgeschlagen:", e?.message);
      return null;
    }),
    googleDailySpend(adFrom, today).catch((e) => {
      console.error("[money] Google-Spend fehlgeschlagen:", e?.message);
      return null;
    }),
    loadDoc(firestore, AI_DOC_PATH),
  ]);

  const ai = aiDailyCost(aiState);
  const aiMonths = (aiState?.meta?.months || []).slice().sort();
  const aiFrom = (ai.available && aiMonths.length) ? `${aiMonths[0]}-01` : null;

  const rows = mergeHistory({
    prev, rc, apple, gads,
    aiDays: ai.available ? ai.days : null,
    aiFrom, rcFrom, adFrom, today,
  });

  // Ab wann kennen wir ueberhaupt Werbekosten? Beim ersten Refresh ist das
  // heute-90; danach bleibt der frueheste je gesehene Tag stehen. Ohne diese
  // Marke koennte das Frontend eine echte Null nicht von einer Datenluecke
  // unterscheiden — und ein Zeitraum ohne Ad-Daten sieht aus wie ein
  // Gewinnsprung, der keiner ist.
  const prevAdsFrom = prev?.sources?.ads_from || null;
  const gotAds = Boolean(apple || gads);
  const adsFrom = gotAds
    ? (prevAdsFrom && prevAdsFrom < adFrom ? prevAdsFrom : adFrom)
    : prevAdsFrom;

  // Einen gefüllten Stand nicht durch einen kaputten Pull ersetzen.
  if (prev?.days?.length && rows.length === 0) {
    return { ...prev, refresh_warning: "Pull ergab 0 Tage, vorheriger Stand behalten." };
  }
  const refusal = refuseIfImplausible(prev?.days, rows);
  if (refusal) {
    console.error("[money] Speichern abgelehnt:", refusal);
    return { ...prev, refresh_warning: refusal };
  }

  const warnings = [];
  if (!apple) warnings.push("Apple-Spend konnte nicht geladen werden — Apple-Kosten zeigen den letzten bekannten Stand.");
  if (!gads) warnings.push("Google-Spend konnte nicht geladen werden — Google-Kosten zeigen den letzten bekannten Stand.");
  if (!ai.available) warnings.push("AI-Cache ist leer — im AI-Usage-Tab einmal aktualisieren.");

  const state = {
    last_pull_ts_ms: Date.now(),
    schema: 1,
    days: rows,
    sources: {
      rc_from: rcFrom,
      rc_to: today,
      ad_from: adFrom,
      ad_to: today,
      ads_from: adsFrom,
      google_accounts: googleAccounts().length,
      ai_cache_ts_ms: ai.cacheTs,
      ai_months: (aiState?.meta?.months || []).length,
      history_from: rows.length ? rows[0].d : null,
    },
    refresh_warning: warnings.length ? warnings.join(" ") : null,
    last_refresh_meta: { ms_total: Date.now() - t0, days: rows.length },
  };
  await saveState(firestore, state);
  return state;
}

// ---------- HTTP handler ----------
export default async function handler(req, res) {
  try {
    const pw = req.query?.pw || "";
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const refresh = req.query?.refresh === "1";

    const auth = getGoogleAuth();
    const firestore = google.firestore({ version: "v1", auth });

    let state = await loadDoc(firestore, DOC_PATH);
    if (refresh) {
      state = await doRefresh(firestore, state);
    } else if (!state) {
      return res.json({
        bootstrapped: false,
        hint: "Noch kein Stand. Klicke Aktualisieren, um den ersten Pull anzustossen.",
      });
    }

    return res.json({
      bootstrapped: true,
      last_pull_ts_ms: state.last_pull_ts_ms,
      schema: state.schema || 1,
      eur_per_usd: EUR_PER_USD,
      rates: { vat: VAT_RATE, store: STORE_RATE, rc: RC_RATE },
      sources: state.sources || null,
      refresh_warning: state.refresh_warning || null,
      days: state.days || [],
    });
  } catch (e) {
    console.error("[money]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
