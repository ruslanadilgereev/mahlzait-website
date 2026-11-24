// Wasserbedarfs-Rechner (/wasserbedarf-rechner/): Bis 24.11.2026 rechnete
// src/modules/wasserbedarf/index.tsx Gewicht × 35 ml als Trinkmenge, mal Faktoren für Aktivität
// (1,0 bis 1,5) und Klima (0,9 bis 1,3), dazu Minimum und Maximum (0,8 und 1,2), alles ohne Quelle.
// Nach der DGE gelten die 35 ml je kg für Getränke und feste Nahrung zusammen. Seitdem rechnet
// src/modules/wasserbedarf/rechnung.ts mit den Richtwerten der DGE für Getränke je Altersgruppe
// (Entscheidung von Ruslan, 24.11.2026). Primärquellen, gelesen am 24.11.2026:
// - DGE, Referenzwerte, Wasser, „Stand Ableitung: 2000“: Tabelle „Richtwerte für die Wasserzufuhr“
//   (Abschrift unten), Spalte ml/kg: „Wasserzufuhr durch Getränke und feste Nahrung“; Fußnote b:
//   „Wasserzufuhr durch Getränke = Gesamtwasserzufuhr - Oxidationswasser - Wasserzufuhr durch feste
//   Nahrung“; „Ein erhöhter Bedarf besteht bei hohem Energieumsatz, Hitze, trockener kalter Luft,
//   reichlichem Kochsalzverzehr, hoher Proteinzufuhr und pathologischen Zuständen wie Fieber,
//   Erbrechen, Durchfall etc..“
// - DGE, Fragen und Antworten zu den Referenzwerten, Frage 9: „Beispielsweise gibt es für Wasser,
//   Fluorid und Ballaststoffe eine Begrenzung nach unten“.
// - DGE, „Am besten Wasser trinken“: „Trinken Sie rund 1,5 Liter jeden Tag“ (gesunde Erwachsene von
//   18 bis 65 Jahren); „Koffeinhaltige Getränke wie schwarzer oder grüner Tee und Kaffee sind ohne
//   Milch und Zucker kalorienfreie Getränke, die zur Flüssigkeitsbilanz hinzugezählt werden können.“
// - DGE-Flyer „Wasser trinken, fit bleiben“ (2024): „Auch bei körperlich anstrengender Arbeit oder
//   Sport ist mehr Flüssigkeit notwendig [...] dann können schon mal zusätzlich 0,5 [bis] 1,0 Liter
//   Wasser pro Stunde nötig sein.“; „Kaffee sowie schwarzer und grüner Tee ohne Zucker, können wie
//   Wasser der Flüssigkeitsbilanz zugezählt werden.“; „Bei Erwachsenen spricht nichts gegen den
//   moderaten Genuss von 3 bis 4 Tassen pro Tag.“; „Weniger als 1,0 Liter Wasser pro Tag reicht nicht
//   aus“; „Gesunde Menschen scheiden überschüssige Flüssigkeit über die Nieren einfach wieder aus.“
// - DGE-Blog, Essen und Trinken bei Hitze (2025): „Bei Hitze sollte man (tagsüber) alle 1 bis 2
//   Stunden ein Glas Wasser (0,2 Liter) trinken“; „Die Legende, dass Kaffee dem Körper Flüssigkeit
//   entzieht, ist längst widerlegt“.
// - BIÖG, Empfehlungen bei Hitze (Stand Juli 2026): „Über den Tag verteilt sollten Sie etwa zwei bis
//   drei Liter Flüssigkeit aufnehmen“; „Abhängig von der Sportart kann der Flüssigkeitsverlust bis zu
//   2,5 Liter pro Stunde betragen.“
// - DGE, Arbeitsgruppe Sporternährung, Flüssigkeitsmanagement im Sport (Ernährungs Umschau 3/2019):
//   „maximal 80 % des ermittelten Schweißverlustes“, Hyponatriämie (Natriumgehalt im Plasma unter
//   135 mmol/l), „nicht über den Durst zu trinken“.
// - DGE, Fit im Alter: „täglich mindestens 1,3 Liter, besser 1,5 Liter“.
// Prüft Rechnung, Texte und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { distDir, faqFromSchema, jsonLd, pageExists, readPage, readRepoFile, visibleText } from "./dist-html.mjs";

const SEITE = "/wasserbedarf-rechner/";
const STRICH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const de = (wert) => wert.toLocaleString("de-DE");
// React trennt Text und Werte mit Kommentaren, die als Leerzeichen vor Satzzeichen übrig bleiben.
const lesbar = (html) => visibleText(html).replace(/ ([.,:;!?)])/g, "$1");

