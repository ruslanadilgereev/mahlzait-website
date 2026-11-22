// Herkunft der Nährwerte (docs/naehrwerte-herkunft-audit.md). Regel für
// mahlzait.de: Nährwerte stammen aus USDA FoodData Central (FDC); bei
// Markenprodukten, die FDC nicht führt, aus der veröffentlichten Angabe des
// Herstellers. Nie aus FDDB, YAZIO, dem lizenzpflichtigen BLS oder anderen
// Datenbanken Dritter.
//
// Jede Lebensmittelseite hat deshalb ein source-Feld, außer den Seiten in
// OFFEN (kein passender FDC-Eintrag, keine Rezeptrechnung, keine
// Herstellerangabe gefunden; ihre Werte sind unverändert):
// - ein FDC-Eintrag: kcal, Eiweiß, Fett, Kohlenhydrate und Ballaststoffe je
//   100 g passen auf 5 % zu diesem Eintrag (Unterschiede bis 1 kcal bzw. 0,1 g
//   gelten als Rundung);
// - eine Rezeptrechnung: das Feld rezept nennt jede Zutat mit Gramm und FDC-ID,
//   die Werte je 100 g sind daraus gerechnet (die älteren Rezeptseiten ohne
//   dieses Feld prüfen eigene Tests, siehe EIGENE_TESTS);
// - eine Herstellerangabe: das Feld hersteller nennt Hersteller, Produkt, die
//   https-Adresse der Herstellerseite und das Abrufdatum.
// Portionswerte folgen aus den Werten je 100 g: Eine Variante, die nur eine
// andere Menge ist, rechnet mit den Werten der Seite; jede andere Variante und
// jeder Vergleich nennt ihre Bestandteile (basis: eigene Seite, FDC-ID, andere
// Seite oder deren Variante, jeweils mit Gramm), und die Zahlen folgen daraus.
// Der Auszug test/fdc-referenz.json stammt aus scripts/fdc-referenz.mjs. Mit
// FDC_DATA_DIR=<Ordner mit den entpackten FDC-Daten> prüft der letzte Test die
// Referenzdatei gegen die Massendaten, ohne die Variable wird er übersprungen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  alleLebensmittel,
  extrahiere,
  fdcIds,
  fdcIdsDerSeite,
  referenzDatei,
} from "../scripts/fdc-referenz.mjs";

const eintraege = JSON.parse(readFileSync(referenzDatei, "utf8")).eintraege;

// Markeneintrag aus FDC Branded Foods, nicht Teil der drei Datensätze; Werte
// prüft test/doener-kalorien.test.mjs gegen die FDC-API.
const MARKENEINTRAEGE = new Set([2472184]);

// Rezeptseiten mit eigener Prüfung (Döner-Rechner, Tikka Masala, Lahmacun,
// Pizza Kebab): Varianten aus src/modules/doener/rezepte.ts bzw. dem Rezept im
// source-Feld.
const EIGENE_TESTS = new Set([
  "doener", "doener-box", "doener-teller", "duerrum", "durum-kebab", "kebab",
  "vegetarischer-doener", "tikka-masala", "lahmacun", "pizza-kebab",
]);

// Datenbanken Dritter, die als Herstellerangabe nicht zählen
const DRITTE = ["fddb.info", "yazio.com", "openfoodfacts.org", "openfoodfacts.net", "codecheck.info", "naehrwertrechner.de", "kalorientabelle.net", "nutritionix.com", "myfitnesspal.com"];

