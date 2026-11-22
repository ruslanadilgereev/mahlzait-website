// Chicken Tikka Masala (/kalorien/tikka-masala/) nannte 155 kcal pro 100 g und
// Portionswerte ohne Quelle; USDA FoodData Central (FDC) führt keinen
// allgemeinen Eintrag für Tikka Masala. Seit 22.11.2026 stammen die Werte aus
// einer Rezeptrechnung mit FDC-Zutaten (über die FDC-API gelesen): 4 Portionen
// à 350 g aus 500 g Hähnchenbrust, 450 g Tomaten, 150 g Sahne, 150 g Zwiebeln,
// 100 g Joghurt, 20 g Rapsöl, je 10 g Knoblauch, Ingwer und Currypulver.
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

const food = JSON.parse(readRepoFile("src/data/foods/tikka-masala.json"));

// FDC-Werte je 100 g: kcal, Eiweiß, Kohlenhydrate, Fett, Ballaststoffe
const fdc = {
  171477: [165, 31.02, 0, 3.57, 0], // Chicken, broilers or fryers, breast, meat only, cooked, roasted
  170501: [32, 1.64, 7.29, 0.28, 1.9], // Tomatoes, crushed, canned
  170858: [292, 2.17, 2.96, 30.91, 0], // Cream, fluid, light whipping
  170000: [40, 1.1, 9.34, 0.1, 1.7], // Onions, raw
  171284: [61, 3.47, 4.66, 3.25, 0], // Yogurt, plain, whole milk
  172336: [884, 0, 0, 100, 0], // Oil, canola
  169230: [149, 6.36, 33.06, 0.5, 2.1], // Garlic, raw
  169231: [80, 1.82, 17.77, 0.75, 2], // Ginger root, raw
  170924: [325, 14.29, 55.83, 14.01, 53.2], // Spices, curry powder
  168878: [130, 2.69, 28.17, 0.28, 0.4], // Rice, white, long-grain, regular, enriched, cooked
  169704: [123, 2.74, 25.58, 0.97, 1.6], // Rice, brown, long-grain, cooked
  171845: [291, 9.62, 50.43, 5.65, 2.2], // Bread, naan, plain, commercially prepared, refrigerated
  170886: [63, 5.25, 7.04, 1.55, 0], // Yogurt, plain, low fat
  171844: [297, 11.25, 46.36, 7.45, 4.9], // Bread, chapati or roti, plain, commercially prepared
};
const rezept = {
  171477: 500,
  170501: 450,
  170858: 150,
  170000: 150,
  171284: 100,
  172336: 20,
  169230: 10,
  169231: 10,
  170924: 10,
};
const light = { ...rezept, 170858: 0, 170886: 150 };
const summe = (r) =>
  Object.entries(r).reduce(
    (s, [id, g]) =>
      s.map((wert, i) =>
        i === 0 ? wert + g : wert + (fdc[id][i - 1] * g) / 100,
      ),
    [0, 0, 0, 0, 0, 0],
  );
const anteil = (topf, g) => topf.map((wert) => (wert * g) / topf[0]);
const beilage = (id, g) => [g, ...fdc[id].map((w) => (w * g) / 100)];
const plus = (...teile) => teile.reduce((a, b) => a.map((w, i) => w + b[i]));
const gerundet = (s) => s.slice(0, 5).map(Math.round);
const topf = summe(rezept);
const portion = anteil(topf, 350);

test("die Werte je 100 g sind die Rezeptrechnung aus FDC-Zutaten", () => {
  const je100 = anteil(topf, 100);
  const o = food.overview;
  assert.deepEqual(
    [
      o.calories_per_100g,
      o.protein_per_100g,
      o.carbs_per_100g,
      o.fat_per_100g,
      o.fiber_per_100g,
      o.typical_portion_g,
    ],
    [
      Math.round(je100[1]),
      ...je100.slice(2).map((w) => Math.round(w * 10) / 10),
      350,
    ],
  );
  assert.equal(o.calories_per_100g, 126);
  assert.match(
    food.source ?? "",
    /^USDA FoodData Central \(FDC-API, 22\.11\.2026\), Rezeptrechnung/,
  );
  for (const id of Object.keys(fdc))
    assert.ok(food.source.includes(id), "source ohne FDC-ID " + id);
});

test("jede Portionszeile ist Curry plus Beilage aus FDC", () => {
  const erwartet = {
    "Tikka Masala mit Reis": plus(portion, beilage(168878, 150)),
    "Tikka Masala ohne Reis": portion,
    "Tikka Masala mit Naan": plus(portion, beilage(171845, 90)),
    "Tikka Masala light (Joghurt statt Sahne)": plus(
      anteil(summe(light), 350),
      beilage(168878, 150),
    ),
    "Tikka Masala mit Vollkornreis": plus(portion, beilage(169704, 150)),
    "Tikka Masala große Portion": plus(anteil(topf, 450), beilage(168878, 200)),
  };
  assert.deepEqual(
    food.variants.map((v) => v.name),
    Object.keys(erwartet),
  );
  for (const v of food.variants) {
    assert.deepEqual(
      [v.portion_g, v.calories, v.protein, v.carbs, v.fat],
      gerundet(erwartet[v.name]),
      v.name,
    );
  }
});

test("Tipps und FAQ nennen dieselben Zahlen wie die Portionszeilen", () => {
  const kcal = Object.fromEntries(
    food.variants.map((v) => [v.name, v.calories]),
  );
  const faq = food.faq.map((f) => f.answer);
  assert.ok(faq[0].includes(kcal["Tikka Masala ohne Reis"] + " kcal"), faq[0]);
  assert.ok(faq[0].includes(kcal["Tikka Masala mit Reis"] + " kcal"), faq[0]);
  assert.ok(faq[0].includes(kcal["Tikka Masala mit Naan"] + " kcal"), faq[0]);
  assert.ok(
    faq[1].includes(kcal["Tikka Masala light (Joghurt statt Sahne)"] + " kcal"),
    faq[1],
  );
  assert.ok(
    faq[5].includes(kcal["Tikka Masala große Portion"] + " kcal"),
    faq[5],
  );
  const lightOhneReis = Math.round(anteil(summe(light), 350)[1]);
  assert.ok(faq[4].includes(lightOhneReis + " kcal"), faq[4]);
  const tipps = food.tips.map((t) => t.text).join("\n");
  assert.ok(
    tipps.includes(
      "spart " + (Math.round(portion[1]) - lightOhneReis) + " kcal pro Portion",
    ),
    "Joghurt-Tipp",
  );
  assert.ok(
    tipps.includes(
      "Ein Naan (90 g) hat " + Math.round(fdc[171845][0] * 0.9) + " kcal",
    ),
    "Naan",
  );
  assert.ok(
    tipps.includes(
      "ein Chapati (68 g) " + Math.round(fdc[171844][0] * 0.68) + " kcal",
    ),
    "Chapati",
  );
  const alles = JSON.stringify(food);
  assert.doesNotMatch(alles, /\b(155|420|650|720|540) kcal\b/);
  assert.doesNotMatch(
    alles,
    new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]"),
  );
});

test("die gebaute Seite zeigt die Werte und die FAQ aus den Daten", () => {
  const html = seite("/kalorien/tikka-masala/");
  assert.ok(visibleText(html).includes("berechnet aus 126 kcal pro 100 g"));
  assert.deepEqual(faqFromSchema(html), food.faq);
});
