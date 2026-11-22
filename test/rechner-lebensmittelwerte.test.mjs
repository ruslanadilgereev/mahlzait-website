// Vergleichswerte in Rechnern, die Lebensmittelseiten zitieren: Seit der
// Umstellung der Lebensmittelseiten auf USDA FoodData Central (Batch E) nennen
// der Kalorienverbrauch-Rechner und der Alkohol-Rechner die Werte der Seiten in
// src/data/foods. Vorher standen dort Schätzwerte (Pizza 800, Currywurst mit
// Pommes 780, Tiramisu 450, Glas Wein 125 kcal; Apfel 52 kcal als ganzer Apfel).
// Die Spalte der Alkohol-Tabelle hieß "Kalorien", zeigt aber nur die Kalorien
// aus dem Alkohol (Bier 0,5 l 138 kcal). Gebaute Seiten aus dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readPage, readRepoFile } from "./dist-html.mjs";

const seite = (slug) => JSON.parse(readRepoFile("src/data/foods/" + slug + ".json"));
const variante = (slug, name) => {
  const v = seite(slug).variants.find((x) => x.name === name);
  assert.ok(v, slug + ": Variante " + name + " fehlt");
  return v.calories;
};
const portion = (slug) => {
  const o = seite(slug).overview;
  return Math.round((o.calories_per_100g * o.typical_portion_g) / 100);
};

test("Kalorienverbrauch-Rechner: Vergleichsessen mit den Werten der Lebensmittelseiten", () => {
  const quelle = readRepoFile("src/components/calculators/DoenerRechner.tsx");
  const erwartet = [
    ["Pizza Margherita", variante("pizza", "Pizza Margherita")],
    ["Currywurst mit Pommes", variante("currywurst", "Currywurst mit Pommes")],
    ["Tiramisu", variante("tiramisu", "Klassisches Tiramisu (150g)")],
    ["Bier (0.5L)", variante("bier", "Pils (0,5l)")],
    ["Glas Wein", portion("wein")],
    ["Cola (0.5L)", variante("cola", "Cola (Flasche 500ml)")],
    ["Croissant", variante("croissant", "Butter-Croissant")],
  ];
  for (const [name, kcal] of erwartet) {
    assert.ok(quelle.includes('{ name: "' + name + '", kcal: ' + kcal + ","), name + " mit " + kcal + " kcal");
  }
});

test("Alkohol-Rechner: Spalte heißt Kalorien aus Alkohol, Vergleiche aus den Lebensmittelseiten", () => {
  const html = readPage("/alkohol-kalorien-rechner/");
  assert.match(html, />Kalorien aus Alkohol<\/th>/);
  const quelle = readRepoFile("src/modules/alkohol/index.tsx");
  assert.ok(quelle.includes("(calories / " + portion("brot") + ")"), "Scheibe Brot");
  assert.ok(quelle.includes("(calories / " + variante("apfel", "Apfel mittel (180g)") + ")"), "Apfel");
  assert.ok(
    quelle.includes("(calories / " + variante("pizza-margherita", "Pizza Margherita (1 Stück, Pizzeria)") + ")"),
    "Stück Pizza",
  );
});
