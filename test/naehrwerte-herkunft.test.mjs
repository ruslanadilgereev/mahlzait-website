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
//   dieses Feld prüfen eigene Tests, siehe EIGENE_TESTS); Zutaten ohne
//   FDC-Eintrag (Quark, Matjes, Leberkäse) rechnen mit den Werten einer Seite
//   mit Herstellerangabe (slug statt FDC-ID, Entscheidung vom 23.11.2026);
// - eine Herstellerangabe: das Feld hersteller nennt Hersteller, Produkt, die
//   https-Adresse der Herstellerseite und das Abrufdatum; Seiten aus Österreich
//   oder der Schweiz nennen das Land (hersteller.land);
// - ein Händler-Etikett (Vorschlag vom 23.11.2026): die Kennzeichnung des
//   Herstellers auf der Verpackung, wie sie die Produktseite eines großen
//   deutschen Händlers zeigt (hersteller.haendler); test/haendler-etiketten.json
//   hält die Nährwerttabelle so fest, wie sie am Abrufdatum angezeigt wurde, und
//   die Werte der Seite folgen daraus.
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
const etiketten = JSON.parse(readFileSync(new URL("./haendler-etiketten.json", import.meta.url), "utf8")).eintraege;

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

// Händler, deren Produktseiten als Händler-Etikett zählen (große deutsche Händler)
const HAENDLER = {
  REWE: ["www.rewe.de"],
  EDEKA: ["www.edeka.de"],
  EDEKA24: ["edeka24.de", "www.edeka24.de"],
  Kaufland: ["www.kaufland.de"],
  dm: ["www.dm.de"],
  Rossmann: ["www.rossmann.de"],
};

// <OFFEN>
const OFFEN = new Set([
   "ben-and-jerry-s", "bowl", "campari", "captain-morgan", "feta-light", "five-guys-burger",
   "fleisch", "fruehstueck", "gemuese", "giotto", "guinness", "hans-im-glueck-burger", "kaese",
   "katjes", "klopfer", "l-osteria-pizza", "magnum-double-caramel", "mate-tee", "mc-frappe",
   "oreo-donut", "pepsi-max", "philadelphia-light", "pop-tarts", "praline", "proteinriegel",
   "schokoriegel", "smirnoff-ice", "snickers-crisp", "twister-eis", "vapiano", "wonderwaffel",
   "wurst", "yfood",
]);
// </OFFEN>

// Seiten nach Regel 4 (Herstellerwerte je 100 g, Stückgewicht geschätzt)
const STUECKGEWICHT_GESCHAETZT = new Set(["celebrations", "ferrero-kuesschen", "fritt", "gustavo-gusto-margherita", "gustavo-gusto-pizza", "heisse-tasse", "iglo-backfisch", "leibniz-butterkeks", "lidl-ciabatta", "lion", "maggi", "maoam", "maoam-bloxx", "maoam-joystixx", "maoam-stripes", "mentos", "milka-noisette", "milka-schokolade", "mon-cheri", "neuburger", "nordsee-backfisch-baguette", "ritter-sport", "schogetten", "smarties", "tuc", "tuc-cracker", "tuc-kekse"]);

// Regel 5: nicht mehr im Sortiment des Herstellers (Stand 23.11.2026)
const NICHT_IM_SORTIMENT = new Set(["magnum-double-caramel", "mc-frappe", "pepsi-max", "philadelphia-light", "snickers-crisp", "twister-eis", "yfood"]);

// Regel 5: Herstellerangaben widersprechen sich
const WIDERSPRUECHLICH = new Set(["giotto"]);

const alle = alleLebensmittel();
const seiten = new Map(alle.map(({ slug, food }) => [slug, food]));
const umgestellt = alle.filter(({ slug }) => !OFFEN.has(slug));

