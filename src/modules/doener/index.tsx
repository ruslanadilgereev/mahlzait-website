import { useState } from "react";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

import AuthorByline from "@components/AuthorByline";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";
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
    baseCalories: 280,
    baseProtein: 8,
    baseCarbs: 50,
    baseFat: 5,
    icon: "🥙",
    description: "Klassischer Döner im Fladenbrot mit Salat",
  },
  {
    id: "dueruem",
    name: "Dürüm Döner",
    baseCalories: 300,
    baseProtein: 8,
    baseCarbs: 55,
    baseFat: 6,
    icon: "🌯",
    description: "Döner im dünnen Yufka-Teigfladen",
  },
  {
    id: "teller",
    name: "Döner Teller",
    baseCalories: 350,
    baseProtein: 6,
    baseCarbs: 65,
    baseFat: 5,
    icon: "🍽️",
    description: "Döner mit Reis auf dem Teller",
  },
  {
    id: "box",
    name: "Döner Box / Pomm-Döner",
    baseCalories: 420,
    baseProtein: 6,
    baseCarbs: 60,
    baseFat: 18,
    icon: "📦",
    description: "Pommes mit Dönerfleisch und Sauce",
  },
  {
    id: "lahmacun",
    name: "Lahmacun mit Döner",
    baseCalories: 310,
    baseProtein: 12,
    baseCarbs: 45,
    baseFat: 8,
    icon: "🫓",
    description: "Türkische Pizza mit Dönerfleisch",
  },
  {
    id: "pide",
    name: "Pide mit Döner",
    baseCalories: 380,
    baseProtein: 14,
    baseCarbs: 55,
    baseFat: 12,
    icon: "🥖",
    description: "Türkisches Fladenbrot gefüllt mit Döner",
  },
  {
    id: "vegetarisch",
    name: "Vegetarischer Döner / Falafel",
    baseCalories: 350,
    baseProtein: 14,
    baseCarbs: 45,
    baseFat: 16,
    icon: "🧆",
    description: "Mit Falafel statt Fleisch",
  },
];

const meatTypes: MeatType[] = [
  {
    id: "kalb",
    name: "Kalb-/Rindfleisch",
    calorieModifier: 280,
    proteinModifier: 28,
    fatModifier: 18,
    icon: "🥩",
  },
  {
    id: "haehnchen",
    name: "Hähnchenfleisch",
    calorieModifier: 220,
    proteinModifier: 32,
    fatModifier: 10,
    icon: "🍗",
  },
  {
    id: "gemischt",
    name: "Gemischtes Fleisch",
    calorieModifier: 250,
    proteinModifier: 30,
    fatModifier: 14,
    icon: "🍖",
  },
  {
    id: "lamm",
    name: "Lammfleisch",
    calorieModifier: 310,
    proteinModifier: 26,
    fatModifier: 22,
    icon: "🐑",
  },
];

const sauceTypes: SauceType[] = [
  { id: "joghurt", name: "Joghurt-Sauce (Cacık)", calories: 60, fat: 4, icon: "🥛" },
  { id: "knoblauch", name: "Knoblauch-Sauce", calories: 180, fat: 18, icon: "🧄" },
  { id: "cocktail", name: "Cocktail-Sauce", calories: 150, fat: 14, icon: "🍹" },
  { id: "scharf", name: "Scharfe Sauce", calories: 25, fat: 1, icon: "🌶️" },
  { id: "krauter", name: "Kräuter-Sauce", calories: 80, fat: 7, icon: "🌿" },
  { id: "ohne", name: "Ohne Sauce", calories: 0, fat: 0, icon: "❌" },
];

const extraTypes: ExtraType[] = [
  { id: "kaese", name: "Käse", calories: 80, icon: "🧀" },
  { id: "pommes", name: "Extra Pommes", calories: 150, icon: "🍟" },
  { id: "halloumi", name: "Halloumi", calories: 100, icon: "🧀" },
  { id: "schafkaese", name: "Schafskäse/Feta", calories: 70, icon: "🧀" },
];

