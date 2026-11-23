// Pizza-Kalorien-Rechner (/pizza-kalorien-rechner/): Bis 23.11.2026 rechnete
// src/modules/pizza/index.tsx mit festen Werten je Stück ohne Gewicht und ohne
// Quelle (Margherita 200, Salami 260, Quattro Formaggi 290 kcal, Käserand +80 kcal
// je Stück, Größenfaktoren 0,7 bis 2,0 je Stück). Seit dem Umbau rechnet
// src/modules/pizza/rechnung.ts in Gramm: Eine 30-cm-Pizza wiegt 350 g (Seite
// pizza), ein Stück ist ein Achtel, 43,75 g; jede Sorte nimmt die Werte je 100 g
// ihrer Lebensmittelseite oder, ohne Seite, ein Rezept aus USDA-FDC-Zutaten.
// Boden und Beläge zählen in Gramm mit FDC-Werten, größere Pizzen wiegen im
// Verhältnis der Fläche mehr (Vorschlag aus Commit 3d0369a, freigegeben am
// 23.11.2026). Der Test prüft die Rechnung, die Grenzfälle, die gebaute Seite
// und den Kalorienverbrauch-Rechner (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  faqFromSchema,
  jsonLd,
  pageExists,
  readPage,
  readRepoFile,
  visibleText,
} from "./dist-html.mjs";

// Der lokale Build unter Windows schreibt vereinzelt NUL-Bytes vor Mehrbyte-Zeichen
// (siehe doener-kalorien.test.mjs); sie fallen vor der Prüfung weg.
const NUL = String.fromCharCode(0);
const seite = (route) => readPage(route).split(NUL).join("");
const STRICH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const lade = (slug) => JSON.parse(readRepoFile("src/data/foods/" + slug + ".json"));
const referenz = JSON.parse(readRepoFile("test/fdc-referenz.json")).eintraege;

// Dynamisch, damit jeder Test einzeln scheitert, wenn das Modul fehlt.
const R = await import("../src/modules/pizza/rechnung.ts").catch(() => null);
const F = await import("../src/modules/pizza/faq.ts").catch(() => null);
const brauchtRechnung = () => assert.ok(R, "src/modules/pizza/rechnung.ts fehlt");
const nahe = (a, b, wo) => assert.ok(Math.abs(a - b) < 1e-9, wo + ": " + a + " statt " + b);
const werte = (m) => [m.kcal, m.protein, m.kh, m.fett, m.ballaststoffe];
const ganzePizza = (sorte, groesse = "medium", boden = "classic", belaege = []) =>
  R.berechne(R.auswahl(sorte, groesse, boden, belaege, R.groesse(groesse).stuecke));

// Sorten mit eigener Lebensmittelseite
const MIT_SEITE = {
  margherita: "pizza-margherita",
  salami: "pizza-salami",
  tonno: "pizza-tonno",
  hawaii: "pizza-hawaii",
  "quattro-formaggi": "pizza-quattro-formaggi",
  diavola: "pizza-diavola",
  vegetariana: "pizza-vegetariana",
};

test("Sorten mit Lebensmittelseite rechnen mit deren Werten je 100 g", () => {
  brauchtRechnung();
  for (const [id, slug] of Object.entries(MIT_SEITE)) {
    const s = R.sorte(id);
    const o = lade(slug).overview;
    assert.equal(s.seite, slug, id);
    assert.equal(s.rezept, undefined, id);
    assert.deepEqual(
      werte(s.je100g),
      [o.calories_per_100g, o.protein_per_100g, o.carbs_per_100g, o.fat_per_100g, o.fiber_per_100g],
      id,
    );
    assert.ok(pageExists("/kalorien/" + slug + "/"), slug + " fehlt im Build");
  }
  // Die drei übrigen Sorten haben keine Seite und rechnen mit einem Rezept.
  const ohneSeite = R.sorten.filter((s) => !s.seite).map((s) => s.id);
  assert.deepEqual(ohneSeite, ["prosciutto", "capricciosa", "bbq-chicken"]);
  for (const id of ohneSeite) {
    assert.ok(R.sorte(id).rezept?.length > 0, id + " ohne Rezept");
    assert.ok(!pageExists("/kalorien/pizza-" + id + "/"), id + " hat jetzt eine Seite");
  }
  assert.equal(R.sorten.length, 10);
});

