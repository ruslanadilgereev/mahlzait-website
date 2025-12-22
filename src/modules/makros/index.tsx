import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

type Goal = "lose" | "maintain" | "gain";

interface MacroResult {
  calories: number;
  protein: { grams: number; percent: number; calories: number };
  carbs: { grams: number; percent: number; calories: number };
  fat: { grams: number; percent: number; calories: number };
}

function MakrosPage({ config }: Props) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<Goal>("maintain");
  const [result, setResult] = useState<MacroResult | null>(null);

  const calculateMacros = () => {
    // Mifflin-St Jeor Formel fuer BMR
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * activity;

    // Kalorien je nach Ziel
    let calories: number;
    switch (goal) {
      case "lose":
        calories = Math.round(tdee - 500);
        break;
      case "gain":
        calories = Math.round(tdee + 300);
        break;
      default:
        calories = Math.round(tdee);
    }

    // Makro-Verteilung je nach Ziel
    let proteinPercent: number;
    let fatPercent: number;
    let carbsPercent: number;

    switch (goal) {
      case "lose":
        // Hoeherer Protein-Anteil beim Abnehmen
        proteinPercent = 30;
        fatPercent = 30;
        carbsPercent = 40;
        break;
      case "gain":
        // Mehr Carbs fuer Muskelaufbau
        proteinPercent = 25;
        fatPercent = 25;
        carbsPercent = 50;
        break;
      default:
        // Ausgewogene Verteilung
        proteinPercent = 25;
        fatPercent = 30;
        carbsPercent = 45;
    }

    // Gramm berechnen
    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    const proteinCalories = Math.round((calories * proteinPercent) / 100);
    const carbsCalories = Math.round((calories * carbsPercent) / 100);
    const fatCalories = Math.round((calories * fatPercent) / 100);

    const proteinGrams = Math.round(proteinCalories / 4);
    const carbsGrams = Math.round(carbsCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    setResult({
      calories,
      protein: { grams: proteinGrams, percent: proteinPercent, calories: proteinCalories },
      carbs: { grams: carbsGrams, percent: carbsPercent, calories: carbsCalories },
      fat: { grams: fatGrams, percent: fatPercent, calories: fatCalories },
    });
  };

  const activityLevels = [
    { value: 1.2, label: "Kaum aktiv (sitzend, kein Sport)" },
    { value: 1.375, label: "Leicht aktiv (1-2x Sport/Woche)" },
    { value: 1.55, label: "Moderat aktiv (3-5x Sport/Woche)" },
    { value: 1.725, label: "Sehr aktiv (6-7x Sport/Woche)" },
    { value: 1.9, label: "Extrem aktiv (Leistungssport)" },
  ];

  const goals = [
    { value: "lose" as Goal, label: "Abnehmen", desc: "-500 kcal, hoher Proteinanteil" },
    { value: "maintain" as Goal, label: "Gewicht halten", desc: "Ausgewogene Verteilung" },
    { value: "gain" as Goal, label: "Muskelaufbau", desc: "+300 kcal, hoher Carbanteil" },
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
              Makros berechnen
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deine optimale Verteilung von Protein, Kohlenhydraten und Fett. Abgestimmt
              auf dein Ziel: Abnehmen, Halten oder Muskelaufbau.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Makro-Rechner</h2>

              {/* Goal Selection */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Dein Ziel</span>
                </label>
                <div className="grid gap-2">
                  {goals.map((g) => (
                    <label
                      key={g.value}
                      className={`label cursor-pointer p-3 rounded-lg border ${
                        goal === g.value ? "border-primary bg-primary/10" : "border-base-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="goal"
                          className="radio radio-primary"
                          checked={goal === g.value}
                          onChange={() => setGoal(g.value)}
                        />
                        <div>
                          <span className="font-medium">{g.label}</span>
                          <p className="text-xs opacity-70">{g.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Geschlecht</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="gender"
                      className="radio radio-primary"
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                    />
                    <span className="label-text">Maennlich</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="gender"
                      className="radio radio-primary"
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                    />
                    <span className="label-text">Weiblich</span>
                  </label>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Alter</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={16}
                    max={80}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Groesse (cm)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={140}
                    max={220}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Gewicht (kg)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min={40}
                    max={180}
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Aktivitaetslevel</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary btn-lg" onClick={calculateMacros}>
                Makros berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Deine Makros</div>

                  <div className="text-center mb-4">
                    <p className="text-sm opacity-70">Taegliches Kalorienziel</p>
                    <p className="text-4xl font-bold text-primary">{result.calories} kcal</p>
                  </div>

                  {/* Macro Cards */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Protein */}
                    <div className="card bg-error/10 border-2 border-error">
                      <div className="card-body items-center text-center py-4">
                        <h3 className="font-bold text-error">Protein</h3>
                        <p className="text-3xl font-bold">{result.protein.grams}g</p>
                        <p className="text-sm opacity-70">
                          {result.protein.percent}% ({result.protein.calories} kcal)
                        </p>
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="card bg-warning/10 border-2 border-warning">
                      <div className="card-body items-center text-center py-4">
                        <h3 className="font-bold text-warning">Kohlenhydrate</h3>
                        <p className="text-3xl font-bold">{result.carbs.grams}g</p>
                        <p className="text-sm opacity-70">
                          {result.carbs.percent}% ({result.carbs.calories} kcal)
                        </p>
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="card bg-info/10 border-2 border-info">
                      <div className="card-body items-center text-center py-4">
                        <h3 className="font-bold text-info">Fett</h3>
                        <p className="text-3xl font-bold">{result.fat.grams}g</p>
                        <p className="text-sm opacity-70">
                          {result.fat.percent}% ({result.fat.calories} kcal)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visual breakdown */}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Verteilung</p>
                    <div className="w-full h-8 rounded-lg overflow-hidden flex">
                      <div
                        className="bg-error h-full flex items-center justify-center text-xs text-white font-bold"
                        style={{ width: `${result.protein.percent}%` }}
                      >
                        P
                      </div>
                      <div
                        className="bg-warning h-full flex items-center justify-center text-xs text-white font-bold"
                        style={{ width: `${result.carbs.percent}%` }}
                      >
                        K
                      </div>
                      <div
                        className="bg-info h-full flex items-center justify-center text-xs text-white font-bold"
                        style={{ width: `${result.fat.percent}%` }}
                      >
                        F
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
                      <p className="font-semibold">Tracke deine Makros mit Mahlzait!</p>
                      <p className="text-sm">
                        Die App zeigt dir Protein, Carbs und Fett fuer jede Mahlzeit.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Macro Explanation */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was sind Makronaehrstoffe?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="badge badge-error mb-2">Protein</div>
                  <h3 className="card-title">4 kcal pro Gramm</h3>
                  <p className="opacity-80">
                    Baustein fuer Muskeln, Haut, Haare. Wichtig fuer Saettigung und Erhalt der
                    Muskelmasse beim Abnehmen. Empfehlung: 1,6-2,2g pro kg Koerpergewicht.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs opacity-60">Gute Quellen:</p>
                    <p className="text-sm">Fleisch, Fisch, Eier, Quark, Huelsenfruechte</p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="badge badge-warning mb-2">Kohlenhydrate</div>
                  <h3 className="card-title">4 kcal pro Gramm</h3>
                  <p className="opacity-80">
                    Hauptenergiequelle fuer Gehirn und Muskeln. Besonders wichtig fuer Sport und
                    Leistung. Qualitaet zaehlt: komplexe Carbs bevorzugen.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs opacity-60">Gute Quellen:</p>
                    <p className="text-sm">Vollkorn, Kartoffeln, Reis, Obst, Gemuese</p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="badge badge-info mb-2">Fett</div>
                  <h3 className="card-title">9 kcal pro Gramm</h3>
                  <p className="opacity-80">
                    Wichtig fuer Hormone, Gehirnfunktion und Vitaminaufnahme. Nicht unter 0,5g pro
                    kg Koerpergewicht gehen. Ungesaettigte Fette bevorzugen.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs opacity-60">Gute Quellen:</p>
                    <p className="text-sm">Nuesse, Avocado, Olivenoel, fetter Fisch</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Goal-specific Tips */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Makros je nach Ziel
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-success/10 border border-success shadow">
                <div className="card-body">
                  <h3 className="card-title text-success">Abnehmen</h3>
                  <ul className="space-y-2 mt-2">
                    <li className="flex gap-2">
                      <span className="font-bold">30%</span>
                      <span>Protein (Muskeln erhalten)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">40%</span>
                      <span>Kohlenhydrate (reduziert)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">30%</span>
                      <span>Fett (Saettigung)</span>
                    </li>
                  </ul>
                  <p className="text-sm mt-4 opacity-80">
                    Hoher Proteinanteil schuetzt die Muskelmasse im Kaloriendefizit.
                  </p>
                </div>
              </div>

              <div className="card bg-neutral/10 border border-neutral shadow">
                <div className="card-body">
                  <h3 className="card-title">Gewicht halten</h3>
                  <ul className="space-y-2 mt-2">
                    <li className="flex gap-2">
                      <span className="font-bold">25%</span>
                      <span>Protein</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">45%</span>
                      <span>Kohlenhydrate</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">30%</span>
                      <span>Fett</span>
                    </li>
                  </ul>
                  <p className="text-sm mt-4 opacity-80">
                    Ausgewogene Verteilung fuer langfristige Gesundheit.
                  </p>
                </div>
              </div>

              <div className="card bg-info/10 border border-info shadow">
                <div className="card-body">
                  <h3 className="card-title text-info">Muskelaufbau</h3>
                  <ul className="space-y-2 mt-2">
                    <li className="flex gap-2">
                      <span className="font-bold">25%</span>
                      <span>Protein (Muskelaufbau)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">50%</span>
                      <span>Kohlenhydrate (Energie)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">25%</span>
                      <span>Fett</span>
                    </li>
                  </ul>
                  <p className="text-sm mt-4 opacity-80">
                    Mehr Carbs liefern Energie fuer intensives Training.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Makros tracken mit Mahlzait</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Die App zeigt dir Protein, Kohlenhydrate und Fett fuer jede Mahlzeit. Mit KI-Logging
              trackst du in Sekunden - per Foto oder Text.
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
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
              </a>
              <a href="/#features" className="btn btn-outline">
                Alle Features
              </a>
              <a href="/#live-demo" className="btn btn-outline">
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

export default MakrosPage;

