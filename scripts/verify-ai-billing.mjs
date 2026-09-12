// Synthetic, offline BigQuery/Firestore tests. No production data or network calls.
import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createServer } from "node:http";
import {
  billingWindow,
  billingQuery,
  queryBilling,
  normalizeBillingRows,
  mergeBillingHistory,
  encodeSnapshot,
  createBillingHandler,
  CATEGORIES,
  MAX_BYTES_BILLED,
  CACHE_TTL_MS,
  RETRY_MS,
  sendBillingJson,
  MAX_REPORT_BYTES,
} from "../api/ai-billing.mjs";

const SETTINGS = {
  table: "synthetic-project.billing.gcp_billing_export_v1_SYNTHETIC",
  location: "EU",
};
const AT = "2026-09-13T10:00:00.000Z";
const OLD_AT = "2026-09-11T10:00:00.000Z";
const COLUMNS = [
  "date",
  "service",
  "sku",
  "unit",
  "currency",
  "net_eur",
  "usage",
  "export_time_ms",
];
const record = (overrides = {}) => ({
  date: "2026-09-12",
  service: "Vertex AI",
  sku: "SYNTHETIC Gemini 3.8 Flash Global Text Output",
  unit: "count",
  currency: "EUR",
  net_eur: "6",
  usage: "3",
  export_time_ms: String(Date.parse(AT)),
  ...overrides,
});
const sum = (rows) => rows.reduce((n, row) => n + row.net_eur, 0);
const page = (records = [record()], extras = {}) => ({
  jobComplete: true,
  schema: { fields: COLUMNS.map((name) => ({ name })) },
  jobReference: {
    projectId: SETTINGS.table.split(".")[0],
    jobId: "synthetic-job",
    location: "EU",
  },
  totalRows: String(records.length),
  rows: records.map((row) => ({
    f: COLUMNS.map((name) => ({ v: row[name] })),
  })),
  cacheHit: false,
  ...extras,
});
function legacyFields() {
  const rows = normalizeBillingRows([
    record({ date: "2026-09-09", net_eur: "1" }),
    record({ date: "2026-09-10", net_eur: "2" }),
  ]).rows;
  const fields = encodeSnapshot({
    available: true,
    source: "Google Cloud Billing CSV",
    currency: "EUR",
    captured_at: OLD_AT,
    from: "2026-09-09",
    to: "2026-09-10",
    scope: "Synthetic historical test only",
    rows,
    categories: CATEGORIES,
    warning: null,
  });
  fields.schema.integerValue = "1";
  return fields;
}
function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    getHeader(name) {
      return this.headers[name];
    },
    end(buffer) {
      this.buffer = buffer;
      this.body = JSON.parse(
        (this.headers["Content-Encoding"] === "gzip"
          ? gunzipSync(buffer)
          : buffer
        ).toString("utf8"),
      );
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
function harness({
  fields = null,
  queryError,
  readError,
  writeError,
  pages = [page()],
  concurrentWrite,
} = {}) {
  let stored = fields,
    revision = 1,
    current = Date.parse(AT);
  const calls = { reads: 0, writes: [], queries: [], pages: [] };
  const queue = [...pages];
  const client = {
    projects: {
      databases: {
        documents: {
          get: async () => {
            calls.reads++;
            if (readError) throw readError;
            if (!stored) throw { code: 404 };
            return { data: { fields: stored, updateTime: String(revision) } };
          },
          patch: async (args) => {
            calls.writes.push(args);
            if (concurrentWrite) {
              stored = concurrentWrite;
              revision++;
              throw { code: 412 };
            }
            if (writeError) throw writeError;
            assert.equal(
              args["currentDocument.updateTime"] || null,
              stored ? String(revision) : null,
            );
            if (!stored) assert.equal(args["currentDocument.exists"], false);
            stored = args.requestBody.fields;
            revision++;
          },
        },
      },
    },
  };
  const bq = {
    jobs: {
      query: async (args, options) => {
        calls.queries.push({ args, options });
        if (queryError) throw queryError;
        return { data: queue.length ? queue.shift() : page() };
      },
      getQueryResults: async (args, options) => {
        calls.pages.push({ args, options });
        assert.ok(queue.length, "No mocked page left");
        return { data: queue.shift() };
      },
    },
  };
  const handler = createBillingHandler({
    firestore: () => client,
    bigquery: () => bq,
    settings: () => SETTINGS,
    password: () => "synthetic-password",
    now: () => new Date(current).toISOString(),
    pause: async () => {},
  });
  return {
    calls,
    stored: () => stored,
    advance: (ms) => {
      current += ms;
    },
    async request({
      method = "GET",
      pw = "synthetic-password",
      refresh,
      encoding,
    } = {}) {
      const res = response();
      await handler(
        {
          method,
          query: { pw, refresh },
          headers: { "accept-encoding": encoding },
        },
        res,
      );
      return res;
    },
  };
}

test("Pacific rolling window and bounded parameterized query include credits once", () => {
  assert.deepEqual(billingWindow("2026-09-13T01:00:00Z"), {
    from: "2025-09-12",
    to: "2026-09-12",
  });
  assert.deepEqual(billingWindow("2024-02-29T12:00:00Z"), {
    from: "2023-02-28",
    to: "2024-02-29",
  });
  const q = billingQuery(SETTINGS, billingWindow(AT));
  assert.equal(q.requestBody.maximumBytesBilled, String(MAX_BYTES_BILLED));
  assert.equal(q.requestBody.useQueryCache, true);
  assert.equal(q.requestBody.useLegacySql, false);
  assert.equal(q.requestBody.location, "EU");
  assert.equal(q.requestBody.query.match(/UNNEST\(credits\)/g).length, 1);
  assert.match(
    q.requestBody.query,
    /CAST\(cost AS NUMERIC\) \+ IFNULL\(\(SELECT SUM\(CAST\(credit.amount AS NUMERIC\)\)/,
  );
  assert.match(q.requestBody.query, /SUM\(net_cost\)/);
  assert.match(
    q.requestBody.query,
    /usage_start_time >= TIMESTAMP\(@from_date/,
  );
  assert.match(
    q.requestBody.query,
    /usage_start_time < TIMESTAMP\(DATE_ADD\(@to_date/,
  );
  assert.match(q.requestBody.query, /cost_type, 'regular'\) != 'tax'/);
  assert.throws(() =>
    billingQuery(
      { ...SETTINGS, table: "a.b.c; DROP TABLE secret" },
      billingWindow(AT),
    ),
  );
});

test("net results, refunds, usage and mutually exclusive categories retain their meaning", () => {
  const cases = [
    ["Gemini 3.8 Flash Global Text Input", "input"],
    ["Gemini 3.8 Flash Image Input", "image"],
    [
      "Generate content output token count gemini 2.5 flash short input text",
      "output",
    ],
    ["Gemini 3 Flash Image Input Caching", "cached_input"],
    ["Gemini 3.8 Flash Text Input Caching Storage", "cache_storage"],
    ["Grounding with Google Search on Gemini 3", "search"],
    ["Agent Platform Memory", "agent_runtime"],
    ["Embeddings for Text - Memory Bank", "memory"],
    ["Large Text Embedding Model", "ai_other"],
  ];
  const result = normalizeBillingRows([
    ...cases.map(([sku]) => record({ sku })),
    record({
      service: "Cloud Storage",
      sku: "Synthetic storage correction",
      net_eur: "-2",
    }),
  ]);
  cases.forEach(([sku, category]) =>
    assert.equal(result.rows.find((row) => row.sku === sku).category, category),
  );
  assert.equal(result.rows.at(-1).category, "cloud_other");
  assert.equal(sum(result.rows), 6 * cases.length - 2);
  assert.equal(result.rows[0].usage, 3);
  assert.equal(
    result.rows.find((row) => row.category === "search").model,
    null,
  );
  assert.equal(result.export_last_updated_at, AT);
  for (const override of [
    { currency: "USD" },
    { net_eur: "NaN" },
    { usage: null },
    { export_time_ms: "" },
    { date: "2026-02-30" },
  ])
    assert.throws(() => normalizeBillingRows([record(override)]));
});

test("authentication and GET-only guards perform no reads, queries or writes", async () => {
  const h = harness();
  for (const pw of ["", "wrong", ["synthetic-password"]])
    assert.equal((await h.request({ pw })).statusCode, 401);
  const post = await h.request({ method: "POST" });
  assert.equal(post.statusCode, 405);
  assert.equal(post.headers.Allow, "GET");
  assert.deepEqual(h.calls, { reads: 0, writes: [], queries: [], pages: [] });
});

test("automatic GET creates a report, caches hourly, and permits explicit refresh", async () => {
  const h = harness();
  const first = await h.request();
  assert.equal(first.statusCode, 200);
  assert.equal(first.headers["Cache-Control"], "private, no-store");
  assert.equal(first.body.source, "Google Cloud Billing BigQuery");
  assert.equal(first.body.captured_at, AT);
  assert.equal(first.body.last_sync_at, AT);
  assert.equal(first.body.last_attempt_at, AT);
  assert.equal(first.body.to, "2026-09-12");
  assert.equal(first.body.sync_status, "current");
  assert.equal(first.body.historical, null);
  assert.equal(sum(first.body.rows), 6);
  assert.equal(h.calls.writes.length, 1);
  assert.equal(
    h.calls.queries[0].args.requestBody.maximumBytesBilled,
    "500000000",
  );
  h.advance(CACHE_TTL_MS - 1);
  await h.request();
  assert.equal(h.calls.queries.length, 1);
  await h.request({ refresh: "1" });
  assert.equal(h.calls.queries.length, 2);
  h.advance(CACHE_TTL_MS + 1);
  await h.request();
  assert.equal(h.calls.queries.length, 3);
});

test("unfinished jobs are polled and all result pages are collected before saving", async () => {
  const rows = [
    record({ net_eur: "8" }),
    record({
      net_eur: "-2",
      sku: "Synthetic correction",
      service: "Cloud Run",
    }),
  ];
  const pending = {
    jobComplete: false,
    jobReference: { projectId: "job-project", jobId: "job", location: "EU" },
  };
  const h = harness({
    pages: [
      pending,
      pending,
      page([rows[0]], { totalRows: "2", pageToken: "page-2" }),
      page([rows[1]], { totalRows: "2", cacheHit: true }),
    ],
  });
  const res = await h.request();
  assert.equal(sum(res.body.rows), 6);
  assert.equal(h.calls.pages.length, 3);
  assert.equal(h.calls.pages[0].args.projectId, "job-project");
  assert.equal(h.calls.pages[0].args.location, "EU");
  assert.equal(h.calls.pages[2].args.pageToken, "page-2");
  assert.equal(h.calls.writes.length, 1);
});

test("empty or missing export preserves verified history and honest timestamps with retry cadence", async () => {
  for (const options of [
    { pages: [page([])] },
    { queryError: { code: 404 } },
  ]) {
    const h = harness({ fields: legacyFields(), ...options });
    const res = await h.request();
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.available, true);
    assert.equal(sum(res.body.rows), 3);
    assert.equal(res.body.captured_at, OLD_AT);
    assert.equal(res.body.sync_status, "waiting");
    assert.equal(res.body.last_attempt_at, AT);
    assert.doesNotMatch(res.body.warning, /CSV|import|upload/i);
    assert.doesNotMatch(res.body.source, /CSV/);
    h.advance(RETRY_MS - 1);
    await h.request();
    assert.equal(h.calls.queries.length, 1);
    h.advance(2);
    await h.request();
    assert.equal(h.calls.queries.length, 2);
  }
});

test("empty export without history is unavailable, not a fabricated zero-cost report", async () => {
  const h = harness({ pages: [page([])] });
  const res = await h.request();
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.available, false);
  assert.equal(res.body.rows, undefined);
  assert.equal(res.body.captured_at, undefined);
  assert.match(res.body.hint, /automatisch/);
  assert.equal(res.body.error_code, "empty_export");
  assert.equal((await h.request()).body.available, false);
  assert.equal(h.calls.queries.length, 1);
});

test("permission errors remain explicit while last-good data survives", async () => {
  const error = {
    code: 403,
    message: "private credential material",
    errors: [{ reason: "accessDenied" }],
  };
  const h = harness({ fields: legacyFields(), queryError: error });
  const res = await h.request();
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.sync_status, "error");
  assert.equal(res.body.error_code, "permission_denied");
  assert.match(res.body.warning, /Berechtigungen/);
  assert.equal(res.body.captured_at, OLD_AT);
  assert.equal(sum(res.body.rows), 3);
  assert.doesNotMatch(JSON.stringify(res.body), /private credential/);
  const noCache = harness({ queryError: error });
  assert.equal((await noCache.request()).statusCode, 503);
  assert.equal((await noCache.request()).statusCode, 503);
});

test("partial export retains legacy days; chronological handover accepts renamed and corrected SKUs", async () => {
  const h = harness({
    fields: legacyFields(),
    pages: [
      page([
        record({ date: "2026-09-08", net_eur: "4" }),
        record({ date: "2026-09-09", net_eur: "0.1" }),
      ]),
      page([
        record({ date: "2026-09-08", net_eur: "4" }),
        record({
          date: "2026-09-09",
          net_eur: "-1",
          sku: "Renamed correction",
        }),
        record({ date: "2026-09-11", net_eur: "1" }),
      ]),
      page([record({ date: "2026-09-11", net_eur: "-2" })]),
    ],
  });
  const partial = (await h.request()).body;
  assert.equal(partial.sync_status, "backfilling");
  assert.equal(sum(partial.rows), 7);
  assert.deepEqual(partial.historical.days, ["2026-09-09", "2026-09-10"]);
  assert.equal(partial.historical.captured_at, OLD_AT);
  const complete = (await h.request({ refresh: "1" })).body;
  assert.equal(complete.sync_status, "current");
  assert.equal(complete.historical, null);
  assert.equal(sum(complete.rows), 4);
  assert.equal(
    complete.rows.some((row) => row.date === "2026-09-10"),
    false,
  );
  const correction = (await h.request({ refresh: "1" })).body;
  assert.equal(sum(correction.rows), -2);
  assert.equal(correction.historical, null);
});

test("query timeout and incomplete pagination never replace last-good amounts", async () => {
  let tick = 0;
  const bq = {
    jobs: {
      query: async () => ({
        data: { jobComplete: false, jobReference: { jobId: "slow" } },
      }),
    },
  };
  await assert.rejects(
    queryBilling(bq, SETTINGS, billingWindow(AT), {
      clock: () => tick,
      pause: async () => {
        tick = 45_001;
      },
    }),
    (error) => error.billingCode === "timeout",
  );
  const h = harness({
    fields: legacyFields(),
    pages: [page([record()], { totalRows: "2" })],
  });
  const res = await h.request();
  assert.equal(res.body.error_code, "invalid_data");
  assert.equal(sum(res.body.rows), 3);
  assert.equal(res.body.captured_at, OLD_AT);
});

test("failed cache reads do not overwrite history; write failures return genuine query data with a warning", async () => {
  const denied = harness({ readError: { code: 403 } });
  assert.equal((await denied.request()).statusCode, 503);
  assert.equal(denied.calls.queries.length, 0);
  assert.equal(denied.calls.writes.length, 0);
  const corrupt = harness({
    fields: {
      schema: { integerValue: "1" },
      data_b64: { stringValue: "broken" },
    },
  });
  assert.equal((await corrupt.request()).body.error_code, "cache_invalid");
  const h = harness({ writeError: { code: 403, message: "private" } });
  const res = await h.request();
  assert.equal(res.body.available, true);
  assert.equal(sum(res.body.rows), 6);
  assert.equal(res.body.cache_warning, "cache_save_failed");
  assert.equal(h.stored(), null);
  assert.doesNotMatch(res.body.warning, /private/);
});

test("parallel requests coalesce one query and conditional writes preserve a newer cache", async () => {
  const shared = harness();
  const [first, second] = await Promise.all([
    shared.request(),
    shared.request(),
  ]);
  assert.deepEqual(first.body, second.body);
  assert.equal(shared.calls.queries.length, 1);
  assert.equal(shared.calls.writes.length, 1);
  const newer = mergeBillingHistory(
    null,
    normalizeBillingRows([record({ net_eur: "9" })]),
    billingWindow(AT),
    AT,
  );
  const raced = harness({ concurrentWrite: encodeSnapshot(newer) });
  const response = await raced.request();
  assert.equal(sum(response.body.rows), 9);
  assert.equal(raced.calls.reads, 2);
});

test("quota limits are distinct from permission errors", async () => {
  const h = harness({
    queryError: { code: 403, errors: [{ reason: "rateLimitExceeded" }] },
  });
  const response = await h.request();
  assert.equal(response.body.error_code, "query_limit");
  assert.doesNotMatch(response.body.warning, /Berechtigungen/);
});

test("responses and stored fields remain bounded and repository data is never loaded", async () => {
  assert.throws(
    () =>
      encodeSnapshot({ payload: randomBytes(1_000_000).toString("base64") }),
    (error) => error.billingCode === "snapshot_too_large",
  );
  assert.throws(
    () => encodeSnapshot({ payload: "a".repeat(MAX_REPORT_BYTES) }),
    (error) => error.billingCode === "snapshot_too_large",
  );
  const source = await readFile(
    new URL("../api/ai-billing.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /node:fs|readFile|parseBillingCsv|readSeed/);
});

test("gzip negotiation honors exclusions, wildcard, duplicate values and identity", () => {
  const payload = { text: "Synthetische Abrechnungsdaten".repeat(100) };
  for (const [encoding, compressed] of [
    [undefined, false],
    ["br", false],
    ["gzip", true],
    ["GZIP; Q=0.5", true],
    ["gzip;q=0, *;q=1", false],
    ["*;q=0.5", true],
    ["*;q=0, identity", false],
    ["gzip;q=1,gzip;q=0", false],
    ["gzip;q=invalid", false],
    ["gzip;q=2", false],
    [["br", "gzip;q=0.1"], true],
  ]) {
    const res = response();
    res.headers.Vary = "Origin";
    sendBillingJson({ headers: { "accept-encoding": encoding } }, res, payload);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers.Vary, "Origin, Accept-Encoding");
    assert.equal(res.headers["Cache-Control"], "private, no-store");
    assert.equal(
      res.headers["Content-Type"],
      "application/json; charset=utf-8",
    );
    assert.equal(
      res.headers["Content-Encoding"],
      compressed ? "gzip" : undefined,
    );
    assert.equal(Number(res.headers["Content-Length"]), res.buffer.length);
    assert.deepEqual(res.body, payload);
  }
  const tiny = response();
  sendBillingJson(
    { headers: { "accept-encoding": "gzip, identity;q=0" } },
    tiny,
    { ok: true },
  );
  assert.equal(tiny.headers["Content-Encoding"], "gzip");
  const forbidden = response();
  sendBillingJson({ headers: { "accept-encoding": "*;q=0" } }, forbidden, {
    ok: true,
  });
  assert.equal(forbidden.statusCode, 406);
});

test("100000 aggregated rows survive query pagination, 16 MiB cache and gzip roundtrips without truncation", async () => {
  const count = 100_000;
  const records = Array.from({ length: count }, (_, index) =>
    record({
      service: "Cloud Run",
      sku: "SYNTHETIC-" + index,
      net_eur: "0.01",
      usage: "1",
    }),
  );
  const pages = [];
  for (let offset = 0; offset < count; offset += 5000)
    pages.push(
      page(records.slice(offset, offset + 5000), {
        totalRows: String(count),
        ...(offset + 5000 < count ? { pageToken: String(offset + 5000) } : {}),
      }),
    );
  const h = harness({ pages });
  const first = await h.request({ encoding: "gzip" });
  assert.equal(first.statusCode, 200);
  assert.equal(first.body.rows.length, count);
  assert.equal(new Set(first.body.rows.map((row) => row.sku)).size, count);
  const json = gunzipSync(first.buffer);
  assert.ok(json.length > 4_500_000);
  assert.ok(json.length < MAX_REPORT_BYTES);
  assert.ok(first.buffer.length < 4_500_000);
  assert.ok(h.stored().data_b64.stringValue.length <= 900_000);
  assert.deepEqual(
    JSON.parse(
      gunzipSync(Buffer.from(h.stored().data_b64.stringValue, "base64")),
    ),
    first.body,
  );
  assert.equal(h.calls.queries[0].args.requestBody.maxResults, 5000);
  assert.equal(h.calls.pages.length, 19);
  assert.ok(h.calls.pages.every((call) => call.args.maxResults === 5000));
  const cached = await h.request({ encoding: "gzip" });
  assert.deepEqual(gunzipSync(cached.buffer), json);
  assert.equal(h.calls.queries.length, 1);
  for (const encoding of [undefined, "gzip;q=0,*;q=1"]) {
    const plain = await h.request({ encoding });
    assert.equal(plain.statusCode, 406);
    assert.equal(plain.body.code, "gzip_required");
    assert.equal(plain.body.rows, undefined);
    assert.equal(plain.headers["Content-Encoding"], undefined);
  }
});

test("aggregate and uncompressed cache limits reject only after the supported boundary", async () => {
  const overhead = Buffer.byteLength(JSON.stringify({ payload: "" }));
  assert.ok(
    encodeSnapshot({ payload: "a".repeat(MAX_REPORT_BYTES - overhead) })
      .data_b64.stringValue.length < 900_000,
  );
  assert.throws(
    () =>
      encodeSnapshot({ payload: "a".repeat(MAX_REPORT_BYTES - overhead + 1) }),
    (error) => error.billingCode === "snapshot_too_large",
  );
  const h = harness({ pages: [page([], { totalRows: "100001" })] });
  const res = await h.request();
  assert.equal(res.body.error_code, "snapshot_too_large");
  assert.equal(res.body.available, false);
});

test("native HTTP clients transparently decode gzip and receive accurate lengths", async (t) => {
  const payload = {
    rows: [{ date: "2026-09-12", sku: "SYNTHETIC".repeat(200), net_eur: 1 }],
  };
  const server = createServer((req, res) => sendBillingJson(req, res, payload));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const res = await fetch("http://127.0.0.1:" + server.address().port, {
    headers: { "Accept-Encoding": "gzip" },
  });
  assert.equal(res.headers.get("content-encoding"), "gzip");
  assert.equal(res.headers.get("vary"), "Accept-Encoding");
  assert.equal(res.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await res.json(), payload);
});
