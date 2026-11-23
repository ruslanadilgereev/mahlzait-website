// Pizza-Rechnung in Gramm. Eine Pizza mit 30 cm Durchmesser wiegt 350 g wie
// auf der Lebensmittelseite pizza ("1 Pizza"), ein Stück ist ein Achtel davon,
// also 43,75 g. Jede Sorte rechnet mit ihren Werten je 100 g: von ihrer
// Lebensmittelseite (src/data/foods, Werte aus USDA FoodData Central) oder,
// wo es keine Seite gibt, aus einem Rezept mit FDC-Zutaten. Größe, Boden und
// Beläge ändern das Gewicht, jede Zutat zählt mit ihren FDC-Werten je 100 g.
// Seite: /pizza-kalorien-rechner/, geprüft in test/pizza-rechner.test.mjs.

// Werte je 100 g; Kohlenhydrate wie in FDC "by difference"
export interface Naehrwerte {
  kcal: number;
  protein: number;
  kh: number;
  fett: number;
  ballaststoffe: number;
}

export interface Zutat extends Naehrwerte {
  name: string;
  fdcId: number;
  fdcName: string;
  datentyp: "SR Legacy" | "Survey (FNDDS)";
}

// FDC-Werte je 100 g aus den Massendaten (SR Legacy 2018-04, FNDDS 2024-10-31),
// dieselben wie in test/fdc-referenz.json
export const zutaten: Record<string, Zutat> = {
  kaesepizza: {
    name: "Käsepizza aus der Pizzeria",
    fdcId: 2708614,
    fdcName: "Pizza, cheese, from restaurant or fast food, NS as to type of crust",
    datentyp: "Survey (FNDDS)",
    kcal: 266,
    protein: 11.39,
    kh: 33.33,
    fett: 9.69,
    ballaststoffe: 2.3,
  },
  teig: {
    name: "Pizzateig, gerechnet wie Weißbrot",
    fdcId: 172675,
    fdcName: "Bread, french or vienna (includes sourdough)",
    datentyp: "SR Legacy",
    kcal: 272,
    protein: 10.75,
    kh: 51.88,
    fett: 2.42,
    ballaststoffe: 2.2,
  },
  kaesepizzaDuenn: {
    name: "Käsepizza mit dünnem Boden",
    fdcId: 2708615,
    fdcName: "Pizza, cheese, from restaurant or fast food, thin crust",
    datentyp: "Survey (FNDDS)",
    kcal: 266,
    protein: 11.39,
    kh: 33.33,
    fett: 9.69,
    ballaststoffe: 2.3,
  },
  vollkornpizza: {
    name: "Käsepizza mit dünnem Vollkornboden",
    fdcId: 2708687,
    fdcName: "Pizza, cheese, whole wheat thin crust",
    datentyp: "Survey (FNDDS)",
    kcal: 267,
    protein: 11.77,
    kh: 28.62,
    fett: 12.38,
    ballaststoffe: 3.5,
  },
  mozzarella: {
    name: "Mozzarella",
    fdcId: 170845,
    fdcName: "Cheese, mozzarella, whole milk",
    datentyp: "SR Legacy",
    kcal: 299,
    protein: 22.17,
    kh: 2.4,
    fett: 22.14,
    ballaststoffe: 0,
  },
  kochschinken: {
    name: "Kochschinken",
    fdcId: 173863,
    fdcName: "Ham, sliced, pre-packaged, deli meat (96%fat free, water added)",
    datentyp: "SR Legacy",
    kcal: 107,
    protein: 16.85,
    kh: 0.7,
    fett: 4.04,
    ballaststoffe: 0,
  },
  pepperoni: {
    name: "Pepperoni-Salami",
    fdcId: 174575,
    fdcName: "Pepperoni, beef and pork, sliced",
    datentyp: "SR Legacy",
    kcal: 504,
    protein: 19.25,
    kh: 1.18,
    fett: 46.28,
    ballaststoffe: 0,
  },
  speck: {
    name: "Speck, roh",
    fdcId: 168277,
    fdcName: "Pork, cured, bacon, unprepared",
    datentyp: "SR Legacy",
    kcal: 393,
    protein: 13.66,
    kh: 0,
    fett: 37.13,
    ballaststoffe: 0,
  },
  haehnchen: {
    name: "Hähnchenbrust, gegart",
    fdcId: 171477,
    fdcName: "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
    datentyp: "SR Legacy",
    kcal: 165,
    protein: 31.02,
    kh: 0,
    fett: 3.57,
    ballaststoffe: 0,
  },
  sardellen: {
    name: "Sardellen in Öl, abgetropft",
    fdcId: 174183,
    fdcName: "Fish, anchovy, european, canned in oil, drained solids",
    datentyp: "SR Legacy",
    kcal: 210,
    protein: 28.89,
    kh: 0,
    fett: 9.71,
    ballaststoffe: 0,
  },
  champignons: {
    name: "Champignons",
    fdcId: 169251,
    fdcName: "Mushrooms, white, raw",
    datentyp: "SR Legacy",
    kcal: 22,
    protein: 3.09,
    kh: 3.26,
    fett: 0.34,
    ballaststoffe: 1,
  },
  artischocken: {
    name: "Artischockenherzen, gegart",
    fdcId: 168386,
    fdcName: "Artichokes, (globe or french), cooked, boiled, drained, without salt",
    datentyp: "SR Legacy",
    kcal: 53,
    protein: 2.89,
    kh: 11.95,
    fett: 0.34,
    ballaststoffe: 5.7,
  },
  oliven: {
    name: "Schwarze Oliven",
    fdcId: 169094,
    fdcName: "Olives, ripe, canned (small-extra large)",
    datentyp: "SR Legacy",
    kcal: 116,
    protein: 0.84,
    kh: 6.04,
    fett: 10.9,
    ballaststoffe: 1.6,
  },
  zwiebel: {
    name: "Zwiebeln",
    fdcId: 170000,
    fdcName: "Onions, raw",
    datentyp: "SR Legacy",
    kcal: 40,
    protein: 1.1,
    kh: 9.34,
    fett: 0.1,
    ballaststoffe: 1.7,
  },
  jalapenos: {
    name: "Jalapeños, eingelegt",
    fdcId: 170080,
    fdcName: "Peppers, jalapeno, canned, solids and liquids",
    datentyp: "SR Legacy",
    kcal: 27,
    protein: 0.92,
    kh: 4.74,
    fett: 0.94,
    ballaststoffe: 2.6,
  },
  bbqSosse: {
    name: "BBQ-Soße",
    fdcId: 174523,
    fdcName: "Sauce, barbecue",
    datentyp: "SR Legacy",
    kcal: 172,
    protein: 0.82,
    kh: 40.77,
    fett: 0.63,
    ballaststoffe: 0.9,
  },
};

