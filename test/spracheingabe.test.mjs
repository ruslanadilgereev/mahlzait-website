// Hilfeseite "Mahlzeit per Spracheingabe eintragen" (KI-Sichtbarkeits-Audit vom
// 22.11.2026: keine Seite beschrieb die Spracheingabe). Der Ablauf ist im
// App-Code nachgeprüft; der Test hält die Kernaussagen fest und prüft, dass die
// Seite gefunden wird (Sitemap, interne Links). Prüft das gebaute dist/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { distDir, readPage, visibleText } from "./dist-html.mjs";

const html = readPage("/spracheingabe/");
const text = visibleText(html);

test("die Hilfeseite beschreibt den Ablauf wie in der App", () => {
  assert.match(html, /<h1>Mahlzeit per Spracheingabe eintragen<\/h1>/);
  for (const teil of [
    "„Mit KI eintragen“",
    "Mikrofon-Knopf rechts neben dem Eingabefeld gedrückt",
    "„Sprache wird erkannt...“",
    "Mahlzait schickt nichts von selbst ab",
    "nach links",
    "unter einer halben Sekunde",
    "„Einstellungen öffnen“",
    "fünfmal kostenlos testen",
    "Gemini",
  ]) {
    assert.ok(text.includes(teil), `fehlt: ${teil}`);
  }
  assert.ok(/[\u2013\u2014]/.test(text) === false, "Gedankenstrich im Text");
});

test("die Hilfeseite steht in der Sitemap und ist intern verlinkt", () => {
  const xml = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
  assert.ok(
    readFileSync(join(distDir, "llms.txt"), "utf8").includes(
      "https://www.mahlzait.de/spracheingabe/",
    ),
    "nicht in llms.txt",
  );
  assert.ok(xml.includes("<loc>https://www.mahlzait.de/spracheingabe/</loc>"));
  assert.ok(
    readPage("/kalorienzaehler-app/").includes('href="/spracheingabe/"'),
    "kein Footer-Link",
  );
});
