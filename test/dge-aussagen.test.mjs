// Aussagen mit Bezug auf DGE, WHO und IARC zu Eiern, Obst und Gemüse, Alkohol, Fast
// Food, Schinken und Rippchen (Fleisch und Wurst: test/fleisch-gesundheitsaussagen.test.mjs).
// Bis 24.11.2026 stand auf mahlzait.de, die DGE empfehle bis zu 3 Eier pro Woche (ei),
// 3 Portionen Gemüse und 2 Portionen Obst am Tag (gemuese), 250 g Obst am Tag (erdbeeren)
// und höchstens 10 g Alkohol am Tag für Frauen und 20 g für Männer (Alkohol-Rechner).
// Burger, Pizza, Haxe, Martini und Weißwein hießen gelegentlich oder in kleinen Mengen
// unbedenklich, unproblematisch oder kein Problem, Rippchen verarbeitetes Fleisch,
// Kochschinken eines der gesünderen verarbeiteten Fleischprodukte, jeweils ohne Quelle.
// Primärquellen, gelesen am 24.11.2026:
// - DGE, Fragen und Antworten zu den Ernährungsempfehlungen, Stand 29.05.2026: „Hier ist
//   ein Ei pro Woche, z. B. als Frühstücksei, angegeben. [...] Die Portionsangabe von
//   einem Ei pro Woche beruht daher weder auf einer Begrenzung aus gesundheitlichen
//   Gründen (z. B. Cholesterol) noch auf Nachhaltigkeitskriterien.“ (6.9), „Für den
//   Verzehr von Obst und Gemüse werden weiterhin zusammen mindestens 5 Portionen am Tag
//   empfohlen; allerdings entfallen die ergänzenden einzelnen Portionsangaben von 3
//   Portionen Gemüse und 2 Portionen Obst“ (4.1), „Die Portionsgröße für Obst und Gemüse
//   beträgt jeweils 110 g“ (6.3).
// - DGE, Fragen und Antworten zu Alkohol, Stand 01.05.2025: „Der zuvor gültige Richtwert
//   für die maximal tolerierbare Alkoholzufuhr lag für Frauen bei 10 g Alkohol/Tag und für
//   Männer bei 20 g Alkohol/Tag. [...] Im August 2024 löste das DGE-Positionspapier [...]
//   die Referenzwerte für die Alkoholzufuhr ab. Im Positionspapier zu Alkohol empfiehlt die
//   DGE auf alkoholische Getränke zu verzichten“.
// - DGE, „Süßes, Salziges und Fettiges“: „Zucker, Salz und Fett stecken oft „unsichtbar“ in
//   verarbeiteten Lebensmitteln wie Wurst, Gebäck, Süßwaren, Fast Food und Fertigprodukten.
//   Wird hiervon viel gegessen, steigt das Risiko für Übergewicht, Bluthochdruck,
//   Herz-Kreislauf-Erkrankungen und Typ-2-Diabetes.“
// - WHO, Fragen und Antworten „Carcinogenicity of red and processed meat“, Stand 23.09.2026:
//   "Red meat refers to all mammalian muscle meat, including [...] pork", "Processed meat
//   refers to meat that has been transformed through salting, curing, fermentation, smoking
//   or other processes to enhance flavour or improve preservation."
// - IARC, Fragen und Antworten zu Band 114 (2015): "there is not enough information to say
//   whether higher or lower cancer risks are related to eating any particular type of red
//   meat or processed meat", "about 34 000 cancer deaths per year worldwide are attributable
//   to diets high in processed meat. [...] These numbers contrast with about 1 million
//   cancer deaths per year globally due to tobacco smoking".
// Prüft die Daten und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { distDir, faqFromSchema, jsonLd, readPage, readRepoFile, visibleText } from "./dist-html.mjs";

