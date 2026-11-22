// Döner-Rezeptrechnung: Jede Variante setzt sich aus Einzelzutaten mit festen
// Grammangaben zusammen. Alle Nährwerte je 100 g stammen aus USDA FoodData
// Central (FDC), gelesen über die FDC-API am 22.11.2026. Für Döner selbst führt
// FDC keinen Eintrag. Die Grammangaben sind unsere Annahmen für eine übliche
// Imbissportion; wo FDC eine passende Portionsangabe hat, ist sie übernommen.
// Seite: /doener-kalorien-rechner/, Food-Seiten unter /kalorien/ nutzen dieselben
// Werte (geprüft in test/doener-kalorien.test.mjs).

export const FDC_STAND = "22.11.2026";

export interface Zutat {
  name: string;
  fdcId: number;
  fdcName: string;
  datentyp: "SR Legacy" | "Survey (FNDDS)" | "Branded";
  // je 100 g; Kohlenhydrate wie in FDC "by difference"
  kcal: number;
  protein: number;
  kh: number;
  fett: number;
  // null: FDC nennt für diesen Eintrag keinen Wert
  ballaststoffe: number | null;
}

export const zutaten: Record<string, Zutat> = {
  fladenbrot: {
    name: "Fladenbrot",
    fdcId: 174915,
    fdcName: "Bread, pita, white, enriched",
    datentyp: "SR Legacy",
    kcal: 275,
    protein: 9.1,
    kh: 55.7,
    fett: 1.2,
    ballaststoffe: 2.2,
  },
  yufka: {
    name: "Yufka (Weizenfladen)",
    fdcId: 175037,
    fdcName: "Tortillas, ready-to-bake or -fry, flour, refrigerated",
    datentyp: "SR Legacy",
    kcal: 306,
    protein: 8.2,
    kh: 49.38,
    fett: 7.99,
    ballaststoffe: 3.5,
  },
  reis: {
    name: "Reis (Pilav)",
    fdcId: 2709077,
    fdcName: "Rice pilaf",
    datentyp: "Survey (FNDDS)",
    kcal: 137,
    protein: 3.29,
    kh: 24.1,
    fett: 3.03,
    ballaststoffe: 0.4,
  },
  pommes: {
    name: "Pommes frites",
    fdcId: 170698,
    fdcName: "Fast foods, potato, french fried in vegetable oil",
    datentyp: "SR Legacy",
    kcal: 312,
    protein: 3.43,
    kh: 41.44,
    fett: 14.73,
    ballaststoffe: 3.8,
  },
  eisberg: {
    name: "Eisbergsalat",
    fdcId: 169248,
    fdcName: "Lettuce, iceberg (includes crisphead types), raw",
    datentyp: "SR Legacy",
    kcal: 14,
    protein: 0.9,
    kh: 2.97,
    fett: 0.14,
    ballaststoffe: 1.2,
  },
  tomate: {
    name: "Tomate",
    fdcId: 170457,
    fdcName: "Tomatoes, red, ripe, raw, year round average",
    datentyp: "SR Legacy",
    kcal: 18,
    protein: 0.88,
    kh: 3.89,
    fett: 0.2,
    ballaststoffe: 1.2,
  },
  rotkohl: {
    name: "Rotkohl",
    fdcId: 169977,
    fdcName: "Cabbage, red, raw",
    datentyp: "SR Legacy",
    kcal: 31,
    protein: 1.43,
    kh: 7.37,
    fett: 0.16,
    ballaststoffe: 2.1,
  },
  gurke: {
    name: "Gurke",
    fdcId: 168409,
    fdcName: "Cucumber, with peel, raw",
    datentyp: "SR Legacy",
    kcal: 15,
    protein: 0.65,
    kh: 3.63,
    fett: 0.11,
    ballaststoffe: 0.5,
  },
  zwiebel: {
    name: "Zwiebel",
    fdcId: 170000,
    fdcName: "Onions, raw",
    datentyp: "SR Legacy",
    kcal: 40,
    protein: 1.1,
    kh: 9.34,
    fett: 0.1,
    ballaststoffe: 1.7,
  },
  rinderhack: {
    name: "Rinderhack (85 % mager, gegrillt)",
    fdcId: 174032,
    fdcName: "Beef, ground, 85% lean meat / 15% fat, patty, cooked, broiled",
    datentyp: "SR Legacy",
    kcal: 250,
    protein: 25.93,
    kh: 0,
    fett: 15.41,
    ballaststoffe: 0,
  },
  haehnchen: {
    name: "Hähnchenschenkel (ohne Haut, gebraten)",
    fdcId: 172388,
    fdcName: "Chicken, broilers or fryers, thigh, meat only, cooked, roasted",
    datentyp: "SR Legacy",
    kcal: 179,
    protein: 24.76,
    kh: 0,
    fett: 8.15,
    ballaststoffe: 0,
  },
  lammhack: {
    name: "Lammhack (gegrillt)",
    fdcId: 172544,
    fdcName: "Lamb, ground, cooked, broiled",
    datentyp: "SR Legacy",
    kcal: 283,
    protein: 24.75,
    kh: 0,
    fett: 19.65,
    ballaststoffe: 0,
  },
  falafel: {
    name: "Falafel",
    fdcId: 172455,
    fdcName: "Falafel, home-prepared",
    datentyp: "SR Legacy",
    kcal: 333,
    protein: 13.31,
    kh: 31.84,
    fett: 17.8,
    ballaststoffe: null,
  },
  tzatziki: {
    name: "Tzatziki",
    fdcId: 2705448,
    fdcName: "Tzatziki dip",
    datentyp: "Survey (FNDDS)",
    kcal: 91,
    protein: 5.22,
    kh: 4.1,
    fett: 6,
    ballaststoffe: 0.2,
  },
  joghurt: {
    name: "Joghurt (3,5 % Fett)",
    fdcId: 171284,
    fdcName: "Yogurt, plain, whole milk",
    datentyp: "SR Legacy",
    kcal: 61,
    protein: 3.47,
    kh: 4.66,
    fett: 3.25,
    ballaststoffe: 0,
  },
  mayonnaise: {
    name: "Mayonnaise",
    fdcId: 171009,
    fdcName: "Salad dressing, mayonnaise, regular",
    datentyp: "SR Legacy",
    kcal: 680,
    protein: 0.96,
    kh: 0.57,
    fett: 74.85,
    ballaststoffe: 0,
  },
  knoblauch: {
    name: "Knoblauch",
    fdcId: 169230,
    fdcName: "Garlic, raw",
    datentyp: "SR Legacy",
    kcal: 149,
    protein: 6.36,
    kh: 33.06,
    fett: 0.5,
    ballaststoffe: 2.1,
  },
  petersilie: {
    name: "Petersilie",
    fdcId: 170416,
    fdcName: "Parsley, fresh",
    datentyp: "SR Legacy",
    kcal: 36,
    protein: 2.97,
    kh: 6.33,
    fett: 0.79,
    ballaststoffe: 3.3,
  },
  cocktailsosse: {
    name: "Thousand-Island-Dressing",
    fdcId: 171402,
    fdcName: "Salad dressing, thousand island, commercial, regular",
    datentyp: "SR Legacy",
    kcal: 379,
    protein: 1.09,
    kh: 14.64,
    fett: 35.06,
    ballaststoffe: 0.8,
  },
  sriracha: {
    name: "Chilisoße (Sriracha)",
    fdcId: 171186,
    fdcName: "Sauce, hot chile, sriracha",
    datentyp: "SR Legacy",
    kcal: 93,
    protein: 1.93,
    kh: 19.16,
    fett: 0.93,
    ballaststoffe: 2.2,
  },
  gouda: {
    name: "Gouda",
    fdcId: 171241,
    fdcName: "Cheese, gouda",
    datentyp: "SR Legacy",
    kcal: 356,
    protein: 24.94,
    kh: 2.22,
    fett: 27.44,
    ballaststoffe: 0,
  },
  feta: {
    name: "Feta (Schafskäse)",
    fdcId: 173420,
    fdcName: "Cheese, feta",
    datentyp: "SR Legacy",
    kcal: 265,
    protein: 14.21,
    kh: 3.88,
    fett: 21.49,
    ballaststoffe: 0,
  },
  halloumi: {
    name: "Halloumi",
    fdcId: 2472184,
    fdcName: "HALLOUMI CHEESE, HALLOUMI",
    datentyp: "Branded",
    kcal: 321,
    protein: 21.43,
    kh: 3.57,
    fett: 25,
    ballaststoffe: 0,
  },
  tomatenmark: {
    name: "Tomatenmark",
    fdcId: 170459,
    fdcName: "Tomato products, canned, paste, without salt added",
    datentyp: "SR Legacy",
    kcal: 82,
    protein: 4.32,
    kh: 18.91,
    fett: 0.47,
    ballaststoffe: 4.1,
  },
  paprika: {
    name: "Paprika (rot)",
    fdcId: 170108,
    fdcName: "Peppers, sweet, red, raw",
    datentyp: "SR Legacy",
    kcal: 26,
    protein: 0.99,
    kh: 6.03,
    fett: 0.3,
    ballaststoffe: 2.1,
  },
};

