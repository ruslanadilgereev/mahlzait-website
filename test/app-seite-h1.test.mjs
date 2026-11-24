// Die Weiterleitungsseite /app/ (src/modules/app/index.tsx) hatte bis 24.11.2026 keine
// H1, ihr einziger Text stand in einer H2 (Fund aus dem OpenSEO-Audit). Jetzt ist
// derselbe Text mit denselben Klassen die einzige H1.
// Prüft das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readPage, visibleText } from "./dist-html.mjs";

test("/app/ hat genau eine H1, den vorhandenen Text, und ihn in keiner anderen Überschrift", () => {
  const html = readPage("/app/")
    .replaceAll(String.fromCharCode(0), "") // NUL an Blockgrenzen der React-Ausgabe
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, "");
  const ueberschriften = [...html.matchAll(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/g)].map(
    ([, ebene, attribute, inhalt]) => ({
      ebene,
      klassen: attribute.match(/class="([^"]*)"/)?.[1],
      text: visibleText(inhalt).trim(),
    }),
  );
  const text =
    "We’re sending you to our app. If nothing happens, you’ll be redirected shortly.";
  assert.deepEqual(
    ueberschriften.filter((u) => u.ebene === "h1" || u.text === text),
    [{ ebene: "h1", klassen: "text-center max-w-xs md:max-w-md", text }],
  );
});