const istFdc = (food) => typeof food.source === "string" && food.source.startsWith("USDA FoodData Central");
const istRezept = (food) => istFdc(food) && (food.rezept != null || food.source.includes("Rezeptrechnung"));
const istHersteller = (food) => typeof food.source === "string" && food.source.startsWith("Herstellerangabe");
const istEtikett = (food) => typeof food.source === "string" && food.source.startsWith("Händler-Etikett ");

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
  assert.ok(umgestellt.length >= 906, "nur " + umgestellt.length + " Seiten umgestellt");
});

test("jedes source-Feld nennt FDC, eine Herstellerangabe oder ein Händler-Etikett", () => {
  const sonst = alle.filter(({ food }) => food.source != null && !istFdc(food) && !istHersteller(food) && !istEtikett(food)).map(({ slug }) => slug);
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
      let e;
      if (z.slug != null) {
        // Zutat ohne FDC-Eintrag (z. B. Quark, Matjes): Werte einer Seite mit Herstellerangabe
        const andere = seiten.get(z.slug);
        assert.ok(andere && !OFFEN.has(z.slug) && istHersteller(andere), slug + ": Zutat " + z.name + " (Seite " + z.slug + ") ohne Herstellerangabe");
        assert.notEqual(andere.overview.einheit, "ml", slug + ": Zutat " + z.name + " rechnet je 100 ml");
        assert.ok(food.source.includes("Seite " + z.slug), slug + ": Seite " + z.slug + " fehlt im source-Text");
        assert.ok(food.source.includes("Herstellerangabe"), slug + ": source nennt die Herstellerangabe nicht");
        const o = andere.overview;
        e = { kcal: o.calories_per_100g, eiweiss: o.protein_per_100g, fett: o.fat_per_100g, kohlenhydrate: o.carbs_per_100g, ballaststoffe: o.fiber_per_100g };
      } else {
        e = eintraege[String(z.fdcId)];
        assert.ok(food.source.includes(String(z.fdcId)), slug + ": " + z.fdcId + " fehlt im source-Text");
      }
      assert.ok(e && z.g > 0, slug + ": Zutat " + z.name);
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
    assert.equal(h.haendler, undefined, slug + ": Händler bei einer Herstellerangabe (source muss mit Händler-Etikett beginnen)");
    assert.match(h.abgerufen, /^\d{4}-\d{2}-\d{2}$/, slug);
    assert.ok(food.source.includes(h.url), slug + ": URL fehlt im source-Text");
    const [j, m, t] = h.abgerufen.split("-");
    assert.ok(food.source.includes("abgerufen am " + t + "." + m + "." + j), slug + ": Abrufdatum fehlt im source-Text");
    // Herstellerseite aus Österreich oder der Schweiz (Entscheidung vom 23.11.2026), sonst für den deutschen Markt
    if (h.land != null) {
      assert.ok(["Österreich", "Schweiz"].includes(h.land), slug + ": land " + h.land);
      assert.ok(!h.beispiel, slug + ": Beispiel mit Land");
      assert.ok(food.source.startsWith("Herstellerangabe (" + h.land + ") "), slug + ": source ohne Land");
    } else {
      assert.ok(!food.source.startsWith("Herstellerangabe ("), slug + ": Land im source-Text, aber nicht in hersteller.land");
    }
  }
});