// Vergleichswert für den Hinweis auf der Seite: mageres Kalbshack statt des
// fetteren Rinderhacks, mit dem wir Kalb-/Rind-Dönerfleisch rechnen.
export const kalbshackMager = {
  fdcId: 175291,
  fdcName: "Veal, ground, cooked, broiled",
  datentyp: "SR Legacy",
  kcal: 172,
};

// Vergleichswert, kein Döner-Bestandteil: Big Mac laut FDC (US-Rezeptur),
// 1 Stück = 219 g laut FDC-Portionsangabe.
export const bigMac = {
  fdcId: 170720,
  fdcName: "McDONALD'S, BIG MAC",
  datentyp: "SR Legacy",
  gramm: 219,
  kcal: 257,
  protein: 11.82,
};
export const bigMacKcal = Math.round((bigMac.kcal * bigMac.gramm) / 100);
export const bigMacProtein = Math.round((bigMac.protein * bigMac.gramm) / 100);

export interface Bestandteil {
  zutat: string;
  gramm: number;
}

export interface Komponente {
  label: string;
  gramm: number;
  teile: Bestandteil[];
}

const einzeln = (label: string, zutat: string, gramm: number): Komponente => ({
  label,
  gramm,
  teile: [{ zutat, gramm }],
});

// Salat je 100 g
export const salatMischung: Bestandteil[] = [
  { zutat: "eisberg", gramm: 40 },
  { zutat: "tomate", gramm: 25 },
  { zutat: "rotkohl", gramm: 15 },
  { zutat: "gurke", gramm: 10 },
  { zutat: "zwiebel", gramm: 10 },
];

