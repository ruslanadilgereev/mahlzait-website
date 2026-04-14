import { useState, useMemo } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

import AuthorByline from "@components/AuthorByline";
interface Props {
  config: TemplateConfig;
}

type Gender = "male" | "female";

interface WHRResult {
  ratio: number;
  category: "low" | "moderate" | "high";
  healthRisk: string;
  description: string;
}

function getWHRCategory(ratio: number, gender: Gender): WHRResult {
  if (gender === "male") {
    if (ratio < 0.90) {
      return {
        ratio,
        category: "low",
        healthRisk: "Niedrig",
        description: "Dein Taille-Hüft-Verhältnis liegt im gesunden Bereich. Weiter so!",
      };
    } else if (ratio <= 0.99) {
      return {
        ratio,
        category: "moderate",
        healthRisk: "Moderat erhöht",
        description: "Dein WHR deutet auf ein leicht erhöhtes Risiko hin. Achte auf ausreichend Bewegung.",
      };
    } else {
      return {
        ratio,
        category: "high",
        healthRisk: "Erhöht",
        description: "Dein WHR zeigt ein erhöhtes Risiko für Herz-Kreislauf-Erkrankungen. Sprich mit einem Arzt.",
      };
    }
  } else {
    if (ratio < 0.80) {
      return {
        ratio,
        category: "low",
        healthRisk: "Niedrig",
        description: "Dein Taille-Hüft-Verhältnis liegt im gesunden Bereich. Weiter so!",
      };
    } else if (ratio <= 0.84) {
      return {
        ratio,
        category: "moderate",
        healthRisk: "Moderat erhöht",
        description: "Dein WHR deutet auf ein leicht erhöhtes Risiko hin. Achte auf ausreichend Bewegung.",
      };
    } else {
      return {
        ratio,
        category: "high",
        healthRisk: "Erhöht",
        description: "Dein WHR zeigt ein erhöhtes Risiko für Herz-Kreislauf-Erkrankungen. Sprich mit einem Arzt.",
      };
    }
  }
}

