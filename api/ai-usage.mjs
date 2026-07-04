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
// We read the token counters per (uid, month), price them with a static Vertex-AI
// price table, and join demographics per uid from RC (gender, age, country, sub_type,
// …) so the exact same customer-filter as the "Kunden" tab works here. Output is
// PII-free: the uid is replaced by an 8-char sha256 prefix, and no email/phone/IDFA/
// display-name is ever fetched or stored. The compact record set is gzipped + base64'd
// into ONE Firestore string field (`data_b64`), inflated in the handler; the frontend
// does all charting + filtering client-side. `by_day` stays in Firestore for later but
// is never fetched or shipped here (v1 timeline = months).

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

// --- Vertex AI Gemini list prices, USD per 1M tokens, Global-endpoint base ---
// Preisstand 2026-07. Quelle: https://cloud.google.com/vertex-ai/generative-ai/pricing
// (Gemini-3-Pro >200k-Kontext-Staffel bewusst ignoriert — Mahlzait-Prompts <200k.)
const PRICING = {
  "gemini-3.5-flash":       { in: 1.50, out: 9.00,  cached: 0.15 },
  "gemini-3-pro-preview":   { in: 2.00, out: 12.00, cached: 0.20 },
  "gemini-2.5-flash":       { in: 0.30, out: 2.50,  cached: 0.03 },
  "gemini-2.5-flash-lite":  { in: 0.10, out: 0.40,  cached: 0.01 },
  "gemini-3-flash-preview": { in: 0.50, out: 3.00,  cached: 0.05 },
};
const DEFAULT_MODEL = "gemini-3.5-flash";      // unbekanntes Modell → 3.5-flash-Sätze
const REGIONAL_MULTIPLIER = 1.0;               // Agent ruft Gemini über den GLOBAL-Endpoint (backend-agent config.py GOOGLE_CLOUD_LOCATION="global") → kein Non-Global-Aufschlag. Auf 1.10 setzen, falls je auf regionalen Endpoint gewechselt wird.
const EUR_PER_USD = 0.875;                     // Kurs ~1.14, Juli 2026
const PRICING_VERSION = "2026-07";

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

// Kosten je Modell: ((input − cached)·in + cached·cached + output·out)/1e6 · Region · EUR.
// input INKLUSIVE cached, output INKLUSIVE thinking (thinking = gleicher out-Satz, nur informativ).
function modelCostEur(rate, t) {
  const input = numOr0(t.input_tokens), cached = numOr0(t.cached_tokens), output = numOr0(t.output_tokens);
  const usd = ((input - cached) * rate.in + cached * rate.cached + output * rate.out) / 1e6;
  return usd * REGIONAL_MULTIPLIER * EUR_PER_USD;
}
// Immer über by_model rechnen (nie über Top-Level-Summen). Modell-Key "_"→"." zurückmappen.
function priceByModel(byModel) {
  const byModelOut = {};
  const unpriced = [];
  let costEur = 0;
  for (const [sk, t] of Object.entries(byModel || {})) {
    if (!t || typeof t !== "object") continue;
    const dotted = String(sk).replace(/_/g, ".");
    const rate = PRICING[dotted];
    if (!rate && !unpriced.includes(dotted)) unpriced.push(dotted);
    const c = modelCostEur(rate || PRICING[DEFAULT_MODEL], t);
    costEur += c;
    byModelOut[dotted] = {
      requests: numOr0(t.requests),
      input_tokens: numOr0(t.input_tokens),
      cached_tokens: numOr0(t.cached_tokens),
      output_tokens: numOr0(t.output_tokens),
      thinking_tokens: numOr0(t.thinking_tokens),
      cost_eur: r4(c),
    };
  }
  return { byModelOut, costEur, unpriced };
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
        // Nur was wir brauchen; by_day/by_channel/updated_at bewusst NICHT ziehen.
        select: {
          fields: ["uid", "month", "requests", "input_tokens", "cached_tokens", "output_tokens", "thinking_tokens", "by_model"]
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
  let totalCostEur = 0;
  const records = [];
  for (const d of docs) {
    if (!d.uid || !d.month) continue;
    monthsSet.add(d.month);
    const prof = profByUid.get(String(d.uid)) || emptyProfile();
    const u = createHash("sha256").update(String(d.uid)).digest("hex").slice(0, 8);
    const { byModelOut, costEur, unpriced } = priceByModel(d.by_model);
    for (const m of unpriced) unpricedAll.add(m);
    totalCostEur += costEur;
    const rec = {
      u,
      month: d.month,
      ...prof, // first_seen, platform, country, birth_year, gender, sub_type, … (cu-kompatibel)
      requests: numOr0(d.requests),
      input_tokens: numOr0(d.input_tokens),
      cached_tokens: numOr0(d.cached_tokens),
      output_tokens: numOr0(d.output_tokens),
      thinking_tokens: numOr0(d.thinking_tokens),
      cost_eur: r4(costEur),
      by_model: byModelOut,
    };
    if (unpriced.length) rec.unpriced_models = unpriced;
    records.push(rec);
  }

  const months = [...monthsSet].sort();
  const meta = {
    months,
    pricing_version: PRICING_VERSION,
    eur_per_usd: EUR_PER_USD,
    regional_multiplier: REGIONAL_MULTIPLIER,
    total_users: uids.length,
    total_cost_eur: r2(totalCostEur),
  };

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
    schema: 1,
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
    return res.json({
      bootstrapped: true,
      last_pull_ts_ms: state.last_pull_ts_ms,
      meta: state.meta || null,
      refresh_warning: state.refresh_warning || null,
      records: inflate(state),
    });
  } catch (e) {
    console.error("[ai-usage]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