test("Werte je Stück sind die Werte je 100 g mal 43,75 g", () => {
  brauchtRechnung();
  assert.equal(R.PIZZA_GRAMM, 350);
  assert.equal(R.STUECK_GRAMM, 43.75);
  // Grundlage: Seite pizza, 1 Pizza = 350 g
  assert.equal(lade("pizza").overview.typical_portion_g, 350);
  for (const s of R.sorten) {
    const e = R.berechne(R.auswahl(s.id, "medium", "classic", [], 1));
    assert.equal(e.stueckzahl, 8);
    nahe(e.stueck.gramm, 43.75, s.id + " Gramm");
    werte(e.stueck).forEach((w, i) => nahe(w, (werte(s.je100g)[i] * 43.75) / 100, s.id));
    assert.deepEqual(e.gegessen, e.stueck);
  }
  // Vorschlag aus Commit 3d0369a (1 Stück = 1/8 einer 350-g-Pizza)
  assert.deepEqual(
    Object.fromEntries(Object.keys(MIT_SEITE).map((id) => [id, R.stueckKcal(id)])),
    { margherita: 116, salami: 123, tonno: 113, hawaii: 99, "quattro-formaggi": 117, diavola: 120, vegetariana: 102 },
  );
});

test("Die ganze 30-cm-Pizza entspricht den 350-g-Varianten der Lebensmittelseiten", () => {
  brauchtRechnung();
  const zeile = (m) => {
    const g = R.gerundet(m);
    return [g.gramm, g.kcal, g.protein, g.kh, g.fett];
  };
  const variante = (slug, name) => {
    const v = lade(slug).variants.find((x) => x.name === name);
    assert.ok(v, slug + ": Variante fehlt: " + name);
    return [v.portion_g, v.calories, v.protein, v.carbs, v.fat];
  };
  assert.deepEqual(zeile(ganzePizza("margherita").gegessen), variante("pizza", "Pizza Margherita"));
  assert.deepEqual(zeile(ganzePizza("vegetariana").gegessen), variante("pizza-vegetariana", "1 ganze Pizza (350g)"));
  assert.deepEqual(zeile(ganzePizza("diavola").gegessen), variante("pizza-diavola", "Ganze TK-Pizza (350g)"));
  // Kalorienverbrauch-Rechner nennt dieselbe ganze Margherita
  const quelle = readRepoFile("src/components/calculators/DoenerRechner.tsx");
  assert.ok(quelle.includes('{ name: "Pizza Margherita", kcal: ' + R.ganzeKcal("margherita") + ","));
  // Das große Pizzeria-Stück (140 g) der FAQ ist die Variante der Seite pizza-margherita
  const gross = lade("pizza-margherita").variants.find((v) => v.name === "Pizza Margherita (1 Stück, Pizzeria)");
  assert.deepEqual([gross.portion_g, gross.calories], [140, Math.round((R.sorte("margherita").je100g.kcal * 140) / 100)]);
  // Tiefkühlpizzen der Kalorientabelle und FAQ: Varianten der Seiten
  for (const t of R.tiefkuehl) {
    const v = lade(t.seite).variants.find((x) => x.name === t.variante);
    assert.ok(v, t.seite + ": " + t.variante);
    assert.deepEqual([v.portion_g, v.calories, v.basis?.[0]?.fdcId], [t.gramm, t.kcal, t.fdcId]);
    assert.equal(referenz[String(t.fdcId)].kcal, t.kcalJe100g);
  }
});

// FDC-Werte je 100 g: Referenzdatei aus den Massendaten; 174183 steht auf keiner
// Lebensmittelseite und damit nicht in der Referenz, Werte laut FDC-API (23.11.2026).
const FDC_API = {
  174183: { beschreibung: "Fish, anchovy, european, canned in oil, drained solids", kcal: 210, eiweiss: 28.89, kohlenhydrate: 0, fett: 9.71, ballaststoffe: 0 },
};