// Dynamisch, damit jeder Test einzeln scheitert, wenn ein Modul fehlt.
const R = await import("../src/modules/wasserbedarf/rechnung.ts").catch(() => null);
const F = await import("../src/modules/wasserbedarf/faq.ts").catch(() => null);
const brauchtRechnung = () => assert.ok(R, "src/modules/wasserbedarf/rechnung.ts fehlt");
const brauchtFaq = () => assert.ok(F, "src/modules/wasserbedarf/faq.ts fehlt");

// Abschrift der DGE-Tabelle: Gruppe, ab (Jahre), dann in ml pro Tag Getränke, feste Nahrung,
// Oxidationswasser, Gesamtwasserzufuhr, zuletzt ml pro kg und Tag (Getränke und feste Nahrung).
const DGE = [
  ["1 bis unter 4 Jahre", 1, 820, 350, 130, 1300, 95],
  ["4 bis unter 7 Jahre", 4, 940, 480, 180, 1600, 75],
  ["7 bis unter 10 Jahre", 7, 970, 600, 230, 1800, 60],
  ["10 bis unter 13 Jahre", 10, 1170, 710, 270, 2150, 50],
  ["13 bis unter 15 Jahre", 13, 1330, 810, 310, 2450, 40],
  ["15 bis unter 19 Jahre", 15, 1530, 920, 350, 2800, 40],
  ["19 bis unter 25 Jahre", 19, 1470, 890, 340, 2700, 35],
  ["25 bis unter 51 Jahre", 25, 1410, 860, 330, 2600, 35],
  ["51 bis unter 65 Jahre", 51, 1230, 740, 280, 2250, 30],
  ["65 Jahre und älter", 65, 1310, 680, 260, 2250, 30],
  ["Schwangere", null, 1470, 890, 340, 2700, 35],
  ["Stillende", null, 1710, 1000, 390, 3100, 45],
];
const gruppen = DGE.filter(([, ab]) => ab !== null);
const gruppeFuer = (alter) => gruppen.filter(([, ab]) => alter >= ab).at(-1);
const LAGEN = ["keine", "schwanger", "stillend"];
const TAGE = ["normal", "sport1", "sport2", "hitze"];

test("Richtwerte: alle Gruppen stehen wie in der Tabelle der DGE im Modul", () => {
  brauchtRechnung();
  assert.deepEqual(
    R.richtwerte.map((r) => [r.gruppe, r.ab ?? null, r.getraenke, r.festeNahrung, r.oxidationswasser, r.gesamt, r.jeKg]),
    DGE,
  );
  // Fußnote b der DGE: Getränke = gesamt minus Oxidationswasser minus feste Nahrung
  for (const r of R.richtwerte) {
    assert.equal(r.gesamt - r.oxidationswasser - r.festeNahrung, r.getraenke, r.gruppe);
  }
});

test("Alter: jede Gruppe gilt ab ihrer Untergrenze bis unter die nächste", () => {
  brauchtRechnung();
  for (let alter = 1; alter <= 100; alter += 0.5) {
    const [name, , getraenke] = gruppeFuer(alter);
    const m = R.trinkmenge(alter);
    assert.equal(m.richtwert.gruppe, name, alter + " Jahre");
    assert.deepEqual([m.von, m.bis, m.stunden, m.hitze], [getraenke, getraenke, 0, false], alter + " Jahre");
  }
  // von Hand aus der Tabelle
  const werte = { 1: 820, 3: 820, 4: 940, 6: 940, 7: 970, 9: 970, 10: 1170, 12: 1170, 13: 1330, 14: 1330, 15: 1530, 18: 1530, 19: 1470, 24: 1470, 25: 1410, 40: 1410, 50: 1410, 50.9: 1410, 51: 1230, 58: 1230, 64: 1230, 64.9: 1230, 65: 1310, 100: 1310 };
  for (const [alter, ml] of Object.entries(werte)) assert.equal(R.trinkmenge(Number(alter)).von, ml, alter + " Jahre");
  assert.deepEqual([R.ALTER_MIN, R.ALTER_MAX], [1, 100]);
});

test("Schwangere und Stillende haben eigene Richtwerte, ab 15 Jahren wählbar", () => {
  brauchtRechnung();
  for (let alter = 1; alter <= 100; alter++) {
    const erwartet = alter >= 15 ? [1470, 1710] : [gruppeFuer(alter)[2], gruppeFuer(alter)[2]];
    assert.deepEqual([R.trinkmenge(alter, "schwanger").von, R.trinkmenge(alter, "stillend").von], erwartet, alter + " Jahre");
  }
  assert.equal(R.trinkmenge(30, "schwanger").richtwert.gesamt, 2700);
  assert.equal(R.trinkmenge(30, "stillend").richtwert.gesamt, 3100);
});

