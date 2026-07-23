#!/usr/bin/env node
/**
 * Generiert src/data/food-lastmod.json: slug → letztes Git-Commit-Datum der Food-JSON.
 * Die Sitemap nutzt diese stabilen Daten statt des Build-Timestamps, damit lastmod
 * nicht bei jedem Deploy für alle ~930 Food-URLs rotiert (Google ignoriert sonst das Signal).
 *
 * Nach Änderungen an src/data/foods/*.json einmal laufen lassen und Ergebnis committen:
 *   node scripts/generate-food-lastmod.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const foodsDir = path.join(repoRoot, "src", "data", "foods");
const outFile = path.join(repoRoot, "src", "data", "food-lastmod.json");

// Ein einziger git-log-Durchlauf (neu → alt); erstes Auftreten einer Datei = letzte Änderung.
const log = execSync("git log --format=%x01%cI --name-only -- src/data/foods", {
  cwd: repoRoot,
  encoding: "utf-8",
  maxBuffer: 64 * 1024 * 1024,
});

const lastmod = {};
let currentDate = null;
for (const line of log.split("\n")) {
  if (line.startsWith("\x01")) {
    currentDate = line.slice(1).trim();
  } else if (line.startsWith("src/data/foods/") && line.endsWith(".json")) {
    const slug = path.basename(line, ".json");
    if (!(slug in lastmod) && currentDate) {
      lastmod[slug] = currentDate.slice(0, 10); // YYYY-MM-DD reicht für Sitemaps
    }
  }
}

// Nur Slugs behalten, die aktuell existieren (gelöschte Foods raus)
const existing = new Set(
  fs.readdirSync(foodsDir).filter((f) => f.endsWith(".json")).map((f) => path.basename(f, ".json")),
);
const cleaned = Object.fromEntries(
  Object.entries(lastmod)
    .filter(([slug]) => existing.has(slug))
    .sort(([a], [b]) => a.localeCompare(b)),
);

fs.writeFileSync(outFile, JSON.stringify(cleaned, null, 1) + "\n");
console.log(`food-lastmod.json: ${Object.keys(cleaned).length} Einträge (Foods im Repo: ${existing.size})`);
