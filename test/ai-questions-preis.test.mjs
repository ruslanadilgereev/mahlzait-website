// public/ai-questions.json (FAQ für Sprachassistenten und KI-Crawler) nennt die
// Preise von Mahlzait Pro wie die Preis-Sektion der Website. Beim Wechsel auf
// 39,99 € im Jahr (389bbb6) und beim Nachziehen von llms.txt (41c11cc) blieben
// hier 29,99 € im Jahr und 69 % Ersparnis stehen; 29,99 € steht im App Store
// nur noch als „Mahlzait Pro Jahr (Code)“. Prüft nur Quelltext, kein Build nötig.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) =>
  readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

test("ai-questions.json nennt Monats- und Jahrespreis wie die Preis-Sektion", () => {
  const config = read("src/utils/config.ts");
  const jahr = config.match(
    /title: "Mahlzait Pro Jahr",\s*price: "([\d,]+) €\/Jahr"/,
  )?.[1];
  const monat = config.match(
    /title: "Mahlzait Pro Monat",\s*price: "([\d,]+) €\/Monat"/,
  )?.[1];
  assert.ok(jahr && monat, "Preise in config.ts nicht gefunden");
  const zahl = (preis) => Number(preis.replace(",", "."));
  // Ersparnis des Jahresabos gegenüber zwölf Monatsabos, wie in 389bbb6 abgeleitet.
  const ersparnis = Math.round((1 - zahl(jahr) / (12 * zahl(monat))) * 100);

  const angaben = [
    ...read("public/ai-questions.json").matchAll(
      /([\d,]+) ?€\/Monat oder ([\d,]+) ?€\/Jahr(?: \((\d+) % (?:gespart|Ersparnis)\))?/g,
    ),
  ];
  assert.ok(angaben.length > 0, "keine Preisangabe gefunden");
  for (const [satz, m, j, prozent] of angaben) {
    assert.equal(m, monat, satz);
    assert.equal(j, jahr, satz);
    if (prozent) assert.equal(Number(prozent), ersparnis, satz);
  }
});
