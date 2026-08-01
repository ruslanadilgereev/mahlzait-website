// Business-Funnel — GA4-Nutzerkohorte + RevenueCat, inkl. Monatshistorie.
// GET /api/funnel?pw=X[&range=30d|90d|6m|<YYYY-MM>]
//
// Auth: DASHBOARD_PASSWORD env (same as the other leaderboard endpoints).
// GA4:  GOOGLE_SA_KEY (base64 SA json), scope analytics.readonly, property 490479548.
// RC:   RC_SECRET_API_KEY env, project proj41604426.
//
// ============================ Messmethode ============================
// ALLES IST NUTZERBASIERT. Der GA4-Funnel-Report liefert `activeUsers` je
// Stufe, nicht `eventCount`. Jeder Mensch zaehlt einmal, egal wie oft er ein
// Event ausgeloest hat.
//
// Jede Stufe wird als EIGENER 2-Stufen-Funnel `first_open -> <event>` gemessen,
// nicht als eine lange geschlossene Kette. Grund: eine lange Kette verlangt
// strikte Reihenfolge, und mehrere Events feuern hier praktisch gleichzeitig
// oder in wechselnder Folge. Gemessen an der langen Kette faellt die Paywall
// von 1033 auf 396 Nutzer und `begin_checkout -> purchase_attempt` auf 28%,
// obwohl beide dieselben 123 Nutzer haben. Das sind Reihenfolge-Artefakte,
// kein echter Abbruch. Die Einzelmessung beantwortet sauber die eigentliche
// Frage: wie viele der Installierer haben Stufe X je erreicht?
//
// Bewusst NICHT als Stufe drin, weil nicht monoton (parallele Nutzung, kein
// Trichterschritt): meal_logged, daily_active_user, chat_log_used. Die laufen
// separat als Aktivierungs-Kennzahlen.
// Bewusst weggelassen, weil deckungsgleich mit der Vorstufe (0% Abfluss, reine
// Doppelung): profile_setup_completed (= onboarding_completed),
// purchase_attempt und begin_checkout (= paywall_cta_tap).

import { google } from "googleapis";

export const config = { maxDuration: 60 };

const GA4_PROPERTY = "properties/490479548";
const GA4_FUNNEL_URL = `https://analyticsdata.googleapis.com/v1alpha/${GA4_PROPERTY}:runFunnelReport`;
const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";

// Trichterstufen, in Reihenfolge. `event: null` = kommt aus RevenueCat.
const STAGES = [
  { key: "install", label: "App geöffnet", event: "first_open", hint: "first_open, der früheste Punkt den GA4 sieht" },
  { key: "welcome", label: "Welcome gesehen", event: "welcome_screen_viewed", hint: "Startbildschirm des Onboardings" },
  { key: "consent", label: "Einwilligung", event: "consent_decision", hint: "Tracking-/Datenschutz-Entscheidung getroffen" },
  { key: "onboarding", label: "Onboarding fertig", event: "onboarding_completed", hint: "Profil steht, App ist einsatzbereit" },
  { key: "paywall", label: "Paywall gesehen", event: "subscription_screen_viewed", hint: "Abo-Bildschirm angezeigt" },
  { key: "cta", label: "Kauf angetippt", event: "paywall_cta_tap", hint: "Tarif gewählt und auf Kaufen getippt" },
  { key: "trial", label: "Trial gestartet", event: "trial_started", hint: "7-Tage-Test aktiviert" },
];

// Aktivierung: keine Trichterstufen, sondern paralleles Nutzungsverhalten.
const ACTIVATION = [
  { key: "meal", label: "Erste Mahlzeit", event: "meal_logged" },
  { key: "chat", label: "KI-Chat genutzt", event: "chat_log_used" },
  { key: "barcode", label: "Barcode gescannt", event: "barcode_scanned" },
  { key: "dau", label: "Aktiver Tag", event: "daily_active_user" },
];

const DAY_MS = 24 * 3600 * 1000;
const iso = (d) => new Date(d).toISOString().slice(0, 10);

// GA4 deckelt gleichzeitige Anfragen pro Property (10). Wir brauchen ~29,
// also durch einen Pool schicken statt alles auf einmal feuern.
const GA4_CONCURRENCY = 6;

