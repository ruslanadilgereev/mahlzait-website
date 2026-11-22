// /kalorien/ (Kalorientabelle) bekam die Layout-Props nicht wie alle anderen
// Seiten: <Layout {seo} templateConfig=...> statt {...defaultTemplateConfig}.
// Dadurch fehlte data-theme am <html>, und die beiden JSON-LD-Blöcke hingen an
// slot="head", den das Layout nicht hat: Astro hat sie still verworfen. Die
// Seite verlinkte außerdem /kalorientabelle/, das per 308 zurück auf /kalorien/ führt.
// Prüft das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { jsonLd, readPage } from "./dist-html.mjs";

const html = readPage("/kalorien/");

test("/kalorien/ hat das Theme der Website", () => {
  assert.match(html, /<html lang="de" data-theme="mahlzait">/);
});

test("/kalorien/ liefert Breadcrumb und Lebensmittelliste als JSON-LD", () => {
  const types = jsonLd(html).map((block) => block["@type"]);
  assert.ok(types.includes("BreadcrumbList"), `gefunden: ${types.join(", ")}`);
  const list = jsonLd(html).find((block) => block["@type"] === "ItemList");
  assert.ok(list, "ItemList fehlt");
  assert.ok(list.itemListElement.length > 0);
});

test("/kalorien/ verlinkt nicht mehr auf die Umleitung /kalorientabelle/", () => {
  assert.ok(!html.includes('href="/kalorientabelle/"'));
});
