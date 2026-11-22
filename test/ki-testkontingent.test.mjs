// Gratis-Kontingent von „Mit KI eintragen“ wie im App-Code: Ohne Pro gibt es
// fünf Versuche insgesamt, die sich Foto, Text, Sprache und Video teilen, kein
// Kontingent je Funktion. Nachgelesen am 22.11.2026 im Flutter-Repo:
// lib/services/trial_usage_service.dart (defaultMaxFreeUsages = 5, ein Zähler
// "log_ai_chat" je Konto, ohne Zurücksetzen) und
// lib/screens/chat_log_screen_ui.dart (_handleSubmittedText prüft und verbraucht
// diesen einen Zähler für jede gesendete Nachricht, ob Text, Foto, Video oder
// Link; die Spracheingabe landet als Text im Eingabefeld und zählt beim Senden).
// Vorher stand in der Preis-Sektion „Je 5x AI-Features testen“ und in
// calorie-apps.json „Foto- und Text-KI je fünfmal zum Testen“.
// Prüft calorie-apps.json und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  distDir,
  faqFromSchema,
  readPage,
  readRepoFile,
  visibleText,
} from "./dist-html.mjs";

const GEMEINSAM = "insgesamt, egal ob per Foto, Text, Sprache oder Video";

// Alle Textdateien im Build: Seiten (samt Insel-Props), llms.txt, JSON, Skripte.
function buildFiles(dir = distDir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...buildFiles(path));
    else if (/\.(html|txt|json|js|xml)$/.test(entry.name)) files.push(path);
  }
  return files;
}

test("kein Text im Build verspricht fünf Versuche je Funktion", () => {
  const jeFunktion = /\bje\s+(?:5\s*x|5\s*mal|fünfmal|fünf\b)/gi;
  const funde = [];
  for (const path of buildFiles()) {
    const text = readFileSync(path, "utf8");
    for (const match of text.matchAll(jeFunktion)) {
      funde.push(
        `${path.slice(distDir.length)}: ${text.slice(match.index, match.index + 60)}`,
      );
    }
  }
  assert.deepEqual(funde.slice(0, 5), [], `${funde.length} Stellen`);
});

test("Preis-Sektion: der Gratis-Plan nennt fünf Versuche für alle Eingaben zusammen", () => {
  const text = visibleText(readPage("/"));
  assert.ok(
    text.includes(`Mit KI eintragen: 5 Versuche ${GEMEINSAM}`),
    "Zeile im Gratis-Plan fehlt",
  );
});

test("App-Vergleich: Mahlzait-Eintrag und Foto-FAQ nennen das gemeinsame Kontingent", () => {
  const mahlzait = JSON.parse(readRepoFile("src/data/calorie-apps.json")).apps.find(
    (app) => app.slug === "mahlzait",
  );
  assert.ok(mahlzait.freeSummary.includes(GEMEINSAM), "freeSummary");
  const schwaeche = mahlzait.weaknesses.find((w) => w.includes("Testnutzungen"));
  assert.ok(schwaeche?.includes(GEMEINSAM), "weaknesses");

  const html = readPage("/kalorienzaehler-app/");
  const text = visibleText(html);
  assert.ok(text.includes(mahlzait.freeSummary), "Gratis-Umfang nicht sichtbar");
  const foto = faqFromSchema(html).find(
    (f) => f.question === "Welche App zählt Kalorien per Foto?",
  );
  assert.ok(foto?.answer.includes(GEMEINSAM), "Foto-FAQ");
  assert.ok(text.includes(foto.answer), "Foto-FAQ nicht sichtbar");
});

test("YAZIO-Kosten: die Zeilen Foto und Sprache teilen sich die fünf Versuche", () => {
  const html = readPage("/yazio-kosten/");
  for (const merkmal of ["Mahlzeit per Foto", "Mahlzeit per Sprache"]) {
    const zeile = html.match(
      new RegExp(`<th[^>]*>${merkmal}</th><td>[^<]*</td><td>([^<]*)</td>`),
    );
    assert.ok(zeile, `Zeile ${merkmal} fehlt`);
    assert.ok(zeile[1].includes(GEMEINSAM), `${merkmal}: ${zeile[1]}`);
  }
});

test("AGB und llms.txt nennen das gemeinsame Kontingent", () => {
  assert.ok(
    visibleText(readPage("/agb/")).includes(
      `Mit KI eintragen zum Testen: 5 Versuche ${GEMEINSAM}`,
    ),
    "AGB 5.1",
  );
  const zeile = readFileSync(join(distDir, "llms.txt"), "utf8")
    .split("\n")
    .find((line) => line.startsWith("| Foto-Erkennung |"));
  assert.ok(zeile?.includes(GEMEINSAM), `llms.txt: ${zeile}`);
});
