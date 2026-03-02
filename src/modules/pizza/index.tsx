import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

import AuthorByline from "@components/AuthorByline";
interface Props {
  config: TemplateConfig;
}

interface PizzaSize {
  id: string;
  name: string;
  diameter: string;
  slices: number;
  baseMultiplier: number;
  icon: string;
}

interface PizzaType {
  id: string;
  name: string;
  caloriesPerSlice: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
  description: string;
}

interface ToppingType {
  id: string;
  name: string;
  caloriesPerSlice: number;
  icon: string;
}

interface CrustType {
  id: string;
  name: string;
  calorieModifier: number;
  icon: string;
}

interface PizzaResult {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  perSlice: number;
  slices: number;
}

const pizzaSizes: PizzaSize[] = [
  { id: "small", name: "Klein", diameter: "26 cm", slices: 6, baseMultiplier: 0.7, icon: "🔵" },
  { id: "medium", name: "Normal", diameter: "30 cm", slices: 8, baseMultiplier: 1.0, icon: "🟢" },
  { id: "large", name: "Gross", diameter: "36 cm", slices: 10, baseMultiplier: 1.4, icon: "🟡" },
  { id: "family", name: "Familien", diameter: "45 cm", slices: 12, baseMultiplier: 2.0, icon: "🔴" },
];

const pizzaTypes: PizzaType[] = [
  {
    id: "margherita",
    name: "Margherita",
    caloriesPerSlice: 200,
    protein: 8,
    carbs: 26,
    fat: 7,
    icon: "🍕",
    description: "Tomaten, Mozzarella, Basilikum",
  },
  {
    id: "salami",
    name: "Salami",
    caloriesPerSlice: 260,
    protein: 11,
    carbs: 26,
    fat: 12,
    icon: "🍕",
    description: "Tomaten, Mozzarella, Salami",
  },
  {
    id: "prosciutto",
    name: "Prosciutto",
    caloriesPerSlice: 235,
    protein: 12,
    carbs: 25,
    fat: 9,
    icon: "🍕",
    description: "Tomaten, Mozzarella, Schinken",
  },
  {
    id: "tonno",
    name: "Tonno",
    caloriesPerSlice: 225,
    protein: 14,
    carbs: 24,
    fat: 8,
    icon: "🐟",
    description: "Tomaten, Mozzarella, Thunfisch, Zwiebeln",
  },
  {
    id: "hawaii",
    name: "Hawaii",
    caloriesPerSlice: 245,
    protein: 11,
    carbs: 28,
    fat: 9,
    icon: "🍍",
    description: "Tomaten, Mozzarella, Schinken, Ananas",
  },
  {
    id: "quattro-formaggi",
    name: "Quattro Formaggi",
    caloriesPerSlice: 290,
    protein: 13,
    carbs: 24,
    fat: 16,
    icon: "🧀",
    description: "Vier verschiedene Käsesorten",
  },
  {
    id: "diavola",
    name: "Diavola",
    caloriesPerSlice: 270,
    protein: 12,
    carbs: 26,
    fat: 13,
    icon: "🌶️",
    description: "Tomaten, Mozzarella, scharfe Salami",
  },
  {
    id: "capricciosa",
    name: "Capricciosa",
    caloriesPerSlice: 250,
    protein: 12,
    carbs: 26,
    fat: 10,
    icon: "🍄",
    description: "Schinken, Pilze, Artischocken, Oliven",
  },
  {
    id: "vegetariana",
    name: "Vegetariana",
    caloriesPerSlice: 210,
    protein: 9,
    carbs: 28,
    fat: 7,
    icon: "🥬",
    description: "Verschiedene Gemüsesorten",
  },
  {
    id: "bbq-chicken",
    name: "BBQ Chicken",
    caloriesPerSlice: 280,
    protein: 15,
    carbs: 30,
    fat: 11,
    icon: "🍗",
    description: "BBQ-Sauce, Hähnchen, Zwiebeln",
  },
];

const toppingTypes: ToppingType[] = [
  { id: "extra-cheese", name: "Extra Käse", caloriesPerSlice: 40, icon: "🧀" },
  { id: "pepperoni", name: "Pepperoni", caloriesPerSlice: 30, icon: "🥓" },
  { id: "mushrooms", name: "Pilze", caloriesPerSlice: 5, icon: "🍄" },
  { id: "olives", name: "Oliven", caloriesPerSlice: 15, icon: "🫒" },
  { id: "onions", name: "Zwiebeln", caloriesPerSlice: 5, icon: "🧅" },
  { id: "bacon", name: "Speck", caloriesPerSlice: 35, icon: "🥓" },
  { id: "jalapenos", name: "Jalapeños", caloriesPerSlice: 3, icon: "🌶️" },
  { id: "anchovies", name: "Sardellen", caloriesPerSlice: 20, icon: "🐟" },
];