const salat = (gramm: number): Komponente => ({
  label: "Salat",
  gramm,
  teile: salatMischung.map((b) => ({
    zutat: b.zutat,
    gramm: (b.gramm * gramm) / 100,
  })),
});

// 1 Lahmacun: Teig (gerechnet als Fladenbrot) mit Hackfleischbelag
export const lahmacunRezept: Bestandteil[] = [
  { zutat: "fladenbrot", gramm: 100 },
  { zutat: "rinderhack", gramm: 25 },
  { zutat: "tomatenmark", gramm: 10 },
  { zutat: "zwiebel", gramm: 10 },
  { zutat: "paprika", gramm: 5 },
];

export interface DoenerArt {
  id: string;
  name: string;
  icon: string;
  description: string;
  basis: Komponente[];
  // fest vorgegebene Füllung, sonst die gewählte Fleischsorte
  fuellung?: string;
  imRechner: boolean;
}

export const arten: DoenerArt[] = [
  {
    id: "classic",
    name: "Döner Kebab (Fladenbrot)",
    icon: "🥙",
    description: "Klassischer Döner im Fladenbrot mit Salat",
    basis: [einzeln("Fladenbrot", "fladenbrot", 120), salat(70)],
    imRechner: true,
  },
  {
    id: "dueruem",
    name: "Dürüm Döner",
    icon: "🌯",
    description: "Döner im dünnen Yufka-Teigfladen",
    basis: [einzeln("Yufka", "yufka", 117), salat(70)],
    imRechner: true,
  },
  {
    id: "teller",
    name: "Döner Teller",
    icon: "🍽️",
    description: "Döner mit Reis und Salat auf dem Teller",
    basis: [einzeln("Reis", "reis", 206), salat(100)],
    imRechner: true,
  },
  {
    id: "box",
    name: "Döner Box / Pomm-Döner",
    icon: "📦",
    description: "Pommes mit Dönerfleisch und Sauce",
    basis: [einzeln("Pommes", "pommes", 154)],
    imRechner: true,
  },
  {
    id: "lahmacun",
    name: "Lahmacun mit Döner",
    icon: "🫓",
    description: "Türkische Pizza mit Dönerfleisch",
    basis: [
      { label: "Lahmacun", gramm: 150, teile: lahmacunRezept },
      salat(50),
    ],
    imRechner: true,
  },
  {
    id: "pide",
    name: "Pide mit Döner",
    icon: "🥖",
    description: "Türkisches Fladenbrot gefüllt mit Döner",
    basis: [einzeln("Pide", "fladenbrot", 150), salat(50)],
    imRechner: true,
  },
  {
    id: "vegetarisch",
    name: "Vegetarischer Döner / Falafel",
    icon: "🧆",
    description: "Mit Falafel statt Fleisch",
    basis: [einzeln("Fladenbrot", "fladenbrot", 120), salat(70)],
    fuellung: "falafel",
    imRechner: true,
  },
  // nur für Tabelle und Food-Seiten
  {
    id: "salatteller",
    name: "Döner-Teller mit Salat (ohne Brot)",
    icon: "🥗",
    description: "Fleisch auf Salat",
    basis: [salat(150)],
    imRechner: false,
  },
  {
    id: "boxReis",
    name: "Döner Box mit Reis",
    icon: "📦",
    description: "Reis mit Dönerfleisch und Sauce",
    basis: [einzeln("Reis", "reis", 206)],
    imRechner: false,
  },
  {
    id: "tellerPommes",
    name: "Döner Teller mit Pommes",
    icon: "🍽️",
    description: "Döner mit Pommes und Salat",
    basis: [einzeln("Pommes", "pommes", 154), salat(100)],
    imRechner: false,
  },
];