// Referenz: 30 cm, 350 g, 8 Stücke (Seite pizza, Variante "Pizza Margherita")
export const REFERENZ_CM = 30;
export const PIZZA_GRAMM = 350;
export const REFERENZ_STUECKE = 8;
export const STUECK_GRAMM = PIZZA_GRAMM / REFERENZ_STUECKE;

// FDC-Portionsangaben, aus denen die Grammzahlen für Boden und Teig folgen:
// "1 medium pizza (11-12" diameter)" der Käsepizza je Bodenart und das Gewicht
// je Quadratzoll ("1 surface inch") für die ganze Pizza und nur den Belag.
export const fdcPortionen = {
  mittlerePizza: {
    normal: { fdcId: 2708614, gramm: 691 },
    duenn: { fdcId: 2708615, gramm: 500 },
    dick: { fdcId: 2708617, gramm: 744 },
    kaeserand: { fdcId: 2708618, gramm: 800 },
  },
  quadratzoll: {
    pizza: { fdcId: 2708614, gramm: 6.2 },
    belag: { fdcId: 2705787, gramm: 2.1 },
  },
};

// Teig einer 30-cm-Pizza: alles außer dem Belag, (6,2 - 2,1) / 6,2 von 350 g
export const TEIG_GRAMM = 231;

export interface Bestandteil {
  zutat: string;
  // Gramm je 30-cm-Pizza; negativ: so viel weniger
  gramm: number;
}

export interface Sorte {
  id: string;
  name: string;
  icon: string;
  description: string;
  je100g: Naehrwerte;
  // Lebensmittelseite, von der die Werte je 100 g stammen
  seite?: string;
  // sonst Rezept aus FDC-Zutaten, Gramm je 350-g-Pizza
  rezept?: Bestandteil[];
}

export interface Menge extends Naehrwerte {
  gramm: number;
}

const nichts = (): Menge => ({
  gramm: 0,
  kcal: 0,
  protein: 0,
  kh: 0,
  fett: 0,
  ballaststoffe: 0,
});

