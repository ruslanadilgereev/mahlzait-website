import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface DrinkPreset {
  name: string;
  volume: number;
  alcoholPercent: number;
  icon: string;
}

interface AlcoholResult {
  calories: number;
  pureAlcoholGrams: number;
  equivalent: {
    beer: number;
    wine: number;
    shots: number;
  };
}

const ETHANOL_DENSITY = 0.789; // g/ml - Dichte von Ethanol
const CALORIES_PER_GRAM = 7; // kcal pro Gramm reiner Alkohol

const drinkPresets: DrinkPreset[] = [
  { name: "Bier (0.5L)", volume: 500, alcoholPercent: 5, icon: "🍺" },
  { name: "Bier (0.33L)", volume: 330, alcoholPercent: 5, icon: "🍺" },
  { name: "Weizen (0.5L)", volume: 500, alcoholPercent: 5.4, icon: "🍺" },
  { name: "Pils (0.5L)", volume: 500, alcoholPercent: 4.9, icon: "🍺" },
  { name: "Radler (0.5L)", volume: 500, alcoholPercent: 2.5, icon: "🍺" },
  { name: "Rotwein (200ml)", volume: 200, alcoholPercent: 13, icon: "🍷" },
  { name: "Weisswein (200ml)", volume: 200, alcoholPercent: 11.5, icon: "🥂" },
  { name: "Sekt (100ml)", volume: 100, alcoholPercent: 11, icon: "🥂" },
  { name: "Prosecco (100ml)", volume: 100, alcoholPercent: 11, icon: "🥂" },
  { name: "Wodka Shot (40ml)", volume: 40, alcoholPercent: 40, icon: "🥃" },
  { name: "Whisky (40ml)", volume: 40, alcoholPercent: 40, icon: "🥃" },
  { name: "Rum (40ml)", volume: 40, alcoholPercent: 40, icon: "🥃" },
  { name: "Gin (40ml)", volume: 40, alcoholPercent: 37.5, icon: "🍸" },
  { name: "Tequila Shot (40ml)", volume: 40, alcoholPercent: 38, icon: "🥃" },
  { name: "Jägermeister (40ml)", volume: 40, alcoholPercent: 35, icon: "🥃" },
  { name: "Aperol Spritz (200ml)", volume: 200, alcoholPercent: 8, icon: "🍹" },
  { name: "Hugo (200ml)", volume: 200, alcoholPercent: 6, icon: "🍹" },
  { name: "Gin Tonic (300ml)", volume: 300, alcoholPercent: 10, icon: "🍸" },
  { name: "Mojito (300ml)", volume: 300, alcoholPercent: 10, icon: "🍹" },
  { name: "Long Island Iced Tea (300ml)", volume: 300, alcoholPercent: 22, icon: "🍹" },
];