test("Zutaten haben die Werte ihres FDC-Eintrags, die Rezepte ergeben die Werte je 100 g", () => {
  brauchtRechnung();
  for (const z of Object.values(R.zutaten)) {
    const e = referenz[String(z.fdcId)] ?? FDC_API[z.fdcId];
    assert.ok(e, z.name + ": FDC " + z.fdcId + " unbekannt");
    assert.equal(z.fdcName, e.beschreibung, z.name);
    assert.deepEqual(werte(z), [e.kcal, e.eiweiss, e.kohlenhydrate, e.fett, e.ballaststoffe], z.name);
  }
  // Zutaten mit eigener Lebensmittelseite nutzen deren FDC-Eintrag. Anders mit
  // Absicht: Artischockenherzen gegart (Seite artischocken: roh), Pepperoni-Salami
  // (Seite pepperoni: eingelegte Peperoni).
  const seiten = { kaesepizza: "pizza-margherita", teig: "baguette", mozzarella: "mozzarella", kochschinken: "schinken", speck: "speck", haehnchen: "haehnchenbrust", champignons: "champignons", oliven: "oliven", zwiebel: "zwiebel" };
  for (const [id, slug] of Object.entries(seiten)) {
    assert.ok(lade(slug).source.includes("FDC-ID " + R.zutaten[id].fdcId + " "), id + " / " + slug);
  }
  const rezepte = R.sorten.filter((s) => s.rezept);
  for (const s of rezepte) {
    const gramm = s.rezept.reduce((sum, b) => sum + b.gramm, 0);
    assert.equal(gramm, 350, s.id + ": Rezept für eine 350-g-Pizza");
    const je100 = [0, 0, 0, 0, 0];
    for (const b of s.rezept) werte(R.zutaten[b.zutat]).forEach((w, i) => (je100[i] += (w * b.gramm) / gramm));
    werte(s.je100g).forEach((w, i) => nahe(w, je100[i], s.id));
    assert.equal(s.rezept[0].zutat, "kaesepizza", s.id + ": Grundlage Käsepizza");
  }
  assert.deepEqual(
    rezepte.map((s) => [s.id, s.rezept.map((b) => b.zutat + " " + b.gramm).join(", "), Math.round(s.je100g.kcal), R.stueckKcal(s.id)]),
    [
      ["prosciutto", "kaesepizza 300, kochschinken 50", 243, 106],
      ["capricciosa", "kaesepizza 260, kochschinken 30, champignons 25, artischocken 25, oliven 10", 215, 94],
      ["bbq-chicken", "kaesepizza 270, haehnchen 50, bbqSosse 20, zwiebel 10", 240, 105],
    ],
  );
});

test("Größen: Das Gewicht wächst mit der Fläche", () => {
  brauchtRechnung();
  assert.deepEqual(
    R.groessen.map((g) => [g.id, g.durchmesser, g.stuecke]),
    [["small", 26, 6], ["medium", 30, 8], ["large", 36, 10], ["family", 45, 12]],
  );
  for (const g of R.groessen) {
    const gramm = 350 * (g.durchmesser / 30) ** 2;
    nahe(R.pizzaGramm(g.id), gramm, g.id);
    for (const s of R.sorten) {
      const e = R.berechne(R.auswahl(s.id, g.id, "classic", [], 1));
      nahe(e.stueck.gramm, gramm / g.stuecke, g.id + " " + s.id);
      nahe(e.stueck.kcal, (s.je100g.kcal * gramm) / g.stuecke / 100, g.id + " " + s.id);
    }
  }
  assert.deepEqual(R.groessen.map((g) => Math.round(R.pizzaGramm(g.id))), [263, 350, 504, 788]);
  assert.deepEqual(R.groessen.map((g) => R.ganzeKcal("margherita", g.id)), [699, 931, 1341, 2095]);
  assert.deepEqual(R.groessen.map((g) => R.stueckKcal("margherita", g.id)), [117, 116, 134, 175]);
});