const doenerCalorieTable = [
  { name: "Döner Kebab, Kalb", portion: 350, calories: 650, range: "550 bis 750", protein: 35, carbs: 50, fat: 32 },
  { name: "Döner Kebab, Hähnchen", portion: 350, calories: 550, range: "480 bis 620", protein: 38, carbs: 50, fat: 22 },
  { name: "Dürüm (Yufka)", portion: 400, calories: 700, range: "620 bis 800", protein: 38, carbs: 55, fat: 35 },
  { name: "Döner mit Käse", portion: 380, calories: 750, range: "680 bis 850", protein: 38, carbs: 52, fat: 40 },
  { name: "Döner-Box mit Pommes", portion: 450, calories: 900, range: "800 bis 1.000", protein: 32, carbs: 80, fat: 48 },
  { name: "Döner-Teller mit Reis", portion: 500, calories: 820, range: "750 bis 900", protein: 40, carbs: 90, fat: 30 },
  { name: "Döner-Teller mit Salat, ohne Brot", portion: 350, calories: 400, range: "350 bis 450", protein: 35, carbs: 12, fat: 24 },
  { name: "Lahmacun mit Dönerfleisch", portion: 350, calories: 600, range: "540 bis 700", protein: 30, carbs: 60, fat: 25 },
  { name: "Falafel-Döner (vegetarisch)", portion: 350, calories: 580, range: "480 bis 620", protein: 18, carbs: 65, fat: 26 },
  { name: "Kinder-Döner", portion: 200, calories: 380, range: "330 bis 420", protein: 20, carbs: 30, fat: 18 },
];

