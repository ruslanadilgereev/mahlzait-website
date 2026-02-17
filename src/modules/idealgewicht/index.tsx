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

interface IdealWeightResult {
  broca: number;
  brocaModified: number;
  lorentz: number;
  bmiIdeal: number;
  bmiRangeMin: number;
  bmiRangeMax: number;
  average: number;
  currentDiff: number;
}

type Gender = "male" | "female";
type BodyFrame = "small" | "medium" | "large";

function IdealgewichtRechnerPage({ config }: Props) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>("male");
  const [bodyFrame, setBodyFrame] = useState<BodyFrame>("medium");
  const [result, setResult] = useState<IdealWeightResult | null>(null);

  const calculateIdealWeight = () => {
    const heightM = height / 100;
    
    // 1. Broca Index (classic): Height (cm) - 100
    const broca = height - 100;
    
    // 2. Modified Broca: adjusted for gender
    const brocaModified = gender === "male" 
      ? (height - 100) * 0.9 
      : (height - 100) * 0.85;
    
    // 3. Lorentz Formula (different for men/women)
    const lorentz = gender === "male"
      ? (height - 100) - ((height - 150) / 4)
      : (height - 100) - ((height - 150) / 2);
    
    // 4. BMI-based ideal weight (BMI = 22 is considered ideal)
    const bmiIdeal = 22 * heightM * heightM;
    
    // 5. Healthy BMI range (18.5 - 24.9)
    const bmiRangeMin = 18.5 * heightM * heightM;
    const bmiRangeMax = 24.9 * heightM * heightM;
    
    // Body frame adjustment
    let frameAdjustment = 1.0;
    if (bodyFrame === "small") frameAdjustment = 0.95;
    if (bodyFrame === "large") frameAdjustment = 1.05;
    
    // Age adjustment (slight increase allowed with age)
    let ageAdjustment = 0;
    if (age >= 40 && age < 50) ageAdjustment = 1;
    if (age >= 50 && age < 60) ageAdjustment = 2;
    if (age >= 60) ageAdjustment = 3;
    
    // Calculate weighted average of methods
    const average = Math.round(
      ((brocaModified * frameAdjustment) + lorentz + bmiIdeal + ageAdjustment) / 3
    );
    
    // Difference from current weight
    const currentDiff = weight - average;

    setResult({
      broca: Math.round(broca),
      brocaModified: Math.round(brocaModified * frameAdjustment),
      lorentz: Math.round(lorentz),
      bmiIdeal: Math.round(bmiIdeal),
      bmiRangeMin: Math.round(bmiRangeMin),
      bmiRangeMax: Math.round(bmiRangeMax),
      average,
      currentDiff: Math.round(currentDiff),
    });
  };

  const formulas = [
    {
      name: "Broca-Index",
      formula: "Grösse (cm) − 100",
      description: "Klassische Formel aus dem 19. Jahrhundert, heute als Obergrenze genutzt",
    },
    {
      name: "Modifizierter Broca",
      formula: "(Grösse − 100) × 0.9 (♂) / × 0.85 (♀)",
      description: "Angepasste Version mit Geschlechtskorrektur für realistischere Werte",
    },
    {
      name: "Lorentz-Formel",
      formula: "(Grösse − 100) − (Grösse − 150) / 4 (♂) oder / 2 (♀)",
      description: "Berücksichtigt Geschlecht und Körperproportionen besser",
    },
    {
      name: "BMI-Methode",
      formula: "22 × (Grösse in m)²",
      description: "Basiert auf dem optimalen BMI-Wert von 22 nach WHO",
    },
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
              Idealgewicht Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne dein persönliches Idealgewicht mit 4 wissenschaftlichen Formeln. 
              Berücksichtigt Geschlecht, Alter und Körperbau.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">Dein Idealgewicht berechnen</h2>

              {/* Gender Selection */}
              <div className="mb-6">
                <span className="text-lg font-semibold mb-3 block">Geschlecht</span>
                <div className="flex gap-4">
                  <button
                    className={`btn btn-lg flex-1 ${gender === "male" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("male")}
                  >
                    👨 Männlich
                  </button>
                  <button
                    className={`btn btn-lg flex-1 ${gender === "female" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("female")}
                  >
                    👩 Weiblich
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
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="140"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
              </div>

              {/* Current Weight */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Aktuelles Gewicht</span>
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
              </div>

              {/* Age */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Alter</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="16"
                      max="99"
                      value={age}
                      onChange={(e) => setAge(Math.min(99, Math.max(16, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">Jahre</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="16"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
              </div>

              {/* Body Frame */}
              <div className="mb-8">
                <span className="text-lg font-semibold mb-3 block">Körperbau</span>
                <div className="flex gap-2">
                  <button
                    className={`btn flex-1 ${bodyFrame === "small" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setBodyFrame("small")}
                  >
                    Schmal
                  </button>
                  <button
                    className={`btn flex-1 ${bodyFrame === "medium" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setBodyFrame("medium")}
                  >
                    Normal
                  </button>
                  <button
                    className={`btn flex-1 ${bodyFrame === "large" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setBodyFrame("large")}
                  >
                    Breit
                  </button>
                </div>
                <p className="text-sm opacity-60 mt-2">
                  Tipp: Miss deinen Handgelenkumfang – unter 16 cm = schmal, 16-18 cm = normal, über 18 cm = breit
                </p>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateIdealWeight}>
                Idealgewicht berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  {/* Main Result */}
                  <div className="text-center py-6 bg-base-200 rounded-xl">
                    <p className="text-sm uppercase tracking-wider opacity-70 mb-2">
                      Dein Idealgewicht
                    </p>
                    <div className="text-6xl font-bold text-primary">
                      {result.average} kg
                    </div>
                    <p className="mt-3 text-lg">
                      Gesunder Bereich: <span className="font-semibold text-success">{result.bmiRangeMin}–{result.bmiRangeMax} kg</span>
                    </p>
                  </div>

                  {/* Difference */}
                  <div className={`alert ${
                    Math.abs(result.currentDiff) <= 2 ? "alert-success" : 
                    result.currentDiff > 0 ? "alert-warning" : "alert-info"
                  }`}>
                    {Math.abs(result.currentDiff) <= 2 ? (
                      <>
                        <span className="text-2xl">🎉</span>
                        <div>
                          <p className="font-semibold">Du bist im Idealbereich!</p>
                          <p className="text-sm">Dein aktuelles Gewicht entspricht deinem Idealgewicht.</p>
                        </div>
                      </>
                    ) : result.currentDiff > 0 ? (
                      <>
                        <span className="text-2xl">📉</span>
                        <div>
                          <p className="font-semibold">{result.currentDiff} kg über dem Idealgewicht</p>
                          <p className="text-sm">Mit Mahlzait erreichst du dein Ziel nachhaltig und ohne Crash-Diät.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">📈</span>
                        <div>
                          <p className="font-semibold">{Math.abs(result.currentDiff)} kg unter dem Idealgewicht</p>
                          <p className="text-sm">Tracke deine Ernährung, um gesund zuzunehmen.</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Formula Results */}
                  <div className="grid gap-3 md:grid-cols-2 mt-6">
                    <div className="card bg-base-200">
                      <div className="card-body py-4">
                        <h3 className="text-sm opacity-70">Broca-Index</h3>
                        <p className="text-2xl font-bold">{result.broca} kg</p>
                        <p className="text-xs opacity-60">Klassische Formel</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4">
                        <h3 className="text-sm opacity-70">Modifizierter Broca</h3>
                        <p className="text-2xl font-bold">{result.brocaModified} kg</p>
                        <p className="text-xs opacity-60">Mit Körperbau-Korrektur</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4">
                        <h3 className="text-sm opacity-70">Lorentz-Formel</h3>
                        <p className="text-2xl font-bold">{result.lorentz} kg</p>
                        <p className="text-xs opacity-60">Geschlechtsspezifisch</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4">
                        <h3 className="text-sm opacity-70">BMI-Methode</h3>
                        <p className="text-2xl font-bold">{result.bmiIdeal} kg</p>
                        <p className="text-xs opacity-60">Bei optimalem BMI 22</p>
                      </div>
                    </div>
                  </div>

                  {/* Weight Scale Visualization */}
                  <div className="mt-6">
                    <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-info via-success to-warning">
                      {/* Current Weight Marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-base-content rounded"
                        style={{ 
                          left: `${Math.min(Math.max((weight - result.bmiRangeMin) / (result.bmiRangeMax - result.bmiRangeMin + 20) * 100, 5), 95)}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap bg-base-content text-base-100 px-2 py-1 rounded">
                          Du: {weight} kg
                        </div>
                      </div>
                      {/* Ideal Weight Marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-primary rounded border-2 border-white"
                        style={{ 
                          left: `${Math.min(Math.max((result.average - result.bmiRangeMin) / (result.bmiRangeMax - result.bmiRangeMin + 20) * 100, 5), 95)}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap text-primary">
                          Ideal: {result.average} kg
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs opacity-60 mt-10">
                      <span>{result.bmiRangeMin} kg</span>
                      <span className="text-success font-semibold">Gesunder Bereich</span>
                      <span>{result.bmiRangeMax} kg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Formula Explanation Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Die 4 Formeln zur Berechnung des Idealgewichts
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {formulas.map((f, i) => (
                <div key={i} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">{f.name}</h3>
                    <div className="bg-base-200 p-3 rounded-lg font-mono text-sm">
                      {f.formula}
                    </div>
                    <p className="opacity-80 text-sm mt-2">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was ist das Idealgewicht?
            </h2>
            <div className="prose prose-lg max-w-3xl mx-auto">
              <p>
                Das <strong>Idealgewicht</strong> ist das Körpergewicht, bei dem statistisch gesehen 
                das geringste Gesundheitsrisiko besteht und die höchste Lebenserwartung erreicht wird. 
                Es ist individuell verschieden und hängt von mehreren Faktoren ab:
              </p>
              <ul>
                <li><strong>Körpergrösse</strong> – der wichtigste Faktor</li>
                <li><strong>Geschlecht</strong> – Männer haben mehr Muskelmasse</li>
                <li><strong>Alter</strong> – mit zunehmendem Alter ist etwas mehr Gewicht normal</li>
                <li><strong>Körperbau</strong> – schmale vs. breite Statur</li>
                <li><strong>Muskelmasse</strong> – Sportler wiegen mehr bei gleichem Fettanteil</li>
              </ul>
              <p>
                Wichtig: Das Idealgewicht ist ein <strong>Richtwert</strong>, kein absolutes Ziel. 
                Wohlbefinden, Fitness und Gesundheitswerte sind wichtiger als eine Zahl auf der Waage.
              </p>
            </div>
          </div>
        </section>

        {/* Ideal Weight Table */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Idealgewicht Tabelle nach Körpergrösse
            </h2>
            <div className="overflow-x-auto max-w-3xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Grösse</th>
                    <th>Frauen (kg)</th>
                    <th>Männer (kg)</th>
                    <th>Gesunder Bereich (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { h: 160, f: "51-54", m: "54-58", range: "47-64" },
                    { h: 165, f: "54-58", m: "58-62", range: "50-68" },
                    { h: 170, f: "58-62", m: "62-66", range: "54-72" },
                    { h: 175, f: "61-65", m: "66-70", range: "57-76" },
                    { h: 180, f: "65-69", m: "70-75", range: "60-81" },
                    { h: 185, f: "69-73", m: "74-79", range: "63-85" },
                    { h: 190, f: "72-77", m: "78-84", range: "67-90" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{row.h} cm</td>
                      <td>{row.f}</td>
                      <td>{row.m}</td>
                      <td className="text-success">{row.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm opacity-70 mt-4">
              Basierend auf BMI 18.5-24.9 und Lorentz-Formel
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum Idealgewicht
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Welche Formel ist am genauesten?",
                  a: "Keine einzelne Formel ist perfekt. Deshalb kombiniert unser Rechner vier Formeln und berücksichtigt zusätzlich Alter und Körperbau. Die BMI-Methode (Ziel-BMI 22) gilt heute als guter Ausgangspunkt.",
                },
                {
                  q: "Ist das Idealgewicht für alle gleich?",
                  a: "Nein, das Idealgewicht ist individuell. Zwei Menschen gleicher Grösse können unterschiedliche Idealgewichte haben – je nach Muskelmasse, Knochenbau und genetischen Faktoren.",
                },
                {
                  q: "Was ist der Unterschied zwischen Idealgewicht und Normalgewicht?",
                  a: "Das Normalgewicht ist der Bereich, in dem keine gesundheitlichen Risiken bestehen (BMI 18.5-24.9). Das Idealgewicht liegt innerhalb dieses Bereichs und ist der statistische Optimalwert (BMI ~22).",
                },
                {
                  q: "Sollte ich versuchen, mein Idealgewicht zu erreichen?",
                  a: "Das Idealgewicht ist ein Richtwert, kein Muss. Wichtiger sind Wohlbefinden, Fitness und Gesundheitsmarker wie Blutdruck und Blutzucker. Eine moderate Abweichung ist völlig normal.",
                },
                {
                  q: "Wie erreiche ich mein Idealgewicht gesund?",
                  a: "Durch ein moderates Kaloriendefizit (300-500 kcal/Tag), ausgewogene Ernährung und Bewegung. Mit Kalorientracking per App behältst du den Überblick und vermeidest Crash-Diäten.",
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
              Erreiche dein Idealgewicht mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt dein Idealgewicht. Mit Mahlzait trackst du deine Ernährung in Sekunden – 
              per Foto, Text oder Barcode. So erreichst du dein Ziel nachhaltig und ohne Hungern.
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
              <a href="/grundumsatz-rechner" className="btn btn-outline">
                Grundumsatz Rechner
              </a>
              <a href="/koerperfett-rechner" className="btn btn-outline">
                Körperfett Rechner
              </a>
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf berechnen
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

export default IdealgewichtRechnerPage;