export interface Fuellung {
  id: string;
  name: string;
  icon: string;
  gramm: number;
  teile: Bestandteil[];
  imRechner: boolean;
}

export const fuellungen: Fuellung[] = [
  {
    id: "kalb",
    name: "Kalb-/Rindfleisch",
    icon: "🥩",
    gramm: 130,
    teile: [{ zutat: "rinderhack", gramm: 130 }],
    imRechner: true,
  },
  {
    id: "haehnchen",
    name: "Hähnchenfleisch",
    icon: "🍗",
    gramm: 130,
    teile: [{ zutat: "haehnchen", gramm: 130 }],
    imRechner: true,
  },
  {
    id: "gemischt",
    name: "Gemischtes Fleisch",
    icon: "🍖",
    gramm: 130,
    teile: [
      { zutat: "rinderhack", gramm: 65 },
      { zutat: "haehnchen", gramm: 65 },
    ],
    imRechner: true,
  },
  {
    id: "lamm",
    name: "Lammfleisch",
    icon: "🐑",
    gramm: 130,
    teile: [{ zutat: "lammhack", gramm: 130 }],
    imRechner: true,
  },
  // 5 Falafel à 17 g (FDC-Portionsangabe "1 patty")
  {
    id: "falafel",
    name: "Falafel",
    icon: "🧆",
    gramm: 85,
    teile: [{ zutat: "falafel", gramm: 85 }],
    imRechner: false,
  },
  {
    id: "halloumi",
    name: "Halloumi",
    icon: "🧀",
    gramm: 100,
    teile: [{ zutat: "halloumi", gramm: 100 }],
    imRechner: false,
  },
];

export interface Zugabe {
  id: string;
  name: string;
  icon: string;
  gramm: number;
  teile: Bestandteil[];
}

