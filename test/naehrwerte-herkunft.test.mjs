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
const OFFEN = new Set([]);
// </OFFEN>

// <AUSSTEHEND>
// Seiten, die die Umstellung noch nicht erreicht hat; die Liste wird mit jedem
// Schritt kürzer und ist am Ende leer.
const AUSSTEHEND = new Set([
   "acai", "acai-bowl", "actimel", "activia", "agar-agar", "agavendicksaft", "ahornsirup", "aioli",
   "ajvar", "almased", "almdudler", "amicelli", "ananas", "aperol-spritz", "apfel", "aprikose",
   "aquafaba", "artischocken", "aubergine", "avocado", "ayran", "bacardi", "bacardi-razz",
   "back-camembert", "baileys", "balisto", "balisto-lila", "balisto-orange", "balsamico",
   "balsamico-dressing", "banana-bread", "banane", "bananenchips", "basmati-reis", "baumkuchen",
   "beef-jerky", "ben-and-jerry-s", "berner-wuerstel", "bienenstich", "bier", "bifi", "bifi-roll",
   "big-king-xxl", "bionade", "birchermueesli", "birne", "bitburger", "blaetterteig", "blaubeeren",
   "borek", "bosna", "bounty", "bounty-mini", "bowl", "brathering", "brauner-zucker", "brokkoli",
   "brombeeren", "bueno-eis", "bueno-white", "bulgur", "bulgursalat", "burger-broetchen",
   "burger-king-crispy-chicken", "burger-king-pommes", "burger-mit-pommes", "butter-chicken",
   "caesar-salad", "caipirinha", "camembert", "campari", "captain-morgan", "caro-kaffee",
   "cashewkerne", "celebrations", "chai-latte", "champignons", "chardonnay", "cheesecake",
   "chia-broetchen", "chia-pudding", "chiasamen", "chili-cheese-nuggets", "choco-fresh",
   "chunky-flavour", "chupa-chups", "cig-koefte", "cini-minis", "clementine", "club-mate",
   "cola-zero", "cookie", "corned-beef", "corny-riegel", "corny-schoko", "corona-extra",
   "cream-cheese", "creme-brulee", "creme-fraiche", "creme-legere", "cremefine", "crepes-nutella",
   "croissant", "curry-king", "currywurst", "daim-mini", "dampfnudeln", "dattel", "desperados",
   "dextro-energy", "dinkelnudeln", "ditsch-brezel", "doener", "doener-box", "doener-teller",
   "dr-oetker-pizza", "dr-pepper", "duerrum", "duplo", "durum-kebab", "ebly", "edamame", "eigelb",
   "eiklar", "eiskaffee", "eiskonfekt", "eisschokolade", "eiweissbroetchen", "eiweissbrot",
   "erbsen", "erdbeeren", "erdnuss", "espresso", "essig", "falafel", "fanta", "feige",
   "ferrero-kuesschen", "ferrero-rocher", "feta-light", "fish-and-chips", "five-guys-burger",
   "flammkuchen", "fleisch", "flips", "fortimel", "french-toast", "fresubin",
   "fresubin-2kcal-drink", "fresubin-vanille", "fritt", "fruchtzwerge", "fruechtetee",
   "fruehlingszwiebeln", "fruehstueck", "fusilli", "gebackener-camembert", "gelatine", "gemuese",
   "germknoedel", "gewuerzgurken", "gin", "ginger-ale", "ginger-beer", "giotto", "glucose",
   "gluehwein", "goetterspeise", "goezleme", "griess", "griessnockerl", "grillgemuese",
   "grillkaese", "guinness", "gulaschsuppe", "gummibaerchen", "gustavo-gusto-margherita",
   "gustavo-gusto-pizza", "gyros", "hackfleisch-gemischt", "haehnchenbrust", "haehnchenkeule",
   "hafer", "haferbrei", "haferkeks", "hafermilch", "hamburger-menue", "hans-im-glueck-burger",
   "hanuta", "happy-hippo", "haribo", "haribo-roulette", "haselnuss", "hefekloesse", "heineken",
   "heinz-ketchup", "heisse-tasse", "hering", "honig", "honigmelone", "huettenkaese", "hugo",
   "hummus-teller", "iglo-backfisch", "ingwer", "instant-ramen", "jever-fun", "jim-beam", "kaese",
   "kaese-lauch-suppe", "kaesekuchen", "kaffee", "kaiserschmarrn", "kaki", "kaktus-eis",
   "karamalz", "karotten", "kartoffeln-mit-quark", "kaspressknoedel", "katjes", "kaviar", "kebab",
   "kebap-pizza", "ketchup", "kfc-hot-wings", "kfc-twister", "kichererbsen", "kidneybohnen",
   "kimbap", "kimchi", "kimchi-jjigae", "kinderriegel", "kiri", "kirschen", "kiwi", "klopfer",
   "knoblauch", "knodel", "knoppers", "knoppers-mini", "knoppers-nussriegel", "koefte", "kohl",
   "kokos", "kokosmilch", "kondensmilch", "kroketten", "kuenefe", "kuerbis", "kuerbiskernbrot",
   "l-osteria-pizza", "lachs", "lachsfilet", "lahmacun", "lava-cake", "leber", "leberkassemmel",
   "leibniz-butterkeks", "leicht-und-cross", "leinsamen", "lidl-ciabatta", "lidl-croissant",
   "lidl-donut", "lillet", "lillet-wild-berry", "lindor", "lindt-kugel", "linsen", "linsennudeln",
   "lion", "lion-mini", "litschi", "lolli", "lotus-keks", "macadamia", "macarons", "maggi",
   "magnum", "magnum-almond", "magnum-double-caramel", "magnum-eis", "magnum-mandel",
   "magnum-mini", "maltesers", "maltodextrin", "mandelhoernchen", "mandelmilch", "mandelmus",
   "mandeln", "mango", "mango-lassi", "mangold", "manner-schnitten", "manti", "maoam",
   "maoam-bloxx", "maoam-joystixx", "maoam-stripes", "maracuja", "maroni", "mars", "mars-eis",
   "mars-mini", "mars-riegel", "martini", "matcha", "matcha-latte", "mate-tee", "matjes-broetchen",
   "maxi-king", "mayo", "mc-frappe", "mc-toast", "medjool-datteln", "mentos", "merci-riegel",
   "mie-nudeln", "mikado", "milchpulver", "milchschnitte", "milka-noisette", "milka-schokolade",
   "milky-way", "mineralwasser", "mini-croissant", "mini-milky-way", "miso", "mochi", "mon-cheri",
   "monte", "mr-tom", "muellermilch", "muesli", "muscheln", "nektarine", "nesquik", "neuburger",
   "nic-nacs", "nippon", "nogger-eis", "nordsee-backfisch-baguette", "nougat", "nougat-bits",
   "nuii-eis", "nussschnecke", "nutella", "nutella-b-ready", "nutella-biscuits", "nuts", "obatzda",
   "oel-spray", "okroschka", "oliven", "olivenoel", "omelett", "orange", "oreo", "oreo-donut",
   "ovomaltine", "pak-choi", "panettone", "panna-cotta", "papaya", "paprika", "pecorino", "penne",
   "pepsi-max", "pflaume", "pflaumenkuchen", "philadelphia", "philadelphia-light", "physalis",
   "piccolinis", "pickup", "pide", "pinsa", "pistazien", "pita", "pizza-kebab", "pizza-tonno",
   "plant-based-nuggets-burger-king", "pogaca", "poke-bowl", "pombaeren", "pommes-currywurst",
   "pommes-mayo", "pop-tarts", "popcorn-kino", "porree", "praline", "pringles", "protein-wrap",
   "proteinriegel", "proteinshake", "puderzucker", "quark", "raclette", "raclette-kaese", "radler",
   "raeucherlachs", "raffaello", "rahmsauce", "rama", "rama-cremefine", "ravioli-maggi", "reis",
   "remoulade", "rettich", "rhabarber", "rib-eye-steak", "riesen", "rindfleisch", "rippchen",
   "risotto", "ristorante-pizza", "ritter-sport", "ritter-sport-mini", "roestzwiebeln",
   "rote-bete", "rote-bohnen", "rote-linsen", "rotkaeppchen-fruchtsecco", "rumpsteak",
   "sandwich-eis", "sashimi", "sauerbraten", "schlemmerfilet", "schmand", "schogetten",
   "schoko-bons", "schoko-reiswaffeln", "schokolade-zartbitter", "schokomuesli", "schokoriegel",
   "schwarzer-tee", "schweinefilet", "schweinegulasch", "seitan", "semmelknoedel", "sesam",
   "shakshuka", "simit", "skittles", "smarties", "smirnoff-ice", "smoothie-bowl", "snickers-crisp",
   "snickers-eis", "softeis", "sojasauce", "somersby", "sonnenblumenkerne", "sour-cream",
   "spaghetti", "spareribs", "spekulatius", "spezi", "spiegelei", "spinat", "spirulina",
   "split-eis", "sprite-zero", "stella-artois", "stollen", "stracciatella-eis", "strammer-max",
   "subway-cookie", "subway-wrap", "sucuk", "suesskartoffeln", "tassimo-milka", "tempeh",
   "tikka-masala", "tintenfisch", "toffifee", "tom-kha-gai", "tomate", "tomatenmark", "tonic",
   "topfen", "traubenzucker", "tuc", "tuc-cracker", "tuc-kekse", "twister-eis", "twix",
   "ueberraschungsei", "uncle-bens-reis", "vanillezucker", "vapiano", "vegetarischer-doener",
   "vollkorn-croissant", "vollkornbrot", "wachteleier", "walnuesse", "walnussbroetchen", "wasa",
   "wassermelone", "waterdrop", "wein-rot", "weisse-bohnen", "weisser-reis", "weizenmehl",
   "wonderwaffel", "wurst", "wurstsalat", "yfood", "yogurette", "yum-yum", "zimt", "zitroneneis",
   "zitronensaft", "zucchini", "zucker", "zwiebel", "zwiebelkuchen",
]);
// </AUSSTEHEND>