const DGE = "https://www.dge.de/gesunde-ernaehrung/";
const FRAGEN = DGE + "faq/lebensmittelbezogene-ernaehrungsempfehlungen-dge/";
const KREIS = DGE + "gut-essen-und-trinken/dge-ernaehrungskreis/";
const EMPFEHLUNGEN = DGE + "gut-essen-und-trinken/dge-empfehlungen/";
const OBST_GEMUESE = DGE + "gut-essen-und-trinken/obst-und-gemuese/";
const FLEISCH = EMPFEHLUNGEN + "fleisch-und-wurst/";
const FETTIGES = EMPFEHLUNGEN + "suesses-salziges-und-fettiges/";
const ALKOHOL = DGE + "faq/alkohol/";
const ALKOHOL_POSITION = "https://www.dge.de/wissenschaft/stellungnahmen-und-positionspapiere/positionen/alkohol/";
const WHO = "https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat";
const IARC = "https://www.iarc.who.int/wp-content/uploads/2018/11/Monographs-QA_Vol114.pdf";

// Am 24.11.2026 geänderte Lebensmittelseiten mit ihren Quellen
const SEITEN = {
  ei: [FRAGEN, KREIS, FLEISCH],
  gemuese: [OBST_GEMUESE, FRAGEN],
  erdbeeren: [OBST_GEMUESE, FRAGEN],
  baileys: [ALKOHOL_POSITION],
  "lillet-wild-berry": [ALKOHOL_POSITION],
  martini: [ALKOHOL_POSITION],
  ouzo: [ALKOHOL_POSITION],
  "wein-weiss": [ALKOHOL_POSITION],
  "pizza-diavolo": [WHO],
  hamburger: [FETTIGES],
  "dominos-pizza": [FETTIGES],
  "burger-mit-pommes": [FETTIGES],
  "hans-im-glueck-burger": [FETTIGES],
  schweinshaxe: [FLEISCH],
  schinken: [WHO, IARC, FLEISCH],
  spareribs: [WHO],
};
// Alle Seiten zu alkoholischen Getränken
const ALKOHOLISCH = [
  "amaretto", "aperol-spritz", "bacardi", "bacardi-razz", "baileys", "bier", "bitburger",
  "bud-light", "caipirinha", "campari", "captain-morgan", "champagner", "chardonnay", "cider",
  "corona-extra", "desperados", "gin", "gin-tonic", "gluehwein", "guinness", "heineken", "hugo",
  "jack-daniels", "jacky-cola", "jim-beam", "klopfer", "lillet", "lillet-wild-berry", "martini",
  "mojito", "moscow-mule", "ouzo", "pina-colada", "prosecco", "radler", "rotkaeppchen-fruchtsecco",
  "smirnoff-ice", "somersby", "spritzer", "stella-artois", "tequila", "vodka-soda", "wein",
  "wein-rot", "wein-weiss", "weizenbier", "wodka", "wodka-lemon",
];

const lebensmittel = (slug) => JSON.parse(readRepoFile("src/data/foods/" + slug + ".json"));
const antwort = (slug, frage) => {
  const eintrag = lebensmittel(slug).faq.find((f) => f.question === frage);
  assert.ok(eintrag, slug + ": Frage fehlt: " + frage);
  return eintrag.answer;
};
const texte = (food) => [...food.tips.flatMap((t) => [t.title, t.text]), ...food.faq.map((f) => f.answer)];
// Sätze, ohne nach „ca.“, „max.“ oder „z. B.“ zu trennen
const saetze = (text) => text.split(/(?<!\b(?:ca|max|z|B)\.)(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9])/);
const artikel = (slug) => readRepoFile("src/content/wissen/articles/" + slug + ".md").replaceAll("\r\n", "\n");
const strich = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

// Alle Textdateien im Build: Seiten (samt Insel-Props), Skripte, llms-Dateien, JSON, Sitemaps.
function textdateien(dir = distDir) {
  const dateien = [];
  for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
    const pfad = join(dir, eintrag.name);
    if (eintrag.isDirectory()) dateien.push(...textdateien(pfad));
    else if (/\.(html|txt|json|xml|js|mjs)$/.test(eintrag.name)) dateien.push(pfad);
  }
  return dateien;
}

