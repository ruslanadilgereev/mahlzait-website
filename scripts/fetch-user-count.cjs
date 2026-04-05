/**
 * Pre-build: Fetch user count from Firebase Auth -> src/data/stats.json
 * Runs automatically before every build via package.json "prebuild" script.
 *
 * Needs GOOGLE_SA_KEY env var with the service account JSON (base64 encoded)
 * or GOOGLE_APPLICATION_CREDENTIALS pointing to the JSON file.
 */

const { writeFileSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");

const STATS_PATH = join(__dirname, "..", "src", "data", "stats.json");
const PROJECT_ID = "mytemple-460913";

async function fetchCount() {
  let authOptions;

  // Option 1: Base64-encoded service account in env (for Vercel)
  if (process.env.GOOGLE_SA_KEY) {
    const saJson = JSON.parse(
      Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf-8")
    );
    authOptions = { credentials: saJson, scopes: ["https://www.googleapis.com/auth/identitytoolkit"] };
  }
  // Option 2: Service account file path
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    authOptions = {
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/identitytoolkit"],
    };
  } else {
    console.log("[stats] No credentials found, keeping existing stats.json");
    return null;
  }

  const { google } = require("googleapis");
  const auth = new google.auth.GoogleAuth(authOptions);
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

async function main() {
  try {
    const count = await fetchCount();

    if (count === null) {
      // No credentials - keep existing file
      if (existsSync(STATS_PATH)) {
        const existing = JSON.parse(readFileSync(STATS_PATH, "utf-8"));
        console.log(`[stats] Keeping existing count: ${existing.displayCount}`);
      }
      return;
    }

    const rounded = Math.floor(count / 100) * 100;
    const formatted = rounded.toLocaleString("de-DE") + "+";

    const stats = {
      totalUsers: count,
      displayCount: formatted,
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
    console.log(`[stats] Firebase Auth: ${count} users -> "${formatted}"`);
  } catch (err) {
    console.error("[stats] Error:", err.message);
    console.log("[stats] Keeping existing stats.json");
  }
}

main();
