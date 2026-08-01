// Preissenkung 08/2026 — Frueh-Indikator fuer die Trial-Start-Rate.
// GET /api/price-experiment?pw=X
//
// Beantwortet eine Frage: starten seit der Preissenkung mehr Leute einen Trial,
// gemessen an denen, die die Paywall gesehen haben?
//
// Auth: DASHBOARD_PASSWORD env (same as the other leaderboard endpoints).
// GA4:  GOOGLE_SA_KEY (base64 SA json), scope analytics.readonly, property 490479548.
//       runFunnelReport ist v1alpha und in googleapis nicht getypt -> direkter REST-Call.
// RC:   RC_SECRET_API_KEY env, project proj41604426 (Chart `revenue`, Segment transaction_type).
//
// Kein Firestore-Cache: der Pull dauert wenige Sekunden, und veraltete Zahlen
// waeren hier schaedlicher als eine kurze Wartezeit.
//
// WARUM die Neuinstall-Kohorte und nicht die rohe Paywall-Rate:
//   Die Paywall sehen auch Bestandsnutzer, die schon einmal abgelehnt haben und
//   schlechter konvertieren. Mit dem Neuinstall-Rueckgang (Juni ~82/Tag -> Juli
//   ~20/Tag) waechst ihr Anteil an der Paywall-Population, wodurch die naive Rate
//   von 18,9% auf ~10% faellt, ohne dass sich am Verhalten etwas geaendert hat.
//   Der geschlossene Funnel ab first_open schaltet diesen Mix-Effekt aus.

import { google } from "googleapis";

export const config = { maxDuration: 60 };

const GA4_PROPERTY = "properties/490479548";
const GA4_FUNNEL_URL = `https://analyticsdata.googleapis.com/v1alpha/${GA4_PROPERTY}:runFunnelReport`;
const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";

// Tag, ab dem die neuen Preise gelten (monatlich 5,99 -> 2,99, jaehrlich 29,99 -> 19,99).
const PRICE_CUT = "2026-08-01";

// Baseline: voller Juni 2026, alter Preis, geschlossener Funnel. Siehe
// C:\Projekte\claude\preis-experiment-2026-08\BASELINE.md
const BASE_PAYWALL = 1033;
const BASE_TRIAL = 204;
const BASE_RATE = BASE_TRIAL / BASE_PAYWALL;

// Break-even: rund 60% mehr zahlende Neukunden je Paywall-View noetig
// (P1Y-Umsatzanteil 73,9% -> Mengenfaktor 1,606). Bei unveraenderter
// Trial->Paid-Rate von ~61% heisst das fuer die Trial-Start-Rate:
const BREAKEVEN_FACTOR = 1.606;
const TARGET_RATE = BASE_RATE * BREAKEVEN_FACTOR;

// Ø-Betrag je Neukauf-Transaktion. Alter Preis lag bei 23-27 (RC normalisiert
// das Jahresabo auf ~34), nach der Senkung sind 13-18 zu erwarten.
const PRICE_LIVE_CEILING = 22.0;

const WINDOW_DAYS = 7;
const STRIDE_DAYS = 3;
const CHART_DAYS = 45;

const STEPS = [
  { name: "Install", event: "first_open" },
  { name: "Paywall", event: "subscription_screen_viewed" },
  { name: "Trial", event: "trial_started" },
];

// ---------- Datum ----------
const DAY_MS = 24 * 3600 * 1000;
const iso = (d) => new Date(d).toISOString().slice(0, 10);
const addDays = (dateStr, n) => iso(Date.parse(dateStr + "T00:00:00Z") + n * DAY_MS);
const daysBetween = (a, b) =>
  Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY_MS);

// ---------- Statistik ----------
// Abramowitz & Stegun 7.1.26 — reicht fuer eine p-Wert-Anzeige vollkommen.
function erf(x) {
  const s = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return s * y;
}
const phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

/** Einseitiger Zwei-Proportionen-Test: liegt p2 ueber p1? */
function zTest(x1, n1, x2, n2) {
  if (!n1 || !n2) return { z: null, p: null };
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pool = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(pool * (1 - pool) * (1 / n1 + 1 / n2));
  if (!se) return { z: null, p: null };
  const z = (p2 - p1) / se;
  return { z, p: 1 - phi(z) };
}