test("Boden und Beläge: Gramm je Pizza mit FDC-Werten je Gramm", () => {
  brauchtRechnung();
  // FDC-Portionsangaben (FDC-API, 23.11.2026): "1 medium pizza (11-12\" diameter)"
  // und "1 surface inch" bzw. "Topping per surface inch of pizza"
  assert.deepEqual(R.fdcPortionen, {
    mittlerePizza: {
      normal: { fdcId: 2708614, gramm: 691 },
      duenn: { fdcId: 2708615, gramm: 500 },
      dick: { fdcId: 2708617, gramm: 744 },
      kaeserand: { fdcId: 2708618, gramm: 800 },
    },
    quadratzoll: { pizza: { fdcId: 2708614, gramm: 6.2 }, belag: { fdcId: 2705787, gramm: 2.1 } },
  });
  const unterschied = (g) => Math.round((350 * (g - 691)) / 691);
  assert.equal(R.TEIG_GRAMM, Math.round((350 * (6.2 - 2.1)) / 6.2));
  assert.deepEqual(
    Object.fromEntries(R.boeden.map((b) => [b.id, b.teile])),
    {
      classic: [],
      thin: [{ zutat: "teig", gramm: unterschied(500) }],
      thick: [{ zutat: "teig", gramm: unterschied(744) }],
      stuffed: [{ zutat: "mozzarella", gramm: unterschied(800) }],
      wholegrain: [{ zutat: "teig", gramm: -231 }, { zutat: "vollkornteig", gramm: 231 }],
    },
  );
  for (const b of R.boeden) {
    const gramm = b.teile.reduce((s, t) => s + t.gramm, 0);
    const kcal = b.teile.reduce((s, t) => s + (R.zutaten[t.zutat].kcal * t.gramm) / 100, 0);
    const e = ganzePizza("margherita", "medium", b.id);
    nahe(e.ganz.gramm, 350 + gramm, b.id + " Gramm");
    nahe(e.ganz.kcal, 931 + kcal, b.id + " kcal");
    nahe(R.bodenJeStueck(b.id), kcal / 8, b.id + " je Stück");
    // bei 45 cm wächst der Zuschlag mit der Fläche
    nahe(R.bodenJeStueck(b.id, "family"), (kcal * 2.25) / 12, b.id + " 45 cm");
  }
  assert.deepEqual(
    R.belaege.map((b) => [b.id, b.zutat, b.gramm]),
    [
      ["extra-cheese", "mozzarella", 50],
      ["pepperoni", "pepperoni", 30],
      ["mushrooms", "champignons", 50],
      ["olives", "oliven", 20],
      ["onions", "zwiebel", 30],
      ["bacon", "speck", 30],
      ["jalapenos", "jalapenos", 20],
      ["anchovies", "sardellen", 20],
    ],
  );
  for (const b of R.belaege) {
    const kcal = (R.zutaten[b.zutat].kcal * b.gramm) / 100;
    const e = ganzePizza("margherita", "medium", "classic", [b.id]);
    nahe(e.ganz.gramm, 350 + b.gramm, b.id + " Gramm");
    nahe(e.ganz.kcal, 931 + kcal, b.id + " kcal");
    nahe(R.belagJeStueck(b.id), kcal / 8, b.id + " je Stück");
    nahe(R.belagJeStueck(b.id, "small"), (kcal * (26 / 30) ** 2) / 6, b.id + " 26 cm");
  }
  // so zeigen es die Knöpfe bei 30 cm (kcal je Stück)
  assert.deepEqual(R.boeden.map((b) => Math.round(R.bodenJeStueck(b.id))), [0, -33, 9, 21, -10]);
  assert.deepEqual(R.belaege.map((b) => Math.round(R.belagJeStueck(b.id))), [19, 19, 1, 3, 2, 15, 1, 5]);
});

