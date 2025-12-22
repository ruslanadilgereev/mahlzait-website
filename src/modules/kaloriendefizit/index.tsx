import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface DeficitResult {
  tdee: number;
  deficit: number;
  targetCalories: number;
  weeklyLoss: number;
  weeksToGoal: number;
  targetDate: string;
}

function KaloriendefizitPage({ config }: Props) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [currentWeight, setCurrentWeight] = useState(85);
  const [targetWeight, setTargetWeight] = useState(75);
  const [activity, setActivity] = useState(1.55);
  const [deficitLevel, setDeficitLevel] = useState(500);
  const [result, setResult] = useState<DeficitResult | null>(null);

  const calculateDeficit = () => {
    // Mifflin-St Jeor Formel
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
    }

    const tdee = Math.round(bmr * activity);
    const targetCalories = Math.round(tdee - deficitLevel);
    const weeklyLoss = (deficitLevel * 7) / 7700; // 7700 kcal = 1 kg
    const weightToLose = currentWeight - targetWeight;
    const weeksToGoal = Math.ceil(weightToLose / weeklyLoss);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeksToGoal * 7);

    setResult({
      tdee,
      deficit: deficitLevel,
      targetCalories,
      weeklyLoss: Math.round(weeklyLoss * 100) / 100,
      weeksToGoal,
      targetDate: targetDate.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric",
      }),
    });
  };

  const activityLevels = [
    { value: 1.2, label: "Kaum aktiv (sitzend, kein Sport)" },
    { value: 1.375, label: "Leicht aktiv (1-2x Sport/Woche)" },
    { value: 1.55, label: "Moderat aktiv (3-5x Sport/Woche)" },
    { value: 1.725, label: "Sehr aktiv (6-7x Sport/Woche)" },
    { value: 1.9, label: "Extrem aktiv (Leistungssport)" },
  ];

  const deficitOptions = [
    { value: 300, label: "Leicht (-300 kcal)", desc: "Langsam aber entspannt" },
    { value: 500, label: "Moderat (-500 kcal)", desc: "Empfohlen" },
    { value: 750, label: "Stark (-750 kcal)", desc: "Schnellere Ergebnisse" },
    { value: 1000, label: "Aggressiv (-1000 kcal)", desc: "Nur kurzfristig" },
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
              Kaloriendefizit berechnen
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne dein ideales Kaloriendefizit zum Abnehmen. Erfahre, wie viele Kalorien du
              essen solltest und wann du dein Zielgewicht erreichst.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Defizit-Rechner</h2>

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

              {/* Age, Height in row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Alter</span>
                    <span className="label-text-alt">{age} Jahre</span>
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="range range-primary range-sm"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Groesse</span>
                    <span className="label-text-alt">{height} cm</span>
                  </label>
                  <input
                    type="range"
                    min="140"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="range range-primary range-sm"
                  />
                </div>
              </div>

              {/* Current and Target Weight */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Aktuelles Gewicht</span>
                    <span className="label-text-alt">{currentWeight} kg</span>
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(Number(e.target.value))}
                    className="range range-primary range-sm"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Zielgewicht</span>
                    <span className="label-text-alt">{targetWeight} kg</span>
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    className="range range-success range-sm"
                  />
                </div>
              </div>

              {/* Weight to lose display */}
              {currentWeight > targetWeight && (
                <div className="alert mb-4">
                  <span>
                    Ziel: <strong>{currentWeight - targetWeight} kg</strong> abnehmen
                  </span>
                </div>
              )}

              {/* Activity Level */}
              <div className="form-control mb-4">
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

              {/* Deficit Level */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Gewuenschtes Defizit</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {deficitOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`label cursor-pointer p-3 rounded-lg border ${
                        deficitLevel === option.value
                          ? "border-primary bg-primary/10"
                          : "border-base-300"
                      }`}
                    >
                      <div>
                        <input
                          type="radio"
                          name="deficit"
                          className="radio radio-primary radio-sm mr-2"
                          checked={deficitLevel === option.value}
                          onChange={() => setDeficitLevel(option.value)}
                        />
                        <span className="label-text font-medium">{option.label}</span>
                        <p className="text-xs opacity-70 ml-6">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg" onClick={calculateDeficit}>
                Defizit berechnen
              </button>

              {/* Results */}
              {result && currentWeight > targetWeight && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Plan</div>

                  <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                    <div className="stat">
                      <div className="stat-title">Taegliches Ziel</div>
                      <div className="stat-value text-primary">{result.targetCalories}</div>
                      <div className="stat-desc">kcal pro Tag</div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">Defizit</div>
                      <div className="stat-value text-secondary">-{result.deficit}</div>
                      <div className="stat-desc">kcal unter TDEE ({result.tdee})</div>
                    </div>
                  </div>

                  <div className="card bg-success/10 border border-success mt-4">
                    <div className="card-body py-4">
                      <h3 className="font-bold text-success text-lg">Prognose</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm opacity-70">Gewichtsverlust pro Woche</p>
                          <p className="text-xl font-bold">{result.weeklyLoss} kg</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-70">Dauer bis Zielgewicht</p>
                          <p className="text-xl font-bold">{result.weeksToGoal} Wochen</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm">
                        Zielgewicht von <strong>{targetWeight} kg</strong> erreicht bis ca.{" "}
                        <strong>{result.targetDate}</strong>
                      </p>
                    </div>
                  </div>

                  {result.deficit >= 750 && (
                    <div className="alert alert-warning">
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
                      <span>
                        Ein Defizit von {result.deficit} kcal ist aggressiv. Achte auf ausreichend
                        Protein und hoere auf deinen Koerper.
                      </span>
                    </div>
                  )}

                  <div className="alert alert-info">
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
                      <p className="font-semibold">Tracke dein Defizit mit Mahlzait!</p>
                      <p className="text-sm">
                        Setze {result.targetCalories} kcal als Ziel und logge Mahlzeiten in
                        Sekunden.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Sicheres Kaloriendefizit
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-4xl text-success mb-2">300-500</div>
                  <h3 className="card-title">Empfohlenes Defizit</h3>
                  <p className="opacity-80">
                    Ein moderates Defizit von 300-500 kcal pro Tag ist nachhaltig und schont den
                    Stoffwechsel. Erwartet: 0,3-0,5 kg pro Woche.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-4xl text-warning mb-2">750</div>
                  <h3 className="card-title">Obere Grenze</h3>
                  <p className="opacity-80">
                    750 kcal Defizit ist fuer kurze Phasen vertretbar (z.B. 4-8 Wochen). Achte auf
                    genug Protein und Mikro-naehrstoffe.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-4xl text-error mb-2">1000+</div>
                  <h3 className="card-title">Vorsicht</h3>
                  <p className="opacity-80">
                    Defizite ueber 1000 kcal koennen zu Muskelabbau, Naehrstoffmangel und Jo-Jo
                    Effekt fuehren. Nur unter aerztlicher Aufsicht.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Haeufige Fehler beim Abnehmen
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {[
                {
                  mistake: "Zu hohes Defizit waehlen",
                  solution:
                    "Start mit 300-500 kcal Defizit. Lieber langsam und nachhaltig als schnell mit Jo-Jo.",
                },
                {
                  mistake: "Kalorien nicht tracken",
                  solution:
                    "Die meisten Menschen unterschaetzen ihre Kalorienzufuhr um 20-40%. Tracking schafft Klarheit.",
                },
                {
                  mistake: "Zu wenig Protein essen",
                  solution:
                    "1,6-2,2g Protein pro kg Koerpergewicht schuetzt Muskelmasse im Defizit.",
                },
                {
                  mistake: "Keine Geduld haben",
                  solution:
                    "Gewicht schwankt taeglich. Beurteile Fortschritt ueber 2-4 Wochen, nicht taeglich.",
                },
              ].map((item, i) => (
                <div key={i} className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h3 className="font-bold text-error flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      {item.mistake}
                    </h3>
                    <p className="opacity-80 mt-2">
                      <span className="text-success font-semibold">Besser:</span> {item.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Starte dein Defizit mit Mahlzait</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Setze dein Kalorienziel in der App und tracke muehleos. Mit KI-Logging loggst du
              Mahlzeiten in Sekunden - per Foto oder Text.
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
              <a href="/kalorien-zaehlen" className="btn btn-outline">
                Kalorien zählen
              </a>
              <a href="/abnehmen" className="btn btn-outline">
                Abnehmen
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

export default KaloriendefizitPage;