/** Wie viele Paywall-Seher nach dem Schnitt, damit der Sprung p1->p2 traegt (Power 0.8). */
function neededSamples(p1, p2, n1) {
  if (p2 <= p1) return null;
  const v = (p2 - p1) ** 2 / (1.645 + 0.842) ** 2 - (p1 * (1 - p1)) / n1;
  if (v <= 0) return null;
  return Math.ceil((p2 * (1 - p2)) / v);
}

// ---------- GA4 ----------
let cachedAuth = null;
function getGa4Auth() {
  if (cachedAuth) return cachedAuth;
  if (!process.env.GOOGLE_SA_KEY) throw new Error("GOOGLE_SA_KEY env missing");
  const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf-8"));
  cachedAuth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  return cachedAuth;
}

/**
 * Geschlossener Funnel ab first_open -> { installs, paywall, trial }.
 * Geschlossen heisst: nur Nutzer, die im Zeitraum installiert haben, und nur
 * in dieser Reihenfolge. Damit sind Bestandsnutzer draussen.
 */
async function ga4Funnel(token, startDate, endDate) {
  const body = {
    dateRanges: [{ startDate, endDate }],
    funnel: {
      isOpenFunnel: false,
      steps: STEPS.map((s) => ({
        name: s.name,
        filterExpression: { funnelEventFilter: { eventName: s.event } },
      })),
    },
  };
  const r = await fetch(GA4_FUNNEL_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GA4 ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const vals = (j.funnelTable?.rows || []).map((row) =>
    Number(row.metricValues?.[0]?.value || 0)
  );
  while (vals.length < 3) vals.push(0);
  return { installs: vals[0], paywall: vals[1], trial: vals[2] };
}

// ---------- RevenueCat ----------
/** Ø-Betrag je Neukauf-Transaktion seit dem Schnitt. Kontrolliert, ob der neue Preis greift. */
async function rcNewPurchaseAvg(startDate, endDate) {
  if (!process.env.RC_SECRET_API_KEY) throw new Error("RC_SECRET_API_KEY env missing");
  const qs = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    resolution: "day",
    segment: "transaction_type",
  });
  const r = await fetch(`${RC_BASE}/projects/${RC_PROJECT}/charts/revenue?${qs}`, {
    headers: { Authorization: `Bearer ${process.env.RC_SECRET_API_KEY}` },
  });
  if (!r.ok) throw new Error(`RC ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const segs = (j.segments || []).map((s) => s.display_name);
  let revenue = 0;
  let tx = 0;
  for (const v of j.values || []) {
    if (segs[v.segment] !== "New") continue;
    if (v.measure === 0) revenue += Number(v.value || 0);
    else if (v.measure === 1) tx += Number(v.value || 0);
  }
  return tx ? { avg: revenue / tx, tx, revenue } : { avg: null, tx: 0, revenue: 0 };
}

// ---------- Ampel ----------
function buildVerdict({ today, since, sinceRate, pval, need, pace, priceAvg }) {
  const etaDays =
    need && pace > 0 && since.paywall < need ? Math.ceil((need - since.paywall) / pace) : 0;
  const priceLive = priceAvg !== null && priceAvg <= PRICE_LIVE_CEILING;

  if (PRICE_CUT > today) {
    return { status: "wait", headline: "Preisschnitt liegt noch in der Zukunft",
      detail: `Der Tracker startet am ${PRICE_CUT}.`, etaDays, priceLive };
  }
  if (priceAvg === null) {
    const collected = need
      ? ` Die Trial-Rate laeuft trotzdem mit: ${since.paywall} von ${need} noetigen Paywall-Sehern` +
        (etaDays ? `, bei ${pace.toFixed(1)} pro Tag noch rund ${etaDays} Tage.` : ".")
      : "";
    return { status: "wait", headline: "Noch kein Neukauf seit dem Schnitt",
      detail: "Solange keine Neukauf-Transaktion vorliegt, laesst sich nicht pruefen, ob der neue Preis in den Daten ankommt." + collected,
      etaDays, priceLive };
  }
  if (!priceLive) {
    return { status: "critical", headline: "Der neue Preis kommt nicht in den Daten an",
      detail: `Ø je Neukauf liegt bei ${priceAvg.toFixed(2)}, erwartet waeren 13 bis 18. Alles darueber heisst: es wird weiter zum alten Preis abgerechnet. Bis das stimmt, misst die Trial-Rate keinen Preiseffekt.`,
      etaDays, priceLive };
  }
  if (need && since.paywall < need) {
    return { status: "wait", headline: `Daten sammeln: ${since.paywall} von ${need} Paywall-Sehern`,
      detail: `Bei aktuell ${pace.toFixed(1)} Paywall-Sehern pro Tag ist die Marke in rund ${etaDays} Tagen erreicht. Vorher traegt kein Urteil.`,
      etaDays, priceLive };
  }
  if (pval !== null && pval < 0.05 && sinceRate >= TARGET_RATE) {
    return { status: "good", headline: "Die Senkung traegt",
      detail: `Die Trial-Rate liegt bei ${(sinceRate * 100).toFixed(1)}% und damit ueber der Break-even-Marke von ${(TARGET_RATE * 100).toFixed(1)}%, statistisch gesichert (p=${pval.toFixed(3)}).`,
      etaDays, priceLive };
  }
  if (pval !== null && pval < 0.05) {
    return { status: "warning", headline: "Die Rate steigt, reicht aber nicht",
      detail: `${(sinceRate * 100).toFixed(1)}% liegt gesichert ueber der Baseline (p=${pval.toFixed(3)}), aber unter den ${(TARGET_RATE * 100).toFixed(1)}%, die den Umsatz halten. Der Preiseffekt ist real und zu klein.`,
      etaDays, priceLive };
  }
  return { status: "critical", headline: "Kein Sprung erkennbar",
    detail: `${(sinceRate * 100).toFixed(1)}% gegen Baseline ${(BASE_RATE * 100).toFixed(1)}%, nicht vom Zufall trennbar. Bei dieser Fallzahl waere ein Effekt in Break-even-Groesse sichtbar. Er ist es nicht.`,
    etaDays, priceLive };
}

// ---------- Handler ----------
export default async function handler(req, res) {
  try {
    const pw = req.query?.pw || "";
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const today = iso(Date.now());
    const auth = getGa4Auth();
    const token = await (await auth.getClient()).getAccessToken();
    const accessToken = typeof token === "string" ? token : token?.token;
    if (!accessToken) throw new Error("Konnte kein GA4-Access-Token holen");

    // Verlaufspunkte: rollierende Fenster, parallel gezogen.
    const windowEnds = [];
    for (let d = addDays(today, -CHART_DAYS + WINDOW_DAYS - 1); d <= today; d = addDays(d, STRIDE_DAYS)) {
      windowEnds.push(d);
    }
    if (windowEnds[windowEnds.length - 1] !== today) windowEnds.push(today);

    const [seriesRaw, sinceRaw, price] = await Promise.all([
      Promise.all(
        windowEnds.map(async (end) => {
          const start = addDays(end, -(WINDOW_DAYS - 1));
          const f = await ga4Funnel(accessToken, start, end);
          return { date: end, ...f, rate: f.paywall ? f.trial / f.paywall : null, after: end >= PRICE_CUT };
        })
      ),
      PRICE_CUT <= today ? ga4Funnel(accessToken, PRICE_CUT, today) : Promise.resolve({ installs: 0, paywall: 0, trial: 0 }),
      PRICE_CUT <= today ? rcNewPurchaseAvg(PRICE_CUT, today) : Promise.resolve({ avg: null, tx: 0, revenue: 0 }),
    ]);

    const since = sinceRaw;
    const sinceRate = since.paywall ? since.trial / since.paywall : null;
    const { p: pval } = zTest(BASE_TRIAL, BASE_PAYWALL, since.trial, since.paywall);
    const need = neededSamples(BASE_RATE, TARGET_RATE, BASE_PAYWALL);
    const daysSince = PRICE_CUT <= today ? Math.max(1, daysBetween(PRICE_CUT, today) + 1) : 0;
    const pace = daysSince ? since.paywall / daysSince : 0;

    const verdict = buildVerdict({ today, since, sinceRate, pval, need, pace, priceAvg: price.avg });

    return res.json({
      generated_at: new Date().toISOString(),
      price_cut: PRICE_CUT,
      baseline: { paywall: BASE_PAYWALL, trial: BASE_TRIAL, rate: BASE_RATE, label: "Juni 2026" },
      target: { rate: TARGET_RATE, factor: BREAKEVEN_FACTOR },
      since: { ...since, rate: sinceRate, p_value: pval, days: daysSince, pace },
      needed_samples: need,
      price_control: { avg: price.avg, tx: price.tx, ceiling: PRICE_LIVE_CEILING, live: verdict.priceLive },
      verdict: { status: verdict.status, headline: verdict.headline, detail: verdict.detail, eta_days: verdict.etaDays },
      series: seriesRaw,
      window_days: WINDOW_DAYS,
    });
  } catch (e) {
    console.error("[price-experiment]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