// <OFFEN>
const OFFEN = new Set([
   "acai", "acai-bowl", "amicelli", "aperol-spritz", "aquafaba", "balisto", "balisto-lila",
   "balisto-orange", "ben-and-jerry-s", "bistro-baguette", "bounty", "bounty-mini", "bowl",
   "cabanossi", "campari", "captain-morgan", "caro-kaffee", "celebrations", "daim-mini",
   "dinkelnudeln", "dr-pepper", "ebly", "ferrero-kuesschen", "feta-light", "five-guys-burger",
   "fleisch", "flips", "fritt", "fruehstueck", "gemuese", "ginger-beer", "giotto", "glucose",
   "grillkaese", "guinness", "gustavo-gusto-margherita", "gustavo-gusto-pizza",
   "hans-im-glueck-burger", "heisse-tasse", "iglo-backfisch", "kaese", "kaesekuchen",
   "kaesespaetzle", "kartoffeln-mit-quark", "katjes", "kfc-hot-wings", "kfc-twister", "kiri",
   "klopfer", "l-osteria-pizza", "labskaus", "lachsschinken", "leberkaese", "leberkassemmel",
   "leibniz-butterkeks", "lidl-ciabatta", "lidl-croissant", "lidl-donut", "lillet", "lion",
   "lion-mini", "magerquark", "maggi", "magnum-double-caramel", "maltesers", "maltodextrin",
   "maoam", "maoam-bloxx", "maoam-joystixx", "maoam-stripes", "mars", "mars-eis", "mars-mini",
   "mars-riegel", "matcha", "mate-tee", "matjes", "matjes-broetchen", "mc-frappe", "mc-toast",
   "mentos", "mikado", "milka-noisette", "milka-schokolade", "milky-way", "mini-milky-way",
   "mon-cheri", "muellermilch", "nesquik", "neuburger", "nordsee-backfisch-baguette",
   "nougat-bits", "nuts", "oreo-donut", "pepsi-max", "philadelphia-light", "piccolinis",
   "pop-tarts", "praline", "proteinriegel", "quark", "quarktasche", "raclette", "raclette-kaese",
   "raeuchertofu", "ritter-sport", "ritter-sport-mini", "roestzwiebeln", "schogetten",
   "schokoriegel", "skyr", "smarties", "smirnoff-ice", "snickers-crisp", "stella-artois", "sucuk",
   "tassimo-milka", "topfen", "traubenzucker", "tuc", "tuc-cracker", "tuc-kekse", "twister-eis",
   "udon", "vapiano", "waterdrop", "weingummi", "weisswurst", "wonderwaffel", "wurst", "yfood",
   "yum-yum",
]);
// </OFFEN>

const alle = alleLebensmittel();
const seiten = new Map(alle.map(({ slug, food }) => [slug, food]));
const umgestellt = alle.filter(({ slug }) => !OFFEN.has(slug));

const istFdc = (food) => typeof food.source === "string" && food.source.startsWith("USDA FoodData Central");
const istRezept = (food) => istFdc(food) && (food.rezept != null || food.source.includes("Rezeptrechnung"));
const istHersteller = (food) => typeof food.source === "string" && food.source.startsWith("Herstellerangabe");

function passt(seite, fdc, rundung) {
  return Math.abs(seite - fdc) <= Math.max(0.05 * Math.abs(fdc), rundung);
}
const eineStelle = (x) => Math.round(x * 10) / 10;

test("OFFEN nennt nur vorhandene Seiten", () => {
  for (const slug of OFFEN) assert.ok(seiten.has(slug), slug + " gibt es nicht");
});

test("jede umgestellte Seite hat ein source-Feld, die offenen keines", () => {
  const ohne = umgestellt.filter(({ food }) => typeof food.source !== "string" || food.source.trim() === "").map(({ slug }) => slug);
  assert.deepEqual(ohne, []);
  const offenMitQuelle = [...OFFEN].filter((s) => seiten.get(s).source != null);
  assert.deepEqual(offenMitQuelle, []);
  assert.ok(umgestellt.length >= 807, "nur " + umgestellt.length + " Seiten umgestellt");
});

test("jedes source-Feld nennt FDC oder eine Herstellerangabe", () => {
  const sonst = alle.filter(({ food }) => food.source != null && !istFdc(food) && !istHersteller(food)).map(({ slug }) => slug);
  assert.deepEqual(sonst, []);
});

test("jede FDC-ID einer Seite steht in den FDC-Datensätzen", () => {
  const fehlen = [];
  for (const { slug, food } of alle) {
    if (istFdc(food)) assert.ok(fdcIds(food.source).length > 0, slug + ": source ohne FDC-ID");
    for (const id of fdcIdsDerSeite(food)) {
      if (!eintraege[String(id)] && !MARKENEINTRAEGE.has(id)) fehlen.push(slug + ": " + id);
    }
  }
  assert.deepEqual(fehlen, []);
});

test("Seiten mit einem FDC-Eintrag als Quelle passen auf 5 % zu diesem Eintrag", () => {
  const abweichungen = [];
  let geprueft = 0;
  for (const { slug, food } of alle.filter(({ food }) => istFdc(food) && !istRezept(food))) {
    const e = eintraege[String(fdcIds(food.source)[0])];
    const o = food.overview;
    const paare = [
      ["kcal", o.calories_per_100g, e.kcal, 1],
      ["Eiweiß", o.protein_per_100g, e.eiweiss, 0.1],
      ["Fett", o.fat_per_100g, e.fett, 0.1],
      ["Kohlenhydrate", o.carbs_per_100g, e.kohlenhydrate, 0.1],
    ];
    for (const [name, seite, fdc, rundung] of paare) {
      if (fdc == null || !passt(seite, fdc, rundung)) abweichungen.push(slug + ": " + name + " " + seite + " statt " + fdc + " (FDC " + e.id + ")");
    }
    // Ballaststoffe: wie FDC; nennt der Eintrag keinen Wert, steht null (oder 0 bei Lebensmitteln ohne Pflanzenanteil)
    const b = o.fiber_per_100g;
    if (e.ballaststoffe == null ? !(b === null || b === 0) : b == null || !passt(b, e.ballaststoffe, 0.1)) {
      abweichungen.push(slug + ": Ballaststoffe " + b + " statt " + e.ballaststoffe + " (FDC " + e.id + ")");
    }
    geprueft++;
  }
  assert.deepEqual(abweichungen, []);
  assert.ok(geprueft >= 585, "nur " + geprueft + " Seiten geprüft");
});

