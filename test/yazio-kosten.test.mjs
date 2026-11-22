// /yazio-kosten/ ("Was kostet YAZIO?", OpenSEO-Berichte vom 22.11.2026): Preise
// nur aus den offiziellen Quellen von YAZIO (App Store, Google Play, Hilfe-Center),
// jeweils mit Lesedatum, fairer Vergleich mit Mahlzait Pro, FAQ mit Schema.
// /yazio-alternative/ verweist nur noch kurz darauf, damit beide Seiten nicht
// dieselbe Suche bedienen. Prüft das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  distDir,
  faqFromSchema,
  pageExists,
  readPage,
  visibleText,
} from "./dist-html.mjs";

const html = readPage("/yazio-kosten/");
const text = visibleText(html);

test("die Seite beantwortet die Kostenfrage mit Preisen und Datum", () => {
  assert.match(html, /<title>Was kostet YAZIO\?/);
  assert.ok(
    text.includes("Was kostet YAZIO? Preise, Gratis-Version und Kündigung"),
  );
  assert.ok(
    text.includes("23,90 €, 35,90 €, 83,90 €"),
    "12-Monats-Preise fehlen",
  );
  assert.ok(text.includes("Stand 22. November 2026"), "Lesedatum fehlt");
  assert.ok(
    text.includes("6,99 € bis 349,99 € bei Abrechnung über Google Play"),
  );
  assert.ok(text.includes("39,99 €"), "Preis von Mahlzait Pro fehlt");
  // Nur der eigene Inhalt bis zum App-Banner; Navbar, Banner und Footer sind seitenübergreifend.
  const inhalt = visibleText(
    html.slice(html.indexOf("<h1"), html.indexOf('id="app-banner"')),
  );
  assert.ok(inhalt.length > 3000, "Inhalt nicht gefunden");
  assert.ok(/[\u2013\u2014]/.test(inhalt) === false, "Gedankenstrich im Text");
});

test("jede Quelle ist offiziell und trägt das Lesedatum", () => {
  const start = html.indexOf(">Quellen</h2>");
  assert.ok(start > 0, "Quellen-Abschnitt fehlt");
  const quellenHtml = html.slice(start, html.indexOf("</section>", start));
  const quellen = [
    ...quellenHtml.matchAll(/<li><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/li>/g),
  ].map((m) => ({
    url: m[1].replaceAll("&amp;", "&"),
    label: m[2],
  }));
  const offiziell = quellen.filter((q) =>
    /^https:\/\/(apps\.apple\.com\/de\/app\/|play\.google\.com\/store\/apps\/details\?id=com\.yazio\.android|help\.yazio\.com\/hc\/de\/articles\/)/.test(
      q.url,
    ),
  );
  assert.ok(offiziell.length >= 10, `nur ${offiziell.length} Quellen gefunden`);
  assert.deepEqual(
    offiziell.filter((q) => !q.label.includes("gelesen am 22.11.2026")),
    [],
  );
  // Nur YAZIO selbst und der eigene App-Store-Eintrag, keine Gutschein- oder Vergleichsportale.
  const fremd = quellen.filter(
    (q) => !offiziell.includes(q) && q.url.startsWith("http"),
  );
  assert.deepEqual(
    fremd.map((q) => q.url),
    [],
  );
});

test("FAQ: sichtbar und wortgleich mit dem FAQPage-Schema", () => {
  const faq = faqFromSchema(html);
  const fragen = faq.map((f) => f.question);
  for (const frage of [
    "Was kostet YAZIO Pro?",
    "Ist YAZIO kostenlos?",
    "Wie kündige ich YAZIO Pro?",
    "Was kostet Mahlzait Pro im Vergleich?",
  ]) {
    assert.ok(fragen.includes(frage), `Frage fehlt: ${frage}`);
  }
  for (const { question, answer } of faq) {
    assert.ok(text.includes(question), `Frage nicht sichtbar: ${question}`);
    assert.ok(text.includes(answer), `Antwort nicht sichtbar: ${question}`);
  }
});

test("Sitemap und Querverweise führen zur Kostenseite", () => {
  const xml = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
  assert.ok(
    readFileSync(join(distDir, "llms.txt"), "utf8").includes(
      "https://www.mahlzait.de/yazio-kosten/",
    ),
    "nicht in llms.txt",
  );
  assert.ok(
    xml.includes("<loc>https://www.mahlzait.de/yazio-kosten/</loc>"),
    "nicht in der Sitemap",
  );
  assert.ok(
    readPage("/yazio-alternative/").includes('href="/yazio-kosten/"'),
    "kein Link von /yazio-alternative/",
  );
  assert.ok(
    readPage("/kalorienzaehler-app/").includes('href="/yazio-kosten/"'),
    "kein Footer-Link",
  );
  // Der Vergleich verweist auf die Hilfeseite zur Spracheingabe, die es geben muss.
  assert.ok(
    html.includes('href="/spracheingabe/"'),
    "kein Link auf /spracheingabe/",
  );
  assert.ok(pageExists("/spracheingabe/"), "/spracheingabe/ ist nicht gebaut");
});

test("/yazio-alternative/ verweist für die Kosten nur noch auf die Kostenseite", () => {
  const alt = readPage("/yazio-alternative/");
  const altText = visibleText(alt);
  assert.ok(
    !altText.includes("Yazio laut App Store"),
    "Preiskarte steht noch auf der Alternativ-Seite",
  );
  assert.ok(
    !altText.includes("Ist Yazio kostenlos?"),
    "Abschnitt zur Gratis-Version steht noch dort",
  );
  const fragen = faqFromSchema(alt).map((f) => f.question);
  assert.ok(
    !fragen.includes("Was kostet Yazio Pro?"),
    "Kosten-FAQ steht noch dort",
  );
  assert.ok(
    !fragen.includes("Ist Yazio kostenlos?"),
    "Gratis-FAQ steht noch dort",
  );
});
