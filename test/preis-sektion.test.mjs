// Preis-Sektion der Startseite (src/utils/config.ts, home.pricing): Beim
// Jahresabo stand „Spare 50%“. Das passte im Frühjahr 2026 zu 29,99 € im Jahr
// gegenüber 12 x 4,99 €. Mit 39,99 € im Jahr gegenüber 12 x 7,99 € = 95,88 €
// sind es 58 % (1 - 39,99 / 95,88 = 0,583), wie llms.txt, llms-full.txt,
// /api/content.json und ai-questions.json schon sagen. Beim Preiswechsel am
// 15.11.2026 (389bbb6) wurde nur der Monatsbetrag (3,33 €) nachgezogen. Der
// Untertitel nannte außerdem „Stand: Februar 2026“, als beide Preise noch
// niedriger waren. Prüft Quelltext und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { distDir, readPage, readRepoFile, visibleText } from "./dist-html.mjs";

const config = readRepoFile("src/utils/config.ts");
const preis = (titel, einheit) => {
  const treffer = config.match(
    new RegExp(`title: "${titel}",\\s*price: "([\\d,]+) €/${einheit}"`),
  );
  assert.ok(treffer, `${titel} nicht in config.ts gefunden`);
  return Number(treffer[1].replace(",", "."));
};
const jahr = preis("Mahlzait Pro Jahr", "Jahr");
const monat = preis("Mahlzait Pro Monat", "Monat");
// Ersparnis des Jahresabos gegenüber zwölf Monatsabos.
const ersparnis = Math.round((1 - jahr / (12 * monat)) * 100);
const proMonat = (jahr / 12).toFixed(2).replace(".", ",");

const ersparnisAngabe = /Spare (\d+) ?%|(\d+) ?% (?:Ersparnis|gespart)/g;

test("jede Ersparnis-Angabe zum Jahresabo nennt den Wert aus den Preisen", () => {
  const angaben = [];
  for (const datei of [
    "src/utils/config.ts",
    "src/pages/llms-full.txt.ts",
    "src/pages/api/content.json.ts",
    "public/llms.txt",
    "public/ai-questions.json",
  ]) {
    for (const treffer of readRepoFile(datei).matchAll(ersparnisAngabe)) {
      angaben.push({
        stelle: `${datei}: ${treffer[0]}`,
        prozent: Number(treffer[1] ?? treffer[2]),
      });
    }
  }
  assert.ok(
    angaben.some((angabe) => angabe.stelle.startsWith("src/utils/config.ts")),
    "keine Ersparnis-Angabe in der Preis-Sektion",
  );
  for (const { stelle, prozent } of angaben) {
    assert.equal(prozent, ersparnis, stelle);
  }
});

// Alle Seiten im Build, samt Insel-Props (die Konfiguration steckt in vielen).
function htmlFiles(dir = distDir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(path));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

test("die Startseite zeigt die Ersparnis und den Monatsbetrag des Jahresabos", () => {
  const text = visibleText(readPage("/"));
  const zeile = `Spare ${ersparnis} % (nur ${proMonat} €/Monat)`;
  assert.ok(text.includes(zeile), `„${zeile}“ fehlt auf der Startseite`);
  const falsch = [];
  for (const path of htmlFiles()) {
    for (const treffer of readFileSync(path, "utf8").matchAll(
      /Spare (\d+) ?%/g,
    )) {
      if (Number(treffer[1]) !== ersparnis) {
        falsch.push(`${path.slice(distDir.length)}: ${treffer[0]}`);
      }
    }
  }
  assert.deepEqual(falsch.slice(0, 5), [], `${falsch.length} Stellen`);
});

test("der Stand der Preis-Sektion liegt nicht vor dem letzten Preiswechsel", () => {
  const untertitel = config.match(
    /id: "pricing",\s*title: "Preise",\s*subtitle:\s*"([^"]*)"/,
  )?.[1];
  assert.ok(untertitel, "Untertitel der Preis-Sektion nicht gefunden");
  const monate = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  const [, standMonat, standJahr] =
    untertitel.match(/Stand: (\p{L}+) (\d{4})/u) ?? [];
  assert.ok(monate.includes(standMonat), untertitel);
  // Jahrespreis 39,99 € seit 15.11.2026 (Google Play) und 16.11.2026
  // (App Store), siehe 389bbb6.
  assert.ok(
    Number(standJahr) * 12 + monate.indexOf(standMonat) >= 2026 * 12 + 10,
    `Stand ${standMonat} ${standJahr} liegt vor dem Preiswechsel im November 2026`,
  );
  assert.doesNotMatch(untertitel, /[\u2013\u2014]/);
});