// Je Soße 30 g, das sind 2 Esslöffel (FDC-Portionsangabe für Tzatziki: 1 EL = 15 g).
export const saucen: Zugabe[] = [
  {
    id: "joghurt",
    name: "Joghurt-Sauce (Cacık)",
    icon: "🥛",
    gramm: 30,
    teile: [{ zutat: "tzatziki", gramm: 30 }],
  },
  {
    id: "knoblauch",
    name: "Knoblauch-Sauce",
    icon: "🧄",
    gramm: 30,
    teile: [
      { zutat: "joghurt", gramm: 14 },
      { zutat: "mayonnaise", gramm: 14 },
      { zutat: "knoblauch", gramm: 2 },
    ],
  },
  {
    id: "cocktail",
    name: "Cocktail-Sauce",
    icon: "🍹",
    gramm: 30,
    teile: [{ zutat: "cocktailsosse", gramm: 30 }],
  },
  {
    id: "scharf",
    name: "Scharfe Sauce",
    icon: "🌶️",
    gramm: 30,
    teile: [{ zutat: "sriracha", gramm: 30 }],
  },
  {
    id: "krauter",
    name: "Kräuter-Sauce",
    icon: "🌿",
    gramm: 30,
    teile: [
      { zutat: "joghurt", gramm: 20 },
      { zutat: "mayonnaise", gramm: 8 },
      { zutat: "petersilie", gramm: 2 },
    ],
  },
  { id: "ohne", name: "Ohne Sauce", icon: "❌", gramm: 0, teile: [] },
];

export const extras: Zugabe[] = [
  {
    id: "kaese",
    name: "Käse",
    icon: "🧀",
    gramm: 30,
    teile: [{ zutat: "gouda", gramm: 30 }],
  },
  // kleine Portion laut FDC-Portionsangabe ("1 serving small" = 71 g)
  {
    id: "pommes",
    name: "Extra Pommes",
    icon: "🍟",
    gramm: 71,
    teile: [{ zutat: "pommes", gramm: 71 }],
  },
  {
    id: "halloumi",
    name: "Halloumi",
    icon: "🧀",
    gramm: 50,
    teile: [{ zutat: "halloumi", gramm: 50 }],
  },
  {
    id: "schafkaese",
    name: "Schafskäse/Feta",
    icon: "🧀",
    gramm: 30,
    teile: [{ zutat: "feta", gramm: 30 }],
  },
];

export interface Summe {
  gramm: number;
  kcal: number;
  protein: number;
  kh: number;
  fett: number;
  ballaststoffe: number;
}

const leer: Summe = {
  gramm: 0,
  kcal: 0,
  protein: 0,
  kh: 0,
  fett: 0,
  ballaststoffe: 0,
};

export function summe(teile: Bestandteil[], faktor = 1): Summe {
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
      ballaststoffe: s.ballaststoffe + ((z.ballaststoffe ?? 0) * g) / 100,
    };
  }, leer);
}

function plus(...teile: Summe[]): Summe {
  return teile.reduce(
    (s, t) => ({
      gramm: s.gramm + t.gramm,
      kcal: s.kcal + t.kcal,
      protein: s.protein + t.protein,
      kh: s.kh + t.kh,
      fett: s.fett + t.fett,
      ballaststoffe: s.ballaststoffe + t.ballaststoffe,
    }),
    leer,
  );
}

function finde<T extends { id: string }>(liste: T[], id: string): T {
  const treffer = liste.find((x) => x.id === id);
  if (!treffer) throw new Error("Unbekannte Auswahl: " + id);
  return treffer;
}

export const art = (id: string) => finde(arten, id);
export const fuellung = (id: string) => finde(fuellungen, id);
export const sauce = (id: string) => finde(saucen, id);
export const extra = (id: string) => finde(extras, id);

export interface Auswahl {
  art: string;
  // Fleischsorte; bei Arten mit fester Füllung (vegetarisch) ignoriert
  fuellung?: string;
  saucen: string[];
  extras: string[];
  // Portionsgröße in Prozent; skaliert Brot bzw. Beilage, Salat und Füllung,
  // nicht die Soßen und Extras (feste Mengen)
  portion: number;
}

export interface Ergebnis {
  gesamt: Summe;
  basis: Summe;
  fuellung: Summe;
  sauce: Summe;
  extras: Summe;
  fuellungName: string;
}