test("Rezeptrechnungen: Werte je 100 g folgen aus den Zutaten", () => {
  const abweichungen = [];
  for (const { slug, food } of alle.filter(({ food }) => food.rezept != null)) {
    assert.ok(istFdc(food) && food.source.includes("Rezeptrechnung"), slug + ": rezept ohne Rezept-Quelle");
    const summe = { kcal: 0, eiweiss: 0, fett: 0, kohlenhydrate: 0, ballaststoffe: 0 };
    let gramm = 0;
    for (const z of food.rezept.zutaten) {
      const e = eintraege[String(z.fdcId)];
      assert.ok(e && z.g > 0, slug + ": Zutat " + z.name);
      assert.ok(food.source.includes(String(z.fdcId)), slug + ": " + z.fdcId + " fehlt im source-Text");
      gramm += z.g;
      for (const k of Object.keys(summe)) summe[k] += ((e[k] ?? 0) * z.g) / 100;
    }
    const je100 = (k) => (summe[k] * 100) / (food.rezept.gewicht_g ?? gramm);
    const o = food.overview;
    const paare = [
      ["kcal", o.calories_per_100g, Math.round(je100("kcal"))],
      ["Eiweiß", o.protein_per_100g, eineStelle(je100("eiweiss"))],
      ["Fett", o.fat_per_100g, eineStelle(je100("fett"))],
      ["Kohlenhydrate", o.carbs_per_100g, eineStelle(je100("kohlenhydrate"))],
      ["Ballaststoffe", o.fiber_per_100g, eineStelle(je100("ballaststoffe"))],
    ];
    for (const [name, seite, gerechnet] of paare) {
      if (seite !== gerechnet) abweichungen.push(slug + ": " + name + " " + seite + " statt " + gerechnet);
    }
  }
  assert.deepEqual(abweichungen, []);
});

test("Herstellerangaben nennen Hersteller, Produkt, https-Adresse und Abrufdatum", () => {
  for (const { slug, food } of umgestellt.filter(({ food }) => istHersteller(food))) {
    const h = food.hersteller;
    assert.ok(h && h.name && h.produkt, slug + ": Feld hersteller unvollständig");
    const url = new URL(h.url);
    assert.equal(url.protocol, "https:", slug);
    assert.ok(!DRITTE.some((d) => url.hostname === d || url.hostname.endsWith("." + d)), slug + ": " + url.hostname + " ist keine Herstellerseite");
    assert.match(h.abgerufen, /^\d{4}-\d{2}-\d{2}$/, slug);
    assert.ok(food.source.includes(h.url), slug + ": URL fehlt im source-Text");
    const [j, m, t] = h.abgerufen.split("-");
    assert.ok(food.source.includes("abgerufen am " + t + "." + m + "." + j), slug + ": Abrufdatum fehlt im source-Text");
  }
});

test("kcal-Werte im source-Feld passen zum genannten FDC-Eintrag", () => {
  const abweichungen = [];
  for (const { slug, food } of alle.filter(({ food }) => istFdc(food))) {
    // Abschnitt von einer FDC-ID bis zur nächsten; der erste kcal-Wert darin gehört zu ihr
    const treffer = [...food.source.matchAll(/\b\d{6,7}\b/g)];
    treffer.forEach((t, i) => {
      const e = eintraege[t[0]];
      if (!e) return;
      const abschnitt = food.source.slice(t.index, treffer[i + 1]?.index ?? food.source.length);
      const m = abschnitt.match(/(\d+(?:,\d+)?) kcal/);
      if (!m) return;
      const kcal = Number(m[1].replace(",", "."));
      if (!passt(kcal, e.kcal, 1)) abweichungen.push(slug + ": " + t[0] + " mit " + kcal + " statt " + e.kcal + " kcal");
    });
  }
  assert.deepEqual(abweichungen, []);
});

