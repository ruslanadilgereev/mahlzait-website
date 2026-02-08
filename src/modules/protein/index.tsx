import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface ProteinResult {
  minimum: number;
  optimal: number;
  maximum: number;
  perMeal: number;
  mealsPerDay: number;
}

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";
type Goal = "maintain" | "muscle" | "weightloss" | "endurance";

function ProteinBedarfRechnerPage({ config }: Props) {
  const [weight, setWeight] = useState(75);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [result, setResult] = useState<ProteinResult | null>(null);

  const activityMultipliers: Record<ActivityLevel, { min: number; max: number; label: string; desc: string }> = {
    sedentary: { min: 0.8, max: 1.0, label: "Wenig aktiv", desc: "Bürojob, kaum Sport" },
    light: { min: 1.0, max: 1.2, label: "Leicht aktiv", desc: "1-2x Sport pro Woche" },
    moderate: { min: 1.2, max: 1.4, label: "Mässig aktiv", desc: "3-4x Sport pro Woche" },
    active: { min: 1.4, max: 1.6, label: "Sehr aktiv", desc: "5-6x Sport pro Woche" },
    athlete: { min: 1.6, max: 2.2, label: "Athlet", desc: "Tägliches intensives Training" },
  };

  const goalMultipliers: Record<Goal, { factor: number; label: string; desc: string }> = {
    maintain: { factor: 1.0, label: "Gewicht halten", desc: "Allgemeine Gesundheit" },
    muscle: { factor: 1.2, label: "Muskelaufbau", desc: "Mehr Muskeln aufbauen" },
    weightloss: { factor: 1.1, label: "Abnehmen", desc: "Muskeln erhalten beim Abnehmen" },
    endurance: { factor: 1.0, label: "Ausdauer", desc: "Ausdauersport (Laufen, Radfahren)" },
  };

  const calculateProtein = () => {
    const activity = activityMultipliers[activityLevel];
    const goalFactor = goalMultipliers[goal].factor;

    const minimum = Math.round(weight * activity.min * goalFactor);
    const maximum = Math.round(weight * activity.max * goalFactor);
    const optimal = Math.round((minimum + maximum) / 2);

    // Optimal protein per meal: 25-40g, assuming 3-4 meals
    const mealsPerDay = optimal > 120 ? 4 : 3;
    const perMeal = Math.round(optimal / mealsPerDay);

    setResult({
      minimum,
      optimal,
      maximum,
      perMeal,
      mealsPerDay,
    });
  };

  const proteinSources = [
    { name: "Hähnchenbrust", protein: 31, serving: "100g" },
    { name: "Magerquark", protein: 12, serving: "100g" },
    { name: "Eier", protein: 13, serving: "2 Stück" },
    { name: "Lachs", protein: 20, serving: "100g" },
    { name: "Linsen (gekocht)", protein: 9, serving: "100g" },
    { name: "Griechischer Joghurt", protein: 10, serving: "100g" },
    { name: "Tofu", protein: 15, serving: "100g" },
    { name: "Whey Protein", protein: 24, serving: "30g Scoop" },
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
              Protein-Bedarf Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen optimalen täglichen Proteinbedarf basierend auf Gewicht, Aktivitätslevel und Zielen. Wissenschaftlich fundiert.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">Proteinbedarf berechnen</h2>

              {/* Weight - Prominent Display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Körpergewicht</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="40"
                      max="180"
                      value={weight}
                      onChange={(e) => setWeight(Math.min(180, Math.max(40, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">kg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>40</span>
                  <span>80</span>
                  <span>120</span>
                  <span>160</span>
                  <span>180</span>
                </div>
              </div>

              {/* Activity Level */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Aktivitätslevel</span>
                <div className="grid gap-2">
                  {Object.entries(activityMultipliers).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        activityLevel === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="activity"
                        className="radio radio-primary"
                        checked={activityLevel === key}
                        onChange={() => setActivityLevel(key as ActivityLevel)}
                      />
                      <div className="flex-1">
                        <span className="font-medium">{value.label}</span>
                        <span className="text-sm opacity-70 ml-2">({value.desc})</span>
                      </div>
                      <span className="badge badge-outline">{value.min}-{value.max}g/kg</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Dein Ziel</span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(goalMultipliers).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                        goal === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        className="radio radio-primary mb-2"
                        checked={goal === key}
                        onChange={() => setGoal(key as Goal)}
                      />
                      <span className="font-medium">{value.label}</span>
                      <span className="text-xs opacity-70">{value.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateProtein}>
                Proteinbedarf berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">
                      {result.optimal}g
                    </div>
                    <div className="text-xl font-semibold mt-2 opacity-80">
                      optimaler Proteinbedarf pro Tag
                    </div>
                  </div>

                  {/* Protein Range Visualization */}
                  <div className="relative h-12 rounded-full overflow-hidden bg-base-200">
                    <div 
                      className="absolute top-0 bottom-0 bg-primary/30"
                      style={{ 
                        left: `${(result.minimum / (result.maximum * 1.2)) * 100}%`,
                        right: `${100 - (result.maximum / (result.maximum * 1.2)) * 100}%`
                      }}
                    ></div>
                    <div 
                      className="absolute top-0 bottom-0 w-2 bg-primary rounded-full"
                      style={{ 
                        left: `${(result.optimal / (result.maximum * 1.2)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Min: <strong>{result.minimum}g</strong></span>
                    <span>Optimal: <strong className="text-primary">{result.optimal}g</strong></span>
                    <span>Max: <strong>{result.maximum}g</strong></span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Pro Mahlzeit</h3>
                        <p className="text-2xl font-bold text-primary">{result.perMeal}g</p>
                        <p className="text-xs opacity-60">bei {result.mealsPerDay} Mahlzeiten</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Pro kg Körpergewicht</h3>
                        <p className="text-2xl font-bold text-secondary">{(result.optimal / weight).toFixed(1)}g</p>
                        <p className="text-xs opacity-60">g Protein pro kg</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Kalorien aus Protein</h3>
                        <p className="text-2xl font-bold">{result.optimal * 4}</p>
                        <p className="text-xs opacity-60">kcal (4 kcal pro g)</p>
                      </div>
                    </div>
                  </div>

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
                      <p className="font-semibold">Tracke dein Protein mit Mahlzait!</p>
                      <p className="text-sm">
                        Fotografiere deine Mahlzeiten und sieh sofort den Proteingehalt. Einfacher geht's nicht.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Protein Sources Table */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Top Proteinquellen
            </h2>
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Lebensmittel</th>
                    <th>Portionsgrösse</th>
                    <th>Protein</th>
                  </tr>
                </thead>
                <tbody>
                  {proteinSources.map((source, i) => (
                    <tr key={i}>
                      <td className="font-medium">{source.name}</td>
                      <td>{source.serving}</td>
                      <td>
                        <span className="badge badge-primary">{source.protein}g</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm opacity-70 mt-4">
              Alle Angaben sind Durchschnittswerte. Die tatsächlichen Werte können je nach Produkt variieren.
            </p>
          </div>
        </section>

        {/* Explanation Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum Protein so wichtig ist
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🏋️ Muskelaufbau & -erhalt</h3>
                  <p className="opacity-80">
                    Protein ist der Baustein für Muskeln. Ohne ausreichend Protein kann dein Körper keine neuen Muskelfasern aufbauen – egal wie hart du trainierst.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Fördert Muskelproteinsynthese</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Verhindert Muskelabbau im Defizit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Beschleunigt Regeneration</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🔥 Sättigung & Abnehmen</h3>
                  <p className="opacity-80">
                    Protein hält dich länger satt als Kohlenhydrate oder Fett. Das macht es einfacher, in einem Kaloriendefizit zu bleiben.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Höchste Sättigungswirkung aller Makros</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Thermischer Effekt: 20-30% der Kalorien</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Reduziert Heisshunger</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">⏰ Timing & Verteilung</h3>
                  <p className="opacity-80">
                    Verteile dein Protein gleichmässig über den Tag. Der Körper kann pro Mahlzeit etwa 25-40g optimal verwerten.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-center">
                      <strong>Optimal: 3-4 Mahlzeiten</strong>
                    </p>
                    <p className="text-sm opacity-70 text-center mt-2">
                      Mit je 25-40g Protein pro Mahlzeit
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🥗 Tierisch vs. Pflanzlich</h3>
                  <p className="opacity-80">
                    Tierische Proteine haben ein vollständiges Aminosäureprofil. Bei pflanzlichen Proteinen solltest du verschiedene Quellen kombinieren.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-info">🥩</span>
                      <span className="text-sm">Tierisch: Fleisch, Fisch, Eier, Milchprodukte</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info">🌱</span>
                      <span className="text-sm">Pflanzlich: Hülsenfrüchte, Tofu, Tempeh, Seitan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">💡</span>
                      <span className="text-sm">Vegan: Kombiniere Getreide + Hülsenfrüchte</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum Proteinbedarf
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie viel Protein brauche ich am Tag?",
                  a: "Der Mindestbedarf liegt bei 0.8g pro kg Körpergewicht. Für Sportler und beim Muskelaufbau empfehlen Studien 1.6-2.2g pro kg. Unser Rechner berücksichtigt dein Aktivitätslevel und Ziel für eine individuelle Empfehlung.",
                },
                {
                  q: "Kann ich zu viel Protein essen?",
                  a: "Bei gesunden Menschen ist ein Proteinkonsum von bis zu 2.5g pro kg unbedenklich. Mehr ist selten nötig und bringt keine zusätzlichen Vorteile. Bei Nierenproblemen solltest du mit einem Arzt sprechen.",
                },
                {
                  q: "Wann sollte ich Protein essen?",
                  a: "Verteile dein Protein möglichst gleichmässig über 3-4 Mahlzeiten. Das Timing-Fenster nach dem Training ist weniger wichtig als früher angenommen – die Gesamtmenge zählt mehr.",
                },
                {
                  q: "Brauche ich Proteinpulver?",
                  a: "Nein, du kannst deinen Bedarf komplett über normale Lebensmittel decken. Proteinpulver ist praktisch, wenn du unterwegs bist oder Schwierigkeiten hast, genug Protein zu essen.",
                },
                {
                  q: "Ist zu viel Protein schädlich für die Nieren?",
                  a: "Bei gesunden Menschen gibt es keine Hinweise darauf, dass hoher Proteinkonsum die Nieren schädigt. Wer bereits Nierenprobleme hat, sollte jedoch mit einem Arzt sprechen.",
                },
              ].map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium">{faq.q}</div>
                  <div className="collapse-content">
                    <p className="opacity-80">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tracke dein Protein mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen Proteinbedarf. Mit Mahlzait trackst du jede Mahlzeit in Sekunden – per Foto, Text oder Barcode. So erreichst du deine Ziele garantiert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={config.appStoreLink} className="btn btn-lg bg-white text-primary">
                iOS App laden
              </a>
              <a
                href={config.googlePlayLink}
                className="btn btn-lg bg-white text-primary hover:bg-white/90"
              >
                Android App laden
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Rechner & Informationen</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf berechnen
              </a>
              <a href="/makros-berechnen" className="btn btn-outline">
                Makros berechnen
              </a>
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI Rechner
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
              </a>
              <a href="/rechner" className="btn btn-outline">
                Alle Rechner
              </a>
              <a href="/#live-demo" className="btn btn-primary">
                Live Demo
              </a>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default ProteinBedarfRechnerPage;
