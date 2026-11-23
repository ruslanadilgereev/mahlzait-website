import { portion, STANDARD } from "../doener/rezepte.ts";
import {
  auswahl,
  belag,
  berechne,
  ganzeKcal,
  gerundet,
  groessen,
  PIZZA_GRAMM,
  pizzaGramm,
  sorte,
  sorten,
  stueckKcal,
  STUECK_GRAMM,
  tiefkuehl,
  zahl,
  zutatKcal,
  zutaten,
} from "./rechnung.ts";

// Häufige Fragen zum Pizza-Kalorien-Rechner. Sichtbare FAQ und FAQPage-Schema
// nutzen dieselbe Liste, die Zahlen kommen aus der Rechnung in rechnung.ts.
const name = (id: string) => sorte(id).name;
const nachStueck = [...sorten].sort(
  (a, b) => stueckKcal(a.id) - stueckKcal(b.id) || a.name.localeCompare(b.name),
);
const leichteste = nachStueck[0];
const schwerste = nachStueck[nachStueck.length - 1];
const stueckG = Math.round(STUECK_GRAMM);

const margherita = sorte("margherita").je100g;
// großes Pizzeria-Stück der Seite pizza-margherita: 140 g
const pizzeriaStueck = Math.round((margherita.kcal * 140) / 100);

const halbe = gerundet(berechne(auswahl("margherita", "medium", "classic", [], 4)).gegessen);
const zweiStuecke = gerundet(berechne(auswahl("margherita", "medium", "classic", [], 2)).gegessen);
const halbeDuenn = gerundet(berechne(auswahl("margherita", "medium", "thin", [], 4)).gegessen);
const duennJeStueck = stueckKcal("margherita") - Math.round(berechne(auswahl("margherita", "medium", "thin")).stueck.kcal);
const speck = belag("bacon");
const extraKaese = belag("extra-cheese");

const doener = portion(STANDARD);
// so viele Stücke Margherita haben etwa so viele Kalorien wie ein Döner
const stueckeWieDoener = Math.round(
  doener.kcal / berechne(auswahl("margherita")).stueck.kcal,
);
const wieDoener = gerundet(
  berechne(auswahl("margherita", "medium", "classic", [], stueckeWieDoener)).gegessen,
);

const tkMargherita = tiefkuehl[0];
const tkSalami = tiefkuehl[1];
const gross = groessen.find((g) => g.id === "large")!;
const familie = groessen.find((g) => g.id === "family")!;
const groessenText = groessen
  .filter((g) => g.id !== "medium")
  .map(
    (g) =>
      `${g.durchmesser} cm ${zahl(Math.round(pizzaGramm(g.id)))} g (${g.stuecke} Stücke à ${Math.round(pizzaGramm(g.id) / g.stuecke)} g)`,
  )
  .join(", ");

const nachGanz = [...sorten].sort((a, b) => ganzeKcal(a.id) - ganzeKcal(b.id));

