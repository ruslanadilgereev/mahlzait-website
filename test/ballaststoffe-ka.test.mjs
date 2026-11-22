// Nennt der FDC-Eintrag einer Lebensmittelseite keinen Ballaststoffwert
// (fiber_per_100g: null), zeigt die Seite "k. A." statt einer erfundenen 0 oder
// "nullg" (src/modules/kalorienFood/index.tsx). Beispiel: 20er Nuggets nach
// FDC 173297 (McDONALD'S, Chicken McNUGGETS) ohne Ballaststoffwert.
// Prüft Daten und das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readPage, readRepoFile, visibleText } from "./dist-html.mjs";

const NUL = String.fromCharCode(0);

test("20er Nuggets: Daten ohne Ballaststoffwert, Seite zeigt k. A.", () => {
  const food = JSON.parse(readRepoFile("src/data/foods/20er-nuggets.json"));
  assert.equal(food.overview.fiber_per_100g, null);
  const text = visibleText(readPage("/kalorien/20er-nuggets/").split(NUL).join(""));
  assert.ok(text.includes("Ballaststoffe k. A. k. A."), "Nährwerttabelle");
  assert.ok(!/nullg|NaN/.test(text), "kein nullg oder NaN");
});