test("im ganzen Build steht keine der alten Aussagen", () => {
  const ALT = [
    // ei
    /DGE[^.<]{0,60}\b[2-9](?:\s*(?:bis|-)\s*\d+)? Eier pro Woche/,
    // gemuese, erdbeeren, Teller-Methode
    /DGE[^.<]{0,40}\b\d Portionen Gemüse/,
    /Davon 3 Portionen Gemüse/,
    /DGE[^.<]{0,20}\b250 ?g Obst/,
    /nimm 5 am Tag/,
    /bei 5 Portionen Obst ?\+ ?Gemüse sinkt/,
    // Alkohol-Rechner (steht nur im Skript der Seite) und alkoholische Getränke
    /DGE empfiehlt (?:maximal|max\.|höchstens) ?\d+ ?g Alkohol/,
    /Gegen ein kleines Glas zu besonderen Anlässen spricht nichts/,
    /passt ein Glas in fast jede Ernährung/,
    // Schinken, Rippchen, Artikel zu rotem Fleisch
    /eines der gesünderen verarbeiteten Fleischprodukte/,
    /rotem, verarbeitetem Fleisch/,
    /um Größenordnungen geringer als durch Rauchen/,
    /deutlich geringer als etwa beim Rauchen/,
  ];
  const funde = [];
  for (const pfad of textdateien()) {
    const text = readFileSync(pfad, "utf8");
    for (const muster of ALT) {
      const treffer = text.match(muster);
      if (treffer) funde.push(pfad.slice(distDir.length) + ": " + treffer[0]);
    }
  }
  assert.deepEqual(funde.slice(0, 20), [], funde.length + " Funde");
});

test("ei: 1 Ei pro Woche als Orientierungswert der DGE, keine gesundheitliche Grenze", () => {
  const text = texte(lebensmittel("ei")).join("\n");
  assert.ok(text.includes("Die DGE nennt seit März 2024 als Orientierungswert 1 Ei pro Woche, z. B. als Frühstücksei; Eier in Nudeln oder Kuchen kommen dazu."), text);
  assert.ok(text.includes("Eine Begrenzung aus gesundheitlichen Gründen (z. B. Cholesterin) ist das laut DGE nicht"), text);
  assert.ok(text.includes("wer Probleme mit dem Cholesterinspiegel hat, sollte aber weniger häufig Eier essen"), text);
  // Mengen pro Tag oder Woche nur als Angabe der DGE
  for (const satz of texte(lebensmittel("ei")).flatMap(saetze)) {
    if (/\d\s*(?:Eier|Ei)?\s*(?:pro|am|in der) (?:Woche|Tag)\b/.test(satz)) assert.match(satz, /DGE/, satz);
  }
});

