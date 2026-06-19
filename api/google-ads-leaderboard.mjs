// Google Ads × RevenueCat Leaderboard.
// GET  /api/google-ads-leaderboard?pw=X            → cached state from Firestore
// GET  /api/google-ads-leaderboard?pw=X&refresh=1  → pull Google Ads + RC, save, return
//
// Auth: DASHBOARD_PASSWORD env (same as /api/leaderboard).
// Google Ads (REST, no npm client — mirrors the ASA JWT approach):
//   GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET,
//   GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_LOGIN_CUSTOMER_ID, GOOGLE_ADS_CUSTOMER_ID
//   Auth flow: refresh_token → POST oauth2.googleapis.com/token → access_token (1h)
//   Data: POST googleads.googleapis.com/v21/customers/<cid>/googleAds:searchStream (GAQL)
// RC:   RC_SECRET_API_KEY env, project proj41604426
// GCP:  GOOGLE_SA_KEY (base64 SA json) for Firestore — same key the ASA board uses.
// State: Firestore mytemple-460913 → `google_ads_leaderboard_cache` → `state`
//
// ── Attribution model (DIFFERS from Apple) ─────────────────────────────────
// Google does NOT flow into RC `$mediaSource` ("Google Ads" never appears).
// Instead the Flutter app reads the Android Play Install Referrer and writes the
// Google click ids (gclid / gbraid / wbraid) as RC custom attributes — but ONLY
// when the referrer actually carries one (subscription_service.dart:629-638).
// So: a customer with a non-empty gclid/gbraid/wbraid attribute came determin-
// istically from a Google Ads click. We treat ALL such customers as ONE
// consolidated cohort ("gclid-Kohorte"), because gclid→campaign reverse-lookup
// (click_view, 90d) is not needed while only one Google campaign runs.
// CAVEAT: gclid attribution is Android-only (Play Install Referrer). iOS Google
// Ads spend would show without matching RC conversions — surface that in the UI.

import { google } from "googleapis";

export const config = { maxDuration: 300 }; // Pro; RC-Enrichment + 429-Retries brauchen unter Last >60s

const GCP_PROJECT = "mytemple-460913";
const COLLECTION = "google_ads_leaderboard_cache";
const DOC_ID = "state";
const DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/${COLLECTION}/${DOC_ID}`;

const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";
const RC_PAGE_LIMIT = 500;
const ENRICH_CONCURRENCY = 12;

const GADS_API_VERSION = "v21";
const GADS_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GADS_BASE = `https://googleads.googleapis.com/${GADS_API_VERSION}`;

// Google's DAILY spend history; mirrors ASA's 90-day window so the two boards
// share the same client-side date presets.
const SPEND_LOOKBACK_DAYS = 90;

// ---------- Firestore typed-value codec (mirror of api/apple-ads-leaderboard.mjs) ----------
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
// Google Ads customer IDs must be the bare 10-digit form in URLs/headers; a
// dashed paste (123-456-7890, the form the Google UI shows) yields INVALID_CUSTOMER_ID.
function requireCustomerId(name) {
  return requireEnv(name).replace(/[^0-9]/g, "");
}

// ---------- Google Ads auth: refresh_token → OAuth access_token ----------
let cachedGadsToken = null;
let cachedGadsTokenExp = 0;