test("Sport (DGE: 0,5 bis 1,0 Liter pro Stunde) und Hitzewelle (BIÖG: 2 bis 3 Liter) nur für Erwachsene", () => {
  brauchtRechnung();
  assert.deepEqual([R.SPORT_JE_STUNDE, R.HITZETAG, R.ERWACHSEN_AB], [{ von: 500, bis: 1000 }, { von: 2000, bis: 3000 }, 18]);
  for (let alter = 1; alter <= 100; alter++) {
    for (const lage of LAGEN) {
      const basis = R.trinkmenge(alter, lage).von;
      const ergebnis = TAGE.map((tag) => {
        const m = R.trinkmenge(alter, lage, tag);
        return [m.von, m.bis];
      });
      const normal = [basis, basis];
      assert.deepEqual(
        ergebnis,
        alter >= 18 ? [normal, [basis + 500, basis + 1000], [basis + 1000, basis + 2000], [2000, 3000]] : [normal, normal, normal, normal],
        alter + " Jahre, " + lage,
      );
    }
  }
  // Beispiele aus dem Auftrag: 40 Jahre, früher 75 kg × 35 ml × 1,2 (mäßig aktiv) = 3.150 ml
  assert.deepEqual(TAGE.map((tag) => R.spanne(R.trinkmenge(40, "keine", tag))), ["1.410", "1.910 bis 2.410", "2.410 bis 3.410", "2.000 bis 3.000"]);
  assert.deepEqual(TAGE.map((tag) => R.trinkmenge(40, "keine", tag).stunden), [0, 1, 2, 0]);
  assert.deepEqual(TAGE.map((tag) => R.trinkmenge(40, "keine", tag).hitze), [false, false, false, true]);
});

test("Gewicht: geht nicht in die Rechnung ein, auch ein hohes nicht", () => {
  brauchtRechnung();
  // Früher 180 kg × 35 ml = 6.300 ml, mit den Faktoren bis 12.285 ml.
  assert.deepEqual(R.trinkmenge(40, "keine", "normal", 180), R.trinkmenge(40));
  // Extremwerte über alle Eingaben: nie unter dem Richtwert, für Erwachsene nie unter 1 Liter,
  // höchstens 3.710 ml (stillend, 2 Stunden Sport).
  let hoechster = 0;
  for (let alter = 1; alter <= 100; alter++) {
    for (const lage of LAGEN) {
      for (const tag of TAGE) {
        const m = R.trinkmenge(alter, lage, tag);
        assert.ok(m.von >= m.richtwert.getraenke && m.bis >= m.von, [alter, lage, tag].join(", "));
        if (alter >= 18) assert.ok(m.von >= 1000, [alter, lage, tag].join(", "));
        hoechster = Math.max(hoechster, m.bis);
      }
    }
  }
  assert.equal(hoechster, 3710);
  const quelle = readRepoFile("src/modules/wasserbedarf/index.tsx");
  assert.doesNotMatch(quelle, /\* ?35\b|weight|Multiplier|0\.8\)|1\.2\)/i, "alte Rechnung");
  assert.ok(quelle.includes("setResult(trinkmenge(age, lebenslage, tag))"), "Rechner nutzt rechnung.ts");
  // Eingaben der gebauten Seite: Alter, Schwangerschaft und Stillzeit, Tag, kein Gewicht
  const html = readPage(SEITE);
  const eingaben = [...html.matchAll(/<input type="(number|range|radio)"([^>]*)>/g)].map((m) => m[1] + " " + (m[2].match(/(?:aria-label|name)="([^"]+)"/)?.[1] ?? "?"));
  assert.deepEqual(eingaben.filter((e) => !e.includes("faq-accordion")), [
    "number Alter in Jahren",
    "range Alter in Jahren",
    ...Array(3).fill("radio lebenslage"),
    ...Array(4).fill("radio tag"),
  ]);
  const karte = visibleText(html).match(/Wasserbedarf berechnen (Alter .*?) So rechnet der Wasserbedarfs-Rechner/)?.[1];
  assert.ok(karte, "Rechner nicht gefunden");
  assert.doesNotMatch(karte, /\bkg\b|Gewicht|Klima|aktiv/);
});

