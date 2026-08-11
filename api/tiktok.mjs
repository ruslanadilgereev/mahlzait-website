// TikTok-Trichter — /go-Klicks aus Firestore + RevenueCat nach selbst genannter Quelle.
// GET /api/tiktok?pw=X[&days=30|90|365][&source=tiktok]
//
// Auth: DASHBOARD_PASSWORD env (wie die anderen Leaderboard-Endpunkte).
// GCP:  GOOGLE_SA_KEY (base64 SA json) für Firestore `link_clicks`.
// RC:   RC_SECRET_API_KEY env, Projekt proj41604426.
//
// ============================ Messmethode ============================
// Der Trichter setzt sich aus ZWEI QUELLEN zusammen, die NICHT dieselbe
// Grundgesamtheit messen. Das ist die wichtigste Einschränkung hier:
//
//   Stufe 1 (Klicks)  kommt aus Firestore. Gezählt wird jeder Aufruf eines
//                     /go/<slug>-tt-Links, also die TikTok-Seite des Funnels
//                     wie sie der Link sieht.
//   Stufe 2–4         kommt aus RevenueCat und hängt an `self_reported_source`,
//                     also an dem, was der Nutzer im Onboarding ANGIBT.
//
// Ein Mensch kann über /go/bio-tt kommen und im Onboarding trotzdem
// "app_store" antworten — und umgekehrt kann jemand "tiktok" angeben, der den
// Link nie gesehen hat (TikTok-Video ohne Link, Suche im Store). Die Rate
// Klick → Neuer Kunde ist deshalb ein ANHALTSPUNKT, keine Conversion. Ab
// Stufe 2 stimmt die Grundgesamtheit dagegen durchgehend, dort sind die Raten
// echte Conversion-Raten innerhalb derselben Nutzergruppe.
//
// Ebenfalls nicht kohortiert: die RC-Charts sind nach Ereignisdatum gebucht
// (Trial-Start-Datum bei trials_new), nicht nach Erstkontakt. Ein Trial im
// August kann von einem Kunden aus Juni stammen.
//
// Trial → Bezahlt: RevenueCats Conversion Rate rechnet die Umwandlungen gegen
// ALLE Trial-Starts des Zeitraums, auch gegen die, die noch laufen. Solange
// `pending` groß ist, ist die Rate systematisch zu niedrig. Deshalb wird
// `pending` hier immer mit ausgegeben.

import { google } from "googleapis";

export const config = { maxDuration: 60 };

const GCP_PROJECT = "mytemple-460913";
const COLLECTION = "link_clicks";
const FS_PARENT = `projects/${GCP_PROJECT}/databases/(default)/documents`;
const FS_URL = `https://firestore.googleapis.com/v1/${FS_PARENT}:runQuery`;

const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";
const RC_ATTR = "self_reported_source";

const DAY_MS = 24 * 3600 * 1000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/**
 * Zeitraum aus der Query. `start`/`end` schlagen `days`.
 * Verdrehte Eingaben werden getauscht und ein Ende in der Zukunft auf heute
 * gekappt, statt die Anfrage abzulehnen — der Nutzer soll beim Tippen im
 * Datumsfeld nicht gegen eine Fehlermeldung laufen.
 */
function resolveRange(q) {
  const today = iso(Date.now());
  const qs = isDate(q.start) ? q.start : null;
  const qe = isDate(q.end) ? q.end : null;

  if (qs || qe) {
    let start = qs || iso(Date.parse(qe) - 89 * DAY_MS);
    let end = qe || today;
    if (start > end) [start, end] = [end, start];
    if (end > today) end = today;
    if (start > end) start = end;
    const days = Math.round((Date.parse(end) - Date.parse(start)) / DAY_MS) + 1;
    return { days, start, end, custom: true };
  }

  let days = Number(q.days || 90);
  if (!Number.isFinite(days)) days = 90;
  days = Math.min(730, Math.max(7, Math.round(days)));
  return { days, start: iso(Date.now() - (days - 1) * DAY_MS), end: today, custom: false };
}

// Tagesdaten ändern sich langsam; ein kurzer Cache im warmen Container macht
// das Umschalten des Zeitraums im Frontend fast kostenlos.
const cache = new Map(); // "source|start|end" -> {at, payload}
const CACHE_MS = 10 * 60 * 1000;

// ---------- Firestore ----------
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

/**
 * Alle Klicks einer Quelle holen.
 *
 * BEWUSST nur Gleichheit auf `source`, ohne Zeitfilter und ohne orderBy: die
 * Kombination aus Gleichheit und ts-Range bräuchte einen Composite Index, den
 * es in diesem Projekt nicht gibt. Die Menge ist klein genug (Größenordnung
 * hundert Dokumente), also wird der Zeitraum in JS geschnitten. Wenn die
 * Sammlung irgendwann fünfstellig wird, gehört hier ein Index her.
 */