/** Promise.all mit Obergrenze fuer gleichzeitige Laeufe, Reihenfolge bleibt erhalten. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
 * Nutzer, die nach dem Install `event` je erreicht haben.
 * Geschlossener Funnel ab first_open -> Bestandsnutzer sind draussen,
 * Metrik ist activeUsers -> jeder Mensch zaehlt einmal.
 */
async function reach(token, event, startDate, endDate) {
  const steps = [{ name: "Install", event: "first_open" }];
  if (event !== "first_open") steps.push({ name: "Stufe", event });
  const body = {
    dateRanges: [{ startDate, endDate }],
    funnel: {
      isOpenFunnel: false,
      steps: steps.map((s) => ({
        name: s.name,
        filterExpression: { funnelEventFilter: { eventName: s.event } },
      })),
    },
  };
  // 429 = Concurrency-Quota. Kurz warten und erneut versuchen, statt den
  // ganzen Report scheitern zu lassen.
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(GA4_FUNNEL_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.status === 429 && attempt < 4) {
      await sleep(400 * (attempt + 1));
      continue;
    }
    if (!r.ok) throw new Error(`GA4 ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const vals = (j.funnelTable?.rows || []).map((row) => Number(row.metricValues?.[0]?.value || 0));
    // GA4 laesst Stufen ohne Nutzer WEG, statt sie mit 0 zu liefern. Einfach die
    // letzte Zeile zu nehmen liefert dann den Wert der Vorstufe und damit eine
    // vorgetaeuschte 100%-Rate. Also strikt auf die erwartete Position gehen.
    return vals.length >= steps.length ? vals[steps.length - 1] : 0;
  }
}

// ---------- RevenueCat ----------
async function rcChart(chart, startDate, endDate, resolution = "month") {
  if (!process.env.RC_SECRET_API_KEY) throw new Error("RC_SECRET_API_KEY env missing");
  const qs = new URLSearchParams({ start_date: startDate, end_date: endDate, resolution });
  const r = await fetch(`${RC_BASE}/projects/${RC_PROJECT}/charts/${chart}?${qs}`, {
    headers: { Authorization: `Bearer ${process.env.RC_SECRET_API_KEY}` },
  });
  if (!r.ok) throw new Error(`RC ${chart} ${r.status}: ${(await r.text()).slice(0, 160)}`);
  const j = await r.json();
  const out = new Map(); // cohort-ts -> {measureIdx: value}
  for (const v of j.values || []) {
    if (!out.has(v.cohort)) out.set(v.cohort, {});
    out.get(v.cohort)[v.measure] = Number(v.value || 0);
  }
  return { measures: (j.measures || []).map((m) => m.display_name), byCohort: out };
}

const monthKey = (ts) => new Date(ts * 1000).toISOString().slice(0, 7);

// ---------- Zeitraum ----------
function resolveRange(range) {
  const today = new Date();
  if (/^\d{4}-\d{2}$/.test(range || "")) {
    const [y, m] = range.split("-").map(Number);
    const last = new Date(Date.UTC(y, m, 0));
    const end = last > today ? today : last;
    return { startDate: `${range}-01`, endDate: iso(end), label: range };
  }
  const days = range === "90d" ? 90 : range === "6m" ? 180 : 30;
  return {
    startDate: iso(today.getTime() - days * DAY_MS),
    endDate: iso(today),
    label: range === "90d" ? "letzte 90 Tage" : range === "6m" ? "letzte 180 Tage" : "letzte 30 Tage",
  };
}

/** Die letzten n Monate als YYYY-MM, aeltester zuerst. */
function lastMonths(n) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push(m.toISOString().slice(0, 7));
  }
  return out;
}

// ---------- Handler ----------
export default async function handler(req, res) {
  try {
    const pw = req.query?.pw || "";
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const range = resolveRange(req.query?.range);
    const auth = getGa4Auth();
    const tokenObj = await (await auth.getClient()).getAccessToken();
    const token = typeof tokenObj === "string" ? tokenObj : tokenObj?.token;
    if (!token) throw new Error("Konnte kein GA4-Access-Token holen");

    const months = lastMonths(6);
    const histStart = `${months[0]}-01`;
    const histEnd = iso(Date.now());

    // Alle GA4-Abfragen als flache Liste, damit EIN Pool die Obergrenze global
    // haelt. Verschachtelte Promise.all wuerden die Quota wieder sprengen.
    // Historie nur mit den drei Kernstufen, sonst explodiert die Aufrufzahl.
    const HIST_EVENTS = ["first_open", "subscription_screen_viewed", "trial_started"];
    const ga4Tasks = [
      ...STAGES.map((s) => ({ event: s.event, start: range.startDate, end: range.endDate })),
      ...ACTIVATION.map((a) => ({ event: a.event, start: range.startDate, end: range.endDate })),
      ...months.flatMap((m) => {
        const r = resolveRange(m);
        return HIST_EVENTS.map((event) => ({ event, start: r.startDate, end: r.endDate }));
      }),
    ];

    const [ga4Results, rcTrial, rcActives, rcChurn, rcMrr] = await Promise.all([
      mapLimit(ga4Tasks, GA4_CONCURRENCY, (t) => reach(token, t.event, t.start, t.end)),
      rcChart("trial_conversion_rate", histStart, histEnd),
      rcChart("actives", histStart, histEnd),
      rcChart("churn", histStart, histEnd),
      rcChart("mrr", histStart, histEnd),
    ]);

    let cursor = 0;
    const stageUsers = ga4Results.slice(cursor, (cursor += STAGES.length));
    const activationUsers = ga4Results.slice(cursor, (cursor += ACTIVATION.length));
    const histStages = months.map((m) => {
      const [install, paywall, trial] = ga4Results.slice(cursor, (cursor += HIST_EVENTS.length));
      return { month: m, install, paywall, trial };
    });

    // --- Stufen aufbereiten
    const start = stageUsers[0] || 0;
    const stages = STAGES.map((s, i) => ({
      ...s,
      users: stageUsers[i],
      pctOfStart: start ? stageUsers[i] / start : 0,
      pctOfPrev: i === 0 ? 1 : (stageUsers[i - 1] ? stageUsers[i] / stageUsers[i - 1] : 0),
      lost: i === 0 ? 0 : Math.max(0, stageUsers[i - 1] - stageUsers[i]),
    }));

    // --- RC im gewaehlten Zeitraum: alle Monate, die der Zeitraum beruehrt
    const touched = new Set();
    for (let t = Date.parse(range.startDate); t <= Date.parse(range.endDate); t += DAY_MS) {
      touched.add(iso(t).slice(0, 7));
    }
    let trialStarts = 0, conversions = 0;
    for (const [ts, m] of rcTrial.byCohort) {
      if (!touched.has(monthKey(ts))) continue;
      trialStarts += m[0] || 0;
      conversions += m[1] || 0;
    }
    const rcConvRate = trialStarts ? conversions / trialStarts : null;

    const latest = (chart, idx) => {
      let best = null, bestTs = -1;
      for (const [ts, m] of chart.byCohort) {
        if (ts > bestTs && m[idx] !== undefined) { bestTs = ts; best = m[idx]; }
      }
      return best;
    };

    // --- Sankey: pro Stufe ein Weiter-Fluss und ein Abbruch-Fluss.
    // Die Zahlbreite ist der Nutzerstrom, dadurch sieht man sofort wo es blutet.
    // `depth` wandert mit, damit das Frontend jeden Abfluss auf der Ebene seiner
    // Stufe zeichnen kann statt gesammelt in der letzten Spalte.
    const nodes = [];
    const links = [];
    stages.forEach((s, i) => nodes.push({ name: s.label, value: s.users, depth: i }));
    for (let i = 1; i < stages.length; i++) {
      const prev = stages[i - 1], cur = stages[i];
      links.push({ source: prev.label, target: cur.label, value: cur.users, kind: "flow" });
      if (cur.lost > 0) {
        const dropName = `Weg nach „${prev.label}“`;
        nodes.push({ name: dropName, value: cur.lost, drop: true, depth: i });
        links.push({ source: prev.label, target: dropName, value: cur.lost, kind: "drop" });
      }
    }
    // Trial -> Bezahlt: modelliert aus der RC-Conversion-Rate, weil GA4 den
    // Kauf nicht zuverlaessig sieht (s2s_purchase feuert seit Juli nicht mehr).
    const trialUsers = stages[stages.length - 1].users;
    let modeledPaid = null;
    if (rcConvRate !== null && trialUsers) {
      modeledPaid = Math.round(trialUsers * rcConvRate);
      const lostTrial = trialUsers - modeledPaid;
      const paidDepth = stages.length;
      nodes.push({ name: "Bezahlt", value: modeledPaid, modeled: true, depth: paidDepth });
      links.push({ source: "Trial gestartet", target: "Bezahlt", value: modeledPaid, kind: "flow" });
      if (lostTrial > 0) {
        nodes.push({ name: "Trial verfallen", value: lostTrial, drop: true, depth: paidDepth });
        links.push({ source: "Trial gestartet", target: "Trial verfallen", value: lostTrial, kind: "drop" });
      }
    }

    // --- Historie anreichern
    // GA4 haelt NUTZERDATEN nur rund 2 Monate vor. Aeltere Monate liefern 0
    // Nutzer, obwohl real tausende Installs stattfanden. Das darf nicht als
    // "0 Installs" durchgehen -> auf null setzen und im Chart als Luecke zeigen.
    // Die RC-Reihen daneben gehen weiter zurueck und bleiben erhalten.
    const history = histStages.map((h0) => {
      const h = h0.install === 0
        ? { month: h0.month, install: null, paywall: null, trial: null, ga4_retention_gap: true }
        : h0;
      const ts = [...rcTrial.byCohort.keys()].find((k) => monthKey(k) === h.month);
      const tr = ts !== undefined ? rcTrial.byCohort.get(ts) : null;
      const av = [...rcActives.byCohort.entries()].find(([k]) => monthKey(k) === h.month)?.[1];
      const ch = [...rcChurn.byCohort.entries()].find(([k]) => monthKey(k) === h.month)?.[1];
      const mr = [...rcMrr.byCohort.entries()].find(([k]) => monthKey(k) === h.month)?.[1];
      // Der laufende Monat ist per Definition unvollstaendig. Seine ZAEHLWERTE
      // stuerzen sonst auf fast null und sehen aus wie ein Einbruch, obwohl der
      // Monat nur gerade erst begonnen hat. Snapshot-Werte (MRR, Aktive) sind
      // davon nicht betroffen, die gelten zum Stichtag.
      const partial = h.month === iso(Date.now()).slice(0, 7);

      // Raten brauchen eine tragfaehige Basis. 3 von 7 waeren 43% und trotzdem
      // Rauschen. Unter der Schwelle lieber nichts zeigen als etwas Falsches.
      const MIN_BASE = 30;
      const paywallRate = h.install >= MIN_BASE ? h.paywall / h.install : null;
      const trialRate = h.paywall >= MIN_BASE ? h.trial / h.paywall : null;

      // Trial->Bezahlt nur auf ENTSCHIEDENE Trials rechnen. Noch laufende
      // (pending) wuerden die Rate sonst kuenstlich druecken.
      const decided = tr ? (tr[1] || 0) + (tr[2] || 0) : 0;
      const rcConvRate = decided >= 20 ? tr[1] / decided : null;

      return {
        ...h,
        partial,
        paywallRate,
        trialRate,
        rcTrialStarts: tr ? tr[0] : null,
        rcConversions: tr ? tr[1] : null,
        rcPending: tr ? tr[3] : null,
        rcDecided: decided,
        rcConvRate,
        actives: av ? av[0] : null,
        churnRate: ch ? ch[2] : null,
        mrr: mr ? mr[0] : null,
      };
    });

    return res.json({
      generated_at: new Date().toISOString(),
      range,
      stages,
      activation: ACTIVATION.map((a, i) => ({
        ...a, users: activationUsers[i], pctOfStart: start ? activationUsers[i] / start : 0,
      })),
      sankey: { nodes, links },
      rc: {
        trial_starts: trialStarts,
        conversions,
        conversion_rate: rcConvRate,
        actives_now: latest(rcActives, 0),
        churn_rate: latest(rcChurn, 2),
        mrr: latest(rcMrr, 0),
      },
      modeled_paid: modeledPaid,
      history,
      months,
    });
  } catch (e) {
    console.error("[funnel]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