const crustTypes: CrustType[] = [
  { id: "classic", name: "Klassisch", calorieModifier: 0, icon: "🍞" },
  { id: "thin", name: "Dünn/Knusprig", calorieModifier: -30, icon: "📄" },
  { id: "thick", name: "Dick/Pfannenpizza", calorieModifier: 50, icon: "🥧" },
  { id: "stuffed", name: "Käserand", calorieModifier: 80, icon: "🧀" },
  { id: "wholegrain", name: "Vollkorn", calorieModifier: -10, icon: "🌾" },
];

const pizzaCalorieTable = [
  { name: "Margherita (ganze Pizza)", size: "30 cm", calories: "800-900", slices: "8" },
  { name: "Salami (ganze Pizza)", size: "30 cm", calories: "1000-1100", slices: "8" },
  { name: "Quattro Formaggi", size: "30 cm", calories: "1100-1200", slices: "8" },
  { name: "Hawaii", size: "30 cm", calories: "950-1050", slices: "8" },
  { name: "Vegetariana", size: "30 cm", calories: "850-950", slices: "8" },
  { name: "Tiefkühlpizza Salami", size: "320g", calories: "750-850", slices: "4" },
  { name: "Tiefkühlpizza Margherita", size: "300g", calories: "650-750", slices: "4" },
];