test("gemuese, erdbeeren und Teller-Methode: mindestens 5 Portionen Obst und Gemüse ohne Aufteilung", () => {
  const gemuese = lebensmittel("gemuese");
  const tipp = gemuese.tips.find((t) => t.title === "Mindestens 5 Portionen pro Tag")?.text ?? "";
  assert.ok(tipp.startsWith("Die DGE empfiehlt mindestens 5 Portionen Obst und Gemüse pro Tag, eine Portion sind 110 g. Wie viel davon Gemüse sein soll, gibt sie seit März 2024 nicht mehr vor."), tipp);
  // Beispiel mit 3 und 2 Portionen: kcal aus den Seiten tomate und apfel
  const [, tomaten, aepfel, kcal] = tipp.match(/Mit (\d+) g Tomaten und (\d+) g Äpfeln sind das nur rund (\d+) kcal\./).map(Number);
  assert.equal(tomaten + aepfel, 5 * 110);
  const je100 = (slug) => lebensmittel(slug).overview.calories_per_100g / 100;
  assert.equal(kcal, Math.round((tomaten * je100("tomate") + aepfel * je100("apfel")) / 10) * 10);
  const tag = antwort("gemuese", "Wie viel Gemüse sollte man täglich essen?");
  for (const teil of [
    "Die DGE empfiehlt seit März 2024 mindestens 5 Portionen Obst und Gemüse zusammen pro Tag (gesunde Erwachsene von 18 bis 65 Jahren).",
    "Eine Portion sind 110 g, ungefähr eine Handvoll.",
    "Die frühere Aufteilung in 3 Portionen Gemüse und 2 Portionen Obst entfällt; wer auf die Energiezufuhr achtet, greift laut DGE lieber zu Gemüse als zu Obst.",
    "seltener von Bluthochdruck, Herzkrankheiten und Schlaganfall betroffen",
  ]) assert.ok(tag.includes(teil), tag);
  assert.doesNotMatch(tag, /28 ?%/);
  const erdbeeren = antwort("erdbeeren", "Wie viele Erdbeeren darf man am Tag essen?");
  assert.ok(erdbeeren.endsWith("Die DGE empfiehlt mindestens 5 Portionen Obst und Gemüse pro Tag (je 110g), 330g Erdbeeren sind 3 davon."), erdbeeren);

  const slug = "teller-methode-harvard-teller-portionskontrolle-evidenz";
  const text = artikel(slug);
  assert.ok(text.includes("und die der [Deutschen Gesellschaft für Ernährung](" + EMPFEHLUNGEN + ") (mindestens 5 Portionen Obst und Gemüse pro Tag, überwiegend pflanzlich)"), slug);
  assert.ok(readPage("/wissen/" + slug + "/").includes('href="' + EMPFEHLUNGEN + '"'), "Link zur DGE");
});

test("Alkohol-Rechner: Hinweis mit der Position der DGE zu jedem Ergebnis, ohne Grenzwert", () => {
  const quelle = readRepoFile("src/modules/alkohol/index.tsx");
  // 20 g war der frühere Richtwert für Männer: kein Hinweis erst ab einer Menge
  assert.doesNotMatch(quelle, /pureAlcoholGrams\s*[<>]/);
  const skripte = textdateien().filter((pfad) => pfad.endsWith(".js")).map((pfad) => readFileSync(pfad, "utf8"));
  const skript = skripte.find((text) => text.includes("Hinweis zur Gesundheit"));
  assert.ok(skript, "Skript des Alkohol-Rechners");
  for (const teil of [
    "Laut DGE gibt es keine sichere Alkoholmenge für einen unbedenklichen Konsum, sie empfiehlt, auf alkoholische Getränke zu verzichten.",
    "Die früheren Richtwerte (10 g Alkohol am Tag für Frauen, 20 g für Männer) hat sie im August 2024 abgelöst.",
    ALKOHOL,
  ]) assert.ok(skript.includes(teil), teil);
  // Rechenweg unverändert
  assert.match(quelle, /const ETHANOL_DENSITY = 0\.789;/);
  assert.match(quelle, /const CALORIES_PER_GRAM = 7;/);
});

