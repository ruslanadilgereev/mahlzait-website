// Store-Links je Seitenfamilie (OpenSEO-Audit vom 22.11.2026): Lebensmittel-,
// Rechner- und Wissen-Seiten tragen ein eigenes Kampagnenkürzel statt
// "homepage" (ct im App Store, utm_campaign bei Google Play), damit
// Store-Klicks und Installationen je Familie messbar sind. Auf den
// Lebensmittel-Seiten steht der App-Hinweis direkt unter der Kalorien-Antwort.
// Prüft das gebaute dist/ (vorher pnpm build). Ausführen: node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readPage,
  readRepoFile,
  routesUnder,
  storeLinks,
} from "./dist-html.mjs";

const APP_STORE_ID = "6747400456";
const PLAY_ID = "com.promptit.mytemple";

const calculatorSlugs = [
  ...readRepoFile("src/utils/topicClusters.ts")
    .split("export const calculators")[1]
    .split("];")[0]
    .matchAll(/slug: "([a-z0-9-]+)"/g),
].map((match) => match[1]);

const families = {
  food: [
    "/kalorien/",
    ...routesUnder("/kalorien/").filter(
      (route) => route !== "/kalorien/kategorie/",
    ),
    ...routesUnder("/kalorien/kategorie/"),
    "/eiweissreiche-lebensmittel/",
    "/kalorienarme-lebensmittel/",
    "/kalorienreiche-lebensmittel/",
    "/low-carb-lebensmittel/",
  ],
  calculator: [
    "/rechner/",
    "/leistungsumsatz-rechner/",
    ...calculatorSlugs.map((slug) => `/${slug}/`),
  ],
  wissen: ["/wissen/", ...routesUnder("/wissen/")],
};

// Zeigt seinen Store-Link erst nach der Berechnung im Browser, das HTML hat keinen.
// Der Link selbst ist unten am Quelltext der Komponente geprüft.
const clientOnlyLinks = new Set(["/abnahmedatum-berechnen/"]);

function mahlzaitStoreLinks(html) {
  return storeLinks(html).filter(
    (href) => href.includes(APP_STORE_ID) || href.includes(PLAY_ID),
  );
}

function campaignOf(href) {
  const url = new URL(href);
  if (url.hostname === "apps.apple.com") {
    assert.equal(
      url.searchParams.get("pt"),
      "127913951",
      `ohne Provider-Token: ${href}`,
    );
    return url.searchParams.get("ct");
  }
  const referrer = new URLSearchParams(url.searchParams.get("referrer") ?? "");
  return referrer.get("utm_campaign");
}

test("die Seitenfamilien sind vollständig gebaut", () => {
  assert.ok(
    families.food.length > 900,
    `nur ${families.food.length} Lebensmittel-Seiten`,
  );
  assert.ok(
    calculatorSlugs.length >= 20,
    `nur ${calculatorSlugs.length} Rechner`,
  );
  assert.ok(
    families.wissen.length > 100,
    `nur ${families.wissen.length} Wissen-Seiten`,
  );
});

for (const [family, routes] of Object.entries(families)) {
  test(`${family}: alle Store-Links tragen website_${family}, keiner homepage`, () => {
    const problems = [];
    for (const route of routes) {
      const html = readPage(route);
      const links = mahlzaitStoreLinks(html);
      if (links.length === 0 && !clientOnlyLinks.has(route)) {
        problems.push(`${route}: kein Store-Link`);
      }
      for (const href of links) {
        const campaign = campaignOf(href);
        if (campaign !== `website_${family}`)
          problems.push(`${route}: ${campaign} in ${href}`);
      }
      // Auch die serialisierte Config der React-Insel darf keinen Startseiten-Link mehr tragen.
      if (/ct=homepage|utm_campaign%3Dhomepage/.test(html)) {
        problems.push(`${route}: enthält noch das Kürzel homepage`);
      }
    }
    assert.deepEqual(problems.slice(0, 10), [], `${problems.length} Probleme`);
  });
}

test("Rechner-Komponenten ohne festen ct=mahlzait-website-Link", () => {
  for (const file of [
    "src/components/calculators/WeightLossDateCalculator.tsx",
    "src/components/calculators/DoenerRechner.tsx",
  ]) {
    const source = readRepoFile(file);
    assert.ok(!source.includes("ct=mahlzait-website"), `${file}: alter Link`);
    assert.ok(
      source.includes(
        'getTrackedAppLink({ platform: "ios", source: "calculator" })',
      ),
      `${file}: kein Rechner-Link`,
    );
  }
});

test("Lebensmittel-Seiten: App-Hinweis direkt unter der Kalorien-Antwort, nicht mehr am Ende", () => {
  const problems = [];
  for (const route of routesUnder("/kalorien/").filter(
    (r) => r !== "/kalorien/kategorie/",
  )) {
    const html = readPage(route);
    const answer = html.indexOf(">Kalorien berechnen</h2>");
    const nextSection = html.indexOf(">Nährwerte pro 100g</h2>");
    const banner = html.indexOf('id="app-banner"');
    const hint = html.indexOf('href="https://apps.apple.com/', answer);
    if (answer < 0 || nextSection < answer || banner < nextSection) {
      problems.push(`${route}: Aufbau nicht gefunden`);
      continue;
    }
    if (!(hint > answer && hint < nextSection)) {
      problems.push(
        `${route}: kein App-Hinweis zwischen Rechner und Nährwerttabelle`,
      );
    }
    // Zwischen Nährwerttabelle und App-Banner am Seitenende kein zweiter Store-Block mehr.
    if (storeLinks(html.slice(nextSection, banner)).length > 0) {
      problems.push(`${route}: Store-Links weiter unten auf der Seite`);
    }
  }
  assert.deepEqual(problems.slice(0, 10), [], `${problems.length} Probleme`);
});