function DoenerKalorienRechnerPage({ config }: Props) {
  const [selectedDoener, setSelectedDoener] = useState<string>("classic");
  const [selectedMeat, setSelectedMeat] = useState<string>("kalb");
  const [selectedSauces, setSelectedSauces] = useState<string[]>(["joghurt"]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [portionSize, setPortionSize] = useState<number>(100);
  const [result, setResult] = useState<DoenerResult | null>(null);

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId) ? prev.filter((e) => e !== extraId) : [...prev, extraId]
    );
  };

  const toggleSauce = (sauceId: string) => {
    if (sauceId === "ohne") {
      setSelectedSauces(["ohne"]);
      return;
    }
    setSelectedSauces((prev) => {
      const filtered = prev.filter((s) => s !== "ohne");
      if (filtered.includes(sauceId)) {
        const result = filtered.filter((s) => s !== sauceId);
        return result.length === 0 ? ["ohne"] : result;
      }
      return [...filtered, sauceId];
    });
  };

  const calculateCalories = () => {
    const doener = doenerTypes.find((d) => d.id === selectedDoener)!;
    const meat = meatTypes.find((m) => m.id === selectedMeat);

    // Für vegetarische Option kein Fleisch addieren
    const isVegetarian = selectedDoener === "vegetarisch";
    const meatCalories = isVegetarian ? 0 : (meat?.calorieModifier || 0);
    const meatProtein = isVegetarian ? 0 : (meat?.proteinModifier || 0);
    const meatFat = isVegetarian ? 0 : (meat?.fatModifier || 0);

    const sauceCaloriesTotal = selectedSauces.reduce((sum, sauceId) => {
      const sauce = sauceTypes.find((s) => s.id === sauceId);
      return sum + (sauce?.calories || 0);
    }, 0);

    const sauceFatTotal = selectedSauces.reduce((sum, sauceId) => {
      const sauce = sauceTypes.find((s) => s.id === sauceId);
      return sum + (sauce?.fat || 0);
    }, 0);

    const extrasCalories = selectedExtras.reduce((sum, extraId) => {
      const extra = extraTypes.find((e) => e.id === extraId);
      return sum + (extra?.calories || 0);
    }, 0);

    // Portionsgrösse berücksichtigen (100% = normale Portion)
    const portionMultiplier = portionSize / 100;

    const baseCaloriesAdjusted = doener.baseCalories * portionMultiplier;
    const meatCaloriesAdjusted = meatCalories * portionMultiplier;
    const sauceCaloriesAdjusted = sauceCaloriesTotal;
    const extrasCaloriesAdjusted = extrasCalories;

    const totalCalories = Math.round(
      baseCaloriesAdjusted + meatCaloriesAdjusted + sauceCaloriesAdjusted + extrasCaloriesAdjusted
    );

    const totalProtein = Math.round((doener.baseProtein + meatProtein) * portionMultiplier);
    const totalCarbs = Math.round(doener.baseCarbs * portionMultiplier);
    const totalFat = Math.round((doener.baseFat + meatFat + sauceFatTotal) * portionMultiplier);

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
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Döner-Kalorien-Rechner", url: "/doener-kalorien-rechner/" },
        ]} />

        {/* Kopf: Antwort zuerst */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-14">
          <header className="max-w-2xl mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Wie viele Kalorien hat ein Döner? Alle Varianten im Vergleich
            </h1>
            <AuthorByline role="Gründer von Mahlzait" publishedAt="2025-12-09" updatedAt="2026-09-17" />
            <p className="text-lg md:text-xl opacity-80">
              Ein klassischer Döner Kebab mit Kalbfleisch wiegt rund 350 g und liefert etwa <strong>650 kcal</strong>,
              je nach Imbiss 550 bis 750. Mit Hähnchen sind es etwa 550 kcal, ein Dürüm kommt auf 700, eine Döner-Box
              mit Pommes auf 800 bis 1.000. Dazu 35 bis 40 g Eiweiß, 50 g Kohlenhydrate und 22 bis 35 g Fett.
            </p>
          </header>

          <div className="prose prose-lg max-w-2xl mb-12">
            <p>
              Die Spanne ist groß, weil drei Dinge den Wert bestimmen: das Fleisch (Kalb oder Hähnchen, 100 bis 150 g),
              die Soße (Joghurt 60 kcal, Knoblauch-Mayo 180 kcal) und die Portion. Die Tabelle unten zeigt alle gängigen
              Varianten mit Portionsgewicht und Makros; der Rechner darunter setzt deinen Döner Stück für Stück zusammen.
            </p>
          </div>

          {/* Rechner */}
          <div className="card bg-base-200 max-w-2xl">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Deinen Döner zusammenstellen</h2>

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

              {/* Sauce Selection (Multi-Select) */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">
                  {isVegetarian ? "2" : "3"}. Saucen wählen (mehrere möglich)
                </span>
                <div className="flex flex-wrap gap-2">
                  {sauceTypes.map((sauce) => (
                    <button
                      key={sauce.id}
                      onClick={() => toggleSauce(sauce.id)}
                      className={`btn btn-sm ${
                        selectedSauces.includes(sauce.id) ? "btn-primary" : "btn-outline"
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
                    {selectedSauces.filter(s => s !== "ohne").length > 0 && (
                      <span className="block text-sm opacity-60 mt-1">
                        Saucen: {selectedSauces.filter(s => s !== "ohne").map(s => sauceTypes.find(st => st.id === s)?.name).join(", ")}
                      </span>
                    )}
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-emerald-500">
                          {result.protein}g
                        </div>
                        <div className="text-sm opacity-70">Protein</div>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-amber-500">
                          {result.carbs}g
                        </div>
                        <div className="text-sm opacity-70">Kohlenhydrate</div>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-rose-500">
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
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabelle */}
        <section className="max-w-screen-lg mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Döner-Kalorientabelle: alle Varianten</h2>
          <p className="opacity-80 max-w-2xl mb-6">
            Referenzportionen, wie sie in Deutschland üblich sind. Der Mittelwert steht fett, daneben die Spanne,
            die wir in Nährwertangaben von Imbissen und Ketten gefunden haben. Makros beziehen sich auf den Mittelwert.
          </p>
          <div className="overflow-x-auto max-w-4xl">
            <table className="table bg-base-200">
              <thead>
                <tr>
                  <th>Variante</th>
                  <th className="text-right">Portion</th>
                  <th className="text-right">kcal</th>
                  <th className="text-right">Spanne</th>
                  <th className="text-right">Eiweiß</th>
                  <th className="text-right">Kohlenhydrate</th>
                  <th className="text-right">Fett</th>
                </tr>
              </thead>
              <tbody>
                {doenerCalorieTable.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td className="text-right">{item.portion} g</td>
                    <td className="text-right font-semibold">{item.calories}</td>
                    <td className="text-right opacity-70">{item.range}</td>
                    <td className="text-right">{item.protein} g</td>
                    <td className="text-right">{item.carbs} g</td>
                    <td className="text-right">{item.fat} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prose prose-lg max-w-2xl mt-12">
            <h2>Woher die Kalorien kommen</h2>
            <p>
              Ein Döner ist keine Kalorienbombe wegen des Gemüses, sondern wegen dreier Zutaten, die sich addieren.
              Das <strong>Fladenbrot</strong> (ein Viertel eines großen Pide, etwa 120 g) bringt 250 bis 300 kcal, fast
              ausschließlich Kohlenhydrate. Das <strong>Fleisch</strong> liefert je nach Sorte 220 bis 310 kcal auf die
              üblichen 100 bis 150 g: Hähnchenspieße sind mager, Kalb- und Lammspieße enthalten sichtbar mehr Fett, weil
              die Scheiben mit Fettgewebe geschichtet werden. Die <strong>Soße</strong> ist der Posten, den die meisten
              unterschätzen: Knoblauch- und Cocktailsoße basieren auf Mayonnaise und liegen bei 150 bis 180 kcal pro
              Portion, Joghurtsoße bei 60, scharfe Soße bei 25.
            </p>
            <p>
              Alles, was danach kommt, ist Aufschlag: Käse plus 80, Halloumi plus 100, eine Portion Pommes in der Box
              plus 150 bis 250 kcal. So entsteht die Spanne von 550 bis 1.000 kcal bei einem Gericht, das auf der
              Karte gleich heißt.
            </p>

            <h2>Döner, Dürüm, Teller, Box: was ist die leichteste Wahl?</h2>
            <p>
              <strong>Der Döner-Teller mit Salat</strong> ist mit 350 bis 450 kcal die leichteste Variante, weil das Brot
              wegfällt. Er hat trotzdem 35 g Eiweiß und sättigt entsprechend. Mit Reis oder Pommes verliert er diesen
              Vorteil sofort.
            </p>
            <p>
              <strong>Der Dürüm</strong> spart mit dem dünnen Yufka-Teig gegenüber dem Fladenbrot rund 50 kcal, hat aber
              meistens mehr Füllung. Unterm Strich landet er bei 700 kcal, also etwas über dem klassischen Döner.
            </p>
            <p>
              <strong>Die Döner-Box</strong> ist die schwerste Variante. Pommes plus Soße plus Fleisch ohne Salatanteil
              ergeben 800 bis 1.000 kcal, oft mit über 45 g Fett.
            </p>
            <p>
              <strong>Lahmacun</strong> mit Dönerfleisch liegt bei rund 600 kcal. Der Teig ist dünner als beim Fladenbrot,
              aber die gerollte Portion ist größer. Ohne Fleisch, nur mit Salat und Zitrone, sind es etwa 350 kcal.
            </p>

            <h2>Döner beim Abnehmen: so passt er ins Defizit</h2>
            <p>
              Ein Hähnchen-Döner mit Joghurtsoße und extra Salat hat rund 550 kcal und 38 g Eiweiß. Das ist eine
              vollwertige Mahlzeit mit einem Eiweißanteil, den viele Fertiggerichte nicht erreichen. Bei einem
              <a href="/kalorienbedarf-berechnen/"> Tagesbedarf</a> von 2.200 kcal bleibt damit Platz für zwei weitere
              Mahlzeiten.
            </p>
            <ul>
              <li>Hähnchen statt Kalb: spart etwa 100 kcal und liefert mehr Eiweiß.</li>
              <li>Joghurt statt Knoblauchsoße: spart 120 kcal. Scharfe Soße statt Cocktail: spart 125 kcal.</li>
              <li>Kein Käse, keine Pommes: spart 80 bis 250 kcal.</li>
              <li>Extra Salat kostet nichts und macht das Brot kleiner, weil es weniger Platz hat.</li>
              <li>Normale Größe statt XXL: Ein XXL-Döner wiegt 500 g und mehr, das sind 900 bis 1.100 kcal.</li>
            </ul>
            <p>
              Wer den Döner als Abendessen einplant, isst mittags leicht. Wer ihn zusätzlich zu drei normalen Mahlzeiten
              isst, hat an dem Tag ein Plus von 600 kcal, und das ist der eigentliche Grund, warum Döner in den Ruf
              geraten ist, dick zu machen.
            </p>

            <h2>Wie lange muss man dafür laufen?</h2>
            <p>
              Ein 75 kg schwerer Mensch verbrennt beim Joggen mit 9 km/h knapp 12 kcal pro Minute. Für einen
              Kalb-Döner mit 650 kcal sind das etwa 55 Minuten, für eine Döner-Box 70 bis 85 Minuten. Der
              <a href="/kalorienverbrauch-joggen/"> Kalorienverbrauch-Rechner fürs Joggen</a> rechnet das für dein Gewicht
              und Tempo aus. Die Rechnung zeigt vor allem, dass Sport ein Essen nicht ausgleicht, sondern die Bilanz
              über den Tag entscheidet.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-screen-lg mx-auto px-4 pb-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Häufige Fragen</h2>
            <div className="space-y-3">
              {[
                {
                  q: "Wie viele Kalorien hat ein normaler Döner?",
                  a: "Ein klassischer Döner Kebab im Fladenbrot mit Kalbfleisch hat rund 650 kcal bei etwa 350 g, je nach Imbiss 550 bis 750. Mit Hähnchen und Joghurtsoße sind es etwa 550 kcal.",
                },
                {
                  q: "Wie viele Kalorien hat ein Dürüm?",
                  a: "Ein Dürüm liegt bei rund 700 kcal für 400 g. Der Yufka-Teig ist leichter als Fladenbrot, aber die Rolle fasst mehr Fleisch und Soße, deshalb landet er etwas über dem Döner.",
                },
                {
                  q: "Was hat weniger Kalorien: Döner oder Dürüm?",
                  a: "Der Döner, aber nur knapp: 650 gegenüber 700 kcal. Entscheidender als die Hülle sind Fleischsorte und Soße.",
                },
                {
                  q: "Wie viel Eiweiß hat ein Döner?",
                  a: "35 bis 40 g, hauptsächlich aus dem Fleisch. Ein Hähnchen-Döner liegt am oberen Ende. Das ist etwa die Hälfte dessen, was ein 80 kg schwerer Mensch am Tag braucht.",
                },
                {
                  q: "Hat ein Döner mehr Kalorien als ein Big Mac?",
                  a: "Ja. Ein Big Mac hat 503 kcal, ein Kalb-Döner rund 650. Der Döner liefert dafür 35 g Eiweiß statt 26 g und deutlich mehr Gemüse; pro Kalorie ist er die nahrhaftere Mahlzeit.",
                },
                {
                  q: "Was ist die kalorienärmste Döner-Variante?",
                  a: "Der Döner-Teller mit Salat, ohne Brot, Reis und Pommes, mit Hähnchen und Joghurtsoße: 350 bis 450 kcal bei 35 g Eiweiß.",
                },
                {
                  q: "Wie viele Kalorien hat eine Döner-Box?",
                  a: "800 bis 1.000 kcal. Pommes, Fleisch und Soße ohne den Salatanteil des Fladenbrots machen sie zur schwersten Variante.",
                },
              ].map((faq) => (
                <div key={faq.q} className="collapse collapse-plus bg-base-200">
                  <input type="radio" name="faq" aria-label={faq.q} />
                  <div className="collapse-title text-lg font-medium">{faq.q}</div>
                  <div className="collapse-content">
                    <p className="opacity-80">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="prose max-w-2xl mt-12">
              <h2>Weiterlesen</h2>
              <ul>
                <li><a href="/fastfood-kalorien/">Fast-Food-Kalorien im Vergleich</a>: 100 Gerichte von McDonald's bis Subway</li>
                <li><a href="/kalorien/lahmacun/">Lahmacun</a> und <a href="/kalorien/durum-kebab/">Dürüm</a> im Detail</li>
                <li><a href="/kaloriendefizit-berechnen/">Kaloriendefizit berechnen</a>: wie viel Platz ein Döner im Tag hat</li>
              </ul>
              <p className="text-sm">
                Wer wissen will, was der Döner vom eigenen Imbiss hat: Die{" "}
                <a href={getTrackedAppLink({ platform: "ios", source: "calculator" })} onClick={() => trackAppStoreClick("ios", "calculator")}>Mahlzait-App</a>{" "}
                schätzt Portionen per Foto. Die Tabelle oben reicht für die meisten Fälle.
              </p>
            </div>
          </div>
        </section>

        <RelatedWissen calculatorSlug="doener-kalorien-rechner" />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default DoenerKalorienRechnerPage;
