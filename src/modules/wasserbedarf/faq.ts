import {
  ERWACHSEN_AB,
  HITZETAG,
  type Lebenslage,
  richtwert,
  schwangere,
  spanne,
  SPORT_JE_STUNDE,
  stillende,
  type Tag,
  type Trinkmenge,
  zahl,
} from "./rechnung.ts";

// Fragen, Beispiele, Ergebnistexte und Quellen für /wasserbedarf-rechner/. Sichtbare FAQ und
// FAQPage-Schema nutzen dieselbe Liste, die Zahlen der DGE-Tabelle kommen aus rechnung.ts.

/** Tag, an dem die Quellen gelesen wurden */
export const STAND = "24.11.2026";

const mittel = richtwert(40);
const aelter = richtwert(58);
const senioren = richtwert(70);

/** Beispiel für die 35 ml je kg: mit 65 kg sind das die Getränke und das Essen aus der Tabelle */
export const beispielKg = 65;

const halb = zahl(SPORT_JE_STUNDE.von / 1000, 1);
const ganz = zahl(SPORT_JE_STUNDE.bis / 1000, 1);

export const beispiele: { person: string; alter: number; lebenslage?: Lebenslage; tag?: Tag }[] = [
  { person: "40 Jahre, normaler Tag", alter: 40 },
  { person: "40 Jahre, 1 Stunde Sport", alter: 40, tag: "sport1" },
  { person: "40 Jahre, 2 Stunden Sport", alter: 40, tag: "sport2" },
  { person: "40 Jahre, Hitzetag", alter: 40, tag: "hitze" },
  { person: "58 Jahre, normaler Tag", alter: 58 },
  { person: "70 Jahre, normaler Tag", alter: 70 },
  { person: "30 Jahre, schwanger", alter: 30, lebenslage: "schwanger" },
  { person: "30 Jahre, stillend", alter: 30, lebenslage: "stillend" },
];