test("Anzeige: Liter, Milliliter, volle Gläser und Flaschen", () => {
  brauchtRechnung();
  assert.deepEqual(
    [820, 1230, 1310, 1410, 1470, 1530, 1710, 2000, 3410].map((ml) => [R.zahl(ml), R.liter(ml), R.glaeser(ml), R.flaschen(ml)]),
    [
      ["820", "0,8", 4, "1,6"],
      ["1.230", "1,2", 5, "2,5"],
      ["1.310", "1,3", 6, "2,6"],
      ["1.410", "1,4", 6, "2,8"],
      ["1.470", "1,5", 6, "2,9"],
      ["1.530", "1,5", 7, "3,1"],
      ["1.710", "1,7", 7, "3,4"],
      ["2.000", "2,0", 8, "4,0"],
      ["3.410", "3,4", 14, "6,8"],
    ],
  );
  // volle Gläser erreichen den Richtwert, ein Glas weniger nicht
  for (const r of R.richtwerte) {
    assert.ok(R.glaeser(r.getraenke) * 250 >= r.getraenke && (R.glaeser(r.getraenke) - 1) * 250 < r.getraenke, r.gruppe);
  }
  assert.equal(R.spanne(R.trinkmenge(40, "keine", "sport1"), R.liter), "1,9 bis 2,4");
  assert.equal(R.spanne(R.trinkmenge(65), R.liter), "1,3");
});

test("Ergebnistext: Herleitung und Hinweis passen zu Alter und Tag", () => {
  brauchtRechnung();
  brauchtFaq();
  const texte = (...eingabe) => {
    const m = R.trinkmenge(...eingabe);
    return [F.grundlage(m), F.hinweis(m)];
  };
  const RUND = "Einfach zu merken: Die DGE empfiehlt gesunden Erwachsenen rund 1,5 Liter am Tag.";
  const ALTER = "Einfach zu merken: Im Projekt Fit im Alter rät die DGE zu mindestens 1,3 Litern, besser 1,5 Litern am Tag.";
  const DURST = "Wie viel du schwitzt, hängt von Person, Tempo und Temperatur ab. Die Arbeitsgruppe Sporternährung der DGE rät, nach Durst zu trinken";
  const HITZE = "Sport ist hier nicht eingerechnet: Bei Hitze kannst du je nach Sportart bis zu 2,5 Liter pro Stunde verlieren (BIÖG). Bei einer Erkrankung von Herz oder Nieren die Trinkmenge bitte ärztlich besprechen.";
  assert.deepEqual(texte(40), ["Richtwert der DGE für 25 bis unter 51 Jahre.", RUND]);
  assert.deepEqual(texte(17), ["Richtwert der DGE für 15 bis unter 19 Jahre.", null]);
  assert.deepEqual(texte(18), ["Richtwert der DGE für 15 bis unter 19 Jahre.", RUND]);
  assert.deepEqual(texte(64)[1], RUND);
  assert.deepEqual(texte(65), ["Richtwert der DGE für 65 Jahre und älter.", ALTER]);
  assert.deepEqual(texte(30, "schwanger"), ["Richtwert der DGE für Schwangere.", null]);
  assert.deepEqual(texte(30, "stillend"), ["Richtwert der DGE für Stillende.", null]);
  assert.deepEqual(texte(40, "keine", "sport1"), ["1.410 ml Richtwert der DGE (25 bis unter 51 Jahre) plus 500 bis 1.000 ml für 1 Stunde Sport oder körperlich anstrengende Arbeit (DGE).", DURST + "."]);
  assert.deepEqual(texte(58, "keine", "sport2"), ["1.230 ml Richtwert der DGE (51 bis unter 65 Jahre) plus 1.000 bis 2.000 ml für 2 Stunden Sport oder körperlich anstrengende Arbeit (DGE).", DURST + ", bei mehr als 1,5 Stunden am besten Getränke mit Kohlenhydraten und Natrium."]);
  assert.deepEqual(texte(70, "keine", "hitze"), ["Empfehlung des Bundesinstituts für Öffentliche Gesundheit (BIÖG) für eine Hitzewelle. An einem normalen Tag liegt der Richtwert der DGE bei 1.310 ml (65 Jahre und älter).", HITZE]);
  // Kinder und Jugendliche: kein Text zu Sport oder Hitze, auch wenn vorher etwas gewählt war
  assert.deepEqual(texte(10, "keine", "hitze"), ["Richtwert der DGE für 10 bis unter 13 Jahre.", null]);
});

test("FAQ: sichtbar und wortgleich mit dem FAQPage-Schema und dem Modul", () => {
  brauchtFaq();
  const html = readPage(SEITE);
  const text = visibleText(html);
  assert.deepEqual(faqFromSchema(html), F.faq.map((f) => ({ question: f.q, answer: f.a })));
  for (const f of F.faq) {
    assert.ok(text.includes(f.q + " " + f.a), "nicht sichtbar: " + f.q);
  }
  assert.deepEqual(F.faq.map((f) => f.q), [
    "Wie viel Wasser sollte ich am Tag trinken?",
    "Stimmt die Regel 35 ml pro kg Körpergewicht?",
    "Wie viel mehr sollte ich bei Sport trinken?",
    "Wie viel sollte ich bei Hitze trinken?",
    "Zählt Kaffee zur Flüssigkeitszufuhr?",
    "Kann ich zu viel Wasser trinken?",
    "Woran erkenne ich, ob ich genug trinke?",
    "Wie viel sollten ältere Menschen trinken?",
    "Wie viel sollten Schwangere und Stillende trinken?",
  ]);
});

