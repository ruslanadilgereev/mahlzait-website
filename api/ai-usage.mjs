// AI Usage — per-user LLM token consumption + cost, over the last 12 months.
// GET  /api/ai-usage?pw=X            → cached dataset from Firestore
// GET  /api/ai-usage?pw=X&refresh=1  → query ai_usage docs + join RC demographics, save, return
//
// Auth: DASHBOARD_PASSWORD env (same as the other leaderboard endpoints).
// RC:   RC_SECRET_API_KEY env, project proj41604426 (per-uid demographic lookup).
// GCP:  GOOGLE_SA_KEY (base64 SA json) for Firestore.
// Source: Firestore mytemple-460913 → collection `ai_usage`, doc-id `{uid}_{YYYY-MM}`
//   (written by the app + WhatsApp agent proxies, one Firestore write per user request).
// State:  Firestore mytemple-460913 → `ai_usage_dashboard_cache` → `state`.
//
// We read the token counters per (uid, month), estimate them with a month-aware Vertex-AI
// price table, and join demographics per uid from RC (gender, age, country, sub_type,
// …) so the exact same customer-filter as the "Kunden" tab works here. Output is
// PII-free: the uid is replaced by an 8-char sha256 prefix, and no email/phone/IDFA/
// display-name is ever fetched or stored. The compact record set is gzipped + base64'd
// into ONE Firestore string field (`data_b64`), inflated in the handler; the frontend
// does all charting + filtering client-side. Since schema 2 each record also carries
// `days` (per-UTC-day counters + pro-rated cost) for the Von-bis/Tages-Auswahl.

import { google } from "googleapis";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

export const config = { maxDuration: 300 }; // Pro-Plan; 3 RC-Calls je AI-User können >60s brauchen

