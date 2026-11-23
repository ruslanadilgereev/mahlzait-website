// Magerquark in Rechnern, Vergleichstabellen und Wissensartikeln: Batch E
// (3d0369a) hat die Magerquark-Zahlen gestrichen, weil die Seite magerquark
// damals keine Quelle hatte (FDC führt keinen Quark). Seit Batch F (5f48388)
// nennt die Seite Werte am Beispiel MILRAM Magerquark (Herstellerangabe), und die
// Stellen nennen Magerquark wieder mit den Werten der Seite: kcal genau, Eiweiß
// je 100 g auf ganze Gramm gerundet wie die übrigen Zeilen derselben Liste,
// Mengen so, dass sie das im Satz genannte Eiweißziel erreichen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (pfad) => readFileSync(new URL("../" + pfad, import.meta.url), "utf8");
const o = JSON.parse(lies("src/data/foods/magerquark.json")).overview;
const kcal = o.calories_per_100g;
const eiweiss = Math.round(o.protein_per_100g);
const kcalFuer = (g) => Math.round((o.calories_per_100g * g) / 100);
const eiweissFuer = (g) => (o.protein_per_100g * g) / 100;
const ARTIKEL = "src/content/wissen/articles/";

test("Protein-Rechner: Magerquark in der Liste der Proteinquellen", () => {
  const quelle = lies("src/modules/protein/index.tsx");
  const zeile = `{ name: "Magerquark", protein: ${eiweiss}, kcal: ${kcal}, serving: "100g", type: "tierisch" },`;
  assert.ok(quelle.includes(zeile), zeile);
});

test("WeightWatchers-Alternative: 250 g Magerquark in Tabelle und FAQ", () => {
  const quelle = lies("src/modules/appAlternative/content/weightWatchers.ts");
  const zeile = `["Magerquark, 250 g", "≈ ${kcalFuer(250)} kcal", "bei WW meist 0 Punkte"],`;
  assert.ok(quelle.includes(zeile), "Tabelle: " + zeile);
  const satz = `250 Gramm Magerquark liefern rund ${kcalFuer(250)} Kilokalorien`;
  assert.ok(quelle.includes(satz), "FAQ: " + satz);
});

test("Kategorieseite Supermarkt: Magerquark mit Eiweiß je 100 g", () => {
  const quelle = lies("src/pages/kalorien/kategorie/[category].astro");
  assert.ok(quelle.includes(`Magerquark (${eiweiss}g) sind die besten Proteinquellen im Supermarkt`), `Magerquark (${eiweiss}g)`);
});

test("Wissensartikel Ernährungsplan: Magerquark in der Tabelle der Proteinquellen", () => {
  const md = lies(ARTIKEL + "ernaehrungsplan-erstellen-anleitung.md");
  const zeile = `| [Magerquark](/kalorien/magerquark/) | ${eiweiss} g | ${kcal} kcal |`;
  assert.ok(md.includes(zeile), zeile);
});

test("Wissensartikel: die genannte Menge Magerquark erreicht das Eiweißziel des Satzes", () => {
  for (const [datei, ziel, von, bis] of [
    ["ernaehrungswissenschaft-grundlagen-erklaert.md", "Ziel sind mindestens **30 Gramm Eiweiß pro Hauptmahlzeit**", 29, 31],
    ["heisshunger-stoppen-ursachen-tipps.md", "Mindestens 25-30g Protein pro Mahlzeit", 25, 30],
  ]) {
    const md = lies(ARTIKEL + datei);
    assert.ok(md.includes(ziel), datei + ": Satz mit dem Eiweißziel fehlt");
    const absatz = md.split("\n").find((zeile) => zeile.includes(ziel));
    const m = absatz.match(/(\d+)g \[Magerquark\]\(\/kalorien\/magerquark\/\)/);
    assert.ok(m, datei + ": keine Menge Magerquark im Satz mit dem Eiweißziel");
    const g = eiweissFuer(Number(m[1]));
    assert.ok(g >= von && g <= bis, `${datei}: ${m[1]} g Magerquark haben ${g} g Eiweiß, Ziel ${von} bis ${bis} g`);
  }
});
