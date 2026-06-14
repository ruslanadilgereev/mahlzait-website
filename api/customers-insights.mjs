// Customer Insights — demographic analytics over the full RC customer base.
// GET  /api/customers-insights?pw=X            → cached dataset from Firestore
// GET  /api/customers-insights?pw=X&refresh=1  → pull all RC customers + attributes, save, return
//
// Auth: DASHBOARD_PASSWORD env (same as the other leaderboard endpoints).
// RC:   RC_SECRET_API_KEY env, project proj41604426.
// GCP:  GOOGLE_SA_KEY (base64 SA json) for Firestore.
// State: Firestore mytemple-460913 → `customers_insights_cache` → `state`.
//
// We pull every customer's onboarding/profile custom attributes (gender, age,
// height/weight, goal, activity, acquisition source, …) and keep ONLY
// non-PII demographic fields. Email, phone, IDFA/IDFV, IP, gps_ad_id, display
// name and click ids are never stored. The compact record set is gzipped +
// base64'd into ONE Firestore string field (`data_b64`) so it stays well under
// the 1 MB document limit even for the whole customer base (categorical data
// compresses ~10×). The handler inflates it and returns plain JSON; the
// frontend does all charting + filtering client-side.

import { google } from "googleapis";
import { gzipSync, gunzipSync } from "node:zlib";

export const config = { maxDuration: 300 }; // Pro-Plan; ~12k RC-Calls (Attrs+Subs) brauchen >60s

const GCP_PROJECT = "mytemple-460913";
const COLLECTION = "customers_insights_cache";
const DOC_ID = "state";
const DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/${COLLECTION}/${DOC_ID}`;

const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";
const RC_PAGE_LIMIT = 500;
const ENRICH_CONCURRENCY = 14;

// Onboarding/profile attributes we keep (all non-PII). `null` when not set.
// Numeric fields are parsed to numbers; everything else kept as the raw string.
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

async function fetchAllCustomerIds() {
  const out = [];
  let url = `/projects/${RC_PROJECT}/customers?limit=${RC_PAGE_LIMIT}`;
  while (url) {
    const page = await rcGet(url);
    for (const c of page.items || []) {
      out.push({
        id: c.id,
        first_seen_at: c.first_seen_at,
        platform: c.last_seen_platform || null,
        country: c.last_seen_country || null,
        app_version: c.last_seen_app_version || null,
      });
    }
    url = page.next_page;
  }
  return out;
}

// Build one compact, PII-free demographic record per customer.
async function fetchProfile(custMeta) {
  // Sequenziell (nicht Promise.all) → max. ENRICH_CONCURRENCY gleichzeitige RC-Calls
  // statt doppelt so viele; schont RCs Rate-Limit (sonst 429). maxDuration 300 deckt die Zeit.
  const attrsResp = await rcGet(`/projects/${RC_PROJECT}/customers/${custMeta.id}/attributes`);
  const subsResp = await rcGet(`/projects/${RC_PROJECT}/customers/${custMeta.id}/subscriptions`).catch(() => null);
  const a = {};
  for (const it of attrsResp.items || []) a[it.name] = it.value;

  const rec = {
    first_seen: custMeta.first_seen_at != null ? Number(custMeta.first_seen_at) : null,
    platform: custMeta.platform,
    app_version: custMeta.app_version,
    // Prefer app-detected country_code; fall back to IP-derived list country.
    country: a["country_code"] || custMeta.country || null,
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

  // Abo-Typ ableiten (für den monthly/yearly/kein-Filter). RC hat kein Perioden-
  // Feld; wir leiten die Kadenz aus dem aktuellen Abrechnungszeitraum BEZAHLTER
  // Abos ab (Trials haben eine ~7-Tage-Periode und würden sonst als "monatlich"
  // fehlklassifiziert → Trials kommen in einen eigenen Topf).
  // sub_type = AKTUELLER Abo-Status (nicht "jemals"!). Der echte RC-`status` entscheidet:
  //   trialing                         → laufender Trial
  //   active/in_grace_period/retry + bezahlt → laufendes Bezahl-Abo (Periode aus Zeitraum)
  //   sonst hatte-mal-ein-Abo          → abgelaufen (churned)
  //   gar kein Abo-Record              → kein
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
  rec.sub_type = year ? "yearly" : month ? "monthly" : trial ? "trial" : hadAny ? "expired" : "kein";

  return rec;
}

// ---------- Refresh ----------
async function doRefresh(firestore, prev) {
  const t0 = Date.now();
  const customers = await fetchAllCustomerIds();
  const tList = Date.now() - t0;

  const tEnrichStart = Date.now();
  const enriched = await pMap(customers, ENRICH_CONCURRENCY, fetchProfile);
  const tEnrich = Date.now() - tEnrichStart;

  const records = [];
  let errors = 0;
  for (const e of enriched) {
    if (!e) continue;
    if (e._error) { errors++; continue; }
    records.push(e);
  }

  const json = JSON.stringify(records);
  const b64 = gzipSync(Buffer.from(json, "utf-8")).toString("base64");

  // Firestore caps a document at ~1,048,576 bytes; data_b64 is base64 ASCII so byte ≈ length.
  // Fail loud well before the cap instead of an opaque patch rejection inside saveState.
  const MAX_B64_BYTES = 900 * 1024;
  if (b64.length > MAX_B64_BYTES) {
    throw new Error(`customers-insights: data_b64 ${Math.round(b64.length / 1024)} KB überschreitet ${Math.round(MAX_B64_BYTES / 1024)} KB Guard (${records.length} Records) — Firestore-1-MB-Limit naht, Blob muss gesplittet werden.`);
  }

  // Einen bekannt-guten Cache nicht mit einem leeren / stark degradierten Pull überschreiben.
  const errorRatio = customers.length > 0 ? errors / customers.length : 1;
  if (prev && prev.total_customers > 0) {
    const tooFew = records.length === 0 || records.length < prev.total_customers * 0.5;
    const tooManyErrors = errorRatio > 0.2;
    if (tooFew || tooManyErrors) {
      return {
        ...prev,
        refresh_warning: `Pull verworfen: ${records.length}/${customers.length} Records, ${errors} Fehler (${(errorRatio * 100).toFixed(0)}%). Vorheriger Cache behalten.`,
      };
    }
  }

  const state = {
    last_pull_ts_ms: Date.now(),
    schema: 1,
    total_customers: records.length,
    data_b64: b64,
    last_refresh_meta: {
      ms_total: Date.now() - t0,
      ms_list: tList,
      ms_enrich: tEnrich,
      total_seen: customers.length,
      records: records.length,
      enrich_errors: errors,
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
      total_customers: state.total_customers,
      meta: state.last_refresh_meta || null,
      refresh_warning: state.refresh_warning || null,
      customers: inflate(state),
    });
  } catch (e) {
    console.error("[customers-insights]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
