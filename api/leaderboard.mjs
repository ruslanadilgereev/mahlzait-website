// Referral-Code Leaderboard.
// GET  /api/leaderboard?pw=X            → returns cached state from Firestore
// GET  /api/leaderboard?pw=X&refresh=1  → diff-pull from RC + saves new state
//
// Auth: DASHBOARD_PASSWORD env var (shared with /api/dashboard).
// RC:   RC_SECRET_API_KEY env var (sk_…), project proj41604426.
// State: Firestore mytemple-460913 → collection `referral_leaderboard_cache` → doc `state`.
//
// Diff-strategy: RC v2 has no created_after filter on customers list. We cache
//   `seen_uids` and only enrich newly-discovered ones, plus we re-pull subscriptions
//   for all known holders so trial→paid transitions show up on refresh.

import { google } from "googleapis";

export const config = { maxDuration: 60 };

const GCP_PROJECT = "mytemple-460913";
const COLLECTION = "referral_leaderboard_cache";
const DOC_ID = "state";
const RC_PROJECT = "proj41604426";
const RC_BASE = "https://api.revenuecat.com/v2";
const RC_PAGE_LIMIT = 500;
const ENRICH_CONCURRENCY = 12;

const DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/${COLLECTION}/${DOC_ID}`;
const DOC_PARENT = `projects/${GCP_PROJECT}/databases/(default)/documents`;

let cachedAuth = null;
function getAuth() {
  if (cachedAuth) return cachedAuth;
  if (!process.env.GOOGLE_SA_KEY) throw new Error("GOOGLE_SA_KEY env missing");
  const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf-8"));
  cachedAuth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
  return cachedAuth;
}

// ---------- Firestore typed value encoding ----------
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

// ---------- Firestore state I/O ----------
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

// ---------- RC v2 client ----------
async function rcGet(path, retries = 3) {
  const key = process.env.RC_SECRET_API_KEY;
  if (!key) throw new Error("RC_SECRET_API_KEY env missing");
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

async function fetchAllCustomerIds() {
  // Returns array of {id, first_seen_at, last_seen_at, country, platform, app_version}
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
        app_version: c.last_seen_app_version,
      });
    }
    url = page.next_page;
  }
  return out;
}

async function fetchAttrs(cid) {
  const r = await rcGet(`/projects/${RC_PROJECT}/customers/${cid}/attributes`);
  const out = {};
  for (const it of r.items || []) out[it.name] = it.value;
  return out;
}
async function fetchSubs(cid) {
  const r = await rcGet(`/projects/${RC_PROJECT}/customers/${cid}/subscriptions`);
  return (r.items || []).map((s) => {
    const rev = s.total_revenue_in_usd || {};
    return {
      status: s.status,
      ownership: s.ownership,
      store: s.store,
      product_id: s.product_id,
      starts_at: s.starts_at,
      current_period_starts_at: s.current_period_starts_at,
      current_period_ends_at: s.current_period_ends_at,
      ends_at: s.ends_at,
      auto_renewal_status: s.auto_renewal_status,
      gross: rev.gross || 0,
      proceeds: rev.proceeds || 0,
    };
  });
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

// ---------- Holder classification ----------
// A holder is anyone with attribute `referral_code` set.
// We classify their subs lifetime-style:
//   ever_trial = any sub where is_trial heuristic true
//   ever_paid  = any sub where gross > 0
async function classifyOne(custMeta) {
  const attrs = await fetchAttrs(custMeta.id);
  const code = attrs.referral_code;
  if (!code) return { id: custMeta.id, holder: false };
  const subs = await fetchSubs(custMeta.id);
  return {
    id: custMeta.id,
    holder: true,
    code: String(code).toUpperCase(),
    tier: attrs.referral_offer_tier || null,
    influencer: attrs.referral_influencer || null,
    email: attrs.$email || null,
    country: custMeta.country || null,
    platform: custMeta.platform || null,
    first_seen_at: custMeta.first_seen_at || null,
    last_seen_at: custMeta.last_seen_at || null,
    subs,
  };
}

// ---------- Aggregation ----------
function aggregate(holders) {
  // Group by code; per code count total + lifetime trial + lifetime paid.
  // Also expose subs for client-side date filtering.
  const byCode = {};
  for (const h of Object.values(holders)) {
    const code = h.code;
    if (!byCode[code]) {
      byCode[code] = {
        code,
        tier: h.tier,
        influencer: h.influencer,
        holders: [],
      };
    }
    byCode[code].holders.push({
      id: h.id,
      email: h.email,
      country: h.country,
      platform: h.platform,
      first_seen_at: h.first_seen_at,
      subs: h.subs || [],
    });
  }
  return Object.values(byCode).sort((a, b) => a.code.localeCompare(b.code));
}

// ---------- Refresh routine ----------
async function doRefresh(firestore, prev) {
  const t0 = Date.now();
  const prevHolders = prev?.holders || {};
  const seenUids = new Set(prev?.seen_uids || []);

  const customers = await fetchAllCustomerIds();
  const tCustomers = Date.now() - t0;

  // Identify which UIDs need enrichment:
  //   (a) unseen UIDs                         → never enriched
  //   (b) known holders                       → re-pull subs for status updates
  //   (c) active since last pull (last_seen_at > last_pull_ts_ms)
  //                                          → bestehende customer könnte ERST JETZT
  //                                            den Code in Profile-Tab eingegeben haben
  const lastPullMs = prev?.last_pull_ts_ms || 0;
  const toEnrich = [];
  const newUids = [];
  for (const c of customers) {
    if (!seenUids.has(c.id)) {
      toEnrich.push(c);
      newUids.push(c.id);
    } else if (prevHolders[c.id]) {
      toEnrich.push(c);
    } else if (c.last_seen_at && c.last_seen_at > lastPullMs) {
      toEnrich.push(c);
    }
  }

  const tBeforeEnrich = Date.now();
  const enriched = await pMap(toEnrich, ENRICH_CONCURRENCY, classifyOne);
  const tEnrich = Date.now() - tBeforeEnrich;

  // Build new holders map (existing untouched ones survive)
  const holders = { ...prevHolders };
  let dropped = 0, added = 0, updated = 0;
  for (const r of enriched) {
    if (!r || r._error) continue;
    if (r.holder) {
      if (holders[r.id]) updated++;
      else added++;
      const { id, holder, ...rest } = r;
      holders[id] = rest;
    } else if (holders[r.id]) {
      // someone lost their code (manual RC delete?) — drop
      delete holders[r.id];
      dropped++;
    }
  }

  // Merge seen_uids
  for (const c of customers) seenUids.add(c.id);

  const newState = {
    last_pull_ts_ms: Date.now(),
    seen_uids: Array.from(seenUids),
    holders,
    last_refresh_meta: {
      ms_total: Date.now() - t0,
      ms_customer_list: tCustomers,
      ms_enrich: tEnrich,
      total_customers: customers.length,
      new_uids: newUids.length,
      holders_count: Object.keys(holders).length,
      added,
      updated,
      dropped,
    },
  };

  await saveState(firestore, newState);
  return newState;
}

// ---------- HTTP handler ----------
export default async function handler(req, res) {
  try {
    const pw = req.query?.pw || "";
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const refresh = req.query?.refresh === "1";

    const auth = getAuth();
    const firestore = google.firestore({ version: "v1", auth });

    let state = await loadState(firestore);
    if (refresh) {
      state = await doRefresh(firestore, state);
    } else if (!state) {
      // No state yet → user must explicitly refresh first
      return res.json({
        bootstrapped: false,
        hint: "Noch kein State. Klicke Aktualisieren, um den ersten Pull anzustoßen (kann 30-60s dauern).",
      });
    }

    const codes = aggregate(state.holders || {});
    return res.json({
      bootstrapped: true,
      last_pull_ts_ms: state.last_pull_ts_ms,
      meta: state.last_refresh_meta || null,
      total_customers_seen: (state.seen_uids || []).length,
      total_holders: Object.keys(state.holders || {}).length,
      codes,
    });
  } catch (e) {
    console.error("[leaderboard]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
