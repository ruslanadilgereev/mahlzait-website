import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface DoenerType {
  id: string;
  name: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  icon: string;
  description: string;
}

interface MeatType {
  id: string;
  name: string;
  calorieModifier: number;
  proteinModifier: number;
  fatModifier: number;
  icon: string;
}

interface SauceType {
  id: string;
  name: string;
  calories: number;
  fat: number;
  icon: string;
}

interface ExtraType {
  id: string;
  name: string;
  calories: number;
  icon: string;
}

interface DoenerResult {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  breakdown: {
    base: number;
    meat: number;
    sauce: number;
    extras: number;
  };
}

const doenerTypes: DoenerType[] = [
  {
    id: "classic",
    name: "Döner Kebab (Fladenbrot)",
    baseCalories: 350,
    baseProtein: 8,
    baseCarbs: 45,
    baseFat: 12,
    icon: "🥙",
    description: "Klassischer Döner im Fladenbrot mit Salat",
  },
  {
    id: "dueruem",
    name: "Dürüm Döner",
    baseCalories: 380,
    baseProtein: 10,
    baseCarbs: 50,
    baseFat: 14,
    icon: "🌯",
    description: "Döner im dünnen Yufka-Teigfladen",
  },
  {
    id: "teller",
    name: "Döner Teller",
    baseCalories: 450,
    baseProtein: 12,
    baseCarbs: 55,
    baseFat: 18,
    icon: "🍽️",
    description: "Döner mit Reis oder Pommes auf dem Teller",
  },
  {
    id: "box",
    name: "Döner Box / Pomm-Döner",
    baseCalories: 520,
    baseProtein: 10,
    baseCarbs: 65,
    baseFat: 22,
    icon: "📦",
    description: "Pommes mit Dönerfleisch und Sauce",
  },
  {
    id: "lahmacun",
    name: "Lahmacun mit Döner",
    baseCalories: 420,
    baseProtein: 15,
    baseCarbs: 48,
    baseFat: 16,
    icon: "🫓",
    description: "Türkische Pizza mit Dönerfleisch",
  },
  {
    id: "pide",
    name: "Pide mit Döner",
    baseCalories: 480,
    baseProtein: 18,
    baseCarbs: 52,
    baseFat: 20,
    icon: "🥖",
    description: "Türkisches Fladenbrot gefüllt mit Döner",
  },
  {
    id: "vegetarisch",
    name: "Vegetarischer Döner / Falafel",
    baseCalories: 380,
    baseProtein: 12,
    baseCarbs: 48,
    baseFat: 14,
    icon: "🧆",
    description: "Mit Falafel statt Fleisch",
  },
];

const meatTypes: MeatType[] = [
  {
    id: "kalb",
    name: "Kalb-/Rindfleisch",
    calorieModifier: 180,
    proteinModifier: 25,
    fatModifier: 8,
    icon: "🥩",
  },
  {
    id: "haehnchen",
    name: "Hähnchenfleisch",
    calorieModifier: 140,
    proteinModifier: 28,
    fatModifier: 4,
    icon: "🍗",
  },
  {
    id: "gemischt",
    name: "Gemischtes Fleisch",
    calorieModifier: 160,
    proteinModifier: 26,
    fatModifier: 6,
    icon: "🍖",
  },
  {
    id: "lamm",
    name: "Lammfleisch",
    calorieModifier: 200,
    proteinModifier: 24,
    fatModifier: 12,
    icon: "🐑",
  },
];

const sauceTypes: SauceType[] = [
  { id: "joghurt", name: "Joghurt-Sauce (Cacık)", calories: 40, fat: 3, icon: "🥛" },
  { id: "knoblauch", name: "Knoblauch-Sauce", calories: 80, fat: 8, icon: "🧄" },
  { id: "cocktail", name: "Cocktail-Sauce", calories: 90, fat: 9, icon: "🍹" },
  { id: "scharf", name: "Scharfe Sauce", calories: 20, fat: 1, icon: "🌶️" },
  { id: "krauter", name: "Kräuter-Sauce", calories: 60, fat: 5, icon: "🌿" },
  { id: "ohne", name: "Ohne Sauce", calories: 0, fat: 0, icon: "❌" },
];

const extraTypes: ExtraType[] = [
  { id: "kaese", name: "Käse", calories: 80, icon: "🧀" },
  { id: "pommes", name: "Extra Pommes", calories: 150, icon: "🍟" },
  { id: "halloumi", name: "Halloumi", calories: 100, icon: "🧀" },
  { id: "schafkaese", name: "Schafskäse/Feta", calories: 70, icon: "🧀" },
];

