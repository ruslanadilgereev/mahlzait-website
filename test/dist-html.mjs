// Hilfen für Tests, die die gebaute Website in dist/ prüfen (vorher pnpm build).
// DIST=<Ordner> prüft einen anderen Build, etwa einen alten für die Gegenprobe.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const distDir = resolve(process.env.DIST ?? join(repoRoot, "dist"));

if (!existsSync(join(distDir, "index.html"))) {
  throw new Error(`Kein Build in ${distDir}: zuerst pnpm build ausführen.`);
}

export function readRepoFile(path) {
  return readFileSync(join(repoRoot, path), "utf8");
}

export function pageExists(route) {
  return existsSync(join(distDir, route, "index.html"));
}

export function readPage(route) {
  return readFileSync(join(distDir, route, "index.html"), "utf8");
}

/** Routen direkt unter einem Präfix, die eine eigene index.html haben, z. B. "/kalorien/". */
export function routesUnder(prefix) {
  return readdirSync(join(distDir, prefix), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${prefix}${entry.name}/`)
    .filter(pageExists);
}

/** Ziele aller Links in App Store und Google Play, `&amp;` aufgelöst. */
export function storeLinks(html) {
  return [
    ...html.matchAll(
      /href="(https:\/\/(?:apps\.apple\.com|play\.google\.com)[^"]*)"/g,
    ),
  ].map((match) => match[1].replaceAll("&amp;", "&"));
}

/** Alle JSON-LD-Blöcke einer Seite als Objekte. */
export function jsonLd(html) {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]));
}

/** Fragen und Antworten aus dem FAQPage-Schema einer Seite. */
export function faqFromSchema(html) {
  const faq = jsonLd(html).find((block) => block["@type"] === "FAQPage");
  if (!faq) return [];
  return faq.mainEntity.map((item) => ({
    question: item.name,
    answer: item.acceptedAnswer.text,
  }));
}

const entities = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** Sichtbarer Text: ohne Skripte, Stile und Attribute (also auch ohne Insel-Props). */
export function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, code) => {
      if (code[0] === "#") {
        const value =
          code[1].toLowerCase() === "x"
            ? parseInt(code.slice(2), 16)
            : Number(code.slice(1));
        return String.fromCodePoint(value);
      }
      return entities[code.toLowerCase()] ?? whole;
    })
    .replace(/\s+/g, " ");
}
