// Tageswerte fuer die Kalender-Heatmap — GA4 + RevenueCat, ein Jahr am Stueck.
// GET /api/daily?pw=X[&days=365]
//
// Auth: DASHBOARD_PASSWORD env (same as the other leaderboard endpoints).
// GA4:  GOOGLE_SA_KEY (base64 SA json), scope analytics.readonly, property 490479548.
// RC:   RC_SECRET_API_KEY env, project proj41604426.
//
// Kostet genau ZWEI API-Aufrufe fuer ein ganzes Jahr: GA4 liefert
// date x eventName in einem Report, RC den Tages-Chart in einem Zug.
//
// WICHTIG, Unterschied zu /api/funnel: hier wird NICHT kohortiert. Gezaehlt
// wird, wie viele Nutzer an einem KALENDERTAG das jeweilige Event ausgeloest
// haben (GA4-Metrik totalUsers, also Menschen, nicht Ereignisse). Das ist fuer
// die Frage "welcher Tag lief gut" genau richtig; fuer Conversion-Ketten waere
// es falsch, dafuer ist /api/funnel da.
//
// Aggregierte Tagesdaten reichen volle 365 Tage zurueck. Nur die
// NUTZERDATEN-Retention (die den Funnel-Report begrenzt) endet nach ~2 Monaten.

import { google } from "googleapis";

export const config = { maxDuration: 60 };

const GA4_PROPERTY = "properties/490479548";
const GA4_REPORT_URL = `https://analyticsdata.googleapis.com/v1beta/${GA4_PROPERTY}:runReport`;
const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";

const DAY_MS = 24 * 3600 * 1000;
const iso = (d) => new Date(d).toISOString().slice(0, 10);

// Absolute Tageswerte. Haengen am Ad-Budget: mehr Ads = mehr Installs, ohne
// dass irgendetwas besser laeuft. Deshalb gibt es darunter die Raten.
const METRICS = [
  { key: "install", label: "Neue Installs", event: "first_open", unit: "Nutzer" },
  { key: "paywall", label: "Paywall gesehen", event: "subscription_screen_viewed", unit: "Nutzer" },
  { key: "trial", label: "Trial gestartet", event: "trial_started", unit: "Nutzer" },
  { key: "meals", label: "Mahlzeiten geloggt", event: "meal_logged", unit: "Nutzer" },
  { key: "dau", label: "Aktive Nutzer", event: "daily_active_user", unit: "Nutzer" },
  { key: "revenue", label: "Neukauf-Umsatz", source: "rc", unit: "EUR" },
  { key: "purchases", label: "Neukäufe", source: "rc", unit: "Käufe" },
];

// Verhaeltniszahlen — unabhaengig davon, wie viel Traffic eingekauft wurde.
//
// ZWEI EHRLICHKEITEN dazu:
// 1. Als GLEITENDES 7-TAGE-FENSTER gerechnet, nicht pro Einzeltag. Bei rund 20
//    Installs am Tag waere eine Tagesrate reines Rauschen (1 Trial von 5 waeren
//    20 %). Das Fenster glaettet auf eine Groesse, bei der die Zahl etwas heisst.
// 2. NICHT KOHORTIERT: Zaehler und Nenner sind Tageswerte, der Paywall-Seher von
//    heute kann gestern installiert haben. Fuer den Trend taugt das, fuer eine
//    exakte Conversion nimmt man den Business-Tab.
// ACHTUNG bei den Namen: das sind VERHAELTNISSE, keine Conversion-Raten.
// Zaehler und Nenner stammen aus verschiedenen Grundgesamtheiten — die Paywall
// sehen auch Bestandsnutzer, im Nenner stehen aber nur die Neuinstalls des Tages.
// Deshalb kommt "Paywall je Install" auf ueber 87 %, was als Conversion gelesen
// unsinnig waere. Die Namen sagen jetzt was gemeint ist, und `comparable`
// markiert die eine Rate, die man gefahrlos gegen den Business-Tab halten kann
// (dort heben sich die Bestandsnutzer in Zaehler und Nenner weitgehend auf).
const RATES = [
  { key: "r_trial_install", label: "Trials je Install", num: "trial", den: "install", unit: "%", comparable: true },
  { key: "r_rev_install", label: "Umsatz je Install", num: "revenue", den: "install", unit: "EUR", comparable: true },
  { key: "r_rev_paywall", label: "Umsatz je Paywall-View", num: "revenue", den: "paywall", unit: "EUR" },
  { key: "r_trial", label: "Trials je Paywall-View", num: "trial", den: "paywall", unit: "%" },
  { key: "r_paywall", label: "Paywall-Views je Install", num: "paywall", den: "install", unit: "%" },
];

