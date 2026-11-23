import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Die Liste "Beliebte Kalorientabellen" auf der Startseite muss dieselben kcal je 100 g
// nennen wie die verlinkte Lebensmittelseite (USDA FDC, Rezeptrechnung oder Herstellerangabe).
const quelle = readFileSync("src/modules/home/_components/popularFoods/index.tsx", "utf8");
const eintraege = [...quelle.matchAll(/\{ name: "([^"]+)", slug: "([^"]+)", cal: (\d+) \}/g)];

test("Startseite: Beliebte Kalorientabellen nennen die kcal je 100 g der Lebensmittelseiten", () => {
  assert.ok(eintraege.length >= 10, "Liste nicht gefunden");
  for (const [, name, slug, cal] of eintraege) {
    const seite = JSON.parse(readFileSync(`src/data/foods/${slug}.json`, "utf8"));
    assert.equal(Number(cal), Math.round(seite.overview.calories_per_100g), `${name}: Startseite ${cal} kcal, Seite ${seite.overview.calories_per_100g} kcal`);
  }
});
