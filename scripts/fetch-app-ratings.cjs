/**
 * Pre-build: Fetch real App Store ratings via iTunes Lookup API
 *   -> src/data/app-ratings.json         (Mahlzait, for the aggregateRating schema)
 *   -> src/data/calorie-app-ratings.json (all apps in src/data/calorie-apps.json,
 *                                         shown on the comparison pages)
 *
 * Runs before every build. iTunes API is public (no auth) and returns
 * `averageUserRating` + `userRatingCount` for a given app ID. The Play
 * Store has no equivalent official API, so we ship iOS-only ratings
 * in the aggregateRating schema. This is transparent and legitimate.
 *
 * If the fetch fails (network, rate limit, app not found), we keep
 * the existing file and skip writing — Schema-Consumer handles the
 * absence gracefully.
 */

const { writeFileSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");
const https = require("https");

const OUT_PATH = join(__dirname, "..", "src", "data", "app-ratings.json");
const APPS_PATH = join(__dirname, "..", "src", "data", "calorie-apps.json");
const COMPARISON_OUT_PATH = join(
  __dirname,
  "..",
  "src",
  "data",
  "calorie-app-ratings.json"
);
const APP_ID = "6747400456";
const COUNTRY = "de";
const URL = `https://itunes.apple.com/lookup?id=${APP_ID}&country=${COUNTRY}`;
const MIN_RATING_COUNT = 5; // Schema.org requires aggregateRating with real reviews

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function main() {
  try {
    const json = await fetchJson(URL);
    const result = json?.results?.[0];

    if (!result) {
      console.log("[app-ratings] App not found in iTunes lookup, skipping");
      return;
    }

    const ratingValue = result.averageUserRating;
    const ratingCount = result.userRatingCount;
    const trackName = result.trackName;

    if (typeof ratingValue !== "number" || typeof ratingCount !== "number") {
      console.log("[app-ratings] Invalid rating fields, skipping");
      return;
    }

    if (ratingCount < MIN_RATING_COUNT) {
      console.log(
        `[app-ratings] Too few ratings (${ratingCount} < ${MIN_RATING_COUNT}), skipping aggregateRating`
      );
      // Write an explicit "skip" marker so Schema-Consumer knows
      writeFileSync(
        OUT_PATH,
        JSON.stringify(
          {
            hasAggregateRating: false,
            reason: `ratingCount ${ratingCount} below threshold ${MIN_RATING_COUNT}`,
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
      return;
    }

    const data = {
      hasAggregateRating: true,
      ratingValue: Number(ratingValue.toFixed(1)),
      ratingCount,
      bestRating: 5,
      worstRating: 1,
      source: "iTunes Lookup API",
      appName: trackName,
      appId: APP_ID,
      country: COUNTRY,
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
    console.log(
      `[app-ratings] ${trackName}: ${data.ratingValue} ★ (${data.ratingCount} reviews)`
    );
  } catch (err) {
    console.error("[app-ratings] Fetch failed:", err.message);
    if (existsSync(OUT_PATH)) {
      console.log("[app-ratings] Keeping existing app-ratings.json");
    } else {
      // Seed an initial "no rating" file so imports don't fail
      writeFileSync(
        OUT_PATH,
        JSON.stringify(
          {
            hasAggregateRating: false,
            reason: "initial seed, fetch failed",
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
    }
  }
}

/**
 * Ratings for every app on the comparison pages, in one batch lookup.
 * Apps missing from the response keep their last known rating, and a failed
 * request keeps the whole file, so the pages always build.
 */
async function fetchComparisonRatings() {
  try {
    const ids = JSON.parse(readFileSync(APPS_PATH, "utf8")).apps.map(
      (app) => app.appStoreId
    );
    const json = await fetchJson(
      `https://itunes.apple.com/lookup?id=${ids.join(",")}&country=${COUNTRY}`
    );
    const previous = existsSync(COMPARISON_OUT_PATH)
      ? JSON.parse(readFileSync(COMPARISON_OUT_PATH, "utf8")).apps || {}
      : {};

    const apps = {};
    let fresh = 0;
    for (const id of ids) {
      const result = (json?.results || []).find(
        (entry) => String(entry.trackId) === id
      );
      if (
        result &&
        typeof result.averageUserRating === "number" &&
        typeof result.userRatingCount === "number"
      ) {
        apps[id] = {
          trackName: result.trackName,
          ratingValue: Number(result.averageUserRating.toFixed(2)),
          ratingCount: result.userRatingCount,
        };
        fresh++;
      } else if (previous[id]) {
        apps[id] = previous[id];
      }
    }

    writeFileSync(
      COMPARISON_OUT_PATH,
      JSON.stringify(
        {
          source: "iTunes Lookup API",
          country: COUNTRY,
          updatedAt: new Date().toISOString(),
          apps,
        },
        null,
        2
      ) + "\n"
    );
    console.log(
      `[app-ratings] Comparison: ${fresh}/${ids.length} apps refreshed`
    );
  } catch (err) {
    console.error("[app-ratings] Comparison fetch failed:", err.message);
    console.log("[app-ratings] Keeping existing calorie-app-ratings.json");
  }
}

main().then(fetchComparisonRatings);