test("alkoholische Getränke und Artikel: keine Menge unbedenklich, Verzicht nach DGE", () => {
  const funde = [];
  for (const slug of ALKOHOLISCH) {
    for (const satz of texte(lebensmittel(slug)).flatMap(saetze)) {
      if (satz.startsWith("Eine unbedenkliche Alkoholmenge gibt es laut DGE nicht")) continue;
      if (/unbedenklich|unproblematisch|harmlos|spricht (?:aber )?nichts|kein Problem|in fast jede Ernährung/i.test(satz)) funde.push(slug + ": " + satz);
    }
  }
  assert.deepEqual(funde, []);
  const dge = "Eine unbedenkliche Alkoholmenge gibt es laut DGE nicht, sie empfiehlt, auf alkoholische Getränke zu verzichten.";
  for (const [slug, frage] of [
    ["martini", "Ist Martini gesund?"],
    ["baileys", "Ist Baileys gesund?"],
    ["lillet-wild-berry", "Ist Lillet Wild Berry gesund?"],
    ["ouzo", "Ist Ouzo gesund?"],
  ]) assert.ok(antwort(slug, frage).includes(dge), slug);
  assert.ok(antwort("wein-weiss", "Macht Weißwein dick?").endsWith("Unabhängig vom Gewicht empfiehlt die DGE, auf alkoholische Getränke zu verzichten."));

  const slug = "alkohol-abnehmen-fettverbrennung";
  const text = artikel(slug);
  assert.ok(text.includes("Laut DGE gibt es keine sichere Alkoholmenge für einen unbedenklichen Konsum, sie empfiehlt seit August 2024, [auf alkoholische Getränke zu verzichten](" + ALKOHOL_POSITION + ")."), "Position der DGE");
  assert.ok(text.includes("Mehr als 6 alkoholische Getränke pro Woche (mehr als 81 g Alkohol) sind [laut DGE](" + ALKOHOL + ") mit einem hohen Risiko für Folgeschäden verbunden."), "Risiko laut DGE");
  assert.doesNotMatch(text, /Gelegentlich ist okay|Kein Drama/);
  const html = readPage("/wissen/" + slug + "/");
  for (const url of [ALKOHOL, ALKOHOL_POSITION]) assert.ok(html.includes('href="' + url + '"'), url);
});

test("Burger, Pizza und Haxe: nicht unbedenklich oder unproblematisch, Aussage nach DGE oder WHO", () => {
  const fastFood = "Wird viel Fast Food gegessen, steigt laut DGE das Risiko für Übergewicht, Bluthochdruck, Herz-Kreislauf-Erkrankungen und Typ-2-Diabetes.";
  for (const [slug, frage, teil] of [
    ["pizza-diavolo", "Ist Pizza Diavolo gesund?", "Salami ist zudem verarbeitetes Fleisch, für das die WHO keine unbedenkliche Menge nennt."],
    ["hamburger", "Ist ein Hamburger gesund?", fastFood],
    ["dominos-pizza", "Ist Domino's Pizza gesund?", fastFood],
    ["burger-mit-pommes", "Ist Burger mit Pommes ungesund?", fastFood],
    ["hans-im-glueck-burger", "Ist ein Hans im Glück Burger gesund?", fastFood],
    ["schweinshaxe", "Ist Schweinshaxe gesund?", "Die DGE empfiehlt, nicht mehr als 300 g Fleisch und Wurst pro Woche zu essen."],
  ]) {
    assert.ok(antwort(slug, frage).includes(teil), slug + ": " + antwort(slug, frage));
    for (const satz of texte(lebensmittel(slug)).flatMap(saetze)) {
      if (satz.includes("für das die WHO keine unbedenkliche Menge nennt")) continue;
      assert.doesNotMatch(satz, /unbedenklich|unproblematisch/i, slug);
    }
  }
});

test("schinken und spareribs: verarbeitetes und rotes Fleisch nach WHO und IARC", () => {
  const schinken = antwort("schinken", "Ist Schinken ungesund?");
  for (const teil of [
    "Schinken ohne Fettrand zählt die DGE zu den fettarmen Sorten",
    "verarbeitetes Fleisch, das die IARC, die Krebsforschungsagentur der WHO, als krebserregend für den Menschen einstuft (Gruppe 1)",
    "ob einzelne Sorten mit einem niedrigeren Krebsrisiko verbunden sind, lässt sich laut IARC (2015) nicht sagen",
  ]) assert.ok(schinken.includes(teil), schinken);
  assert.doesNotMatch(schinken, /gesünder/);
  const rippchen = antwort("spareribs", "Sind Spareribs gesund?");
  for (const teil of [
    "Als Schweinefleisch zählen sie laut WHO zu rotem Fleisch (Gruppe 2A, wahrscheinlich krebserregend für den Menschen).",
    "Zu verarbeitetem Fleisch (Gruppe 1, krebserregend) zählen gepökelte oder geräucherte Rippchen wie Kasseler.",
  ]) assert.ok(rippchen.includes(teil), rippchen);
});

