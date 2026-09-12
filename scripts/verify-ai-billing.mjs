// Offline parser, reconciliation, auth and atomic-import checks. No cloud calls.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import {
  parseBillingCsv,
  createBillingHandler,
  encodeSnapshot,
  CATEGORIES,
  MAX_CSV_BYTES,
} from "../api/ai-billing.mjs";

// Invented test amounts and volumes only; never load private billing exports.
const sampleCsv = await readFile(
  new URL("./fixtures/ai-billing.csv", import.meta.url),
  "utf8",
);
const capturedAt = "2026-09-12T10:00:00.000Z";
const sampleReport = parseBillingCsv(sampleCsv, { captured_at: capturedAt });
const header = sampleCsv.split(/\r?\n/)[0];
const euro = (value) => value.toFixed(6).replace(".", ",");
const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
const sumMicros = (rows) =>
  rows.reduce((total, row) => total + Math.round(row.net_eur * 1_000_000), 0);

function fixture(items, { date = "2026-09-12", netTotal, footer = true } = {}) {
  const rows = items.map((item, index) =>
    [
      item.date || date,
      item.service || "Vertex AI",
      "SERVICE-1",
      item.sku || "Gemini 3.8 Flash Global Text Input - Predictions",
      `SKU-${index}`,
      item.usage || "1.234,5",
      "count",
      "20,00",
      "0,00",
      "0,00",
      "-10,00",
      euro(item.net ?? 1),
      euro(item.net ?? 1),
    ]
      .map(quote)
      .join(","),
  );
  const total =
    netTotal ?? items.reduce((sum, item) => sum + (item.net ?? 1), 0);
  if (footer)
    for (const [label, amount] of [
      ["Zwischensumme", total],
      ["Steuer", 0],
      ["Summe", total],
    ])
      rows.push(
        [...Array(9).fill(""), label, euro(amount), euro(amount)]
          .map(quote)
          .join(","),
      );
  return [header, ...rows].join("\r\n") + "\r\n";
}

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
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
  getError,
  patchError,
  fields = encodeSnapshot(sampleReport),
} = {}) {
  const calls = { reads: 0, writes: 0 };
  let saved = fields;
  const handler = createBillingHandler({
    password: () => "offline-test-password",
    now: () => "2026-09-13T10:00:00.000Z",
    firestore: () => ({
      projects: {
        databases: {
          documents: {
            get: async ({ name }) => {
              assert.match(name, /\/ai_billing_dashboard_cache\/state$/);
              calls.reads++;
              if (getError) throw getError;
              return { data: { fields: saved } };
            },
            patch: async ({ name, requestBody }) => {
              assert.match(name, /\/ai_billing_dashboard_cache\/state$/);
              calls.writes++;
              if (patchError) throw patchError;
              saved = requestBody.fields;
            },
          },
        },
      },
    }),
  });
  return {
    calls,
    saved: () => saved,
    async request(method = "GET", body, pw = "offline-test-password") {
      const res = response();
      await handler({ method, body, query: { pw } }, res);
      return res;
    },
  };
}

test("synthetic fixture reconciles every invented cost row", () => {
  assert.ok(
    sampleReport.rows.every((row) =>
      row.sku.startsWith("SYNTHETIC FIXTURE ONLY"),
    ),
  );
  assert.equal(sampleReport.rows.length, 14);
  assert.equal(sampleReport.from, "2026-09-09");
  assert.equal(sampleReport.to, "2026-09-10");
  assert.equal(sampleReport.currency, "EUR");
  assert.equal(sampleReport.timezone, "America/Los_Angeles");
  assert.equal(sumMicros(sampleReport.rows), 13_100_000);
  const day = sampleReport.rows.filter((row) => row.date === "2026-09-10");
  assert.equal(sumMicros(day), 5_500_000);
  assert.equal(
    sumMicros(day.filter((row) => row.service === "Vertex AI")),
    3_700_000,
  );
  assert.equal(
    sumMicros(day.filter((row) => row.category === "search")),
    3_000_000,
  );
  assert.ok(
    sampleReport.rows
      .filter((row) => row.category === "search")
      .every((row) => row.model === null),
  );
  assert.equal(
    Object.keys(CATEGORIES).reduce(
      (total, category) =>
        total +
        sumMicros(sampleReport.rows.filter((row) => row.category === category)),
      0,
    ),
    13_100_000,
  );
});