// Werte eines Bestandteils: eigene Seite ({g}), FDC-Eintrag ({fdcId, g}),
// andere Seite ({slug, g}, ohne g deren typische Portion) oder deren Variante
// ({slug, variante}).
function bestandteil(b, food) {
  if (b.variante != null) {
    const v = seiten.get(b.slug)?.variants.find((x) => x.name === b.variante);
    assert.ok(v, food.slug + ": Variante " + b.slug + "/" + b.variante + " fehlt");
    return { g: v.portion_g, kcal: v.calories, eiweiss: v.protein, kohlenhydrate: v.carbs, fett: v.fat };
  }
  let je100;
  let g = b.g;
  if (b.fdcId != null) {
    const e = eintraege[String(b.fdcId)];
    assert.ok(e, food.slug + ": FDC " + b.fdcId + " fehlt in der Referenz");
    je100 = e;
  } else {
    const andere = b.slug != null ? seiten.get(b.slug) : food;
    assert.ok(andere, food.slug + ": Seite " + b.slug + " fehlt");
    const o = andere.overview;
    je100 = { kcal: o.calories_per_100g, eiweiss: o.protein_per_100g, kohlenhydrate: o.carbs_per_100g, fett: o.fat_per_100g };
    if (g == null && b.slug != null) g = o.typical_portion_g;
  }
  assert.ok(g > 0, food.slug + ": Bestandteil ohne Gramm " + JSON.stringify(b));
  const f = g / 100;
  return { g, kcal: je100.kcal * f, eiweiss: je100.eiweiss * f, kohlenhydrate: je100.kohlenhydrate * f, fett: je100.fett * f };
}
function summe(basis, food) {
  const s = { g: 0, kcal: 0, eiweiss: 0, kohlenhydrate: 0, fett: 0 };
  for (const b of basis) {
    const w = bestandteil(b, food);
    for (const k of Object.keys(s)) s[k] += w[k];
  }
  return s;
}

test("Portionswerte der Varianten folgen aus den Werten je 100 g oder ihren Bestandteilen", () => {
  const abweichungen = [];
  let geprueft = 0;
  for (const { slug, food } of umgestellt.filter(({ slug }) => !EIGENE_TESTS.has(slug))) {
    for (const v of food.variants) {
      const s = v.basis ? summe(v.basis, food) : bestandteil({ g: v.portion_g }, food);
      const wo = slug + " / " + v.name + ": ";
      if (Math.abs(s.g - v.portion_g) > 0.5) abweichungen.push(wo + v.portion_g + " g statt " + s.g + " g");
      if (Math.abs(v.calories - s.kcal) > 1) abweichungen.push(wo + v.calories + " kcal statt " + eineStelle(s.kcal));
      for (const [k, name] of [["protein", "eiweiss"], ["carbs", "kohlenhydrate"], ["fat", "fett"]]) {
        if (Math.abs(v[k] - s[name]) > 0.5 + 1e-9) abweichungen.push(wo + k + " " + v[k] + " statt " + eineStelle(s[name]));
      }
      geprueft++;
    }
  }
  assert.deepEqual(abweichungen, []);
  assert.ok(geprueft >= 4800, "nur " + geprueft + " Varianten geprüft");
});

test("Vergleiche nennen ihre Bestandteile, die kcal folgen daraus", () => {
  const abweichungen = [];
  for (const { slug, food } of umgestellt) {
    for (const c of food.comparison) {
      if (!Array.isArray(c.basis) || c.basis.length === 0) {
        abweichungen.push(slug + " / " + c.name + ": keine Bestandteile");
        continue;
      }
      const s = summe(c.basis, food);
      if (Math.abs(c.calories - s.kcal) > 1) abweichungen.push(slug + " / " + c.name + ": " + c.calories + " kcal statt " + eineStelle(s.kcal));
    }
  }
  assert.deepEqual(abweichungen, []);
});

test("Bestandteile verweisen nicht auf offene Seiten", () => {
  const verweise = [];
  for (const { slug, food } of alle) {
    for (const x of [...food.variants, ...food.comparison]) {
      for (const b of x.basis ?? []) if (b.slug != null && OFFEN.has(b.slug)) verweise.push(slug + " / " + x.name + " -> " + b.slug);
    }
  }
  assert.deepEqual(verweise, []);
});

test("Referenzdatei entspricht den FDC-Massendaten", { skip: !process.env.FDC_DATA_DIR && "FDC_DATA_DIR nicht gesetzt" }, () => {
  const ids = Object.keys(eintraege).map(Number);
  assert.deepEqual(extrahiere(process.env.FDC_DATA_DIR, ids), eintraege);
});