const doenerCalorieTable = [
  { name: "Döner Kebab (klassisch)", portion: "350g", calories: "550-650", protein: "35g" },
  { name: "Dürüm Döner", portion: "400g", calories: "600-700", protein: "38g" },
  { name: "Döner Box mit Pommes", portion: "450g", calories: "750-900", protein: "30g" },
  { name: "Lahmacun mit Döner", portion: "380g", calories: "580-680", protein: "32g" },
  { name: "Döner Teller mit Reis", portion: "500g", calories: "650-800", protein: "40g" },
  { name: "Hähnchen-Döner", portion: "350g", calories: "480-550", protein: "40g" },
  { name: "Vegetarischer Döner", portion: "320g", calories: "450-520", protein: "18g" },
];

function DoenerKalorienRechnerPage({ config }: Props) {
  const [selectedDoener, setSelectedDoener] = useState<string>("classic");
  const [selectedMeat, setSelectedMeat] = useState<string>("kalb");
  const [selectedSauce, setSelectedSauce] = useState<string>("joghurt");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [portionSize, setPortionSize] = useState<number>(100);
  const [result, setResult] = useState<DoenerResult | null>(null);

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((e) => e !== extraId) : [...prev, extraId]
    );
  };

  const calculateCalories = () => {
    const doener = doenerTypes.find((d) => d.id === selectedDoener)!;
    const meat = meatTypes.find((m) => m.id === selectedMeat);
    const sauce = sauceTypes.find((s) => s.id === selectedSauce)!;

    // Für vegetarische Option kein Fleisch addieren
    const isVegetarian = selectedDoener === "vegetarisch";
    const meatCalories = isVegetarian ? 0 : (meat?.calorieModifier || 0);
    const meatProtein = isVegetarian ? 0 : (meat?.proteinModifier || 0);
    const meatFat = isVegetarian ? 0 : (meat?.fatModifier || 0);

    const extrasCalories = selectedExtras.reduce((sum, extraId) => {
      const extra = extraTypes.find((e) => e.id === extraId);
      return sum + (extra?.calories || 0);
    }, 0);

    // Portionsgrösse berücksichtigen (100% = normale Portion)
    const portionMultiplier = portionSize / 100;

    const baseCaloriesAdjusted = doener.baseCalories * portionMultiplier;
    const meatCaloriesAdjusted = meatCalories * portionMultiplier;
    const sauceCaloriesAdjusted = sauce.calories;
    const extrasCaloriesAdjusted = extrasCalories;

    const totalCalories = Math.round(
      baseCaloriesAdjusted + meatCaloriesAdjusted + sauceCaloriesAdjusted + extrasCaloriesAdjusted
    );

    const totalProtein = Math.round((doener.baseProtein + meatProtein) * portionMultiplier);
    const totalCarbs = Math.round(doener.baseCarbs * portionMultiplier);
    const totalFat = Math.round((doener.baseFat + meatFat + sauce.fat) * portionMultiplier);

    setResult({
      totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      breakdown: {
        base: Math.round(baseCaloriesAdjusted),
        meat: Math.round(meatCaloriesAdjusted),
        sauce: sauceCaloriesAdjusted,
        extras: extrasCaloriesAdjusted,
      },
    });
  };

  const getCalorieComparison = (calories: number) => {
    return [
      { name: "Big Macs", amount: Math.round((calories / 509) * 10) / 10, emoji: "🍔" },
      { name: "Scheiben Pizza", amount: Math.round((calories / 266) * 10) / 10, emoji: "🍕" },
      { name: "Teller Pasta", amount: Math.round((calories / 400) * 10) / 10, emoji: "🍝" },
      { name: "Min. Joggen", amount: Math.round(calories / 10), emoji: "🏃" },
      { name: "Min. Radfahren", amount: Math.round(calories / 7), emoji: "🚴" },
    ];
  };

  const selectedDoenerData = doenerTypes.find((d) => d.id === selectedDoener);
  const isVegetarian = selectedDoener === "vegetarisch";

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              🥙 Döner Kalorien Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Wie viele Kalorien hat dein Döner wirklich? Berechne die Nährwerte für Döner Kebab,
              Dürüm, Lahmacun und mehr – mit Fleisch, Sauce und Extras.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-6">Kalorien berechnen</h2>

              {/* Döner Type Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">1. Döner-Art wählen</span>
                <div className="grid gap-3 md:grid-cols-2">
                  {doenerTypes.map((doener) => (
                    <button
                      key={doener.id}
                      onClick={() => setSelectedDoener(doener.id)}
                      className={`btn btn-lg justify-start gap-3 h-auto py-3 ${
                        selectedDoener === doener.id ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      <span className="text-2xl">{doener.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{doener.name}</div>
                        <div className="text-xs opacity-70 font-normal">{doener.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meat Type Selection */}
              {!isVegetarian && (
                <div className="mb-8">
                  <span className="text-lg font-semibold block mb-4">2. Fleisch wählen</span>
                  <div className="flex flex-wrap gap-2">
                    {meatTypes.map((meat) => (
                      <button
                        key={meat.id}
                        onClick={() => setSelectedMeat(meat.id)}
                        className={`btn ${
                          selectedMeat === meat.id ? "btn-primary" : "btn-outline"
                        }`}
                      >
                        {meat.icon} {meat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sauce Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">
                  {isVegetarian ? "2" : "3"}. Sauce wählen
                </span>
                <div className="flex flex-wrap gap-2">
                  {sauceTypes.map((sauce) => (
                    <button
                      key={sauce.id}
                      onClick={() => setSelectedSauce(sauce.id)}
                      className={`btn btn-sm ${
                        selectedSauce === sauce.id ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {sauce.icon} {sauce.name} ({sauce.calories} kcal)
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">
                  {isVegetarian ? "3" : "4"}. Extras (optional)
                </span>
                <div className="flex flex-wrap gap-2">
                  {extraTypes.map((extra) => (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra.id)}
                      className={`btn btn-sm ${
                        selectedExtras.includes(extra.id) ? "btn-secondary" : "btn-outline"
                      }`}
                    >
                      {extra.icon} {extra.name} (+{extra.calories} kcal)
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion Size */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Portionsgrösse</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">{portionSize}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="10"
                  value={portionSize}
                  onChange={(e) => setPortionSize(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>Klein (50%)</span>
                  <span>Normal (100%)</span>
                  <span>XXL (150%)</span>
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateCalories}>
                🥙 Kalorien berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">{result.totalCalories} kcal</div>
                    <div className="text-lg opacity-70 mt-2">
                      {selectedDoenerData?.name}
                      {!isVegetarian && ` mit ${meatTypes.find((m) => m.id === selectedMeat)?.name}`}
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

                  {/* Calorie Breakdown */}
                  <div className="card bg-base-200 mt-4">
                    <div className="card-body py-4">
                      <h3 className="font-semibold mb-3">Kalorien-Aufteilung</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Brot & Salat:</span>
                          <span className="font-mono">{result.breakdown.base} kcal</span>
                        </div>
                        {!isVegetarian && (
                          <div className="flex justify-between">
                            <span>Fleisch:</span>
                            <span className="font-mono">{result.breakdown.meat} kcal</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Sauce:</span>
                          <span className="font-mono">{result.breakdown.sauce} kcal</span>
                        </div>
                        {result.breakdown.extras > 0 && (
                          <div className="flex justify-between">
                            <span>Extras:</span>
                            <span className="font-mono">{result.breakdown.extras} kcal</span>
                          </div>
                        )}
                        <div className="divider my-1"></div>
                        <div className="flex justify-between font-bold">
                          <span>Gesamt:</span>
                          <span className="font-mono">{result.totalCalories} kcal</span>
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
                  {result.totalCalories > 700 && (
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
                        <p className="font-semibold">Kalorienreiche Wahl!</p>
                        <p className="text-sm">
                          Über 700 kcal entspricht etwa 35% des Tagesbedarfs. Wähle Hähnchen statt
                          Kalb und Joghurt-Sauce für eine leichtere Alternative.
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
                      <p className="font-semibold">Tracke deinen Döner mit Mahlzait!</p>
                      <p className="text-sm">
                        Fotografiere dein Essen und erfasse die Kalorien automatisch – auch beim Döner.
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
              Döner Kalorientabelle im Überblick
            </h2>
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Döner-Variante</th>
                    <th className="text-right">Portion</th>
                    <th className="text-right">Kalorien</th>
                    <th className="text-right">Protein</th>
                  </tr>
                </thead>
                <tbody>
                  {doenerCalorieTable.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td className="text-right font-mono">{item.portion}</td>
                      <td className="text-right font-mono">{item.calories}</td>
                      <td className="text-right font-mono">{item.protein}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm opacity-70 mt-4">
              * Werte sind Durchschnittswerte und können je nach Imbiss variieren
            </p>
          </div>
        </section>

        {/* Why Döner Has Many Calories */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum hat Döner so viele Kalorien?
            </h2>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🥩 Das Fleisch</h3>
                  <p>
                    Döner-Fleisch besteht oft aus <strong>fettem Kalb- oder Lammfleisch</strong>.
                    Ein typischer Döner enthält 100-150g Fleisch mit 180-250 kcal. Hähnchen ist
                    deutlich magerer!
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🫓 Das Brot</h3>
                  <p>
                    Das Fladenbrot allein hat etwa <strong>200-250 kcal</strong>. Es ist gross,
                    weich und wird oft noch mit Butter bestrichen. Dürüm-Teig ist etwas kalorienärmer.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🥛 Die Saucen</h3>
                  <p>
                    Knoblauch- und Cocktailsauce sind echte Kalorienbomben: <strong>80-100 kcal
                    pro Portion</strong>. Joghurt-Sauce ist die kalorienärmste Alternative mit nur 40 kcal.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🍟 Die Extras</h3>
                  <p>
                    Pommes, Käse und Halloumi treiben die Kalorien schnell nach oben.
                    Eine Döner Box mit Pommes kann über <strong>900 kcal</strong> erreichen!
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
              5 Tipps für einen kalorienärmeren Döner
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">🍗</span>
                  <div>
                    <h3 className="font-bold">Hähnchen statt Kalb wählen</h3>
                    <p className="text-sm opacity-70">
                      Spart ca. 40-60 kcal und liefert mehr Protein bei weniger Fett.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">🥛</span>
                  <div>
                    <h3 className="font-bold">Joghurt-Sauce statt Knoblauch-Sauce</h3>
                    <p className="text-sm opacity-70">
                      Nur 40 kcal statt 80-100 kcal – und trotzdem lecker!
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">🥗</span>
                  <div>
                    <h3 className="font-bold">Extra viel Salat bestellen</h3>
                    <p className="text-sm opacity-70">
                      Salat füllt den Döner ohne Kalorien. Frag nach extra Tomaten, Gurken und Kohl!
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">🫓</span>
                  <div>
                    <h3 className="font-bold">Döner-Teller statt Brot</h3>
                    <p className="text-sm opacity-70">
                      Lass das Brot weg und nimm einen Döner-Teller mit Salat – spart 200+ kcal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body py-4 flex-row gap-4 items-center">
                  <span className="text-3xl">📏</span>
                  <div>
                    <h3 className="font-bold">Normale Portion wählen</h3>
                    <p className="text-sm opacity-70">
                      XXL-Döner klingen verlockend, haben aber 50% mehr Kalorien!
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
                  Wie viele Kalorien hat ein normaler Döner?
                </div>
                <div className="collapse-content">
                  <p>
                    Ein klassischer Döner Kebab im Fladenbrot hat durchschnittlich{" "}
                    <strong>550-650 kcal</strong>. Die genaue Kalorienzahl hängt von der Fleischart,
                    Sauce und Portionsgrösse ab. Mit Hähnchen und Joghurt-Sauce sind es ca. 500 kcal.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Was hat weniger Kalorien: Döner oder Dürüm?
                </div>
                <div className="collapse-content">
                  <p>
                    <strong>Der Unterschied ist gering.</strong> Ein Dürüm hat oft sogar etwas mehr
                    Kalorien (600-700 kcal), weil mehr Fleisch reinpasst. Das dünnere Yufka-Brot spart
                    zwar Kalorien beim Teig, aber die grössere Füllung gleicht das aus.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Ist Döner gut zum Abnehmen?
                </div>
                <div className="collapse-content">
                  <p>
                    Ein Döner kann in eine Diät passen, wenn du ihn <strong>bewusst wählst</strong>:
                    Hähnchen statt Kalb, Joghurt-Sauce, viel Salat. Mit 500-550 kcal ist er eine
                    sättigende Mahlzeit mit viel Protein. Vermeide aber Döner Box und XXL-Portionen!
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Hat Döner mehr Kalorien als ein Big Mac?
                </div>
                <div className="collapse-content">
                  <p>
                    <strong>Ja, meistens.</strong> Ein Big Mac hat 509 kcal, ein durchschnittlicher
                    Döner 550-650 kcal. Allerdings hat der Döner mehr Protein (35g vs. 26g) und mehr
                    Gemüse. Ein Hähnchen-Döner mit Joghurt-Sauce kommt dem Big Mac näher.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Wie viel Protein hat ein Döner?
                </div>
                <div className="collapse-content">
                  <p>
                    Ein klassischer Döner liefert etwa <strong>30-40g Protein</strong> – hauptsächlich
                    aus dem Fleisch. Das entspricht etwa 50-70% des täglichen Bedarfs. Hähnchen-Döner
                    hat sogar noch etwas mehr Protein bei weniger Fett.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Was ist die kalorienärmste Döner-Variante?
                </div>
                <div className="collapse-content">
                  <p>
                    Die kalorienärmste Option ist ein <strong>Döner-Teller mit Salat</strong>
                    (ohne Brot, ohne Pommes) mit Hähnchenfleisch und Joghurt-Sauce: ca. 350-400 kcal.
                    Alternativ: Vegetarischer Döner mit Falafel (ca. 450-520 kcal).
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

export default DoenerKalorienRechnerPage;
