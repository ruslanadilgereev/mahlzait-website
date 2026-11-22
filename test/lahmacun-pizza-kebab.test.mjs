// Lahmacun und Pizza Kebab (/kalorien/lahmacun/, /kalorien/pizza-kebab/) nannten
// Werte ohne Quelle (Lahmacun pur 420 kcal bei 200 g, Pizza Kebab 823 kcal bei
// 350 g). Seit 22.11.2026 rechnen beide Seiten aus Zutaten mit Nährwerten aus
// USDA FoodData Central (FDC): Lahmacun genau wie der Döner-Kalorien-Rechner
// (src/modules/doener/rezepte.ts, 150 g), Pizza Kebab mit Teig, Dönerfleisch,
// Käse und Soße aus demselben Rechner plus FDC 172880 (Pizzasoße). Die
// Vergleichswerte für Lahmacun auf anderen Seiten folgen derselben Rechnung.
// Gebaute Seiten aus dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { faqFromSchema, readPage, readRepoFile, visibleText } from "./dist-html.mjs";

const R = await import("../src/modules/doener/rezepte.ts");

const NUL = String.fromCharCode(0);
const seite = (route) => readPage(route).split(NUL).join("");
const STRICH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const lade = (slug) => JSON.parse(readRepoFile("src/data/foods/" + slug + ".json"));

// FDC 172880 "Sauce, pizza, canned, ready-to-serve" (SR Legacy), je 100 g
const pizzasosse = { kcal: 54, protein: 2.18, kh: 8.66, fett: 1.15, ballaststoffe: 2 };
const zutat = (id) => (id === "pizzasosse" ? pizzasosse : R.zutaten[id]);
const summe = (teile) =>
  teile.reduce(
    (s, [id, g]) => {
      const z = zutat(id);
      return {
        gramm: s.gramm + g,
        kcal: s.kcal + (z.kcal * g) / 100,
        protein: s.protein + (z.protein * g) / 100,
        kh: s.kh + (z.kh * g) / 100,
        fett: s.fett + (z.fett * g) / 100,
        ballaststoffe: s.ballaststoffe + ((z.ballaststoffe ?? 0) * g) / 100,
      };
    },
    { gramm: 0, kcal: 0, protein: 0, kh: 0, fett: 0, ballaststoffe: 0 },
  );
const zeile = (s) => [s.gramm, s.kcal, s.protein, s.kh, s.fett].map(Math.round);
const skaliert = (s, g) => zeile({ ...s, gramm: g, kcal: (s.kcal * g) / s.gramm, protein: (s.protein * g) / s.gramm, kh: (s.kh * g) / s.gramm, fett: (s.fett * g) / s.gramm });
const je100 = (s) => {
  const f = 100 / s.gramm;
  const e = (w) => Math.round(w * f * 10) / 10;
  return [Math.round(s.kcal * f), e(s.protein), e(s.kh), e(s.fett), e(s.ballaststoffe)];
};
const teile = (liste) => liste.map((b) => [b.zutat, b.gramm]);
const lahmacun = teile(R.lahmacunRezept);
const salat50 = R.salatMischung.map((b) => [b.zutat, b.gramm / 2]);
const joghurt = teile(R.sauce("joghurt").teile);
const kaese = teile(R.extra("kaese").teile);
const variante = (food, name) => {
  const v = food.variants.find((x) => x.name === name);
  assert.ok(v, food.slug + ": Variante fehlt: " + name);
  return [v.portion_g, v.calories, v.protein, v.carbs, v.fat];
};
const ueberblick = (food) => [
  food.overview.calories_per_100g,
  food.overview.protein_per_100g,
  food.overview.carbs_per_100g,
  food.overview.fat_per_100g,
  food.overview.fiber_per_100g,
];
const standard = R.portion(R.STANDARD).kcal;
const dueruem = R.portion(R.auswahl("dueruem", "kalb")).kcal;
const pur = summe(lahmacun);

test("Lahmacun: Werte aus dem Rezept des Döner-Kalorien-Rechners", () => {
  const food = lade("lahmacun");
  assert.deepEqual(ueberblick(food), je100(pur));
  assert.deepEqual(ueberblick(food), [234, 10.8, 39.2, 3.4, 1.9]);
  assert.equal(food.overview.typical_portion_g, 150);
  assert.deepEqual(variante(food, "Lahmacun pur"), zeile(pur));
  assert.deepEqual(variante(food, "Lahmacun mit Salat"), zeile(summe([...lahmacun, ...salat50])));
  assert.deepEqual(variante(food, "Lahmacun mit Salat und Joghurtsoße"), zeile(summe([...lahmacun, ...salat50, ...joghurt])));
  assert.deepEqual(variante(food, "Lahmacun mit Käse"), zeile(summe([...lahmacun, ...kaese])));
  assert.deepEqual(variante(food, "2 Lahmacun mit Salat"), zeile(summe([...lahmacun, ...salat50, ...lahmacun, ...salat50])));
  const p = R.portion(R.auswahl("lahmacun", "kalb"));
  assert.deepEqual(variante(food, "Lahmacun mit Dönerfleisch"), [p.gramm, p.kcal, p.protein, p.kh, p.fett]);
  assert.equal(p.kcal, 713);
  const vergleich = Object.fromEntries(food.comparison.map((c) => [c.name, c.calories]));
  assert.equal(vergleich["Döner Kebab"], standard);
  assert.equal(vergleich["Dürüm"], dueruem);
  assert.ok(food.faq[0].answer.startsWith("Ein Lahmacun (150 g) hat 351 kcal"), food.faq[0].answer);
  for (const id of [174915, 174032, 170459, 170000, 170108, 169248, 170457, 169977, 168409, 2705448, 171241, 167747]) {
    assert.ok(food.source.includes("FDC-ID " + id), "source ohne FDC-ID " + id);
  }
  assert.doesNotMatch(JSON.stringify(food), STRICH);
  assert.doesNotMatch(JSON.stringify(food), /420 kcal|680 kcal/);
});