// Händler-Etikett: Das source-Feld nennt die Art, den Händler, die Adresse der
// Produktseite und das Abrufdatum; andere Händler, Marktplätze, Datenbanken und
// Händlerseiten anderer Länder zählen nicht.
test("Händler-Etikett: Art, Händler, Produkt, https-Adresse und Abrufdatum", () => {
  const mitEtikett = alle.filter(({ food }) => istEtikett(food));
  assert.deepEqual(mitEtikett.map(({ slug }) => slug).sort(), Object.keys(etiketten).sort());
  assert.ok(mitEtikett.length >= 23, "nur " + mitEtikett.length + " Seiten mit Händler-Etikett");
  for (const { slug, food } of mitEtikett) {
    const h = food.hersteller;
    const e = etiketten[slug];
    assert.ok(h && h.name && h.produkt && h.haendler, slug + ": Feld hersteller unvollständig");
    const url = new URL(h.url);
    assert.equal(url.protocol, "https:", slug);
    assert.ok(HAENDLER[h.haendler]?.includes(url.hostname), slug + ": " + url.hostname + " ist keine Produktseite von " + h.haendler);
    assert.deepEqual([h.haendler, h.url, h.abgerufen], [e.haendler, e.url, e.abgerufen], slug + ": Referenz nennt andere Quelle");
    assert.match(h.abgerufen, /^\d{4}-\d{2}-\d{2}$/, slug);
    const [j, m, t] = h.abgerufen.split("-");
    assert.ok(food.source.startsWith("Händler-Etikett " + h.haendler + ": Herstellerangabe laut Verpackung, "), slug + ": Art fehlt im source-Text");
    assert.ok(food.source.includes("(" + h.url + ", abgerufen am " + t + "." + m + "." + j + "), Werte je 100 " + (food.overview.einheit === "ml" ? "ml" : "g")), slug + ": Adresse, Abrufdatum oder Bezug fehlt im source-Text");
    assert.equal(h.land, undefined, slug);
    assert.ok(!h.beispiel || food.source.includes("Werte am Beispiel " + h.name + " " + h.produkt), slug + ": Beispielprodukt fehlt im source-Text");
  }
});

// Zelle der Nährwerttabelle: "1.862 kJ", "16 g", "0,66 g", "< 0,5 g" (zählt als 0)
function zelle(e, name, einheit, spalte) {
  const i = e.tabelle[0].indexOf(spalte);
  assert.ok(i > 0, e.titel + ": Spalte " + spalte);
  const text = e.tabelle.slice(1).find((z) => z[0] === name && z[i].endsWith(" " + einheit))?.[i];
  if (text == null) return null;
  if (text.startsWith("<")) return 0;
  const m = text.match(/^(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d+))? [a-zJ]+$/);
  assert.ok(m, e.titel + ": " + text);
  return Number(m[1].replaceAll(".", "") + "." + (m[2] ?? "0"));
}
const etikettWerte = (e, spalte = e.spalte) => ({
  kj: zelle(e, "Energie", "kJ", spalte),
  kcal: zelle(e, "Energie", "kcal", spalte),
  fett: zelle(e, "Fett", "g", spalte),
  gesaettigt: zelle(e, "Fett, davon gesättigte Fettsäuren", "g", spalte),
  kohlenhydrate: zelle(e, "Kohlenhydrate", "g", spalte),
  zucker: zelle(e, "Kohlenhydrate, davon Zucker", "g", spalte),
  eiweiss: zelle(e, "Eiweiß", "g", spalte),
  salz: zelle(e, "Salz", "g", spalte),
  ballaststoffe: zelle(e, "Ballaststoffe", "g", spalte),
});

test("Händler-Etikett: Werte der Seite folgen aus der Nährwerttabelle der Händlerseite", () => {
  const abweichungen = [];
  for (const [slug, e] of Object.entries(etiketten)) {
    const w = etikettWerte(e);
    const o = seiten.get(slug).overview;
    // Bezug: 100 g bzw. 100 ml wie auf der Seite, sonst Umrechnung auf das trockene Produkt
    // (ebly: Portion aus 62,5 g ungekochtem Weizen; yum-yum: 380 g Suppe aus 60 g Nudeln)
    if (!e.umrechnung) assert.equal(e.spalte, o.einheit === "ml" ? "pro 100 ml" : "pro 100 g", slug);
    const f = e.umrechnung ? e.umrechnung.mal / e.umrechnung.durch : 1;
    if (e.umrechnung) assert.match(seiten.get(slug).hersteller.produkt, /umgerechnet/, slug + ": Umrechnung nicht sichtbar");
    const paare = [
      ["kcal", o.calories_per_100g, Math.round(w.kcal * f)],
      ["Eiweiß", o.protein_per_100g, eineStelle(w.eiweiss * f)],
      ["Fett", o.fat_per_100g, eineStelle(w.fett * f)],
      ["Kohlenhydrate", o.carbs_per_100g, eineStelle(w.kohlenhydrate * f)],
      ["Ballaststoffe", o.fiber_per_100g, w.ballaststoffe == null ? null : eineStelle(w.ballaststoffe * f)],
    ];
    for (const [name, seite, etikett] of paare) if (seite !== etikett) abweichungen.push(slug + ": " + name + " " + seite + " statt " + etikett);
  }
  assert.deepEqual(abweichungen, []);
});