test("FAQ: die Zahlen stimmen mit Tabelle und Quellen überein", () => {
  brauchtFaq();
  const antwort = (frage) => F.faq.find((f) => f.q === frage).a;
  const enthaelt = (frage, ...teile) => {
    for (const teil of teile) assert.ok(antwort(frage).includes(teil), frage + ": " + teil);
  };
  enthaelt("Wie viel Wasser sollte ich am Tag trinken?", "1.410 ml pro Tag im Alter von 25 bis unter 51 Jahren", "1.230 ml von 51 bis unter 65 Jahren", "1.310 ml ab 65 Jahren", "gesunden Erwachsenen von 18 bis 65 Jahren zu rund 1,5 Litern am Tag");
  enthaelt("Stimmt die Regel 35 ml pro kg Körpergewicht?", "Als Trinkmenge nicht.", "35 ml pro kg Körpergewicht und Tag für 19 bis unter 51 Jahre und 30 ml ab 51 Jahren, aber für Getränke und feste Nahrung zusammen", "65 kg mal 35 ml sind 2.275 ml, das entspricht in der DGE-Tabelle für 25 bis unter 51 Jahre den 1.410 ml aus Getränken und 860 ml aus dem Essen", "Einen Wert für Getränke pro kg nennt die DGE nicht", "nicht nach dem Gewicht");
  // 2.275 ml sind bis auf 5 ml die 2.270 ml der Tabelle, die DGE rundet die ml je kg
  assert.equal(65 * 35, 2275);
  assert.equal(1410 + 860, 2270);
  enthaelt("Wie viel mehr sollte ich bei Sport trinken?", "zusätzlich 0,5 bis 1,0 Liter Wasser pro Stunde", "Unter 30 bis 40 Minuten", "höchstens 80 Prozent des Schweißverlusts", "Bei mehr als 1,5 Stunden");
  enthaelt("Wie viel sollte ich bei Hitze trinken?", "etwa 2 bis 3 Litern Flüssigkeit über den Tag verteilt", "alle 1 bis 2 Stunden ein Glas Wasser mit 0,2 Litern");
  enthaelt("Zählt Kaffee zur Flüssigkeitszufuhr?", "Ja.", "wie Wasser der Flüssigkeitsbilanz zugezählt", "längst widerlegt", "3 bis 4 Tassen am Tag");
  enthaelt("Kann ich zu viel Wasser trinken?", "über die Nieren einfach wieder aus", "weniger als 135 mmol Natrium pro Liter Plasma", "nicht über den Durst zu trinken");
  enthaelt("Woran erkenne ich, ob ich genug trinke?", "Heller Urin", "Weniger als 1 Liter am Tag reicht laut DGE nicht aus");
  enthaelt("Wie viel sollten ältere Menschen trinken?", "1.310 ml Getränken", "2.250 ml", "mindestens 1,3 Litern, besser 1,5 Litern");
  enthaelt("Wie viel sollten Schwangere und Stillende trinken?", "für Schwangere 1.470 ml und für Stillende 1.710 ml Getränke");
  // Jede ml-Angabe ist ein Wert der Tabelle oder das Beispiel mit 65 kg.
  const erlaubt = new Set([...DGE.flatMap(([, , ...werte]) => werte), 65 * 35].map(de));
  for (const f of F.faq) {
    for (const [, ml] of f.a.matchAll(/(\d[\d.]*) ml/g)) assert.ok(erlaubt.has(ml), f.q + ": " + ml + " ml");
    // 35 und 30 ml pro kg nie als Trinkmenge
    if (/ml pro kg/.test(f.a)) assert.ok(f.a.includes("für Getränke und feste Nahrung zusammen"), f.q);
    assert.ok(/DGE|BIÖG/.test(f.a), f.q + ": Quelle im Text");
  }
});

