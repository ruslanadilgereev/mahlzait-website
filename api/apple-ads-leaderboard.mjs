// Apple Search Ads × RevenueCat Leaderboard.
// GET  /api/apple-ads-leaderboard?pw=X            → cached state from Firestore
// GET  /api/apple-ads-leaderboard?pw=X&refresh=1  → pull ASA + RC, save, return
//
// Auth: DASHBOARD_PASSWORD env (same as /api/leaderboard).
// ASA:  ASA_CLIENT_ID + ASA_TEAM_ID + ASA_KEY_ID + ASA_ORG_ID + ASA_PRIVATE_KEY_PEM_B64
//       Auth flow: JWT ES256 client-assertion → POST appleid.apple.com/auth/oauth2/token
//       → access_token (1h) → bearer + X-AP-Context: orgId=...
// RC:   RC_SECRET_API_KEY env, project proj41604426
// State: Firestore mytemple-460913 → `apple_ads_leaderboard_cache` → `state`
//
// State schema:
//   {
//     last_pull_ts_ms,
//     currency: "EUR",
//     spend_history_from: "YYYY-MM-DD",   // earliest day in daily spend buckets
//     campaigns: [{ id, name, status, daily: [{date, spend, taps, installs}] }],
//     customers_by_campaign: { <campaign_name | "(no_campaign)">: [{ id, country, first_seen_at, subs: [...] }] },
//     last_refresh_meta: {...}
//   }
//
// Frontend filters by date client-side: spend (daily.date in range) +
// revenue (sub.starts_at in range) per campaign-name.

import { google } from "googleapis";
import { SignJWT } from "jose";
import { createPrivateKey } from "node:crypto";

export const config = { maxDuration: 60 };

const GCP_PROJECT = "mytemple-460913";
const COLLECTION = "apple_ads_leaderboard_cache";
const DOC_ID = "state";
const DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/${COLLECTION}/${DOC_ID}`;

const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";
const RC_PAGE_LIMIT = 500;
const ENRICH_CONCURRENCY = 12;

const ASA_BASE = "https://api.searchads.apple.com/api/v5";
const ASA_TOKEN_URL = "https://appleid.apple.com/auth/oauth2/token";
const ASA_AUD = "https://appleid.apple.com";

// How far back we pull spend history on each refresh.
// Apple's DAILY granularity is capped at 90 days (INVALID_INPUT otherwise).
// For longer windows we'd need WEEKLY + bucket-merge — not yet needed.
const SPEND_LOOKBACK_DAYS = 90;

// ---------- Firestore typed-value codec (mirror of api/leaderboard.mjs) ----------
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

// ---------- ASA auth: JWT client-assertion → OAuth access_token ----------
let cachedAsaToken = null;
let cachedAsaTokenExp = 0;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} env missing`);
  return v;
}

async function getAsaAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAsaToken && cachedAsaTokenExp - now > 60) return cachedAsaToken;

  const teamId = requireEnv("ASA_TEAM_ID");
  const clientId = requireEnv("ASA_CLIENT_ID");
  const keyId = requireEnv("ASA_KEY_ID");
  const pemB64 = requireEnv("ASA_PRIVATE_KEY_PEM_B64");
  const pem = Buffer.from(pemB64, "base64").toString("utf-8");
  // Apple ships keys as SEC1 (-----BEGIN EC PRIVATE KEY-----); jose's
  // importPKCS8 only accepts PKCS#8. Node's crypto auto-detects the format
  // and the resulting KeyObject is accepted by jose's sign().
  const privateKey = createPrivateKey({ key: pem, format: "pem" });

  // ASA JWT spec: iss = teamId, sub = clientId, aud = appleid.apple.com,
  // alg = ES256, kid in header. Max exp = 180 days; we use 1h.
  const clientAssertion = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId, typ: "JWT" })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience(ASA_AUD)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientAssertion,
    scope: "searchadsorg",
  });
  const r = await fetch(ASA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Host: "appleid.apple.com" },
    body: body.toString(),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`ASA token exchange failed: ${r.status} ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  cachedAsaToken = j.access_token;
  cachedAsaTokenExp = now + (j.expires_in || 3600);
  return cachedAsaToken;
}

async function asaCall(method, path, body) {
  const token = await getAsaAccessToken();
  const orgId = requireEnv("ASA_ORG_ID");
  const url = `${ASA_BASE}${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-AP-Context": `orgId=${orgId}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`ASA ${method} ${path} → ${r.status}: ${t.slice(0, 400)}`);
  }
  return await r.json();
}

// ---------- ASA data pulls ----------
function ymd(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

async function fetchAsaCampaigns() {
  // GET /campaigns lists all campaigns regardless of status. Paginated.
  const out = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const j = await asaCall("GET", `/campaigns?limit=${limit}&offset=${offset}`);
    for (const c of j.data || []) {
      out.push({
        id: String(c.id),
        name: c.name,
        status: c.status,                          // ENABLED | PAUSED
        display_status: c.displayStatus,           // RUNNING | ON_HOLD | DELETED | ...
        budget_eur: ((c.budgetAmount || {}).amount) ? Number(c.budgetAmount.amount) : null,
        daily_budget_eur: ((c.dailyBudgetAmount || {}).amount) ? Number(c.dailyBudgetAmount.amount) : null,
      });
    }
    if (!j.data || j.data.length < limit) break;
    offset += limit;
  }
  return out;
}

