// Gesundheitsaussagen zu verarbeitetem und rotem Fleisch. Bis 24.11.2026 stand auf
// mehreren Lebensmittelseiten, die WHO stufe verarbeitetes Fleisch als
// „wahrscheinlich krebserregend“ ein und empfehle höchstens 50 g am Tag oder 2- bis
// 3-mal pro Woche, für rotes Fleisch 300 bis 600 g pro Woche, und die DGE empfehle
// 300 bis 600 g. Andere Seiten nannten eigene Mengen („2-3x pro Woche“) oder nannten
// verarbeitetes Fleisch in kleinen Mengen unbedenklich, beides ohne Quelle.
// Primärquellen, gelesen am 24.11.2026:
// - WHO, Fragen und Antworten „Carcinogenicity of red and processed meat“, Stand
//   23.09.2026: "Red meat has been classified as Group 2A, probably carcinogenic to
//   humans.", "Processed meat has been classified as Group 1, carcinogenic to
//   humans.", "The risk increases with the amount of red or processed meat consumed,
//   but the data available for evaluation did not permit a conclusion at the time of
//   the original assessment about whether a safe level exists."
//   https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat
// - IARC, Pressemitteilung 240 vom 26.10.2015 und Fragen und Antworten dazu: "every 50
//   gram portion of processed meat eaten daily increases the risk of colorectal cancer
//   by about 18%", "For an individual, the risk [...] remains small, but this risk
//   increases with the amount of meat consumed".
//   https://www.iarc.who.int/wp-content/uploads/2018/07/pr240_E.pdf
//   https://www.iarc.who.int/wp-content/uploads/2018/11/Monographs-QA_Vol114.pdf
// - DGE, Empfehlungen „Gut essen und trinken“ (seit März 2024, für gesunde Erwachsene
//   von 18 bis 65 Jahren): „Die DGE empfiehlt nicht mehr als 300 g Fleisch und Wurst
//   pro Woche zu essen.“
//   https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/dge-empfehlungen/fleisch-und-wurst/
// Prüft die Daten und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  distDir,
  faqFromSchema,
  jsonLd,
  readPage,
  readRepoFile,
  visibleText,
} from "./dist-html.mjs";

const lebensmittel = (slug) =>
  JSON.parse(readRepoFile("src/data/foods/" + slug + ".json"));
const antwort = (slug, frage) => {
  const eintrag = lebensmittel(slug).faq.find((f) => f.question === frage);
  assert.ok(eintrag, slug + ": Frage fehlt: " + frage);
  return eintrag.answer;
};
const texte = (food) => [
  ...food.tips.flatMap((t) => [t.title, t.text]),
  ...food.faq.map((f) => f.answer),
];
// Sätze, ohne nach „ca.“, „max.“ oder „z. B.“ zu trennen
const saetze = (text) =>
  text.split(/(?<!\b(?:ca|max|z|B)\.)(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9])/);

// React setzt beim Vorrendern an Blockgrenzen vereinzelt ein NUL-Zeichen vor Umlaute.
const ohneNul = (text) => text.replaceAll(String.fromCharCode(0), "");

const artikel = "rotes-fleisch-gesundheit-abnehmen-evidenz-studien";
const DGE_GRENZE = "nicht mehr als 300 g Fleisch und Wurst pro Woche";
const DGE_SEITE =
  "https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/dge-empfehlungen/fleisch-und-wurst/";

// Seiten, deren Lebensmittel verarbeitetes Fleisch ist oder vor allem daraus besteht.
const VERARBEITET = [
  "beef-jerky", "berner-wuerstel", "bifi", "bifi-roll", "bockwurst", "bratwurst",
  "bresaola", "cabanossi", "corned-beef", "curry-king", "currywurst", "debreziner",
  "fleischwurst", "gefluegel-wiener", "gefluegelbratwurst", "hot-dog", "kaesekrainer",
  "kalbsbratwurst", "kasseler", "knacker", "krakauer", "lachsschinken", "leberkaese",
  "leberwurst", "lyoner", "mett", "mettwurst", "mortadella", "neuburger",
  "nuernberger-rostbratwurst", "parmaschinken", "salami", "schinken",
  "serrano-schinken", "speck", "sucuk", "weisswurst", "wiener", "wiener-wuerstchen",
  "wurst", "wurstsalat",
];
// Seiten zu rotem Fleisch (Rind, Schwein, Lamm).
const ROT = [
  "entrecote", "fleisch", "frikadellen", "hackfleisch-gemischt", "hackfleisch-rind",
  "hueftsteak", "kotelett", "rib-eye-steak", "rinderbraten", "rinderfilet",
  "rinderhueftsteak", "rindfleisch", "rippchen", "roastbeef", "rumpsteak",
  "schweinebraten", "schweinefilet", "schweinefleisch", "schweinshaxe", "spareribs",
  "steak", "tatar",
];
// Am 24.11.2026 geänderte Lebensmittelseiten.
const GEAENDERT = [
  "beef-jerky", "bifi", "bifi-roll", "cabanossi", "fleisch", "gefluegel-wiener",
  "krakauer", "leberwurst", "lyoner", "mettwurst", "mortadella", "rindfleisch",
  "salami", "schinken", "schweinefleisch", "speck", "wurst",
];

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