function WHRRechnerPage({ config }: Props) {
  const [gender, setGender] = useState<Gender>("female");
  const [waist, setWaist] = useState<string>("80");
  const [hip, setHip] = useState<string>("100");
  const [showResults, setShowResults] = useState(false);

  const result = useMemo<WHRResult | null>(() => {
    const waistNum = parseFloat(waist);
    const hipNum = parseFloat(hip);
    
    if (isNaN(waistNum) || isNaN(hipNum) || waistNum <= 0 || hipNum <= 0) {
      return null;
    }
    
    const ratio = waistNum / hipNum;
    return getWHRCategory(ratio, gender);
  }, [waist, hip, gender]);

  const handleCalculate = () => {
    if (result) {
      setShowResults(true);
    }
  };

  const categoryColor = (category: WHRResult["category"]) => {
    switch (category) {
      case "low":
        return "text-success";
      case "moderate":
        return "text-warning";
      case "high":
        return "text-error";
    }
  };

  const categoryBadge = (category: WHRResult["category"]) => {
    switch (category) {
      case "low":
        return <span className="badge badge-success badge-lg gap-1">✓ Niedrig</span>;
      case "moderate":
        return <span className="badge badge-warning badge-lg gap-1">⚠ Moderat</span>;
      case "high":
        return <span className="badge badge-error badge-lg gap-1">⚠ Erhöht</span>;
    }
  };

  const thresholds = gender === "male" 
    ? { low: 0.90, moderate: 0.99 }
    : { low: 0.80, moderate: 0.84 };

  const bodyShapeInfo = [
    {
      shape: "Apfelform",
      emoji: "🍎",
      whr: gender === "male" ? "> 1.0" : "> 0.85",
      description: "Fett sammelt sich hauptsächlich um die Körpermitte. Höheres Gesundheitsrisiko.",
      risk: "high",
    },
    {
      shape: "Birnenform",
      emoji: "🍐",
      whr: gender === "male" ? "< 0.9" : "< 0.8",
      description: "Fett sammelt sich eher an Hüften und Oberschenkeln. Geringeres Risiko.",
      risk: "low",
    },
  ];

  const healthFacts = [
    {
      icon: "❤️",
      title: "Herzgesundheit",
      text: "Ein hoher WHR ist ein stärkerer Indikator für Herzerkrankungen als der BMI allein.",
    },
    {
      icon: "🎯",
      title: "Bauchfett zählt",
      text: "Viszerales Fett (um die Organe) ist metabolisch aktiver und birgt mehr Risiken als subkutanes Fett.",
    },
    {
      icon: "📊",
      title: "WHR vs. BMI",
      text: "WHR berücksichtigt die Fettverteilung, während BMI nur Gewicht und Größe misst.",
    },
    {
      icon: "🏃",
      title: "Veränderbar",
      text: "Bauchfett reagiert gut auf Ausdauertraining und Kraftsport. Bereits kleine Veränderungen helfen.",
    },
  ];

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Taille-Hüft-Verhältnis-Rechner", url: "/taille-hueft-verhaeltnis-rechner/" },
        ]} />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Taille-Hüft-Verhältnis Rechner
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne dein WHR (Waist-to-Hip Ratio) und erfahre, was die Fettverteilung 
              über dein Gesundheitsrisiko aussagt.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 text-white">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  className={`btn btn-lg flex-1 transition-all ${
                    gender === "female"
                      ? "bg-white text-rose-600 hover:bg-white/90 border-0"
                      : "btn-ghost bg-white/10 hover:bg-white/20 border-white/30"
                  }`}
                  onClick={() => { setGender("female"); setShowResults(false); }}
                >
                  <span className="text-2xl mr-2">👩</span>
                  Frau
                </button>
                <button
                  className={`btn btn-lg flex-1 transition-all ${
                    gender === "male"
                      ? "bg-white text-rose-600 hover:bg-white/90 border-0"
                      : "btn-ghost bg-white/10 hover:bg-white/20 border-white/30"
                  }`}
                  onClick={() => { setGender("male"); setShowResults(false); }}
                >
                  <span className="text-2xl mr-2">👨</span>
                  Mann
                </button>
              </div>
            </div>

            <div className="card-body p-6 md:p-8">
              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Taillenumfang (cm)</span>
                    <span className="label-text-alt opacity-60">schmalste Stelle</span>
                  </label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => { setWaist(e.target.value); setShowResults(false); }}
                    placeholder="z.B. 80"
                    className="input input-bordered input-lg text-center text-2xl font-bold"
                    min="40"
                    max="200"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Hüftumfang (cm)</span>
                    <span className="label-text-alt opacity-60">breiteste Stelle</span>
                  </label>
                  <input
                    type="number"
                    value={hip}
                    onChange={(e) => { setHip(e.target.value); setShowResults(false); }}
                    placeholder="z.B. 100"
                    className="input input-bordered input-lg text-center text-2xl font-bold"
                    min="50"
                    max="200"
                  />
                </div>
              </div>

              {/* Measurement Guide */}
              <div className="bg-base-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📏</span>
                  <div>
                    <p className="font-medium">So misst du richtig:</p>
                    <ul className="text-sm opacity-80 mt-1 space-y-1">
                      <li>• <strong>Taille:</strong> Schmalste Stelle, meist auf Nabelhöhe</li>
                      <li>• <strong>Hüfte:</strong> Breiteste Stelle, über dem Gesäß</li>
                      <li>• Morgens nüchtern messen für beste Genauigkeit</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-lg w-full text-lg"
                onClick={handleCalculate}
                disabled={!result}
              >
                WHR berechnen
              </button>

              {/* Results */}
              {showResults && result && (
                <div className="mt-8">
                  <div className="divider">Dein Ergebnis</div>

                  {/* Main Result */}
                  <div className={`text-center p-6 rounded-2xl ${
                    result.category === "low" 
                      ? "bg-success/10 border-2 border-success"
                      : result.category === "moderate"
                      ? "bg-warning/10 border-2 border-warning"
                      : "bg-error/10 border-2 border-error"
                  }`}>
                    <p className="text-sm opacity-60 mb-2">Dein Taille-Hüft-Verhältnis</p>
                    <p className={`text-6xl font-extrabold ${categoryColor(result.category)}`}>
                      {result.ratio.toFixed(2)}
                    </p>
                    <div className="mt-4">
                      {categoryBadge(result.category)}
                    </div>
                    <p className="mt-4 opacity-80">{result.description}</p>
                  </div>

                  {/* Risk Scale */}
                  <div className="mt-6 p-4 bg-base-200 rounded-xl">
                    <p className="text-sm font-medium mb-3">
                      Risikobewertung für {gender === "male" ? "Männer" : "Frauen"}:
                    </p>
                    <div className="relative h-8 rounded-full overflow-hidden flex">
                      <div className="flex-1 bg-success flex items-center justify-center text-xs text-white font-medium">
                        &lt; {thresholds.low}
                      </div>
                      <div className="flex-1 bg-warning flex items-center justify-center text-xs text-white font-medium">
                        {thresholds.low} - {thresholds.moderate}
                      </div>
                      <div className="flex-1 bg-error flex items-center justify-center text-xs text-white font-medium">
                        &gt; {thresholds.moderate}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs opacity-60 mt-1">
                      <span>Niedriges Risiko</span>
                      <span>Moderat</span>
                      <span>Erhöhtes Risiko</span>
                    </div>
                    
                    {/* Indicator Arrow */}
                    <div className="relative mt-4">
                      <div 
                        className="absolute -top-2 transform -translate-x-1/2"
                        style={{ 
                          left: `${Math.min(Math.max(
                            ((result.ratio - 0.6) / (1.2 - 0.6)) * 100, 
                            0
                          ), 100)}%` 
                        }}
                      >
                        <div className="text-2xl">📍</div>
                        <p className="text-xs font-bold text-center">{result.ratio.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {result.category !== "low" && (
                    <div className="alert bg-base-100 border-2 border-primary/30 mt-6">
                      <span className="text-3xl">💡</span>
                      <div>
                        <p className="font-semibold">Tipps zur Verbesserung</p>
                        <ul className="text-sm opacity-80 mt-1 space-y-1">
                          <li>• Regelmäßiges Ausdauertraining (30+ Min, 3x/Woche)</li>
                          <li>• Krafttraining zur Steigerung des Grundumsatzes</li>
                          <li>• Reduktion von Zucker und verarbeiteten Lebensmitteln</li>
                          <li>• Ausreichend Schlaf (7-9 Stunden) zur Hormonregulation</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Body Shape Explanation */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Apfelform vs. Birnenform
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-12">
              Die Verteilung von Körperfett ist wichtiger als die Gesamtmenge. 
              Wo du Fett speicherst, beeinflusst dein Gesundheitsrisiko.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {bodyShapeInfo.map((shape, index) => (
                <div 
                  key={index} 
                  className={`card bg-base-100 shadow-xl border-2 ${
                    shape.risk === "high" ? "border-error/30" : "border-success/30"
                  }`}
                >
                  <div className="card-body text-center">
                    <div className="text-6xl mb-2">{shape.emoji}</div>
                    <h3 className="text-xl font-bold">{shape.shape}</h3>
                    <p className="text-lg opacity-60">WHR {shape.whr}</p>
                    <div className="divider my-2"></div>
                    <p className="opacity-80">{shape.description}</p>
                    <div className="mt-4">
                      {shape.risk === "high" ? (
                        <span className="badge badge-error">Höheres Risiko</span>
                      ) : (
                        <span className="badge badge-success">Geringeres Risiko</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Explanation */}
            <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto mt-8 overflow-hidden">
              <div className="card-body">
                <h3 className="font-bold text-lg mb-4">Warum ist Bauchfett gefährlicher?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-error/10 rounded-xl">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span>🔴</span> Viszerales Fett (Bauch)
                    </h4>
                    <ul className="text-sm space-y-1 opacity-80">
                      <li>• Umgibt innere Organe</li>
                      <li>• Produziert Entzündungsstoffe</li>
                      <li>• Beeinflusst Insulinresistenz</li>
                      <li>• Erhöht Risiko für Diabetes & Herzerkrankungen</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-success/10 rounded-xl">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span>🟢</span> Subkutanes Fett (Hüfte)
                    </h4>
                    <ul className="text-sm space-y-1 opacity-80">
                      <li>• Liegt unter der Haut</li>
                      <li>• Weniger metabolisch aktiv</li>
                      <li>• Dient als Energiespeicher</li>
                      <li>• Geringerer Einfluss auf Stoffwechsel</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Health Facts */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Warum WHR wichtig ist
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-12">
              Das Taille-Hüft-Verhältnis ist ein wissenschaftlich anerkannter 
              Indikator für gesundheitliche Risiken.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {healthFacts.map((fact, index) => (
                <div key={index} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="text-3xl mb-2">{fact.icon}</div>
                    <h3 className="font-bold">{fact.title}</h3>
                    <p className="text-sm opacity-80">{fact.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reference Table */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              WHR Richtwerte nach Geschlecht
            </h2>
            
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 rounded-xl shadow-xl">
                <thead>
                  <tr className="bg-base-200">
                    <th>Risikostufe</th>
                    <th className="text-center">Frauen</th>
                    <th className="text-center">Männer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-success"></span>
                      Niedriges Risiko
                    </td>
                    <td className="text-center font-semibold text-success">&lt; 0.80</td>
                    <td className="text-center font-semibold text-success">&lt; 0.90</td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-warning"></span>
                      Moderates Risiko
                    </td>
                    <td className="text-center font-semibold text-warning">0.80 - 0.84</td>
                    <td className="text-center font-semibold text-warning">0.90 - 0.99</td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-error"></span>
                      Erhöhtes Risiko
                    </td>
                    <td className="text-center font-semibold text-error">&gt; 0.84</td>
                    <td className="text-center font-semibold text-error">&gt; 0.99</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm opacity-60 mt-4 max-w-xl mx-auto">
              Quelle: World Health Organization (WHO). Diese Werte dienen als Orientierung. 
              Für eine individuelle Beurteilung wende dich an einen Arzt.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-rose-500 to-orange-600 text-white py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Tracke deine Fortschritte mit Mahlzait
                </h2>
                <p className="opacity-90 mb-6">
                  Ernährung ist der Schlüssel zur Verbesserung deines WHR. 
                  Mit Mahlzait trackst du Kalorien und Makros in Sekunden – 
                  für nachhaltige Ergebnisse.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">🎯</span>
                    <span>Kaloriendefizit für gezielten Fettabbau</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">💪</span>
                    <span>Proteinziele für Muskelerhalt</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">📈</span>
                    <span>Gewichtsverlauf über Zeit</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-4">Jetzt kostenlos starten</h3>
                <p className="opacity-90 mb-4">
                  Lade Mahlzait herunter und beginne noch heute mit dem Tracking. 
                  Dein zukünftiges Ich wird es dir danken.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={config.appStoreLink} className="btn bg-white text-rose-600 hover:bg-white/90">
                    iOS App
                  </a>
                  <a href={config.googlePlayLink} className="btn bg-white text-rose-600 hover:bg-white/90">
                    Android App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum WHR
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Was ist ein gutes Taille-Hüft-Verhältnis?",
                  a: "Für Frauen gilt ein WHR unter 0.80 als gesund, für Männer unter 0.90. Diese Werte sind laut WHO mit einem niedrigen Risiko für Herz-Kreislauf-Erkrankungen verbunden.",
                },
                {
                  q: "Ist WHR besser als BMI?",
                  a: "WHR und BMI ergänzen sich. Der BMI berücksichtigt nicht, wo das Fett sitzt. WHR zeigt gezielt das Bauchfett an, das gesundheitlich bedenklicher ist. Am besten nutzt du beide Werte zusammen.",
                },
                {
                  q: "Wie messe ich meinen Taillenumfang richtig?",
                  a: "Miss an der schmalsten Stelle deiner Taille, meist auf Höhe des Bauchnabels. Steh aufrecht, atme normal aus und halte das Maßband horizontal. Miss morgens vor dem Essen für konsistente Ergebnisse.",
                },
                {
                  q: "Wie kann ich mein WHR verbessern?",
                  a: "Bauchfett reagiert gut auf Kaloriendefizit, Ausdauertraining und Kraftsport. Reduziere Zucker und Alkohol, erhöhe Ballaststoffe und Protein. Auch ausreichend Schlaf und Stressabbau helfen.",
                },
                {
                  q: "Wie oft sollte ich mein WHR messen?",
                  a: "Einmal pro Woche oder alle zwei Wochen reicht aus. Miss immer zur gleichen Tageszeit (morgens nüchtern) für vergleichbare Werte. Körpermaße ändern sich langsamer als das Gewicht.",
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

        {/* Internal Links */}
        <section className="bg-base-200 py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Körper-Rechner</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI-Rechner
              </a>
              <a href="/koerperfett-rechner" className="btn btn-outline">
                Körperfett-Rechner
              </a>
              <a href="/idealgewicht-rechner" className="btn btn-outline">
                Idealgewicht-Rechner
              </a>
              <a href="/grundumsatz-rechner" className="btn btn-outline">
                Grundumsatz-Rechner
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

        <RelatedWissen calculatorSlug="taille-hueft-verhaeltnis-rechner" />
        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default WHRRechnerPage;