export const faq: { q: string; a: string }[] = [
  {
    q: "Wie viele Kalorien hat ein Stück Pizza?",
    a: `Ein Stück, also ein Achtel einer 30-cm-Pizza (${stueckG} g), hat je nach Sorte ${stueckKcal(leichteste.id)} bis ${stueckKcal(schwerste.id)} kcal: Margherita ${stueckKcal("margherita")}, Salami ${stueckKcal("salami")}, Quattro Formaggi ${stueckKcal("quattro-formaggi")} kcal. Ein großes Stück aus der Pizzeria mit 140 g hat als Margherita ${pizzeriaStueck} kcal.`,
  },
  {
    q: "Wie viel wiegt ein Stück Pizza?",
    a: `Wir rechnen mit ${PIZZA_GRAMM} g für eine Pizza mit 30 cm, wie auf unserer Seite Pizza. Ein Achtel davon wiegt ${stueckG} g. Größere Pizzen wiegen im Verhältnis der Fläche mehr: ${groessenText}. Ein anderer Boden und Extra-Beläge ändern das Gewicht, der Rechner zeigt es mit.`,
  },
  {
    q: "Wie viele Kalorien hat eine ganze Pizza?",
    a: `Eine Pizza mit 30 cm und ${PIZZA_GRAMM} g hat je nach Sorte ${ganzeKcal(nachGanz[0].id)} bis ${ganzeKcal(nachGanz[nachGanz.length - 1].id)} kcal: Margherita ${ganzeKcal("margherita")}, Salami ${ganzeKcal("salami")}, Hawaii ${ganzeKcal("hawaii")} kcal. Eine große Margherita (${gross.durchmesser} cm, ${zahl(Math.round(pizzaGramm(gross.id)))} g) hat ${zahl(ganzeKcal("margherita", gross.id))} kcal, eine Familienpizza (${familie.durchmesser} cm, ${zahl(Math.round(pizzaGramm(familie.id)))} g) ${zahl(ganzeKcal("margherita", familie.id))} kcal.`,
  },
  {
    q: "Woher stammen die Werte im Pizza-Rechner?",
    a: `Die Werte je 100 g kommen von unseren Lebensmittelseiten zu jeder Sorte, die auf USDA FoodData Central (FDC) beruhen, etwa Margherita mit ${margherita.kcal} kcal je 100 g (FDC ${zutaten.kaesepizza.fdcId}). Prosciutto, Capricciosa und BBQ Chicken haben keine eigene Seite, für sie rechnen wir ein Rezept aus FDC-Zutaten. Boden und Beläge zählen in Gramm mit ihren FDC-Werten, zum Beispiel ${extraKaese.gramm} g Mozzarella für extra Käse mit ${zutatKcal(extraKaese.zutat, extraKaese.gramm)} kcal je 30-cm-Pizza.`,
  },
  {
    q: "Welche Pizza hat am wenigsten Kalorien?",
    a: `Bei gleichem Gewicht die Sorten mit viel Gemüse oder Obst, denn Gemüse und Obst haben je 100 g weniger Kalorien als Käse und Teig: Ein Stück ${name(nachStueck[0].id)} hat ${stueckKcal(nachStueck[0].id)} kcal, ${name(nachStueck[1].id)} ${stueckKcal(nachStueck[1].id)} und ${name(nachStueck[2].id)} ${stueckKcal(nachStueck[2].id)} kcal, Margherita ${stueckKcal("margherita")} kcal. Am meisten hat ${name(schwerste.id)} mit ${stueckKcal(schwerste.id)} kcal je Stück. Ein dünner Boden spart je Stück weitere ${duennJeStueck} kcal.`,
  },
  {
    q: "Ist Pizza gut zum Abnehmen?",
    a: `Pizza passt in eine Diät, wenn du die Portion kontrollierst: Zwei Stücke Margherita (${zweiStuecke.gramm} g) haben ${zweiStuecke.kcal} kcal, eine halbe 30-cm-Pizza ${halbe.kcal} kcal, mit dünnem Boden ${halbeDuenn.kcal} kcal. Pilze oder Zwiebeln bringen kaum Kalorien dazu, ${speck.gramm} g Speck dagegen ${zutatKcal(speck.zutat, speck.gramm)} kcal.`,
  },
  {
    q: "Hat Tiefkühlpizza weniger Kalorien?",
    a: `Je 100 g kaum: Eine TK-Pizza Margherita hat ${tkMargherita.kcalJe100g} kcal je 100 g, die Pizzeria-Pizza ${margherita.kcal} kcal. Die ganze TK-Pizza (${tkMargherita.gramm} g) hat ${tkMargherita.kcal} kcal, weil sie leichter ist als unsere 30-cm-Pizza mit ${PIZZA_GRAMM} g (${ganzeKcal("margherita")} kcal). Eine TK-Pizza Salami (${tkSalami.gramm} g) hat ${tkSalami.kcal} kcal.`,
  },
  {
    q: "Was ist kalorienärmer: Pizza oder Döner?",
    a: `Ein Döner (${doener.kcal} kcal) hat weniger Kalorien als eine ganze Pizza Margherita mit 30 cm (${ganzeKcal("margherita")} kcal), aber etwa so viele wie ${stueckeWieDoener} Stücke (${wieDoener.kcal} kcal). Der Döner liefert mehr Eiweiß (${doener.protein} statt ${wieDoener.protein} g), die Pizza mehr Kohlenhydrate (${wieDoener.kh} statt ${doener.kh} g).`,
  },
];
