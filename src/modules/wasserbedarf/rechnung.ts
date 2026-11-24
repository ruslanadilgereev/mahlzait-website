// Trinkmenge nach den Richtwerten der DGE für die Wasserzufuhr (Stand der Ableitung 2000,
// abgerufen am 24.11.2026): https://www.dge.de/wissenschaft/referenzwerte/wasser/
// Der Richtwert für Getränke gilt je Altersgruppe und hängt nicht vom Körpergewicht ab. Die
// 35 ml je kg (ab 51 Jahren 30 ml) aus derselben Tabelle gelten für Getränke und feste Nahrung
// zusammen und sind deshalb keine Trinkmenge.
// Mengen für Sport und Hitze gibt es nur, wo eine Quelle sie nennt, und nur für Erwachsene:
// - Sport: zusätzlich 0,5 bis 1,0 Liter Wasser pro Stunde, DGE-Flyer „Wasser trinken“ (2024)
// - Hitzewelle: etwa zwei bis drei Liter Flüssigkeit über den Tag, BIÖG (Stand Juli 2026)
// Beides zusammen nennt keine Quelle, deshalb lässt sich nur eines davon wählen.
// Seite: /wasserbedarf-rechner/, geprüft in test/wasserbedarf.test.mjs.

export interface Richtwert {
  /** Gruppe wie in der DGE-Tabelle */
  gruppe: string;
  /** ml pro Tag */
  getraenke: number;
  festeNahrung: number;
  oxidationswasser: number;
  gesamt: number;
  /** ml je kg Körpergewicht und Tag, Getränke und feste Nahrung zusammen */
  jeKg: number;
}

/** Altersgruppe mit Untergrenze in Jahren, sie reicht bis zur nächsten Gruppe. */
export interface Altersgruppe extends Richtwert {
  ab: number;
}

export const altersgruppen: Altersgruppe[] = [
  { gruppe: "1 bis unter 4 Jahre", ab: 1, getraenke: 820, festeNahrung: 350, oxidationswasser: 130, gesamt: 1300, jeKg: 95 },
  { gruppe: "4 bis unter 7 Jahre", ab: 4, getraenke: 940, festeNahrung: 480, oxidationswasser: 180, gesamt: 1600, jeKg: 75 },
  { gruppe: "7 bis unter 10 Jahre", ab: 7, getraenke: 970, festeNahrung: 600, oxidationswasser: 230, gesamt: 1800, jeKg: 60 },
  { gruppe: "10 bis unter 13 Jahre", ab: 10, getraenke: 1170, festeNahrung: 710, oxidationswasser: 270, gesamt: 2150, jeKg: 50 },
  { gruppe: "13 bis unter 15 Jahre", ab: 13, getraenke: 1330, festeNahrung: 810, oxidationswasser: 310, gesamt: 2450, jeKg: 40 },
  { gruppe: "15 bis unter 19 Jahre", ab: 15, getraenke: 1530, festeNahrung: 920, oxidationswasser: 350, gesamt: 2800, jeKg: 40 },
  { gruppe: "19 bis unter 25 Jahre", ab: 19, getraenke: 1470, festeNahrung: 890, oxidationswasser: 340, gesamt: 2700, jeKg: 35 },
  { gruppe: "25 bis unter 51 Jahre", ab: 25, getraenke: 1410, festeNahrung: 860, oxidationswasser: 330, gesamt: 2600, jeKg: 35 },
  { gruppe: "51 bis unter 65 Jahre", ab: 51, getraenke: 1230, festeNahrung: 740, oxidationswasser: 280, gesamt: 2250, jeKg: 30 },
  { gruppe: "65 Jahre und älter", ab: 65, getraenke: 1310, festeNahrung: 680, oxidationswasser: 260, gesamt: 2250, jeKg: 30 },
];
export const schwangere: Richtwert = { gruppe: "Schwangere", getraenke: 1470, festeNahrung: 890, oxidationswasser: 340, gesamt: 2700, jeKg: 35 };
export const stillende: Richtwert = { gruppe: "Stillende", getraenke: 1710, festeNahrung: 1000, oxidationswasser: 390, gesamt: 3100, jeKg: 45 };

/** Alle Zeilen der Tabelle auf der Seite. Säuglinge fehlen mit Absicht: Ihr Getränk ist Milch. */
export const richtwerte: Richtwert[] = [...altersgruppen, schwangere, stillende];

export type Lebenslage = "keine" | "schwanger" | "stillend";
export type Tag = "normal" | "sport1" | "sport2" | "hitze";

export const ALTER_MIN = 1;
export const ALTER_MAX = 100;
/** Schwangerschaft und Stillzeit fragt der Rechner erst ab der ersten Gruppe der Jugendlichen ab. */
export const LEBENSLAGE_AB = 15;
/** Die Quellen nennen Mengen für Sport und Hitze für Erwachsene. */
export const ERWACHSEN_AB = 18;

/** ml zusätzlich pro Stunde Sport oder körperlich anstrengender Arbeit */
export const SPORT_JE_STUNDE = { von: 500, bis: 1000 };
/** ml Getränke über den Tag während einer Hitzewelle */
export const HITZETAG = { von: 2000, bis: 3000 };

export function richtwert(alter: number, lebenslage: Lebenslage = "keine"): Richtwert {
  if (alter >= LEBENSLAGE_AB) {
    if (lebenslage === "schwanger") return schwangere;
    if (lebenslage === "stillend") return stillende;
  }
  return altersgruppen.filter((g) => alter >= g.ab).pop() ?? altersgruppen[0];
}

export interface Trinkmenge {
  alter: number;
  richtwert: Richtwert;
  /** gewählte Stunden Sport, bei Kindern und Jugendlichen immer 0 */
  stunden: number;
  hitze: boolean;
  /** Getränke in ml pro Tag; ohne Sport und Hitze sind von und bis gleich */
  von: number;
  bis: number;
}

export function trinkmenge(alter: number, lebenslage: Lebenslage = "keine", tag: Tag = "normal"): Trinkmenge {
  const r = richtwert(alter, lebenslage);
  const gewaehlt = alter >= ERWACHSEN_AB ? tag : "normal";
  if (gewaehlt === "hitze") {
    return { alter, richtwert: r, stunden: 0, hitze: true, ...HITZETAG };
  }
  const stunden = gewaehlt === "sport1" ? 1 : gewaehlt === "sport2" ? 2 : 0;
  return {
    alter,
    richtwert: r,
    stunden,
    hitze: false,
    von: r.getraenke + stunden * SPORT_JE_STUNDE.von,
    bis: r.getraenke + stunden * SPORT_JE_STUNDE.bis,
  };
}

/** Zahl in deutscher Schreibweise, zahl(1410) = "1.410", zahl(1.41, 1) = "1,4" */
export const zahl = (wert: number, stellen = 0) =>
  wert.toLocaleString("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });

/** "1.410" oder "1.910 bis 2.410", je nachdem ob von und bis gleich sind */
export function spanne(m: { von: number; bis: number }, format: (ml: number) => string = zahl): string {
  return m.von === m.bis ? format(m.von) : `${format(m.von)} bis ${format(m.bis)}`;
}

export const liter = (ml: number) => zahl(ml / 1000, 1);
/** volle Gläser mit 250 ml, die den Richtwert erreichen */
export const glaeser = (ml: number) => Math.ceil(ml / 250);
export const flaschen = (ml: number) => zahl(ml / 500, 1);