test("Seite: Tabelle aller Gruppen, Beispiele und Erklärung mit denselben Zahlen", () => {
  brauchtFaq();
  const text = lesbar(readPage(SEITE));
  for (const [gruppe, , ...werte] of DGE) {
    const zeile = gruppe + " " + werte.map((w) => de(w) + " ml").join(" ");
    assert.ok(text.includes(zeile), "Zeile fehlt: " + zeile);
  }
  const beispiele = [
    ["40 Jahre, normaler Tag", "1.410"],
    ["40 Jahre, 1 Stunde Sport", "1.910 bis 2.410"],
    ["40 Jahre, 2 Stunden Sport", "2.410 bis 3.410"],
    ["40 Jahre, Hitzetag", "2.000 bis 3.000"],
    ["58 Jahre, normaler Tag", "1.230"],
    ["70 Jahre, normaler Tag", "1.310"],
    ["30 Jahre, schwanger", "1.470"],
    ["30 Jahre, stillend", "1.710"],
  ];
  assert.deepEqual(F.beispiele.map((b) => b.person), beispiele.map(([person]) => person));
  for (const [person, ml] of beispiele) assert.ok(text.includes(person + " " + ml + " ml"), person + ": " + ml + " ml");
  for (const teil of [
    "Stand der Ableitung 2000, abgerufen am 24.11.2026",
    "gelten aber für Getränke und feste Nahrung zusammen, ab 51 Jahren sind es 30 ml. Bei 65 kg sind 35 ml pro kg 2.275 ml, das entspricht den 1.410 ml Getränken und 860 ml Wasser im Essen der Gruppe 25 bis unter 51 Jahre. Einen Wert für Getränke pro kg nennt die DGE nicht.",
    "zusätzlich 0,5 bis 1,0 Liter pro Stunde können laut DGE nötig sein",
    "etwa 2 bis 3 Liter über den Tag verteilt empfiehlt das Bundesinstitut für Öffentliche Gesundheit (BIÖG)",
    "tagsüber alle 1 bis 2 Stunden ein Glas Wasser (0,2 Liter)",
    "bei trockener kalter Luft, Fieber, Erbrechen und Durchfall, viel Salz oder viel Protein",
    "Kaffee, schwarzer Tee Zählt mit, 3 bis 4 Tassen am Tag",
    "1 Teil Saft, 3 Teile Wasser",
    "etwa 80 bis 100 g Zucker pro Liter",
    "Defizite von 2 bis 4 Prozent des Körpergewichts",
    "im Schnitt 2.650 ml am Tag",
    "mit 0,33 kg nicht signifikant",
    "Aktualisiert: 24. November 2026",
    // Redaktionelle Standards, Umgang mit Fehlern: sichtbarer Hinweis bei Korrekturen an Kernaussagen
    "Korrektur vom 24.11.2026: Bisher rechnete diese Seite mit 35 ml pro kg Körpergewicht als Trinkmenge. Laut DGE gilt dieser Wert für Getränke und Essen zusammen.",
  ]) {
    assert.ok(text.includes(teil), "fehlt: " + teil);
  }
  assert.ok(pageExists("/wissen/wasser-trinken-abnehmen-meta-analyse/"));
});

test("Seite: Quellen sichtbar verlinkt, jede im Text genutzte Adresse steht in der Liste", () => {
  brauchtFaq();
  const html = readPage(SEITE);
  const text = lesbar(html);
  const adressen = [
    "https://www.dge.de/wissenschaft/referenzwerte/wasser/",
    "https://www.dge.de/gesunde-ernaehrung/faq/referenzwerte/",
    "https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/dge-empfehlungen/am-besten-wasser-trinken/",
    "https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/dge-ernaehrungskreis/getraenke/",
    "https://www.dge-medienservice.de/media/productattach/1/2/123054_2024_flyer_wasser_trinken_241205_web.pdf",
    "https://www.dge.de/blog/2025/essen-und-trinken-bei-hitze/",
    "https://www.dge.de/fileadmin/dok/gesunde-ernaehrung/gezielte-ernaehrung/sportler-innen/EU03_2019_M152-M159.pdf",
    "https://www.fitimalter-dge.de/mehr-wissen/trinken-im-alter",
    "https://www.dge.de/gesunde-ernaehrung/gezielte-ernaehrung/ernaehrung-in-schwangerschaft-und-stillzeit/",
    "https://www.klima-mensch-gesundheit.de/hitzeschutz/empfehlungen-bei-hitze/",
    "https://doi.org/10.3390/nu16070963",
  ];
  assert.deepEqual(F.quellen.map((q) => q.url), adressen);
  assert.deepEqual(new Set(Object.values(F.links)), new Set(adressen));
  const liste = text.slice(text.indexOf(" Quellen "));
  for (const q of F.quellen) {
    assert.ok(html.includes('href="' + q.url + '"'), q.url);
    assert.ok(liste.includes(q.label), q.label);
  }
  assert.ok(liste.includes("Alle Quellen gelesen am 24.11.2026."));
});

test("Schema und Beschreibung: Alter statt Gewicht, HowTo mit den Schritten des Rechners", () => {
  const html = readPage(SEITE);
  const bloecke = jsonLd(html);
  const howTo = bloecke.find((b) => b["@type"] === "HowTo");
  assert.deepEqual(howTo.step.map((s) => s.name), ["Alter eingeben", "Schwanger oder stillend angeben", "Tag auswählen"]);
  const seite = bloecke.find((b) => b["@type"] === "WebPage" && b.headline);
  assert.match(seite.description, /nach Alter mit den Richtwerten der DGE/);
  const meta = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.match(meta, /nach Alter mit den Richtwerten der DGE/);
  assert.ok(meta.length <= 160, meta.length + " Zeichen");
  for (const b of [howTo, seite, { meta }]) assert.doesNotMatch(JSON.stringify(b), /Gewicht|gewicht|Klima|Athlet|optimal|35/);
});