const RATE_WINDOW = 7;

// Tagesdaten aendern sich nur langsam. Ein kurzer Cache im warmen Container
// macht das Umschalten der Metrik im Frontend kostenlos.
let cache = null; // {key, at, payload}
const CACHE_MS = 10 * 60 * 1000;

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

async function ga4Daily(token, startDate, endDate, events) {
  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }, { name: "eventName" }],
    metrics: [{ name: "totalUsers" }],
    dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: events } } },
    orderBys: [{ dimension: { dimensionName: "date" } }],
    limit: 100000,
  };
  const r = await fetch(GA4_REPORT_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GA4 ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const out = new Map(); // "YYYY-MM-DD" -> {event: users}
  for (const row of j.rows || []) {
    const raw = row.dimensionValues[0].value;
    const day = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`;
    if (!out.has(day)) out.set(day, {});
    out.get(day)[row.dimensionValues[1].value] = Number(row.metricValues[0].value || 0);
  }
  return out;
}

async function rcDaily(startDate, endDate) {
  if (!process.env.RC_SECRET_API_KEY) throw new Error("RC_SECRET_API_KEY env missing");
  const qs = new URLSearchParams({
    start_date: startDate, end_date: endDate, resolution: "day", segment: "transaction_type",
  });
  const r = await fetch(`${RC_BASE}/projects/${RC_PROJECT}/charts/revenue?${qs}`, {
    headers: { Authorization: `Bearer ${process.env.RC_SECRET_API_KEY}` },
  });
  if (!r.ok) throw new Error(`RC ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const segs = (j.segments || []).map((s) => s.display_name);
  const out = new Map(); // day -> {revenue, purchases}
  for (const v of j.values || []) {
    if (segs[v.segment] !== "New") continue;   // Verlaengerungen haengen nicht am Tagesgeschaeft
    const day = iso(v.cohort * 1000);
    if (!out.has(day)) out.set(day, { revenue: 0, purchases: 0 });
    if (v.measure === 0) out.get(day).revenue += Number(v.value || 0);
    else if (v.measure === 1) out.get(day).purchases += Number(v.value || 0);
  }
  return out;
}

// ---------- Statistik ----------
const sum = (a) => a.reduce((x, y) => x + y, 0);

function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Der heutige Tag ist noch nicht vorbei und faellt deshalb aus JEDEM Vergleich
 * raus. Sonst zieht ein halber Tag das aktuelle Fenster nach unten und taeuscht
 * einen Einbruch vor: gemessen kippte der 7-Tage-Umsatz dadurch von echten
 * +8 % auf scheinbare -27 %.
 */
const closedDays = (days) => days.slice(0, -1);

/** Fensterlogik: die letzten n Tage gegen die n davor. */
function compare(series, days, n) {
  const vals = days.map((d) => series[d] ?? 0);
  if (vals.length < n * 2) return null;
  const recent = round2(sum(vals.slice(-n)));
  const before = round2(sum(vals.slice(-n * 2, -n)));
  return {
    window: n,
    recent, before,
    delta: before ? recent / before - 1 : null,
    recentAvg: round2(recent / n),
    beforeAvg: round2(before / n),
  };
}

/**
 * Dasselbe fuer eine Rate: Zaehler und Nenner werden ueber das Fenster SUMMIERT
 * und erst dann geteilt. Der Durchschnitt der Tagesraten waere falsch, weil er
 * einen Tag mit 3 Installs genauso stark gewichtet wie einen mit 200.
 */
function compareRate(numSeries, denSeries, days, n, asPercent) {
  if (days.length < n * 2) return null;
  const slice = (from, to) => {
    const part = to === undefined ? days.slice(from) : days.slice(from, to);
    const num = sum(part.map((d) => numSeries[d] ?? 0));
    const den = sum(part.map((d) => denSeries[d] ?? 0));
    return den ? num / den : null;
  };
  const recent = slice(-n);
  const before = slice(-n * 2, -n);
  const f = (v) => (v === null ? null : round2(asPercent ? v * 100 : v));
  return {
    window: n,
    recent: f(recent), before: f(before),
    delta: before && recent !== null ? recent / before - 1 : null,
    recentAvg: f(recent), beforeAvg: f(before),  // bei Raten ist der Wert schon ein Schnitt
    isRate: true,
  };
}

export default async function handler(req, res) {
  try {
    const pw = req.query?.pw || "";
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const days = Math.min(400, Math.max(60, Number(req.query?.days) || 365));
    const endDate = iso(Date.now());
    const startDate = iso(Date.now() - days * DAY_MS);
    const cacheKey = `${startDate}..${endDate}`;

    if (cache && cache.key === cacheKey && Date.now() - cache.at < CACHE_MS) {
      return res.json({ ...cache.payload, cached: true });
    }

    const auth = getGa4Auth();
    const tokenObj = await (await auth.getClient()).getAccessToken();
    const token = typeof tokenObj === "string" ? tokenObj : tokenObj?.token;
    if (!token) throw new Error("Konnte kein GA4-Access-Token holen");

    const gaEvents = METRICS.filter((m) => m.event).map((m) => m.event);
    const [ga, rc] = await Promise.all([
      ga4Daily(token, startDate, endDate, gaEvents),
      rcDaily(startDate, endDate),
    ]);

    // Lueckenlose Tagesachse — fehlende Tage sind echte Nullen, keine Luecken.
    const allDays = [];
    for (let t = Date.parse(startDate); t <= Date.parse(endDate); t += DAY_MS) allDays.push(iso(t));

    const series = {};
    for (const m of METRICS) series[m.key] = {};
    for (const day of allDays) {
      const g = ga.get(day) || {};
      const r = rc.get(day) || {};
      for (const m of METRICS) {
        series[m.key][day] = m.event ? (g[m.event] ?? 0)
          : m.key === "revenue" ? Math.round((r.revenue || 0) * 100) / 100
          : (r.purchases || 0);
      }
    }

    // Raten als gleitendes Fenster: an jedem Tag Zaehler und Nenner der letzten
    // 7 Tage summieren und dann teilen. Liegt der Nenner im Fenster bei 0, gibt
    // es keinen Wert (null) statt einer erfundenen Null.
    for (const r of RATES) {
      series[r.key] = {};
      allDays.forEach((day, i) => {
        const from = Math.max(0, i - RATE_WINDOW + 1);
        let num = 0, den = 0;
        for (let k = from; k <= i; k++) {
          num += series[r.num][allDays[k]] ?? 0;
          den += series[r.den][allDays[k]] ?? 0;
        }
        series[r.key][day] = den ? round2((num / den) * (r.unit === "%" ? 100 : 1)) : null;
      });
    }

    // Kennzahlen je Metrik: Median als Farb-Mittelpunkt, Vergleichsfenster,
    // Wochentagsmuster. Alles serverseitig, damit das Frontend nur zeichnet.
    const stats = {};
    for (const m of METRICS) {
      const vals = allDays.map((d) => series[m.key][d]);
      const sorted = [...vals].sort((a, b) => a - b);
      const byWeekday = Array.from({ length: 7 }, () => []);
      allDays.forEach((d, i) => {
        // 0 = Montag
        byWeekday[(new Date(d + "T00:00:00Z").getUTCDay() + 6) % 7].push(vals[i]);
      });
      // Der Median ueber das ganze Jahr taugt nicht als Farb-Mittelpunkt: als die
      // App noch klein war, lag er bei Trials und Umsatz schlicht bei 0, und dann
      // faerbt sich jeder normale Tag gruen. Die Skala richtet sich deshalb nach
      // den letzten 90 Tagen, also dem aktuellen Normalzustand.
      const recentVals = vals.slice(-90);
      const recentSorted = [...recentVals].sort((a, b) => a - b);

      stats[m.key] = {
        total: round2(sum(vals)),
        median: round2(quantile(sorted, 0.5)),
        scaleMedian: round2(quantile(recentSorted, 0.5)),
        scaleP10: round2(quantile(recentSorted, 0.1)),
        scaleP90: round2(quantile(recentSorted, 0.9)),
        p10: round2(quantile(sorted, 0.1)),
        p90: round2(quantile(sorted, 0.9)),
        max: sorted[sorted.length - 1] ?? 0,
        best: allDays[vals.indexOf(sorted[sorted.length - 1])] ?? null,
        compare: {
          d7: compare(series[m.key], closedDays(allDays), 7),
          d21: compare(series[m.key], closedDays(allDays), 21),
          d28: compare(series[m.key], closedDays(allDays), 28),
        },
        weekday: byWeekday.map((a) => (a.length ? Math.round((sum(a) / a.length) * 100) / 100 : 0)),
      };
    }

    // Kennzahlen fuer die Raten. Der Median steht hier nur informativ drin, die
    // Farbskala rechnet das Frontend ueber den sichtbaren Ausschnitt neu.
    for (const r of RATES) {
      const vals = allDays.map((d) => series[r.key][d]).filter((v) => v !== null);
      const sorted = [...vals].sort((a, b) => a - b);
      const pct = r.unit === "%";

      // Wochentag NICHT aus den Fensterwerten mitteln: die Rate ist bereits ein
      // 7-Tage-Fenster, jeder Tag enthaelt also dieselben sieben Wochentage.
      // Der Mittelwert daraus waere fuer alle sieben nahezu identisch und der
      // Wochentagseffekt komplett weggeglaettet. Stattdessen Zaehler und Nenner
      // der ROHEN Tage je Wochentag summieren und erst dann teilen.
      const wdNum = Array(7).fill(0), wdDen = Array(7).fill(0);
      allDays.forEach((day) => {
        const w = (new Date(day + "T00:00:00Z").getUTCDay() + 6) % 7;
        wdNum[w] += series[r.num][day] ?? 0;
        wdDen[w] += series[r.den][day] ?? 0;
      });

      stats[r.key] = {
        isRate: true,
        median: round2(quantile(sorted, 0.5)),
        p10: round2(quantile(sorted, 0.1)),
        p90: round2(quantile(sorted, 0.9)),
        max: sorted[sorted.length - 1] ?? 0,
        compare: {
          d7: compareRate(series[r.num], series[r.den], closedDays(allDays), 7, pct),
          d21: compareRate(series[r.num], series[r.den], closedDays(allDays), 21, pct),
          d28: compareRate(series[r.num], series[r.den], closedDays(allDays), 28, pct),
        },
        weekday: wdNum.map((n, i) => (wdDen[i] ? round2((n / wdDen[i]) * (pct ? 100 : 1)) : 0)),
      };
    }

    const payload = {
      generated_at: new Date().toISOString(),
      range: { startDate, endDate, days: allDays.length },
      metrics: METRICS.map(({ key, label, unit }) => ({ key, label, unit, group: "absolut" })),
      rates: RATES.map(({ key, label, unit, comparable }) =>
        ({ key, label, unit, group: "rate", comparable: !!comparable })),
      rate_window: RATE_WINDOW,
      // Bis hierhin sind die Tage abgeschlossen; alles danach laeuft noch.
      last_closed_day: allDays[allDays.length - 2] ?? null,
      days: allDays,
      series,
      stats,
      api_calls: 2,
    };
    cache = { key: cacheKey, at: Date.now(), payload };
    return res.json(payload);
  } catch (e) {
    console.error("[daily]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
