import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";

import AuthorByline from "@components/AuthorByline";
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

  const faqs = [
    {
      q: "Was ist ein guter BMI?",
      a: 'Ein BMI zwischen 18,5 und 24,9 gilt als Normalgewicht und ist mit dem geringsten Gesundheitsrisiko verbunden. Der optimale BMI liegt bei etwa 22. Allerdings h\u00E4ngt der \u201Eideale\u201C BMI auch von Alter, Geschlecht und Muskelmasse ab. F\u00FCr Senioren \u00FCber 65 ist ein BMI von 24\u201329 optimal.',
    },
    {
      q: "Ist der BMI für alle Menschen geeignet?",
      a: "Nein, der BMI eignet sich nicht für Kinder, Schwangere, Stillende, sehr muskulöse Personen und Menschen über 65. Für Kinder gibt es altersabhängige BMI-Perzentilen, für Sportler ist der Körperfettanteil aussagekräftiger. Der BMI ist ein Screening-Tool für die allgemeine Bevölkerung.",
    },
    {
      q: "Wie kann ich meinen BMI verbessern?",
      a: "Durch eine ausgewogene Ernährung und regelmässige Bewegung. Bei Übergewicht hilft ein moderates Kaloriendefizit (300\u2013500 kcal/Tag). Bei Untergewicht solltest du deine Kalorienzufuhr langsam steigern. Kalorien tracken mit einer App wie Mahlzait macht es einfach, den Überblick zu behalten.",
    },
    {
      q: "Wie genau ist der BMI?",
      a: "Der BMI ist ein grober Richtwert mit bekannten Schwächen \u2013 er unterscheidet nicht zwischen Muskel- und Fettmasse. Für eine genauere Beurteilung ergänze den BMI mit dem Bauchumfang (unter 94 cm für Männer, unter 80 cm für Frauen) oder dem Körperfettanteil.",
    },
    {
      q: "Warum verwenden Ärzte den BMI?",
      a: "Der BMI ist einfach zu berechnen, benötigt keine speziellen Geräte und korreliert auf Bevölkerungsebene gut mit Gesundheitsrisiken. Studien mit Millionen Teilnehmern zeigen: Je weiter der BMI vom Normalbereich abweicht, desto höher das Risiko für Diabetes, Herzerkrankungen und bestimmte Krebsarten.",
    },
    {
      q: "Was ist der Unterschied zwischen BMI und Körperfettanteil?",
      a: "Der BMI berechnet sich aus Grösse und Gewicht \u2013 er sagt nichts über die Zusammensetzung (Fett vs. Muskeln). Der Körperfettanteil misst direkt, wie viel deines Gewichts aus Fett besteht. Optimal sind 10\u201320 % für Männer und 20\u201330 % für Frauen. Für eine genaue Messung nutze unseren Körperfettrechner.",
    },
    {
      q: "Kann man einen normalen BMI haben und trotzdem ungesund sein?",
      a: 'Ja, das Ph\u00E4nomen heisst \u201ENormalgewichtiger mit metabolischem Syndrom\u201C (MONW). Jemand mit normalem BMI kann trotzdem zu viel viszerales Fett (Bauchfett) haben, was das Risiko f\u00FCr Herz-Kreislauf-Erkrankungen erh\u00F6ht. Deshalb ist der Bauchumfang als Erg\u00E4nzung zum BMI wichtig.',
    },
    {
      q: "Wie oft sollte ich meinen BMI überprüfen?",
      a: "Wenn du aktiv an deinem Gewicht arbeitest, reicht eine wöchentliche Kontrolle. Wiege dich immer zur gleichen Zeit (morgens, nüchtern) und berechne den BMI monatlich. Kurzfristige Schwankungen (Wassereinlagerungen, Mahlzeiten) sind normal. Der Trend über Wochen zählt.",
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
              BMI Rechner – Body Mass Index berechnen
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen Body Mass Index (BMI) kostenlos und erfahre sofort, ob dein Gewicht im gesunden Bereich liegt. Unser BMI-Rechner nutzt die offizielle WHO-Formel, zeigt dir dein Idealgewicht und liefert eine wissenschaftlich fundierte Einordnung deiner Ergebnisse.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">BMI berechnen</h2>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Körpergrösse</span>
                  <div className="flex items-baseline gap-1">
                    <input type="number" min="140" max="220" value={height} onChange={(e) => setHeight(Math.min(220, Math.max(140, Number(e.target.value))))} className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary" />
                    <span className="text-xl font-medium opacity-70">cm</span>
                  </div>
                </div>
                <input type="range" min="140" max="220" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="range range-primary range-lg" />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>140</span><span>160</span><span>180</span><span>200</span><span>220</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Körpergewicht</span>
                  <div className="flex items-baseline gap-1">
                    <input type="number" min="40" max="180" value={weight} onChange={(e) => setWeight(Math.min(180, Math.max(40, Number(e.target.value))))} className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary" />
                    <span className="text-xl font-medium opacity-70">kg</span>
                  </div>
                </div>
                <input type="range" min="40" max="180" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="range range-primary range-lg" />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>40</span><span>80</span><span>120</span><span>160</span><span>180</span>
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateBMI}>BMI berechnen</button>

              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>
                  <div className="text-center py-6">
                    <div className={`text-6xl font-bold text-${result.categoryColor}`}>{result.bmi}</div>
                    <div className={`text-xl font-semibold mt-2 text-${result.categoryColor}`}>{result.category}</div>
                  </div>
                  <div className="relative h-8 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-warning"></div>
                    <div className="flex-1 bg-success"></div>
                    <div className="flex-1 bg-warning"></div>
                    <div className="flex-1 bg-error"></div>
                    <div className="absolute top-0 bottom-0 w-1 bg-base-content" style={{ left: `${Math.min(Math.max((result.bmi - 15) / 30 * 100, 0), 100)}%`, transform: 'translateX(-50%)' }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">{result.bmi}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs opacity-60">
                    <span>15</span><span>18.5</span><span>25</span><span>30</span><span>45</span>
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
                          {weight > result.healthyWeightMax ? `+${weight - result.healthyWeightMax} kg` : weight < result.healthyWeightMin ? `-${result.healthyWeightMin - weight} kg` : "✓ Im Ziel"}
                        </p>
                        <p className="text-xs opacity-60">zum gesunden Bereich</p>
                      </div>
                    </div>
                  </div>
                  {result.category !== "Normalgewicht" && (
                    <div className="alert alert-info mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div>
                        <p className="font-semibold">Erreiche dein Zielgewicht mit Mahlzait!</p>
                        <p className="text-sm">Tracke deine Kalorien einfach per Foto und erreiche nachhaltig dein Wunschgewicht.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Comprehensive Guide: Was ist der BMI? */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Was ist der BMI? – Dein kompletter Guide</h2>
            <p>
              Der <strong>Body Mass Index (BMI)</strong> ist die weltweit am häufigsten verwendete Kennzahl zur Bewertung des Körpergewichts in Relation zur Körpergrösse. Die Weltgesundheitsorganisation (WHO), Ärzte und Ernährungsberater nutzen den BMI als ersten Anhaltspunkt, um festzustellen, ob eine Person unter-, normal- oder übergewichtig ist. Der BMI wurde bereits im 19. Jahrhundert vom belgischen Statistiker Adolphe Quetelet entwickelt und ist seitdem ein Standardinstrument der Gesundheitsbewertung.
            </p>
            <h3 className="text-xl font-bold mt-8 mb-4">Die BMI-Formel einfach erklärt</h3>
            <p>Die Berechnung des BMI ist denkbar einfach. Du teilst dein Körpergewicht in Kilogramm durch das Quadrat deiner Körpergrösse in Metern:</p>
            <div className="p-6 bg-base-200 rounded-lg my-6 text-center">
              <p className="font-mono text-xl"><strong>BMI = Gewicht (kg) ÷ Grösse (m)²</strong></p>
            </div>
            <p>
              Wenn du beispielsweise 80 kg wiegst und 1,80 m gross bist, rechnest du: 80 ÷ (1,80 × 1,80) = 80 ÷ 3,24 = <strong>24,7</strong>. Das bedeutet, du liegst im oberen Bereich des Normalgewichts. Diese einfache Formel macht den BMI so praktisch – du brauchst weder ein Labor noch teure Geräte. Gib einfach deine Werte in unseren <strong>BMI-Rechner</strong> oben ein und erhalte dein Ergebnis sofort.
            </p>
            <h3 className="text-xl font-bold mt-8 mb-4">Warum ist der BMI wichtig?</h3>
            <p>
              Der BMI ist mehr als nur eine Zahl. Er dient als <strong>Screening-Tool</strong>, das auf mögliche Gesundheitsrisiken hinweist. Studien zeigen, dass ein BMI ausserhalb des Normalbereichs (18,5–24,9) mit einem erhöhten Risiko für verschiedene Erkrankungen verbunden ist:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>BMI unter 18,5 (Untergewicht):</strong> Erhöhtes Risiko für Osteoporose, Anämie, geschwächtes Immunsystem und Fruchtbarkeitsprobleme. Untergewicht kann auch auf Essstörungen oder chronische Erkrankungen hindeuten.</li>
              <li><strong>BMI 18,5–24,9 (Normalgewicht):</strong> Der optimale Bereich. Das geringste Risiko für gewichtsbedingte Erkrankungen. Ein BMI von etwa 22 gilt als ideal.</li>
              <li><strong>BMI 25–29,9 (Übergewicht):</strong> Leicht erhöhtes Risiko für Bluthochdruck, Typ-2-Diabetes und Herz-Kreislauf-Erkrankungen. Hier lohnt es sich, gegenzusteuern.</li>
              <li><strong>BMI 30+ (Adipositas):</strong> Deutlich erhöhtes Risiko für Diabetes, Herzinfarkt, Schlaganfall, bestimmte Krebsarten, Schlafapnoe und Gelenkprobleme.</li>
            </ul>
            <p>
              Laut dem Robert Koch-Institut sind in Deutschland etwa 53 % der Frauen und 67 % der Männer übergewichtig (BMI ≥ 25). Knapp ein Viertel der Erwachsenen hat sogar einen BMI von 30 oder mehr und ist damit adipös. Der BMI hilft dir, dein persönliches Risiko einzuschätzen und rechtzeitig Massnahmen zu ergreifen.
            </p>
            <h3 className="text-xl font-bold mt-8 mb-4">Geschichte des BMI</h3>
            <p>
              Der BMI wurde 1832 von dem belgischen Mathematiker <strong>Adolphe Quetelet</strong> erfunden, der versuchte, den Durchschnittsmenschen statistisch zu beschreiben. Ursprünglich hiess die Kennzahl Quetelet-Index. Erst 1972 prägte der amerikanische Physiologe Ancel Keys den Begriff Body Mass Index und empfahl ihn als einfaches Werkzeug zur Bewertung des Körpergewichts auf Bevölkerungsebene. Die WHO übernahm die BMI-Klassifikation 1995 als internationalen Standard – und seitdem ist der BMI aus der Medizin nicht mehr wegzudenken.
            </p>
          </div>
        </section>

        {/* BMI Table Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">BMI Tabelle – Alle Kategorien nach WHO</h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">
              Die Weltgesundheitsorganisation (WHO) teilt den BMI in sechs Kategorien ein. Jede Kategorie ist mit unterschiedlichen Gesundheitsrisiken verbunden. Nutze unsere BMI-Tabelle, um dein Ergebnis richtig einzuordnen.
            </p>
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead><tr><th>BMI-Wert</th><th>Kategorie</th><th>Gesundheitsrisiko</th></tr></thead>
                <tbody>
                  {bmiCategories.map((cat, i) => (
                    <tr key={i}>
                      <td className="font-mono">{cat.range}</td>
                      <td>{cat.label}</td>
                      <td><span className={`badge ${cat.color} text-white`}>{cat.label === "Normalgewicht" ? "Gering" : cat.label === "Übergewicht" || cat.label === "Untergewicht" ? "Erhöht" : "Hoch"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 max-w-2xl mx-auto">
              <p className="text-sm opacity-70">
                <strong>Hinweis:</strong> Die BMI-Tabelle gilt für Erwachsene zwischen 18 und 65 Jahren. Für Kinder und Jugendliche gelten altersabhängige BMI-Perzentilen. Schwangere und Stillende sollten den BMI ebenfalls nicht als alleinigen Massstab heranziehen. Wenn du deinen <a href="/kalorienbedarf-berechnen" className="link link-primary">Kalorienbedarf berechnen</a> möchtest, um dein Gewicht gezielt zu steuern, nutze unseren separaten Rechner.
              </p>
            </div>
          </div>
        </section>

        {/* 3 Beispielrechnungen */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">3 BMI-Beispielrechnungen – So berechnest du deinen BMI</h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">Damit du die Berechnung besser nachvollziehen kannst, zeigen wir dir drei konkrete Beispiele für unterschiedliche Personen.</p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 1: Lisa, 28 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Grösse:</strong> 165 cm (1,65 m) | <strong>Gewicht:</strong> 58 kg</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">BMI = 58 ÷ (1,65)² = 58 ÷ 2,7225<br/><strong>BMI = 21,3</strong></p>
                    <div className="badge badge-success">Normalgewicht ✓</div>
                    <p className="text-sm opacity-70 mt-2">Lisa liegt mit einem BMI von 21,3 perfekt im Normalbereich. Ihr gesundes Gewicht liegt zwischen 50 und 68 kg. Sie braucht keine Veränderung – einfach weiter ausgewogen ernähren und aktiv bleiben. <strong>Idealgewicht:</strong> ca. 60 kg (BMI 22).</p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 2: Thomas, 45 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Grösse:</strong> 180 cm (1,80 m) | <strong>Gewicht:</strong> 95 kg</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">BMI = 95 ÷ (1,80)² = 95 ÷ 3,24<br/><strong>BMI = 29,3</strong></p>
                    <div className="badge badge-warning">Übergewicht</div>
                    <p className="text-sm opacity-70 mt-2">Thomas liegt knapp unter der Adipositas-Grenze. Sein gesundes Gewicht wäre 60–81 kg. Mit einem moderaten <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit</a> von 500 kcal/Tag könnte er in ca. 28 Wochen sein Idealgewicht von ca. 71 kg erreichen.</p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 3: Sarah, 35 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Grösse:</strong> 170 cm (1,70 m) | <strong>Gewicht:</strong> 52 kg</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">BMI = 52 ÷ (1,70)² = 52 ÷ 2,89<br/><strong>BMI = 18,0</strong></p>
                    <div className="badge badge-warning">Untergewicht</div>
                    <p className="text-sm opacity-70 mt-2">Sarah liegt knapp im Untergewicht. Ihr gesundes Gewicht startet bei ca. 54 kg. Eine proteinreiche Ernährung und ein leichter <a href="/kalorienbedarf-berechnen" className="link link-primary">Kalorienüberschuss</a> würden helfen. Der <a href="/protein-bedarf-rechner" className="link link-primary">Proteinrechner</a> kann sie dabei unterstützen. <strong>Idealgewicht:</strong> ca. 64 kg.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Explanation: BMI-Kategorien */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">BMI richtig interpretieren – Was bedeutet dein Ergebnis?</h2>
            <div className="grid gap-6 md:grid-cols-2 not-prose">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🟡 Untergewicht (BMI &lt; 18,5)</h3>
                  <p className="opacity-80">Ein BMI unter 18,5 deutet auf Untergewicht hin. Mögliche Ursachen sind eine zu geringe Kalorienaufnahme, Essstörungen, Schilddrüsenüberfunktion oder chronische Erkrankungen.</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Geschwächtes Immunsystem und häufigere Infektionen</li>
                    <li>• Osteoporose durch Nährstoffmangel</li>
                    <li>• Zyklusstörungen und Fruchtbarkeitsprobleme bei Frauen</li>
                    <li>• Muskelschwund und reduzierte Leistungsfähigkeit</li>
                    <li>• Haarausfall und brüchige Nägel</li>
                  </ul>
                  <p className="text-sm mt-3 opacity-70"><strong>Empfehlung:</strong> Steigere deine Kalorienzufuhr langsam um 300–500 kcal/Tag. Berechne deinen <a href="/kalorienbedarf-berechnen" className="link link-primary">Kalorienbedarf</a> als Ausgangspunkt.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🟢 Normalgewicht (BMI 18,5–24,9)</h3>
                  <p className="opacity-80">Der optimale Bereich! Ein BMI zwischen 18,5 und 24,9 ist mit dem niedrigsten Risiko für gewichtsbedingte Erkrankungen verbunden. Die meisten Studien zeigen, dass ein BMI um 22 mit der höchsten Lebenserwartung korreliert.</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Geringstes Risiko für Herz-Kreislauf-Erkrankungen</li>
                    <li>• Optimale Stoffwechselfunktion</li>
                    <li>• Beste Voraussetzungen für körperliche Leistung</li>
                    <li>• Niedrigstes Diabetesrisiko</li>
                  </ul>
                  <p className="text-sm mt-3 opacity-70"><strong>Empfehlung:</strong> Halte dein Gewicht durch ausgewogene Ernährung und regelmässige Bewegung. Nutze den <a href="/makros-berechnen" className="link link-primary">Makrorechner</a>, um deine Nährstoffverteilung zu optimieren.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🟠 Übergewicht (BMI 25–29,9)</h3>
                  <p className="opacity-80">Ein BMI zwischen 25 und 29,9 zeigt Übergewicht an. Bereits eine Gewichtsreduktion von 5–10 % kann das Gesundheitsrisiko erheblich senken.</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• 2-fach erhöhtes Risiko für Bluthochdruck</li>
                    <li>• Erhöhtes Risiko für Typ-2-Diabetes</li>
                    <li>• Belastung für Gelenke, besonders Knie und Hüfte</li>
                    <li>• Erhöhte Cholesterinwerte wahrscheinlich</li>
                  </ul>
                  <p className="text-sm mt-3 opacity-70"><strong>Empfehlung:</strong> Berechne dein <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit</a> und starte mit 300–500 kcal/Tag. Mit <a href="/kalorien-zaehlen" className="link link-primary">Kalorien zählen</a> behältst du den Überblick.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🔴 Adipositas (BMI ≥ 30)</h3>
                  <p className="opacity-80">Ab einem BMI von 30 spricht man von Adipositas. Die WHO unterscheidet drei Grade: Grad I (30–34,9), Grad II (35–39,9) und Grad III (≥ 40). In allen Graden ist das Gesundheitsrisiko stark erhöht.</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• 3-7-fach erhöhtes Diabetesrisiko</li>
                    <li>• Deutlich erhöhtes Herzinfarkt- und Schlaganfallrisiko</li>
                    <li>• Erhöhtes Risiko für bestimmte Krebsarten</li>
                    <li>• Schwere Schlafapnoe und Atemprobleme</li>
                  </ul>
                  <p className="text-sm mt-3 opacity-70"><strong>Empfehlung:</strong> Suche ärztliche Beratung. Berechne deinen <a href="/grundumsatz-rechner" className="link link-primary">Grundumsatz</a> als Ausgangsbasis für ein strukturiertes Abnehmprogramm.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BMI für verschiedene Gruppen */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">BMI für verschiedene Altersgruppen und Geschlechter</h2>
            <h3 className="text-xl font-bold mt-6 mb-4">BMI nach Alter</h3>
            <p>Der optimale BMI verschiebt sich mit zunehmendem Alter leicht nach oben. Während für junge Erwachsene ein BMI von 20–25 ideal ist, empfehlen Gerontologen für Menschen über 65 einen BMI von 24–29. Der Grund: Etwas mehr Körperreserven schützen im Alter vor Muskelschwund (Sarkopenie) und verbessern die Prognose bei Erkrankungen. Eine grosse Meta-Analyse im Journal of the American Geriatrics Society bestätigte, dass leichtes Übergewicht bei Senioren mit der niedrigsten Sterblichkeit verbunden ist.</p>
            <h3 className="text-xl font-bold mt-6 mb-4">BMI bei Frauen vs. Männern</h3>
            <p>Die BMI-Grenzen der WHO gelten geschlechtsunabhängig, doch Frauen haben von Natur aus einen höheren Körperfettanteil als Männer (ca. 20–25 % vs. 15–20 %). Das bedeutet: Bei gleichem BMI hat eine Frau in der Regel mehr Körperfett als ein Mann. Deshalb kann der BMI bei Frauen das Gesundheitsrisiko leicht unterschätzen. Wer es genauer wissen möchte, sollte zusätzlich den <a href="/koerperfett-rechner" className="link link-primary">Körperfettanteil</a> messen oder das <a href="/taille-hueft-verhaeltnis-rechner" className="link link-primary">Taille-Hüft-Verhältnis</a> bestimmen.</p>
            <h3 className="text-xl font-bold mt-6 mb-4">BMI bei Sportlern und Muskulösen</h3>
            <p>Der BMI unterscheidet nicht zwischen Muskel- und Fettmasse. Ein durchtrainierter Bodybuilder mit 95 kg bei 1,80 m Grösse hat einen BMI von 29,3 – laut Tabelle Übergewicht. In Wahrheit hat er möglicherweise nur 10 % Körperfett und ist topfit. Deshalb ist der BMI für Sportler mit hoher Muskelmasse <strong>nicht aussagekräftig</strong>. Bessere Alternativen sind der Körperfettanteil (per Caliper oder DEXA-Scan) und der FFMI (Fat-Free Mass Index). Trotzdem bleibt der BMI für die allgemeine Bevölkerung ein guter erster Indikator.</p>
            <h3 className="text-xl font-bold mt-6 mb-4">BMI in der Schwangerschaft</h3>
            <p>Während der Schwangerschaft ist der BMI nicht als Bewertungsinstrument geeignet, da die Gewichtszunahme gewünscht und gesund ist. Allerdings spielt der <strong>BMI vor der Schwangerschaft</strong> eine wichtige Rolle: Er bestimmt, wie viel Gewichtszunahme empfohlen wird. Frauen mit Normalgewicht (BMI 18,5–24,9) sollten 11,5–16 kg zunehmen, bei Übergewicht 7–11,5 kg und bei Adipositas 5–9 kg (laut IOM-Richtlinien).</p>
          </div>
        </section>

        {/* BMI und Gesundheit: Wissenschaftliche Evidenz */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">BMI und Gesundheit – Was sagt die Wissenschaft?</h2>
            <h3 className="text-xl font-bold mt-6 mb-4">Die grössten Studien zum BMI</h3>
            <p>Die Verbindung zwischen BMI und Gesundheit ist eine der am besten erforschten Zusammenhänge in der Medizin. Die Global BMI Mortality Collaboration (2016) analysierte Daten von <strong>10,6 Millionen Teilnehmern</strong> aus 239 Studien und kam zu einem klaren Ergebnis: Die niedrigste Gesamtsterblichkeit liegt bei einem BMI von 20–25. Sowohl darunter als auch darüber steigt das Risiko progressiv an. Bei einem BMI von 30–35 ist die Sterblichkeit um 45 % erhöht, bei BMI 40–45 sogar um 94 %.</p>
            <p>Eine weitere Landmark-Studie, die Prospective Studies Collaboration im Lancet (2009), untersuchte 900.000 Erwachsene und fand: <strong>Jede 5 BMI-Punkte über 25 erhöhen das Risiko für koronare Herzkrankheit um 27 %, für Schlaganfall um 18 % und für Diabetes um das 2-Fache.</strong></p>
            <h3 className="text-xl font-bold mt-8 mb-4">Das Adipositas-Paradoxon</h3>
            <p>Interessanterweise gibt es Studien, die zeigen, dass leichtes Übergewicht (BMI 25–30) bei bestimmten chronischen Erkrankungen – z. B. Herzinsuffizienz, COPD oder nach einem Herzinfarkt – mit besseren Überlebenschancen verbunden ist als Normalgewicht. Dieses Phänomen wird als <strong>Adipositas-Paradoxon</strong> bezeichnet. Die wahrscheinlichste Erklärung: Menschen mit etwas mehr Körperreserven können krankheitsbedingte Gewichtsverluste besser kompensieren. Das bedeutet allerdings <strong>nicht</strong>, dass Übergewicht generell gesund ist – bei gesunden Menschen bleibt ein BMI von 18,5–24,9 der optimale Bereich.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">BMI und psychische Gesundheit</h3>
            <p>Der BMI beeinflusst nicht nur die körperliche, sondern auch die <strong>psychische Gesundheit</strong>. Meta-Analysen zeigen, dass Adipositas (BMI ≥ 30) mit einem um 55 % erhöhten Risiko für Depressionen verbunden ist. Umgekehrt erhöht Depression das Adipositas-Risiko um 58 % – ein bidirektionaler Zusammenhang. Die Ursachen sind komplex: Stigmatisierung, eingeschränkte Mobilität, Entzündungsprozesse und emotionales Essen spielen alle eine Rolle. Das Positive: Bereits eine moderate Gewichtsreduktion von 5–10 % kann die Stimmung und das Wohlbefinden messbar verbessern.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">BMI bei Kindern und Jugendlichen</h3>
            <p>Für Kinder und Jugendliche (2–18 Jahre) gelten andere Regeln. Statt fester BMI-Grenzwerte werden <strong>altersabhängige BMI-Perzentilen</strong> verwendet. Ein Kind liegt im Normalbereich, wenn sein BMI zwischen der 10. und 90. Perzentile liegt. Über der 90. Perzentile spricht man von Übergewicht, über der 97. von Adipositas. In Deutschland sind laut KiGGS-Studie (Robert Koch-Institut) etwa 15 % der Kinder und Jugendlichen übergewichtig, davon knapp 6 % adipös. Wenn du dir Sorgen um das Gewicht deines Kindes machst, solltest du immer einen Kinderarzt konsultieren.</p>
          </div>
        </section>

        {/* Grenzen des BMI und Alternativen */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Grenzen des BMI – Und bessere Alternativen</h2>
            <p>So nützlich der BMI als Screening-Tool ist – er hat klare Grenzen. Der BMI berücksichtigt weder die Körperzusammensetzung noch die Fettverteilung. Zwei Personen mit identischem BMI können völlig unterschiedliche Gesundheitsprofile haben.</p>
            <div className="grid gap-6 md:grid-cols-2 mt-6 not-prose">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">⚠️ Schwächen des BMI</h3>
                  <ul className="space-y-2 text-sm mt-2">
                    <li>• <strong>Keine Unterscheidung</strong> zwischen Muskeln und Fett</li>
                    <li>• <strong>Fettverteilung ignoriert:</strong> Bauchfett (viszeral) ist gefährlicher als Hüftfett</li>
                    <li>• <strong>Ethnische Unterschiede:</strong> Asiaten haben bei niedrigerem BMI mehr viszerales Fett</li>
                    <li>• <strong>Alter nicht berücksichtigt:</strong> Gleiche Grenzwerte für 20- und 60-Jährige</li>
                    <li>• <strong>Geschlecht nicht differenziert:</strong> Frauen haben natürlicherweise mehr Körperfett</li>
                  </ul>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">✅ Bessere Ergänzungen zum BMI</h3>
                  <ul className="space-y-2 text-sm mt-2">
                    <li>• <strong><a href="/taille-hueft-verhaeltnis-rechner" className="link link-primary">Taille-Hüft-Verhältnis (WHR):</a></strong> Misst die Fettverteilung</li>
                    <li>• <strong><a href="/koerperfett-rechner" className="link link-primary">Körperfettanteil:</a></strong> Direkte Messung von Fett vs. Muskeln</li>
                    <li>• <strong>Bauchumfang:</strong> &gt;94 cm (Männer) oder &gt;80 cm (Frauen) = erhöhtes Risiko</li>
                    <li>• <strong>FFMI (Fat-Free Mass Index):</strong> Berücksichtigt Muskelmasse – ideal für Sportler</li>
                    <li>• <strong>Waist-to-Height Ratio:</strong> Bauchumfang ÷ Grösse – unter 0,5 ist ideal</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="mt-6">Die beste Strategie: <strong>Nutze den BMI als Ausgangspunkt</strong> und ergänze ihn mit mindestens einer weiteren Messung (z. B. Bauchumfang). So erhältst du ein deutlich genaueres Bild deiner Gesundheit.</p>
          </div>
        </section>

        {/* BMI verbessern */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">BMI verbessern – So funktioniert es in der Praxis</h2>
            <h3 className="text-xl font-bold mt-6 mb-4">Schritt 1: Ist-Zustand analysieren</h3>
            <p>Bevor du loslegst, brauchst du ein klares Bild deiner Ausgangslage. Berechne zuerst deinen BMI mit unserem Rechner oben. Dann bestimme deinen <a href="/kalorienbedarf-berechnen" className="link link-primary">täglichen Kalorienbedarf</a> und deinen <a href="/grundumsatz-rechner" className="link link-primary">Grundumsatz</a>. Miss zusätzlich deinen Bauchumfang (mit einem Massband auf Höhe des Bauchnabels, nüchtern, morgens). Notiere all diese Werte – sie sind deine Baseline.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 2: Ziel definieren</h3>
            <p>Setze dir ein realistisches Ziel. Ein BMI-Rückgang von 1 Punkt entspricht bei einer 1,75 m grossen Person etwa 3 kg Gewichtsverlust. Bei einem gesunden Tempo von 0,5 kg pro Woche brauchst du dafür ca. 6 Wochen. Mit unserem <a href="/abnahmedatum-berechnen" className="link link-primary">Abnahmedatum-Rechner</a> kannst du dein Zieldatum berechnen. Vermeide unrealistische Ziele wie 10 kg in 4 Wochen – das endet fast immer im Jojo-Effekt.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 3: Ernährung anpassen</h3>
            <p>Die Ernährung ist der grösste Hebel. 80 % des Abnehmerfolgs kommen aus der Küche, nur 20 % aus dem Fitnessstudio. Starte mit diesen drei Grundregeln:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Kalorien tracken:</strong> Du kannst nicht managen, was du nicht misst. Mit Mahlzait fotografierst du dein Essen und bekommst sofort die Kalorien.</li>
              <li><strong>Protein erhöhen:</strong> Ziel: 1,6–2,2 g pro kg Körpergewicht. Protein sättigt am stärksten, hat den höchsten thermischen Effekt und schützt deine Muskeln im Defizit.</li>
              <li><strong>Gemüse und Ballaststoffe:</strong> 30 g Ballaststoffe pro Tag sind das Ziel. Sie füllen den Magen, stabilisieren den Blutzucker und füttern deine Darmbakterien.</li>
            </ul>
            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 4: Bewegung integrieren</h3>
            <p>Sport allein macht nicht schlank – aber er ist ein mächtiger Verstärker. Die effektivste Kombination: <strong>Krafttraining (2–3×/Woche)</strong> für Muskelerhalt und erhöhten Grundumsatz plus <strong>tägliche Alltagsbewegung</strong> (8.000–10.000 Schritte). Nutze unseren <a href="/schritte-kalorien-rechner" className="link link-primary">Schritte-Kalorien-Rechner</a>, um zu sehen, wie viel Bewegung im Alltag ausmacht.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 5: Fortschritt messen</h3>
            <p>Wiege dich regelmässig (idealerweise täglich morgens, nüchtern) und berechne den Wochendurchschnitt. Einzelne Tageswerte schwanken durch Wassereinlagerungen und Darminhalt um bis zu 2 kg – das ist völlig normal. Wichtig ist der <strong>Trend über Wochen</strong>. Zusätzlich: Miss deinen Bauchumfang alle 2 Wochen.</p>
          </div>
        </section>

        {/* BMI in Deutschland */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">BMI in Deutschland – Zahlen, Daten, Fakten</h2>
            <p>Deutschland hat ein Gewichtsproblem – und die Zahlen sind ernüchternd. Laut der aktuellen Gesundheitsberichterstattung des Robert Koch-Instituts (GEDA 2022) sind <strong>46,6 % der Frauen und 60,5 % der Männer</strong> in Deutschland übergewichtig (BMI ≥ 25). Davon haben 19,0 % der Frauen und 18,8 % der Männer einen BMI von 30 oder mehr (Adipositas). Im europäischen Vergleich liegt Deutschland damit im oberen Mittelfeld.</p>
            <p>Besonders besorgniserregend ist der Trend: Seit 1999 hat der Anteil adipöser Erwachsener um über 30 % zugenommen. Bei Kindern und Jugendlichen sind die Zahlen nach der COVID-19-Pandemie nochmals gestiegen. Der durchschnittliche BMI in Deutschland liegt bei Männern bei 26,9 und bei Frauen bei 25,5 – beide Werte im Übergewichtsbereich.</p>
            <h3 className="text-xl font-bold mt-8 mb-4">Kosten von Übergewicht für das Gesundheitssystem</h3>
            <p>Übergewicht und Adipositas verursachen in Deutschland jährlich geschätzte <strong>63 Milliarden Euro</strong> an direkten und indirekten Kosten (Helmholtz Zentrum München, 2023). Pro adipöser Person belaufen sich die Mehrkosten auf ca. 3.000 Euro pro Jahr im Vergleich zu normalgewichtigen Personen. Ein Grund mehr, deinen BMI regelmässig zu prüfen und bei Bedarf gegenzusteuern.</p>
          </div>
        </section>

        {/* 7 Tipps */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">So erreichst du dein Idealgewicht – 7 wissenschaftlich fundierte Tipps</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">1. Kalorienbedarf kennen</h3><p className="text-sm opacity-80">Bevor du dein Gewicht ändern kannst, musst du wissen, wie viel du brauchst. Berechne deinen <a href="/kalorienbedarf-berechnen" className="link link-primary">täglichen Kalorienbedarf</a> und orientiere dich daran.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">2. Moderates Kaloriendefizit</h3><p className="text-sm opacity-80">Ein Defizit von 300–500 kcal pro Tag reicht, um ca. 0,5 kg pro Woche abzunehmen. Berechne dein optimales <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit</a>.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">3. Proteinreich essen</h3><p className="text-sm opacity-80">Protein sättigt am stärksten und schützt deine Muskeln beim Abnehmen. Ziel: 1,6–2,2 g pro kg Körpergewicht. Nutze unseren <a href="/protein-bedarf-rechner" className="link link-primary">Proteinrechner</a>.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">4. Kalorien tracken</h3><p className="text-sm opacity-80">Studien zeigen: Wer Kalorien trackt, nimmt doppelt so viel ab. Mit Mahlzait geht das in Sekunden – einfach Mahlzeit fotografieren.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">5. Kraft- und Ausdauertraining</h3><p className="text-sm opacity-80">Krafttraining baut Muskeln auf (erhöht den <a href="/grundumsatz-rechner" className="link link-primary">Grundumsatz</a>), Ausdauertraining verbrennt zusätzliche Kalorien.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">6. Ausreichend schlafen</h3><p className="text-sm opacity-80">Schlafmangel erhöht Hungerhormone (Ghrelin) und senkt Sättigungshormone (Leptin). Ziel: 7–9 Stunden pro Nacht. Unser <a href="/schlaf-rechner" className="link link-primary">Schlafrechner</a> hilft.</p></div></div>
              <div className="card bg-base-100 shadow-lg md:col-span-2"><div className="card-body py-4"><h3 className="font-bold">7. Geduld haben</h3><p className="text-sm opacity-80">Nachhaltiges Abnehmen dauert. 0,5–1 kg pro Woche ist ein gesundes Tempo. Berechne mit unserem <a href="/abnahmedatum-berechnen" className="link link-primary">Abnahmedatum-Rechner</a>, wann du dein Zielgewicht erreichst.</p></div></div>
            </div>
          </div>
        </section>

        {/* FAQ Section – 8 FAQs */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Häufig gestellte Fragen zum BMI</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium">{faq.q}</div>
                  <div className="collapse-content"><p className="opacity-80">{faq.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Erreiche dein Wunschgewicht mit Mahlzait</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">Du kennst jetzt deinen BMI. Der nächste Schritt: Deine Ernährung tracken und dein Zielgewicht erreichen. Mit Mahlzait loggst du Mahlzeiten in Sekunden – per Foto, Text oder Barcode. Keine komplizierten Tabellen, keine manuelle Eingabe. Einfach Foto machen und die KI erledigt den Rest.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getTrackedAppLink({ platform: "ios", source: "calculator" })} onClick={() => trackAppStoreClick("ios", "calculator")} className="btn btn-lg bg-white text-primary">iOS App laden</a>
              <a href={getTrackedAppLink({ platform: "android", source: "calculator" })} onClick={() => trackAppStoreClick("android", "calculator")} className="btn btn-lg bg-white text-primary hover:bg-white/90">Android App laden</a>
            </div>
          </div>
        </section>

        {/* Internal Links – 10 Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Rechner & Ratgeber</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">Kalorienbedarf berechnen</a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">Kaloriendefizit berechnen</a>
              <a href="/grundumsatz-rechner" className="btn btn-outline">Grundumsatz Rechner</a>
              <a href="/makros-berechnen" className="btn btn-outline">Makros berechnen</a>
              <a href="/protein-bedarf-rechner" className="btn btn-outline">Proteinbedarf Rechner</a>
              <a href="/koerperfett-rechner" className="btn btn-outline">Körperfett Rechner</a>
              <a href="/idealgewicht-rechner" className="btn btn-outline">Idealgewicht Rechner</a>
              <a href="/taille-hueft-verhaeltnis-rechner" className="btn btn-outline">Taille-Hüft-Verhältnis</a>
              <a href="/abnahmedatum-berechnen" className="btn btn-outline">Abnahmedatum berechnen</a>
              <a href="/rechner" className="btn btn-outline">Alle Rechner</a>
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