test("im ganzen Build steht keine der falschen Mengen von WHO und DGE zu Fleisch", () => {
  const strich = "[-" + String.fromCharCode(0x2013, 0x2014) + "]";
  const FALSCH = [
    // „300-600g Fleisch pro Woche“, „300 bis 600 g Fleisch und Wurst pro Woche“
    new RegExp("300\\s*g?\\s*(?:bis|" + strich + ")\\s*600\\s*g[^.<]{0,60}pro Woche"),
    // „WHO: max. 50g verarbeitetes Fleisch“, „WHO empfiehlt max. 300-600g rotes Fleisch“
    /\bWHO\b[^.<]{0,40}\bmax\. ?\d[\d-]*\s*g (?:verarbeitetes |rotes )?Fleisch/,
    // „laut WHO max. 2-3x pro Woche“
    /\bWHO\b[^.<]{0,40}\bmax\. ?\d[\d-]*x pro Woche/,
    // „verarbeitetes Fleisch (...) als „wahrscheinlich krebserregend“ ein bei mehr als 50g/Tag“
    /wahrscheinlich krebserregend[^.<]{0,20}bei mehr als/,
  ];
  const funde = [];
  for (const pfad of textdateien()) {
    const text = ohneNul(readFileSync(pfad, "utf8"));
    for (const muster of FALSCH) {
      const treffer = text.match(muster);
      if (treffer) funde.push(pfad.slice(distDir.length) + ": " + treffer[0]);
    }
  }
  assert.deepEqual(funde.slice(0, 20), [], funde.length + " Funde");
});

test("wurst und salami: verarbeitetes Fleisch ist Gruppe 1, die WHO nennt keine unbedenkliche Menge", () => {
  const wurst = lebensmittel("wurst");
  const salami = lebensmittel("salami");
  const tipp = (food) => food.tips.find((t) => t.title === "WHO: krebserregend (Gruppe 1)")?.text;
  assert.match(tipp(wurst) ?? "", /IARC, die Krebsforschungsagentur der WHO, stuft verarbeitetes Fleisch \(Wurst, Salami, Schinken\) als krebserregend für den Menschen ein \(Gruppe 1\)/);
  assert.match(tipp(wurst) ?? "", /Eine unbedenkliche Menge nennt die WHO nicht\./);
  assert.match(tipp(salami) ?? "", /verarbeitetes Fleisch, das die IARC, die Krebsforschungsagentur der WHO, als krebserregend für den Menschen einstuft \(Gruppe 1\)/);
  const tag = antwort("wurst", "Wie viel Wurst pro Tag ist okay?");
  assert.match(tag, /^Eine unbedenkliche Menge nennt die WHO nicht: Die ausgewerteten Daten ließen keinen Schluss zu, ob es eine gibt \(WHO, Stand 23\.09\.2026\)\./);
  assert.ok(tag.includes("jede täglich gegessene Portion von 50 g verarbeitetem Fleisch das Risiko für Darmkrebs um etwa 18 %"), tag);
  assert.ok(tag.includes("für den Einzelnen bleibt das Risiko klein, steigt aber mit der Menge"), tag);
  assert.ok(tag.includes(DGE_GRENZE), tag);
  const ungesund = antwort("salami", "Ist Salami ungesund?");
  assert.ok(ungesund.includes("als krebserregend für den Menschen ein (Gruppe 1)"), ungesund);
  assert.ok(ungesund.includes("eine unbedenkliche Menge nennt die WHO nicht (Stand 23.09.2026)"), ungesund);
  for (const [slug, food] of [["wurst", wurst], ["salami", salami]]) {
    assert.doesNotMatch(texte(food).join("\n"), /wahrscheinlich krebserregend/, slug);
  }
});

