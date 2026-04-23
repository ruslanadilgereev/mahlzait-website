#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing/Yandex/etc.) and Google Indexing API.
 *
 * Usage:
 *   node scripts/submit-indexing.mjs                          # default: 2 hardcoded new pages
 *   node scripts/submit-indexing.mjs /foo/ /bar/              # custom paths
 *   node scripts/submit-indexing.mjs --all                    # all non-food URLs from live sitemap
 *   node scripts/submit-indexing.mjs --all --dry-run          # show URLs without submitting
 *
 * Google Indexing API quota: 200 URLs/day/project (soft limit per Google).
 *
 * Environment variables:
 *   GCP_SA_B64  — base64-encoded Google service account JSON
 *   GCP_SA_FILE — path to Google service account JSON (alternative)
 *   If neither set, Google indexing is skipped (IndexNow still runs).
 */

const SITE_URL = "https://www.mahlzait.de";
const INDEXNOW_KEY = "1c802a7f00434fe04c269ffb5f9e526a";

// URL-Path-Prefixes to EXCLUDE from --all (food-detail-pages kompetitive Nische, skip for quota)
const EXCLUDE_URL_PATTERNS = ["/kalorien/"];
// Legacy food-detail-hub stays in: only per-food pages like /kalorien/apfel/ are filtered.
const KEEP_URL_EXACT = new Set([
  "https://www.mahlzait.de/kalorien/",
  "https://www.mahlzait.de/kalorien/kategorie/supermarkt/",
  "https://www.mahlzait.de/kalorien/kategorie/gericht/",
  "https://www.mahlzait.de/kalorien/kategorie/fast-food/",
  "https://www.mahlzait.de/kalorien/kategorie/getraenk/",
]);

// Default URLs to submit when no args given (latest new pages)
const DEFAULT_PATHS = [
  "/essensplan-erstellen/",
  "/trainingsplan-erstellen/",
];

const args = process.argv.slice(2);
const isAllMode = args.includes("--all");
const isDryRun = args.includes("--dry-run");
const customPaths = args.filter((a) => !a.startsWith("--"));

async function fetchAllSitemapUrls() {
  const indexRes = await fetch(`${SITE_URL}/sitemap-index.xml`);
  if (!indexRes.ok) throw new Error(`Sitemap-Index fetch failed: ${indexRes.status}`);
  const indexXml = await indexRes.text();
  const sitemapLocs = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  console.log(`📑 Sitemaps: ${sitemapLocs.length} child(ren) in index`);

  const allLocs = [];
  for (const sitemapUrl of sitemapLocs) {
    const res = await fetch(sitemapUrl);
    if (!res.ok) {
      console.warn(`   ⚠️  ${sitemapUrl}: HTTP ${res.status}`);
      continue;
    }
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    allLocs.push(...locs);
    console.log(`   ✓ ${new URL(sitemapUrl).pathname}: ${locs.length} URLs`);
  }

  const before = allLocs.length;
  const filtered = allLocs.filter((loc) => {
    if (KEEP_URL_EXACT.has(loc)) return true;
    return !EXCLUDE_URL_PATTERNS.some((p) => loc.includes(p));
  });
  console.log(`   🔍 Filter ${EXCLUDE_URL_PATTERNS.join(", ")} (except hubs): ${before}${filtered.length} URLs`);
  return filtered;
}

let urls;
if (isAllMode) {
  urls = await fetchAllSitemapUrls();
} else if (customPaths.length > 0) {
  urls = customPaths
    .map((p) => (p.startsWith("/") ? p : `/${p}`))
    .map((p) => `${SITE_URL}${p}`);
} else {
  urls = DEFAULT_PATHS.map((p) => `${SITE_URL}${p}`);
}

if (urls.length > 200) {
  console.log(`\n⚠️  ${urls.length} URLs > 200/day Google Indexing API quota.`);
  console.log(`   First 200 will be submitted. Re-run tomorrow for the rest.\n`);
  urls = urls.slice(0, 200);
}

console.log(`\n📋 URLs to submit (${urls.length}):\n${urls.slice(0, 10).map((u) => `   ${u}`).join("\n")}${urls.length > 10 ? `\n   … and ${urls.length - 10} more` : ""}\n`);

if (isDryRun) {
  console.log("🏃 DRY RUN — no submissions made. Exiting.\n");
  console.log(`Full URL list:\n${urls.map((u) => `   ${u}`).join("\n")}\n`);
  process.exit(0);
}

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

async function loadServiceAccount() {
  const saB64 = process.env.GCP_SA_B64;
  if (saB64) return JSON.parse(Buffer.from(saB64, "base64").toString("utf-8"));

  const saFile = process.env.GCP_SA_FILE;
  if (saFile) {
    const fs = await import("node:fs/promises");
    return JSON.parse(await fs.readFile(saFile, "utf-8"));
  }
  return null;
}

async function submitGoogle() {
  const saJson = await loadServiceAccount();
  if (!saJson) {
    console.log("🟡 Google Indexing API: Skipped (no credentials)");
    console.log("   Set GCP_SA_B64 (base64 JSON) or GCP_SA_FILE (path) to enable.");
    return { ok: 0, failed: 0 };
  }

  console.log(`🔴 Google Indexing API: Submitting ${urls.length} URLs...`);

  let ok = 0;
  let failed = 0;

  try {
    const { google } = await import("googleapis");

    const auth = new google.auth.GoogleAuth({
      credentials: saJson,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });

    const indexing = google.indexing({ version: "v3", auth });

    for (const url of urls) {
      try {
        const res = await indexing.urlNotifications.publish({
          requestBody: { url, type: "URL_UPDATED" },
        });
        ok++;
        const time = res.data.urlNotificationMetadata?.latestUpdate?.notifyTime || "ok";
        console.log(`   ✅ ${url} — ${time}`);
      } catch (e) {
        failed++;
        const status = e.response?.status || e.code;
        const msg = e.response?.data?.error?.message || e.message;
        console.log(`   ⚠️  ${url}: ${status} — ${msg}`);
        // Stop early on quota-exhausted or permission errors
        if (status === 429 || status === 403) {
          console.log(`   🛑 Stopping: ${status === 429 ? "quota exhausted" : "permission denied"}`);
          break;
        }
      }
      // Rate-limit: ~1 request per 600ms to stay comfortably under 200 QPM
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.log(`   ❌ Google error: ${e.message}`);
  }

  console.log(`\n   Summary: ${ok} ok, ${failed} failed`);
  return { ok, failed };
}

// ── Google Search Console: Request Indexing via URL Inspection ─────────────────

async function pingSearchConsole() {
  const saJson = await loadServiceAccount();
  if (!saJson) return; // Already logged in submitGoogle

  // Skip GSC inspection on bulk runs — each call costs ~2s and adds little on top of Indexing API
  if (urls.length > 20) {
    console.log(`🔍 Google Search Console: Skipped (${urls.length} URLs, too many — use for single-URL debugging)`);
    return;
  }

  console.log("🔍 Google Search Console: Inspecting URLs...");

  try {
    const { google } = await import("googleapis");

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
