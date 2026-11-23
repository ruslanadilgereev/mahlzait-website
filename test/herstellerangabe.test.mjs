// Herkunft der Werte sichtbar auf den Lebensmittelseiten (src/modules/kalorienFood,
// src/pages/kalorien/[slug].astro). Markenprodukte, die USDA FoodData Central
// nicht führt, tragen die Angabe des Herstellers mit sichtbarem Hinweis
// "Herstellerangabe", Link und Abrufdatum; nennt der Hersteller Werte je 100 ml,
// zeigt die Seite "pro 100 ml" und Mengen in ml. Die Fußzeile nennt die
// tatsächliche Quelle der Seite (FDC-Eintrag, Rezeptrechnung, Herstellerangabe)
// statt pauschal "Open Food Facts und USDA"; Seiten ohne belegte Quelle nennen
// keine. Das WebApplication-Schema verweist mit isBasedOn auf dieselbe Quelle.
// Prüft Daten und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { jsonLd, readPage, readRepoFile, visibleText } from "./dist-html.mjs";

const NUL = String.fromCharCode(0);
const lade = (slug) => JSON.parse(readRepoFile(`src/data/foods/${slug}.json`));
const seite = (slug) => readPage(`/kalorien/${slug}/`).split(NUL).join("");
// Tags werden zu Leerzeichen; vor Satzzeichen hinter einem Link fällt es weg.
const text = (slug) => visibleText(seite(slug)).replace(/ ([,.])/g, "$1");
const webApp = (slug) => jsonLd(seite(slug)).find((b) => b["@type"] === "WebApplication");
const datum = (iso) => iso.split("-").reverse().join(".");

test("Herstellerangabe: sichtbarer Hinweis mit Hersteller, Produkt, Abrufdatum und Link", () => {
  const food = lade("actimel");
  const h = food.hersteller;
  assert.ok(h && food.source.startsWith("Herstellerangabe"), "actimel ohne Herstellerangabe");
  const t = text("actimel");
  assert.ok(t.includes(`Herstellerangabe: ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}.`), "Hinweis unter der Nährwerttabelle");
  assert.ok(t.includes(`Quelle: Herstellerangabe ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}.`), "Fußzeile");
  assert.ok(seite("actimel").includes(`href="${h.url}"`), "Link zur Herstellerseite");
  assert.deepEqual(webApp("actimel").isBasedOn.map((q) => q.url), [h.url]);
});

test("Herstellerangabe je 100 ml: Seite zeigt pro 100 ml und Mengen in ml", () => {
  const food = lade("bueno-eis");
  assert.equal(food.overview.einheit, "ml");
  const t = text("bueno-eis");
  assert.ok(t.includes("Nährwerte pro 100 ml"), "Überschrift");
  assert.ok(t.includes("Wie viele Kalorien haben 50 ml, 200 ml oder 500 ml"), "Mengentabelle");
  assert.ok(t.includes(`kcal pro 100 ml`), "berechnet aus ... pro 100 ml");
  const n = jsonLd(seite("bueno-eis")).find((b) => b["@type"] === "NutritionInformation");
  assert.equal(n.servingSize, food.overview.typical_portion_g + " ml");
});

test("FDC-Seite: Fußzeile und isBasedOn nennen USDA FoodData Central mit FDC-ID", () => {
  const food = lade("apfelmark");
  const id = food.source.match(/\b\d{6,7}\b/)[0];
  const t = text("apfelmark");
  assert.ok(t.includes(`Quelle: USDA FoodData Central, FDC-ID ${id}, Werte je 100 g.`), "Fußzeile");
  assert.ok(seite("apfelmark").includes(`href="https://fdc.nal.usda.gov/food-details/${id}/nutrients"`), "Link zum Eintrag");
  assert.deepEqual(webApp("apfelmark").isBasedOn.map((q) => q.name), ["USDA FoodData Central"]);
  assert.ok(t.includes("Nährwerte pro 100g"), "Seiten je 100 g unverändert");
});

test("Rezeptseite: Fußzeile nennt die Rezeptrechnung mit den FDC-IDs", () => {
  const t = text("tikka-masala");
  assert.match(t, /Quelle: USDA FoodData Central, Rezeptrechnung aus Zutaten mit den FDC-IDs [0-9, ]*171477/);
});

test("Seite ohne belegte Quelle: kein Quellenhinweis und kein isBasedOn", () => {
  const food = lade("mars");
  assert.equal(food.source, undefined);
  assert.ok(!/Quelle:/.test(text("mars")), "Quellenhinweis");
  assert.equal(webApp("mars").isBasedOn, undefined);
});

test("Lebensmittelseiten nennen Open Food Facts nicht mehr als Grundlage der Werte", () => {
  for (const slug of ["actimel", "bueno-eis", "apfelmark", "tikka-masala", "mars"]) {
    assert.ok(!text(slug).includes("Open Food Facts"), slug + ": sichtbarer Text");
    const q = JSON.stringify(webApp(slug).isBasedOn ?? []);
    assert.ok(!q.includes("Open Food Facts") && !q.includes("openfoodfacts"), slug + ": isBasedOn");
  }
});

