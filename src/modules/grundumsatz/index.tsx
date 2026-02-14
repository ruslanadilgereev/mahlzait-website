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

interface BMRResult {
  bmr: number;
  tdee: Record<string, number>;
  formula: string;
  selectedTdee: number;
  activityLevel: string;
}

function GrundumsatzRechnerPage({ config }: Props) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState("sedentary");
  const [result, setResult] = useState<BMRResult | null>(null);

  const activityLevels = [
    { id: "sedentary", label: "Kaum aktiv", description: "Sitzende Tätigkeit, kein Sport", factor: 1.2 },
    { id: "light", label: "Leicht aktiv", description: "Leichte Bewegung, 1-2x Sport/Woche", factor: 1.375 },
    { id: "moderate", label: "Moderat aktiv", description: "Mässig aktiv, 3-5x Sport/Woche", factor: 1.55 },
    { id: "active", label: "Sehr aktiv", description: "Sehr aktiv, 6-7x Sport/Woche", factor: 1.725 },
    { id: "extreme", label: "Extrem aktiv", description: "Körperliche Arbeit + intensives Training", factor: 1.9 },
  ];

  const calculateBMR = () => {
    // Mifflin-St Jeor Formula (most accurate)
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE for all activity levels
    const tdee: Record<string, number> = {};
    activityLevels.forEach((level) => {
      tdee[level.id] = Math.round(bmr * level.factor);
    });

    const selectedLevel = activityLevels.find((l) => l.id === activity) || activityLevels[0];

    setResult({
      bmr: Math.round(bmr),
      tdee,
      formula: "Mifflin-St Jeor",
      selectedTdee: tdee[activity],
      activityLevel: selectedLevel.label,
    });
  };

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Grundumsatz Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen Grundumsatz (BMR) und Gesamtenergieumsatz (TDEE) – die Basis für erfolgreiches Abnehmen oder Muskelaufbau.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">Grundumsatz berechnen</h2>

              {/* Gender Selection */}
              <div className="mb-6">
                <span className="text-lg font-semibold block mb-3">Geschlecht</span>
                <div className="flex gap-4">
                  <button
                    className={`btn flex-1 ${gender === "male" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("male")}
                  >
                    👨 Männlich
                  </button>
                  <button
                    className={`btn flex-1 ${gender === "female" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("female")}
                  >
                    👩 Weiblich
                  </button>
                </div>
              </div>

              {/* Age */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Alter</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="15"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Math.min(100, Math.max(15, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">Jahre</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>15</span>
                  <span>30</span>
                  <span>50</span>
                  <span>70</span>
                  <span>100</span>
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
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>140</span>
                  <span>160</span>
                  <span>180</span>
                  <span>200</span>
                  <span>220</span>
                </div>
              </div>

              {/* Weight */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Körpergewicht</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="40"
                      max="200"
                      value={weight}
                      onChange={(e) => setWeight(Math.min(200, Math.max(40, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">kg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>40</span>
                  <span>80</span>
                  <span>120</span>
                  <span>160</span>
                  <span>200</span>
                </div>
              </div>

              {/* Activity Level */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-3">Aktivitätslevel</span>
                <div className="space-y-2">
                  {activityLevels.map((level) => (
                    <label
                      key={level.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                        activity === level.id
                          ? "border-primary bg-primary/10"
                          : "border-base-300 hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="activity"
                        value={level.id}
                        checked={activity === level.id}
                        onChange={() => setActivity(level.id)}
                        className="radio radio-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm opacity-70">{level.description}</div>
                      </div>
                      <div className="text-sm font-mono opacity-60">×{level.factor}</div>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateBMR}>
                Grundumsatz berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="card bg-base-200">
                      <div className="card-body py-6 text-center">
                        <h3 className="text-sm opacity-70 mb-2">Grundumsatz (BMR)</h3>
                        <p className="text-5xl font-bold text-primary">{result.bmr}</p>
                        <p className="text-lg font-medium">kcal/Tag</p>
                        <p className="text-xs opacity-60 mt-2">Kalorien im Ruhezustand</p>
                      </div>
                    </div>
                    <div className="card bg-primary text-primary-content">
                      <div className="card-body py-6 text-center">
                        <h3 className="text-sm opacity-80 mb-2">Gesamtenergieumsatz (TDEE)</h3>
                        <p className="text-5xl font-bold">{result.selectedTdee}</p>
                        <p className="text-lg font-medium">kcal/Tag</p>
                        <p className="text-xs opacity-80 mt-2">{result.activityLevel}</p>
                      </div>
                    </div>
                  </div>

                  {/* TDEE for all activity levels */}
                  <div className="card bg-base-200 mt-4">
                    <div className="card-body">
                      <h3 className="font-bold mb-4">TDEE nach Aktivitätslevel</h3>
                      <div className="space-y-3">
                        {activityLevels.map((level) => (
                          <div
                            key={level.id}
                            className={`flex items-center justify-between p-2 rounded ${
                              activity === level.id ? "bg-primary/20" : ""
                            }`}
                          >
                            <div>
                              <span className="font-medium">{level.label}</span>
                              <span className="text-sm opacity-60 ml-2">×{level.factor}</span>
                            </div>
                            <span className="font-bold text-lg">{result.tdee[level.id]} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Weight Goals */}
                  <div className="card bg-base-200 mt-4">
                    <div className="card-body">
                      <h3 className="font-bold mb-4">Kalorienziele für dein Ziel</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="text-center p-4 rounded-lg bg-success/20">
                          <div className="text-sm opacity-70 mb-1">Abnehmen</div>
                          <div className="text-2xl font-bold text-success">
                            {Math.round(result.selectedTdee * 0.8)}
                          </div>
                          <div className="text-sm">kcal/Tag</div>
                          <div className="text-xs opacity-60 mt-1">-20% Defizit</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-info/20">
                          <div className="text-sm opacity-70 mb-1">Halten</div>
                          <div className="text-2xl font-bold text-info">{result.selectedTdee}</div>
                          <div className="text-sm">kcal/Tag</div>
                          <div className="text-xs opacity-60 mt-1">Erhaltung</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-warning/20">
                          <div className="text-sm opacity-70 mb-1">Aufbauen</div>
                          <div className="text-2xl font-bold text-warning">
                            {Math.round(result.selectedTdee * 1.15)}
                          </div>
                          <div className="text-sm">kcal/Tag</div>
                          <div className="text-xs opacity-60 mt-1">+15% Überschuss</div>
                        </div>
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
                      <p className="font-semibold">Mit Mahlzait dein Kalorienziel erreichen!</p>
                      <p className="text-sm">
                        Tracke deine Kalorien mühelos per Foto – so erreichst du dein Ziel von{" "}
                        {Math.round(result.selectedTdee * 0.8)} kcal/Tag ganz einfach.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Explanation Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was ist der Grundumsatz?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Grundumsatz (BMR)</h3>
                  <p className="opacity-80">
                    Der Grundumsatz (Basal Metabolic Rate) ist die Energiemenge, die dein Körper im Ruhezustand verbrennt – also für Atmung, Herzschlag, Gehirnaktivität und alle lebenserhaltenden Funktionen.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-sm text-center">
                      <strong>Mifflin-St Jeor Formel:</strong>
                    </p>
                    <p className="text-sm opacity-80 text-center mt-2">
                      Männer: 10 × Gewicht + 6.25 × Grösse − 5 × Alter + 5
                    </p>
                    <p className="text-sm opacity-80 text-center">
                      Frauen: 10 × Gewicht + 6.25 × Grösse − 5 × Alter − 161
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Gesamtenergieumsatz (TDEE)</h3>
                  <p className="opacity-80">
                    Der TDEE (Total Daily Energy Expenditure) berücksichtigt zusätzlich deine täglichen Aktivitäten. Er zeigt, wie viele Kalorien du wirklich verbrauchst – und ist die Basis für jede Diät.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-sm text-center">
                      <strong>TDEE = Grundumsatz × Aktivitätsfaktor</strong>
                    </p>
                    <p className="text-sm opacity-60 text-center mt-2">
                      Faktoren von 1.2 (kaum aktiv) bis 1.9 (extrem aktiv)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to use Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              So nutzt du deinen Grundumsatz
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">🔥</div>
                  <h3 className="card-title justify-center">Abnehmen</h3>
                  <p className="opacity-80">
                    Iss 15-25% weniger als dein TDEE. Mit einem Defizit von 500 kcal/Tag verlierst du ca. 0.5 kg pro Woche – nachhaltig und gesund.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">⚖️</div>
                  <h3 className="card-title justify-center">Gewicht halten</h3>
                  <p className="opacity-80">
                    Iss genau so viel wie dein TDEE. So bleibt dein Gewicht stabil – perfekt nach einer erfolgreichen Diät.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">💪</div>
                  <h3 className="card-title justify-center">Muskelaufbau</h3>
                  <p className="opacity-80">
                    Iss 10-20% mehr als dein TDEE. Mit einem leichten Überschuss baust du Muskeln auf – am besten mit viel Protein.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Factors Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was beeinflusst den Grundumsatz?
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {[
                { icon: "⚖️", title: "Körpergewicht", desc: "Mehr Masse = höherer Grundumsatz" },
                { icon: "📏", title: "Körpergrösse", desc: "Grössere Menschen verbrennen mehr" },
                { icon: "🎂", title: "Alter", desc: "Mit dem Alter sinkt der Grundumsatz" },
                { icon: "♀️♂️", title: "Geschlecht", desc: "Männer haben ca. 10% höheren BMR" },
                { icon: "💪", title: "Muskelmasse", desc: "Muskeln verbrennen mehr als Fett" },
                { icon: "🧬", title: "Genetik", desc: "Stoffwechsel variiert individuell" },
                { icon: "🌡️", title: "Hormone", desc: "Schilddrüse beeinflusst den Stoffwechsel" },
                { icon: "🏃", title: "Fitness-Level", desc: "Trainierte haben effizienten Stoffwechsel" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-base-100 rounded-lg shadow">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm opacity-70">{item.desc}</p>
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
                  q: "Was ist der Unterschied zwischen Grundumsatz und Gesamtumsatz?",
                  a: "Der Grundumsatz (BMR) ist die Energie, die dein Körper im absoluten Ruhezustand verbrennt. Der Gesamtumsatz (TDEE) addiert deine täglichen Aktivitäten dazu – Sport, Arbeit, Haushalt etc.",
                },
                {
                  q: "Wie genau ist der Grundumsatz-Rechner?",
                  a: "Die Mifflin-St Jeor Formel ist die genaueste Schätzung ohne Labortest. Sie liegt bei den meisten Menschen ±10% vom tatsächlichen Wert. Für maximale Genauigkeit kannst du eine indirekte Kalorimetrie durchführen lassen.",
                },
                {
                  q: "Sollte ich unter meinem Grundumsatz essen?",
                  a: "Nein! Unter dem Grundumsatz zu essen ist ungesund und kontraproduktiv. Dein Körper braucht diese Energie für lebensnotwendige Funktionen. Orientiere dich am TDEE mit moderatem Defizit.",
                },
                {
                  q: "Wie kann ich meinen Grundumsatz erhöhen?",
                  a: "Baue Muskelmasse auf! Muskeln verbrennen auch im Ruhezustand mehr Energie als Fett. Regelmässiges Krafttraining kann deinen Grundumsatz dauerhaft erhöhen.",
                },
                {
                  q: "Warum sinkt mein Grundumsatz beim Abnehmen?",
                  a: "Bei weniger Körpermasse braucht dein Körper weniger Energie. Zusätzlich kann sich der Stoffwechsel bei starkem Kaloriendefizit anpassen (metabolische Adaptation). Deshalb sind moderate Defizite besser.",
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
              Erreiche dein Kalorienziel mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen Grundumsatz. Mit Mahlzait trackst du deine Ernährung in Sekunden – per Foto, Text oder Barcode. So erreichst du dein Ziel nachhaltig.
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
              <a href="/protein-bedarf-rechner" className="btn btn-outline">
                Protein-Bedarf Rechner
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

export default GrundumsatzRechnerPage;
