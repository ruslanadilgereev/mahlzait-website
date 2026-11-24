// Tabelle im Alkohol-Rechner: reiner Alkohol in g = Menge in ml × Vol.-% × 0,789 g/ml (auf
// 0,1 g gerundet), Kalorien aus Alkohol = g × 7 kcal (auf ganze kcal gerundet). Bis 24.11.2026
// nannte die Tabelle für Bier (0,5 l, 5 %) 15,8 g statt 19,7 g und für Weißwein (200 ml,
// 11,5 %) 18,2 g statt 18,1 g; die kcal stimmten. Zum Vergleich DGE, Fragen und Antworten zu
// Alkohol (Stand 01.05.2025): „1 Flasche Bier (500 ml, 5 % vol) ca. 20 g“.
// https://www.dge.de/gesunde-ernaehrung/faq/alkohol/
// Prüft die Daten und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readPage, readRepoFile, visibleText } from "./dist-html.mjs";

test("Alkohol-Rechner: jede Tabellenzeile passt zu Menge, Vol.-% und Formel", () => {
  const quelle = readRepoFile("src/modules/alkohol/index.tsx");
  const start = quelle.indexOf("const alcoholTable = [");
  const tabelle = quelle.slice(start, quelle.indexOf("];", start));
  const zeilen = [...tabelle.matchAll(/\{ drink: "([^"]+)", calories: (\d+), alcohol: ([\d.]+) \}/g)];
  assert.ok(zeilen.length >= 7, "nur " + zeilen.length + " Zeilen gelesen");
  assert.equal(zeilen.length, tabelle.split("drink:").length - 1, "Zeile mit anderem Aufbau");
  const sichtbar = visibleText(readPage("/alkohol-kalorien-rechner/"));
  for (const [, drink, kcal, alkohol] of zeilen) {
    const angabe = drink.match(/\((\d+(?:\.\d+)?)(ml|L), (\d+(?:\.\d+)?)%\)$/);
    assert.ok(angabe, drink + ": Menge und Vol.-% in der Beschriftung");
    const ml = Number(angabe[1]) * (angabe[2] === "L" ? 1000 : 1);
    const gramm = ml * (Number(angabe[3]) / 100) * 0.789;
    assert.equal(Number(alkohol), Math.round(gramm * 10) / 10, drink + ": Alkohol in g");
    assert.equal(Number(kcal), Math.round(gramm * 7), drink + ": kcal aus Alkohol");
    assert.ok(sichtbar.includes(drink + " " + kcal + " kcal " + alkohol + " g"), drink + ": sichtbare Zeile");
  }
});