export function berechne(a: Auswahl): Ergebnis {
  const gewaehlt = art(a.art);
  const fuellungId = gewaehlt.fuellung ?? a.fuellung;
  const faktor = a.portion / 100;
  const basis = summe(
    gewaehlt.basis.flatMap((k) => k.teile),
    faktor,
  );
  const f = fuellungId ? fuellung(fuellungId) : null;
  const fuellungSumme = f ? summe(f.teile, faktor) : leer;
  const sauceSumme = summe(a.saucen.flatMap((id) => sauce(id).teile));
  const extrasSumme = summe(a.extras.flatMap((id) => extra(id).teile));
  return {
    gesamt: plus(basis, fuellungSumme, sauceSumme, extrasSumme),
    basis,
    fuellung: fuellungSumme,
    sauce: sauceSumme,
    extras: extrasSumme,
    fuellungName: f ? f.name : "",
  };
}

// Gerundete Werte einer Portion, wie sie Tabelle und Food-Seiten zeigen
export interface Portion {
  gramm: number;
  kcal: number;
  protein: number;
  kh: number;
  fett: number;
}

export function portion(a: Auswahl): Portion {
  const g = berechne(a).gesamt;
  return {
    gramm: Math.round(g.gramm),
    kcal: Math.round(g.kcal),
    protein: Math.round(g.protein),
    kh: Math.round(g.kh),
    fett: Math.round(g.fett),
  };
}

const eineStelle = (wert: number) => Math.round(wert * 10) / 10;

// Zahl im deutschen Format, z. B. 1.031 oder 13,4
export const zahl = (wert: number) => wert.toLocaleString("de-DE");

// Werte je 100 g einer Portion
export function je100g(a: Auswahl) {
  const g = berechne(a).gesamt;
  const f = 100 / g.gramm;
  return {
    kcal: Math.round(g.kcal * f),
    protein: eineStelle(g.protein * f),
    kh: eineStelle(g.kh * f),
    fett: eineStelle(g.fett * f),
    ballaststoffe: eineStelle(g.ballaststoffe * f),
  };
}

// kcal einer Soße oder eines Extras (feste Menge)
export const sauceKcal = (id: string) =>
  Math.round(summe(sauce(id).teile).kcal);
export const extraKcal = (id: string) =>
  Math.round(summe(extra(id).teile).kcal);
export const zutatKcal = (id: string, gramm: number) =>
  Math.round((zutaten[id].kcal * gramm) / 100);

const mit = (
  artId: string,
  fuellungId: string | undefined,
  saucenIds: string[] = ["joghurt"],
  extraIds: string[] = [],
  prozent = 100,
): Auswahl => ({
  art: artId,
  fuellung: fuellungId,
  saucen: saucenIds,
  extras: extraIds,
  portion: prozent,
});

// Standard: Döner Kebab im Fladenbrot mit Kalb-/Rindfleisch und Joghurtsoße
export const STANDARD = mit("classic", "kalb");
export const auswahl = mit;

export const tabelle: { name: string; auswahl: Auswahl }[] = [
  { name: "Döner Kebab, Kalb/Rind", auswahl: STANDARD },
  { name: "Döner Kebab, Hähnchen", auswahl: mit("classic", "haehnchen") },
  { name: "Döner Kebab, Lamm", auswahl: mit("classic", "lamm") },
  { name: "Dürüm (Yufka), Kalb/Rind", auswahl: mit("dueruem", "kalb") },
  {
    name: "Döner mit Käse",
    auswahl: mit("classic", "kalb", ["joghurt"], ["kaese"]),
  },
  { name: "Döner-Box mit Pommes", auswahl: mit("box", "kalb") },
  { name: "Döner-Teller mit Reis", auswahl: mit("teller", "kalb") },
  {
    name: "Döner-Teller mit Salat, ohne Brot",
    auswahl: mit("salatteller", "kalb"),
  },
  { name: "Lahmacun mit Dönerfleisch", auswahl: mit("lahmacun", "kalb") },
  {
    name: "Falafel-Döner (vegetarisch)",
    auswahl: mit("vegetarisch", undefined),
  },
  {
    name: "Kinder-Döner (Portionsgröße 60 %)",
    auswahl: mit("classic", "kalb", ["joghurt"], [], 60),
  },
];