test("Seite: alte und unbelegte Aussagen sind weg, keine Gedanken- und Halbgeviertstriche", () => {
  const html = readPage(SEITE);
  const text = visibleText(html);
  const inhalt = text.slice(text.indexOf("Kostenloser Rechner"), text.indexOf("Weitere Rechner"));
  assert.ok(inhalt.length > 8000, "Inhalt nicht gefunden");
  const schema = JSON.stringify(jsonLd(html).filter((b) => ["FAQPage", "HowTo"].includes(b["@type"]) || b.headline));
  for (const alt of [
    /35ml pro kg/,
    /2[.,]45 Liter/,
    /~?50 ?%/,
    /entwässernde Wirkung/,
    /entziehen dem Körper sogar Wasser/,
    /5-6 Liter/,
    /nicht mehr als 1 Liter pro Stunde/,
    /Nachts pausiert der Körper/,
    /optimale[rn]? (?:täglichen )?(?:Wasserbedarf|Flüssigkeitszufuhr)/i,
    /\b75 ?%/,
    /1-2 ?% Dehydrierung/,
    /\+30 kcal/,
    /Fettverbrennung/,
    /strahlende Haut|Augenringe|Schnellere Heilung/,
    /Minimum:|Maximum:/,
  ]) {
    assert.doesNotMatch(inhalt, alt);
    assert.doesNotMatch(schema, alt);
  }
  assert.doesNotMatch(inhalt, STRICH);
  assert.doesNotMatch(schema, STRICH);
  for (const datei of ["index.tsx", "rechnung.ts", "faq.ts"]) assert.doesNotMatch(readRepoFile("src/modules/wasserbedarf/" + datei), STRICH, datei);
  assert.doesNotMatch(readRepoFile("src/pages/wasserbedarf-rechner.astro"), STRICH);
});

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

test("im ganzen Build steht keine der alten Trinkmengen", () => {
  const ALT = [
    /\b(?:30-40|30 bis 40|35) ?ml (?:pro|je) kg Körpergewicht\. Bei/,
    /35ml pro kg/,
    /2,2-3 Liter/,
    /[Mm]indestens 2-3 Liter/,
    /\b2-3 Liter pro Tag/,
    /2-3 Liter täglich/,
    /[Mm]indestens 2(?:,5)? bis 3 Liter/,
    /mind\. 2 Liter/,
    /von 2 bis 3 Litern Wasser/,
    /mindestens 3-4 Liter/,
    /1,5-2 Liter am Tag/,
    /Gewicht, Aktivität und Klima/,
    /zu etwa 50% angerechnet/,
    /Zählt zu ~50%/,
  ];
  const treffer = [];
  for (const datei of textdateien()) {
    const inhalt = readFileSync(datei, "utf8");
    for (const alt of ALT) if (alt.test(inhalt)) treffer.push(datei.slice(distDir.length) + ": " + alt);
  }
  assert.deepEqual(treffer, []);
});

const WASSER_TRINKEN = "https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/dge-empfehlungen/am-besten-wasser-trinken/";