test("allgemeine Seite mit Herstellerangabe als Beispiel: sichtbar gekennzeichnet", () => {
  for (const [slug, beispiel] of [
    ["gummibaerchen", "HARIBO Goldbären"],
    ["creme-fraiche", "Dr. Oetker Crème fraîche Classic"],
    ["schmand", "MILRAM Frischer Schmand"],
    // Regel 2 (Entscheidung vom 23.11.2026): allgemeine Lebensmittel ohne FDC-Eintrag
    ["acai", "Wholey Açaí Drops (Bio-Açaí-Püree, ungesüßt)"],
    ["bistro-baguette", "Dr. Oetker Bistro Baguette Salami"],
    ["cabanossi", "Wiltmann Salamissimo to go Mini-Cabanossi heißgeräuchert"],
    ["dinkelnudeln", "Bernbacher Bio Dinkel Band"],
    ["flips", "Lorenz ErdnußLocken Classic"],
    ["ginger-beer", "Schweppes Spicy Ginger Beer"],
    ["glucose", "Dextro Energy Classic (Traubenzuckerwürfel)"],
    ["grillkaese", "Gazi Grill- und Pfannenkäse Natur"],
    ["lachsschinken", "ALDI SÜD Gut Drei Eichen Lachsschinken-Aufschnitt Klassik"],
    ["leberkaese", "REWE ja! Bayerischer Leberkäse"],
    ["magerquark", "MILRAM Magerquark"],
    ["maltodextrin", "ZEC+ Maltodextrin (Pulver)"],
    ["matcha", "Raab Vitalfood Bio Matcha Pulver Premium"],
    ["matjes", "Nadler Edle Matjesfilets"],
    ["nougat-bits", "Golden Bridge (ALDI SÜD) Nougat Bits"],
    ["quark", "MILRAM Magerquark"],
    ["raclette", "ALDI SÜD Roi de Trèfle Raclette Käse"],
    ["raclette-kaese", "ALDI SÜD Roi de Trèfle Raclette Käse"],
    ["raeuchertofu", "Taifun Räuchertofu Klassik"],
    ["roestzwiebeln", "Kühne Röstzwiebeln"],
    ["skyr", "Arla Skyr Natur Cremig"],
    ["sucuk", "Egetürk Barış Kangal Sucuk"],
    ["topfen", "MILRAM Speisequark 20 % Fett"],
    ["traubenzucker", "Dextro Energy Classic (Traubenzuckerwürfel)"],
    ["udon", "Bamboo Garden Udon Nudeln (vorgegart)"],
    ["weingummi", "HARIBO Weinland"],
    ["weisswurst", "REWE Wilhelm Brandenburg Münchner Weißwurst"],
  ]) {
    const food = lade(slug);
    const h = food.hersteller;
    assert.equal(h.beispiel, true, slug);
    assert.ok(food.source.includes("Werte am Beispiel " + beispiel), slug + ": source");
    const t = text(slug);
    assert.ok(t.includes(`Werte am Beispiel ${beispiel} (Herstellerangabe), abgerufen am ${datum(h.abgerufen)}.`), slug + ": Hinweis");
    assert.ok(t.includes(`Quelle: Werte am Beispiel ${beispiel} (Herstellerangabe), abgerufen am ${datum(h.abgerufen)}.`), slug + ": Fußzeile");
    assert.ok(seite(slug).includes(`href="${h.url}"`), slug + ": Link");
  }
});

test("Rezept mit Zutat aus einer Herstellerangabe: Fußzeile nennt sie mit Link, isBasedOn mit Herstellerseite", () => {
  // Regel 1 (23.11.2026): Zutaten ohne FDC-Eintrag (Quark, Matjes, Leberkäse) rechnen mit den Werten einer Seite mit Herstellerangabe
  for (const slug of ["acai-bowl","kaesekuchen","kartoffeln-mit-quark","leberkassemmel","matjes-broetchen","quarktasche"]) {
    const food = lade(slug);
    const zutaten = food.rezept.zutaten.filter((z) => z.slug != null);
    assert.ok(zutaten.length > 0, slug + ": keine Zutat aus einer Herstellerangabe");
    const t = text(slug).replace(/ \)/g, ")");
    assert.match(t, /Quelle: USDA FoodData Central, Rezeptrechnung aus Zutaten mit den FDC-IDs [0-9, ]+;/, slug + ": Fußzeile");
    const quellen = webApp(slug).isBasedOn;
    assert.equal(quellen[0].name, "USDA FoodData Central", slug);
    for (const z of zutaten) {
      const andere = lade(z.slug);
      const h = andere.hersteller;
      const angabe = h.beispiel
        ? `Werte am Beispiel ${h.name} ${h.produkt} (Herstellerangabe), abgerufen am ${datum(h.abgerufen)}`
        : `Herstellerangabe ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}`;
      assert.ok(t.includes(`; ${z.name}: ${angabe} (Seite ${andere.name})`), slug + ": Zutat " + z.name + " in der Fußzeile");
      assert.ok(seite(slug).includes(`href="/kalorien/${z.slug}/"`), slug + ": Link zur Seite " + z.slug);
      assert.ok(quellen.some((q) => q.url === h.url), slug + ": isBasedOn ohne " + h.url);
    }
  }
});