async function fetchAsaDailySpend(startYmd, endYmd) {
  // POST /reports/campaigns gets all campaigns with DAILY granularity in one shot.
  // We pull one report covering the full lookback range. Apple returns rows
  // keyed by campaignId, each with a `granularity` array of daily metrics.
  const body = {
    startTime: startYmd,
    endTime: endYmd,
    selector: {
      orderBy: [{ field: "campaignId", sortOrder: "ASCENDING" }],
      pagination: { offset: 0, limit: 1000 },
    },
    timeZone: "UTC",
    returnRecordsWithNoMetrics: false,
    returnRowTotals: false,
    returnGrandTotals: false,
    granularity: "DAILY",
  };
  const j = await asaCall("POST", "/reports/campaigns", body);
  const rows = j?.data?.reportingDataResponse?.row || [];
  const out = {};
  for (const row of rows) {
    const cid = String(row.metadata?.campaignId);
    if (!cid) continue;
    const daily = [];
    for (const g of row.granularity || []) {
      // Apple nests metrics under `other.default` (segmented) or `total`
      // (unsegmented); some shapes also flat on `g`. Read defensively.
      const m = g.other?.default || g.total || g;
      const date = (g.date || m.date || "").slice(0, 10);
      const spend = Number(m.localSpend?.amount ?? g.localSpend?.amount ?? 0);
      const taps = Number(m.taps ?? g.taps ?? 0);
      const installs = Number(
        m.installs ?? m.newDownloads ?? g.installs ?? g.newDownloads ?? 0
      );
      if (spend === 0 && taps === 0 && installs === 0) continue;
      daily.push({ date, spend, taps, installs });
    }
    out[cid] = daily;
  }
  return out;
}

// ---------- RC pulls (paginated + concurrent enrichment) ----------
async function rcGet(path, retries = 3) {
  const key = requireEnv("RC_SECRET_API_KEY");
  const url = path.startsWith("http") ? path : `${RC_BASE}${path}`;
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      });
      if (r.status === 429 || (r.status >= 500 && r.status < 600)) {
        await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt)));
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
      if (attempt < retries - 1) await new Promise((res) => setTimeout(res, 500 * Math.pow(2, attempt)));
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

// Returns null if customer is not ASA-attributed; otherwise classification.
async function classifyAsaCustomer(custMeta) {
  const attrsResp = await rcGet(`/projects/${RC_PROJECT}/customers/${custMeta.id}/attributes`);
  const attrs = {};
  for (const it of attrsResp.items || []) attrs[it.name] = it.value;
  if (attrs["$mediaSource"] !== "Apple Search Ads") return null;

  const subsResp = await rcGet(`/projects/${RC_PROJECT}/customers/${custMeta.id}/subscriptions`);
  const subs = (subsResp.items || []).map((s) => {
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
  return {
    id: custMeta.id,
    country: custMeta.country || null,
    first_seen_at: custMeta.first_seen_at || null,
    last_seen_at: custMeta.last_seen_at || null,
    campaign: attrs["$campaign"] || null,
    ad_group: attrs["$adGroup"] || null,
    keyword: attrs["$keyword"] || null,
    subs,
  };
}

// ---------- Refresh ----------
async function doRefresh(firestore) {
  const t0 = Date.now();

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - SPEND_LOOKBACK_DAYS * 24 * 3600 * 1000);
  const startYmd = ymd(startDate);
  const endYmd = ymd(endDate);

  // ASA in parallel with RC list
  const [campaigns, dailyByCampaign, customers] = await Promise.all([
    fetchAsaCampaigns(),
    fetchAsaDailySpend(startYmd, endYmd),
    fetchAllCustomerIds(),
  ]);
  const tAsa = Date.now() - t0;

  // Merge campaign + daily
  const campaignsOut = campaigns.map((c) => ({
    ...c,
    daily: dailyByCampaign[c.id] || [],
  }));

  // Enrich every customer → keep only ASA-attributed ones.
  // (We can't filter by attribute server-side in RC v2.)
  const tEnrichStart = Date.now();
  const enriched = await pMap(customers, ENRICH_CONCURRENCY, classifyAsaCustomer);
  const tEnrich = Date.now() - tEnrichStart;

  // Group by campaign-name (or "(no_campaign)" when ASA but no $campaign attr)
  const byCampaign = {};
  let asaCount = 0;
  for (const e of enriched) {
    if (!e || e._error) continue;
    asaCount++;
    const key = e.campaign || "(no_campaign)";
    (byCampaign[key] = byCampaign[key] || []).push(e);
  }

  const state = {
    last_pull_ts_ms: Date.now(),
    currency: "EUR",
    spend_history_from: startYmd,
    spend_history_to: endYmd,
    campaigns: campaignsOut,
    customers_by_campaign: byCampaign,
    last_refresh_meta: {
      ms_total: Date.now() - t0,
      ms_asa: tAsa,
      ms_rc_enrich: tEnrich,
      total_customers: customers.length,
      asa_customers: asaCount,
      asa_campaigns: campaignsOut.length,
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
      state = await doRefresh(firestore);
    } else if (!state) {
      return res.json({
        bootstrapped: false,
        hint: "Noch kein State. Klicke Aktualisieren, um den ersten Pull anzustossen (kann 60s dauern).",
      });
    }
    return res.json({ bootstrapped: true, ...state });
  } catch (e) {
    console.error("[apple-ads-leaderboard]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
