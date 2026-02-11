import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";

interface Props {
  config: TemplateConfig;
}

interface ScritteResult {
  calories: number;
  distance: number;
  duration: number;
  equivalentFood: string;
  weeklyCalories: number;
}

type WalkingSpeed = "slow" | "normal" | "fast";
type Gender = "male" | "female";

function SchritteKalorienRechnerPage({ config }: Props) {
  const [steps, setSteps] = useState(10000);
  const [weight, setWeight] = useState(75);
  const [speed, setSpeed] = useState<WalkingSpeed>("normal");
  const [gender, setGender] = useState<Gender>("male");
  const [result, setResult] = useState<ScritteResult | null>(null);

  // MET values for different walking speeds
  const metValues: Record<WalkingSpeed, number> = {
    slow: 2.5,      // ~4 km/h
    normal: 3.5,    // ~5.5 km/h
    fast: 5.0,      // ~7 km/h
  };

  // Average stride length based on height/gender (in meters)
  const getStrideLength = (gender: Gender): number => {
    return gender === "male" ? 0.78 : 0.70;
  };

  // Steps per minute at different speeds
  const stepsPerMinute: Record<WalkingSpeed, number> = {
    slow: 80,
    normal: 100,
    fast: 130,
  };

  const speedLabels: Record<WalkingSpeed, string> = {
    slow: "Langsam (~4 km/h)",
    normal: "Normal (~5.5 km/h)",
    fast: "Schnell (~7 km/h)",
  };

  const calculateCalories = () => {
    const met = metValues[speed];
    const strideLength = getStrideLength(gender);
    const stepsMin = stepsPerMinute[speed];
    
    // Calculate duration in minutes
    const duration = steps / stepsMin;
    
    // Calculate distance in km
    const distance = (steps * strideLength) / 1000;
    
    // Calculate calories: MET × weight (kg) × time (hours)
    const durationHours = duration / 60;
    const calories = Math.round(met * weight * durationHours);
    
    // Weekly calories if done daily
    const weeklyCalories = calories * 7;
    
    // Equivalent food
    let equivalentFood: string;
    if (calories < 100) {
      equivalentFood = "1 Apfel";
    } else if (calories < 200) {
      equivalentFood = "1 Scheibe Brot mit Butter";
    } else if (calories < 300) {
      equivalentFood = "1 kleiner Schokoriegel";
    } else if (calories < 400) {
      equivalentFood = "1 Portion Pommes";
    } else if (calories < 500) {
      equivalentFood = "1 Döner Tasche";
    } else {
      equivalentFood = "1 komplettes Mittagessen";
    }

    setResult({
      calories,
      distance: Math.round(distance * 100) / 100,
      duration: Math.round(duration),
      equivalentFood,
      weeklyCalories,
    });
  };

  const stepExamples = [
    { steps: 5000, label: "Grundniveau", desc: "Mindestempfehlung pro Tag" },
    { steps: 7500, label: "Leicht aktiv", desc: "Guter Durchschnitt" },
    { steps: 10000, label: "Aktiv", desc: "Klassisches Tagesziel" },
    { steps: 12500, label: "Sehr aktiv", desc: "Hohe Aktivität" },
    { steps: 15000, label: "Hochaktiv", desc: "Sportler-Niveau" },
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
              Schritte in Kalorien Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne wie viele Kalorien du beim Gehen verbrennst. Finde heraus, was 10.000 Schritte wirklich bringen – basierend auf deinem Gewicht und Tempo.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">Kalorienverbrauch berechnen</h2>

              {/* Steps - Prominent Display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Anzahl Schritte</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="1000"
                      max="50000"
                      step="500"
                      value={steps}
                      onChange={(e) => setSteps(Math.min(50000, Math.max(1000, Number(e.target.value))))}
                      className="input input-bordered input-lg w-28 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">👟</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="30000"
                  step="500"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>1k</span>
                  <span>7.5k</span>
                  <span>15k</span>
                  <span>22.5k</span>
                  <span>30k</span>
                </div>
                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[5000, 7500, 10000, 15000, 20000].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSteps(s)}
                      className={`btn btn-sm ${steps === s ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {(s/1000).toLocaleString('de-DE')}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
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

              {/* Gender */}
              <div className="mb-6">
                <span className="text-lg font-semibold mb-3 block">Geschlecht</span>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="gender"
                      className="hidden peer"
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                    />
                    <div className="btn btn-outline w-full peer-checked:btn-primary">
                      <span className="text-xl mr-2">👨</span> Mann
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="gender"
                      className="hidden peer"
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                    />
                    <div className="btn btn-outline w-full peer-checked:btn-primary">
                      <span className="text-xl mr-2">👩</span> Frau
                    </div>
                  </label>
                </div>
              </div>

              {/* Walking Speed */}
              <div className="mb-8">
                <span className="text-lg font-semibold mb-3 block">Geschwindigkeit</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  {(Object.keys(speedLabels) as WalkingSpeed[]).map((s) => (
                    <label key={s} className="flex-1">
                      <input
                        type="radio"
                        name="speed"
                        className="hidden peer"
                        checked={speed === s}
                        onChange={() => setSpeed(s)}
                      />
                      <div className="btn btn-outline w-full h-auto py-3 peer-checked:btn-primary flex flex-col">
                        <span className="text-lg">
                          {s === "slow" ? "🚶" : s === "normal" ? "🚶‍♂️" : "🏃"}
                        </span>
                        <span className="text-sm">{speedLabels[s]}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateCalories}>
                Kalorien berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">
                      {result.calories}
                    </div>
                    <div className="text-xl font-semibold mt-2 opacity-80">
                      Kalorien verbrannt 🔥
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Distanz</h3>
                        <p className="text-2xl font-bold text-primary">{result.distance} km</p>
                        <p className="text-xs opacity-60">zurückgelegt</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Dauer</h3>
                        <p className="text-2xl font-bold text-primary">
                          {result.duration >= 60 
                            ? `${Math.floor(result.duration / 60)}h ${result.duration % 60}min`
                            : `${result.duration} min`}
                        </p>
                        <p className="text-xs opacity-60">Gehzeit</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Entspricht</h3>
                        <p className="text-2xl font-bold text-success">{result.equivalentFood}</p>
                        <p className="text-xs opacity-60">an Kalorien</p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly projection */}
                  <div className="alert alert-success mt-4">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold">Bei täglichem Gehen:</p>
                      <p className="text-sm">
                        {result.weeklyCalories.toLocaleString('de-DE')} kcal pro Woche = ca. {Math.round(result.weeklyCalories / 7700 * 100) / 100} kg Fett
                      </p>
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
                      <p className="font-semibold">Tracke deine Fortschritte mit Mahlzait!</p>
                      <p className="text-sm">
                        Verbrenne Kalorien durch Bewegung und tracke deine Ernährung – so erreichst du dein Zielgewicht schneller.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Steps Guide Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Wie viele Schritte sollte ich täglich gehen?
            </h2>
            <div className="overflow-x-auto max-w-3xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Schritte/Tag</th>
                    <th>Aktivitätsniveau</th>
                    <th>Kalorien (75kg)*</th>
                    <th>Bewertung</th>
                  </tr>
                </thead>
                <tbody>
                  {stepExamples.map((ex, i) => (
                    <tr key={i} className={ex.steps === 10000 ? 'bg-primary/10' : ''}>
                      <td className="font-bold">{ex.steps.toLocaleString('de-DE')}</td>
                      <td>
                        <div>{ex.label}</div>
                        <div className="text-xs opacity-60">{ex.desc}</div>
                      </td>
                      <td>~{Math.round(3.5 * 75 * (ex.steps / 100 / 60))} kcal</td>
                      <td>
                        <span className={`badge ${ex.steps >= 10000 ? 'badge-success' : ex.steps >= 7500 ? 'badge-warning' : 'badge-ghost'}`}>
                          {ex.steps >= 10000 ? '✓ Empfohlen' : ex.steps >= 7500 ? 'Gut' : 'Minimum'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs opacity-60 mt-2 text-center">*Bei normalem Gehtempo (~5.5 km/h)</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Wie werden die Kalorien berechnet?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Die MET-Methode</h3>
                  <p className="opacity-80">
                    Wir verwenden die wissenschaftlich anerkannte MET-Methode (Metabolisches Äquivalent). MET gibt an, wie viel Energie eine Aktivität im Vergleich zum Ruhezustand verbraucht.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-lg text-center">
                      <strong>Kalorien = MET × Gewicht × Zeit</strong>
                    </p>
                    <p className="text-sm opacity-70 text-center mt-2">
                      Beispiel: 3.5 MET × 75 kg × 1.5h = 394 kcal
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Einflussfaktoren</h3>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">⚖️</span>
                      <div>
                        <strong>Körpergewicht</strong>
                        <p className="text-sm opacity-70">Schwerere Personen verbrennen mehr Kalorien</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🏃</span>
                      <div>
                        <strong>Gehgeschwindigkeit</strong>
                        <p className="text-sm opacity-70">Schnelleres Gehen = höherer MET-Wert</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">📏</span>
                      <div>
                        <strong>Schrittlänge</strong>
                        <p className="text-sm opacity-70">Beeinflusst Distanz und Dauer</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Tipps für mehr Schritte im Alltag
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {[
                { emoji: "🚶", tip: "Gehe während Telefonaten", desc: "300-500 extra Schritte pro Anruf" },
                { emoji: "🅿️", tip: "Parke weiter weg", desc: "500+ extra Schritte pro Weg" },
                { emoji: "🪜", tip: "Nimm die Treppe", desc: "Höherer Kalorienverbrauch als Gehen" },
                { emoji: "☕", tip: "Gehe zum Wasserholen", desc: "Regelmässige kurze Walks summieren sich" },
                { emoji: "🐕", tip: "Geh mit dem Hund", desc: "30-Min-Spaziergang = ~3.000 Schritte" },
                { emoji: "📺", tip: "Gehe während TV-Werbung", desc: "500-1.000 extra Schritte pro Abend" },
              ].map((item, i) => (
                <div key={i} className="card bg-base-100 shadow">
                  <div className="card-body py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.emoji}</span>
                      <div>
                        <h4 className="font-semibold">{item.tip}</h4>
                        <p className="text-sm opacity-70">{item.desc}</p>
                      </div>
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
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie viele Kalorien verbrennt man bei 10.000 Schritten?",
                  a: "Bei 10.000 Schritten verbrennst du je nach Körpergewicht zwischen 300 und 500 Kalorien. Eine Person mit 75 kg verbrennt bei normalem Tempo etwa 350-400 kcal.",
                },
                {
                  q: "Sind 10.000 Schritte wirklich notwendig?",
                  a: "Die 10.000-Schritte-Regel stammt aus Japan und ist ein guter Richtwert. Studien zeigen, dass bereits 7.500 Schritte täglich signifikante Gesundheitsvorteile bringen. Wichtiger als die Zahl ist Regelmässigkeit.",
                },
                {
                  q: "Wie genau ist die Schrittezählung meines Smartphones?",
                  a: "Smartphones sind zu etwa 90% genau. Für präzisere Messungen empfehlen sich Fitness-Tracker oder Smartwatches. Wichtig: Immer das gleiche Gerät nutzen für Vergleichbarkeit.",
                },
                {
                  q: "Verbrennt Joggen mehr Kalorien als Gehen?",
                  a: "Ja, Joggen hat einen höheren MET-Wert (7-12 vs. 2.5-5). Allerdings kannst du beim Gehen länger durchhalten. Bei gleicher Distanz verbrennt Joggen etwa 30% mehr Kalorien.",
                },
                {
                  q: "Wie kann ich meinen Kalorienverbrauch maximieren?",
                  a: "Erhöhe dein Tempo, gehe bergauf, nutze Walking-Stöcke (Nordic Walking) oder trage ein leichtes Gewicht. Intervall-Walking (abwechselnd schnell/langsam) ist besonders effektiv.",
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
              Tracke Schritte & Ernährung mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Bewegung allein reicht nicht – Ernährung macht 80% des Erfolgs aus. Mit Mahlzait trackst du beides: Verbinde deine Schrittzähler-App und fotografiere dein Essen. So erreichst du dein Zielgewicht garantiert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={getTrackedAppLink({ platform: "ios", source: "calculator" })} 
                onClick={() => trackAppStoreClick("ios", "calculator")}
                className="btn btn-lg bg-white text-primary"
              >
                iOS App laden
              </a>
              <a
                href={getTrackedAppLink({ platform: "android", source: "calculator" })}
                onClick={() => trackAppStoreClick("android", "calculator")}
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
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI Rechner
              </a>
              <a href="/abnehmen" className="btn btn-outline">
                Abnehmen
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

export default SchritteKalorienRechnerPage;
