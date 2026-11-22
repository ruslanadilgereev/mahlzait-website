// Räucherlachs: lachs.json nannte 175 kcal pro 100 g, raeucherlachs.json 117 kcal,
// lachs-gebraten.json 200 kcal. In USDA FoodData Central (FDC) gibt es keinen
// allgemeinen Eintrag für geräucherten Atlantiklachs (Zucht oder Wildfang), nur
// geräucherten Königslachs (Chinook). Seit 22.11.2026 nennen alle Seiten diesen
// Eintrag: SR Legacy 173687 "Fish, salmon, chinook, smoked", über die FDC-API
// gelesen. https://fdc.nal.usda.gov/food-details/173687/nutrients
// Prüft die Daten und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  faqFromSchema,
  readPage,
  readRepoFile,
  visibleText,
} from "./dist-html.mjs";

// Der lokale Build unter Windows schreibt vereinzelt NUL-Bytes vor Umlaute und
// andere Mehrbyte-Zeichen (beim Streaming der React-Inseln); die Live-Seiten
// sind frei davon. Dieser Test prüft Inhalte, deshalb fallen NUL-Bytes vorher weg.
const NUL = String.fromCharCode(0);
const seite = (route) => readPage(route).split(NUL).join("");

const lade = (slug) => JSON.parse(readRepoFile(`src/data/foods/${slug}.json`));
const fdc173687 = { kcal: 117, protein: 18.28, fat: 4.32, natrium: 672 };
const eineStelle = (wert) => Math.round(wert * 10) / 10;
const STRICH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

test("raeucherlachs.json: Übersicht und Portionen aus FDC 173687", () => {
  const food = lade("raeucherlachs");
  const o = food.overview;
  assert.deepEqual(
    [o.calories_per_100g, o.protein_per_100g, o.fat_per_100g, o.carbs_per_100g],
    [
      fdc173687.kcal,
      eineStelle(fdc173687.protein),
      eineStelle(fdc173687.fat),
      0,
    ],
  );
  for (const v of food.variants) {
    const g = v.portion_g;
    assert.deepEqual(
      [v.calories, v.protein, v.fat],
      [
        Math.round((fdc173687.kcal * g) / 100),
        eineStelle((fdc173687.protein * g) / 100),
        eineStelle((fdc173687.fat * g) / 100),
      ],
      v.name,
    );
  }
  assert.match(
    food.source ?? "",
    /^USDA FoodData Central, FDC-ID 173687 \(Fish, salmon, chinook, smoked/,
  );
  assert.ok(
    food.faq[0].answer.includes("117 kcal pro 100g (FDC 173687"),
    food.faq[0].answer,
  );
  assert.ok(food.faq[0].answer.includes("rund 59 kcal"), food.faq[0].answer);
});

test("lachs, lachsfilet und lachs-gebraten nennen denselben FDC-Wert für Räucherlachs", () => {
  const zeilen = {
    lachs: "Räucherlachs",
    lachsfilet: "Lachs geräuchert",
    "lachs-gebraten": "Räucherlachs",
  };
  for (const [slug, name] of Object.entries(zeilen)) {
    const food = lade(slug);
    const v = food.variants.find((x) => x.name === name);
    assert.deepEqual(
      [v.portion_g, v.calories, v.protein, v.carbs, v.fat],
      [
        100,
        fdc173687.kcal,
        Math.round(fdc173687.protein),
        0,
        Math.round(fdc173687.fat),
      ],
      slug,
    );
    assert.ok(
      v.tip.includes("FDC 173687"),
      slug + ": Tipp nennt den Eintrag nicht",
    );
    const texte = JSON.stringify([food.tips, food.faq]);
    assert.doesNotMatch(texte, /\b175 (statt|kcal)/, slug);
    assert.doesNotMatch(
      JSON.stringify(food),
      STRICH,
      slug + ": Gedankenstrich",
    );
  }
  const lachs = lade("lachs");
  const faq = lachs.faq.map((f) => f.answer).join("\n");
  assert.ok(faq.includes("117 kcal pro 100g (FDC 173687)"), "lachs: erste FAQ");
  assert.ok(
    faq.includes("Ja: 117 statt 208 kcal pro 100g"),
    "lachs: Räucherlachs-FAQ",
  );
  assert.ok(faq.includes(fdc173687.natrium + " mg"), "lachs: Natrium laut FDC");
  const lachsfilet = lade("lachsfilet")
    .faq.map((f) => f.answer)
    .join("\n");
  assert.ok(
    lachsfilet.includes("117 kcal pro 100g (FDC 173687"),
    "lachsfilet: FAQ",
  );
});

test("die gebauten Lachs-Seiten zeigen die Werte und die FAQ aus den Daten", () => {
  for (const slug of [
    "raeucherlachs",
    "lachs",
    "lachsfilet",
    "lachs-gebraten",
  ]) {
    const food = lade(slug);
    const html = seite(`/kalorien/${slug}/`);
    assert.ok(
      visibleText(html).includes(
        "berechnet aus " + food.overview.calories_per_100g + " kcal pro 100 g",
      ),
      slug,
    );
    assert.deepEqual(faqFromSchema(html), food.faq, slug);
  }
  assert.ok(
    visibleText(seite("/kalorien/lachs/")).includes(
      "117 kcal pro 100g (FDC 173687)",
    ),
  );
});
