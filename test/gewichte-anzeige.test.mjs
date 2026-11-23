// Mengen auf den Lebensmittelseiten im deutschen Format. Bis 4607349 zeigten die
// Seiten Gramm- und Milliliterangaben aus src/data/foods mit Dezimalpunkt und ohne
// Leerzeichen ("43.75g" je Stück Pizza Margherita, "8.4g", Protein "11.4g"), bei
// 191 Varianten und allen Nährwerten mit Nachkommastelle. Jetzt formatiert
// src/utils/menge.ts jede sichtbare Menge aus den Daten: Dezimalkomma, Leerzeichen
// vor der Einheit, ganze Zahlen ohne Nachkommastellen ("43,75 g", "350 g").
// JSON-LD bleibt maschinenlesbar ("43.75g"). Die Daten selbst sind unverändert;
// drei Datentexte mit Dezimalpunkt (z. B. "Mars Duo (2x 39.4g, 78.8g)") stehen so
// in den JSON-Dateien und sind von der Prüfung ausgenommen.
// Gebaute Seiten aus dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { jsonLd, pageExists, readPage, readRepoFile, repoRoot, routesUnder, visibleText } from "./dist-html.mjs";

const NUL = String.fromCharCode(0);
const html = (route) => readPage(route).split(NUL).join("");
const text = (route) => visibleText(html(route));
// Menge mit Dezimalpunkt: "43.75g", "8.4 g", "0.5 ml"; nicht "1.000 g"
const PUNKT = /\d\.\d{1,2}(?!\d) ?(?:g|ml)\b/;
const lade = (slug) => JSON.parse(readRepoFile("src/data/foods/" + slug + ".json"));
const datenTexte = (j) =>
  [
    j.name, j.seo?.title, j.seo?.description, j.overview?.typical_portion_name,
    ...(j.variants ?? []).flatMap((v) => [v.name, v.tip]),
    ...(j.comparison ?? []).map((c) => c.name),
    ...(j.tips ?? []).flatMap((t) => [t.title, t.text]),
    ...(j.faq ?? []).flatMap((f) => [f.question, f.answer]),
    j.source,
  ].filter(Boolean);

test("Pizza Margherita: ein Stück mit 43,75 g, nirgends 43.75g", () => {
  const route = "/kalorien/pizza-margherita/";
  const t = text(route);
  assert.equal(lade("pizza-margherita").overview.typical_portion_g, 43.75);
  for (const stelle of [
    "Portionsgröße 43,75 g", // Portionsregler
    "Pizza Margherita (1 Stück, Pizzeria) 43,75 g 116 5 g 4 g", // Varianten-Tabelle
    "43,75 g Pizza Margherita", // Mengen-Tabelle
    "Protein 11,4 g", // Nährwerte pro 100g
  ]) {
    assert.ok(t.includes(stelle), "fehlt: " + stelle);
  }
  assert.ok(!t.includes("43.75"), "43.75 im sichtbaren Text");
  assert.doesNotMatch(t, PUNKT);
  // JSON-LD bleibt maschinenlesbar
  const ni = jsonLd(html(route)).find((b) => b["@type"] === "NutritionInformation");
  assert.equal(ni.servingSize, "43.75g");
});

test("Stichprobe weiterer Seiten mit Kommagewichten", () => {
  const stichprobe = {
    "after-eight": "8,4 g",
    amicelli: "12,5 g",
    balisto: "18,5 g",
    bifi: "22,5 g",
    schokolade: "6,25 g",
    "pizza-salami": "43,75 g",
  };
  for (const [slug, erwartet] of Object.entries(stichprobe)) {
    const t = text("/kalorien/" + slug + "/");
    assert.ok(t.includes(erwartet), slug + ": " + erwartet + " fehlt");
    assert.doesNotMatch(t, PUNKT, slug);
  }
  // Milliliter: Seite mit Werten je 100 ml und Portion mit Nachkommastelle, falls vorhanden
  const ml = readdirSync(join(repoRoot, "src/data/foods"))
    .map((f) => JSON.parse(readRepoFile("src/data/foods/" + f)))
    .filter((j) => j.overview.einheit === "ml");
  assert.ok(ml.length > 0, "keine Seite mit ml");
  for (const j of ml) {
    const t = text("/kalorien/" + j.slug + "/");
    assert.ok(t.includes(String(j.overview.typical_portion_g).replace(".", ",") + " ml"), j.slug);
    assert.doesNotMatch(t, PUNKT, j.slug);
  }
});

test("Keine Lebensmittelseite zeigt eine Menge aus den Daten mit Dezimalpunkt", () => {
  const routes = routesUnder("/kalorien/");
  assert.ok(routes.length >= 900, "nur " + routes.length + " Seiten");
  const befunde = [];
  let ausgenommen = 0;
  for (const route of routes) {
    let t = text(route);
    const slug = route.split("/")[2];
    // so in den Daten geschriebene Texte, nicht von der Seite formatiert
    for (const s of datenTexte(lade(slug))) {
      if (PUNKT.test(s)) {
        t = t.split(s.replace(/\s+/g, " ")).join(" ");
        ausgenommen++;
      }
    }
    const m = t.match(PUNKT);
    if (m) befunde.push(route + ": " + m[0]);
  }
  assert.deepEqual(befunde, []);
  assert.equal(ausgenommen, 3, "Datentexte mit Dezimalpunkt");
});

test("Übersichts-, Kategorie-, Fast-Food- und Hub-Seiten nennen Mengen im deutschen Format", () => {
  const seiten = ["/kalorien/", "/fastfood-kalorien/", "/kalorientabelle/", "/eiweissreiche-lebensmittel/", "/kalorienarme-lebensmittel/", "/kalorienreiche-lebensmittel/", "/low-carb-lebensmittel/", ...routesUnder("/kalorien/kategorie/")];
  for (const route of seiten) {
    assert.ok(pageExists(route), route);
    assert.doesNotMatch(text(route), PUNKT, route);
  }
  // Pizza Margherita: 266 kcal, 11,4 g Eiweiß, 33,3 g Kohlenhydrate, 9,7 g Fett je 100 g
  assert.ok(text("/kalorien/").includes("266 kcal · 11,4 g Protein · 33,3 g KH · 9,7 g Fett"), "Übersicht /kalorien/");
  assert.ok(text("/kalorien/kategorie/fast-food/").includes("266 kcal · 11,4 g P · 33,3 g KH · 9,7 g F"), "Kategorie Fast Food");
});

test("Gemeinsame Formatierung in src/utils/menge.ts", async () => {
  const M = await import("../src/utils/menge.ts");
  assert.deepEqual(
    [M.menge(43.75), M.menge(350), M.menge(8.4), M.menge(0.5, "ml"), M.menge(1000), M.menge(3.456, "g", 1)],
    ["43,75 g", "350 g", "8,4 g", "0,5 ml", "1.000 g", "3,5 g"],
  );
  for (const datei of ["src/modules/kalorienFood/index.tsx", "src/modules/kalorienIndex/index.tsx", "src/modules/kalorienCategory/index.tsx", "src/modules/fastfoodKalorien/index.tsx", "src/components/FoodListTable.astro"]) {
    assert.ok(readRepoFile(datei).includes('import { menge } from "utils/menge";'), datei);
  }
});
