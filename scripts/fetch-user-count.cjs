/**
 * Pre-build: Fetch stats from Firebase Auth + GA4 -> src/data/stats.json
 * Runs automatically before every build via package.json "prebuild" script.
 *
 * Needs GOOGLE_SA_KEY env var with the service account JSON (base64 encoded)
 * or GOOGLE_APPLICATION_CREDENTIALS pointing to the JSON file.
 */

const { writeFileSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");

const STATS_PATH = join(__dirname, "..", "src", "data", "stats.json");
const PROJECT_ID = "mytemple-460913";
const GA4_PROPERTY = "properties/490479548";

function getAuthOptions() {
  if (process.env.GOOGLE_SA_KEY) {
    const saJson = JSON.parse(
      Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf-8")
    );
    return { credentials: saJson, scopes: [
      "https://www.googleapis.com/auth/identitytoolkit",
      "https://www.googleapis.com/auth/analytics.readonly",
    ]};
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        "https://www.googleapis.com/auth/identitytoolkit",
        "https://www.googleapis.com/auth/analytics.readonly",
      ],
    };
  }
  return null;
}

async function fetchUserCount(google, auth) {
  const client = await auth.getClient();
  const identityToolkit = google.identitytoolkit({ version: "v3", auth: client });

  let total = 0;
  let nextPageToken;
  do {
    const result = await identityToolkit.relyingparty.downloadAccount({
      requestBody: { maxResults: 500, targetProjectId: PROJECT_ID, nextPageToken },
    });
    total += (result.data.users || []).length;
    nextPageToken = result.data.nextPageToken || undefined;
  } while (nextPageToken);

  return total;
}

async function fetchGA4Events(google, auth) {
  const analyticsdata = google.analyticsdata({ version: "v1beta", auth });

  const response = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY,
    requestBody: {
      dateRanges: [{ startDate: "2025-01-01", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: ["meal_logged", "fab_ai_clicked", "chat_log_used", "barcode_scanned"],
          },
        },
      },
    },
  });

  const events = {};
  for (const row of response.data.rows || []) {
    events[row.dimensionValues[0].value] = parseInt(row.metricValues[0].value);
  }
  return events;
}

function formatNumber(n) {
  const rounded = Math.floor(n / 100) * 100;
  return rounded.toLocaleString("de-DE") + "+";
}

async function main() {
  const authOptions = getAuthOptions();

  if (!authOptions) {
    console.log("[stats] No credentials found, keeping existing stats.json");
    if (existsSync(STATS_PATH)) {
      const existing = JSON.parse(readFileSync(STATS_PATH, "utf-8"));
      console.log(`[stats] Existing: ${existing.displayCount} users`);
    }
    return;
  }

  try {
    const { google } = require("googleapis");
    const auth = new google.auth.GoogleAuth(authOptions);

    // Fetch both in parallel
    const [userCount, ga4Events] = await Promise.all([
      fetchUserCount(google, auth),
      fetchGA4Events(google, auth).catch((err) => {
        console.error("[stats] GA4 error:", err.message);
        return null;
      }),
    ]);

    const mealsLogged = ga4Events?.meal_logged || 0;
    const aiPhotos = (ga4Events?.fab_ai_clicked || 0) + (ga4Events?.chat_log_used || 0);
    const barcodeScans = ga4Events?.barcode_scanned || 0;

    const stats = {
      totalUsers: userCount,
      displayCount: formatNumber(userCount),
      mealsLogged,
      mealsLoggedDisplay: formatNumber(mealsLogged),
      aiPhotos,
      aiPhotosDisplay: formatNumber(aiPhotos),
      barcodeScans,
      barcodeScansDisplay: formatNumber(barcodeScans),
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
    console.log(`[stats] Users: ${userCount} -> "${stats.displayCount}"`);
    console.log(`[stats] Meals: ${mealsLogged} -> "${stats.mealsLoggedDisplay}"`);
    console.log(`[stats] AI: ${aiPhotos} -> "${stats.aiPhotosDisplay}"`);
    console.log(`[stats] Barcodes: ${barcodeScans} -> "${stats.barcodeScansDisplay}"`);
  } catch (err) {
    console.error("[stats] Error:", err.message);
    console.log("[stats] Keeping existing stats.json");
  }
}

main();