test("Grenzfälle: 0 Stück, ganze Pizza, zu viele Stücke, größte Größe, alle Beläge", () => {
  brauchtRechnung();
  const alle = R.belaege.map((b) => b.id);
  // 0 Stück: nichts gegessen, die Pizza selbst bleibt gleich
  const keins = R.berechne(R.auswahl("margherita", "medium", "classic", [], 0));
  assert.equal(keins.stuecke, 0);
  assert.deepEqual(R.gerundet(keins.gegessen), { gramm: 0, kcal: 0, protein: 0, kh: 0, fett: 0, ballaststoffe: 0 });
  assert.equal(Math.round(keins.ganz.kcal), 931);
  assert.equal(R.berechne(R.auswahl("margherita", "medium", "classic", [], -2)).stuecke, 0);
  // ganze Pizza: ungerundet gerechnet, 931 kcal statt 8 × 116 = 928 kcal
  const ganz = ganzePizza("margherita");
  assert.deepEqual(ganz.gegessen, ganz.ganz);
  assert.equal(Math.round(ganz.gegessen.kcal), 931);
  assert.equal(8 * R.stueckKcal("margherita"), 928);
  // mehr Stücke als die Pizza hat: begrenzt (die kleine Pizza hat 6)
  const zuViele = R.berechne(R.auswahl("margherita", "small", "classic", [], 12));
  assert.deepEqual([zuViele.stueckzahl, zuViele.stuecke], [6, 6]);
  assert.deepEqual(zuViele.gegessen, zuViele.ganz);
  // größte Größe, Käserand und alle Beläge, die ganze Pizza
  const max = ganzePizza("salami", "family", "stuffed", alle);
  const f = 2.25;
  const belagGramm = R.belaege.reduce((s, b) => s + b.gramm, 0);
  const belagKcal = R.belaege.reduce((s, b) => s + (R.zutaten[b.zutat].kcal * b.gramm) / 100, 0);
  assert.equal(belagGramm, 250);
  nahe(max.ganz.gramm, 787.5 + f * (55 + belagGramm), "Gramm");
  nahe(max.ganz.kcal, (282 * 787.5) / 100 + f * ((299 * 55) / 100 + belagKcal), "kcal");
  assert.deepEqual(R.gerundet(max.gegessen), { gramm: 1474, kcal: 3743, protein: 185, kh: 273, fett: 212, ballaststoffe: 22 });
  assert.equal(Math.round(max.stueck.kcal), 312);
  // alle Beläge bei 30 cm: 64 kcal mehr je Stück
  const einStueck = R.berechne(R.auswahl("margherita", "medium", "classic", alle, 1));
  assert.equal(Math.round(einStueck.stueck.kcal - R.berechne(R.auswahl("margherita")).stueck.kcal), 64);
  assert.throws(() => R.berechne(R.auswahl("funghi")), /Unbekannte Auswahl/);
  assert.throws(() => R.berechne(R.auswahl("margherita", "xxl")), /Unbekannte Auswahl/);
});

