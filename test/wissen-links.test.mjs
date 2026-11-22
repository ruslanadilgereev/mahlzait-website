// Interne Links in allen Wissen-Artikeln müssen auf gebaute Seiten zeigen. Der
// OpenSEO-Audit vom 22.11.2026 fand drei Links ins Leere: /kalorien/walnuss/,
// /kalorien/kartoffel/ und /taille-huefte-verhaeltnis-rechner/.
// Prüft den Markdown-Quelltext gegen das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pageExists, readRepoFile, repoRoot } from "./dist-html.mjs";

const articleDir = join(repoRoot, "src/content/wissen/articles");

test("interne Links in allen Wissen-Artikeln führen auf gebaute Seiten", () => {
  const broken = [];
  for (const file of readdirSync(articleDir).filter((f) => f.endsWith(".md"))) {
    const md = readRepoFile(`src/content/wissen/articles/${file}`);
    for (const [, href] of md.matchAll(/\]\((\/[^)#\s]*)/g)) {
      const route = href.endsWith("/") ? href : `${href}/`;
      if (!pageExists(route)) broken.push(`${file}: ${href}`);
    }
  }
  assert.deepEqual(broken, []);
});
