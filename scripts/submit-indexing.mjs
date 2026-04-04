#!/usr/bin/env node
/**
 * Submit new URLs to IndexNow (Bing/Yandex/etc.) and Google Indexing API.
 *
 * Usage:
 *   node scripts/submit-indexing.mjs                          # submit default URLs
 *   node scripts/submit-indexing.mjs /foo/ /bar/              # submit custom paths
 *
 * Environment variables:
 *   GCP_SA_B64  — base64-encoded Google service account JSON (for Google Indexing API)
 *                 If not set, Google indexing is skipped.
 */

const SITE_URL = "https://www.mahlzait.de";
const INDEXNOW_KEY = "1c802a7f00434fe04c269ffb5f9e526a";

// Default URLs to submit (the new pages)
const DEFAULT_PATHS = [
  "/essensplan-erstellen/",
  "/trainingsplan-erstellen/",
];

const paths = process.argv.length > 2
  ? process.argv.slice(2).map((p) => p.startsWith("/") ? p : `/${p}`)
  : DEFAULT_PATHS;

const urls = paths.map((p) => `${SITE_URL}${p}`);

console.log(`\n📋 URLs to submit:\n${urls.map((u) => `   ${u}`).join("\n")}\n`);

// ── IndexNow ──────────────────────────────────────────────────────────────────

async function submitIndexNow() {
  console.log("🔵 IndexNow: Submitting...");

  // Submit to all IndexNow endpoints
  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
  ];

  const body = JSON.stringify({
    host: "www.mahlzait.de",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      return { endpoint, status: res.status, ok: res.ok };
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") {
      const { endpoint, status, ok } = r.value;
      const name = new URL(endpoint).hostname;
      console.log(`   ${ok ? "✅" : "⚠️"}  ${name}: HTTP ${status}`);
    } else {
      console.log(`   ❌ Error: ${r.reason?.message || r.reason}`);
    }
  }
}

// ── Google Indexing API ────────────────────────────────────────────────────────

async function submitGoogle() {
  const saB64 = process.env.GCP_SA_B64;
  if (!saB64) {
    console.log("🟡 Google Indexing API: Skipped (GCP_SA_B64 not set)");
    console.log("   Set GCP_SA_B64 with base64-encoded service account JSON to enable.");
    return;
  }

  console.log("🔴 Google Indexing API: Submitting...");

  try {
    // Dynamic import to avoid requiring googleapis when not needed
    const { google } = await import("googleapis");

    const saJson = JSON.parse(Buffer.from(saB64, "base64").toString("utf-8"));
    const auth = new google.auth.GoogleAuth({
      credentials: saJson,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });

    const indexing = google.indexing({ version: "v3", auth });

    for (const url of urls) {
      try {
        const res = await indexing.urlNotifications.publish({
          requestBody: {
            url,
            type: "URL_UPDATED",
          },
        });
        console.log(`   ✅ ${url}: ${res.status} — notifyTime: ${res.data.urlNotificationMetadata?.latestUpdate?.notifyTime || "ok"}`);
      } catch (e) {
        const status = e.response?.status || e.code;
        const msg = e.response?.data?.error?.message || e.message;
        console.log(`   ⚠️  ${url}: ${status} — ${msg}`);
      }
    }
  } catch (e) {
    console.log(`   ❌ Google error: ${e.message}`);
  }
}

// ── Google Search Console: Request Indexing via URL Inspection ─────────────────

async function pingSearchConsole() {
  const saB64 = process.env.GCP_SA_B64;
  if (!saB64) return; // Already logged in submitGoogle

  console.log("🔍 Google Search Console: Inspecting URLs...");

  try {
    const { google } = await import("googleapis");

    const saJson = JSON.parse(Buffer.from(saB64, "base64").toString("utf-8"));
    const auth = new google.auth.GoogleAuth({
      credentials: saJson,
      scopes: ["https://www.googleapis.com/auth/webmasters"],
    });

    const searchconsole = google.searchconsole({ version: "v1", auth });

    for (const url of urls) {
      try {
        const res = await searchconsole.urlInspection.index.inspect({
          requestBody: {
            inspectionUrl: url,
            siteUrl: SITE_URL,
          },
        });
        const verdict = res.data.inspectionResult?.indexStatusResult?.verdict || "UNKNOWN";
        const coverageState = res.data.inspectionResult?.indexStatusResult?.coverageState || "?";
        console.log(`   📊 ${url}: verdict=${verdict}, coverage=${coverageState}`);
      } catch (e) {
        const msg = e.response?.data?.error?.message || e.message;
        console.log(`   ⚠️  ${url}: ${msg}`);
      }
    }
  } catch (e) {
    console.log(`   ❌ GSC error: ${e.message}`);
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  await submitIndexNow();
  console.log("");
  await submitGoogle();
  console.log("");
  await pingSearchConsole();
  console.log("\n✨ Done!\n");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