test("Herstellerangabe aus Österreich oder der Schweiz: sichtbar mit Land gekennzeichnet", () => {
  // Regel 3 (23.11.2026): Markenprodukte, die nur offizielle Herstellerseiten aus Österreich oder der Schweiz haben
  for (const slug of ["lidl-ciabatta","lidl-croissant","lidl-donut","lion","neuburger","smarties","stella-artois"]) {
    const food = lade(slug);
    const h = food.hersteller;
    assert.ok(h && ["Österreich", "Schweiz"].includes(h.land), slug + ": hersteller.land");
    assert.ok(food.source.startsWith(`Herstellerangabe (${h.land}) `), slug + ": source");
    const t = text(slug);
    assert.ok(t.includes(`Herstellerangabe (${h.land}): ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}.`), slug + ": Hinweis unter der Nährwerttabelle");
    assert.ok(t.includes(`Quelle: Herstellerangabe (${h.land}) ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}.`), slug + ": Fußzeile");
    assert.ok(seite(slug).includes(`href="${h.url}"`), slug + ": Link zur Herstellerseite");
    assert.deepEqual(webApp(slug).isBasedOn.map((q) => q.name), [`${h.produkt}: Nährwertangabe von ${h.name} (${h.land})`], slug);
  }
});

test("Stückgewicht nicht vom Hersteller: als Schätzung sichtbar", () => {
  // Regel 4 (23.11.2026): Werte je 100 g vom Hersteller, das bisherige Stückgewicht bleibt als Schätzung
  const menge = (g, einheit) => String(g).replace(".", ",") + " " + einheit;
  for (const slug of ["celebrations","ferrero-kuesschen","fritt","gustavo-gusto-margherita","gustavo-gusto-pizza","heisse-tasse","iglo-backfisch","leibniz-butterkeks","maggi","maoam","maoam-bloxx","maoam-joystixx","maoam-stripes","mentos","milka-noisette","milka-schokolade","mon-cheri","nordsee-backfisch-baguette","ritter-sport","schogetten","tuc","tuc-cracker","tuc-kekse","lidl-ciabatta","lion","neuburger","smarties"]) {
    const food = lade(slug);
    assert.ok(food.source.startsWith("Herstellerangabe"), slug + ": keine Herstellerangabe");
    const einheit = food.overview.einheit === "ml" ? "ml" : "g";
    const t = text(slug);
    const geschaetzt = food.variants.filter((v) => v.stueck_geschaetzt);
    assert.ok(geschaetzt.length > 0 || food.overview.portion_geschaetzt, slug + ": keine Schätzung gekennzeichnet");
    for (const v of geschaetzt) {
      assert.ok(t.includes(`ca. ${menge(v.portion_g, einheit)}, Stückgewicht nicht vom Hersteller angegeben`), slug + " / " + v.name);
    }
    if (food.overview.portion_geschaetzt) {
      const o = food.overview;
      assert.ok(t.includes(`${o.typical_portion_name}: ca. ${menge(o.typical_portion_g, einheit)}, Stückgewicht nicht vom Hersteller angegeben.`), slug + ": typische Portion");
    }
  }
});

test("Herstellerangabe für den deutschen Markt, am 23.11.2026 neu gefunden: sichtbarer Hinweis, Fußzeile und Link", () => {
  // vorher offen, weil die Herstellerseite gesperrt oder nicht erreichbar war (KFC-PDF, McDonald's, lillet.com) oder nicht gefunden wurde
  for (const slug of ["caro-kaffee","dr-pepper","kfc-hot-wings","kfc-twister","lillet","mc-toast","muellermilch","tassimo-milka"]) {
    const food = lade(slug);
    const h = food.hersteller;
    assert.ok(h && !h.land && !h.beispiel && food.source.startsWith("Herstellerangabe "), slug + ": keine Herstellerangabe für Deutschland");
    const t = text(slug);
    assert.ok(t.includes(`Herstellerangabe: ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}.`), slug + ": Hinweis unter der Nährwerttabelle");
    assert.ok(t.includes(`Quelle: Herstellerangabe ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}.`), slug + ": Fußzeile");
    assert.ok(seite(slug).includes(`href="${h.url.replaceAll("&", "&amp;")}"`), slug + ": Link zur Herstellerseite");
    assert.deepEqual(webApp(slug).isBasedOn.map((q) => q.url), [h.url], slug);
  }
});
