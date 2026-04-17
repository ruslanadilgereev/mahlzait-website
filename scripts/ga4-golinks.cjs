const { google } = require("googleapis");

const GA4_PROPERTY = "properties/490479548";
const SA_KEY = "C:/Projekte/claude/credentials/gcp/mytemple-460913-f4bd9c713995.json";

const START = process.argv[2] || "2025-10-01";
const END = process.argv[3] || "today";

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SA_KEY,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const client = await auth.getClient();
  const analyticsdata = google.analyticsdata({ version: "v1beta", auth: client });

  console.log(`\n=== /go/* Klicks (${START} bis ${END}) ===\n`);

  // 1) Pageviews pro /go/* Pfad
  const pv = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY,
    requestBody: {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "sessions" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/go/" },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    },
  });

  const rows = pv.data.rows || [];
  if (rows.length === 0) {
    console.log("Keine /go/* Klicks im Zeitraum.\n");
  } else {
    let totalPV = 0, totalU = 0, totalS = 0;
    console.log("Pfad".padEnd(30), "Views".padStart(8), "Users".padStart(8), "Sessions".padStart(10));
    console.log("-".repeat(58));
    for (const r of rows) {
      const path = r.dimensionValues[0].value;
      const views = parseInt(r.metricValues[0].value);
      const users = parseInt(r.metricValues[1].value);
      const sessions = parseInt(r.metricValues[2].value);
      totalPV += views; totalU += users; totalS += sessions;
      console.log(path.padEnd(30), String(views).padStart(8), String(users).padStart(8), String(sessions).padStart(10));
    }
    console.log("-".repeat(58));
    console.log("GESAMT".padEnd(30), String(totalPV).padStart(8), String(totalU).padStart(8), String(totalS).padStart(10));
  }

  // 2) UTM Source/Medium Breakdown (falls Landing auf /go/* kam)
  console.log(`\n=== Sessions nach utm_source / utm_medium (NUR wenn Landing = /go/*) ===\n`);
  const utm = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY,
    requestBody: {
      dateRanges: [{ startDate: START, endDate: END }],
      dimensions: [
        { name: "landingPage" },
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "landingPage",
          stringFilter: { matchType: "BEGINS_WITH", value: "/go/" },
        },
      },
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 50,
    },
  });

  const urows = utm.data.rows || [];
  if (urows.length === 0) {
    console.log("(keine)\n");
  } else {
    console.log("Landing".padEnd(25), "Source".padEnd(15), "Medium".padEnd(12), "Sess".padStart(6), "Users".padStart(6));
    console.log("-".repeat(70));
    for (const r of urows) {
      console.log(
        r.dimensionValues[0].value.padEnd(25),
        r.dimensionValues[1].value.padEnd(15),
        r.dimensionValues[2].value.padEnd(12),
        r.metricValues[0].value.padStart(6),
        r.metricValues[1].value.padStart(6),
      );
    }
  }
}

run().catch((e) => { console.error("Error:", e.message); process.exit(1); });