async function fetchClicks(token, source) {
  const r = await fetch(FS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: COLLECTION }],
        where: { fieldFilter: { field: { fieldPath: "source" }, op: "EQUAL", value: { stringValue: source } } },
        // Nur was gebraucht wird — kein User-Agent, kein Referrer, keine PII.
        select: { fields: [{ fieldPath: "ts" }, { fieldPath: "slug" }, { fieldPath: "ipHash" }] },
        limit: 20000,
      },
    }),
  });
  if (!r.ok) throw new Error(`Firestore ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const rows = await r.json();
  const out = [];
  for (const row of rows) {
    const f = row.document && row.document.fields;
    if (!f || !f.ts) continue;
    out.push({
      ts: f.ts.timestampValue,
      slug: (f.slug && f.slug.stringValue) || "(ohne Slug)",
      ipHash: (f.ipHash && f.ipHash.stringValue) || "",
    });
  }
  return out;
}

// ---------- RevenueCat ----------
async function rcChart(chart, params) {
  if (!process.env.RC_SECRET_API_KEY) throw new Error("RC_SECRET_API_KEY env missing");
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${RC_BASE}/projects/${RC_PROJECT}/charts/${chart}?${qs}`, {
    headers: { Authorization: `Bearer ${process.env.RC_SECRET_API_KEY}` },
  });
  if (!r.ok) throw new Error(`RC ${chart} ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

/** Filter auf ein Subscriber-Attribut. RC erwartet den Wert als JSON-String mit Listen-Werten. */
function attrFilter(value) {
  return JSON.stringify([
    { name: "external_subscriber_attributes", values: [JSON.stringify({ [RC_ATTR]: [value] })] },
  ]);
}

/**
 * Eine Messgröße aus einer Chart-Antwort als Tagesreihe.
 * `values` sind flach: {cohort, measure, segment, value}; `measure` und
 * `segment` sind Indizes in die gleichnamigen Listen der Antwort.
 * segmentName = null → das Total-Segment (bzw. alles, wenn nicht segmentiert).
 *
 * Nur für additive Größen (Anzahlen, Beträge) benutzen. Raten kommen aus
 * `summary.total`, die rechnet RC selbst richtig aus.
 */
function series(chart, measureName, segmentName = null) {
  const mi = (chart.measures || []).findIndex((m) => m.display_name === measureName);
  if (mi < 0) return { by_day: {}, total: 0 };

  const segs = chart.segments || [];
  let si = null;
  if (segs.length) {
    const idx = segs.findIndex((s) => (segmentName == null ? s.is_total : s.display_name === segmentName));
    if (idx < 0) return { by_day: {}, total: 0 };
    si = idx;
  }

  const by_day = {};
  let total = 0;
  for (const v of chart.values || []) {
    if (v.measure !== mi) continue;
    if (si !== null && v.segment !== si) continue;
    const day = iso(v.cohort * 1000);
    const n = Number(v.value || 0);
    by_day[day] = (by_day[day] || 0) + n;
    total += n;
  }
  return { by_day, total: round2(total) };
}

const round2 = (n) => Math.round(n * 100) / 100;
const num = (v) => (v === null || v === undefined ? null : Number(v));

// ---------- Handler ----------
export default async function handler(req, res) {
  try {
    const pw = (req.query && req.query.pw) || "";
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const source = String((req.query && req.query.source) || "tiktok").toLowerCase().trim();
    if (!/^[a-z_]{1,32}$/.test(source)) return res.status(400).json({ error: "Invalid source" });

    const range = resolveRange(req.query || {});
    const { start, end } = range;

    const cacheKey = `${source}|${start}|${end}`;
    const hit = cache.get(cacheKey);
    if (hit && !(req.query && req.query.fresh === "1") && Date.now() - hit.at < CACHE_MS) {
      return res.status(200).json({ ...hit.payload, cached: true });
    }

    const startMs = Date.parse(start + "T00:00:00.000Z");
    const endMs = Date.parse(end + "T23:59:59.999Z");

    const rcParams = { start_date: start, end_date: end, filters: attrFilter(source) };

    const auth = getGoogleAuth();
    const gToken = (await (await auth.getClient()).getAccessToken()).token;

    // Alles parallel — sechs unabhängige Abfragen, keine hängt an einer anderen.
    const [clicksRaw, cCustomers, cTrials, cRevenue, cConv, cLtv] = await Promise.all([
      fetchClicks(gToken, source),
      rcChart("customers_new", { ...rcParams, resolution: "day" }),
      rcChart("trials_new", { ...rcParams, resolution: "day" }),
      // transaction_type trennt Neugeschäft von Verlängerungen. Nur so ist der
      // Umsatz mit den Trials desselben Zeitraums vergleichbar.
      rcChart("revenue", { ...rcParams, resolution: "day", segment: "transaction_type" }),
      // Nur die Summe interessiert; Monatsauflösung hält die Antwort klein.
      rcChart("trial_conversion_rate", { ...rcParams, resolution: "month" }),
      rcChart("ltv_per_customer", { ...rcParams, resolution: "month" }),
    ]);

    // ---------- Klicks aufbereiten ----------
    const inRange = clicksRaw.filter((c) => {
      const t = Date.parse(c.ts);
      return t >= startMs && t <= endMs;
    });
    const clicksByDay = {};
    const uniq = new Set();
    const slugMap = new Map();
    for (const c of inRange) {
      const day = c.ts.slice(0, 10);
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
      if (c.ipHash) uniq.add(c.ipHash);
      let s = slugMap.get(c.slug);
      if (!s) { s = { slug: c.slug, clicks: 0, devices: new Set(), last: c.ts }; slugMap.set(c.slug, s); }
      s.clicks++;
      if (c.ipHash) s.devices.add(c.ipHash);
      if (c.ts > s.last) s.last = c.ts;
    }
    const bySlug = [...slugMap.values()]
      .map((s) => ({ slug: s.slug, clicks: s.clicks, devices: s.devices.size, last: s.last }))
      .sort((a, b) => b.clicks - a.clicks || a.slug.localeCompare(b.slug));

    // Erster jemals getrackte Klick dieser Quelle — sagt, ab wann die Reihe
    // überhaupt Daten haben KANN. Ohne das liest man einen leeren Anfang als
    // "lief schlecht" statt als "wurde noch nicht getrackt".
    const trackingSince = clicksRaw.length
      ? clicksRaw.reduce((a, c) => (c.ts < a ? c.ts : a), clicksRaw[0].ts).slice(0, 10)
      : null;

    // ---------- RevenueCat aufbereiten ----------
    const customers = series(cCustomers, "New Customers");
    const trials = series(cTrials, "New Trials");
    const revNew = series(cRevenue, "Revenue", "New");
    const revRenew = series(cRevenue, "Revenue", "Renewal");
    const txNew = series(cRevenue, "Transactions", "New");

    const convTot = (cConv.summary && cConv.summary.total) || {};
    const convSeg = convTot.Total || convTot[source] || convTot;
    const conversions = num(convSeg["Conversions"]) || 0;
    const trialStarts = num(convSeg["Trial Starts"]) || 0;
    const expirations = num(convSeg["Expirations"]) || 0;
    const pending = num(convSeg["Pending"]) || 0;

    const ltvTot = (cLtv.summary && cLtv.summary.total) || {};
    const ltvSeg = ltvTot.Total || ltvTot[source] || ltvTot;

    // ---------- Trichter ----------
    // `basis` sagt, aus welcher Quelle die Stufe stammt. Stufe 1 steht bewusst
    // getrennt, weil sie eine andere Grundgesamtheit misst (siehe Kopf).
    const funnel = [
      {
        key: "clicks", label: "/go-Klicks", basis: "firestore",
        hint: "Aufrufe der /go/…-Links",
        value: inRange.length, sub: `${uniq.size} Geräte`,
      },
      {
        key: "customers", label: "Neue Kunden", basis: "rc",
        hint: `im Onboarding „${source}“ angegeben`,
        value: customers.total, sub: null,
      },
      {
        key: "trials", label: "Trial gestartet", basis: "rc",
        hint: "auf das Trial-Start-Datum gebucht",
        value: trials.total, sub: null,
      },
      {
        key: "paid", label: "Bezahlt", basis: "rc",
        hint: "Trial in ein Abo umgewandelt",
        value: conversions, sub: pending ? `${pending} laufen noch` : null,
      },
    ];

    const payload = {
      generated_at: new Date().toISOString(),
      source,
      range,
      tracking_since: trackingSince,
      funnel,
      clicks: {
        total: inRange.length,
        devices: uniq.size,
        total_all_time: clicksRaw.length,
        by_day: clicksByDay,
        by_slug: bySlug,
      },
      rc: {
        customers_new: customers,
        trials_new: trials,
        revenue: {
          new: revNew.total,
          renewal: revRenew.total,
          total: round2(revNew.total + revRenew.total),
          transactions_new: txNew.total,
          by_day: revNew.by_day,
          currency: "USD",
        },
        conversion: {
          trial_starts: trialStarts,
          conversions,
          expirations,
          pending,
          // Selbst gerechnet statt RCs `Conversion Rate` übernommen, damit klar
          // ist, was im Nenner steht: ALLE Trial-Starts, auch die laufenden.
          rate_of_all: trialStarts ? conversions / trialStarts : null,
          // Nur die schon entschiedenen Trials. Die ehrlichere Zahl, solange
          // viele noch offen sind — aber bei kleinen Zahlen sehr wackelig.
          rate_of_decided: conversions + expirations ? conversions / (conversions + expirations) : null,
        },
        ltv: {
          customers: num(ltvSeg["New Customers"]),
          realized: num(ltvSeg["Realized LTV (30 days)"]),
          per_customer: num(ltvSeg["Realized LTV (30 days) / Customer"]),
        },
      },
    };

    cache.set(cacheKey, { at: Date.now(), payload });
    return res.status(200).json(payload);
  } catch (e) {
    console.error("[tiktok]", e && e.message, e && e.stack && e.stack.slice(0, 300));
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
