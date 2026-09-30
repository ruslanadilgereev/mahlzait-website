// Der Google-Ads-Tab muss die Kampagnen aus BEIDEN Werbekonten holen: bis
// 17.08.2026 lief alles auf dem alten Konto, seit 18.08. auf "Mahlzait2".
// Google Ads, OAuth und RevenueCat werden ueber ein nachgebautes fetch bedient.
// Ausfuehren: node --test test/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { doRefresh } from "../api/google-ads-leaderboard.mjs";

const OLD = { cid: "3583858609", rt: "rt-alt" };
const NEW = { cid: "2347665996", rt: "rt-mahlzait2" };

Object.assign(process.env, {
  GOOGLE_ADS_DEVELOPER_TOKEN: "dev",
  GOOGLE_ADS_CLIENT_ID: "client",
  GOOGLE_ADS_CLIENT_SECRET: "secret",
  GOOGLE_ADS_REFRESH_TOKEN: OLD.rt,
  GOOGLE_ADS_CUSTOMER_ID: OLD.cid,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: OLD.cid,
  GOOGLE_ADS_REFRESH_TOKEN_2: NEW.rt,
  GOOGLE_ADS_CUSTOMER_ID_2: NEW.cid,
  RC_SECRET_API_KEY: "rc",
});

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// Jedes Konto antwortet nur mit dem Zugriffstoken seines eigenen Logins, wie echt.
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.startsWith("https://oauth2.googleapis.com/token")) {
    const rt = new URLSearchParams(opts.body).get("refresh_token");
    return json({ access_token: `at:${rt}`, expires_in: 3600 });
  }
  const m = url.match(/\/customers\/(\d+)\/googleAds:searchStream$/);
  if (m) {
    const acc = [OLD, NEW].find((a) => a.cid === m[1]);
    if (!acc || opts.headers.Authorization !== `Bearer at:${acc.rt}`) {
      return json([{ error: { code: 403, status: "PERMISSION_DENIED" } }], 403);
    }
    const campaign = { id: `${acc.cid}01`, name: `Kampagne ${acc.cid}`, status: "ENABLED", advertisingChannelType: "MULTI_CHANNEL" };
    const withSpend = JSON.parse(opts.body).query.includes("segments.date");
    const rows = withSpend
      ? [{ campaign, segments: { date: "2026-09-01" }, metrics: { costMicros: "12500000", clicks: "4", conversions: 1 } }]
      : [{ campaign }];
    return json([{ results: rows }]);
  }
  if (url.includes("api.revenuecat.com")) return json({ items: [], next_page: null });
  throw new Error(`unerwarteter Aufruf: ${url}`);
};

const fakeFirestore = () => ({
  projects: { databases: { documents: { commit: async () => ({ data: {} }) } } },
});

test("Refresh holt die Kampagnen aus altem Konto UND Mahlzait2", async () => {
  const state = await doRefresh(fakeFirestore(), null);
  const ids = state.campaigns.map((c) => c.id).sort();
  assert.deepEqual(ids, [`${NEW.cid}01`, `${OLD.cid}01`].sort());
  const spend = state.campaigns.flatMap((c) => c.daily).reduce((s, d) => s + d.spend, 0);
  assert.equal(spend, 25);
});
