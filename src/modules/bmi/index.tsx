import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  healthyWeightMin: number;
  healthyWeightMax: number;
  idealWeight: number;
}

function BMIRechnerPage({ config }: Props) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category: string;
    let categoryColor: string;
    
    if (bmi < 18.5) {
      category = "Untergewicht";
      categoryColor = "warning";
    } else if (bmi < 25) {
      category = "Normalgewicht";
      categoryColor = "success";
    } else if (bmi < 30) {
      category = "Übergewicht";
      categoryColor = "warning";
    } else if (bmi < 35) {
      category = "Adipositas Grad I";
      categoryColor = "error";
    } else if (bmi < 40) {
      category = "Adipositas Grad II";
      categoryColor = "error";
    } else {
      category = "Adipositas Grad III";
      categoryColor = "error";
    }

    // Calculate healthy weight range (BMI 18.5-24.9)
    const healthyWeightMin = Math.round(18.5 * heightInMeters * heightInMeters);
    const healthyWeightMax = Math.round(24.9 * heightInMeters * heightInMeters);
    const idealWeight = Math.round(22 * heightInMeters * heightInMeters);

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      categoryColor,
      healthyWeightMin,
      healthyWeightMax,
      idealWeight,
    });
  };

  const bmiCategories = [
    { range: "< 18.5", label: "Untergewicht", color: "bg-warning" },
    { range: "18.5 - 24.9", label: "Normalgewicht", color: "bg-success" },
    { range: "25 - 29.9", label: "Übergewicht", color: "bg-warning" },
    { range: "30 - 34.9", label: "Adipositas Grad I", color: "bg-error" },
    { range: "35 - 39.9", label: "Adipositas Grad II", color: "bg-error" },
    { range: "≥ 40", label: "Adipositas Grad III", color: "bg-error" },
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
              BMI Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen Body Mass Index (BMI) und finde heraus, ob dein Gewicht im gesunden Bereich liegt. Inklusive Interpretation und Idealgewicht.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">BMI berechnen</h2>

              {/* Height - Prominent Display */}
              <div className="mb-8">
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
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>140</span>
                  <span>160</span>
                  <span>180</span>
                  <span>200</span>
                  <span>220</span>
                </div>
              </div>

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

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateBMI}>
                BMI berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className={`text-6xl font-bold text-${result.categoryColor}`}>
                      {result.bmi}
                    </div>
                    <div className={`text-xl font-semibold mt-2 text-${result.categoryColor}`}>
                      {result.category}
                    </div>
                  </div>

                  {/* BMI Scale Visualization */}
                  <div className="relative h-8 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-warning"></div>
                    <div className="flex-1 bg-success"></div>
                    <div className="flex-1 bg-warning"></div>
                    <div className="flex-1 bg-error"></div>
                    {/* Indicator */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-base-content"
                      style={{ 
                        left: `${Math.min(Math.max((result.bmi - 15) / 30 * 100, 0), 100)}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">
                        {result.bmi}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs opacity-60">
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>45</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Idealgewicht</h3>
                        <p className="text-2xl font-bold text-primary">{result.idealWeight} kg</p>
                        <p className="text-xs opacity-60">bei BMI 22</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Gesunder Bereich</h3>
                        <p className="text-2xl font-bold text-success">{result.healthyWeightMin}-{result.healthyWeightMax} kg</p>
                        <p className="text-xs opacity-60">bei BMI 18.5-24.9</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Differenz</h3>
                        <p className="text-2xl font-bold">
                          {weight > result.healthyWeightMax 
                            ? `+${weight - result.healthyWeightMax} kg`
                            : weight < result.healthyWeightMin
                            ? `-${result.healthyWeightMin - weight} kg`
                            : "✓ Im Ziel"}
                        </p>
                        <p className="text-xs opacity-60">zum gesunden Bereich</p>
                      </div>
                    </div>
                  </div>

                  {result.category !== "Normalgewicht" && (
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
                        <p className="font-semibold">Erreiche dein Zielgewicht mit Mahlzait!</p>
                        <p className="text-sm">
                          Tracke deine Kalorien einfach per Foto und erreiche nachhaltig dein Wunschgewicht.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BMI Table Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              BMI Tabelle – Kategorien der WHO
            </h2>
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>BMI</th>
                    <th>Kategorie</th>
                    <th>Bewertung</th>
                  </tr>
                </thead>
                <tbody>
                  {bmiCategories.map((cat, i) => (
                    <tr key={i}>
                      <td className="font-mono">{cat.range}</td>
                      <td>{cat.label}</td>
                      <td>
                        <span className={`badge ${cat.color} text-white`}>
                          {cat.label === "Normalgewicht" ? "Optimal" : "Risiko"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Explanation Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was ist der BMI?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Die Formel</h3>
                  <p className="opacity-80">
                    Der Body Mass Index (BMI) ist eine Kennzahl zur Bewertung des Körpergewichts im Verhältnis zur Körpergrösse. Er wird weltweit verwendet, um Unter-, Normal- und Übergewicht zu klassifizieren.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-lg text-center">
                      <strong>BMI = Gewicht (kg) ÷ Grösse (m)²</strong>
                    </p>
                    <p className="text-sm opacity-70 text-center mt-2">
                      Beispiel: 75 kg ÷ (1.75 m)² = 24.5
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Grenzen des BMI</h3>
                  <p className="opacity-80">
                    Der BMI unterscheidet nicht zwischen Muskelmasse und Fettmasse. Sportler mit viel Muskeln können einen hohen BMI haben, obwohl sie gesund sind.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-warning">⚠️</span>
                      <span className="text-sm">Berücksichtigt keine Körperzusammensetzung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">⚠️</span>
                      <span className="text-sm">Gilt nicht für Kinder, Schwangere, Ältere</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info">💡</span>
                      <span className="text-sm">Ergänze mit Bauchumfang-Messung</span>
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
              Häufig gestellte Fragen zum BMI
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Was ist ein guter BMI?",
                  a: "Ein BMI zwischen 18.5 und 24.9 gilt als Normalgewicht und ist mit dem geringsten Gesundheitsrisiko verbunden. Der optimale BMI liegt bei etwa 22.",
                },
                {
                  q: "Ist der BMI für alle Menschen geeignet?",
                  a: "Nein, der BMI eignet sich nicht für Kinder, Schwangere, Stillende, sehr muskulöse Personen und Menschen über 65. Für diese Gruppen gibt es spezielle Bewertungsmethoden.",
                },
                {
                  q: "Wie kann ich meinen BMI verbessern?",
                  a: "Durch eine ausgewogene Ernährung und regelmässige Bewegung. Mit Kalorientracking kannst du dein Ziel kontrolliert erreichen – ohne Crash-Diäten.",
                },
                {
                  q: "Wie genau ist der BMI?",
                  a: "Der BMI ist ein grober Richtwert. Für eine genaue Beurteilung solltest du auch den Bauchumfang, Körperfettanteil und andere Faktoren berücksichtigen.",
                },
                {
                  q: "Warum verwenden Ärzte den BMI?",
                  a: "Der BMI ist einfach zu berechnen und liefert einen schnellen Anhaltspunkt. Er korreliert auf Bevölkerungsebene gut mit gesundheitlichen Risiken wie Diabetes und Herz-Kreislauf-Erkrankungen.",
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
              Erreiche dein Wunschgewicht mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen BMI. Mit Mahlzait trackst du deine Ernährung in Sekunden – per Foto, Text oder Barcode. So erreichst du dein Zielgewicht nachhaltig.
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
              <a href="/makros-berechnen" className="btn btn-outline">
                Makros berechnen
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

export default BMIRechnerPage;