test("Händler-Etikett: Tabelle vollständig, in sich stimmig und ohne Widerspruch zu anderen Händlern", () => {
  for (const [slug, e] of Object.entries(etiketten)) {
    const w = etikettWerte(e);
    for (const k of ["kj", "kcal", "fett", "gesaettigt", "kohlenhydrate", "zucker", "eiweiss", "salz"]) assert.ok(w[k] != null, slug + ": " + k + " fehlt");
    assert.ok(Math.abs(w.kj / 4.184 - w.kcal) <= 0.02 * w.kcal + 1, slug + ": " + w.kj + " kJ und " + w.kcal + " kcal");
    // Energie aus den Nährstoffen (Alkohol 7 kcal/g, 0,789 g/ml), Abweichung durch Rundung
    const energie = 4 * w.eiweiss + 4 * w.kohlenhydrate + 9 * w.fett + 2 * (w.ballaststoffe ?? 0) + 7 * 0.789 * (e.alkohol_vol ?? 0);
    assert.ok(Math.abs(energie - w.kcal) <= 0.05 * w.kcal + 1, slug + ": " + w.kcal + " kcal, aus den Nährstoffen " + eineStelle(energie));
    const je100 = etikettWerte(e, e.tabelle[0][1]).kcal;
    for (const g of e.gegenprobe) assert.ok(passt(g.kcal, je100, 1), slug + ": " + g.haendler + " nennt " + g.kcal + " statt " + je100 + " kcal");
  }
});

test("Händler-Etikett: Gewicht der typischen Portion steht auf der Händlerseite oder ist als Schätzung gekennzeichnet", () => {
  for (const [slug, e] of Object.entries(etiketten)) {
    const o = seiten.get(slug).overview;
    if (o.portion_geschaetzt) continue;
    const treffer = e.gewichte.some(({ wert }) => { const n = o.typical_portion_g / wert; return n >= 1 && Math.abs(n - Math.round(n)) < 1e-9; });
    assert.ok(treffer, slug + ": " + o.typical_portion_g + " steht nicht auf der Händlerseite");
  }
});

// Herstellerwerte je 100 g ohne Stückgewicht vom Hersteller (Entscheidung vom
// 23.11.2026): Das bisherige Stückgewicht bleibt, als Schätzung gekennzeichnet
// (stueck_geschaetzt an der Variante, portion_geschaetzt an der typischen
// Portion, "ca." im Namen; die Seite zeigt "Stückgewicht nicht vom Hersteller
// angegeben").
test("geschätzte Stückgewichte nur bei Herstellerangaben und Händler-Etiketten und mit ca. im Namen", () => {
  const befunde = [];
  for (const { slug, food } of alle) {
    const geschaetzt = food.variants.filter((v) => v.stueck_geschaetzt);
    if (!geschaetzt.length && !food.overview.portion_geschaetzt) continue;
    if (!istHersteller(food) && !istEtikett(food)) befunde.push(slug + ": geschätztes Stückgewicht ohne Herstellerangabe");
    for (const v of geschaetzt) if (!/\bca\. /.test(v.name)) befunde.push(slug + " / " + v.name + ": ohne ca.");
    if (food.overview.portion_geschaetzt && !/\bca\. /.test(food.overview.typical_portion_name)) befunde.push(slug + ": typische Portion ohne ca.");
  }
  assert.deepEqual(befunde, []);
  for (const slug of STUECKGEWICHT_GESCHAETZT) {
    const food = seiten.get(slug);
    assert.ok(istHersteller(food), slug + ": keine Herstellerangabe");
    assert.ok(food.overview.portion_geschaetzt || food.variants.some((v) => v.stueck_geschaetzt), slug + ": Schätzung nicht gekennzeichnet");
  }
});

