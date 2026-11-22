#!/usr/bin/env node
/**
 * Referenzwerte aus USDA FoodData Central (FDC) für die source-Felder der
 * Lebensmittelseiten (src/data/foods/*.json).
 *
 * Liest die FDC-Massendaten (https://fdc.nal.usda.gov/download-datasets) und
 * schreibt für jede FDC-ID, die ein source-Feld nennt, Datensatz, Beschreibung
 * und kcal, Eiweiß, Fett und Kohlenhydrate je 100 g nach test/fdc-referenz.json.
 * test/naehrwerte-herkunft.test.mjs prüft die Lebensmittelseiten gegen diese
 * Datei und, wenn FDC_DATA_DIR gesetzt ist, die Datei gegen die Massendaten.
 *
 * Erwartet unter <fdc-data> (entpackt, beliebige Unterordner):
 *   FoodData_Central_sr_legacy_food_csv_2018-04/ (food.csv, food_nutrient.csv)
 *   FoodData_Central_survey_food_csv_2024-10-31/ (FNDDS, dieselben Dateien)
 *   FoodData_Central_foundation_food_json_2026-10-29.json
 * Im CSV-Paket der Foundation Foods vom 2026-10-29 fehlen food.csv und
 * food_nutrient.csv; für Foundation liest das Skript deshalb die JSON-Datei
 * derselben Ausgabe.
 *
 *   node scripts/fdc-referenz.mjs <fdc-data>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const referenzDatei = path.join(repoRoot, "test", "fdc-referenz.json");

export const DATENSAETZE = {
  sr: "FoodData_Central_sr_legacy_food_csv_2018-04",
  fndds: "FoodData_Central_survey_food_csv_2024-10-31",
  foundation: "FoodData_Central_foundation_food_json_2026-10-29.json",
};

/** FDC-IDs in einem source-Feld: sechs- oder siebenstellige Zahlen. */
export function fdcIds(source) {
  return [...source.matchAll(/\b\d{6,7}\b/g)].map((m) => Number(m[0]));
}

/** Alle Lebensmittel mit source-Feld: [{ slug, food }] */
export function lebensmittelMitQuelle() {
  const dir = path.join(repoRoot, "src", "data", "foods");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .filter((food) => typeof food.source === "string")
    .map((food) => ({ slug: food.slug, food }));
}

function finde(dir, name) {
  for (const eintrag of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, eintrag.name);
    if (eintrag.name === name) return p;
    if (eintrag.isDirectory()) {
      const treffer = finde(p, name);
      if (treffer) return treffer;
    }
  }
  return null;
}

// CSV nach RFC 4180 (Felder in Anführungszeichen, doppelte Anführungszeichen)
function leseCsv(datei, behalten) {
  const text = fs.readFileSync(datei, "utf8");
  const zeilen = [];
  let feld = "";
  let zeile = [];
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          feld += '"';
          i++;
        } else inQ = false;
      } else feld += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      zeile.push(feld);
      feld = "";
    } else if (c === "\n") {
      zeile.push(feld);
      zeilen.push(zeile);
      zeile = [];
      feld = "";
    } else if (c !== "\r") feld += c;
  }
  if (feld !== "" || zeile.length) {
    zeile.push(feld);
    zeilen.push(zeile);
  }
  const kopf = zeilen.shift();
  const spalte = (name) => kopf.indexOf(name);
  return zeilen.filter((z) => behalten(z, spalte)).map((z) => Object.fromEntries(kopf.map((k, j) => [k, z[j]])));
}

// Nährstoffe: SR Legacy und Foundation nennen die Nährstoff-ID, FNDDS in
// food_nutrient.csv die Nährstoffnummer (208 = Energie usw.).
const NAEHRSTOFF_ID = { 1008: "kcal1008", 2048: "kcal2048", 2047: "kcal2047", 1003: "eiweiss", 1004: "fett", 1085: "fettNlea", 1005: "kh", 1050: "khSumme" };
const NAEHRSTOFF_NR = { 208: "kcal1008", 203: "eiweiss", 204: "fett", 205: "kh" };