export function summe(teile: Bestandteil[], faktor = 1): Menge {
  return teile.reduce((s, b) => {
    const z = zutaten[b.zutat];
    if (!z) throw new Error("Unbekannte Zutat: " + b.zutat);
    const g = b.gramm * faktor;
    return {
      gramm: s.gramm + g,
      kcal: s.kcal + (z.kcal * g) / 100,
      protein: s.protein + (z.protein * g) / 100,
      kh: s.kh + (z.kh * g) / 100,
      fett: s.fett + (z.fett * g) / 100,
      ballaststoffe: s.ballaststoffe + (z.ballaststoffe * g) / 100,
    };
  }, nichts());
}

function mal(m: Menge, faktor: number): Menge {
  return {
    gramm: m.gramm * faktor,
    kcal: m.kcal * faktor,
    protein: m.protein * faktor,
    kh: m.kh * faktor,
    fett: m.fett * faktor,
    ballaststoffe: m.ballaststoffe * faktor,
  };
}

function plus(a: Menge, b: Menge): Menge {
  return {
    gramm: a.gramm + b.gramm,
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    kh: a.kh + b.kh,
    fett: a.fett + b.fett,
    ballaststoffe: a.ballaststoffe + b.ballaststoffe,
  };
}

// Werte je 100 g eines Rezepts
function ausRezept(rezept: Bestandteil[]): Naehrwerte {
  const gramm = rezept.reduce((s, b) => s + b.gramm, 0);
  const s = summe(rezept);
  return {
    kcal: (s.kcal * 100) / gramm,
    protein: (s.protein * 100) / gramm,
    kh: (s.kh * 100) / gramm,
    fett: (s.fett * 100) / gramm,
    ballaststoffe: (s.ballaststoffe * 100) / gramm,
  };
}

const seite = (
  kcal: number,
  protein: number,
  kh: number,
  fett: number,
  ballaststoffe: number,
): Naehrwerte => ({ kcal, protein, kh, fett, ballaststoffe });

const rezept = {
  prosciutto: [
    { zutat: "kaesepizza", gramm: 300 },
    { zutat: "kochschinken", gramm: 50 },
  ],
  capricciosa: [
    { zutat: "kaesepizza", gramm: 260 },
    { zutat: "kochschinken", gramm: 30 },
    { zutat: "champignons", gramm: 25 },
    { zutat: "artischocken", gramm: 25 },
    { zutat: "oliven", gramm: 10 },
  ],
  bbqChicken: [
    { zutat: "kaesepizza", gramm: 270 },
    { zutat: "haehnchen", gramm: 50 },
    { zutat: "bbqSosse", gramm: 20 },
    { zutat: "zwiebel", gramm: 10 },
  ],
};

export const sorten: Sorte[] = [
  {
    id: "margherita",
    name: "Margherita",
    icon: "🍕",
    description: "Tomaten, Mozzarella, Basilikum",
    je100g: seite(266, 11.4, 33.3, 9.7, 2.3),
    seite: "pizza-margherita",
  },
  {
    id: "salami",
    name: "Salami",
    icon: "🍕",
    description: "Tomaten, Mozzarella, Salami",
    je100g: seite(282, 11.7, 32, 11.9, 2.3),
    seite: "pizza-salami",
  },
  {
    id: "prosciutto",
    name: "Prosciutto",
    icon: "🍕",
    description: "Tomaten, Mozzarella, Schinken",
    je100g: ausRezept(rezept.prosciutto),
    rezept: rezept.prosciutto,
  },
  {
    id: "tonno",
    name: "Tonno",
    icon: "🐟",
    description: "Tomaten, Mozzarella, Thunfisch, Zwiebeln",
    je100g: seite(258, 13.6, 29.2, 9.5, 2),
    seite: "pizza-tonno",
  },
  {
    id: "hawaii",
    name: "Hawaii",
    icon: "🍍",
    description: "Tomaten, Mozzarella, Schinken, Ananas",
    je100g: seite(227, 10.9, 27, 8.3, 1.8),
    seite: "pizza-hawaii",
  },
  {
    id: "quattro-formaggi",
    name: "Quattro Formaggi",
    icon: "🧀",
    description: "Vier verschiedene Käsesorten",
    je100g: seite(268, 12.1, 31.7, 10.3, 2.2),
    seite: "pizza-quattro-formaggi",
  },
  {
    id: "diavola",
    name: "Diavola",
    icon: "🌶️",
    description: "Tomaten, Mozzarella, scharfe Salami",
    je100g: seite(274, 12.3, 27.5, 12.7, 2.9),
    seite: "pizza-diavola",
  },
  {
    id: "capricciosa",
    name: "Capricciosa",
    icon: "🍄",
    description: "Schinken, Pilze, Artischocken, Oliven",
    je100g: ausRezept(rezept.capricciosa),
    rezept: rezept.capricciosa,
  },
  {
    id: "vegetariana",
    name: "Vegetariana",
    icon: "🥬",
    description: "Verschiedene Gemüsesorten",
    je100g: seite(234, 10, 29.9, 8.4, 2.2),
    seite: "pizza-vegetariana",
  },
  {
    id: "bbq-chicken",
    name: "BBQ Chicken",
    icon: "🍗",
    description: "BBQ-Sauce, Hähnchen, Zwiebeln",
    je100g: ausRezept(rezept.bbqChicken),
    rezept: rezept.bbqChicken,
  },
];