// Nicht mehr erhältliche Produkte und widersprüchliche Herstellerwerte
// (Entscheidung vom 23.11.2026): Werte unverändert, Seite offen, sichtbarer Vermerk.
test("Vermerk nur auf offenen Seiten, Auslaufprodukte und Widersprüche vermerkt", () => {
  const ohneOffen = alle.filter(({ slug, food }) => food.vermerk != null && !OFFEN.has(slug)).map(({ slug }) => slug);
  assert.deepEqual(ohneOffen, []);
  for (const slug of NICHT_IM_SORTIMENT) assert.equal(seiten.get(slug).vermerk, "nicht mehr im Sortiment, Stand 23.11.2026", slug);
  for (const slug of WIDERSPRUECHLICH) assert.match(seiten.get(slug).vermerk, /^Herstellerangaben widersprüchlich \(.+\), Stand 23\.11\.2026$/, slug);
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

// Vergleiche offener Seiten, die eine umgestellte Seite zitieren, nennen deren
// Bestandteile (Batch F, Regel 6); wo eine offene Seite Bestandteile nennt, folgen die kcal daraus.
test("Vergleiche offener Seiten mit Bestandteilen folgen aus deren Werten", () => {
  const abweichungen = [];
  for (const { slug, food } of alle.filter(({ slug }) => OFFEN.has(slug))) {
    for (const c of food.comparison) {
      if (!Array.isArray(c.basis)) continue;
      const s = summe(c.basis, food);
      if (Math.abs(c.calories - s.kcal) > 1) abweichungen.push(slug + " / " + c.name + ": " + c.calories + " kcal statt " + eineStelle(s.kcal));
    }
  }
  assert.deepEqual(abweichungen, []);
  for (const [slug, name] of [
    ["campari", "Aperol Spritz (100 ml)"],
    ["kaese", "Quark 20%"],
    ["proteinriegel", "Quark 500g"],
    ["smirnoff-ice", "Aperol Spritz (Flasche, 200 ml)"],
  ]) {
    const c = seiten.get(slug).comparison.find((x) => x.name === name);
    assert.ok(c?.basis?.length, slug + " / " + name + ": keine Bestandteile");
  }
});

test("Bestandteile verweisen nicht auf offene Seiten", () => {
  const verweise = [];
  for (const { slug, food } of alle) {
    for (const x of [...food.variants, ...food.comparison]) {
      for (const b of x.basis ?? []) if (b.slug != null && OFFEN.has(b.slug)) verweise.push(slug + " / " + x.name + " -> " + b.slug);
    }
    for (const z of food.rezept?.zutaten ?? []) if (z.slug != null && OFFEN.has(z.slug)) verweise.push(slug + " / Rezept " + z.name + " -> " + z.slug);
  }
  assert.deepEqual(verweise, []);
});

test("Referenzdatei entspricht den FDC-Massendaten", { skip: !process.env.FDC_DATA_DIR && "FDC_DATA_DIR nicht gesetzt" }, () => {
  const ids = Object.keys(eintraege).map(Number);
  assert.deepEqual(extrahiere(process.env.FDC_DATA_DIR, ids), eintraege);
});