function eintrag(id, datensatz, beschreibung, n) {
  const kcalNaehrstoff = n.kcal1008 != null ? 1008 : n.kcal2048 != null ? 2048 : n.kcal2047 != null ? 2047 : null;
  return {
    id,
    datensatz,
    beschreibung,
    kcal: n.kcal1008 ?? n.kcal2048 ?? n.kcal2047 ?? null,
    kcalNaehrstoff,
    eiweiss: n.eiweiss ?? null,
    fett: n.fett ?? n.fettNlea ?? null,
    kohlenhydrate: n.kh ?? n.khSumme ?? null,
  };
}

function ausCsv(ordner, datentyp, datensatz, karte, ids) {
  const gesucht = new Set(ids.map(String));
  const foods = leseCsv(path.join(ordner, "food.csv"), (z, s) => gesucht.has(z[s("fdc_id")]) && z[s("data_type")] === datentyp);
  const werte = new Map(foods.map((f) => [f.fdc_id, {}]));
  for (const r of leseCsv(path.join(ordner, "food_nutrient.csv"), (z, s) => werte.has(z[s("fdc_id")]))) {
    const k = karte[r.nutrient_id];
    if (k && r.amount !== "") werte.get(r.fdc_id)[k] = Number(r.amount);
  }
  return foods.map((f) => eintrag(Number(f.fdc_id), datensatz, f.description, werte.get(f.fdc_id)));
}

function ausFoundation(datei, ids) {
  const gesucht = new Set(ids);
  const json = JSON.parse(fs.readFileSync(datei, "utf8"));
  return json.FoundationFoods.filter((f) => gesucht.has(f.fdcId)).map((f) => {
    const n = {};
    for (const fn of f.foodNutrients ?? []) {
      const k = NAEHRSTOFF_ID[fn.nutrient?.id];
      if (k && fn.amount != null) n[k] = Number(fn.amount);
    }
    return eintrag(f.fdcId, "Foundation", f.description, n);
  });
}

/** Einträge der gegebenen FDC-IDs aus den Massendaten unter dataDir. */
export function extrahiere(dataDir, ids) {
  const sr = finde(dataDir, DATENSAETZE.sr);
  const fndds = finde(dataDir, DATENSAETZE.fndds);
  const foundation = finde(dataDir, DATENSAETZE.foundation);
  if (!sr || !fndds || !foundation) throw new Error("FDC-Daten unvollständig unter " + dataDir);
  const alle = [
    ...ausCsv(sr, "sr_legacy_food", "SR Legacy", NAEHRSTOFF_ID, ids),
    ...ausFoundation(foundation, ids),
    ...ausCsv(fndds, "survey_fndds_food", "Survey (FNDDS)", NAEHRSTOFF_NR, ids),
  ];
  return Object.fromEntries(alle.sort((a, b) => a.id - b.id).map((e) => [String(e.id), e]));
}

export function referenzInhalt(eintraege) {
  return {
    quelle: "USDA FoodData Central, https://fdc.nal.usda.gov/download-datasets",
    datensaetze: ["SR Legacy 2018-04 (CSV)", "Foundation Foods 2026-10-29 (JSON)", "FNDDS 2024-10-31 (CSV)"],
    werte: "je 100 g; kcal aus Nährstoff 1008 (Energy), bei Foundation ohne 1008 aus 2048 (Atwater Specific Factors) oder 2047 (Atwater General Factors)",
    eintraege,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dataDir = process.argv[2] ?? process.env.FDC_DATA_DIR;
  if (!dataDir) {
    console.error("Aufruf: node scripts/fdc-referenz.mjs <Ordner mit den entpackten FDC-Daten>");
    process.exit(1);
  }
  const ids = [...new Set(lebensmittelMitQuelle().flatMap(({ food }) => fdcIds(food.source)))].sort((a, b) => a - b);
  const eintraege = extrahiere(dataDir, ids);
  fs.writeFileSync(referenzDatei, JSON.stringify(referenzInhalt(eintraege), null, 1) + "\n");
  const fehlen = ids.filter((id) => !eintraege[String(id)]);
  console.log("fdc-referenz.json: " + Object.keys(eintraege).length + " Einträge, nicht in den Massendaten: " + (fehlen.join(", ") || "keine"));
}