async function getGadsAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedGadsToken && cachedGadsTokenExp - now > 60) return cachedGadsToken;

  const body = new URLSearchParams({
    client_id: requireEnv("GOOGLE_ADS_CLIENT_ID"),
    client_secret: requireEnv("GOOGLE_ADS_CLIENT_SECRET"),
    refresh_token: requireEnv("GOOGLE_ADS_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });
  const r = await fetch(GADS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Google Ads token exchange failed: ${r.status} ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  cachedGadsToken = j.access_token;
  cachedGadsTokenExp = now + (j.expires_in || 3600);
  return cachedGadsToken;
}

// GAQL via the REST searchStream endpoint. The response is an ARRAY of batches,
// each `{ results: [...] }`. Metric/field names come back camelCased.
async function gaqlSearch(query) {
  const token = await getGadsAccessToken();
  const cid = requireCustomerId("GOOGLE_ADS_CUSTOMER_ID");
  const url = `${GADS_BASE}/customers/${cid}/googleAds:searchStream`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "developer-token": requireEnv("GOOGLE_ADS_DEVELOPER_TOKEN"),
      "login-customer-id": requireCustomerId("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Google Ads searchStream → ${r.status}: ${t.slice(0, 400)}`);
  }
  const j = await r.json();
  const batches = Array.isArray(j) ? j : [j];
  const rows = [];
  for (const b of batches) for (const row of b.results || []) rows.push(row);
  return rows;
}

// ---------- Google Ads data pulls ----------
function ymd(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// One GAQL query returns both campaign meta AND daily spend. We split it into
// campaign-meta (id/name/status/type) + per-campaign daily buckets.
async function fetchGoogleCampaignsWithSpend(startYmd, endYmd) {
  const rows = await gaqlSearch(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      segments.date,
      metrics.cost_micros,
      metrics.clicks,
      metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startYmd}' AND '${endYmd}'
    ORDER BY campaign.id
  `);

  const byId = new Map();
  for (const row of rows) {
    const c = row.campaign || {};
    const id = String(c.id);
    if (!id) continue;
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name: c.name || "(unnamed)",
        status: c.status || null,                       // ENABLED | PAUSED | REMOVED
        channel_type: c.advertisingChannelType || null, // MULTI_CHANNEL (App), SEARCH, ...
        daily: [],
      });
    }
    const m = row.metrics || {};
    const date = (row.segments?.date || "").slice(0, 10);
    const spend = Number(m.costMicros ?? 0) / 1_000_000; // account currency = EUR
    const clicks = Number(m.clicks ?? 0);
    const conversions = Number(m.conversions ?? 0);
    if (spend === 0 && clicks === 0 && conversions === 0) continue;
    byId.get(id).daily.push({ date, spend, clicks, conversions });
  }

  // A campaign with status ENABLED but zero spend rows in the window is still
  // worth listing (so the "nur aktive" toggle has something to show); pull the
  // full campaign list once to capture those, then merge.
  const metaRows = await gaqlSearch(`
    SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type
    FROM campaign
  `);
  for (const row of metaRows) {
    const c = row.campaign || {};
    const id = String(c.id);
    if (!id || byId.has(id)) continue;
    byId.set(id, {
      id,
      name: c.name || "(unnamed)",
      status: c.status || null,
      channel_type: c.advertisingChannelType || null,
      daily: [],
    });
  }

  return Array.from(byId.values());
}

// ---------- RC pulls (paginated + concurrent enrichment) ----------
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
        last_seen_at: c.last_seen_at,
        country: c.last_seen_country,
        platform: c.last_seen_platform,
      });
    }
    url = page.next_page;
  }
  return out;
}

async function fetchGoogleSubs(cid) {
  const subsResp = await rcGet(`/projects/${RC_PROJECT}/customers/${cid}/subscriptions`);
  return (subsResp.items || []).map((s) => {
    const rev = s.total_revenue_in_usd || {};
    return {
      status: s.status,
      ownership: s.ownership,
      store: s.store,
      product_id: s.product_id,
      starts_at: s.starts_at,
      current_period_starts_at: s.current_period_starts_at,
      ends_at: s.ends_at,
      auto_renewal_status: s.auto_renewal_status,
      gross_usd: rev.gross || 0,
      proceeds_usd: rev.proceeds || 0,
    };
  });
}

// Returns null if the customer carries no Google click id; otherwise the
// classified Google-clicked customer with subscriptions.
async function classifyGoogleCustomer(custMeta) {
  const attrsResp = await rcGet(`/projects/${RC_PROJECT}/customers/${custMeta.id}/attributes`);
  const attrs = {};
  for (const it of attrsResp.items || []) attrs[it.name] = it.value;

  const gclid = (attrs["gclid"] || "").trim();
  const gbraid = (attrs["gbraid"] || "").trim();
  const wbraid = (attrs["wbraid"] || "").trim();
  if (!gclid && !gbraid && !wbraid) return null; // not Google-attributed

  const subs = await fetchGoogleSubs(custMeta.id);
  return {
    id: custMeta.id,
    country: custMeta.country || null,
    platform: custMeta.platform || null,
    first_seen_at: custMeta.first_seen_at || null,
    last_seen_at: custMeta.last_seen_at || null,
    gclid: gclid || null,    // kept for future click-id→campaign reverse-lookup (click_view)
    gbraid: gbraid || null,
    wbraid: wbraid || null,
    utm_medium: attrs["utm_medium"] || null,
    subs,
  };
}

// ---------- Refresh ----------
// Diff-strategy (mirror of api/leaderboard.mjs): RC v2 has no created_after
// filter on the customers list, so we still page the full list (cheap, metadata
// only). The expensive part is the 2 per-customer RC calls (attributes + subs).
// We avoid re-doing those for everyone:
//   • new UIDs (never seen)        → full classify (attributes + subs)
//   • known Google customers       → re-pull subs only (Renewals/Trial→Paid)
//   • seen-but-not-Google          → skip — gclid/gbraid is install-time, immutable
// Errored new UIDs are NOT marked seen, so a transient RC 429 retries next pull.
async function doRefresh(firestore, prev) {
  const t0 = Date.now();

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - SPEND_LOOKBACK_DAYS * 24 * 3600 * 1000);
  const startYmd = ymd(startDate);
  const endYmd = ymd(endDate);

  const [campaigns, customers] = await Promise.all([
    fetchGoogleCampaignsWithSpend(startYmd, endYmd),
    fetchAllCustomerIds(),
  ]);
  const tGads = Date.now() - t0;

  // Diff bookkeeping from prev state.
  const seenUids = new Set(prev?.seen_uids || []);
  const knownGoogle = new Map(); // id → stored Google customer (attribution is immutable)
  for (const c of prev?.google_customers || []) knownGoogle.set(c.id, c);

  const newOnes = [];   // unseen → classify (attributes + subs)
  const knownOnes = [];  // known Google → re-pull subs only
  for (const c of customers) {
    if (knownGoogle.has(c.id)) knownOnes.push(c);
    else if (!seenUids.has(c.id)) newOnes.push(c);
    // seen but not Google-attributed → skip
  }

  const tEnrichStart = Date.now();
  const [newResults, knownResults] = await Promise.all([
    pMap(newOnes, ENRICH_CONCURRENCY, classifyGoogleCustomer),
    pMap(knownOnes, ENRICH_CONCURRENCY, async (c) => {
      const prevC = knownGoogle.get(c.id);
      const subs = await fetchGoogleSubs(c.id);
      return {
        ...prevC,
        country: c.country ?? prevC.country,
        last_seen_at: c.last_seen_at ?? prevC.last_seen_at,
        subs,
      };
    }),
  ]);
  const tEnrich = Date.now() - tEnrichStart;

  // Rebuild Google customer map: start from refreshed known, add new hits.
  const byId = new Map();
  let enrichErrors = 0;
  for (let i = 0; i < knownResults.length; i++) {
    const r = knownResults[i];
    const c = knownOnes[i];
    // On subs-error keep the stale stored customer rather than dropping it.
    if (r && r._error) enrichErrors++;
    byId.set(c.id, r && !r._error ? r : knownGoogle.get(c.id));
  }
  for (let i = 0; i < newResults.length; i++) {
    const r = newResults[i];
    const c = newOnes[i];
    if (r && r._error) { enrichErrors++; continue; } // transient → retry next refresh
    seenUids.add(c.id);                              // checked (null=non-Google or object=Google)
    if (r) byId.set(r.id, r);
  }
  const googleCustomers = Array.from(byId.values()).filter(Boolean);

  const state = {
    last_pull_ts_ms: Date.now(),
    currency: "EUR",
    spend_history_from: startYmd,
    spend_history_to: endYmd,
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID || null,
    campaigns,
    google_customers: googleCustomers,
    seen_uids: Array.from(seenUids),
    last_refresh_meta: {
      ms_total: Date.now() - t0,
      ms_gads: tGads,
      ms_rc_enrich: tEnrich,
      total_customers: customers.length,
      new_enriched: newOnes.length,
      known_refreshed: knownOnes.length,
      google_customers: googleCustomers.length,
      enrich_errors: enrichErrors, // >0 = degradierter Pull (RC-Fehler), Daten evtl. unvollständig
      campaigns: campaigns.length,
    },
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

    let state = await loadState(firestore);
    if (refresh) {
      state = await doRefresh(firestore, state);
    } else if (!state) {
      return res.json({
        bootstrapped: false,
        hint: "Noch kein State. Klicke Aktualisieren, um den ersten Pull anzustossen (kann 60s dauern).",
      });
    }
    return res.json({ bootstrapped: true, ...state });
  } catch (e) {
    console.error("[google-ads-leaderboard]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
