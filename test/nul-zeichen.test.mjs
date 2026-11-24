import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { distDir } from "./dist-html.mjs";

// React 18 schreibt beim Streamen gelegentlich Nullbytes vor Zeichen, die genau auf eine Puffergrenze
// fallen (Umlaute, Gedankenstriche, Emojis). Mit experimentalDisableStreaming in astro.config.mjs
// rendert Astro die Inseln ohne Streaming, dann entstehen keine.
test("gebaute Seiten enthalten keine NUL-Zeichen", () => {
  const treffer = [];
  const stapel = [distDir];
  while (stapel.length > 0) {
    const ordner = stapel.pop();
    for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
      const pfad = join(ordner, eintrag.name);
      if (eintrag.isDirectory()) stapel.push(pfad);
      else if (eintrag.name.endsWith(".html") && readFileSync(pfad).includes(0)) {
        treffer.push(pfad.slice(distDir.length));
      }
    }
  }
  assert.deepEqual(treffer.slice(0, 5), [], `NUL-Zeichen auf ${treffer.length} Seiten`);
});