export const faq: { q: string; a: string }[] = [
  {
    q: "Wie viel Wasser sollte ich am Tag trinken?",
    a: `Die Deutsche Gesellschaft für Ernährung (DGE) nennt als Richtwert für Getränke ${zahl(mittel.getraenke)} ml pro Tag im Alter von ${mittel.gruppe.replace("Jahre", "Jahren")}, ${zahl(aelter.getraenke)} ml von ${aelter.gruppe.replace("Jahre", "Jahren")} und ${zahl(senioren.getraenke)} ml ab 65 Jahren. In ihren Ernährungsempfehlungen rät sie gesunden Erwachsenen von 18 bis 65 Jahren zu rund 1,5 Litern am Tag. Dazu kommt das Wasser aus dem Essen. Bei Sport, Hitze und manchen Erkrankungen brauchst du mehr.`,
  },
  {
    q: "Stimmt die Regel 35 ml pro kg Körpergewicht?",
    a: `Als Trinkmenge nicht. Die DGE nennt ${mittel.jeKg} ml pro kg Körpergewicht und Tag für 19 bis unter 51 Jahre und ${aelter.jeKg} ml ab 51 Jahren, aber für Getränke und feste Nahrung zusammen. Ein Beispiel: ${beispielKg} kg mal ${mittel.jeKg} ml sind ${zahl(beispielKg * mittel.jeKg)} ml, das entspricht in der DGE-Tabelle für ${mittel.gruppe} den ${zahl(mittel.getraenke)} ml aus Getränken und ${zahl(mittel.festeNahrung)} ml aus dem Essen. Einen Wert für Getränke pro kg nennt die DGE nicht, ihre Richtwerte für Getränke hängen vom Alter ab. Deshalb fragt der Rechner nicht nach dem Gewicht.`,
  },
  {
    q: "Wie viel mehr sollte ich bei Sport trinken?",
    a: `Bei Sport und körperlich anstrengender Arbeit können laut DGE zusätzlich ${halb} bis ${ganz} Liter Wasser pro Stunde nötig sein. Die Arbeitsgruppe Sporternährung der DGE rät, dem Durstgefühl zu vertrauen: Unter 30 bis 40 Minuten musst du währenddessen nichts trinken, bei längerer Belastung idealerweise höchstens 80 Prozent des Schweißverlusts. Bei mehr als 1,5 Stunden empfiehlt sie Getränke mit Kohlenhydraten und Natrium.`,
  },
  {
    q: "Wie viel sollte ich bei Hitze trinken?",
    a: `Während einer Hitzewelle rät das Bundesinstitut für Öffentliche Gesundheit (BIÖG) zu etwa ${HITZETAG.von / 1000} bis ${HITZETAG.bis / 1000} Litern Flüssigkeit über den Tag verteilt. Faustregel der DGE: tagsüber alle 1 bis 2 Stunden ein Glas Wasser mit 0,2 Litern, auch wenn du noch keinen Durst hast. Bei einer Erkrankung von Herz oder Nieren solltest du die Trinkmenge ärztlich besprechen.`,
  },
  {
    q: "Zählt Kaffee zur Flüssigkeitszufuhr?",
    a: "Ja. Kaffee sowie schwarzer und grüner Tee ohne Zucker können laut DGE wie Wasser der Flüssigkeitsbilanz zugezählt werden. Dass Kaffee dem Körper Flüssigkeit entzieht, ist laut DGE-Blog längst widerlegt. In erster Linie sind es aber Genussmittel und keine Durstlöscher, gegen 3 bis 4 Tassen am Tag spricht bei Erwachsenen laut DGE nichts.",
  },
  {
    q: "Kann ich zu viel Wasser trinken?",
    a: "Gesunde Menschen scheiden überschüssige Flüssigkeit laut DGE über die Nieren einfach wieder aus. Anders ist es bei langem Ausdauersport: Wer viel schwitzt und dabei große Mengen natriumarmer Getränke wie Leitungswasser trinkt, riskiert eine Hyponatriämie (weniger als 135 mmol Natrium pro Liter Plasma), die im schlimmsten Fall tödlich ist. Die Arbeitsgruppe Sporternährung der DGE rät deshalb, nicht über den Durst zu trinken. Manche Krankheiten, zum Beispiel Niereninsuffizienz oder schwere Herzinsuffizienz, erlauben nur eine begrenzte Flüssigkeitszufuhr, dann bestimmt die ärztliche Vorgabe die Menge.",
  },
  {
    q: "Woran erkenne ich, ob ich genug trinke?",
    a: "Am Urin und am Befinden. Heller Urin weist laut BIÖG auf einen ausgeglichenen Flüssigkeitshaushalt hin, dunkler kann ein Anzeichen für Flüssigkeitsmangel sein. Wer zu wenig trinkt, wird laut DGE schnell müde und kann sich schlecht konzentrieren. Kopfschmerzen, geringere körperliche Leistungsfähigkeit und Verstopfung können folgen. Weniger als 1 Liter am Tag reicht laut DGE nicht aus.",
  },
  {
    q: "Wie viel sollten ältere Menschen trinken?",
    a: `Ab 65 Jahren liegt der Richtwert der DGE bei ${zahl(senioren.getraenke)} ml Getränken am Tag, mit dem Wasser aus dem Essen und dem Stoffwechsel bei ${zahl(senioren.gesamt)} ml. Das DGE-Projekt Fit im Alter rät zu mindestens 1,3 Litern, besser 1,5 Litern. Das Durstgefühl lässt im Alter nach, und wer wenig isst, sollte mehr trinken.`,
  },
  {
    q: "Wie viel sollten Schwangere und Stillende trinken?",
    a: `Die DGE nennt für Schwangere ${zahl(schwangere.getraenke)} ml und für Stillende ${zahl(stillende.getraenke)} ml Getränke am Tag. Stillenden rät sie wegen des Flüssigkeitsverlusts durch die Muttermilch zum Beispiel zu einem Glas Wasser zu jeder Stillmahlzeit.`,
  },
];

/** Woraus sich das Ergebnis zusammensetzt */
export function grundlage({ richtwert: r, stunden, hitze }: Trinkmenge): string {
  const basis = `${zahl(r.getraenke)} ml`;
  if (hitze) {
    return `Empfehlung des Bundesinstituts für Öffentliche Gesundheit (BIÖG) für eine Hitzewelle. An einem normalen Tag liegt der Richtwert der DGE bei ${basis} (${r.gruppe}).`;
  }
  if (stunden > 0) {
    const zuschlag = spanne({ von: stunden * SPORT_JE_STUNDE.von, bis: stunden * SPORT_JE_STUNDE.bis });
    return `${basis} Richtwert der DGE (${r.gruppe}) plus ${zuschlag} ml für ${stunden} ${stunden === 1 ? "Stunde" : "Stunden"} Sport oder körperlich anstrengende Arbeit (DGE).`;
  }
  return `Richtwert der DGE für ${r.gruppe}.`;
}

