// Wissen-Seiten haben genau eine H1. Die Seitenvorlage setzt die Überschrift
// (src/modules/wissen/article.tsx, siehe WISSEN_WORKFLOW.md: kein H1 im Artikel); bis
// 24.11.2026 begannen fünf Artikel zusätzlich mit einer Zeile „# Titel“ und hatten im
// Build zwei gleiche H1.
// Prüft das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { jsonLd, readPage, routesUnder, visibleText } from "./dist-html.mjs";

// Überschriften der Ebene 1 im sichtbaren HTML, ohne Skripte und Kommentare
const h1 = (html) =>
  [
    ...html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<!--[\s\S]*?-->/g, "")
      .matchAll(/<h1[\s>][\s\S]*?<\/h1>/g),
  ].map((treffer) => visibleText(treffer[0]).trim());

test("jede gebaute Wissen-Seite hat genau eine H1", () => {
  const seiten = ["/wissen/", ...routesUnder("/wissen/")];
  assert.ok(seiten.length > 100, "nur " + seiten.length + " Wissen-Seiten");
  const falsch = seiten
    .map((route) => [route, h1(readPage(route))])
    .filter(([, titel]) => titel.length !== 1)
    .map(([route, titel]) => route + ": " + JSON.stringify(titel));
  assert.deepEqual(falsch, []);
});

test("die H1 jedes Artikels ist sein Titel", () => {
  const falsch = [];
  for (const route of routesUnder("/wissen/")) {
    const html = readPage(route);
    const artikel = jsonLd(html).find(
      (block) => Array.isArray(block["@type"]) && block["@type"].includes("Article"),
    );
    assert.ok(artikel, route + ": Article-Schema fehlt");
    const titel = h1(html)[0]?.replaceAll(String.fromCharCode(0), "");
    if (titel !== artikel.headline) falsch.push(route + ": " + titel);
  }
  assert.deepEqual(falsch, []);
});
