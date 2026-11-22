// Vergleichswerte für Döner und Big Mac außerhalb der Döner-Seiten. Seit 36bd967
// rechnet src/modules/doener/rezepte.ts den Döner aus USDA-FDC-Zutaten (Kalb/Rind
// 696 kcal bei 350 g, Dürüm 724, Teller mit Salat 383) und nennt den Big Mac laut
// FDC 170720 mit 563 kcal. Die Vergleiche auf den übrigen Lebensmittelseiten, im
// Kalorienverbrauch-Rechner, im Pizza-Rechner, auf der Fast-Food-Kategorieseite,
// im Alkohol- und im Schritte-Rechner und in zwei Wissensartikeln nannten noch
// alte Werte (Döner meist 600 oder 650 kcal, Big Mac 503 oder 509 kcal).
// Gebaute Seiten aus dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  faqFromSchema,
  readPage,
  readRepoFile,
  repoRoot,
  visibleText,
} from "./dist-html.mjs";

const R = await import("../src/modules/doener/rezepte.ts");

// Der lokale Build unter Windows schreibt vereinzelt NUL-Bytes vor Mehrbyte-Zeichen
// (siehe doener-kalorien.test.mjs); sie fallen vor der Prüfung weg.
const NUL = String.fromCharCode(0);
const text = (route) => visibleText(readPage(route).split(NUL).join(""));
const STRICH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

const standard = R.portion(R.STANDARD);
const standardJe100g = R.je100g(R.STANDARD).kcal;
const dueruem = R.portion(R.auswahl("dueruem", "kalb")).kcal;
const tellerJe100g = R.je100g(R.auswahl("teller", "kalb")).kcal;
const tellerSalat = R.portion(R.auswahl("salatteller", "kalb")).kcal;
const kinder = R.portion(R.auswahl("classic", "kalb", ["joghurt"], [], 60)).kcal;
const boxXL = R.portion(R.auswahl("box", "kalb", ["joghurt"], [], 150)).kcal;
const gesamt = R.berechne(R.STANDARD).gesamt;
const doener250g = Math.round((gesamt.kcal * 250) / gesamt.gramm);
const bigMac = R.bigMacKcal;

test("Rezeptrechnung: die Vergleichswerte dieses Tests", () => {
  assert.deepEqual(
    [standard.kcal, standard.protein, standardJe100g, dueruem, tellerJe100g],
    [696, 47, 199, 724, 141],
  );
  assert.deepEqual([tellerSalat, kinder, boxXL, doener250g, bigMac], [383, 429, 1236, 497, 563]);
});

// Döner-Seiten mit eigener Rezeptrechnung prüft doener-kalorien.test.mjs.
const doenerSeiten = new Set([
  "doener",
  "doener-box",
  "doener-teller",
  "duerrum",
  "durum-kebab",
  "kebab",
  "vegetarischer-doener",
]);
// Lahmacun und Pizza Kebab rechnet der nächste Commit neu.
const spaeter = new Set(["lahmacun", "pizza-kebab"]);
// Seiten, auf denen der Big Mac selbst Gegenstand ist (Variante mit eigener Angabe)
const bigMacSeiten = new Set(["burger", "double-burger", "mcdonalds"]);

const foods = readdirSync(join(repoRoot, "src/data/foods"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readRepoFile("src/data/foods/" + f)))
  .filter((food) => !doenerSeiten.has(food.slug) && !spaeter.has(food.slug));

// Erlaubte Werte je Vergleichsname; "Döner" steht in Listen je Portion und je 100 g.
const erlaubt = {
  Döner: [standard.kcal, standardJe100g],
  "Döner Kebab": [standard.kcal],
  "Döner (1 Stück)": [standard.kcal],
  "Döner (1 komplett)": [standard.kcal],
  "Döner (1 Tasche)": [standard.kcal],
  Dönertasche: [standard.kcal],
  "Döner (350g)": [standard.kcal],
  "Döner (250g)": [doener250g],
  "Dürüm Döner": [dueruem],
  Dönerteller: [tellerJe100g],
  "Big Mac": [bigMac],
  "McDonald's Big Mac": [bigMac],
  "Big Mac (McDonald's)": [bigMac],
  "Big Mac (219g)": [bigMac],
};