test("quoted commas, escaped quotes, multiline text, BOM, German numbers and negative adjustments survive", () => {
  const report = parseBillingCsv(
    "\uFEFF" +
      fixture([
        {
          sku: 'Gemini 3.8 Flash Global Text Input, "Promo"\r\nAdjustment',
          net: -1.234567,
        },
      ]),
  );
  assert.equal(report.rows[0].net_eur, -1.234567);
  assert.equal(report.rows[0].usage, 1234.5);
  assert.match(report.rows[0].sku, /"Promo"\r\nAdjustment/);
  assert.equal(report.rows[0].model, "Gemini 3.8 Flash");
  assert.equal(report.rows[0].category, "input");
});

test("exclusive categories cover output-before-input, cached images, storage, memory and infrastructure", () => {
  const cases = [
    [
      "Generate content output token count gemini 2.5 flash short input text",
      "output",
      "Gemini API",
    ],
    ["Gemini 2.5 Pro Thinking Text Output - Predictions", "output"],
    ["Gemini 3 Flash Image Input Caching Priority", "cached_input"],
    ["Gemini 3.8 Flash Text Input Caching Storage", "cache_storage"],
    ["Gemini 3.8 Flash Global Image Input - Predictions", "image"],
    ["Gemini 3.1 Flash Lite Global Audio Input - Predictions", "input"],
    ["Grounding with Google Search on Gemini 3", "search"],
    ["Generate content search query gemini 3 free", "search", "Gemini API"],
    ["Agent Platform Memory", "agent_runtime"],
    ["Embeddings for Text - Memory Bank", "memory"],
    ["Large Text Embedding Model - Predictions", "ai_other"],
    ["Image Storage Memory Input", "cloud_other", "Cloud Storage"],
  ];
  const report = parseBillingCsv(
    fixture(cases.map(([sku, , service]) => ({ sku, service }))),
  );
  for (const [sku, category] of cases)
    assert.equal(
      report.rows.find((row) => row.sku === sku).category,
      category,
      sku,
    );
  assert.equal(sumMicros(report.rows), cases.length * 1_000_000);
  assert.equal(
    report.rows.find((row) => row.sku.includes("3.1 Flash Lite")).model,
    "Gemini 3.1 Flash Lite",
  );
});

test("already discounted net subtotal is used without subtracting savings again", () => {
  const report = parseBillingCsv(fixture([{ net: 10 }]));
  assert.equal(report.rows[0].net_eur, 10);
});

test("incomplete, inconsistent, malformed or unsupported exports are rejected", () => {
  const csv = fixture([{ net: 1 }]);
  for (const [label, text] of [
    ["summary mismatch", fixture([{ net: 1 }], { netTotal: 2 })],
    ["missing footer", fixture([{ net: 1 }], { footer: false })],
    ["impossible day", fixture([{ net: 1 }], { date: "2026-02-30" })],
    ["monthly export", csv.replace("Datum", "Monat")],
    ["wrong currency", csv.replaceAll("(€)", "($)")],
    ["NaN usage", csv.replace('"1.234,5"', '"NaN"')],
    ["Infinity cost", csv.replace('"20,00"', '"Infinity"')],
    ["broken quotes", csv + '"unfinished'],
    ["duplicate header", csv.replace("Dienst-ID", "SKU-ID")],
    [
      "duplicate rows",
      fixture([{ net: 1 }, { net: 1 }]).replace("SKU-1", "SKU-0"),
    ],
  ])
    assert.throws(() => parseBillingCsv(text), undefined, label);
  assert.throws(
    () => parseBillingCsv("x".repeat(MAX_CSV_BYTES + 1)),
    (error) => error.status === 413,
  );
});