test("fleisch, rindfleisch, schweinefleisch und der Wissensartikel: DGE höchstens 300 g Fleisch und Wurst pro Woche", () => {
  const rot = lebensmittel("fleisch").tips.find((t) => t.title === "Rotes Fleisch limitieren").text;
  assert.ok(rot.includes("stuft rotes Fleisch (Rind, Schwein, Lamm) als wahrscheinlich krebserregend für den Menschen ein (Gruppe 2A)"), rot);
  assert.ok(rot.includes("Eine Höchstmenge nennt die WHO nicht (Stand 23.09.2026)"), rot);
  assert.ok(rot.includes(DGE_GRENZE), rot);
  const woche = antwort("fleisch", "Wie viel Fleisch pro Woche?");
  assert.ok(woche.startsWith("Die DGE empfiehlt seit März 2024, " + DGE_GRENZE), woche);
  for (const [slug, frage] of [
    ["rindfleisch", "Wie oft sollte man Rindfleisch essen?"],
    ["schweinefleisch", "Wie oft sollte man Schweinefleisch essen?"],
  ]) {
    const text = antwort(slug, frage);
    assert.ok(text.startsWith("Die DGE empfiehlt, insgesamt " + DGE_GRENZE), text);
    // DGE: „dem reicht 1 Portion rotes Fleisch (ca. 120 g) und 1 Portion Wurst (ca. 30 g) pro Woche aus“
    assert.match(text, /reicht laut DGE 1 Portion rotes Fleisch wie (?:Rind|Schwein) \(ca\. 120 g\) und 1 Portion Wurst \(ca\. 30 g\) pro Woche aus/);
  }
  const satz = "Die Deutsche Gesellschaft für Ernährung (DGE) empfiehlt seit März 2024, " + DGE_GRENZE + " zu essen.";
  assert.ok(readRepoFile("src/content/wissen/articles/" + artikel + ".md").includes(satz), "Artikeltext");
  const html = readPage("/wissen/" + artikel + "/");
  const faq = faqFromSchema(html).find((f) => f.question === "Wie viel Fleisch pro Woche ist gesund?");
  assert.ok(faq.answer.startsWith(satz), faq.answer);
  assert.ok(ohneNul(visibleText(html)).includes(faq.answer), "sichtbare FAQ des Artikels");
  assert.ok(html.includes('href="' + DGE_SEITE + '"'), "Quellenangabe DGE mit Link");
  const schema = jsonLd(html).find((block) => Array.isArray(block["@type"]) && block["@type"].includes("Article"));
  assert.ok(schema.citation.some((c) => c.author === "Deutsche Gesellschaft für Ernährung"), "DGE im Article-Schema");
});

test("Seiten zu verarbeitetem und rotem Fleisch: Mengen pro Woche oder Tag nur als Empfehlung der DGE", () => {
  // Fisch und Geflügel, nicht Gegenstand dieser Regel
  const AUSGENOMMEN = new Set(["fleisch: Beste Strategie: 2x Fisch + 2-3x Geflügel pro Woche."]);
  const MENGE = /\d[^.!?]*\b(?:pro|je|in der|am) (?:Woche|Tag)\b|\d\s*(?:x|mal|g)?\s*\/\s*(?:Woche|Tag)\b/;
  const funde = [];
  for (const slug of [...VERARBEITET, ...ROT]) {
    for (const satz of texte(lebensmittel(slug)).flatMap(saetze)) {
      if (!MENGE.test(satz) || satz.includes("DGE") || AUSGENOMMEN.has(slug + ": " + satz)) continue;
      // Salz ist nicht Gegenstand dieser Regel („Die WHO empfiehlt max. 5g/Tag insgesamt.“ auf salami)
      if (satz === "Die WHO empfiehlt max. 5g/Tag insgesamt.") continue;
      funde.push(slug + ": " + satz);
    }
  }
  assert.deepEqual(funde, []);
  const jerky = antwort("beef-jerky", "Wie viel Beef Jerky darf man am Tag essen?");
  assert.doesNotMatch(jerky, /25-50 ?g|Portionen/);
  assert.ok(jerky.includes("Beef Jerky zählt laut WHO zu verarbeitetem Fleisch, für das sie keine unbedenkliche Menge nennt."), jerky);
});

test("keine Seite nennt verarbeitetes Fleisch in einer Menge unbedenklich oder unproblematisch", () => {
  // Schwangerschaft und rohes Fleisch (Listerien, Toxoplasmose), nicht Krebs
  const AUSGENOMMEN = /^Wegen des Listeriose- und Toxoplasmose-Risikos raten Fachgesellschaften Schwangeren /;
  const funde = [];
  for (const slug of VERARBEITET) {
    for (const satz of texte(lebensmittel(slug)).flatMap(saetze)) {
      if (!/unbedenklich|unproblematisch/i.test(satz) || AUSGENOMMEN.test(satz)) continue;
      // „Eine unbedenkliche Menge nennt die WHO nicht“
      if (/\bWHO\b/.test(satz) && /nennt die WHO nicht|keine unbedenkliche Menge/.test(satz)) continue;
      funde.push(slug + ": " + satz);
    }
  }
  for (const satz of texte(lebensmittel("schweinefleisch")).flatMap(saetze)) {
    if (/unbedenklich/i.test(satz)) funde.push("schweinefleisch: " + satz);
  }
  assert.deepEqual(funde, []);
});

test("geänderte Seiten: FAQ-Schema und sichtbarer Text wie in den Daten, ohne Gedankenstrich, lastmod angepasst", () => {
  const strich = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
  const lastmod = JSON.parse(readRepoFile("src/data/food-lastmod.json"));
  for (const slug of GEAENDERT) {
    const food = lebensmittel(slug);
    assert.doesNotMatch(JSON.stringify(food), strich, slug);
    const html = readPage("/kalorien/" + slug + "/");
    assert.deepEqual(faqFromSchema(html), food.faq, slug);
    const sichtbar = ohneNul(visibleText(html));
    for (const text of texte(food)) assert.ok(sichtbar.includes(text), slug + ": " + text);
    assert.ok(lastmod[slug] >= "2026-11-24", slug + ": lastmod " + lastmod[slug]);
  }
});
