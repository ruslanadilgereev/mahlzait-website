// Wartung aus dem OpenSEO-Audit vom 22.11.2026:
// - Die Sitemap führt nur Seiten, die es gibt und die nicht umleiten
//   (/kalorientabelle/ stand drin und leitet per 308 auf /kalorien/).
// - Adressen ohne Schrägstrich am Ende antworteten mit 200 statt umzuleiten;
//   die Website nutzt trailingSlash "always", vercel.json leitet sie jetzt um.
// - Auf der Startseite meldete Google Warnungen für Produkt-Snippets (fehlende
//   Bewertungsfelder); die drei Product-Blöcke für die Abo-Stufen sind weg,
//   die Preise stehen weiter im MobileApplication-Schema.
// Prüft vercel.json und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  distDir,
  jsonLd,
  pageExists,
  readPage,
  readRepoFile,
} from "./dist-html.mjs";

const redirects = JSON.parse(readRepoFile("vercel.json")).redirects;

// Alle Seiten im Build als Route mit Schrägstrich am Ende ("/kalorien/haferflocken/").
function builtRoutes(dir = distDir, route = "/") {
  const routes = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const child = `${route}${entry.name}/`;
    if (pageExists(child)) routes.push(child);
    routes.push(...builtRoutes(join(dir, entry.name), child));
  }
  return routes;
}

// Vercel übersetzt "source" mit path-to-regexp 6 (strict, sensitive); bei einem
// einzigen Parameter mit eigenem Muster ergibt das ^\/(<Muster>)$.
const trailingSlashRule = redirects.find(
  (rule) => rule.destination === "/:path/",
);

function redirectTarget(path) {
  const pattern = trailingSlashRule.source.match(/^\/:path\((.*)\)$/)[1];
  const match = new RegExp(`^\\/(${pattern})$`).exec(path);
  return match ? `/${match[1]}/` : null;
}

test("vercel.json leitet Seiten ohne Schrägstrich per 308 auf die Adresse mit Schrägstrich", () => {
  assert.ok(trailingSlashRule, "keine Umleitung auf /:path/");
  assert.equal(trailingSlashRule.permanent, true);
  // Als letzte Regel, damit die gezielten Umleitungen (etwa /vergleich) zuerst greifen.
  assert.equal(redirects.at(-1), trailingSlashRule);

  const routes = builtRoutes();
  assert.ok(routes.length > 1000, `nur ${routes.length} Seiten im Build`);
  const wrong = routes.filter(
    (route) => redirectTarget(route.slice(0, -1)) !== route,
  );
  assert.deepEqual(
    wrong.slice(0, 10),
    [],
    `${wrong.length} Seiten ohne Umleitung`,
  );
});

test("die Umleitung lässt Dateien, Schnittstellen und Kurzlinks in Ruhe", () => {
  assert.ok(trailingSlashRule, "keine Umleitung auf /:path/");
  const untouched = [
    "/",
    "/kalorien/haferflocken/",
    "/api/track-click",
    "/api/leaderboard",
    "/api/dataset.json",
    "/go/bio-ig1",
    "/go/tt-ad",
    "/i/AbC123",
    "/social/clips/2026/video",
    "/_vercel/insights/view",
    "/_vercel/speed-insights/vitals",
    "/wp-login",
    "/wp-admin/install",
    "/.well-known/security.txt",
    "/sitemap-0.xml",
    "/llms.txt",
    "/favicon.ico",
    "/_astro/client.B1x2.js",
    "/screenshots/mobile/1.webp",
  ];
  const redirected = untouched.filter((path) => redirectTarget(path) !== null);
  assert.deepEqual(redirected, []);
});

test("die Sitemap führt nur gebaute Seiten, die nicht umleiten", () => {
  const xml = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
  const paths = [
    ...xml.matchAll(/<loc>https:\/\/www\.mahlzait\.de([^<]*)<\/loc>/g),
  ].map((match) => match[1]);
  assert.ok(paths.length > 1000, `nur ${paths.length} Adressen in der Sitemap`);
  const fixedSources = new Set(
    redirects
      .filter((rule) => !/[:(]/.test(rule.source))
      .map((rule) => rule.source),
  );
  const problems = paths.filter(
    (path) =>
      !pageExists(path) ||
      fixedSources.has(path) ||
      fixedSources.has(path.slice(0, -1)),
  );
  assert.deepEqual(problems, []);
});

test("Startseite: keine Product-Blöcke mehr, die App-Preise stehen im MobileApplication-Schema", () => {
  const blocks = jsonLd(readPage("/"));
  const types = blocks.map((block) => block["@type"]);
  assert.ok(
    !types.includes("Product"),
    `Product-Schema gefunden: ${types.join(", ")}`,
  );
  const app = blocks.find((block) => block["@type"] === "MobileApplication");
  assert.ok(app, "MobileApplication fehlt");
  assert.deepEqual(
    app.offers.map((offer) => offer.price),
    ["0", "7.99", "39.99"],
  );
});