test("auth and method guards run before reading source data", async () => {
  const h = harness();
  for (const pw of ["", "wrong", ["offline-test-password"]]) {
    const res = await h.request("GET", undefined, pw);
    assert.equal(res.statusCode, 401);
    assert.equal(res.headers["Cache-Control"], "private, no-store");
    assert.deepEqual(res.body, { error: "Unauthorized" });
  }
  const unsupported = await h.request("DELETE");
  assert.equal(unsupported.statusCode, 405);
  assert.equal(unsupported.headers.Allow, "GET, POST");
  assert.deepEqual(h.calls, { reads: 0, writes: 0 });
});

test("GET returns stored original timestamp and never writes", async () => {
  const h = harness();
  const res = await h.request();
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.captured_at, capturedAt);
  assert.equal(res.body.warning, null);
  assert.equal(sumMicros(res.body.rows), 13_100_000);
  assert.deepEqual(h.calls, { reads: 1, writes: 0 });
});

test("production endpoint has no repository-file fallback", async () => {
  const source = await readFile(
    new URL("../api/ai-billing.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /node:fs|readFile|readSeed|ai-billing-seed|\.\.\/data\//,
  );
});

test("404 is an empty report; denied or corrupt cache returns a safe error", async () => {
  const absent = harness({ getError: { code: 404 } });
  const empty = await absent.request();
  assert.equal(empty.statusCode, 200);
  assert.deepEqual(empty.body, {
    available: false,
    hint: "Noch kein Billing-Bericht gespeichert. Bitte eine Billing-CSV importieren.",
  });
  assert.deepEqual(absent.calls, { reads: 1, writes: 0 });
  for (const options of [
    {
      getError: { response: { status: 403 }, message: "private access token" },
    },
    { fields: {} },
    {
      fields: {
        schema: { integerValue: "1" },
        data_b64: { stringValue: "broken" },
      },
    },
  ]) {
    const h = harness(options);
    const res = await h.request();
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, {
      available: false,
      error: "Der Billing-Bericht konnte nicht geladen werden.",
    });
    assert.doesNotMatch(JSON.stringify(res.body), /private access token/);
    assert.equal(h.calls.writes, 0);
  }
});

test("valid POST atomically replaces only the billing document and survives GET", async () => {
  const h = harness();
  const csv = fixture([{ net: 2.25 }, { net: -0.25, service: "Cloud Run" }]);
  const imported = await h.request("POST", JSON.stringify({ csv }));
  assert.equal(imported.statusCode, 200);
  assert.equal(imported.body.captured_at, "2026-09-13T10:00:00.000Z");
  assert.equal(imported.body.from, "2026-09-12");
  assert.equal(imported.body.to, "2026-09-12");
  assert.match(imported.body.scope, /Projektzuordnung im CSV nicht enthalten/);
  assert.equal(sumMicros(imported.body.rows), 2_000_000);
  assert.equal(h.calls.reads, 0);
  assert.equal(h.calls.writes, 1);
  const stored = await h.request();
  assert.deepEqual(stored.body, imported.body);
});

test("validation and storage failures keep the previous report and conceal provider details", async () => {
  const h = harness();
  const previous = h.saved();
  for (const body of [
    { csv: "not a report" },
    { csv: fixture([{ net: 1 }], { netTotal: 2 }) },
    { csv: "x".repeat(MAX_CSV_BYTES + 1) },
    { wrong: "field" },
    "{malformed",
  ]) {
    const res = await h.request("POST", body);
    assert.ok([400, 413].includes(res.statusCode));
    assert.equal(h.saved(), previous);
  }
  assert.equal(h.calls.writes, 0);
  const denied = harness({
    patchError: new Error("private provider credential"),
  });
  const deniedPrevious = denied.saved();
  const res = await denied.request("POST", { csv: fixture([{ net: 1 }]) });
  assert.equal(res.statusCode, 503);
  assert.equal(denied.saved(), deniedPrevious);
  assert.doesNotMatch(res.body.error, /private provider credential/);
});

test("compressed Firestore field limit rejects oversized snapshots before storage", () => {
  assert.throws(
    () =>
      encodeSnapshot({ payload: randomBytes(1_000_000).toString("base64") }),
    (error) => error.status === 413,
  );
  assert.throws(
    () => encodeSnapshot({ payload: "a".repeat(4_000_001) }),
    (error) => error.status === 413,
  );
});