function PizzaKalorienRechnerPage({ config }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>("medium");
  const [selectedPizza, setSelectedPizza] = useState<string>("margherita");
  const [selectedCrust, setSelectedCrust] = useState<string>("classic");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [slicesToEat, setSlicesToEat] = useState<number>(2);
  const [result, setResult] = useState<PizzaResult | null>(null);

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((t) => t !== toppingId) : [...prev, toppingId]
    );
  };

  const selectedSizeData = pizzaSizes.find((s) => s.id === selectedSize)!;

  const calculateCalories = () => {
    const size = pizzaSizes.find((s) => s.id === selectedSize)!;
    const pizza = pizzaTypes.find((p) => p.id === selectedPizza)!;
    const crust = crustTypes.find((c) => c.id === selectedCrust)!;

    const toppingsCalories = selectedToppings.reduce((sum, toppingId) => {
      const topping = toppingTypes.find((t) => t.id === toppingId);
      return sum + (topping?.caloriesPerSlice || 0);
    }, 0);

    const caloriesPerSlice = Math.round(
      (pizza.caloriesPerSlice + crust.calorieModifier + toppingsCalories) * size.baseMultiplier
    );

    const totalSlices = size.slices;
    const totalCaloriesWholePizza = caloriesPerSlice * totalSlices;
    const totalCaloriesEaten = caloriesPerSlice * slicesToEat;

    const proteinPerSlice = Math.round(pizza.protein * size.baseMultiplier);
    const carbsPerSlice = Math.round(pizza.carbs * size.baseMultiplier);
    const fatPerSlice = Math.round(pizza.fat * size.baseMultiplier);

    setResult({
      totalCalories: totalCaloriesEaten,
      protein: proteinPerSlice * slicesToEat,
      carbs: carbsPerSlice * slicesToEat,
      fat: fatPerSlice * slicesToEat,
      perSlice: caloriesPerSlice,
      slices: totalSlices,
    });
  };

  const getCalorieComparison = (calories: number) => {
    return [
      { name: "Döner Kebabs", amount: Math.round((calories / 600) * 10) / 10, emoji: "🥙" },
      { name: "Big Macs", amount: Math.round((calories / 509) * 10) / 10, emoji: "🍔" },
      { name: "Tafeln Schoko", amount: Math.round((calories / 530) * 10) / 10, emoji: "🍫" },
      { name: "Min. Joggen", amount: Math.round(calories / 10), emoji: "🏃" },
      { name: "Min. Spazieren", amount: Math.round(calories / 4), emoji: "🚶" },
    ];
  };

  const selectedPizzaData = pizzaTypes.find((p) => p.id === selectedPizza);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

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
              Hawaii und mehr – mit verschiedenen Grössen, Teigarten und Extra-Belägen.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-6">Kalorien berechnen</h2>

              {/* Size Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">1. Pizza-Grösse wählen</span>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                  {pizzaSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`btn btn-lg h-auto py-4 flex-col ${
                        selectedSize === size.id ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      <span className="text-2xl">{size.icon}</span>
                      <span className="font-semibold">{size.name}</span>
                      <span className="text-xs opacity-70">{size.diameter}</span>
                      <span className="text-xs opacity-70">{size.slices} Stücke</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pizza Type Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">2. Pizza-Sorte wählen</span>
                <div className="grid gap-3 md:grid-cols-2">
                  {pizzaTypes.map((pizza) => (
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
                  {crustTypes.map((crust) => (
                    <button
                      key={crust.id}
                      onClick={() => setSelectedCrust(crust.id)}
                      className={`btn ${
                        selectedCrust === crust.id ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {crust.icon} {crust.name}{" "}
                      {crust.calorieModifier !== 0 && (
                        <span className="text-xs opacity-70">
                          ({crust.calorieModifier > 0 ? "+" : ""}{crust.calorieModifier} kcal/Stück)
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
                  {toppingTypes.map((topping) => (
                    <button
                      key={topping.id}
                      onClick={() => toggleTopping(topping.id)}
                      className={`btn btn-sm ${
                        selectedToppings.includes(topping.id) ? "btn-secondary" : "btn-outline"
                      }`}
                    >
                      {topping.icon} {topping.name} (+{topping.caloriesPerSlice} kcal/Stück)
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
                    <span className="opacity-70">von {selectedSizeData.slices}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max={selectedSizeData.slices}
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
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">{result.totalCalories} kcal</div>
                    <div className="text-lg opacity-70 mt-2">
                      {slicesToEat} Stück {selectedPizzaData?.name}
                      {slicesToEat === result.slices && " (ganze Pizza)"}
                    </div>
                    <div className="text-sm opacity-50 mt-1">
                      {result.perSlice} kcal pro Stück
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="card bg-green-100 dark:bg-green-900">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {result.protein}g
                        </div>
                        <div className="text-sm opacity-70">Protein</div>
                      </div>
                    </div>
                    <div className="card bg-yellow-100 dark:bg-yellow-900">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                          {result.carbs}g
                        </div>
                        <div className="text-sm opacity-70">Kohlenhydrate</div>
                      </div>
                    </div>
                    <div className="card bg-red-100 dark:bg-red-900">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {result.fat}g
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
                          <span className="font-mono">{result.perSlice} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Anzahl Stücke gegessen:</span>
                          <span className="font-mono">{slicesToEat} von {result.slices}</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="flex justify-between font-bold">
                          <span>Ganze Pizza hätte:</span>
                          <span className="font-mono">{result.perSlice * result.slices} kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="grid gap-3 md:grid-cols-5 mt-6">
                    {getCalorieComparison(result.totalCalories).map((item, i) => (
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
                  {result.totalCalories > 800 && (
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
                          oder wähle eine Margherita mit dünnem Teig für weniger Kalorien.
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
                        Fotografiere dein Essen und erfasse die Kalorien automatisch – auch bei Pizza.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Calorie Table */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Pizza Kalorientabelle im Überblick
            </h2>
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Pizza-Sorte</th>
                    <th className="text-right">Grösse</th>
                    <th className="text-right">Kalorien</th>
                    <th className="text-right">Stücke</th>
                  </tr>
                </thead>
                <tbody>
                  {pizzaCalorieTable.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td className="text-right font-mono">{item.size}</td>
                      <td className="text-right font-mono">{item.calories}</td>
                      <td className="text-right font-mono">{item.slices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm opacity-70 mt-4">
              * Werte sind Durchschnittswerte und können je nach Restaurant/Marke variieren
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
                    Pizza-Teig besteht aus Weissmehl und Olivenöl – eine kalorienreiche Kombination.
                    Der Boden einer normalen Pizza hat allein <strong>400-500 kcal</strong>.
                    Vollkorn- oder dünner Teig spart hier Kalorien.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🧀 Der Käse</h3>
                  <p>
                    Mozzarella ist der Hauptkalorienträger! Eine Pizza hat oft{" "}
                    <strong>150-200g Käse</strong>, das entspricht ca. 400-600 kcal. Quattro Formaggi
                    ist besonders kalorienreich.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🍕 Die Beläge</h3>
                  <p>
                    Salami, Schinken und Speck treiben die Kalorien hoch:{" "}
                    <strong>50-100 kcal extra pro Belag</strong>. Gemüse wie Pilze, Paprika oder
                    Zwiebeln sind kalorienarme Alternativen.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">📏 Die Grösse</h3>
                  <p>
                    Eine grosse Pizza (36 cm) hat fast <strong>doppelt so viele Kalorien</strong>
                    wie eine kleine (26 cm). Die Portion macht den Unterschied – teile oder wähle klein!
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
              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">📄</span>
                  <div>
                    <h3 className="font-bold">Dünnen Teig wählen</h3>
                    <p className="text-sm opacity-70">
                      Dünner, knuspriger Teig spart bis zu 150 kcal gegenüber dickem Pfannenteig.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">🥗</span>
                  <div>
                    <h3 className="font-bold">Gemüse-Beläge bevorzugen</h3>
                    <p className="text-sm opacity-70">
                      Pilze, Paprika, Zwiebeln und Tomaten haben kaum Kalorien – Salami und Speck viele.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">🍕</span>
                  <div>
                    <h3 className="font-bold">Margherita als Basis</h3>
                    <p className="text-sm opacity-70">
                      Die klassische Margherita ist die kalorienärmste Pizza – nur ca. 200 kcal pro Stück.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">👥</span>
                  <div>
                    <h3 className="font-bold">Pizza teilen</h3>
                    <p className="text-sm opacity-70">
                      Teile eine Pizza zu zweit und bestell einen Salat dazu – so isst du nur 400-500 kcal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">🧀</span>
                  <div>
                    <h3 className="font-bold">Weniger Käse bestellen</h3>
                    <p className="text-sm opacity-70">
                      Frag nach "leichtem Käsebelag" – das kann 200+ kcal sparen.
                    </p>
                  </div>
                </div>
              </div>
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
              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" defaultChecked />
                <div className="collapse-title text-lg font-medium">
                  Wie viele Kalorien hat ein Stück Pizza?
                </div>
                <div className="collapse-content">
                  <p>
                    Ein Stück Pizza (1/8 einer 30cm Pizza) hat je nach Belag{" "}
                    <strong>200-300 kcal</strong>. Margherita ca. 200 kcal, Salami ca. 260 kcal,
                    Quattro Formaggi bis zu 290 kcal pro Stück.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Wie viele Kalorien hat eine ganze Pizza?
                </div>
                <div className="collapse-content">
                  <p>
                    Eine ganze Pizza (30 cm) hat durchschnittlich <strong>800-1200 kcal</strong>.
                    Margherita ca. 800-900 kcal, Salami 1000-1100 kcal, Quattro Formaggi bis zu
                    1200 kcal. Grosse Pizzen (36+ cm) können 1500+ kcal haben.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Welche Pizza hat am wenigsten Kalorien?
                </div>
                <div className="collapse-content">
                  <p>
                    Die <strong>Margherita</strong> ist die kalorienärmste klassische Pizza.
                    Noch weniger hat eine <strong>Marinara</strong> (nur Tomaten, Knoblauch, Oregano
                    – ohne Käse). Auch Vegetariana mit viel Gemüse ist relativ leicht.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Ist Pizza gut zum Abnehmen?
                </div>
                <div className="collapse-content">
                  <p>
                    Pizza kann in eine Diät passen, wenn du <strong>die Portion kontrollierst</strong>:
                    2-3 Stücke mit Salat statt einer ganzen Pizza. Wähle dünnen Teig, wenig Käse
                    und Gemüse-Beläge. So bleibst du bei 400-500 kcal.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Hat Tiefkühlpizza weniger Kalorien?
                </div>
                <div className="collapse-content">
                  <p>
                    Oft ja! Eine typische <strong>Tiefkühlpizza hat 650-850 kcal</strong> für die
                    ganze Pizza – weniger als Restaurantpizza. Aber Achtung: Die Portionen sind
                    kleiner. Kalorien pro 100g sind oft ähnlich.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Was ist kalorienärmer: Pizza oder Döner?
                </div>
                <div className="collapse-content">
                  <p>
                    Ein <strong>Döner (550-650 kcal)</strong> hat weniger Kalorien als eine ganze
                    Pizza (800-1200 kcal), aber mehr als 2-3 Stücke Pizza. Entscheidend ist die
                    Portion! Döner hat mehr Protein, Pizza mehr Kohlenhydrate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default PizzaKalorienRechnerPage;
