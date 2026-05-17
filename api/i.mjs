// Influencer-Hub (read-only slice of the leaderboard state).
//
// GET /api/i?t=<token>
//   - looks up token in Firestore state.token_to_code
//   - returns ONLY the slice for that one code:
//       { code, influencer, last_pull_ts_ms, holders: [{ first_seen_at, country, subs: [...] }] }
//   - 404 on unknown / missing token
//
// No RC pull here. Pure read-only Firestore. Cheap + fast (< 1s).
// Token writes (create / rotate) happen in scripts/grant_leaderboard_token.py
// and in api/leaderboard.mjs::doRefresh (auto-mint for new codes).

import { google } from "googleapis";

export const config = { maxDuration: 10 };

const GCP_PROJECT = "mytemple-460913";
const COLLECTION = "referral_leaderboard_cache";
const DOC_ID = "state";
const DOC_PATH = `projects/${GCP_PROJECT}/databases/(default)/documents/${COLLECTION}/${DOC_ID}`;

// Hardcoded discount info; all active influencer codes today share the same
// 25% yearly discount (ref10 SKU: 29.99 EUR vs 39.99 EUR full).
// If per-code discounts ever appear, key this off state.code_discounts[<CODE>].
const DISCOUNT_DEFAULT = {
  pct: 25,
  yearly_full_eur: 39.99,
  yearly_discounted_eur: 29.99,
};

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

// ---------- Firestore typed value decoding (mirrors leaderboard.mjs) ----------
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
function decodeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) out[k] = decodeValue(v);
  return out;
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

export default async function handler(req, res) {
  try {
    const token = String(req.query?.t || "").trim();
    if (!token || token.length < 4 || token.length > 32 || !/^[A-Za-z0-9_-]+$/.test(token)) {
      return res.status(400).json({ error: "invalid_token" });
    }

    const auth = getAuth();
    const firestore = google.firestore({ version: "v1", auth });
    const state = await loadState(firestore);
    if (!state) return res.status(404).json({ error: "not_initialized" });

    const tokenToCode = state.token_to_code || {};
    const code = tokenToCode[token];
    if (!code) return res.status(404).json({ error: "unknown_token" });

    // Build slice for this one code
    const holders = [];
    let influencer = null;
    for (const h of Object.values(state.holders || {})) {
      if (h.code !== code) continue;
      holders.push({
        first_seen_at: h.first_seen_at || null,
        country: h.country || null,
        subs: (h.subs || []).map((s) => ({
          starts_at: s.starts_at || null,
          current_period_starts_at: s.current_period_starts_at || null,
          ownership: s.ownership || null,
          gross: Number(s.gross || 0),
        })),
      });
      if (h.influencer && !influencer) influencer = h.influencer;
    }

    res.setHeader("Cache-Control", "private, max-age=30");
    return res.json({
      code,
      influencer,
      last_pull_ts_ms: state.last_pull_ts_ms || null,
      holders,
      discount: DISCOUNT_DEFAULT,
    });
  } catch (e) {
    console.error("[i]", e?.message, e?.stack?.slice(0, 400));
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