test("Vergleichslisten der Lebensmittelseiten nennen die Werte der Rezeptrechnung", () => {
  let geprueft = 0;
  for (const food of foods) {
    for (const c of food.comparison) {
      if (!/d[öo]ner|d[üu]r[üu]m|big mac/i.test(c.name)) continue;
      assert.ok(c.name in erlaubt, food.slug + ": unbekannter Vergleich " + c.name);
      assert.ok(
        erlaubt[c.name].includes(c.calories),
        food.slug + ": " + c.name + " mit " + c.calories + " kcal",
      );
      geprueft++;
    }
  }
  assert.ok(geprueft >= 90, "nur " + geprueft + " Vergleiche gefunden");
});

const texte = (food) =>
  [...food.tips.map((t) => t.text), ...food.faq.map((f) => f.answer), food.seo.description];

test("Tipps und FAQ der Lebensmittelseiten nennen dieselben Döner- und Big-Mac-Werte", () => {
  const regeln = [
    [/\bD[öo]ner(?: mit Kalb- oder Rindfleisch)? \(([^)]*)\)/g, [standard.kcal + " kcal", standard.protein + " g"]],
    [/\bD[öo]ner (?:hat|mit) (?:ca\. )?([\d.-]+ kcal)/g, [standard.kcal + " kcal"]],
    [/Döner-Box \(XL, ([\d.]+) kcal\)/g, [boxXL.toLocaleString("de-DE")]],
  ];
  const bigMacRegeln = [
    [/Big Mac \(([^)]*)\)/g, [bigMac + " kcal"]],
    [/Big Mac liegt mit (?:rund )?([\d.]+) kcal/g, [String(bigMac)]],
  ];
  let geprueft = 0;
  for (const food of foods) {
    for (const s of texte(food)) {
      const alle = bigMacSeiten.has(food.slug) ? regeln : [...regeln, ...bigMacRegeln];
      for (const [re, werte] of alle) {
        for (const m of s.matchAll(re)) {
          assert.ok(werte.includes(m[1]), food.slug + ": " + m[0]);
          geprueft++;
        }
      }
      if (/D[öo]ner|Big Mac/.test(s) && /kcal/.test(s)) {
        assert.doesNotMatch(s, STRICH, food.slug + ": Gedankenstrich in " + s);
      }
    }
  }
  assert.ok(geprueft >= 25, "nur " + geprueft + " Textstellen gefunden");
});

test("Kalorienverbrauch-Rechner: Döner und Big Mac wie in der Rezeptrechnung", () => {
  const quelle = readRepoFile("src/components/calculators/DoenerRechner.tsx");
  assert.ok(quelle.includes('{ name: "Döner", kcal: ' + standard.kcal + ","), "Döner");
  assert.ok(quelle.includes('{ name: "Big Mac", kcal: ' + bigMac + ","), "Big Mac");
  // Joggen: 10 kcal pro Minute, der Rechner rundet auf (Math.ceil)
  const minDoener = Math.ceil(standard.kcal / 10);
  const minBigMac = Math.ceil(bigMac / 10);
  const t = text("/kalorienverbrauch-rechner/");
  assert.ok(t.includes(standard.kcal + " kcal"), "Startwert des Rechners");
  assert.ok(
    t.includes("Ein Döner (" + standard.kcal + " kcal) = " + minDoener + " Minuten Joggen."),
    "Einleitung",
  );
  assert.ok(t.includes("Döner: " + minDoener + " Min Joggen"), "Liste Döner");
  assert.ok(t.includes("Big Mac: " + minBigMac + " Min Joggen"), "Liste Big Mac");
  assert.ok(
    t.includes("Ein Döner hat " + standard.kcal + " kcal, dafür müsstest du über eine Stunde joggen."),
    "Absatz Kaloriendefizit",
  );
  assert.doesNotMatch(t, /650 kcal|65 Min/);
});

