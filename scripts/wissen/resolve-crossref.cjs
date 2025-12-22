/* eslint-disable no-console */
/**
 * Resolve DOI metadata via Crossref for entries created by extract-pdfs.cjs.
 *
 * Usage:
 *   node scripts/wissen/resolve-crossref.cjs
 *
 * Input:
 *   scripts/wissen/papers-extracted.json
 * Output:
 *   scripts/wissen/papers-resolved.json
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const IN_FILE = path.join(ROOT, "scripts", "wissen", "papers-extracted.json");
const OUT_FILE = path.join(ROOT, "scripts", "wissen", "papers-resolved.json");

function pickYear(message) {
  const candidates = [
    message.published?.["date-parts"]?.[0],
    message.published_online?.["date-parts"]?.[0],
    message.published_print?.["date-parts"]?.[0],
    message.issued?.["date-parts"]?.[0],
    message.created?.["date-parts"]?.[0],
  ].filter(Boolean);
  const first = candidates[0];
  if (!first || !Array.isArray(first) || typeof first[0] !== "number") return null;
  return first[0];
}

function formatAuthorsShort(message) {
  const authors = Array.isArray(message.author) ? message.author : [];
  if (authors.length === 0) return null;
  const first = authors[0];
  const family = first.family || "";
  const given = first.given || "";
  const initial = given ? given.trim().charAt(0).toUpperCase() : "";
  if (!family) return null;
  return authors.length > 1 ? `${family} ${initial}, et al.` : `${family} ${initial}`;
}

async function fetchCrossref(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const res = await fetch(url, {
    headers: {
      // Minimal polite UA (Crossref recommends including a UA)
      "User-Agent": "mahlzait.de (scripts/wissen; mailto:kontakt@mahlzait.de)",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Crossref ${res.status} for DOI ${doi}`);
  }
  const json = await res.json();
  return json.message;
}

async function main() {
  if (!fs.existsSync(IN_FILE)) {
    console.error(`Input not found: ${path.relative(ROOT, IN_FILE)}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(IN_FILE, "utf8");
  const entries = JSON.parse(raw);

  const resolved = [];

  for (const entry of entries) {
    const doi = entry.doi;
    if (!doi) {
      resolved.push({ ...entry, crossref: null });
      continue;
    }

    try {
      const message = await fetchCrossref(doi);
      const title = Array.isArray(message.title) ? message.title[0] : null;
      const journal = Array.isArray(message["container-title"])
        ? message["container-title"][0]
        : null;
      const year = pickYear(message);
      const authorsShort = formatAuthorsShort(message);

      resolved.push({
        ...entry,
        crossref: {
          title,
          journal,
          year,
          url: message.URL || null,
          authorsShort,
          type: message.type || null,
        },
      });

      console.log(`[ok] ${entry.fileName} | ${doi} | ${year || "-"} | ${journal || "-"}`);
    } catch (e) {
      console.warn(`[warn] ${entry.fileName} | ${doi} | ${String(e.message || e)}`);
      resolved.push({ ...entry, crossref: null, crossrefError: String(e.message || e) });
    }
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(resolved, null, 2), "utf8");
  console.log(`\nWrote ${resolved.length} entries to ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