test("Gebaute Seite: FAQ und Schema gleich, Annahmen sichtbar, keine alten Werte", () => {
  brauchtRechnung();
  assert.ok(F, "src/modules/pizza/faq.ts fehlt");
  const html = seite("/pizza-kalorien-rechner/");
  const text = visibleText(html);
  // sichtbare FAQ und FAQPage-Schema aus derselben Liste
  assert.deepEqual(faqFromSchema(html), F.faq.map((f) => ({ question: f.q, answer: f.a })));
  for (const f of F.faq) {
    assert.ok(text.includes(f.q), "sichtbare Frage fehlt: " + f.q);
    assert.ok(text.includes(f.a), "sichtbare Antwort fehlt: " + f.a);
  }
  // Annahmen im Abschnitt "So rechnen wir"
  for (const satz of [
    "So rechnen wir",
    "Grundlage ist eine Pizza mit 30 cm Durchmesser und 350 g",
    "Ein Stück ist ein Achtel davon, also 43,75 g, gerundet 44 g.",
    "26 cm 263 g, 30 cm 350 g, 36 cm 504 g, 45 cm 788 g. Boden und Beläge wachsen im selben Verhältnis mit.",
    "mit normalem Boden 691 g, mit dünnem 500 g, mit dickem 744 g und mit Käserand 800 g",
    "97 g Teig weniger beim dünnen Boden, 27 g Teig mehr beim dicken und 55 g Mozzarella im Käserand",
    "Die ganze Margherita hat deshalb 931 kcal, nicht 8 × 116 = 928 kcal.",
  ]) {
    assert.ok(text.includes(satz), "fehlt: " + satz);
  }
  for (const z of Object.values(R.zutaten)) assert.ok(text.includes("FDC " + z.fdcId), "FDC " + z.fdcId + " fehlt");
  // Kalorientabelle: je 100 g, ein Stück, ganze 30-cm-Pizza
  for (const s of R.sorten) {
    const zeile = s.name + " " + Math.round(s.je100g.kcal) + " kcal " + R.stueckKcal(s.id) + " kcal " + R.ganzeKcal(s.id) + " kcal";
    assert.ok(text.includes(zeile), "Tabelle: " + zeile);
  }
  assert.ok(text.includes("Margherita (300 g) 789 kcal, Salami (320 g) 877 kcal"), "Tiefkühlpizza");
  // Schema: ganze Margherita und Größen mit Gewicht
  const bloecke = jsonLd(html);
  const ni = bloecke.find((b) => b["@type"] === "NutritionInformation");
  assert.deepEqual(
    [ni.servingSize, ni.calories, ni.proteinContent, ni.carbohydrateContent, ni.fatContent],
    ["350g", "931 kcal", "40g", "117g", "34g"],
  );
  const howTo = bloecke.find((b) => b["@type"] === "HowTo");
  assert.equal(
    howTo.step[0].text,
    "Wähle zwischen klein (26 cm, 263 g), normal (30 cm, 350 g), groß (36 cm, 504 g) oder Familienpizza (45 cm, 788 g)",
  );
  // alte Stückwerte, Spannen und Zuschläge sind weg
  assert.doesNotMatch(
    text,
    /200-300 kcal|800-1200 kcal|800-900|1000-1100|1100-1200|950-1050|850-950|750-850|650-750|650-850|ca\. 200 kcal|ca\. 260 kcal|bis zu 290 kcal|400-500 kcal|\+80 kcal|\+40 kcal/,
  );
  // keine Gedankenstriche im Inhalt der Seite und im Schema
  const inhalt = text.slice(text.indexOf("Pizza Kalorien Rechner"), text.lastIndexOf(F.faq[F.faq.length - 1].a));
  assert.ok(inhalt.length > 5000, "Inhalt nicht gefunden");
  assert.doesNotMatch(inhalt, STRICH);
  for (const b of bloecke.filter((b) => ["FAQPage", "HowTo", "WebApplication", "NutritionInformation"].includes(b["@type"]))) {
    assert.doesNotMatch(JSON.stringify(b), STRICH, b["@type"]);
  }
});

test("Pizza-Rechner: Vergleich in Tafeln Schokolade mit dem Wert der Seite schokolade", () => {
  const quelle = readRepoFile("src/modules/pizza/index.tsx");
  const tafel = lade("schokolade").variants.find((v) => v.name === "Vollmilchschokolade (1 Tafel 100g)");
  assert.equal(tafel.portion_g, 100);
  assert.ok(quelle.includes("(calories / " + tafel.calories + ")"), "Tafeln Schoko mit " + tafel.calories + " kcal");
});

test("Kalorienverbrauch-Rechner: Pizza-Zeile passt zur ganzen 30-cm-Margherita", () => {
  brauchtRechnung();
  const kcal = R.ganzeKcal("margherita");
  // Joggen: 10 kcal pro Minute, der Rechner rundet auf (Math.ceil)
  const t = visibleText(seite("/kalorienverbrauch-rechner/"));
  assert.ok(t.includes("Pizza: " + Math.ceil(kcal / 10) + " Min Joggen"), "Liste Pizza");
  assert.doesNotMatch(t, /Pizza: 80 Min Joggen/);
});