export interface Groesse {
  id: string;
  name: string;
  durchmesser: number;
  stuecke: number;
  icon: string;
}

export const groessen: Groesse[] = [
  { id: "small", name: "Klein", durchmesser: 26, stuecke: 6, icon: "🔵" },
  { id: "medium", name: "Normal", durchmesser: 30, stuecke: 8, icon: "🟢" },
  { id: "large", name: "Groß", durchmesser: 36, stuecke: 10, icon: "🟡" },
  { id: "family", name: "Familien", durchmesser: 45, stuecke: 12, icon: "🔴" },
];

export interface Boden {
  id: string;
  name: string;
  icon: string;
  teile: Bestandteil[];
}

// Gramm je 30-cm-Pizza. Dünn, dick und Käserand: Unterschied der mittleren
// FDC-Käsepizza zum normalen Boden (500, 744 und 800 statt 691 g), übertragen
// auf 350 g; beim dünnen und dicken Boden ist es Teig, beim Käserand Mozzarella.
// Vollkorn: Werte je 100 g der Käsepizza mit dünnem Vollkornboden statt mit
// dünnem Boden (FDC 2708687 gegen 2708615), auf das Gewicht der Pizza gerechnet:
// kcal praktisch gleich, mehr Ballaststoffe.
export const boeden: Boden[] = [
  { id: "classic", name: "Klassisch", icon: "🍞", teile: [] },
  {
    id: "thin",
    name: "Dünn/Knusprig",
    icon: "📄",
    teile: [{ zutat: "teig", gramm: -97 }],
  },
  {
    id: "thick",
    name: "Dick/Pfannenpizza",
    icon: "🥧",
    teile: [{ zutat: "teig", gramm: 27 }],
  },
  {
    id: "stuffed",
    name: "Käserand",
    icon: "🧀",
    teile: [{ zutat: "mozzarella", gramm: 55 }],
  },
  {
    id: "wholegrain",
    name: "Vollkorn",
    icon: "🌾",
    teile: [
      { zutat: "kaesepizzaDuenn", gramm: -PIZZA_GRAMM },
      { zutat: "vollkornpizza", gramm: PIZZA_GRAMM },
    ],
  },
];

export interface Belag {
  id: string;
  name: string;
  icon: string;
  zutat: string;
  // Gramm je 30-cm-Pizza
  gramm: number;
}

// Mengen sind unsere Annahmen für eine 30-cm-Pizza; Pepperoni 15 Scheiben und
// Sardellen 5 Stück nach den FDC-Portionsangaben (1 Scheibe 2 g, 1 Sardelle 4 g).
export const belaege: Belag[] = [
  { id: "extra-cheese", name: "Extra Käse", icon: "🧀", zutat: "mozzarella", gramm: 50 },
  { id: "pepperoni", name: "Pepperoni-Salami", icon: "🥓", zutat: "pepperoni", gramm: 30 },
  { id: "mushrooms", name: "Pilze", icon: "🍄", zutat: "champignons", gramm: 50 },
  { id: "olives", name: "Oliven", icon: "🫒", zutat: "oliven", gramm: 20 },
  { id: "onions", name: "Zwiebeln", icon: "🧅", zutat: "zwiebel", gramm: 30 },
  { id: "bacon", name: "Speck", icon: "🥓", zutat: "speck", gramm: 30 },
  { id: "jalapenos", name: "Jalapeños", icon: "🌶️", zutat: "jalapenos", gramm: 20 },
  { id: "anchovies", name: "Sardellen", icon: "🐟", zutat: "sardellen", gramm: 20 },
];

