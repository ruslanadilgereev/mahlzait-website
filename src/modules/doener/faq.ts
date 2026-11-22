import {
  auswahl as mit,
  bigMac,
  bigMacKcal,
  bigMacProtein,
  portion,
  STANDARD,
  zutaten,
  zutatKcal,
} from "./rezepte";

// Häufige Fragen zum Döner-Kalorien-Rechner. Sichtbare FAQ und FAQPage-Schema
// nutzen dieselbe Liste, die Zahlen kommen aus der Rezeptrechnung.
const standard = portion(STANDARD);
const haehnchen = portion(mit("classic", "haehnchen"));
const lamm = portion(mit("classic", "lamm"));
const dueruem = portion(mit("dueruem", "kalb"));
const salatteller = portion(mit("salatteller", "kalb"));
const salattellerHaehnchen = portion(mit("salatteller", "haehnchen"));
const box = portion(mit("box", "kalb"));
const brot = zutatKcal("fladenbrot", 120);
const yufka = zutatKcal("yufka", 117);
const pommes = zutatKcal("pommes", 154);
const brotEiweiss = Math.round((zutaten.fladenbrot.protein * 120) / 100);

export const faq: { q: string; a: string }[] = [
  {
    q: "Wie viele Kalorien hat ein normaler Döner?",
    a: `Ein klassischer Döner Kebab im Fladenbrot mit Kalb- oder Rindfleisch hat in unserer Rezeptrechnung ${standard.kcal} kcal bei ${standard.gramm} g: 120 g Fladenbrot, 130 g Fleisch, 70 g Salat und 30 g Joghurtsoße. Mit Hähnchen sind es ${haehnchen.kcal} kcal, mit Lamm ${lamm.kcal} kcal.`,
  },
  {
    q: "Wie viele Kalorien hat ein Dürüm?",
    a: `Ein Dürüm mit Kalb- oder Rindfleisch hat ${dueruem.kcal} kcal bei ${dueruem.gramm} g. Der Yufka-Fladen (117 g) bringt ${yufka} kcal, etwas mehr als 120 g Fladenbrot mit ${brot} kcal.`,
  },
  {
    q: "Was hat weniger Kalorien: Döner oder Dürüm?",
    a: `Der Döner, aber nur knapp: ${standard.kcal} gegenüber ${dueruem.kcal} kcal bei gleicher Füllung. Entscheidender als die Hülle sind Fleischsorte und Soße.`,
  },
  {
    q: "Wie viel Eiweiß hat ein Döner?",
    a: `${standard.protein} g mit Kalb- oder Rindfleisch, ${haehnchen.protein} g mit Hähnchen. Den größten Teil liefern die 130 g Fleisch, ${brotEiweiss} g kommen aus dem Fladenbrot.`,
  },
  {
    q: "Hat ein Döner mehr Kalorien als ein Big Mac?",
    a: `Ja. Ein Big Mac hat laut USDA FoodData Central ${bigMacKcal} kcal (US-Rezeptur, ${bigMac.gramm} g), ein Döner mit Kalb- oder Rindfleisch ${standard.kcal} kcal. Der Döner liefert dafür ${standard.protein} g Eiweiß statt ${bigMacProtein} g und mehr Gemüse.`,
  },
  {
    q: "Was ist die kalorienärmste Döner-Variante?",
    a: `Der Döner-Teller mit Salat, ohne Brot, Reis und Pommes: ${salatteller.kcal} kcal mit Kalb- oder Rindfleisch und ${salattellerHaehnchen.kcal} kcal mit Hähnchen, jeweils mit Joghurtsoße und mindestens ${salattellerHaehnchen.protein} g Eiweiß.`,
  },
  {
    q: "Wie viele Kalorien hat eine Döner-Box?",
    a: `${box.kcal} kcal für ${box.gramm} g mit Kalb- oder Rindfleisch und Joghurtsoße. Die 154 g Pommes bringen allein ${pommes} kcal, deshalb ist die Box die schwerste Variante.`,
  },
];