const pizzaKebab = [["fladenbrot", 150], ["pizzasosse", 40], ["gouda", 40], ["rinderhack", 100], ["zwiebel", 20]];

test("Pizza Kebab: Rezeptrechnung aus FDC-Zutaten", () => {
  const food = lade("pizza-kebab");
  const std = summe(pizzaKebab);
  assert.deepEqual(ueberblick(food), je100(std));
  assert.deepEqual(zeile(std), [350, 835, 51, 90, 29]);
  assert.deepEqual(variante(food, "Portion vom Imbiss (350g)"), zeile(std));
  assert.deepEqual(variante(food, "Halbe Portion (175g)"), skaliert(std, 175));
  assert.deepEqual(variante(food, "Kleine Portion (250g)"), skaliert(std, 250));
  assert.deepEqual(variante(food, "Große Portion (450g)"), skaliert(std, 450));
  assert.deepEqual(variante(food, "XL-Portion (500g)"), skaliert(std, 500));
  assert.deepEqual(variante(food, "Pizza Kebab pro 100g"), skaliert(std, 100));
  const haehnchen = pizzaKebab.map(([id, g]) => [id === "rinderhack" ? "haehnchen" : id, g]);
  assert.deepEqual(variante(food, "Pizza Kebab mit Hähnchen (350g)"), zeile(summe(haehnchen)));
  assert.deepEqual(variante(food, "Pizza Kebab mit Joghurtsoße (380g)"), zeile(summe([...pizzaKebab, ...joghurt])));
  assert.deepEqual(variante(food, "Pizza Kebab mit Pommes (504g)"), zeile(summe([...pizzaKebab, ["pommes", 154]])));
  const vergleich = Object.fromEntries(food.comparison.map((c) => [c.name, c.calories]));
  assert.equal(vergleich["Döner (350g)"], standard);
  assert.equal(vergleich["Lahmacun (150g)"], Math.round(pur.kcal));
  assert.equal(vergleich["Dürüm (347g)"], dueruem);
  assert.ok(food.faq[0].answer.includes("(350 g) hat 835 kcal"), food.faq[0].answer);
  for (const id of [174915, 172880, 171241, 174032, 170000, 172388, 2705448, 170698]) {
    assert.ok(food.source.includes("FDC-ID " + id), "source ohne FDC-ID " + id);
  }
  assert.doesNotMatch(JSON.stringify(food), STRICH);
  assert.doesNotMatch(JSON.stringify(food), /823 kcal/);
});

test("Lahmacun-Vergleiche auf anderen Seiten folgen derselben Rechnung", () => {
  const erlaubt = {
    Lahmacun: Math.round(pur.kcal),
    "Lahmacun (ganz)": Math.round(pur.kcal),
    "Lahmacun (1 Stück)": Math.round(pur.kcal),
    "Lahmacun (150g)": Math.round(pur.kcal),
    "Lahmacun (250g)": Math.round((pur.kcal * 250) / pur.gramm),
    "Lahmacun mit Salat": Math.round(summe([...lahmacun, ...salat50]).kcal),
  };
  const seiten = ["borek", "burek", "duerrum", "durum-kebab", "flammkuchen", "goezleme", "kebap-pizza", "pide", "pinsa", "pizza-kebab"];
  for (const slug of seiten) {
    const treffer = lade(slug).comparison.filter((c) => /lahmacun/i.test(c.name));
    assert.ok(treffer.length > 0, slug);
    for (const c of treffer) assert.equal(c.calories, erlaubt[c.name], slug + ": " + c.name);
  }
  assert.ok(lade("pide").faq[3].answer.includes("(" + Math.round(pur.kcal) + " vs. 780+ kcal)"));
});

test("gebaute Seiten: Werte je 100 g und FAQ aus den Daten", () => {
  for (const [slug, kcal] of [["lahmacun", 234], ["pizza-kebab", 238]]) {
    const html = seite("/kalorien/" + slug + "/");
    assert.ok(visibleText(html).includes("berechnet aus " + kcal + " kcal pro 100 g"), slug);
    assert.deepEqual(faqFromSchema(html), lade(slug).faq, slug);
  }
});
