// Zartbitterschokolade (/kalorien/schokolade-zartbitter/) nannte 530 kcal pro
// 100 g, einen Wert ohne Eintrag in USDA FoodData Central (FDC); die eigene
// Zeile „50% Kakao (25g)“ ergab 552 kcal pro 100 g. Seit 22.11.2026 stammen alle
// Werte der Seite aus FDC (über die FDC-API gelesen): 170271 für die Übersicht
// (Chocolate, dark, 45- 59% cacao solids), 170272 und 170273 für die
// Kakao-Stufen, 2710338 (FNDDS) für die Variante mit Nüssen, 167587 und 167571
// für Vollmilch und weiße Schokolade im Vergleich.
// https://fdc.nal.usda.gov/food-details/170271/nutrients
// Prüft die Daten und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  faqFromSchema,
  readPage,
  readRepoFile,
  visibleText,
} from "./dist-html.mjs";

const food = JSON.parse(
  readRepoFile("src/data/foods/schokolade-zartbitter.json"),
);

// Werte je 100 g laut FDC.
const fdc = {
  170271: {
    kcal: 546,
    protein: 4.88,
    carbs: 61.17,
    fat: 31.28,
    fiber: 7,
    sugar: 47.9,
  },
  170272: { kcal: 579, protein: 6.12, carbs: 52.42, fat: 38.31, sugar: 36.71 },
  170273: { kcal: 598, protein: 7.79, carbs: 45.9, fat: 42.63, sugar: 23.99 },
  2710338: { kcal: 560, protein: 8.26, carbs: 52.2, fat: 36.3 },
  167587: { kcal: 535, fiber: 3.4, sugar: 51.5 },
  167571: { kcal: 539 },
};
const zartbitter = fdc[170271];
const fuer = (je100g, gramm) => Math.round((je100g * gramm) / 100);
const eineStelle = (wert) => Math.round(wert * 10) / 10;
const texte = food.tips
  .map((tipp) => tipp.text)
  .concat(food.faq.map((frage) => frage.answer))
  .join("\n");

test("die Übersicht ist FDC 170271, das source-Feld nennt den Eintrag", () => {
  const o = food.overview;
  assert.deepEqual(
    [
      o.calories_per_100g,
      o.protein_per_100g,
      o.carbs_per_100g,
      o.fat_per_100g,
      o.fiber_per_100g,
    ],
    [
      zartbitter.kcal,
      eineStelle(zartbitter.protein),
      eineStelle(zartbitter.carbs),
      eineStelle(zartbitter.fat),
      zartbitter.fiber,
    ],
  );
  assert.match(food.source ?? "", /^USDA FoodData Central, FDC-IDs 170271 /);
});

test("jede Variante ist ein FDC-Eintrag, auf ihre Portion umgerechnet", () => {
  const eintrag = {
    "1 Rippe (25g, ~4 Stück)": 170271,
    "½ Tafel (50g)": 170271,
    "Ganze Tafel (100g)": 170271,
    "45-59% Kakao (25g)": 170271,
    "60-69% Kakao (25g)": 170272,
    "70-85% Kakao (25g)": 170273,
    "Zartbitter mit Nüssen (25g)": 2710338,
  };
  for (const v of food.variants) {
    const e = fdc[eintrag[v.name]];
    assert.ok(e, "kein FDC-Eintrag für " + v.name);
    const g = v.portion_g;
    assert.deepEqual(
      [v.calories, v.protein, v.carbs, v.fat],
      [fuer(e.kcal, g), fuer(e.protein, g), fuer(e.carbs, g), fuer(e.fat, g)],
      v.name,
    );
  }
});

test("Vollmilch und weiße Schokolade im Vergleich kommen aus FDC", () => {
  const kcal = Object.fromEntries(
    food.comparison.map((c) => [c.name, c.calories]),
  );
  assert.equal(kcal["Vollmilchschokolade (25g)"], fuer(fdc[167587].kcal, 25));
  assert.equal(kcal["Weiße Schokolade (25g)"], fuer(fdc[167571].kcal, 25));
});

test("Tipps und FAQ nennen dieselben Zahlen wie die Daten", () => {
  const portion = fuer(zartbitter.kcal, food.overview.typical_portion_g);
  const erste = food.faq[0].answer;
  assert.ok(erste.includes(zartbitter.kcal + " kcal pro 100g"), erste);
  assert.ok(erste.includes(portion + " kcal"), erste);
  assert.ok(
    texte.includes(zartbitter.kcal + " vs. " + fdc[167587].kcal + " kcal/100g"),
    "Kalorien-Tipp",
  );
  const ballaststoffe =
    zartbitter.fiber +
    "g vs. " +
    String(fdc[167587].fiber).replace(".", ",") +
    "g";
  assert.ok(texte.includes(ballaststoffe), "Ballaststoffe");
  for (const id of [170271, 170272, 170273, 167587]) {
    assert.ok(
      texte.includes("ca. " + Math.round(fdc[id].sugar) + "g"),
      "Zucker laut FDC " + id,
    );
  }
  assert.doesNotMatch(texte, /\b530\b/);
});

test("kein Gedankenstrich in den Texten der Seite", () => {
  const strich = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
  assert.doesNotMatch(JSON.stringify(food), strich);
});

test("die gebaute Seite zeigt die Werte und die FAQ aus den Daten", () => {
  const html = readPage("/kalorien/schokolade-zartbitter/");
  assert.ok(
    visibleText(html).includes(
      "berechnet aus " + zartbitter.kcal + " kcal pro 100 g",
    ),
  );
  assert.deepEqual(faqFromSchema(html), food.faq);
});
