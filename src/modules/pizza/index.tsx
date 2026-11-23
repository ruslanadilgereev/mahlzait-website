import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import {
  auswahl,
  belaege,
  belag,
  belagJeStueck,
  berechne,
  bodenJeStueck,
  boeden,
  fdcPortionen,
  flaechenfaktor,
  ganzeKcal,
  gerundet,
  groesse,
  groessen,
  PIZZA_GRAMM,
  pizzaGramm,
  sorte,
  sorten,
  stueckKcal,
  summe,
  STUECK_GRAMM,
  TEIG_GRAMM,
  tiefkuehl,
  zahl,
  zutatKcal,
  zutaten,
  type Auswahl,
  type Ergebnis,
} from "./rechnung";
import { faq } from "./faq";

import AuthorByline from "@components/AuthorByline";
interface Props {
  config: TemplateConfig;
}

// Zahlen für die Texte, alle aus der Rechnung (30 cm, klassischer Boden)
const margherita = sorte("margherita").je100g;
const nachStueck = [...sorten].sort(
  (a, b) => stueckKcal(a.id) - stueckKcal(b.id) || a.name.localeCompare(b.name),
);
const ganzKcal = (sorteId: string, bodenId: string) =>
  berechne(auswahl(sorteId, "medium", bodenId)).ganz.kcal;
const duennSpart = Math.round(ganzKcal("margherita", "classic") - ganzKcal("margherita", "thin"));
const duennGegenDick = Math.round(ganzKcal("margherita", "thick") - ganzKcal("margherita", "thin"));
const duennTeig = -boeden.find((b) => b.id === "thin")!.teile[0].gramm;
const dickTeig = boeden.find((b) => b.id === "thick")!.teile[0].gramm;
const kaeserand = boeden.find((b) => b.id === "stuffed")!.teile[0];
const halbeMargherita = Math.round(berechne(auswahl("margherita", "medium", "classic", [], 4)).gegessen.kcal);
const extraKaese = belag("extra-cheese");
const pepperoni = belag("pepperoni");
const speck = belag("bacon");
const pilze = belag("mushrooms");
const zwiebeln = belag("onions");
const jeStueck = (id: string) => Math.round(belagJeStueck(id));
const klein = groesse("small");
const gross = groesse("large");
const fdc = (id: string) => `FDC ${zutaten[id].fdcId}`;
const vorzeichen = (wert: number) => (wert > 0 ? "+" : "") + zahl(wert);
const jeStueckText = (wert: number) => (wert === 0 ? "±0" : vorzeichen(wert));