/** Hinweis zum gewählten Tag oder die einfache Empfehlung der DGE neben dem Richtwert */
export function hinweis({ alter, richtwert: r, stunden, hitze }: Trinkmenge): string | null {
  if (hitze) {
    return "Sport ist hier nicht eingerechnet: Bei Hitze kannst du je nach Sportart bis zu 2,5 Liter pro Stunde verlieren (BIÖG). Bei einer Erkrankung von Herz oder Nieren die Trinkmenge bitte ärztlich besprechen.";
  }
  if (stunden > 0) {
    return `Wie viel du schwitzt, hängt von Person, Tempo und Temperatur ab. Die Arbeitsgruppe Sporternährung der DGE rät, nach Durst zu trinken${stunden > 1 ? ", bei mehr als 1,5 Stunden am besten Getränke mit Kohlenhydraten und Natrium" : ""}.`;
  }
  if (r === schwangere || r === stillende || alter < ERWACHSEN_AB) return null;
  return alter >= 65
    ? "Einfach zu merken: Im Projekt Fit im Alter rät die DGE zu mindestens 1,3 Litern, besser 1,5 Litern am Tag."
    : "Einfach zu merken: Die DGE empfiehlt gesunden Erwachsenen rund 1,5 Liter am Tag.";
}

const DGE = "https://www.dge.de";

export const links = {
  richtwerte: DGE + "/wissenschaft/referenzwerte/wasser/",
  fragenRichtwert: DGE + "/gesunde-ernaehrung/faq/referenzwerte/",
  wasserTrinken: DGE + "/gesunde-ernaehrung/gut-essen-und-trinken/dge-empfehlungen/am-besten-wasser-trinken/",
  getraenke: DGE + "/gesunde-ernaehrung/gut-essen-und-trinken/dge-ernaehrungskreis/getraenke/",
  flyer: "https://www.dge-medienservice.de/media/productattach/1/2/123054_2024_flyer_wasser_trinken_241205_web.pdf",
  hitzeBlog: DGE + "/blog/2025/essen-und-trinken-bei-hitze/",
  sport: DGE + "/fileadmin/dok/gesunde-ernaehrung/gezielte-ernaehrung/sportler-innen/EU03_2019_M152-M159.pdf",
  fitImAlter: "https://www.fitimalter-dge.de/mehr-wissen/trinken-im-alter",
  schwangerschaft: DGE + "/gesunde-ernaehrung/gezielte-ernaehrung/ernaehrung-in-schwangerschaft-und-stillzeit/",
  hitze: "https://www.klima-mensch-gesundheit.de/hitzeschutz/empfehlungen-bei-hitze/",
  abnehmen: "https://doi.org/10.3390/nu16070963",
};

export const quellen: { label: string; url: string }[] = [
  { label: "DGE: Referenzwerte für die Nährstoffzufuhr, Wasser (Stand der Ableitung 2000)", url: links.richtwerte },
  { label: "DGE: Fragen und Antworten zu den Referenzwerten, Frage 9 (Wann gibt es einen Richtwert?)", url: links.fragenRichtwert },
  { label: "DGE: Am besten Wasser trinken (Empfehlung für gesunde Erwachsene von 18 bis 65 Jahren)", url: links.wasserTrinken },
  { label: "DGE: Ernährungskreis, Getränke", url: links.getraenke },
  { label: "DGE: Flyer „Wasser trinken, fit bleiben“, 5. Auflage 2024 (PDF)", url: links.flyer },
  { label: "DGE-Blog: Essen und Trinken bei Hitze (2025, zuerst in DGEwissen, Juli 2023)", url: links.hitzeBlog },
  { label: "DGE, Arbeitsgruppe Sporternährung: Flüssigkeitsmanagement im Sport, Ernährungs Umschau 3/2019 (PDF)", url: links.sport },
  { label: "DGE, Projekt Fit im Alter: Trinken im Alter", url: links.fitImAlter },
  { label: "DGE: Ernährung in Schwangerschaft und Stillzeit", url: links.schwangerschaft },
  { label: "BIÖG, klima-mensch-gesundheit.de: Empfehlungen bei Hitze (Stand Juli 2026)", url: links.hitze },
  { label: "Chen QY, Khil J, Keum N: Water Intake and Adiposity Outcomes among Overweight and Obese Individuals. Nutrients 2024;16(7):963", url: links.abnehmen },
];
