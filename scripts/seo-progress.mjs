#!/usr/bin/env node
/**
 * SEO-Fortschritt messen
 *
 * Beantwortet zwei Fragen, die nach groesseren SEO-Aenderungen zaehlen:
 *   1. Kommen die Seiten in den Index, die vorher nicht drin waren?
 *   2. Bauen die neuen Seiten Impressionen auf?
 *
 * Nutzt denselben Service Account wie scripts/fetch-user-count.cjs.
 *
 * Aufruf:
 *   node scripts/seo-progress.mjs                 # letzte 28 Tage
 *   node scripts/seo-progress.mjs --days 7
 *   node scripts/seo-progress.mjs --index         # zusaetzlich Index-Status (langsam, max 10 URLs)
 *
 * Credentials (eine der beiden):
 *   GOOGLE_APPLICATION_CREDENTIALS=/pfad/zur/sa.json
 *   GOOGLE_SA_KEY=<base64 des SA-JSON>
 */

import { google } from "googleapis";
import { readFileSync } from "node:fs";

const SITE = "sc-domain:mahlzait.de";
const ORIGIN = "https://www.mahlzait.de";

// Am 2026-08-11 neu gebaut. Diese Seiten sollten Impressionen aufbauen.
const NEW_PAGES = [
  "/yazio-alternative/",
  "/weight-watchers-alternative/",
  "/fastfood-kalorien/",
];

// Standen am 2026-08-11 auf "Crawled - currently not indexed" bzw. waren
// Google unbekannt. Hier zeigt sich, ob der Duplicate-Fix gewirkt hat.
const WATCH_PAGES = [
  "/grundumsatz-rechner/",
  "/koerperfett-rechner/",
  "/idealgewicht-rechner/",
  "/protein-bedarf-rechner/",
  "/intervallfasten-rechner/",
  "/leistungsumsatz-rechner/",
];

const args = process.argv.slice(2);
const days = Number(args[args.indexOf("--days") + 1]) || 28;
const withIndex = args.includes("--index");

function loadCredentials() {
  const b64 = process.env.GOOGLE_SA_KEY;
  if (b64) return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (path) return JSON.parse(readFileSync(path, "utf8"));
  throw new Error(
    "Keine Credentials. Setze GOOGLE_SA_KEY (base64) oder GOOGLE_APPLICATION_CREDENTIALS (Pfad).",
  );
}

function isoDaysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const creds = loadCredentials();
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const sc = google.searchconsole({ version: "v1", auth });

  // GSC hinkt 2 bis 3 Tage hinterher, deshalb endet das Fenster frueher.
  const endDate = isoDaysAgo(3);
  const startDate = isoDaysAgo(3 + days);
  const prevEnd = isoDaysAgo(4 + days);
  const prevStart = isoDaysAgo(4 + days * 2);

  async function totals(start, end) {
    const res = await sc.searchanalytics.query({
      siteUrl: SITE,
      requestBody: { startDate: start, endDate: end, rowLimit: 1 },
    });
    return res.data.rows?.[0] ?? { clicks: 0, impressions: 0, position: 0 };
  }

  async function byPage(start, end) {
    const out = new Map();
    for (let startRow = 0; ; startRow += 1000) {
      const res = await sc.searchanalytics.query({
        siteUrl: SITE,
        requestBody: {
          startDate: start,
          endDate: end,
          dimensions: ["page"],
          rowLimit: 1000,
          startRow,
        },
      });
      const rows = res.data.rows ?? [];
      for (const r of rows) out.set(r.keys[0].replace(ORIGIN, ""), r);
      if (rows.length < 1000) break;
    }
    return out;
  }

  const [cur, prev, curPages] = await Promise.all([
    totals(startDate, endDate),
    totals(prevStart, prevEnd),
    byPage(startDate, endDate),
  ]);

  const delta = (a, b) => {
    const d = a - b;
    return `${d >= 0 ? "+" : ""}${d.toFixed(0)}`;
  };

  console.log(`\nSEO-Fortschritt  ${startDate} .. ${endDate}  (${days} Tage)`);
  console.log("=".repeat(64));
  console.log(
    `Klicks       ${cur.clicks.toFixed(0).padStart(6)}   ` +
      `(Vorperiode ${prev.clicks.toFixed(0)}, ${delta(cur.clicks, prev.clicks)})`,
  );
  console.log(
    `Impressionen ${cur.impressions.toFixed(0).padStart(6)}   ` +
      `(Vorperiode ${prev.impressions.toFixed(0)}, ${delta(cur.impressions, prev.impressions)})`,
  );
  console.log(
    `Ø Position   ${cur.position.toFixed(1).padStart(6)}   ` +
      `(Vorperiode ${prev.position.toFixed(1)})`,
  );

  const show = (title, paths) => {
    console.log(`\n${title}`);
    console.log("-".repeat(64));
    for (const p of paths) {
      const r = curPages.get(p);
      if (!r) {
        console.log(`  ${p.padEnd(34)} noch keine Impressionen`);
      } else {
        console.log(
          `  ${p.padEnd(34)} ${r.impressions.toFixed(0).padStart(5)} Impr` +
            ` ${r.clicks.toFixed(0).toString().padStart(4)} Kl` +
            `  Pos ${r.position.toFixed(1)}`,
        );
      }
    }
  };

  show("Neue Seiten (seit 2026-08-11)", NEW_PAGES);
  show("Rechner, die auf 'not indexed' standen", WATCH_PAGES);

  if (withIndex) {
    console.log("\nIndex-Status laut URL-Inspection");
    console.log("-".repeat(64));
    for (const p of [...NEW_PAGES, ...WATCH_PAGES].slice(0, 10)) {
      try {
        const res = await sc.urlInspection.index.inspect({
          requestBody: { inspectionUrl: ORIGIN + p, siteUrl: SITE },
        });
        const s = res.data.inspectionResult?.indexStatusResult ?? {};
        const crawled = s.lastCrawlTime ? s.lastCrawlTime.slice(0, 10) : "nie";
        console.log(
          `  ${p.padEnd(34)} ${(s.coverageState ?? "?").padEnd(32)} Crawl ${crawled}`,
        );
      } catch (err) {
        console.log(`  ${p.padEnd(34)} Fehler: ${err.message.slice(0, 40)}`);
      }
    }
  }
  console.log();
}

main().catch((err) => {
  console.error("Fehlgeschlagen:", err.message);
  process.exit(1);
});