test("andere Seiten nennen die Empfehlung der DGE statt 2 bis 3 Litern", () => {
  const SEITEN = {
    "/kalorien/mineralwasser/": "Rund 1,5 Liter am Tag empfiehlt die DGE gesunden Erwachsenen von 18 bis 65 Jahren",
    "/essensplan-erstellen/": "Die DGE empfiehlt gesunden Erwachsenen rund 1,5 Liter am Tag, bei Sport oder Hitze brauchst du mehr.",
    "/ernaehrungsplan/gesunde-ernaehrung/": "Die DGE empfiehlt rund 1,5 Liter am Tag, am besten Wasser oder ungesüßten Tee.",
    "/ernaehrungsplan/high-protein/": "Die DGE empfiehlt gesunden Erwachsenen rund 1,5 Liter am Tag, bei hoher Proteinzufuhr und Sport ist der Bedarf höher.",
    "/ernaehrungsplan/low-carb/": "rund 1,5 Liter Wasser oder ungesüßten Kräutertee über den Tag (Empfehlung der DGE)",
    "/ernaehrungsplan/wochenplan-essen/": "von rund 1,5 Litern Wasser oder ungesüßtem Tee über den Tag verteilt (Empfehlung der DGE)",
    "/ernaehrungsplan/abnehmen-frauen/": "Trinke täglich rund 1,5 Liter Wasser, ungesüßten Kräuter- oder Früchtetee (Empfehlung der DGE)",
    "/trainingsplan/hiit/": "Trinke rund 1,5 Liter am Tag (Empfehlung der DGE) und an den HIIT-Tagen mehr: Pro Stunde Sport können laut DGE zusätzlich 0,5 bis 1 Liter nötig sein.",
    "/trainingsplan/fitnessstudio/": "rund 1,5 Liter am Tag (Empfehlung der DGE), pro Stunde Training können laut DGE zusätzlich 0,5 bis 1 Liter nötig sein.",
    "/trainingsplan/abnehmen/": "Trinke rund 1,5 Liter am Tag (Empfehlung der DGE)",
    "/trainingsplan/muskelaufbau/": "rund 1,5 Liter am Tag (Empfehlung der DGE), pro Stunde Training können laut DGE zusätzlich 0,5 bis 1 Liter nötig sein.",
  };
  for (const [route, satz] of Object.entries(SEITEN)) {
    assert.ok(lesbar(readPage(route)).includes(satz), route + ": " + satz);
  }
  // Wissen-Artikel werden im Browser gerendert, geprüft wird die Quelle.
  for (const slug of ["detox-diaet-entgiften-abnehmen", "intervallfasten-16-8-anleitung-anfaenger"]) {
    const md = readRepoFile("src/content/wissen/articles/" + slug + ".md");
    assert.ok(md.includes("Die DGE empfiehlt gesunden Erwachsenen [rund 1,5 Liter am Tag](" + WASSER_TRINKEN + ")"), slug);
    const html = readPage("/wissen/" + slug + "/");
    assert.ok(html.includes(WASSER_TRINKEN) && html.includes("2026-11-24"), slug + ": Quelle und Datum");
  }
  assert.ok(readPage("/essensplan-erstellen/").includes('href="' + WASSER_TRINKEN + '"'));
});

test("Mineralwasser: Tipp, Frage, Schema und Quellen nach DGE und BIÖG", () => {
  const food = JSON.parse(readRepoFile("src/data/foods/mineralwasser.json"));
  const tipp = food.tips.find((t) => t.title === "Rund 1,5 Liter am Tag trinken");
  // Richtwerte ab 19 Jahren: kleinster und größter der vier Gruppen
  const ab19 = gruppen.filter(([, ab]) => ab >= 19).map(([, , getraenke]) => getraenke);
  assert.ok(tipp?.text.includes("je nach Alter bei " + de(Math.min(...ab19)) + " bis " + de(Math.max(...ab19)) + " ml am Tag"), tipp?.text);
  const antwort = food.faq.find((f) => f.question === "Wie viel Wasser sollte ich trinken?").answer;
  for (const teil of ["ungesüßter Tee und Kaffee zählen mit", "35 ml pro kg Körpergewicht (ab 51 Jahren 30 ml) gelten laut DGE für Getränke und feste Nahrung zusammen", "zusätzlich 0,5 bis 1 Liter pro Stunde", "etwa 2 bis 3 Litern am Tag"]) {
    assert.ok(antwort.includes(teil), teil);
  }
  const html = readPage("/kalorien/mineralwasser/");
  const schema = faqFromSchema(html).find((f) => f.question === "Wie viel Wasser sollte ich trinken?");
  assert.equal(schema?.answer, antwort);
  assert.equal(food.quellen.length, 4);
  for (const q of food.quellen) assert.ok(html.includes('href="' + q.url + '"') && visibleText(html).includes(q.titel), q.titel);
  assert.equal(JSON.parse(readRepoFile("src/data/food-lastmod.json")).mineralwasser, "2026-11-24");
  assert.doesNotMatch(antwort + tipp.text, STRICH);
});

test("Rechnerübersicht und Querverweise beschreiben den Rechner nach Alter", () => {
  const uebersicht = readPage("/rechner/");
  const text = visibleText(uebersicht);
  assert.ok(text.includes("Berechne deine Trinkmenge nach Alter mit den Richtwerten der DGE, dazu Sport und Hitze."));
  assert.ok(text.includes("Richtwerte der DGE") && !text.includes("Individueller Wasserbedarf"));
  const eintrag = jsonLd(uebersicht).flatMap((b) => b.mainEntity?.itemListElement ?? b.itemListElement ?? []).find((e) => e.name === "Wasserbedarfs-Rechner");
  assert.equal(eintrag?.description, "Berechne deine Trinkmenge pro Tag nach Alter mit den Richtwerten der DGE");
  assert.ok(readRepoFile("src/utils/topicClusters.ts").includes("Nach Alter, mit den Richtwerten der DGE."));
  assert.ok(readFileSync(join(distDir, "llms-full.txt"), "utf8").includes("Wie viel solltest du trinken? Nach Alter, mit den Richtwerten der DGE."));
});
