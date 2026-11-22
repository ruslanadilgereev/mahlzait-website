// Doppelte Lebensmittel-Seiten zusammengelegt (22.11.2026): Je zwei Seiten
// hatten denselben Titel und bedienten dieselbe Suche („Maggi Ravioli Kalorien“,
// „Reispapier Kalorien“). Es bleibt die Seite mit mehr Impressionen in der
// Search Console (Seiten, letzte 3 Monate, 19.08. bis 19.11.2026):
// /kalorien/ravioli-maggi/ 1.625 gegen /kalorien/maggi-ravioli/ 961,
// /kalorien/rice-paper/ 6.837 gegen /kalorien/reispapier/ 1.280.
// Die andere Adresse leitet per 308 um, steht weder in den Daten noch in der
// Sitemap, und keine Seite verlinkt sie noch. Prüft vercel.json, die Daten und
// das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { distDir, pageExists, readRepoFile, repoRoot } from "./dist-html.mjs";

const zusammengelegt = [
  { alt: "maggi-ravioli", bleibt: "ravioli-maggi" },
  { alt: "reispapier", bleibt: "rice-paper" },
];

const redirects = JSON.parse(readRepoFile("vercel.json")).redirects;

test("die entfernte Adresse leitet mit und ohne Schrägstrich per 308 auf die verbliebene Seite", () => {
  const schraegstrichRegel = redirects.findIndex(
    (rule) => rule.destination === "/:path/",
  );
  assert.ok(schraegstrichRegel >= 0, "keine Umleitung auf /:path/");
  for (const { alt, bleibt } of zusammengelegt) {
    for (const source of [`/kalorien/${alt}`, `/kalorien/${alt}/`]) {
      const index = redirects.findIndex((rule) => rule.source === source);
      assert.ok(index >= 0, `keine Umleitung für ${source}`);
      const rule = redirects[index];
      assert.equal(rule.destination, `/kalorien/${bleibt}/`, source);
      // permanent: true ergibt bei Vercel 308.
      assert.equal(rule.permanent, true, `${source} nicht permanent`);
      assert.equal(rule.statusCode, undefined, source);
      assert.equal(rule.has, undefined, source);
      // Vor der Schrägstrich-Regel, sonst ginge /kalorien/<alt> über /kalorien/<alt>/ (zwei Sprünge).
      assert.ok(index < schraegstrichRegel, `${source} steht hinter der Schrägstrich-Regel`);
    }
  }
});

test("nur die verbliebene Seite steht in Daten, Build und Sitemap", () => {
  const xml = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
  const lastmod = JSON.parse(readRepoFile("src/data/food-lastmod.json"));
  for (const { alt, bleibt } of zusammengelegt) {
    assert.ok(
      existsSync(join(repoRoot, "src/data/foods", `${bleibt}.json`)),
      `${bleibt}.json fehlt`,
    );
    assert.ok(pageExists(`/kalorien/${bleibt}/`), `/kalorien/${bleibt}/ fehlt`);
    assert.ok(
      xml.includes(`<loc>https://www.mahlzait.de/kalorien/${bleibt}/</loc>`),
      `${bleibt} fehlt in der Sitemap`,
    );
    assert.ok(
      !existsSync(join(repoRoot, "src/data/foods", `${alt}.json`)),
      `${alt}.json gibt es noch`,
    );
    assert.ok(!(alt in lastmod), `${alt} steht noch in food-lastmod.json`);
    assert.ok(!pageExists(`/kalorien/${alt}/`), `/kalorien/${alt}/ wird noch gebaut`);
    assert.ok(!xml.includes(`/kalorien/${alt}/`), `${alt} steht noch in der Sitemap`);
  }
});

// Alle Textdateien im Build: Seiten (samt Insel-Props), llms-Dateien, JSON, Sitemaps.
function buildFiles(dir = distDir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...buildFiles(path));
    else if (/\.(html|txt|json|xml)$/.test(entry.name)) files.push(path);
  }
  return files;
}

test("keine Seite und keine Textdatei im Build verweist auf die entfernte Adresse", () => {
  const altePfade = new RegExp(
    `/kalorien/(?:${zusammengelegt.map((z) => z.alt).join("|")})(?![a-z0-9-])`,
    "g",
  );
  const funde = [];
  for (const path of buildFiles()) {
    const text = readFileSync(path, "utf8");
    for (const match of text.matchAll(altePfade)) {
      funde.push(`${path.slice(distDir.length)}: ${match[0]}`);
    }
  }
  assert.deepEqual(funde.slice(0, 10), [], `${funde.length} Verweise`);
});
