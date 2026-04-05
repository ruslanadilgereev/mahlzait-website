/**
 * Pre-build script: Fetches total user count from Firebase Auth
 * and writes it to src/data/stats.json for use in config.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or service account JSON.
 * Run: npx tsx scripts/fetch-user-count.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";

async function fetchUserCount(): Promise<number> {
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    || process.env.FIREBASE_SA_PATH
    || "";

  if (!saPath) {
    console.log("No service account found, using fallback count");
    return 0;
  }

  try {
    const { google } = await import("googleapis");
    const auth = new google.auth.GoogleAuth({
      keyFile: saPath,
      scopes: ["https://www.googleapis.com/auth/identitytoolkit"],
    });

    const client = await auth.getClient();
    const identityToolkit = google.identitytoolkit({
      version: "v3",
      auth: client as any,
    });

    let total = 0;
    let nextPageToken: string | undefined;

    do {
      const result = await identityToolkit.relyingparty.downloadAccount({
        requestBody: {
          maxResults: 500,
          targetProjectId: "mytemple-460913",
          nextPageToken,
        },
      });
      total += result.data.users?.length || 0;
      nextPageToken = result.data.nextPageToken || undefined;
    } while (nextPageToken);

    return total;
  } catch (error) {
    console.error("Error fetching user count:", error);
    return 0;
  }
}

async function main() {
  const count = await fetchUserCount();

  // Round down to nearest 100 for display
  const rounded = Math.floor(count / 100) * 100;
  const formatted = rounded > 0
    ? `${rounded.toLocaleString("de-DE")}+`
    : "1.000+"; // fallback

  const stats = {
    totalUsers: count,
    displayCount: formatted,
    updatedAt: new Date().toISOString(),
  };

  const outPath = join(__dirname, "..", "src", "data", "stats.json");
  writeFileSync(outPath, JSON.stringify(stats, null, 2));
  console.log(`User count: ${count} -> display: "${formatted}" -> ${outPath}`);
}

main();