function PizzaKalorienRechnerPage({ config }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>("medium");
  const [selectedPizza, setSelectedPizza] = useState<string>("margherita");
  const [selectedCrust, setSelectedCrust] = useState<string>("classic");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [slicesToEat, setSlicesToEat] = useState<number>(2);
  const [result, setResult] = useState<{ auswahl: Auswahl; ergebnis: Ergebnis } | null>(null);

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((t) => t !== toppingId) : [...prev, toppingId]
    );
  };

  const selectedSizeData = groesse(selectedSize);

  // Eine kleinere Pizza hat weniger Stücke: die Auswahl bleibt in ihrem Bereich.
  const selectSize = (sizeId: string) => {
    setSelectedSize(sizeId);
    setSlicesToEat((n) => Math.min(n, groesse(sizeId).stuecke));
  };

  const calculateCalories = () => {
    const a: Auswahl = {
      groesse: selectedSize,
      sorte: selectedPizza,
      boden: selectedCrust,
      belaege: selectedToppings,
      stuecke: slicesToEat,
    };
    setResult({ auswahl: a, ergebnis: berechne(a) });
  };

  const getCalorieComparison = (calories: number) => {
    return [
      { name: "Döner Kebabs", amount: Math.round((calories / 696) * 10) / 10, emoji: "🥙" },
      { name: "Big Macs", amount: Math.round((calories / 563) * 10) / 10, emoji: "🍔" },
      { name: "Tafeln Schoko", amount: Math.round((calories / 535) * 10) / 10, emoji: "🍫" },
      { name: "Min. Joggen", amount: Math.round(calories / 10), emoji: "🏃" },
      { name: "Min. Spazieren", amount: Math.round(calories / 4), emoji: "🚶" },
    ];
  };

  const gegessen = result ? gerundet(result.ergebnis.gegessen) : null;
  const stueck = result ? gerundet(result.ergebnis.stueck) : null;
  const ganz = result ? gerundet(result.ergebnis.ganz) : null;
  const resultPizza = result ? sorte(result.auswahl.sorte) : null;

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Pizza-Kalorien-Rechner", url: "/pizza-kalorien-rechner/" },
        ]} />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              🍕 Pizza Kalorien Rechner
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Wie viele Kalorien hat deine Pizza? Berechne die Nährwerte für Margherita, Salami,
              Hawaii und mehr, mit verschiedenen Größen, Teigarten und Extra-Belägen. Gerechnet
              wird in Gramm, mit Werten aus USDA FoodData Central.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-6">Kalorien berechnen</h2>

              {/* Size Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">1. Pizza-Größe wählen</span>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                  {groessen.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => selectSize(size.id)}
                      className={`btn btn-lg h-auto py-4 flex-col ${
                        selectedSize === size.id ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      <span className="text-2xl">{size.icon}</span>
                      <span className="font-semibold">{size.name}</span>
                      <span className="text-xs opacity-70">
                        {`${size.durchmesser} cm, ${zahl(Math.round(pizzaGramm(size.id)))} g`}
                      </span>
                      <span className="text-xs opacity-70">
                        {`${size.stuecke}\u00a0Stücke à ${Math.round(pizzaGramm(size.id) / size.stuecke)}\u00a0g`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pizza Type Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">2. Pizza-Sorte wählen</span>
                <div className="grid gap-3 md:grid-cols-2">
                  {sorten.map((pizza) => (
                    <button
                      key={pizza.id}
                      onClick={() => setSelectedPizza(pizza.id)}
                      className={`btn btn-lg justify-start gap-3 h-auto py-3 ${
                        selectedPizza === pizza.id ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      <span className="text-2xl">{pizza.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{pizza.name}</div>
                        <div className="text-xs opacity-70 font-normal">{pizza.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crust Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">3. Teigart wählen</span>
                <div className="flex flex-wrap gap-2">
                  {boeden.map((crust) => (
                    <button
                      key={crust.id}
                      onClick={() => setSelectedCrust(crust.id)}
                      className={`btn ${
                        selectedCrust === crust.id ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {`${crust.icon} ${crust.name} `}
                      {crust.teile.length > 0 && (
                        <span className="text-xs opacity-70">
                          {`(${jeStueckText(Math.round(bodenJeStueck(crust.id, selectedSize)))} kcal/Stück)`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toppings */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">4. Extra-Beläge (optional)</span>
                <div className="flex flex-wrap gap-2">
                  {belaege.map((topping) => (
                    <button
                      key={topping.id}
                      onClick={() => toggleTopping(topping.id)}
                      className={`btn btn-sm ${
                        selectedToppings.includes(topping.id) ? "btn-secondary" : "btn-outline"
                      }`}
                    >
                      {`${topping.icon} ${topping.name} ${Math.round(topping.gramm * flaechenfaktor(selectedSize))} g (+${Math.round(belagJeStueck(topping.id, selectedSize))} kcal/Stück)`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slices to eat */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">5. Wie viele Stücke isst du?</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">{slicesToEat}</span>
                    <span className="opacity-70">von {selectedSizeData.stuecke}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max={selectedSizeData.stuecke}
                  step="1"
                  value={slicesToEat}
                  onChange={(e) => setSlicesToEat(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>1 Stück</span>
                  <span>Halbe Pizza</span>
                  <span>Ganze Pizza</span>
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateCalories}>
                🍕 Kalorien berechnen
              </button>

              {/* Results */}
              {result && gegessen && stueck && ganz && resultPizza && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">{zahl(gegessen.kcal)} kcal</div>
                    <div className="text-lg opacity-70 mt-2">
                      {result.ergebnis.stuecke} Stück {resultPizza.name} ({zahl(gegessen.gramm)} g)
                      {result.ergebnis.stuecke === result.ergebnis.stueckzahl && " (ganze Pizza)"}
                    </div>
                    <div className="text-sm opacity-50 mt-1">
                      {stueck.kcal} kcal pro Stück ({stueck.gramm} g)
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="card bg-green-100 dark:bg-green-900">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {gegessen.protein}g
                        </div>
                        <div className="text-sm opacity-70">Protein</div>
                      </div>
                    </div>
                    <div className="card bg-yellow-100 dark:bg-yellow-900">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                          {gegessen.kh}g
                        </div>
                        <div className="text-sm opacity-70">Kohlenhydrate</div>
                      </div>
                    </div>
                    <div className="card bg-red-100 dark:bg-red-900">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {gegessen.fett}g
                        </div>
                        <div className="text-sm opacity-70">Fett</div>
                      </div>
                    </div>
                  </div>

                  {/* Whole Pizza Info */}
                  <div className="card bg-base-200 mt-4">
                    <div className="card-body py-4">
                      <h3 className="font-semibold mb-3">Pizza-Übersicht</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Kalorien pro Stück:</span>
                          <span className="font-mono">{stueck.kcal} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gewicht pro Stück:</span>
                          <span className="font-mono">{stueck.gramm} g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Anzahl Stücke gegessen:</span>
                          <span className="font-mono">
                            {result.ergebnis.stuecke} von {result.ergebnis.stueckzahl}
                          </span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="flex justify-between font-bold">
                          <span>Ganze Pizza ({zahl(ganz.gramm)} g) hätte:</span>
                          <span className="font-mono">{zahl(ganz.kcal)} kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="grid gap-3 md:grid-cols-5 mt-6">
                    {getCalorieComparison(gegessen.kcal).map((item, i) => (
                      <div key={i} className="card bg-base-200">
                        <div className="card-body py-3 px-2 text-center">
                          <div className="text-2xl">{item.emoji}</div>
                          <p className="text-xl font-bold text-primary">{item.amount}</p>
                          <p className="text-xs opacity-70">{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tip based on calories */}
                  {gegessen.kcal > 800 && (
                    <div className="alert alert-warning mt-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <p className="font-semibold">Kalorienreiche Mahlzeit!</p>
                        <p className="text-sm">
                          Über 800 kcal entspricht etwa 40% des Tagesbedarfs. Teile die Pizza
                          oder wähle einen dünnen Boden für weniger Kalorien.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="alert alert-info mt-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold">Tracke deine Pizza mit Mahlzait!</p>
                      <p className="text-sm">
                        Fotografiere dein Essen und erfasse die Kalorien automatisch, auch bei Pizza.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* So rechnen wir */}
        <section className="py-16" id="so-rechnen-wir">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">So rechnen wir</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <p>
                {`Der Rechner arbeitet in Gramm. Grundlage ist eine Pizza mit 30 cm Durchmesser und ${PIZZA_GRAMM} g, wie auf unserer Seite `}
                <a href="/kalorien/pizza/" className="link">Pizza</a>
                {`. Ein Stück ist ein Achtel davon, also ${zahl(STUECK_GRAMM)} g, gerundet ${Math.round(STUECK_GRAMM)} g.`}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Sorte:</strong>
                  {` Kalorien und Nährwerte je 100 g stammen von der Lebensmittelseite der Sorte, deren Werte aus USDA FoodData Central (FDC) kommen. Ein Stück Margherita hat ${margherita.kcal} kcal je 100 g mal ${zahl(STUECK_GRAMM)} g, also ${stueckKcal("margherita")} kcal. Prosciutto, Capricciosa und BBQ Chicken haben keine eigene Seite, für sie rechnen wir ein Rezept aus FDC-Zutaten (Tabelle unten).`}
                </li>
                <li>
                  <strong>Größe:</strong>
                  {` Das Gewicht wächst mit der Fläche, also mit dem Quadrat des Durchmessers: ${groessen
                    .map((g) => `${g.durchmesser} cm ${zahl(Math.round(pizzaGramm(g.id)))} g`)
                    .join(", ")}. Boden und Beläge wachsen im selben Verhältnis mit.`}
                </li>
                <li>
                  <strong>Boden:</strong>
                  {` Die Werte je 100 g gelten für jeden Boden, denn FDC nennt für Käsepizza mit normalem und mit dünnem Boden dieselben Werte je 100 g. Der Boden ändert das Gewicht: Eine mittlere Käsepizza (11 bis 12 Zoll) wiegt laut FDC mit normalem Boden ${fdcPortionen.mittlerePizza.normal.gramm} g, mit dünnem ${fdcPortionen.mittlerePizza.duenn.gramm} g, mit dickem ${fdcPortionen.mittlerePizza.dick.gramm} g und mit Käserand ${fdcPortionen.mittlerePizza.kaeserand.gramm} g. Auf unsere ${PIZZA_GRAMM}-g-Pizza übertragen sind das ${duennTeig} g Teig weniger beim dünnen Boden, ${dickTeig} g Teig mehr beim dicken und ${kaeserand.gramm} g Mozzarella im Käserand. Teig rechnen wir wie Weißbrot; von den ${PIZZA_GRAMM} g sind ${TEIG_GRAMM} g Teig, denn laut FDC wiegt der Belag einer Käsepizza ${zahl(fdcPortionen.quadratzoll.belag.gramm)} von ${zahl(fdcPortionen.quadratzoll.pizza.gramm)} g je Quadratzoll. Für den Vollkornboden nennt FDC bei Käsepizza mit dünnem Boden je 100 g ${zutaten.vollkornpizza.kcal} statt ${zutaten.kaesepizzaDuenn.kcal} kcal (FDC ${zutaten.vollkornpizza.fdcId} gegen ${zutaten.kaesepizzaDuenn.fdcId}), also praktisch gleich viel, dazu mehr Ballaststoffe (${zahl(zutaten.vollkornpizza.ballaststoffe)} statt ${zahl(zutaten.kaesepizzaDuenn.ballaststoffe)} g), etwas mehr Fett und weniger Kohlenhydrate. Diesen Unterschied je 100 g rechnen wir auf das Gewicht der Pizza.`}
                </li>
                <li>
                  <strong>Extra-Beläge:</strong> feste Mengen je 30-cm-Pizza mit den FDC-Werten der
                  Zutat, bei anderen Größen im Verhältnis der Fläche.
                </li>
                <li>
                  <strong>Rundung:</strong>
                  {` Wir rechnen ungerundet und runden erst das Ergebnis. Die ganze Margherita hat deshalb ${ganzeKcal("margherita")} kcal, nicht 8 × ${stueckKcal("margherita")} = ${8 * stueckKcal("margherita")} kcal.`}
                </li>
              </ul>

              <div className="overflow-x-auto">
                <table className="table bg-base-100 shadow">
                  <caption className="text-left font-semibold py-2">
                    Boden und Extra-Beläge je 30-cm-Pizza
                  </caption>
                  <thead>
                    <tr>
                      <th>Auswahl</th>
                      <th>Zutat (Quelle)</th>
                      <th className="text-right">Menge</th>
                      <th className="text-right">kcal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boeden
                      .filter((b) => b.teile.length > 0)
                      .map((b) => {
                        // Vollkorn tauscht die Werte je 100 g der ganzen Pizza, die übrigen Böden ändern eine Zutat
                        const [erste, zweite] = b.teile;
                        const tausch = zweite !== undefined && zweite.gramm === -erste.gramm;
                        return (
                          <tr key={b.id}>
                            <td>{b.name}</td>
                            <td>
                              {tausch
                                ? `${zutaten[zweite.zutat].name} (${fdc(zweite.zutat)}) statt ${zutaten[erste.zutat].name} (${fdc(erste.zutat)})`
                                : `${zutaten[erste.zutat].name} (${fdc(erste.zutat)})`}
                            </td>
                            <td className="text-right font-mono">
                              {tausch ? `${zweite.gramm} g` : `${vorzeichen(erste.gramm)} g`}
                            </td>
                            <td className="text-right font-mono">
                              {vorzeichen(Math.round(summe(b.teile).kcal))}
                            </td>
                          </tr>
                        );
                      })}
                    {belaege.map((b) => (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td>{`${zutaten[b.zutat].name} (${fdc(b.zutat)})`}</td>
                        <td className="text-right font-mono">{`+${b.gramm} g`}</td>
                        <td className="text-right font-mono">{`+${zutatKcal(b.zutat, b.gramm)}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto">
                <table className="table bg-base-100 shadow">
                  <caption className="text-left font-semibold py-2">
                    {`Rezepte für Sorten ohne eigene Seite, je ${PIZZA_GRAMM}-g-Pizza`}
                  </caption>
                  <thead>
                    <tr>
                      <th>Sorte</th>
                      <th>Zutaten (Quelle)</th>
                      <th className="text-right">kcal je 100 g</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorten
                      .filter((s) => s.rezept)
                      .map((s) => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>
                            {s
                              .rezept!.map((t) => `${t.gramm} g ${zutaten[t.zutat].name} (${fdc(t.zutat)})`)
                              .join(", ")}
                          </td>
                          <td className="text-right font-mono">{Math.round(s.je100g.kcal)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Calorie Table */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Pizza Kalorientabelle im Überblick
            </h2>
            <div className="overflow-x-auto max-w-3xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Pizza-Sorte</th>
                    <th className="text-right">je 100 g</th>
                    <th className="text-right">{`1 Stück (${Math.round(STUECK_GRAMM)} g)`}</th>
                    <th className="text-right">{`30 cm (${PIZZA_GRAMM} g)`}</th>
                    <th>Grundlage</th>
                  </tr>
                </thead>
                <tbody>
                  {sorten.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td className="text-right font-mono">{`${Math.round(s.je100g.kcal)} kcal`}</td>
                      <td className="text-right font-mono">{`${stueckKcal(s.id)} kcal`}</td>
                      <td className="text-right font-mono">{`${ganzeKcal(s.id)} kcal`}</td>
                      <td>
                        {s.seite ? (
                          <a href={`/kalorien/${s.seite}/`} className="link">
                            {`Pizza ${s.name}`}
                          </a>
                        ) : (
                          "Rezept aus FDC-Zutaten"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm opacity-70 mt-4">
              {`Klassischer Boden ohne Extra-Beläge. Zum Vergleich Tiefkühlpizza: ${tiefkuehl
                .map((t) => `${t.name.replace("Tiefkühlpizza ", "")} (${t.gramm} g) ${t.kcal} kcal`)
                .join(", ")}, laut unseren Seiten Pizza Margherita und Pizza Salami.`}
            </p>
          </div>
        </section>

        {/* Why Pizza Has Many Calories */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum hat Pizza so viele Kalorien?
            </h2>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🫓 Der Teig</h3>
                  <p>
                    {"Rund zwei Drittel einer Pizza sind Teig: bei unserer 30-cm-Pizza "}
                    <strong>{`${TEIG_GRAMM} von ${PIZZA_GRAMM} g`}</strong>
                    {`. Gerechnet wie Weißbrot (${zutaten.teig.kcal} kcal je 100 g) sind das ${zutatKcal("teig", TEIG_GRAMM)} kcal. Ein dünner Boden spart ${duennTeig} g Teig und damit ${duennSpart} kcal.`}
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🧀 Der Käse</h3>
                  <p>
                    {`Mozzarella hat ${zutaten.mozzarella.kcal} kcal je 100 g. Extra Käse (${extraKaese.gramm} g) bringt `}
                    <strong>{`${zutatKcal(extraKaese.zutat, extraKaese.gramm)} kcal`}</strong>
                    {` je 30-cm-Pizza mehr, ein Käserand (${kaeserand.gramm} g) ${zutatKcal(kaeserand.zutat, kaeserand.gramm)} kcal. Quattro Formaggi hat mit ${sorte("quattro-formaggi").je100g.kcal} kcal je 100 g kaum mehr als Margherita (${margherita.kcal} kcal).`}
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🍕 Die Beläge</h3>
                  <p>
                    {`Wurst und Speck treiben die Kalorien hoch: ${pepperoni.gramm} g Pepperoni-Salami bringen `}
                    <strong>{`${zutatKcal(pepperoni.zutat, pepperoni.gramm)} kcal`}</strong>
                    {`, ${speck.gramm} g Speck ${zutatKcal(speck.zutat, speck.gramm)} kcal. ${pilze.gramm} g Champignons haben nur ${zutatKcal(pilze.zutat, pilze.gramm)} kcal, ${zwiebeln.gramm} g Zwiebeln ${zutatKcal(zwiebeln.zutat, zwiebeln.gramm)} kcal.`}
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">📏 Die Größe</h3>
                  <p>
                    {`Eine große Pizza (${gross.durchmesser} cm, ${Math.round(pizzaGramm(gross.id))} g) hat `}
                    <strong>fast doppelt so viele Kalorien</strong>
                    {` wie eine kleine (${klein.durchmesser} cm, ${Math.round(pizzaGramm(klein.id))} g): als Margherita ${zahl(ganzeKcal("margherita", gross.id))} statt ${zahl(ganzeKcal("margherita", klein.id))} kcal. Die Portion macht den Unterschied, teile oder wähle klein!`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              5 Tipps für eine kalorienärmere Pizza
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              {[
                {
                  icon: "📄",
                  titel: "Dünnen Teig wählen",
                  text: `Ein dünner Boden spart bei einer 30-cm-Pizza ${duennSpart} kcal, gegenüber dem dicken Boden ${duennGegenDick} kcal.`,
                },
                {
                  icon: "🥗",
                  titel: "Gemüse-Beläge bevorzugen",
                  text: `Pilze und Zwiebeln bringen je Stück ${jeStueck(pilze.id)} bis ${jeStueck(zwiebeln.id)} kcal, Speck ${jeStueck(speck.id)} und Pepperoni-Salami ${jeStueck(pepperoni.id)} kcal.`,
                },
                {
                  icon: "🍕",
                  titel: "Leichtere Sorten wählen",
                  text: `Gemüse und Obst senken die Kalorien je 100 g: Ein Stück ${nachStueck[0].name} hat ${stueckKcal(nachStueck[0].id)} kcal, ${nachStueck[1].name} ${stueckKcal(nachStueck[1].id)}, Margherita ${stueckKcal("margherita")} und Salami ${stueckKcal("salami")} kcal.`,
                },
                {
                  icon: "👥",
                  titel: "Pizza teilen",
                  text: `Teile eine Pizza zu zweit und bestell einen Salat dazu: Eine halbe Margherita mit 30 cm hat ${halbeMargherita} kcal.`,
                },
                {
                  icon: "🧀",
                  titel: "Weniger Käse bestellen",
                  text: `Frag nach "leichtem Käsebelag": ${extraKaese.gramm} g Mozzarella weniger sparen ${zutatKcal(extraKaese.zutat, extraKaese.gramm)} kcal je Pizza.`,
                },
              ].map((tipp) => (
                <div key={tipp.titel} className="card bg-base-100 shadow">
                  <div className="card-body py-4 flex-row gap-4 items-center">
                    <span className="text-3xl">{tipp.icon}</span>
                    <div>
                      <h3 className="font-bold">{tipp.titel}</h3>
                      <p className="text-sm opacity-70">{tipp.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              {faq.map((item, i) => (
                <div key={item.q} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq" defaultChecked={i === 0} />
                  <div className="collapse-title text-lg font-medium">{item.q}</div>
                  <div className="collapse-content">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RelatedWissen calculatorSlug="pizza-kalorien-rechner" />
        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default PizzaKalorienRechnerPage;
