// public/llms.txt nennt den Jahrespreis von Mahlzait Pro wie die Preis-Sektion
// der Website. Beim Wechsel auf 39,99 € am 15.11.2026 (389bbb6) blieb hier
// 29,99 € stehen. Prüft nur Quelltext, kein Build nötig.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) =>
  readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), "utf8");

test("llms.txt nennt denselben Jahrespreis wie die Preis-Sektion", () => {
  const config = read("src/utils/config.ts");
  const jahr = config.match(
    /title: "Mahlzait Pro Jahr",\s*price: "([\d,]+) €\/Jahr"/,
  );
  assert.ok(jahr, "Jahrespreis in config.ts nicht gefunden");
  const llms = read("public/llms.txt");
  assert.ok(
    llms.includes(`- Pro Jahr: ${jahr[1]} €/Jahr`),
    "Preisliste in llms.txt veraltet",
  );
  const zeile = llms
    .split("\n")
    .find((line) => line.startsWith("| Jahresabo (App Store DE) |"));
  assert.ok(
    zeile?.startsWith(`| Jahresabo (App Store DE) | ${jahr[1]} € |`),
    "Vergleichstabelle veraltet",
  );
});
