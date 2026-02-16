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

interface BodyFatResult {
  bodyFatPercent: number;
  category: string;
  categoryColor: string;
  fatMass: number;
  leanMass: number;
  idealFatMin: number;
  idealFatMax: number;
}

function KoerperfettRechnerPage({ config }: Props) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(80);
  const [waist, setWaist] = useState(85);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);
  const [result, setResult] = useState<BodyFatResult | null>(null);

  const calculateBodyFat = () => {
    // US Navy Method formula
    let bodyFatPercent: number;
    
    if (gender === "male") {
      // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      bodyFatPercent = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      // Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      bodyFatPercent = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    // Clamp to reasonable range
    bodyFatPercent = Math.max(3, Math.min(60, bodyFatPercent));
    bodyFatPercent = Math.round(bodyFatPercent * 10) / 10;

    // Determine category based on gender
    let category: string;
    let categoryColor: string;
    const idealFatMin = gender === "male" ? 10 : 18;
    const idealFatMax = gender === "male" ? 20 : 28;

    if (gender === "male") {
      if (bodyFatPercent < 6) {
        category = "Essentielles Fett";
        categoryColor = "warning";
      } else if (bodyFatPercent < 14) {
        category = "Athletisch";
        categoryColor = "success";
      } else if (bodyFatPercent < 18) {
        category = "Fitness";
        categoryColor = "success";
      } else if (bodyFatPercent < 25) {
        category = "Durchschnitt";
        categoryColor = "info";
      } else {
        category = "Übergewichtig";
        categoryColor = "error";
      }
    } else {
      if (bodyFatPercent < 14) {
        category = "Essentielles Fett";
        categoryColor = "warning";
      } else if (bodyFatPercent < 21) {
        category = "Athletisch";
        categoryColor = "success";
      } else if (bodyFatPercent < 25) {
        category = "Fitness";
        categoryColor = "success";
      } else if (bodyFatPercent < 32) {
        category = "Durchschnitt";
        categoryColor = "info";
      } else {
        category = "Übergewichtig";
        categoryColor = "error";
      }
    }

    const fatMass = Math.round(weight * (bodyFatPercent / 100) * 10) / 10;
    const leanMass = Math.round((weight - fatMass) * 10) / 10;

    setResult({
      bodyFatPercent,
      category,
      categoryColor,
      fatMass,
      leanMass,
      idealFatMin,
      idealFatMax,
    });
  };

  const maleCategories = [
    { range: "2-5%", label: "Essentielles Fett", color: "bg-warning" },
    { range: "6-13%", label: "Athletisch", color: "bg-success" },
    { range: "14-17%", label: "Fitness", color: "bg-success" },
    { range: "18-24%", label: "Durchschnitt", color: "bg-info" },
    { range: "25%+", label: "Übergewichtig", color: "bg-error" },
  ];

  const femaleCategories = [
    { range: "10-13%", label: "Essentielles Fett", color: "bg-warning" },
    { range: "14-20%", label: "Athletisch", color: "bg-success" },
    { range: "21-24%", label: "Fitness", color: "bg-success" },
    { range: "25-31%", label: "Durchschnitt", color: "bg-info" },
    { range: "32%+", label: "Übergewichtig", color: "bg-error" },
  ];

  const categories = gender === "male" ? maleCategories : femaleCategories;

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Körperfettanteil Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen Körperfettanteil mit der US Navy Methode. Genauer als der BMI und perfekt für Fitness-Ziele.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-6">Körperfett berechnen</h2>

              {/* Gender Selection */}
              <div className="mb-6">
                <span className="text-lg font-semibold block mb-3">Geschlecht</span>
                <div className="flex gap-4">
                  <button
                    className={`btn flex-1 ${gender === "male" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("male")}
                  >
                    👨 Mann
                  </button>
                  <button
                    className={`btn flex-1 ${gender === "female" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("female")}
                  >
                    👩 Frau
                  </button>
                </div>
              </div>

              {/* Height */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Körpergrösse</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="140"
                      max="220"
                      value={height}
                      onChange={(e) => setHeight(Math.min(220, Math.max(140, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-2xl font-bold text-primary"
                    />
                    <span className="text-lg font-medium opacity-70">cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="140"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Weight */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Körpergewicht</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="40"
                      max="180"
                      value={weight}
                      onChange={(e) => setWeight(Math.min(180, Math.max(40, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-2xl font-bold text-primary"
                    />
                    <span className="text-lg font-medium opacity-70">kg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Neck circumference */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-semibold">Halsumfang</span>
                    <p className="text-sm opacity-60">Unterhalb des Kehlkopfs messen</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="25"
                      max="60"
                      value={neck}
                      onChange={(e) => setNeck(Math.min(60, Math.max(25, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-2xl font-bold text-primary"
                    />
                    <span className="text-lg font-medium opacity-70">cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="25"
                  max="60"
                  value={neck}
                  onChange={(e) => setNeck(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Waist circumference */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-semibold">Bauchumfang</span>
                    <p className="text-sm opacity-60">{gender === "male" ? "Auf Nabelhöhe messen" : "An der schmalsten Stelle messen"}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="50"
                      max="150"
                      value={waist}
                      onChange={(e) => setWaist(Math.min(150, Math.max(50, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-2xl font-bold text-primary"
                    />
                    <span className="text-lg font-medium opacity-70">cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={waist}
                  onChange={(e) => setWaist(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Hip circumference (women only) */}
              {gender === "female" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-semibold">Hüftumfang</span>
                      <p className="text-sm opacity-60">An der breitesten Stelle messen</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min="60"
                        max="160"
                        value={hip}
                        onChange={(e) => setHip(Math.min(160, Math.max(60, Number(e.target.value))))}
                        className="input input-bordered input-lg w-24 text-center text-2xl font-bold text-primary"
                      />
                      <span className="text-lg font-medium opacity-70">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={hip}
                    onChange={(e) => setHip(Number(e.target.value))}
                    className="range range-primary"
                  />
                </div>
              )}

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateBodyFat}>
                Körperfett berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className={`text-6xl font-bold text-${result.categoryColor}`}>
                      {result.bodyFatPercent}%
                    </div>
                    <div className={`text-xl font-semibold mt-2 text-${result.categoryColor}`}>
                      {result.category}
                    </div>
                  </div>

                  {/* Body Fat Scale Visualization */}
                  <div className="relative h-8 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-warning"></div>
                    <div className="flex-2 bg-success" style={{ flex: 2 }}></div>
                    <div className="flex-1 bg-info"></div>
                    <div className="flex-1 bg-error"></div>
                    {/* Indicator */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-base-content"
                      style={{ 
                        left: `${Math.min(Math.max((result.bodyFatPercent / (gender === "male" ? 40 : 50)) * 100, 0), 100)}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap">
                        {result.bodyFatPercent}%
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Fettmasse</h3>
                        <p className="text-2xl font-bold text-warning">{result.fatMass} kg</p>
                        <p className="text-xs opacity-60">Körperfett gesamt</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Magermasse</h3>
                        <p className="text-2xl font-bold text-success">{result.leanMass} kg</p>
                        <p className="text-xs opacity-60">Muskeln, Knochen, Organe</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Ideal-Bereich</h3>
                        <p className="text-2xl font-bold text-primary">{result.idealFatMin}-{result.idealFatMax}%</p>
                        <p className="text-xs opacity-60">für {gender === "male" ? "Männer" : "Frauen"}</p>
                      </div>
                    </div>
                  </div>

                  {result.bodyFatPercent > result.idealFatMax && (
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
                        <p className="font-semibold">Erreiche deinen Traumkörper mit Mahlzait!</p>
                        <p className="text-sm">
                          Mit gezieltem Kalorientracking und genug Protein reduzierst du Körperfett und behältst deine Muskeln.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Body Fat Table Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Körperfett-Kategorien nach ACE
            </h2>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">👨 Männer</h3>
                <div className="overflow-x-auto">
                  <table className="table bg-base-100 shadow-xl">
                    <thead>
                      <tr>
                        <th>Körperfett</th>
                        <th>Kategorie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maleCategories.map((cat, i) => (
                        <tr key={i}>
                          <td className="font-mono">{cat.range}</td>
                          <td>
                            <span className={`badge ${cat.color} text-white`}>{cat.label}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">👩 Frauen</h3>
                <div className="overflow-x-auto">
                  <table className="table bg-base-100 shadow-xl">
                    <thead>
                      <tr>
                        <th>Körperfett</th>
                        <th>Kategorie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {femaleCategories.map((cat, i) => (
                        <tr key={i}>
                          <td className="font-mono">{cat.range}</td>
                          <td>
                            <span className={`badge ${cat.color} text-white`}>{cat.label}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Measure Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              So misst du richtig
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">📏</div>
                  <h3 className="card-title justify-center">Halsumfang</h3>
                  <p className="opacity-80">
                    Miss direkt unterhalb des Kehlkopfs (Adamsapfel). Das Massband sollte horizontal verlaufen und eng anliegen.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">📐</div>
                  <h3 className="card-title justify-center">Bauchumfang</h3>
                  <p className="opacity-80">
                    Männer: Auf Nabelhöhe messen. Frauen: An der schmalsten Stelle der Taille. Nicht einziehen!
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="card-title justify-center">Hüftumfang</h3>
                  <p className="opacity-80">
                    Nur für Frauen: An der breitesten Stelle des Gesässes messen. Horizontal und ohne einzuziehen.
                  </p>
                </div>
              </div>
            </div>
            <div className="alert alert-success mt-8 max-w-2xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Tipp:</strong> Miss immer zur gleichen Zeit (morgens nüchtern) und notiere die Werte, um deinen Fortschritt zu verfolgen.</span>
            </div>
          </div>
        </section>

        {/* Explanation Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Körperfett vs. BMI
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Warum Körperfett wichtiger ist</h3>
                  <p className="opacity-80">
                    Der BMI unterscheidet nicht zwischen Muskeln und Fett. Ein Bodybuilder kann einen hohen BMI haben, aber einen niedrigen Körperfettanteil. Der KFA zeigt dir, wie viel tatsächlich Fett ist.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Unterscheidet Fett- von Muskelmasse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Besserer Indikator für Gesundheit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Zeigt echten Fitness-Fortschritt</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Die US Navy Methode</h3>
                  <p className="opacity-80">
                    Diese Methode wurde vom US-Militär entwickelt und ist wissenschaftlich validiert. Sie nutzt Umfangsmessungen, um den Körperfettanteil zu schätzen.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="text-sm opacity-70">
                      <strong>Genauigkeit:</strong> ±3-4% Abweichung im Vergleich zu DEXA-Scans. Für die meisten Fitness-Ziele völlig ausreichend.
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
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Was ist ein gesunder Körperfettanteil?",
                  a: "Für Männer liegt der gesunde Bereich bei 10-20%, für Frauen bei 18-28%. Athleten haben oft niedrigere Werte, aber unter dem essentiellen Fettanteil zu liegen ist ungesund.",
                },
                {
                  q: "Wie genau ist die US Navy Methode?",
                  a: "Die Methode hat eine Genauigkeit von etwa ±3-4% im Vergleich zu präzisen DEXA-Scans. Für das Tracking deines Fortschritts ist sie ideal geeignet.",
                },
                {
                  q: "Warum brauchen Frauen mehr Körperfett?",
                  a: "Frauen haben biologisch mehr essentielles Fett für Hormone und Fortpflanzung. Das essenzielle Fett liegt bei Frauen bei ca. 10-13%, bei Männern nur 2-5%.",
                },
                {
                  q: "Wie schnell kann ich Körperfett verlieren?",
                  a: "Gesund sind 0.5-1% Körperfett pro Monat. Das entspricht etwa 0.5-1 kg Fettverlust pro Woche bei einem moderaten Kaloriendefizit von 500 kcal/Tag.",
                },
                {
                  q: "Warum verliere ich Gewicht aber kein Körperfett?",
                  a: "Ohne ausreichend Protein und Krafttraining verlierst du auch Muskelmasse. Mit Mahlzait trackst du Protein und Kalorien, um gezielt Fett zu verlieren.",
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
              Reduziere Körperfett mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen Körperfettanteil. Mit Mahlzait trackst du Kalorien und Protein in Sekunden – per Foto. So erreichst du deinen Traumkörper ohne Muskelverlust.
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
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI Rechner
              </a>
              <a href="/protein-bedarf-rechner" className="btn btn-outline">
                Protein-Rechner
              </a>
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit
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

export default KoerperfettRechnerPage;
