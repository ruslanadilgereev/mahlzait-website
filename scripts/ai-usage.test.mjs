import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { gzipSync, gunzipSync } from "node:zlib";
import { google } from "googleapis";
import handler, { priceByModel, repriceCachedUsage, revenueCatCustomerUrl, packCustomerLinks, unpackCustomerLinks, sendUsageJson } from "../api/ai-usage.mjs";

const units = (value) => Math.round(value * 1e4);
const pseudonym = (uid) => createHash("sha256").update(uid).digest("hex").slice(0, 8);
const typed = (value) => typeof value === "string" ? { stringValue: value }
  : typeof value === "number" ? { integerValue: String(value) }
  : { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, typed(entry)])) } };
function mockAuth(t) {
  const values = {
    DASHBOARD_PASSWORD: "local-test-only", RC_SECRET_API_KEY: "unused-local-fixture",
    GOOGLE_SA_KEY: Buffer.from(JSON.stringify({ client_email: "test@example.invalid", private_key: "unused" })).toString("base64"),
  };
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
}
function responseCapture() {
  return {
    headers: { "Cache-Control": "private, no-store" }, statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; },
    getHeader(name) { return this.headers[name]; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; },
    end(value) { this.buffer = value; return this; },
  };
}
test("RevenueCat links use the original customer ID and safely encode its URL segment", () => {
  assert.equal(revenueCatCustomerUrl("fixture-user"), "https://app.revenuecat.com/customers/41604426/fixture-user");
  const uid = "$RCAnonymousID:sample /?#&";
  const url = new URL(revenueCatCustomerUrl(uid));
  assert.equal(url.origin, "https://app.revenuecat.com");
  assert.equal(decodeURIComponent(url.pathname.split("/").at(-1)), uid);
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  assert.equal(revenueCatCustomerUrl(null), null);
  assert.equal(revenueCatCustomerUrl(" "), null);
});
test("customer links serialize once per original UID in a separate compressed map", () => {
  const packed = packCustomerLinks(["fixture-user", "fixture-user", "fixture-other", "", null]);
  assert.equal(packed.schema, 1);
  assert.equal(packed.total_users, 2);
  assert.equal(packed.ambiguous_users, 0);
  assert.deepEqual(unpackCustomerLinks(packed), {
    [pseudonym("fixture-user")]: "fixture-user", [pseudonym("fixture-other")]: "fixture-other",
  });
  assert.equal(gunzipSync(Buffer.from(packed.data_b64, "base64")).includes("https://"), false);
  assert.ok(packed.data_b64.length < 900 * 1024);
  assert.throws(() => unpackCustomerLinks({ schema: 1, data_b64: "corrupt" }));
  assert.throws(() => unpackCustomerLinks({ schema: 1,
    data_b64: gzipSync(Buffer.from(JSON.stringify({ wrong_hash: "fixture-user" }))).toString("base64"),
  }), /Invalid customer links/);
});
test("a genuine short-hash collision cannot choose either customer's profile", () => {
  const first = "synthetic-collision-fixture-14229", second = "synthetic-collision-fixture-46070";
  assert.equal(pseudonym(first), pseudonym(second));
  for (const uids of [[first, second, first], [second, first, second]]) {
    const packed = packCustomerLinks([...uids, "fixture-user"]);
    assert.equal(packed.ambiguous_users, 1);
    assert.equal(packed.total_users, 1);
    const links = unpackCustomerLinks(packed);
    assert.equal(Object.hasOwn(links, pseudonym(first)), false);
    assert.equal(links[pseudonym("fixture-user")], "fixture-user");
  }
});
test("gzip response negotiation respects explicit exclusions, wildcard and quality values", () => {
  const payload = { text: "Nutzungsdaten".repeat(200) };
  for (const [header, gzip] of [
    [undefined, false], ["br", false], ["gzip", true], ["GZIP; Q=0.5", true],
    ["br, gzip;q=0.001", true], ["gzip; q=0", false], ["gzip;q=0, *;q=1", false],
    ["*;q=0.5", true], ["*;q=0, identity", false], ["gzip;q=1, gzip;q=0", false],
    ["gzip;q=invalid", false], ["gzip;q=2", false], [["br", "gzip;q=0.8"], true],
  ]) {
    const response = responseCapture();
    response.headers.Vary = "Origin";
    sendUsageJson({ headers: { "accept-encoding": header } }, response, payload);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers.Vary, "Origin, Accept-Encoding");
    assert.equal(response.headers["Cache-Control"], "private, no-store");
    assert.equal(response.headers["Content-Type"], "application/json; charset=utf-8");
    assert.equal(response.headers["Content-Encoding"], gzip ? "gzip" : undefined);
    if (gzip) {
      assert.ok(Buffer.isBuffer(response.buffer));
      assert.equal(Number(response.headers["Content-Length"]), response.buffer.length);
      assert.deepEqual(JSON.parse(gunzipSync(response.buffer)), payload);
    } else assert.deepEqual(response.payload, payload);
  }
});
test("small accepted identity responses keep the existing JSON shape", () => {
  const payload = { bootstrapped: true, records: [] };
  const response = responseCapture();
  sendUsageJson({ headers: { "accept-encoding": "gzip" } }, response, payload);
  assert.equal(response.headers["Content-Encoding"], undefined);
  assert.deepEqual(response.payload, payload);
  const noIdentity = responseCapture();
  sendUsageJson({ headers: { "accept-encoding": "gzip, identity;q=0" } }, noIdentity, payload);
  assert.deepEqual(JSON.parse(gunzipSync(noIdentity.buffer)), payload);
});
test("gzip preserves all 2573 profile-linked rows beyond the plain response size limit", () => {
  const payload = { bootstrapped: true, records: Array.from({ length: 2573 }, (_, index) => ({
    index, revenuecat_url: revenueCatCustomerUrl(`synthetic-http-fixture-${index}`),
    detail: "Zähler und Einträge".repeat(120),
  })) };
  const original = Buffer.from(JSON.stringify(payload));
  assert.ok(original.length > 4_500_000);
  const response = responseCapture();
  sendUsageJson({ headers: { "accept-encoding": "br, gzip" } }, response, payload);
  assert.equal(response.statusCode, 200);
  assert.ok(response.buffer.length < 4_500_000);
  assert.deepEqual(gunzipSync(response.buffer), original);
  assert.deepEqual(JSON.parse(gunzipSync(response.buffer)), payload);
});
test("oversized non-gzip clients receive clear 406 JSON instead of an oversized body", () => {
  const payload = { text: "Ö".repeat(2_250_001) }; // UTF-8 bytes, not string length.
  for (const header of [undefined, "gzip;q=0, *;q=1", "identity"]) {
    const response = responseCapture();
    sendUsageJson({ headers: { "accept-encoding": header } }, response, payload);
    assert.equal(response.statusCode, 406);
    assert.equal(response.payload.code, "gzip_required");
    assert.ok(response.payload.error.includes("gzip"));
    assert.equal(response.headers["Content-Encoding"], undefined);
    assert.equal(response.buffer, undefined);
  }
});
test("native Node HTTP end(Buffer) lets fetch transparently decode the full JSON response", async (t) => {
  const payload = { records: [{ detail: "Vollständige Nutzungsdaten".repeat(150), cost_eur: 1.8506 }] };
  const server = createServer((req, res) => {
    res.setHeader("Cache-Control", "private, no-store");
    sendUsageJson(req, res, payload);
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}`, { headers: { "Accept-Encoding": "gzip" } });
  assert.equal(response.headers.get("content-encoding"), "gzip");
  assert.equal(response.headers.get("vary"), "Accept-Encoding");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), payload);
});
const sumUnits = (values) => values.reduce((sum, value) => sum + units(value), 0);
const counters = (overrides = {}) => ({
  requests: 3, input_tokens: 1_000_000, cached_tokens: 200_000,
  output_tokens: 400_000, thinking_tokens: 80_000, ...overrides,
});
const day = (tokens) => [tokens.requests, tokens.input_tokens, tokens.cached_tokens,
  tokens.output_tokens, tokens.thinking_tokens, 999];
const record = (overrides = {}) => ({
  u: "example1", month: "2026-09", country: "DE", sub_type: "monthly",
  ...counters(), cost_eur: 999, by_model: { "gemini-3.8-flash": counters() }, ...overrides,
});
function stateFor(records, meta = {}) {
  return {
    schema: 2, last_pull_ts_ms: 1234,
    meta: { pricing_version: "2026-07", total_users: 1, months: ["2026-09"], total_cost_eur: 999, ...meta },
    data_b64: gzipSync(Buffer.from(JSON.stringify(records))).toString("base64"),
  };
}
function assertBalanced(rec) {
  assert.equal(sumUnits(Object.values(rec.cost_breakdown)), units(rec.cost_eur));
  assert.equal(sumUnits(Object.values(rec.by_model).map((model) => model.cost_eur)), units(rec.cost_eur));
  for (const model of Object.values(rec.by_model)) {
    assert.equal(sumUnits(Object.values(model.cost_breakdown)), units(model.cost_eur));
    assert.ok(Object.values(model.cost_breakdown).every((cost) => cost >= 0));
  }
  if (rec.channels) {
    assert.equal(sumUnits(Object.values(rec.channels).map((channel) => channel.cost_eur)), units(rec.cost_eur));
    assert.ok(Object.values(rec.channels).every((channel) => channel.cost_eur >= 0));
  }
  if (rec.days) {
    assert.equal(sumUnits(Object.values(rec.days).map((values) => values[5])), units(rec.cost_eur));
    assert.ok(Object.values(rec.days).every((values) => values[5] >= 0));
  }
}

test("cached input and thinking are priced as subsets, never twice", () => {
  const result = priceByModel({ "gemini-3_8-flash": counters() }, "2026-09");
  const model = result.byModelOut["gemini-3.8-flash"];
  // 0.8M * $0.75 + 0.2M * $0.075 + 0.4M * $3.75, converted at 0.875.
  assert.equal(model.cost_eur, 1.8506);
  assert.deepEqual(model.cost_breakdown, {
    input_eur: 0.525, cached_input_eur: 0.0131, output_eur: 1.05, thinking_eur: 0.2625,
  });
  assert.equal(model.pricing_basis, "introductory_credit_assumed");
  assert.deepEqual(result.unpriced, []);
  const noThinking = priceByModel({ "gemini-3.8-flash": counters({ thinking_tokens: 0 }) }, "2026-09");
  assert.equal(noThinking.costEur, result.costEur);
  assert.equal(noThinking.byModelOut["gemini-3.8-flash"].cost_breakdown.thinking_eur, 0);
});

test("all three Flash promotions expire by usage month, not the current date", () => {
  const tokens = counters({ input_tokens: 1_000_000, cached_tokens: 0, output_tokens: 1_000_000 });
  for (const model of ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.8-flash"]) {
    for (const month of ["2026-09", "2026-12"]) {
      assert.equal(priceByModel({ [model]: tokens }, month).costEur, 3.9375);
    }
    assert.equal(priceByModel({ [model]: tokens }, "2027-01").costEur, 7.875);
  }
  assert.equal(priceByModel({ "gemini-3.6-flash": tokens }, "2026-08").costEur, 7.875);
});

test("new tariffs never silently overwrite unverified historical or missing months", () => {
  for (const month of ["2026-08", "2026-13", undefined]) {
    const result = priceByModel({ "gemini-3.8-flash": counters() }, month);
    assert.equal(result.byModelOut["gemini-3.8-flash"].pricing_basis, "historical_rate_unverified");
    assert.equal(result.byModelOut["gemini-3.8-flash"].pricing_fallback, "gemini-3.5-flash");
    assert.deepEqual(result.unpriced, ["gemini-3.8-flash"]);
  }
});

test("unknown models keep the established fallback and expose its identity", () => {
  const result = priceByModel({ "future-model": counters() }, "2026-09");
  const fallback = priceByModel({ "gemini-3.5-flash": counters() }, "2026-09");
  assert.equal(result.costEur, fallback.costEur);
  assert.equal(result.byModelOut["future-model"].pricing_fallback, "gemini-3.5-flash");
  assert.equal(result.byModelOut["future-model"].pricing_basis, "unknown_model");
  assert.deepEqual(result.unpriced, ["future-model"]);
});

test("mixed Firestore and dotted model keys retain all counters and conserve model costs", () => {
  const result = priceByModel({ "gemini-3_8-flash": counters(), "gemini-3.8-flash": counters() }, "2026-09");
  assert.deepEqual(Object.keys(result.byModelOut), ["gemini-3.8-flash"]);
  assert.equal(result.byModelOut["gemini-3.8-flash"].input_tokens, 2_000_000);
  assert.equal(result.byModelOut["gemini-3.8-flash"].requests, 6);
  assert.equal(result.costEur, 3.7013);
  assert.equal(result.costEur, result.byModelOut["gemini-3.8-flash"].cost_eur);
  assert.equal(sumUnits(Object.values(result.costBreakdown)), units(result.costEur));
});

test("old caches reprice from model counters without altering stored demographics or data", () => {
  const original = stateFor([record({
    unpriced_models: ["gemini-3.8-flash"],
    by_model: { "gemini-3.8-flash": { ...counters(), cost_eur: 123 } },
  })]);
  const before = structuredClone(original);
  const result = repriceCachedUsage(original);
  assert.deepEqual(original, before);
  assert.equal(result.records[0].cost_eur, 1.8506);
  assert.equal(result.records[0].country, "DE");
  assert.equal(result.records[0].sub_type, "monthly");
  assert.equal(result.records[0].unpriced_models, undefined);
  assert.equal(result.meta.total_cost_eur, 1.85);
  assert.equal(result.meta.cached_pricing_version, "2026-07");
  assert.equal(result.meta.repriced_from_cache, true);
  assert.equal(result.meta.pricing_version, "2026-09-13");
  assert.equal(result.meta.cost_basis, "token_estimate");
  assert.equal(result.meta.exchange_rate_basis, "fixed_assumption");
  assert.equal(result.meta.promotional_credit_assumed, true);
  assert.equal(result.meta.usage_warning_records, 0);
  assert.ok(result.meta.pricing_warnings.some((warning) => warning.includes("keine Google-Cloud-Abrechnung")));
  assertBalanced(result.records[0]);
});

test("mixed model, day and channel costs reconcile with token-weighted allocation", () => {
  const first = counters();
  const second = counters({ requests: 2, input_tokens: 400_000, cached_tokens: 0, output_tokens: 200_000, thinking_tokens: 30_000 });
  const total = Object.fromEntries(Object.keys(first).map((key) => [key, first[key] + second[key]]));
  const input = record({ ...total,
    by_model: { "gemini-3.8-flash": first, "gemini-3.5-flash": second },
    channels: { app: { ...first, cost_eur: 800 }, whatsapp: { ...second, cost_eur: 199 } },
    days: { "01": day(first), "12": day(second) },
  });
  const result = repriceCachedUsage(stateFor([input]));
  const rec = result.records[0];
  assert.equal(rec.cost_eur, 3.9506);
  assert.deepEqual(rec.days["01"].slice(0, 5), input.days["01"].slice(0, 5));
  assert.equal(rec.channels.app.input_tokens, first.input_tokens);
  // Existing channel/day weighting: 3.5 rates for both, normalized to model total.
  const firstWeight = 800_000 * 1.5 + 200_000 * 0.15 + 400_000 * 9;
  const secondWeight = 400_000 * 1.5 + 200_000 * 9;
  assert.ok(Math.abs(rec.channels.app.cost_eur - 3.9506 * firstWeight / (firstWeight + secondWeight)) < 0.0001);
  assert.equal(rec.channels.app.cost_eur, rec.days["01"][5]);
  assertBalanced(rec);
});

test("small totals over many days and channels cannot create a negative rounding remainder", () => {
  const tiny = counters({ requests: 1, input_tokens: 1, cached_tokens: 0, output_tokens: 0, thinking_tokens: 0 });
  const total = { ...tiny, requests: 20, input_tokens: 200 };
  const rec = record({ ...total,
    by_model: { "gemini-3.8-flash": total },
    channels: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`channel${i}`, tiny])),
    days: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [String(i + 1).padStart(2, "0"), day(tiny)])),
  });
  const repriced = repriceCachedUsage(stateFor([rec])).records[0];
  assert.equal(repriced.cost_eur, 0.0001);
  assertBalanced(repriced);
});

test("anomalous subsets remain visible while estimates avoid negative or duplicate charges", () => {
  const bad = counters({ cached_tokens: 2_000_000, thinking_tokens: 800_000 });
  const result = repriceCachedUsage(stateFor([record({ ...bad, by_model: { "gemini-3.8-flash": bad } })]));
  const rec = result.records[0];
  assert.equal(rec.by_model["gemini-3.8-flash"].cached_tokens, 2_000_000);
  assert.equal(rec.by_model["gemini-3.8-flash"].thinking_tokens, 800_000);
  assert.equal(rec.cost_breakdown.input_eur, 0);
  assert.equal(rec.cost_breakdown.output_eur, 0);
  assert.equal(rec.cost_eur, 1.3781);
  assert.deepEqual(rec.usage_warnings, ["cached_exceeds_input", "thinking_exceeds_output"]);
  assert.equal(result.meta.usage_warning_records, 1);
  assertBalanced(rec);
});

test("missing and incomplete model counters are explicit instead of fabricating costs", () => {
  const missing = repriceCachedUsage(stateFor([record({ by_model: undefined, cost_eur: 12.3456 })]));
  assert.equal(missing.records[0].cost_eur, 12.3456);
  assert.equal(missing.records[0].cost_breakdown, null);
  assert.deepEqual(missing.records[0].usage_warnings, ["model_counters_missing"]);
  assert.equal(missing.meta.missing_model_counter_records, 1);
  const partial = repriceCachedUsage(stateFor([record({ input_tokens: 2_000_000 })]));
  assert.deepEqual(partial.records[0].usage_warnings, ["model_totals_mismatch"]);
  assert.equal(partial.records[0].input_tokens, 2_000_000);
  assert.equal(partial.records[0].by_model["gemini-3.8-flash"].input_tokens, 1_000_000);
});

test("one user turn may count toward multiple models without a token inconsistency", () => {
  const first = counters({ requests: 20 });
  const second = counters({ requests: 10 });
  const totals = Object.fromEntries(Object.keys(first).map((key) => [key, first[key] + second[key]]));
  const input = record({ ...totals, requests: 20,
    by_model: { "gemini-3.8-flash": first, "gemini-3.5-flash-lite": second },
  });
  const result = repriceCachedUsage(stateFor([input]));
  const rec = result.records[0];
  assert.equal(rec.requests, 20);
  assert.equal(Object.values(rec.by_model).reduce((sum, model) => sum + model.requests, 0), 30);
  assert.equal(rec.usage_warnings, undefined);
  assert.equal(result.meta.usage_warning_records, 0);
  assertBalanced(rec);
  for (const key of ["input_tokens", "cached_tokens", "output_tokens", "thinking_tokens"]) {
    const mismatch = repriceCachedUsage(stateFor([{ ...input, [key]: input[key] + 1 }]));
    assert.deepEqual(mismatch.records[0].usage_warnings, ["model_totals_mismatch"]);
  }
});

test("current caches are idempotent and empty caches stay valid", () => {
  const first = repriceCachedUsage(stateFor([record()]));
  const again = repriceCachedUsage(stateFor(first.records, first.meta));
  assert.deepEqual(again.records, first.records);
  assert.equal(again.meta.repriced_from_cache, false);
  assert.deepEqual(repriceCachedUsage(null).records, []);
  assert.equal(repriceCachedUsage(stateFor([])).meta.total_cost_eur, 0);
});

test("GET reads only usage and links caches and rebuilds validated profile URLs", async (t) => {
  mockAuth(t);
  const state = stateFor([record({ u: pseudonym("fixture-user"), revenuecat_url: "https://example.invalid/stale" })]);
  let reads = 0;
  t.mock.method(google, "firestore", () => ({ projects: { databases: { documents: {
    get: async ({ name }) => { reads++;
      if (name.endsWith("/customer_links")) return { data: { fields: typed(packCustomerLinks(["fixture-user"])).mapValue.fields } };
      return { data: { fields: {
      data_b64: { stringValue: state.data_b64 }, schema: { integerValue: "2" },
      last_pull_ts_ms: { integerValue: "1234" },
      meta: { mapValue: { fields: { pricing_version: { stringValue: "2026-07" } } } },
    } } }; },
    patch: () => assert.fail("cached GET must not write to Firestore"),
    runQuery: () => assert.fail("cached GET must not pull usage documents"),
  } } } }));
  t.mock.method(globalThis, "fetch", () => assert.fail("cached GET must not fetch RevenueCat"));
  const res = responseCapture();
  await handler({ query: { pw: "local-test-only" }, headers: { "accept-encoding": "gzip" } }, res);
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(gunzipSync(res.buffer));
  assert.equal(res.headers["Cache-Control"], "private, no-store");
  assert.equal(res.headers["Content-Encoding"], "gzip");
  assert.equal(reads, 2);
  assert.equal(body.last_pull_ts_ms, 1234);
  assert.equal(body.records[0].cost_eur, 1.8506);
  assert.equal(body.records[0].revenuecat_url, revenueCatCustomerUrl("fixture-user"));
  assert.equal(body.meta.repriced_from_cache, true);
  assert.deepEqual(body.meta.customer_links, { status: "ready", linked_records: 1, missing_records: 0, ambiguous_users: 0, warning: null });
  assertBalanced(body.records[0]);
});

for (const [scenario, expected] of [[404, "missing"], [503, "unavailable"], ["corrupt", "invalid"]]) {
  test(`customer links ${expected} never prevent reading token costs`, async (t) => {
    mockAuth(t);
    const state = stateFor([record({ u: pseudonym("fixture-user"), revenuecat_url: "https://example.invalid/stale" })]);
    t.mock.method(google, "firestore", () => ({ projects: { databases: { documents: {
      get: async ({ name }) => {
        if (!name.endsWith("/customer_links")) return { data: { fields: typed(state).mapValue.fields } };
        if (scenario === "corrupt") return { data: { fields: typed({ schema: 1, data_b64: "corrupt" }).mapValue.fields } };
        throw Object.assign(new Error("Fixture unavailable"), { code: scenario });
      },
      patch: () => assert.fail("GET must not write"),
      runQuery: () => assert.fail("GET must not query usage"),
    } } } }));
    t.mock.method(globalThis, "fetch", () => assert.fail("GET must not request RevenueCat"));
    let status = 200, body;
    const res = { setHeader() {}, status(code) { status = code; return this; }, json(value) { body = value; return this; } };
    await handler({ query: { pw: "local-test-only" } }, res);
    assert.equal(status, 200);
    assert.equal(body.records[0].cost_eur, 1.8506);
    assert.equal(body.records[0].revenuecat_url, null);
    assert.equal(body.meta.customer_links.status, expected);
    assert.equal(body.meta.customer_links.missing_records, 1);
    assert.ok(body.meta.customer_links.warning);
    assertBalanced(body.records[0]);
  });
}

for (const failLinksWrite of [false, true]) {
test(`explicit refresh preserves usage when the links write ${failLinksWrite ? "fails" : "succeeds"}`, async (t) => {
  mockAuth(t);
  const source = {
    uid: "fixture-user", month: "2026-09", ...counters(),
    by_model: { "gemini-3_8-flash": counters() },
    by_channel: { app: counters() },
    by_day: { "2026-09-01": counters(), "2026-08-01": counters() },
  };
  let stored, storedLinks, queries = 0, externalLookups = 0;
  t.mock.method(google, "firestore", () => ({ projects: { databases: { documents: {
    get: async ({ name }) => {
      if (name.endsWith("/customer_links") && storedLinks) return { data: { fields: storedLinks } };
      throw Object.assign(new Error("No cache"), { code: 404 });
    },
    runQuery: async () => { queries++; return { data: [{ document: { fields: typed(source).mapValue.fields } }] }; },
    patch: async (request) => {
      if (request.name.endsWith("/customer_links")) {
        if (failLinksWrite) throw Object.assign(new Error("Fixture links failure"), { code: 503 });
        storedLinks = request.requestBody.fields;
      }
      else stored = request.requestBody.fields;
    },
  } } } }));
  t.mock.method(globalThis, "fetch", async (url) => {
    externalLookups++;
    assert.ok(url.startsWith("https://api.revenuecat.com/v2/"));
    return new Response(JSON.stringify(url.endsWith("/attributes") || url.endsWith("/subscriptions")
      ? { items: [] } : { last_seen_country: "DE" }), { status: 200 });
  });
  let status = 200, body;
  const res = { setHeader() {}, status(code) { status = code; return this; }, json(value) { body = value; return this; } };
  await handler({ query: { pw: "local-test-only", refresh: "1" } }, res);
  assert.equal(status, 200);
  assert.equal(queries, 1);
  assert.equal(externalLookups, 3);
  assert.equal(body.records[0].cost_eur, 1.8506);
  assert.equal(body.records[0].country, "DE");
  assert.equal(body.records[0].revenuecat_url, failLinksWrite ? null : revenueCatCustomerUrl(source.uid));
  assert.deepEqual(Object.keys(body.records[0].days), ["01"]);
  assert.equal(body.meta.repriced_from_cache, false);
  assert.equal(stored.meta.mapValue.fields.pricing_version.stringValue, "2026-09-13");
  const persisted = JSON.parse(gunzipSync(Buffer.from(stored.data_b64.stringValue, "base64")).toString("utf8"));
  const withoutLinks = body.records.map(({ revenuecat_url, ...record }) => record);
  assert.deepEqual(persisted, withoutLinks);
  assert.equal(Object.hasOwn(persisted[0], "revenuecat_url"), false);
  assert.equal(stored.data_b64.stringValue, gzipSync(Buffer.from(JSON.stringify(withoutLinks))).toString("base64"));
  if (failLinksWrite) {
    assert.equal(body.meta.customer_links.status, "missing");
    assert.ok(body.meta.customer_links.warning.includes("Nutzungsdaten wurden aktualisiert"));
  } else {
    assert.deepEqual(unpackCustomerLinks({ schema: 1, data_b64: storedLinks.data_b64.stringValue }), { [pseudonym(source.uid)]: source.uid });
    assert.equal(body.meta.customer_links.status, "ready");
  }
  assertBalanced(body.records[0]);
});
}
