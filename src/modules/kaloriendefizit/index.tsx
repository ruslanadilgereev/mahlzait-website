import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

import AuthorByline from "@components/AuthorByline";
import {
  defizitBeispiele,
  kaloriendefizitFaq,
  kaloriendefizitQuellen,
} from "./content";

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

/** Grundumsatz nach Mifflin-St Jeor (1990), vereinfachte Form je Geschlecht. */
function grundumsatz(
  gender: "male" | "female",
  weight: number,
  height: number,
  age: number,
): number {
  return 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
}

/** 3.500 kcal pro Pfund, umgerechnet auf ein Kilogramm Körpergewicht. */
const KCAL_PRO_KG = 7700;

const kcal = (value: number) => Math.round(value).toLocaleString("de-DE");

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
    const bmr = grundumsatz(gender, currentWeight, height, age);

    const tdee = Math.round(bmr * activity);
    const targetCalories = Math.round(tdee - deficitLevel);
    const weeklyLoss = (deficitLevel * 7) / KCAL_PRO_KG;
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
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Kaloriendefizit berechnen", url: "/kaloriendefizit-berechnen/" },
        ]} />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Kaloriendefizit berechnen
            </h1>
            <AuthorByline />
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
                    <span className="label-text">Männlich</span>
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
                    <span className="label-text font-semibold">Größe</span>
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
                  <span className="label-text font-semibold">Aktivitätslevel</span>
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
                  <span className="label-text font-semibold">Gewünschtes Defizit</span>
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
                      <div className="stat-title">Tägliches Ziel</div>
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
                        Protein und höre auf deinen Körper.
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

        {/* Formel und Beispielrechnungen */}
        <section className="py-16" id="formel">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              So berechnest du dein Kaloriendefizit
            </h2>
            <p className="opacity-80 mb-6">
              Ein Kaloriendefizit heißt: Du nimmst weniger Energie auf, als du verbrauchst. Der
              Rechner oben geht dafür in vier Schritten vor.
            </p>
            <ol className="list-decimal pl-6 space-y-4 opacity-90">
              <li>
                <strong>Grundumsatz</strong> nach der Mifflin-St-Jeor-Formel (1990):
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Frauen: 10 × Gewicht in kg + 6,25 × Größe in cm - 5 × Alter in Jahren - 161</li>
                  <li>Männer: 10 × Gewicht in kg + 6,25 × Größe in cm - 5 × Alter in Jahren + 5</li>
                </ul>
              </li>
              <li>
                <strong>Gesamtumsatz</strong> = Grundumsatz × Aktivitätsfaktor. Im Rechner wählst du
                zwischen 1,2 (kaum aktiv) und 1,9 (Leistungssport).
              </li>
              <li>
                <strong>Kalorienziel</strong> = Gesamtumsatz - Defizit (300, 500, 750 oder 1.000 kcal
                pro Tag).
              </li>
              <li>
                <strong>Abnahme pro Woche</strong> = Defizit × 7 ÷ {kcal(KCAL_PRO_KG)} kcal. Die{" "}
                {kcal(KCAL_PRO_KG)} kcal pro Kilogramm entsprechen der verbreiteten Regel „3.500 kcal
                pro Pfund“.
              </li>
            </ol>

            <h3 className="text-xl font-bold mt-10 mb-4">Beispielrechnungen mit 500 kcal Defizit</h3>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Aktivität</th>
                    <th className="text-right">Grundumsatz</th>
                    <th className="text-right">Gesamtumsatz</th>
                    <th className="text-right">Kalorienziel</th>
                  </tr>
                </thead>
                <tbody>
                  {defizitBeispiele.map((beispiel) => {
                    const bmr = grundumsatz(
                      beispiel.gender,
                      beispiel.weight,
                      beispiel.height,
                      beispiel.age,
                    );
                    const tdee = Math.round(bmr * beispiel.activity);
                    return (
                      <tr key={beispiel.person + beispiel.activity}>
                        <td>{beispiel.person}</td>
                        <td>{beispiel.activityLabel}</td>
                        <td className="text-right">{kcal(bmr)} kcal</td>
                        <td className="text-right">{kcal(tdee)} kcal</td>
                        <td className="text-right font-semibold">{kcal(tdee - 500)} kcal</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-sm opacity-70 mt-4">
              Mit 500 kcal Defizit ergibt die Formel rund{" "}
              {((500 * 7) / KCAL_PRO_KG).toLocaleString("de-DE", { maximumFractionDigits: 2 })} kg
              pro Woche. Gemessene Verläufe fallen über Monate geringer aus, weil der Verbrauch mit
              dem Gewicht sinkt. Rechne deshalb alle paar Wochen mit deinem neuen Gewicht neu.
            </p>
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
                    750 kcal Defizit ist für kurze Phasen vertretbar (z.B. 4-8 Wochen). Achte auf
                    genug Protein und Mikronährstoffe.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-4xl text-error mb-2">1000+</div>
                  <h3 className="card-title">Vorsicht</h3>
                  <p className="opacity-80">
                    Defizite über 1000 kcal können zu Muskelabbau, Nährstoffmangel und Jo-Jo-Effekt
                    führen. Nur unter ärztlicher Aufsicht.
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
              Häufige Fehler beim Abnehmen
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {[
                {
                  mistake: "Zu hohes Defizit wählen",
                  solution:
                    "Start mit 300-500 kcal Defizit. Lieber langsam und nachhaltig als schnell mit Jo-Jo.",
                },
                {
                  mistake: "Kalorien nicht tracken",
                  solution:
                    "Die meisten Menschen unterschätzen ihre Kalorienzufuhr um 20-40%. Tracking schafft Klarheit.",
                },
                {
                  mistake: "Zu wenig Protein essen",
                  solution:
                    "1,6-2,2g Protein pro kg Körpergewicht schützt Muskelmasse im Defizit.",
                },
                {
                  mistake: "Keine Geduld haben",
                  solution:
                    "Gewicht schwankt täglich. Beurteile Fortschritt über 2-4 Wochen, nicht täglich.",
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

        {/* FAQ: dieselben Fragen stehen im FAQPage-Schema der Seite */}
        <section className="py-16 bg-base-200" id="faq">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Häufige Fragen zum Kaloriendefizit
            </h2>
            <div className="space-y-3">
              {kaloriendefizitFaq.map((item) => (
                <details key={item.question} className="rounded-xl bg-base-100 p-4">
                  <summary className="cursor-pointer text-lg font-semibold">{item.question}</summary>
                  <p className="mt-3 opacity-80">{item.answer}</p>
                  {item.link && (
                    <p className="mt-2 text-sm">
                      Mehr dazu:{" "}
                      <a href={item.link.href} className="link link-primary">
                        {item.link.label}
                      </a>
                    </p>
                  )}
                </details>
              ))}
            </div>

            <h2 className="text-xl font-bold mt-12 mb-3">Quellen</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm opacity-80">
              {kaloriendefizitQuellen.map((quelle) => (
                <li key={quelle.url}>
                  <a
                    href={quelle.url}
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {quelle.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-sm opacity-60 mt-6">
              Der Rechner liefert eine Schätzung und ersetzt keine ärztliche oder
              ernährungstherapeutische Beratung.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Starte dein Defizit mit Mahlzait</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Setze dein Kalorienziel in der App und tracke mühelos. Mit KI-Logging loggst du
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
              <a href="/#live-demo" className="btn btn-primary">
                Live Demo
              </a>
            </div>
          </div>
        </section>

        <RelatedWissen calculatorSlug="kaloriendefizit-berechnen" />
        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KaloriendefizitPage;