// Tiefkühlpizzen zum Vergleich, Varianten der Lebensmittelseiten
export const tiefkuehl = [
  {
    name: "Tiefkühlpizza Margherita",
    seite: "pizza-margherita",
    variante: "TK-Pizza Margherita",
    fdcId: 2708612,
    gramm: 300,
    kcal: 789,
    kcalJe100g: 263,
  },
  {
    name: "Tiefkühlpizza Salami",
    seite: "pizza-salami",
    variante: "TK-Pizza Salami (320g)",
    fdcId: 2708635,
    gramm: 320,
    kcal: 877,
    kcalJe100g: 274,
  },
];

function finde<T extends { id: string }>(liste: T[], id: string): T {
  const treffer = liste.find((x) => x.id === id);
  if (!treffer) throw new Error("Unbekannte Auswahl: " + id);
  return treffer;
}

export const sorte = (id: string) => finde(sorten, id);
export const groesse = (id: string) => finde(groessen, id);
export const boden = (id: string) => finde(boeden, id);
export const belag = (id: string) => finde(belaege, id);

// Gewicht wächst mit der Fläche: (Durchmesser / 30 cm)²
export const flaechenfaktor = (id: string) =>
  (groesse(id).durchmesser / REFERENZ_CM) ** 2;
export const pizzaGramm = (id: string) => PIZZA_GRAMM * flaechenfaktor(id);

export interface Auswahl {
  groesse: string;
  sorte: string;
  boden: string;
  belaege: string[];
  // gegessene Stücke, begrenzt auf 0 bis zur Stückzahl der Größe
  stuecke: number;
}

export interface Ergebnis {
  stueckzahl: number;
  stuecke: number;
  ganz: Menge;
  stueck: Menge;
  gegessen: Menge;
}

export function berechne(a: Auswahl): Ergebnis {
  const g = groesse(a.groesse);
  const f = flaechenfaktor(a.groesse);
  const s = sorte(a.sorte);
  const gramm = PIZZA_GRAMM * f;
  const grund: Menge = { ...mal({ gramm: 100, ...s.je100g }, gramm / 100) };
  const zuschlaege = summe(
    [
      ...boden(a.boden).teile,
      ...a.belaege.map((id) => {
        const b = belag(id);
        return { zutat: b.zutat, gramm: b.gramm };
      }),
    ],
    f,
  );
  const ganz = plus(grund, zuschlaege);
  const stuecke = Math.min(Math.max(a.stuecke, 0), g.stuecke);
  return {
    stueckzahl: g.stuecke,
    stuecke,
    ganz,
    stueck: mal(ganz, 1 / g.stuecke),
    gegessen: mal(ganz, stuecke / g.stuecke),
  };
}

// Gerundete Werte, wie sie die Seite zeigt (gerechnet wird ungerundet)
export function gerundet(m: Menge): Menge {
  return {
    gramm: Math.round(m.gramm),
    kcal: Math.round(m.kcal),
    protein: Math.round(m.protein),
    kh: Math.round(m.kh),
    fett: Math.round(m.fett),
    ballaststoffe: Math.round(m.ballaststoffe),
  };
}

export const auswahl = (
  sorteId: string,
  groesseId = "medium",
  bodenId = "classic",
  belagIds: string[] = [],
  stuecke = 1,
): Auswahl => ({
  sorte: sorteId,
  groesse: groesseId,
  boden: bodenId,
  belaege: belagIds,
  stuecke,
});

// kcal eines Stücks und der ganzen Pizza, klassischer Boden ohne Extras
export const stueckKcal = (sorteId: string, groesseId = "medium") =>
  Math.round(berechne(auswahl(sorteId, groesseId)).stueck.kcal);
export const ganzeKcal = (sorteId: string, groesseId = "medium") =>
  Math.round(berechne(auswahl(sorteId, groesseId)).ganz.kcal);

// Zuschlag eines Bodens oder Belags je Stück (kcal, ungerundet)
export const bodenJeStueck = (bodenId: string, groesseId = "medium") =>
  summe(boden(bodenId).teile, flaechenfaktor(groesseId)).kcal /
  groesse(groesseId).stuecke;
export const belagJeStueck = (belagId: string, groesseId = "medium") => {
  const b = belag(belagId);
  return (
    summe([{ zutat: b.zutat, gramm: b.gramm }], flaechenfaktor(groesseId)).kcal /
    groesse(groesseId).stuecke
  );
};

// kcal einer Zutatenmenge
export const zutatKcal = (id: string, gramm: number) =>
  Math.round((zutaten[id].kcal * gramm) / 100);

// Zahl im deutschen Format, z. B. 1.341 oder 43,75
export const zahl = (wert: number) => wert.toLocaleString("de-DE");
