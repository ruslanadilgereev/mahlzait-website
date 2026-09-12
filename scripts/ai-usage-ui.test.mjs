import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { parseBillingCsv } from "../api/ai-billing.mjs";

const html = readFileSync(
  new URL("../public/leaderboard/index.html", import.meta.url),
  "utf8",
);
const billingJs = readFileSync(
  new URL("../public/leaderboard/ai-billing.js", import.meta.url),
  "utf8",
);
const rangeCode = html.slice(
  html.indexOf("    let aiData ="),
  html.indexOf("    // ---------- Filter (ai-eigene"),
);
test("the displayed ID links to its RevenueCat profile; missing or unsafe links remain text", () => {
  const cellCode = html.slice(
    html.indexOf("    function aiUserCell("),
    html.indexOf("    function aiTopTable("),
  );
  const ctx = vm.createContext({
    escapeHtml: (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;"),
  });
  vm.runInContext(cellCode, ctx);
  const url = "https://app.revenuecat.com/customers/41604426/fixture-user";
  const cell = ctx.aiUserCell({ u: "abcd1234", revenuecat_url: url });
  assert.ok(cell.includes(`href="${url}"`));
  assert.ok(cell.includes('target="_blank"'));
  assert.ok(cell.includes('rel="noopener noreferrer"'));
  assert.ok(cell.endsWith(">abcd1234</a>"));
  assert.ok(!ctx.aiUserCell({ u: "abcd1234" }).includes("<a "));
  assert.ok(
    !ctx
      .aiUserCell({ u: "abcd1234", revenuecat_url: "javascript:alert(1)" })
      .includes("<a "),
  );
  assert.ok(
    !ctx
      .aiUserCell({
        u: "abcd1234",
        revenuecat_url: "https://example.com/customers/41604426/test",
      })
      .includes("<a "),
  );
});
const context = () => {
  const ctx = vm.createContext({});
  vm.runInContext(rangeCode, ctx);
  return ctx;
};
const sample = () => ({
  u: "sample",
  revenuecat_url: "https://app.revenuecat.com/customers/41604426/fixture-user",
  month: "2026-09",
  requests: 2,
  input_tokens: 100,
  cached_tokens: 50,
  output_tokens: 20,
  thinking_tokens: 10,
  cost_eur: 10,
  cost_breakdown: {
    input_eur: 4,
    cached_input_eur: 1,
    output_eur: 2,
    thinking_eur: 3,
  },
  by_model: { "gemini-3.8-flash": { cost_eur: 10 } },
  days: { "09": [1, 40, 20, 8, 4, 4], 10: [1, 60, 30, 12, 6, 6] },
});
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test("all inline dashboard JavaScript is syntactically valid", () => {
  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!match[1].includes("application/")) new vm.Script(match[2]);
  }
});
test("date slices scale token components once and preserve monthly records", () => {
  const ctx = context();
  ctx.record = sample();
  const before = JSON.stringify(ctx.record);
  vm.runInContext('aiFrom="2026-09-10"; aiTo="2026-09-10";', ctx);
  const sliced = vm.runInContext("aiSliceRecord(record)", ctx);
  close(sliced.cost_eur, 6);
  close(sliced.cost_breakdown.input_eur, 2.4);
  close(
    Object.values(sliced.cost_breakdown).reduce((a, b) => a + b, 0),
    6,
  );
  assert.equal(JSON.stringify(ctx.record), before);
});
test("cross-month merges reconcile components without mutating their source", () => {
  const ctx = context();
  ctx.records = [sample(), { ...sample(), month: "2026-10" }];
  const before = JSON.stringify(ctx.records);
  vm.runInContext('aiFrom="2026-09-01"; aiTo="2026-10-31";', ctx);
  const merged = vm.runInContext(
    "aiMergeSlices(records.map(r=>({r,s:aiSliceRecord(r)})))",
    ctx,
  );
  assert.equal(merged.length, 1);
  close(merged[0].cost_eur, 20);
  close(
    Object.values(merged[0].cost_breakdown).reduce((a, b) => a + b, 0),
    20,
  );
  assert.equal(JSON.stringify(ctx.records), before);
});
test("legacy costs remain available without invented component values", () => {
  const ctx = context();
  ctx.record = { ...sample(), cost_breakdown: null };
  vm.runInContext('aiFrom="2026-09-10"; aiTo="2026-09-10";', ctx);
  const sliced = vm.runInContext("aiSliceRecord(record)", ctx);
  close(sliced.cost_eur, 6);
  assert.equal(sliced.cost_breakdown, null);
});
test("billing chart rollups match the invented synthetic CSV totals", () => {
  const ctx = vm.createContext({});
  vm.runInContext(billingJs, ctx);
  const report = parseBillingCsv(
    readFileSync(new URL("./fixtures/ai-billing.csv", import.meta.url), "utf8"),
  );
  const agg = ctx.aiBillingAggregate(report.rows);
  close(agg.total, 13.1);
  close(agg.ai, 12.05);
  close(agg.search, 5);
  close(
    [...agg.categories.values()].reduce((a, b) => a + b, 0),
    agg.total,
  );
  const day = ctx.aiBillingAggregate(
    report.rows.filter((row) => row.date === "2026-09-10"),
  );
  close(day.total, 5.5);
  close(day.search, 3);
  assert.equal(day.days.size, 1);
  assert.equal(agg.models.has("Gemini 3"), false);
});
test("refunds retain their sign and absent billing days never become zero days", () => {
  const ctx = vm.createContext({});
  vm.runInContext(billingJs, ctx);
  const agg = ctx.aiBillingAggregate([
    { date: "2026-09-10", category: "search", net_eur: 5, model: null },
    { date: "2026-09-10", category: "search", net_eur: -2, model: null },
  ]);
  close(agg.total, 3);
  close(agg.search, 3);
  assert.equal(agg.days.has("2026-09-11"), false);
  const empty = ctx.aiBillingAggregate([]);
  assert.equal(empty.days.size, 0);
});
