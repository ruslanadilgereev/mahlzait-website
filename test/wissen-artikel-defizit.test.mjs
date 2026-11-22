// Wissen-Artikel "Trotz Kaloriendefizit nicht abnehmen" (Keyword-Recherche vom
// 22.11.2026): folgt WISSEN_WORKFLOW.md (kein H1, Pflichtabschnitte, Quellen mit
// DOI) und ist mit Article- und FAQPage-Schema gebaut.
// Prüft Quelltext und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { faqFromSchema, jsonLd, readPage, readRepoFile } from "./dist-html.mjs";

const slug = "trotz-kaloriendefizit-nicht-abnehmen-gruende";

test("der neue Artikel folgt dem Wissen-Workflow", () => {
  const md = readRepoFile(`src/content/wissen/articles/${slug}.md`);
  assert.ok(!/^# /m.test(md), "Markdown-H1 im Artikel");
  for (const heading of [
    "## Das Wichtigste in Kürze",
    "## Was wurde untersucht?",
    "## Kernerkenntnisse",
    "## Was heißt das praktisch?",
    "## Limitationen und Einordnung",
    "## Fazit",
    "## Quellen",
  ]) {
    assert.ok(md.includes(heading), `Abschnitt fehlt: ${heading}`);
  }
  assert.ok(!/[\u2013\u2014]/.test(md), "Gedankenstrich im Artikel");

  const html = readPage(`/wissen/${slug}/`);
  assert.match(
    html,
    /<title>Trotz Kaloriendefizit nicht abnehmen: die häufigsten Gründe \| Mahlzait Wissen<\/title>/,
  );
  const article = jsonLd(html).find(
    (block) =>
      Array.isArray(block["@type"]) && block["@type"].includes("Article"),
  );
  assert.ok(article, "Article-Schema fehlt");
  const dois = article.citation.map((c) => c.sameAs);
  assert.ok(dois.length >= 8, `nur ${dois.length} Quellen`);
  for (const doi of dois) {
    assert.ok(
      doi && doi.startsWith("https://doi.org/10."),
      `Quelle ohne DOI: ${doi}`,
    );
    assert.ok(
      md.includes(doi),
      `DOI fehlt in der Quellenliste des Artikels: ${doi}`,
    );
  }
  assert.ok(faqFromSchema(html).length >= 5, "FAQ-Schema fehlt");
});
