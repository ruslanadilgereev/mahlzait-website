const { google } = require("googleapis");

const PROJECT_ID = "mytemple-460913";
const DAYS = 10;

async function main() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/identitytoolkit"],
  });
  const client = await auth.getClient();
  const idtk = google.identitytoolkit({ version: "v3", auth: client });

  const now = Date.now();
  const cutoff = now - DAYS * 24 * 3600 * 1000;
  const buckets = {};

  let nextPageToken;
  let totalScanned = 0;
  do {
    const res = await idtk.relyingparty.downloadAccount({
      requestBody: { maxResults: 1000, targetProjectId: PROJECT_ID, nextPageToken },
    });
    const users = res.data.users || [];
    totalScanned += users.length;
    for (const u of users) {
      const created = Number(u.createdAt);
      if (!created) continue;
      if (created < cutoff) continue;
      const d = new Date(created);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = (buckets[key] || 0) + 1;
    }
    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);

  console.log(`Scanned ${totalScanned} total user records`);
  console.log(`\nRegistrierungen der letzten ${DAYS} Tage:`);
  const keys = Object.keys(buckets).sort().reverse();
  let sum = 0;
  for (const k of keys) {
    console.log(`  ${k}: ${buckets[k]}`);
    sum += buckets[k];
  }
  console.log(`\nSumme: ${sum}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