function AlkoholKalorienRechnerPage({ config }: Props) {
  const [volume, setVolume] = useState(500);
  const [alcoholPercent, setAlcoholPercent] = useState(5);
  const [selectedPreset, setSelectedPreset] = useState<string>("Bier (0.5L)");
  const [result, setResult] = useState<AlcoholResult | null>(null);

  const calculateAlcoholCalories = () => {
    // Exakte Formel: Kalorien = Menge (ml) × Vol.% × 0.01 × Dichte (g/ml) × kcal/g
    // Quelle: Ethanol-Dichte 0.789 g/ml, Brennwert 7 kcal/g
    const pureAlcoholMl = volume * (alcoholPercent / 100);
    const pureAlcoholGrams = pureAlcoholMl * ETHANOL_DENSITY;
    const calories = pureAlcoholGrams * CALORIES_PER_GRAM;

    // Berechne Äquivalente (basierend auf Standard-Getränken)
    const standardBeerCalories = 500 * 0.05 * ETHANOL_DENSITY * CALORIES_PER_GRAM; // ~138 kcal
    const standardWineCalories = 200 * 0.12 * ETHANOL_DENSITY * CALORIES_PER_GRAM; // ~133 kcal
    const standardShotCalories = 40 * 0.40 * ETHANOL_DENSITY * CALORIES_PER_GRAM; // ~88 kcal

    setResult({
      calories: Math.round(calories),
      pureAlcoholGrams: Math.round(pureAlcoholGrams * 10) / 10,
      equivalent: {
        beer: Math.round((calories / standardBeerCalories) * 10) / 10,
        wine: Math.round((calories / standardWineCalories) * 10) / 10,
        shots: Math.round((calories / standardShotCalories) * 10) / 10,
      },
    });
  };

  const handlePresetSelect = (preset: DrinkPreset) => {
    setSelectedPreset(preset.name);
    setVolume(preset.volume);
    setAlcoholPercent(preset.alcoholPercent);
  };

  const getCalorieComparison = (calories: number) => {
    const comparisons = [
      { name: "Scheiben Brot", amount: Math.round((calories / 75) * 10) / 10, emoji: "🍞" },
      { name: "Äpfel", amount: Math.round((calories / 52) * 10) / 10, emoji: "🍎" },
      { name: "Stücke Pizza", amount: Math.round((calories / 266) * 10) / 10, emoji: "🍕" },
      { name: "Minuten Joggen", amount: Math.round(calories / 10), emoji: "🏃" },
      { name: "Minuten Spazieren", amount: Math.round(calories / 4), emoji: "🚶" },
    ];
    return comparisons;
  };

  const alcoholTable = [
    { drink: "Bier (0.5L, 5%)", calories: 138, alcohol: 15.8 },
    { drink: "Weisswein (200ml, 11.5%)", calories: 127, alcohol: 18.2 },
    { drink: "Rotwein (200ml, 13%)", calories: 144, alcohol: 20.5 },
    { drink: "Wodka Shot (40ml, 40%)", calories: 88, alcohol: 12.6 },
    { drink: "Gin Tonic (300ml, 10%)", calories: 166, alcohol: 23.7 },
    { drink: "Aperol Spritz (200ml, 8%)", calories: 88, alcohol: 12.6 },
    { drink: "Long Island Iced Tea (300ml, 22%)", calories: 365, alcohol: 52.1 },
  ];

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Alkohol Kalorien Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne die Kalorien in alkoholischen Getränken. Mit exakter wissenschaftlicher Formel: 
              1 Gramm Alkohol = 7 kcal.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-6">Kalorien berechnen</h2>

              {/* Drink Presets */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Beliebte Getränke</span>
                <div className="flex flex-wrap gap-2">
                  {drinkPresets.slice(0, 12).map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className={`btn btn-sm ${
                        selectedPreset === preset.name ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {preset.icon} {preset.name}
                    </button>
                  ))}
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm opacity-70 hover:opacity-100">
                    Mehr Getränke anzeigen...
                  </summary>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {drinkPresets.slice(12).map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        className={`btn btn-sm ${
                          selectedPreset === preset.name ? "btn-primary" : "btn-outline"
                        }`}
                      >
                        {preset.icon} {preset.name}
                      </button>
                    ))}
                  </div>
                </details>
              </div>

              <div className="divider">Oder manuell eingeben</div>

              {/* Volume Input */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Menge</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={volume}
                      onChange={(e) => {
                        setVolume(Math.min(1000, Math.max(10, Number(e.target.value))));
                        setSelectedPreset("");
                      }}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">ml</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setSelectedPreset("");
                  }}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>10ml</span>
                  <span>250ml</span>
                  <span>500ml</span>
                  <span>750ml</span>
                  <span>1000ml</span>
                </div>
              </div>

              {/* Alcohol Percent Input */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Alkoholgehalt</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="0.5"
                      max="96"
                      step="0.1"
                      value={alcoholPercent}
                      onChange={(e) => {
                        setAlcoholPercent(Math.min(96, Math.max(0.5, Number(e.target.value))));
                        setSelectedPreset("");
                      }}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">Vol.%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={alcoholPercent}
                  onChange={(e) => {
                    setAlcoholPercent(Number(e.target.value));
                    setSelectedPreset("");
                  }}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>0.5%</span>
                  <span>12%</span>
                  <span>25%</span>
                  <span>37%</span>
                  <span>50%</span>
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateAlcoholCalories}>
                🍺 Kalorien berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">
                      {result.calories} kcal
                    </div>
                    <div className="text-xl font-semibold mt-2 opacity-70">
                      {result.pureAlcoholGrams}g reiner Alkohol
                    </div>
                  </div>

                  {/* Calorie Comparison */}
                  <div className="grid gap-3 md:grid-cols-5 mt-6">
                    {getCalorieComparison(result.calories).map((item, i) => (
                      <div key={i} className="card bg-base-200">
                        <div className="card-body py-3 px-2 text-center">
                          <div className="text-2xl">{item.emoji}</div>
                          <p className="text-xl font-bold text-primary">{item.amount}</p>
                          <p className="text-xs opacity-70">{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Drink Equivalents */}
                  <div className="card bg-base-200 mt-4">
                    <div className="card-body py-4">
                      <h3 className="font-semibold mb-3">Das entspricht...</h3>
                      <div className="grid gap-2 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🍺</span>
                          <span><strong>{result.equivalent.beer}</strong> Bier (0.5L)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🍷</span>
                          <span><strong>{result.equivalent.wine}</strong> Gläser Wein</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🥃</span>
                          <span><strong>{result.equivalent.shots}</strong> Shots</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Health Warning */}
                  {result.pureAlcoholGrams > 20 && (
                    <div className="alert alert-warning mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Hinweis zur Gesundheit</p>
                        <p className="text-sm">
                          Die DGE empfiehlt maximal 10g Alkohol/Tag für Frauen und 20g für Männer.
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
                      <p className="font-semibold">Behalte den Überblick mit Mahlzait!</p>
                      <p className="text-sm">
                        Tracke alle Kalorien – auch aus Getränken – einfach per Foto.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Formula Explanation */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              So berechnen wir die Kalorien
            </h2>
            
            <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
              <div className="card-body">
                <h3 className="font-bold text-lg mb-4">Die exakte Formel</h3>
                
                <div className="bg-base-200 p-4 rounded-lg font-mono text-center text-lg mb-6">
                  Kalorien = Menge × Vol.% × 0,01 × 0,789 × 7
                </div>

                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="badge badge-primary">1</span>
                    <span><strong>Menge (ml)</strong> – Das Volumen deines Getränks</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-primary">2</span>
                    <span><strong>Vol.% × 0,01</strong> – Umrechnung in Dezimalzahl (5% = 0,05)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-primary">3</span>
                    <span><strong>0,789 g/ml</strong> – Dichte von reinem Ethanol (Alkohol)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="badge badge-primary">4</span>
                    <span><strong>7 kcal/g</strong> – Brennwert von Alkohol pro Gramm</span>
                  </li>
                </ul>

                <div className="divider">Beispiel</div>

                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="font-semibold mb-2">🍺 Ein Bier (500ml, 5% Vol.):</p>
                  <p className="font-mono text-sm">
                    500 × 0,05 × 0,789 × 7 = <strong>138 kcal</strong>
                  </p>
                  <p className="text-sm opacity-70 mt-2">
                    (enthält 19,7g reinen Alkohol)
                  </p>
                </div>

                <p className="text-sm opacity-70 mt-4">
                  <strong>Hinweis:</strong> Diese Berechnung zeigt nur die Kalorien aus dem Alkohol. 
                  Cocktails und Mischgetränke enthalten zusätzlich Kalorien aus Zucker und anderen Zutaten.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Alcohol Calorie Table */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Kalorientabelle alkoholischer Getränke
            </h2>
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Getränk</th>
                    <th className="text-right">Kalorien</th>
                    <th className="text-right">Alkohol (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {alcoholTable.map((item, i) => (
                    <tr key={i}>
                      <td>{item.drink}</td>
                      <td className="text-right font-mono">{item.calories} kcal</td>
                      <td className="text-right font-mono">{item.alcohol}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Alcohol Has Calories */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum hat Alkohol so viele Kalorien?
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🔥 Hoher Brennwert</h3>
                  <p>
                    Mit <strong>7 kcal pro Gramm</strong> liegt Alkohol zwischen Kohlenhydraten/Proteinen (4 kcal/g) 
                    und Fett (9 kcal/g). Ein Gramm Alkohol liefert also fast doppelt so viel Energie wie Zucker!
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🍬 Versteckte Kalorien</h3>
                  <p>
                    Cocktails und Mischgetränke enthalten oft zusätzlich Zucker, Säfte und Sirups. 
                    Ein Piña Colada kann über 500 kcal haben – mehr als ein Big Mac!
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">⚡ Leere Kalorien</h3>
                  <p>
                    Alkohol liefert Energie, aber keine Nährstoffe. Keine Vitamine, keine Mineralstoffe, 
                    kein Protein. Der Körper kann die Kalorien nicht sinnvoll nutzen.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">🍔 Appetitsteigernd</h3>
                  <p>
                    Alkohol senkt die Hemmschwelle und steigert den Appetit. Das typische 
                    "Döner nach der Party"-Phänomen führt zu zusätzlichen Kalorien.
                  </p>
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
                  Wie viele Kalorien hat ein Glas Wein?
                </div>
                <div className="collapse-content">
                  <p>
                    Ein Glas Rotwein (200ml, 13% Vol.) enthält etwa <strong>144 kcal</strong> aus dem Alkohol. 
                    Weisswein (200ml, 11.5% Vol.) hat ca. <strong>127 kcal</strong>. Süsse Weine können 
                    durch den Restzucker noch mehr Kalorien haben.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Welcher Alkohol hat die wenigsten Kalorien?
                </div>
                <div className="collapse-content">
                  <p>
                    Pro Portion haben <strong>Spirituosen pur</strong> (Wodka, Gin, Whisky) relativ wenige 
                    Kalorien (~88 kcal pro Shot). Aber Vorsicht: Als Mischgetränk steigen die Kalorien 
                    durch Säfte und Softdrinks stark an!
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Kann man mit Alkohol abnehmen?
                </div>
                <div className="collapse-content">
                  <p>
                    Alkohol erschwert das Abnehmen erheblich. Der Körper priorisiert den Alkoholabbau 
                    und stoppt die Fettverbrennung. Ausserdem liefert Alkohol "leere" Kalorien und 
                    steigert oft den Appetit.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Warum macht Bier einen "Bierbauch"?
                </div>
                <div className="collapse-content">
                  <p>
                    Ein halber Liter Bier hat ca. <strong>210-250 kcal</strong> (inkl. Kohlenhydrate). 
                    Bei regelmässigem Konsum summiert sich das. Zudem fördert Alkohol die Fetteinlagerung 
                    am Bauch. Der Bier-Mythos stimmt also – es sind einfach zu viele Kalorien!
                  </p>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-100 shadow">
                <input type="radio" name="faq" />
                <div className="collapse-title text-lg font-medium">
                  Hat alkoholfreies Bier auch Kalorien?
                </div>
                <div className="collapse-content">
                  <p>
                    Ja, aber weniger. Alkoholfreies Bier (0.5L) hat etwa <strong>80-130 kcal</strong> 
                    aus den Kohlenhydraten. Das ist etwa halb so viel wie normales Bier. Manche 
                    "alkoholfreie" Biere haben noch 0.5% Vol. – also minimal Kalorien aus Alkohol.
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

export default AlkoholKalorienRechnerPage;