const GCP_PROJECT = "mytemple-460913";
const SRC_COLLECTION = "ai_usage";
const CACHE_COLLECTION = "ai_usage_dashboard_cache";
const DOC_ID = "state";
const DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/${CACHE_COLLECTION}/${DOC_ID}`;

const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";
const ENRICH_CONCURRENCY = 14;

// --- Vertex AI Gemini estimates, USD per 1M tokens, Standard Global endpoint ---
// Historical table: 2026-08. New Flash rates verified 2026-09-13; see PRICING_SOURCE.
// (Gemini-3-Pro >200k-Kontext-Staffel bewusst ignoriert — Mahlzait-Prompts <200k.)
const PRICING = {
  "gemini-3.8-flash":       { in: 1.50, out: 7.50,  cached: 0.15 },
  "gemini-3.7-flash":       { in: 1.50, out: 7.50,  cached: 0.15 },
  "gemini-3.6-flash":       { in: 1.50, out: 7.50,  cached: 0.15 },
  "gemini-3.5-flash":       { in: 1.50, out: 9.00,  cached: 0.15 },
  "gemini-3.5-flash-lite":  { in: 0.30, out: 2.50,  cached: 0.03 },
  "gemini-3.1-flash-lite":  { in: 0.25, out: 1.50,  cached: 0.025 },
  "gemini-3-pro-preview":   { in: 2.00, out: 12.00, cached: 0.20 },
  "gemini-2.5-flash":       { in: 0.30, out: 2.50,  cached: 0.03 },
  "gemini-2.5-flash-lite":  { in: 0.10, out: 0.40,  cached: 0.01 },
  "gemini-3-flash-preview": { in: 0.50, out: 3.00,  cached: 0.05 },
};
const DEFAULT_MODEL = "gemini-3.5-flash";      // unbekanntes Modell → 3.5-flash-Sätze
const REGIONAL_MULTIPLIER = 1.0;               // Agent ruft Gemini über den GLOBAL-Endpoint (backend-agent config.py GOOGLE_CLOUD_LOCATION="global") → kein Non-Global-Aufschlag. Auf 1.10 setzen, falls je auf regionalen Endpoint gewechselt wird.
const EUR_PER_USD = 0.875;                     // Kurs ~1.14, Juli 2026
const PRICING_VERSION = "2026-09-13";
const PRICING_SOURCE = "https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing";
const PROMO_MODELS = new Set(["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.8-flash"]);
// The current page does not establish a historical start date. Apply the verified
// offer only from this monthly snapshot onward, retaining the existing August rates.
const PROMO_FROM_MONTH = "2026-09";
const PROMO_THROUGH_MONTH = "2026-12";
const PROMO_PRICING = { in: 0.75, out: 3.75, cached: 0.075 }; // assumes the advertised 50% credits
const COST_COMPONENTS = ["input_eur", "cached_input_eur", "output_eur", "thinking_eur"];
const TOKEN_COUNTERS = ["requests", "input_tokens", "cached_tokens", "output_tokens", "thinking_tokens"];

// Onboarding/profile attributes we keep (all non-PII). `null` when not set.
// Mirror of customers-insights.mjs so the demographic records are byte-compatible
// with the cu-filter of the "Kunden" tab.
const NUMERIC_ATTRS = new Set(["birth_year", "height_cm", "weight_kg", "target_weight_kg", "weekly_weight_goal_kg"]);
const STRING_ATTRS = [
  "gender", "activity_level", "goal", "country_code", "region",
  "self_reported_source", "$mediaSource", "install_source", "utm_medium",
  "has_previous_apps", "add_burned_calories", "obstacles",
];

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

async function loadState(firestore) {
  try {
    const r = await firestore.projects.databases.documents.get({ name: DOC_PATH });
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

// ---------- RC client ----------
const rcBackoff = (attempt, retryAfter) => {
  const ra = Number(retryAfter);
  if (Number.isFinite(ra) && ra > 0) return Math.min(15000, ra * 1000);
  return Math.min(8000, 400 * Math.pow(2, attempt)) + Math.floor(Math.random() * 300);
};
async function rcGet(path, retries = 6) {
  const key = requireEnv("RC_SECRET_API_KEY");
  const url = path.startsWith("http") ? path : `${RC_BASE}${path}`;
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      });
      if (r.status === 429 || (r.status >= 500 && r.status < 600)) {
        await new Promise((res) => setTimeout(res, rcBackoff(attempt, r.headers.get("retry-after"))));
        lastErr = new Error(`HTTP ${r.status}`);
        continue;
      }
      if (!r.ok) {
        const body = await r.text();
        throw new Error(`HTTP ${r.status} ${body.slice(0, 200)}`);
      }
      return await r.json();
    } catch (e) {
      lastErr = e;
      if (attempt < retries - 1) await new Promise((res) => setTimeout(res, rcBackoff(attempt)));
    }
  }
  throw lastErr;
}
// 404 (Kunde nicht in RC) → null zurück, statt zu werfen; echte Fehler propagieren.
async function rcGetOrNull(path) {
  try {
    return await rcGet(path);
  } catch (e) {
    if (String(e?.message || e).includes("HTTP 404")) return null;
    throw e;
  }
}

async function pMap(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      try {
        results[idx] = await fn(items[idx], idx);
      } catch (e) {
        results[idx] = { _error: String(e.message || e) };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------- helpers ----------
const numOr0 = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const r4 = (n) => Math.round((Number(n) || 0) * 1e4) / 1e4;
const r2 = (n) => Math.round((Number(n) || 0) * 1e2) / 1e2;

// UTC-Monat "YYYY-MM", n Monate zurück (Date.UTC rollt negative Monate korrekt).
function monthsBack(n) {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Allocate integer 0.0001-EUR units by largest remainder. Every split is nonnegative
// and reconciles to its total, including tiny totals spread over many models/days.
function allocateCost(weights, totalEur) {
  if (!weights.length) return [];
  const totalUnits = Math.max(0, Math.round(numOr0(totalEur) * 1e4));
  let w = weights.map((n) => Math.max(0, numOr0(n)));
  let totalW = w.reduce((a, b) => a + b, 0);
  if (totalW === 0) { w = w.map(() => 1); totalW = w.length; }
  const exact = w.map((n) => totalUnits * n / totalW);
  const units = exact.map(Math.floor);
  const order = exact.map((n, i) => ({ i, fraction: n - units[i] }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  const remaining = totalUnits - units.reduce((a, b) => a + b, 0);
  for (let i = 0; i < remaining; i++) units[order[i].i]++;
  return units.map((n) => n / 1e4);
}

function modelPricing(model, month) {
  const validMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""));
  if (PROMO_MODELS.has(model)) {
    if (validMonth && month >= PROMO_FROM_MONTH && month <= PROMO_THROUGH_MONTH) {
      return { rate: PROMO_PRICING, basis: "introductory_credit_assumed" };
    }
    if (validMonth && month >= "2027-01") {
      return { rate: PRICING[model], basis: "standard_global" };
    }
    // 3.6 already existed in the August table. Do not apply today's offer to it
    // retroactively or invent historical rates for the newly added models.
    if (validMonth && model === "gemini-3.6-flash") {
      return { rate: PRICING[model], basis: "legacy_estimate" };
    }
    return { rate: PRICING[DEFAULT_MODEL], basis: "historical_rate_unverified", fallback: DEFAULT_MODEL };
  }
  if (Object.hasOwn(PRICING, model)) return { rate: PRICING[model], basis: "legacy_estimate" };
  return { rate: PRICING[DEFAULT_MODEL], basis: "unknown_model", fallback: DEFAULT_MODEL };
}

function modelCostBreakdown(rate, t) {
  const input = Math.max(0, numOr0(t.input_tokens));
  const cached = Math.min(input, Math.max(0, numOr0(t.cached_tokens)));
  const output = Math.max(0, numOr0(t.output_tokens));
  const thinking = Math.min(output, Math.max(0, numOr0(t.thinking_tokens)));
  const factor = REGIONAL_MULTIPLIER * EUR_PER_USD / 1e6;
  // Stored input includes cached input; stored output includes thinking. Modalities
  // are not recorded separately, so input combines text, image, video and audio.
  const costs = [(input - cached) * rate.in, cached * rate.cached,
    (output - thinking) * rate.out, thinking * rate.out].map((n) => n * factor);
  const rawCostEur = costs.reduce((a, b) => a + b, 0);
  const costEur = r4(rawCostEur);
  const rounded = allocateCost(costs, costEur);
  return { costEur, rawCostEur, breakdown: Object.fromEntries(COST_COMPONENTS.map((key, i) => [key, rounded[i]])) };
}

function counterWarnings(t) {
  const warnings = [];
  if (TOKEN_COUNTERS.some((key) => numOr0(t[key]) < 0)) warnings.push("negative_counters");
  if (numOr0(t.cached_tokens) > Math.max(0, numOr0(t.input_tokens))) warnings.push("cached_exceeds_input");
  if (numOr0(t.thinking_tokens) > Math.max(0, numOr0(t.output_tokens))) warnings.push("thinking_exceeds_output");
  return warnings;
}

// Immer über by_model rechnen (nie über Top-Level-Summen). Modell-Key "_"→"." zurückmappen.
export function priceByModel(byModel, month) {
  const normalized = Object.create(null);
  for (const [key, tokens] of Object.entries(byModel || {})) {
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) continue;
    const model = String(key).replace(/_/g, ".");
    normalized[model] ||= Object.fromEntries(TOKEN_COUNTERS.map((counter) => [counter, 0]));
    for (const counter of TOKEN_COUNTERS) normalized[model][counter] += numOr0(tokens[counter]);
  }
  const byModelOut = {};
  const unpriced = [];
  const costBreakdown = Object.fromEntries(COST_COMPONENTS.map((key) => [key, 0]));
  for (const [dotted, t] of Object.entries(normalized)) {
    const pricing = modelPricing(dotted, month);
    if (pricing.fallback && !unpriced.includes(dotted)) unpriced.push(dotted);
    const { costEur, breakdown } = modelCostBreakdown(pricing.rate, t);
    for (const key of COST_COMPONENTS) costBreakdown[key] = r4(costBreakdown[key] + breakdown[key]);
    byModelOut[dotted] = {
      requests: numOr0(t.requests),
      input_tokens: numOr0(t.input_tokens),
      cached_tokens: numOr0(t.cached_tokens),
      output_tokens: numOr0(t.output_tokens),
      thinking_tokens: numOr0(t.thinking_tokens),
      cost_eur: costEur,
      cost_breakdown: breakdown,
      pricing_basis: pricing.basis,
    };
    if (pricing.fallback) byModelOut[dotted].pricing_fallback = pricing.fallback;
    const warnings = counterWarnings(t);
    if (warnings.length) byModelOut[dotted].usage_warnings = warnings;
  }
  const costEur = r4(Object.values(costBreakdown).reduce((a, b) => a + b, 0));
  return { byModelOut, costEur, costBreakdown, unpriced };
}

// Kanal-Kosten: den exakt berechneten Record-cost_eur anteilig auf die Kanäle verteilen,
// gewichtet mit preisgewichteten Kanal-Tokens zu DEFAULT_MODEL-Sätzen. by_channel splittet nicht
// nach Modell, daher diese Näherung; da anschliessend auf den exakt berechneten Record-€ normiert
// wird, faellt die Wahl der Gewichts-Preisliste nur ins Gewicht, wenn Kanaele UNTERSCHIEDLICHE
// Modelle fahren (App und WhatsApp teilen sich aktuell dasselbe, nur der seltene pro-Mode weicht ab).
// Rundungsreste werden verteilt → Summe der Kanal-€ == Record-€.
function splitChannels(byChannel, recCostEur) {
  const chans = [];
  for (const [name, t] of Object.entries(byChannel || {})) {
    if (!t || typeof t !== "object") continue;
    chans.push({
      name,
      requests: numOr0(t.requests),
      input_tokens: numOr0(t.input_tokens),
      cached_tokens: numOr0(t.cached_tokens),
      output_tokens: numOr0(t.output_tokens),
      thinking_tokens: numOr0(t.thinking_tokens),
    });
  }
  if (!chans.length) return null;
  const W = PRICING[DEFAULT_MODEL]; // gemini-3.5-flash-Sätze als Gewicht
  const w = chans.map((c) => modelCostBreakdown(W, c).rawCostEur);
  const costs = allocateCost(w, recCostEur);
  const out = {};
  chans.forEach((c, i) => {
    out[c.name] = {
      requests: c.requests,
      input_tokens: c.input_tokens,
      cached_tokens: c.cached_tokens,
      output_tokens: c.output_tokens,
      thinking_tokens: c.thinking_tokens,
      cost_eur: costs[i],
    };
  });
  return out;
}

// Tages-Kosten: wie splitChannels, nur über by_day. by_day splittet nicht nach Modell,
// daher dieselbe preisgewichtete Näherung; Tokens pro Tag sind exakt. Rundungsreste
// werden verteilt → Summe der Tages-€ == Record-€. Kompaktformat pro Tag (Key = "DD"):
// [requests, input, cached, output, thinking, cost_eur].
function splitDays(byDay, recCostEur, month) {
  const days = [];
  for (const [date, t] of Object.entries(byDay || {})) {
    if (!t || typeof t !== "object") continue;
    if (!String(date).startsWith(month)) continue; // defensiv: fremde Tage ignorieren
    days.push({
      dd: String(date).slice(-2),
      requests: numOr0(t.requests),
      input_tokens: numOr0(t.input_tokens),
      cached_tokens: numOr0(t.cached_tokens),
      output_tokens: numOr0(t.output_tokens),
      thinking_tokens: numOr0(t.thinking_tokens),
    });
  }
  if (!days.length) return null;
  days.sort((a, b) => (a.dd < b.dd ? -1 : 1));
  const W = PRICING[DEFAULT_MODEL];
  const w = days.map((d) => modelCostBreakdown(W, d).rawCostEur);
  const costs = allocateCost(w, recCostEur);
  const out = {};
  days.forEach((d, i) => {
    out[d.dd] = [d.requests, d.input_tokens, d.cached_tokens, d.output_tokens, d.thinking_tokens, costs[i]];
  });
  return out;
}

function priceUsageRecord(record, rawByDay) {
  const { byModelOut, costEur, costBreakdown, unpriced } = priceByModel(record.by_model, record.month);
  const models = Object.values(byModelOut);
  const warnings = new Set(counterWarnings(record));
  for (const model of models) for (const warning of model.usage_warnings || []) warnings.add(warning);
  const missingModels = !models.length && TOKEN_COUNTERS.some((key) => numOr0(record[key]) > 0);
  if (missingModels) warnings.add("model_counters_missing");
  // A user request increments every distinct model it uses; model request counts
  // are neither additive user turns nor individual LLM-call counts. Tokens are additive.
  else if (TOKEN_COUNTERS.some((key) => key !== "requests"
    && models.reduce((sum, model) => sum + model[key], 0) !== numOr0(record[key]))) {
    warnings.add("model_totals_mismatch");
  }
  const out = {
    ...record,
    // A legacy record without per-model counters cannot be repriced accurately.
    // Preserve its previous estimate and explicitly leave the breakdown unavailable.
    cost_eur: missingModels ? Math.max(0, r4(record.cost_eur)) : costEur,
    cost_breakdown: missingModels ? null : costBreakdown,
    by_model: byModelOut,
  };
  delete out.unpriced_models;
  delete out.usage_warnings;
  if (unpriced.length) out.unpriced_models = unpriced;
  if (warnings.size) out.usage_warnings = [...warnings];
  if (record.channels) out.channels = splitChannels(record.channels, out.cost_eur);
  if (!rawByDay && record.days) {
    rawByDay = {};
    for (const [dd, day] of Object.entries(record.days)) {
      if (!Array.isArray(day)) continue;
      rawByDay[`${record.month}-${dd}`] = Object.fromEntries(TOKEN_COUNTERS.map((key, i) => [key, day[i]]));
    }
  }
  if (rawByDay) out.days = splitDays(rawByDay, out.cost_eur, record.month);
  return out;
}

function pricingMeta(meta, records, cachedVersion = PRICING_VERSION) {
  const unpriced = [...new Set(records.flatMap((record) => record.unpriced_models || []))].sort();
  const usageWarningRecords = records.filter((record) => record.usage_warnings?.length).length;
  const missingModels = records.filter((record) => record.usage_warnings?.includes("model_counters_missing")).length;
  const promoAssumed = records.some((record) => Object.values(record.by_model || {})
    .some((model) => model.pricing_basis === "introductory_credit_assumed"));
  const warnings = [
    "Tokenkosten sind Schätzungen aus Nutzungszählern und keine Google-Cloud-Abrechnung.",
    "Annahme: Standard-Global-Endpunkt und fester Wechselkurs 1 USD = 0,875 EUR; tatsächliche EUR-SKUs können abweichen.",
    "Input umfasst alle gespeicherten Modalitäten. Separate Audio-Tarife älterer Modelle, lange Kontexte, Grounding und andere Cloud-Kosten sind nicht separat erfasst.",
    "Tages- und Kanalkosten sind anteilig geschätzt, da diese Zähler keine Modellaufteilung enthalten.",
  ];
  if (promoAssumed) warnings.push("Für Gemini 3.6/3.7/3.8 Flash wird ab September bis Dezember 2026 die veröffentlichte 50%-Aktionsgutschrift angenommen; tatsächlich gewährte Gutschriften sind hier nicht geprüft.");
  if (cachedVersion !== PRICING_VERSION) warnings.push("Gespeicherte Modellzähler wurden mit der aktuellen, monatsabhängigen Preistabelle neu bewertet; der Cache wurde dabei nicht geändert.");
  if (unpriced.length) warnings.push(`Unbekannte Modelle oder nicht belegte historische Tarife: ${unpriced.join(", ")}. Ersatzweise gelten Gemini-3.5-Flash-Sätze.`);
  if (usageWarningRecords) warnings.push(`${usageWarningRecords} Datensätze enthalten widersprüchliche oder unvollständige Zähler; Rohzähler bleiben unverändert.`);
  if (missingModels) warnings.push(`${missingModels} Datensätze ohne Modellzähler behalten ihren bisherigen Schätzwert ohne Kostenaufteilung.`);
  return {
    ...meta,
    pricing_version: PRICING_VERSION,
    cached_pricing_version: cachedVersion || null,
    repriced_from_cache: cachedVersion !== PRICING_VERSION,
    cost_basis: "token_estimate",
    pricing_source: PRICING_SOURCE,
    eur_per_usd: EUR_PER_USD,
    exchange_rate_basis: "fixed_assumption",
    regional_multiplier: REGIONAL_MULTIPLIER,
    endpoint_assumption: "standard_global",
    promotional_credit_assumed: promoAssumed,
    promotion_applied_from_month: PROMO_FROM_MONTH,
    promotion_through_month: PROMO_THROUGH_MONTH,
    unpriced_models: unpriced,
    usage_warning_records: usageWarningRecords,
    missing_model_counter_records: missingModels,
    pricing_warnings: warnings,
    total_cost_eur: r2(records.reduce((sum, record) => sum + numOr0(record.cost_eur), 0)),
  };
}

// Reading old caches only needs the counters already stored alongside demographics.
// This is deliberately pure: no RevenueCat lookup and no Firestore cache mutation.
export function repriceCachedUsage(state) {
  const records = inflate(state).map((record) => priceUsageRecord(record));
  return { records, meta: pricingMeta(state?.meta || {}, records, state?.meta?.pricing_version || null) };
}

// ---------- Firestore: ai_usage query ----------
async function queryUsageDocs(firestore, minMonth) {
  const parent = `projects/${GCP_PROJECT}/databases/(default)/documents`;
  const res = await firestore.projects.databases.documents.runQuery({
    parent,
    requestBody: {
      structuredQuery: {
        from: [{ collectionId: SRC_COLLECTION }],
        where: {
          fieldFilter: {
            field: { fieldPath: "month" },
            op: "GREATER_THAN_OR_EQUAL",
            value: { stringValue: minMonth },
          },
        },
        // Nur was wir brauchen; updated_at bewusst NICHT ziehen.
        select: {
          fields: ["uid", "month", "requests", "input_tokens", "cached_tokens", "output_tokens", "thinking_tokens", "by_model", "by_channel", "by_day"]
            .map((f) => ({ fieldPath: f })),
        },
      },
    },
  });
  const out = [];
  for (const row of res.data || []) {
    if (!row || !row.document || !row.document.fields) continue;
    out.push(decodeFields(row.document.fields));
  }
  return out;
}

// ---------- RC demographics (per uid) ----------
// Build one compact, PII-free demographic record; same shape as customers-insights.
function buildDemographics(cust, attrsItems) {
  const a = {};
  for (const it of attrsItems || []) a[it.name] = it.value;
  const rec = {
    first_seen: cust && cust.first_seen_at != null ? Number(cust.first_seen_at) : null,
    platform: cust ? (cust.last_seen_platform || null) : null,
    app_version: cust ? (cust.last_seen_app_version || null) : null,
    // Prefer app-detected country_code; fall back to IP-derived country.
    country: a["country_code"] || (cust ? (cust.last_seen_country || null) : null) || null,
  };
  for (const k of NUMERIC_ATTRS) {
    const v = a[k];
    const n = v == null || v === "" ? null : Number(v);
    rec[k] = Number.isFinite(n) ? n : null;
  }
  for (const k of STRING_ATTRS) {
    if (k === "country_code") continue; // already folded into `country`
    const out = k === "$mediaSource" ? "media_source" : k;
    const v = a[k];
    rec[out] = v == null || v === "" ? null : String(v);
  }
  return rec;
}
// sub_type = AKTUELLER Abo-Status (mirror of customers-insights.mjs fetchProfile).
function deriveSubType(subsResp) {
  let year = false, month = false, trial = false, hadAny = false;
  for (const s of (subsResp && subsResp.items) || []) {
    hadAny = true;
    const status = s.status;
    if (status === "trialing") { trial = true; continue; }
    const active = status === "active" || status === "in_grace_period" || status === "in_billing_retry";
    const gross = (s.total_revenue_in_usd || {}).gross || 0;
    if (active && gross > 0) {
      const cs = s.current_period_starts_at, ce = s.current_period_ends_at;
      const days = cs && ce ? (Number(ce) - Number(cs)) / 86400000 : 0;
      if (days > 300) year = true; else month = true;
    }
  }
  return year ? "yearly" : month ? "monthly" : trial ? "trial" : hadAny ? "expired" : "kein";
}
function emptyProfile() {
  const r = buildDemographics(null, []);
  r.sub_type = null;
  return r;
}
// RC-App-User-ID = Firebase UID. GET customer (Meta) + attributes + subscriptions.
// Kunde fehlt (404) → Demografie null lassen, aber Usage-Record behalten.
async function fetchProfileForUid(uid) {
  const cid = encodeURIComponent(String(uid)); // uids kommen aus unserem Firestore → defensiv encoden
  const cust = await rcGetOrNull(`/projects/${RC_PROJECT}/customers/${cid}`);
  if (!cust) return emptyProfile();
  const attrsResp = await rcGetOrNull(`/projects/${RC_PROJECT}/customers/${cid}/attributes`);
  const subsResp = await rcGetOrNull(`/projects/${RC_PROJECT}/customers/${cid}/subscriptions`);
  const rec = buildDemographics(cust, (attrsResp && attrsResp.items) || []);
  rec.sub_type = deriveSubType(subsResp);
  return rec;
}

// ---------- Refresh ----------
async function doRefresh(firestore, prev) {
  const t0 = Date.now();
  const minMonth = monthsBack(11); // 12-Monats-Fenster (aktueller Monat inkl.)
  const docs = await queryUsageDocs(firestore, minMonth);
  const tQuery = Date.now() - t0;

  const uidSet = new Set();
  for (const d of docs) if (d.uid) uidSet.add(String(d.uid));
  const uids = [...uidSet];

  const tEnrichStart = Date.now();
  const profs = await pMap(uids, ENRICH_CONCURRENCY, fetchProfileForUid);
  const tEnrich = Date.now() - tEnrichStart;

  const profByUid = new Map();
  let enrichErrors = 0;
  uids.forEach((uid, i) => {
    const p = profs[i];
    if (!p || p._error) { enrichErrors++; profByUid.set(uid, emptyProfile()); }
    else profByUid.set(uid, p);
  });

  const monthsSet = new Set();
  const unpricedAll = new Set();
  const records = [];
  for (const d of docs) {
    if (!d.uid || !d.month) continue;
    monthsSet.add(d.month);
    const prof = profByUid.get(String(d.uid)) || emptyProfile();
    const u = createHash("sha256").update(String(d.uid)).digest("hex").slice(0, 8);
    const rec = priceUsageRecord({
      u,
      month: d.month,
      ...prof, // first_seen, platform, country, birth_year, gender, sub_type, … (cu-kompatibel)
      requests: numOr0(d.requests),
      input_tokens: numOr0(d.input_tokens),
      cached_tokens: numOr0(d.cached_tokens),
      output_tokens: numOr0(d.output_tokens),
      thinking_tokens: numOr0(d.thinking_tokens),
      by_model: d.by_model,
      ...(d.by_channel ? { channels: d.by_channel } : {}),
    }, d.by_day);
    for (const model of rec.unpriced_models || []) unpricedAll.add(model);
    records.push(rec);
  }

  const months = [...monthsSet].sort();
  const meta = pricingMeta({
    months,
    total_users: uids.length,
  }, records);

  const json = JSON.stringify(records);
  const b64 = gzipSync(Buffer.from(json, "utf-8")).toString("base64");

  // Firestore caps a document at ~1,048,576 bytes; data_b64 is base64 ASCII so byte ≈ length.
  const MAX_B64_BYTES = 900 * 1024;
  if (b64.length > MAX_B64_BYTES) {
    throw new Error(`ai-usage: data_b64 ${Math.round(b64.length / 1024)} KB überschreitet ${Math.round(MAX_B64_BYTES / 1024)} KB Guard (${records.length} Records): Firestore-1-MB-Limit naht, Blob muss gesplittet werden.`);
  }

  // Einen bekannt-guten Cache nicht mit einem leeren Pull überschreiben (Firestore-Hiccup).
  if (prev && prev.total_users > 0 && records.length === 0) {
    return { ...prev, refresh_warning: "Pull ergab 0 Records, vorheriger Cache behalten." };
  }

  const state = {
    last_pull_ts_ms: Date.now(),
    schema: 2, // 2 = Records enthalten `days` (Tages-Zähler + anteilige Tages-€)
    total_users: uids.length,
    meta,
    data_b64: b64,
    last_refresh_meta: {
      ms_total: Date.now() - t0,
      ms_query: tQuery,
      ms_enrich: tEnrich,
      docs: docs.length,
      users: uids.length,
      records: records.length,
      enrich_errors: enrichErrors,
      unpriced_models: [...unpricedAll],
      raw_json_bytes: json.length,
      stored_b64_bytes: b64.length,
    },
  };
  await saveState(firestore, state);
  return state;
}

function inflate(state) {
  if (!state || !state.data_b64) return [];
  try {
    const buf = gunzipSync(Buffer.from(state.data_b64, "base64"));
    return JSON.parse(buf.toString("utf-8"));
  } catch {
    return [];
  }
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

    let state = await loadState(firestore);
    if (refresh) {
      state = await doRefresh(firestore, state);
    } else if (!state) {
      return res.json({
        bootstrapped: false,
        hint: "Noch kein State. Klicke Aktualisieren, um den ersten Pull anzustossen (kann 60s dauern).",
      });
    }
    const { records, meta } = repriceCachedUsage(state);
    return res.json({
      bootstrapped: true,
      last_pull_ts_ms: state.last_pull_ts_ms,
      schema: state.schema || 1,
      meta,
      refresh_warning: state.refresh_warning || null,
      records,
    });
  } catch (e) {
    console.error("[ai-usage]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
