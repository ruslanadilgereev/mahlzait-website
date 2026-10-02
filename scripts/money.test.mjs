import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import * as money from "../api/money.mjs";

const html = readFileSync(
  new URL("../public/leaderboard/index.html", import.meta.url),
  "utf8",
);

test("Google Cloud is the whole bill per day, not only the AI SKUs", () => {
  const { days, from } = money.gcloudDailyCost([
    { date: "2026-09-01", service: "Vertex AI", category: "output", net_eur: 10 },
    { date: "2026-09-01", service: "App Engine", category: "cloud_other", net_eur: 2.5 },
    { date: "2026-09-02", service: "Gemini API", category: "input", net_eur: 4 },
  ]);
  assert.equal(days.get("2026-09-01"), 12.5);
  assert.equal(days.get("2026-09-02"), 4);
  assert.equal(from, "2026-09-01");
});

test("coverage starts at the gap-free block, not at fragmentary early days", () => {
  const rows = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-08-01", "2026-08-02", "2026-08-03"]
    .map((date) => ({ date, service: "Vertex AI", net_eur: 1 }));
  assert.equal(money.gcloudDailyCost(rows).from, "2026-08-01");
  assert.equal(money.gcloudDailyCost([]).from, null);
});

test("merge replaces the token estimate with the bill and keeps days outside the window", () => {
  const rows = money.mergeHistory({
    prev: {
      days: [
        { d: "2026-07-31", rev_usd: 0, gcloud: 5 },
        { d: "2026-08-01", rev_usd: 0, ai: 3.1, gcloud: 99 },
      ],
    },
    rc: new Map(),
    apple: null,
    gads: null,
    gcloudDays: new Map([["2026-08-01", 12.5], ["2026-08-02", 4]]),
    gcloudFrom: "2026-08-01",
    rcFrom: "2026-08-01",
    adFrom: "2026-08-01",
    today: "2026-08-03",
  });
  const byDay = Object.fromEntries(rows.map((r) => [r.d, r]));
  assert.equal(byDay["2026-07-31"].gcloud, 5);
  assert.equal(byDay["2026-08-01"].gcloud, 12.5);
  assert.equal(byDay["2026-08-02"].gcloud, 4);
  assert.equal(byDay["2026-08-03"].gcloud, 0);
  assert.ok(rows.every((r) => !("ai" in r)), "the old token estimate must not survive");
});

test("the result subtracts the Google Cloud bill", () => {
  const code = html.slice(
    html.indexOf("    function moCalc("),
    html.indexOf("    function moRowsIn("),
  );
  const ctx = vm.createContext({});
  vm.runInContext(code + "\nthis.moCalc = moCalc;", ctx);
  const c = ctx.moCalc(
    [{ rev_usd: 119, apple: 1, google: 2, gcloud: 30 }],
    { vat: 0.19, store: 0.15, rc: 0.01 },
    1,
  );
  assert.equal(c.gcloud, 30);
  assert.ok(Math.abs(c.result - (c.net - 3 - 30)) < 1e-9);
  assert.ok(Math.abs(c.costPerEuro - 33 / 119) < 1e-9);
});

test("the Geld tab no longer shows an AI estimate", () => {
  const view = html.slice(html.indexOf('<div id="view-money"'), html.indexOf('<div id="pe-tip">'));
  const script = html.slice(html.indexOf("    function moCalc("), html.indexOf("  </script>\n  <script src=\"/leaderboard/ai-billing.js\">"));
  for (const part of [view, script]) {
    assert.ok(!part.includes("AI-Kosten"), "label must be Google Cloud");
    assert.ok(part.includes("Google Cloud"));
  }
});