test("Pizza-Rechner: Vergleich in Döner und Big Macs mit den neuen Werten", () => {
  const quelle = readRepoFile("src/modules/pizza/index.tsx");
  assert.ok(quelle.includes("(calories / " + standard.kcal + ")"), "Döner Kebabs");
  assert.ok(quelle.includes("(calories / " + bigMac + ")"), "Big Macs");
  const html = readPage("/pizza-kalorien-rechner/").split(NUL).join("");
  const satz = "Ein Döner (" + standard.kcal + " kcal) hat weniger Kalorien als eine ganze Pizza";
  assert.ok(visibleText(html).includes(satz), "sichtbare FAQ");
  assert.ok(
    faqFromSchema(html).some((f) => f.answer.startsWith(satz)),
    "FAQ-Schema",
  );
  assert.doesNotMatch(html, /550-650 kcal/);
});

test("Fast-Food-Kategorie: Döner-Werte in der FAQ aus der Rezeptrechnung", () => {
  const brotUndSosse = R.zutatKcal("fladenbrot", 120) + R.sauceKcal("joghurt");
  const satz =
    "Ein klassischer Döner hat " + standard.kcal + " kcal, davon kommen " + brotUndSosse +
    " kcal allein aus Fladenbrot und Joghurtsoße.";
  const html = readPage("/kalorien/kategorie/fast-food/").split(NUL).join("");
  assert.ok(visibleText(html).includes(satz), satz);
  assert.ok(visibleText(html).includes("Ein Döner-Teller mit Salat (" + tellerSalat + " kcal)"));
  const faq = faqFromSchema(html);
  assert.ok(faq.some((f) => f.answer.includes(satz)), "FAQ-Schema");
  assert.doesNotMatch(html, /550-650 kcal|350-400 kcal/);
});

test("Alkohol-, Schritte-Rechner und Wissensartikel: Vergleiche mit den neuen Werten", () => {
  const alkohol = text("/alkohol-kalorien-rechner/");
  assert.ok(
    alkohol.includes("Eine Piña Colada kann über 500 kcal haben, fast so viel wie ein Big Mac (" + bigMac + " kcal)."),
    "Alkohol-Rechner",
  );
  assert.doesNotMatch(alkohol, /mehr als ein Big Mac/);
  // Schritte-Rechner: 400 bis 499 kcal entsprechen einem Kinder-Döner (60 % Portion)
  const schritte = readRepoFile("src/modules/schritte/index.tsx");
  assert.ok(schritte.includes('equivalentFood = "1 Kinder-Döner";'), "Schritte-Rechner");
  assert.doesNotMatch(schritte, /Döner Tasche/);
  assert.ok(kinder >= 400 && kinder < 500, "Kinder-Döner " + kinder + " kcal");
  // Wissensartikel werden im Browser gerendert, daher die Markdown-Dateien
  const sport = readRepoFile("src/content/wissen/articles/abnehmen-ohne-sport-ernaehrung.md");
  assert.ok(
    sport.includes("aber das ist nicht mal ein [Döner](/kalorien/doener/) (" + standard.kcal + " kcal)"),
    "Artikel Abnehmen ohne Sport",
  );
  const alkoholArtikel = readRepoFile("src/content/wissen/articles/alkohol-abnehmen-fettverbrennung.md");
  assert.ok(alkoholArtikel.includes("| Döner um 2 Uhr | " + standard.kcal + " kcal |"), "Artikel Alkohol");
  assert.ok(alkoholArtikel.includes("| **Gesamt** | **" + (860 + standard.kcal + 300 + 250).toLocaleString("de-DE") + " kcal** |"), "Summe");
});
