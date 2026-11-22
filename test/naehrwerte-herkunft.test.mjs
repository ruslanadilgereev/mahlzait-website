// Herkunft der Nährwerte (docs/naehrwerte-herkunft-audit.md): Jede
// Lebensmittelseite, deren source-Feld USDA FoodData Central (FDC) nennt, muss
// FDC-IDs nennen, die es in den heruntergeladenen FDC-Datensätzen gibt
// (SR Legacy 2018-04, Foundation Foods 2026-10-29, FNDDS 2024-10-31). Der
// Auszug test/fdc-referenz.json stammt aus scripts/fdc-referenz.mjs.
// Ist ein einzelner FDC-Eintrag die Quelle der Werte je 100 g (keine
// Rezeptrechnung), müssen kcal, Eiweiß, Fett und Kohlenhydrate der Seite auf
// 5 % zu diesem Eintrag passen; Unterschiede bis 1 kcal bzw. 0,1 g gelten als
// Rundung. Nennt source zu einer ID einen kcal-Wert, muss auch der passen.
// Mit FDC_DATA_DIR=<Ordner mit den entpackten FDC-Daten> prüft der letzte Test
// die Referenzdatei gegen die Massendaten, ohne die Variable wird er
// übersprungen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  extrahiere,
  fdcIds,
  lebensmittelMitQuelle,
  referenzDatei,
} from "../scripts/fdc-referenz.mjs";

const referenz = JSON.parse(readFileSync(referenzDatei, "utf8"));
const eintraege = referenz.eintraege;

// Markeneintrag aus FDC Branded Foods, nicht Teil der drei Datensätze; Werte
// prüft test/doener-kalorien.test.mjs gegen die FDC-API.
const MARKENEINTRAEGE = new Set([2472184]);

// source-Felder ohne FDC: Herstellerangaben, offen laut Audit
const OHNE_FDC = new Set(["bresaola", "creme-fraiche", "creme-legere", "lachsschinken", "schmand"]);

const quellen = lebensmittelMitQuelle();
const mitFdc = quellen.filter(({ food }) => food.source.startsWith("USDA FoodData Central"));
const rezept = ({ food }) => food.source.includes("Rezeptrechnung");

function passt(seite, fdc, rundung) {
  return Math.abs(seite - fdc) <= Math.max(0.05 * Math.abs(fdc), rundung);
}

test("jede FDC-ID in einem source-Feld steht in den FDC-Datensätzen", () => {
  assert.ok(mitFdc.length >= 89, "nur " + mitFdc.length + " Seiten mit FDC-Quelle");
  const fehlen = [];
  for (const { slug, food } of mitFdc) {
    const ids = fdcIds(food.source);
    assert.ok(ids.length > 0, slug + ": source ohne FDC-ID");
    for (const id of ids) {
      if (!eintraege[String(id)] && !MARKENEINTRAEGE.has(id)) fehlen.push(slug + ": " + id);
    }
  }
  assert.deepEqual(fehlen, []);
});

test("Seiten mit einem FDC-Eintrag als Quelle passen auf 5 % zu diesem Eintrag", () => {
  const abweichungen = [];
  let geprueft = 0;
  for (const q of mitFdc.filter((q) => !rezept(q))) {
    const { slug, food } = q;
    const e = eintraege[String(fdcIds(food.source)[0])];
    const o = food.overview;
    const paare = [
      ["kcal", o.calories_per_100g, e.kcal, 1],
      ["Eiweiß", o.protein_per_100g, e.eiweiss, 0.1],
      ["Fett", o.fat_per_100g, e.fett, 0.1],
      ["Kohlenhydrate", o.carbs_per_100g, e.kohlenhydrate, 0.1],
    ];
    for (const [name, seite, fdc, rundung] of paare) {
      if (fdc == null || !passt(seite, fdc, rundung)) {
        abweichungen.push(slug + ": " + name + " " + seite + " statt " + fdc + " (FDC " + e.id + ")");
      }
    }
    geprueft++;
  }
  assert.deepEqual(abweichungen, []);
  assert.ok(geprueft >= 79, "nur " + geprueft + " Seiten geprüft");
});

test("kcal-Werte im source-Feld passen zum genannten FDC-Eintrag", () => {
  const abweichungen = [];
  for (const { slug, food } of mitFdc) {
    // Abschnitt von einer FDC-ID bis zur nächsten; der erste kcal-Wert darin gehört zu ihr
    const treffer = [...food.source.matchAll(/\b\d{6,7}\b/g)];
    treffer.forEach((t, i) => {
      const e = eintraege[t[0]];
      if (!e) return;
      const abschnitt = food.source.slice(t.index, treffer[i + 1]?.index ?? food.source.length);
      const m = abschnitt.match(/(\d+(?:,\d+)?) kcal/);
      if (!m) return;
      const kcal = Number(m[1].replace(",", "."));
      if (!passt(kcal, e.kcal, 1)) abweichungen.push(slug + ": " + t[0] + " mit " + kcal + " statt " + e.kcal + " kcal");
    });
  }
  assert.deepEqual(abweichungen, []);
});

test("source-Felder ohne FDC nur bei den Herstellerangaben aus dem Audit", () => {
  const ohne = quellen.filter(({ food }) => !food.source.startsWith("USDA FoodData Central")).map(({ slug }) => slug).sort();
  assert.deepEqual(ohne, [...OHNE_FDC].sort());
});

test("Referenzdatei entspricht den FDC-Massendaten", { skip: !process.env.FDC_DATA_DIR && "FDC_DATA_DIR nicht gesetzt" }, () => {
  const ids = Object.keys(eintraege).map(Number);
  assert.deepEqual(extrahiere(process.env.FDC_DATA_DIR, ids), eintraege);
});