test("Artikel zu rotem Fleisch: Vergleich mit dem Rauchen nach IARC, keine Entwarnung ohne Quelle", () => {
  const slug = "rotes-fleisch-gesundheit-abnehmen-evidenz-studien";
  const text = artikel(slug);
  assert.ok(text.includes("das heißt laut [IARC](" + IARC + ") aber nicht, dass beides gleich gefährlich ist"), "IARC");
  assert.ok(text.includes("Zum Vergleich nennt sie (Stand 2015) weltweit rund 34.000 Krebstodesfälle pro Jahr durch eine Ernährung mit viel verarbeitetem Fleisch und etwa 1 Million durch Tabakrauchen."), "Zahlen der IARC");
  assert.ok(text.includes("Eine unbedenkliche Menge nennt die [WHO](" + WHO + ") nicht: Das Risiko steigt mit der Menge."), "WHO");
  assert.doesNotMatch(text, /Größenordnungen|keine großen Sorgen|problemlos/);
  const html = readPage("/wissen/" + slug + "/");
  for (const url of [IARC, WHO]) assert.ok(html.includes('href="' + url + '"'), url);
  const faq = faqFromSchema(html).find((f) => f.question === "Ist rotes Fleisch wirklich krebserregend?");
  assert.ok(faq.answer.endsWith("Dass verarbeitetes Fleisch in derselben Gruppe steht wie Tabakrauchen, heißt laut IARC nicht, dass beides gleich gefährlich ist."), faq.answer);
  assert.ok(visibleText(html).includes(faq.answer), "sichtbare FAQ");
});

test("geänderte Lebensmittelseiten: Quellen verlinkt, FAQ-Schema und sichtbarer Text wie in den Daten, lastmod angepasst", () => {
  const lastmod = JSON.parse(readRepoFile("src/data/food-lastmod.json"));
  for (const [slug, urls] of Object.entries(SEITEN)) {
    const food = lebensmittel(slug);
    assert.deepEqual(food.quellen?.map((q) => q.url), urls, slug + ": Quellen");
    assert.doesNotMatch(JSON.stringify(food), strich, slug);
    const html = readPage("/kalorien/" + slug + "/");
    const sichtbar = visibleText(html);
    assert.ok(sichtbar.includes("Quellen zu den Empfehlungen:"), slug);
    for (const q of food.quellen) {
      assert.ok(html.includes('href="' + q.url + '"'), slug + ": " + q.url);
      assert.ok(sichtbar.includes(q.titel), slug + ": " + q.titel);
    }
    assert.deepEqual(faqFromSchema(html), food.faq, slug);
    for (const text of texte(food)) assert.ok(sichtbar.includes(text), slug + ": " + text);
    assert.ok(lastmod[slug] >= "2026-11-24", slug + ": lastmod " + lastmod[slug]);
  }
  // Quellenzeile nur auf Seiten mit Quellen
  assert.ok(!visibleText(readPage("/kalorien/apfel/")).includes("Quellen zu den Empfehlungen:"), "apfel");
});

test("geänderte Artikel: Aktualisierungsdatum und Quellen mit Link", () => {
  for (const [slug, urls] of [
    ["alkohol-abnehmen-fettverbrennung", [ALKOHOL_POSITION, ALKOHOL]],
    ["rotes-fleisch-gesundheit-abnehmen-evidenz-studien", [FLEISCH, WHO, IARC]],
    ["teller-methode-harvard-teller-portionskontrolle-evidenz", [EMPFEHLUNGEN]],
  ]) {
    const html = readPage("/wissen/" + slug + "/");
    const schema = jsonLd(html).find((block) => Array.isArray(block["@type"]) && block["@type"].includes("Article"));
    assert.ok(schema.dateModified >= "2026-11-24", slug + ": " + schema.dateModified);
    const kasten = html.slice(html.indexOf('id="quellen"'), html.indexOf('id="faq"') > 0 ? html.indexOf('id="faq"') : undefined);
    for (const url of urls) assert.ok(kasten.includes('href="' + url + '"'), slug + ": " + url);
  }
});