const alle = alleLebensmittel();
const seiten = new Map(alle.map(({ slug, food }) => [slug, food]));
const umgestellt = alle.filter(({ slug }) => !OFFEN.has(slug) && !AUSSTEHEND.has(slug));

const istFdc = (food) => typeof food.source === "string" && food.source.startsWith("USDA FoodData Central");
const istRezept = (food) => istFdc(food) && (food.rezept != null || food.source.includes("Rezeptrechnung"));
const istHersteller = (food) => typeof food.source === "string" && food.source.startsWith("Herstellerangabe");

function passt(seite, fdc, rundung) {
  return Math.abs(seite - fdc) <= Math.max(0.05 * Math.abs(fdc), rundung);
}
const eineStelle = (x) => Math.round(x * 10) / 10;

test("OFFEN und AUSSTEHEND nennen nur vorhandene Seiten, keine in beiden", () => {
  for (const slug of [...OFFEN, ...AUSSTEHEND]) assert.ok(seiten.has(slug), slug + " gibt es nicht");
  assert.deepEqual([...OFFEN].filter((s) => AUSSTEHEND.has(s)), []);
});

test("jede umgestellte Seite hat ein source-Feld, die offenen keines", () => {
  const ohne = umgestellt.filter(({ food }) => typeof food.source !== "string" || food.source.trim() === "").map(({ slug }) => slug);
  assert.deepEqual(ohne, []);
  const offenMitQuelle = [...OFFEN].filter((s) => seiten.get(s).source != null);
  assert.deepEqual(offenMitQuelle, []);
  assert.ok(umgestellt.length >= 420, "nur " + umgestellt.length + " Seiten umgestellt");
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
    if (!AUSSTEHEND.has(slug)) {
      const b = o.fiber_per_100g;
      if (e.ballaststoffe == null ? !(b === null || b === 0) : b == null || !passt(b, e.ballaststoffe, 0.1)) {
        abweichungen.push(slug + ": Ballaststoffe " + b + " statt " + e.ballaststoffe + " (FDC " + e.id + ")");
      }
    }
    geprueft++;
  }
  assert.deepEqual(abweichungen, []);
  assert.ok(geprueft >= 590, "nur " + geprueft + " Seiten geprüft");
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
  assert.ok(geprueft >= 2500, "nur " + geprueft + " Varianten geprüft");
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
