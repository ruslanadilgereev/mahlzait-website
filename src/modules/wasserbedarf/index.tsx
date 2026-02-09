import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface WaterResult {
  minimum: number;
  optimal: number;
  maximum: number;
  perHour: number;
  glasses: number;
  bottles: number;
}

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";
type Climate = "cold" | "moderate" | "warm" | "hot";

function WasserbedarfsRechnerPage({ config }: Props) {
  const [weight, setWeight] = useState(75);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<Climate>("moderate");
  const [result, setResult] = useState<WaterResult | null>(null);

  const activityMultipliers: Record<ActivityLevel, { factor: number; label: string; desc: string; emoji: string }> = {
    sedentary: { factor: 1.0, label: "Wenig aktiv", desc: "Bürojob, kaum Bewegung", emoji: "💻" },
    light: { factor: 1.1, label: "Leicht aktiv", desc: "1-2x Sport pro Woche", emoji: "🚶" },
    moderate: { factor: 1.2, label: "Mässig aktiv", desc: "3-4x Sport pro Woche", emoji: "🏃" },
    active: { factor: 1.35, label: "Sehr aktiv", desc: "5-6x Sport pro Woche", emoji: "🏋️" },
    athlete: { factor: 1.5, label: "Athlet", desc: "Tägliches intensives Training", emoji: "🏆" },
  };

  const climateMultipliers: Record<Climate, { factor: number; label: string; desc: string; emoji: string }> = {
    cold: { factor: 0.9, label: "Kalt", desc: "Unter 10°C", emoji: "❄️" },
    moderate: { factor: 1.0, label: "Gemässigt", desc: "10-20°C", emoji: "🌤️" },
    warm: { factor: 1.15, label: "Warm", desc: "20-30°C", emoji: "☀️" },
    hot: { factor: 1.3, label: "Heiss", desc: "Über 30°C", emoji: "🔥" },
  };

  const calculateWater = () => {
    // Base: 35ml per kg body weight (DGE recommendation)
    const baseWater = weight * 35;
    
    const activityFactor = activityMultipliers[activityLevel].factor;
    const climateFactor = climateMultipliers[climate].factor;
    
    const optimal = Math.round(baseWater * activityFactor * climateFactor);
    const minimum = Math.round(optimal * 0.8);
    const maximum = Math.round(optimal * 1.2);
    
    // Assuming 16 waking hours
    const perHour = Math.round(optimal / 16);
    const glasses = Math.round(optimal / 250); // 250ml per glass
    const bottles = Math.round((optimal / 500) * 10) / 10; // 500ml bottles

    setResult({
      minimum,
      optimal,
      maximum,
      perHour,
      glasses,
      bottles,
    });
  };

  const waterSources = [
    { name: "Wasser", ml: 250, emoji: "💧", note: "Beste Wahl" },
    { name: "Ungesüsster Tee", ml: 250, emoji: "🍵", note: "Zählt voll" },
    { name: "Kaffee", ml: 150, emoji: "☕", note: "Zählt zu ~50%" },
    { name: "Mineralwasser", ml: 250, emoji: "🫧", note: "Beste Wahl" },
    { name: "Verdünnte Säfte", ml: 200, emoji: "🧃", note: "1:3 mit Wasser" },
    { name: "Suppen & Brühen", ml: 200, emoji: "🍲", note: "Zählt mit" },
  ];

  const dehydrationSigns = [
    { sign: "Durst", severity: "leicht", emoji: "😐" },
    { sign: "Dunkler Urin", severity: "leicht", emoji: "🚽" },
    { sign: "Trockene Lippen", severity: "leicht", emoji: "👄" },
    { sign: "Kopfschmerzen", severity: "mittel", emoji: "🤕" },
    { sign: "Müdigkeit", severity: "mittel", emoji: "😴" },
    { sign: "Konzentrationsschwäche", severity: "mittel", emoji: "🧠" },
    { sign: "Schwindel", severity: "schwer", emoji: "💫" },
    { sign: "Muskelkrämpfe", severity: "schwer", emoji: "💪" },
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
              Wasserbedarfs-Rechner 💧
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen optimalen täglichen Wasserbedarf basierend auf Gewicht, Aktivität und Klima. Trink genug – dein Körper wird es dir danken!
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">💧 Wasserbedarf berechnen</h2>

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

              {/* Activity Level */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Aktivitätslevel</span>
                <div className="grid gap-2">
                  {Object.entries(activityMultipliers).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        activityLevel === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="activity"
                        className="radio radio-primary"
                        checked={activityLevel === key}
                        onChange={() => setActivityLevel(key as ActivityLevel)}
                      />
                      <span className="text-2xl">{value.emoji}</span>
                      <div className="flex-1">
                        <span className="font-medium">{value.label}</span>
                        <span className="text-sm opacity-70 ml-2">({value.desc})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Climate */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Klima / Temperatur</span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(climateMultipliers).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                        climate === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="climate"
                        className="radio radio-primary mb-2"
                        checked={climate === key}
                        onChange={() => setClimate(key as Climate)}
                      />
                      <span className="text-3xl mb-1">{value.emoji}</span>
                      <span className="font-medium">{value.label}</span>
                      <span className="text-xs opacity-70">{value.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateWater}>
                💧 Wasserbedarf berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">
                      {(result.optimal / 1000).toFixed(1)}L
                    </div>
                    <div className="text-xl font-semibold mt-2 opacity-80">
                      optimaler Wasserbedarf pro Tag
                    </div>
                    <div className="text-lg mt-1 opacity-60">
                      ({result.optimal} ml)
                    </div>
                  </div>

                  {/* Water Visual */}
                  <div className="flex flex-wrap justify-center gap-2 my-6 max-w-xs mx-auto">
                    {Array.from({ length: Math.min(result.glasses, 8) }).map((_, i) => (
                      <div key={i} className="text-2xl">🥛</div>
                    ))}
                    {result.glasses > 8 && <span className="text-xl self-center">+{result.glasses - 8}</span>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Gläser (250ml)</h3>
                        <p className="text-2xl font-bold text-primary">{result.glasses}</p>
                        <p className="text-xs opacity-60">pro Tag</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Flaschen (500ml)</h3>
                        <p className="text-2xl font-bold text-secondary">{result.bottles}</p>
                        <p className="text-xs opacity-60">pro Tag</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Pro Stunde</h3>
                        <p className="text-2xl font-bold">{result.perHour} ml</p>
                        <p className="text-xs opacity-60">bei 16 Std. wach</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mt-4 px-4">
                    <span>Minimum: <strong>{(result.minimum / 1000).toFixed(1)}L</strong></span>
                    <span>Optimal: <strong className="text-primary">{(result.optimal / 1000).toFixed(1)}L</strong></span>
                    <span>Maximum: <strong>{(result.maximum / 1000).toFixed(1)}L</strong></span>
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
                      <p className="font-semibold">Tipp: Tracke auch dein Wasser!</p>
                      <p className="text-sm">
                        Mit Mahlzait kannst du nicht nur Kalorien, sondern auch deine Flüssigkeitszufuhr tracken.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Water Sources Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was zählt zur Flüssigkeitszufuhr?
            </h2>
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
              {waterSources.map((source, i) => (
                <div key={i} className="card bg-base-100 shadow-xl">
                  <div className="card-body py-4 text-center">
                    <span className="text-4xl">{source.emoji}</span>
                    <h3 className="font-bold">{source.name}</h3>
                    <p className="text-sm opacity-70">{source.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm opacity-70 mt-6">
              ⚠️ Alkohol und stark gezuckerte Getränke zählen nicht und entziehen dem Körper sogar Wasser!
            </p>
          </div>
        </section>

        {/* Dehydration Signs */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Anzeichen von Dehydrierung
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              {dehydrationSigns.map((item, i) => (
                <div 
                  key={i} 
                  className={`card shadow-xl ${
                    item.severity === 'leicht' ? 'bg-warning/20' :
                    item.severity === 'mittel' ? 'bg-orange-500/20' :
                    'bg-error/20'
                  }`}
                >
                  <div className="card-body py-4 text-center">
                    <span className="text-3xl">{item.emoji}</span>
                    <h3 className="font-bold">{item.sign}</h3>
                    <span className={`badge ${
                      item.severity === 'leicht' ? 'badge-warning' :
                      item.severity === 'mittel' ? 'badge-secondary' :
                      'badge-error'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum genug Wasser trinken so wichtig ist
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🧠 Geistige Leistung</h3>
                  <p className="opacity-80">
                    Schon 1-2% Dehydrierung beeinträchtigt Konzentration und Gedächtnis. Dein Gehirn besteht zu 75% aus Wasser!
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Bessere Konzentration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Weniger Kopfschmerzen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Schnellere Reaktionszeit</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🏃 Körperliche Leistung</h3>
                  <p className="opacity-80">
                    Muskeln bestehen zu 75% aus Wasser. Dehydrierung führt zu Leistungseinbrüchen und erhöht das Verletzungsrisiko.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Mehr Ausdauer & Kraft</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Schnellere Regeneration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Weniger Muskelkrämpfe</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🔥 Stoffwechsel & Abnehmen</h3>
                  <p className="opacity-80">
                    Wasser kurbelt den Stoffwechsel an und kann beim Abnehmen helfen. Ein Glas vor dem Essen reduziert Hunger.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Erhöhter Grundumsatz (+30 kcal/500ml)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Weniger Heisshunger</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Bessere Fettverbrennung</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">✨ Haut & Aussehen</h3>
                  <p className="opacity-80">
                    Ausreichend Wasser sorgt für strahlende Haut und reduziert Falten. Die Haut ist das grösste Organ deines Körpers.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Prallere, glattere Haut</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Weniger Augenringe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Schnellere Heilung</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              💡 Tipps um mehr zu trinken
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {[
                { tip: "Wasserflasche immer dabei haben", icon: "🫗" },
                { tip: "Vor jeder Mahlzeit ein Glas trinken", icon: "🍽️" },
                { tip: "Handy-Erinnerungen stellen", icon: "📱" },
                { tip: "Morgens direkt nach dem Aufstehen trinken", icon: "🌅" },
                { tip: "Mit Zitrone oder Minze aromatisieren", icon: "🍋" },
                { tip: "Nach jedem Toilettengang nachfüllen", icon: "🚽" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-medium">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum Wasserbedarf
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie viel Wasser sollte ich am Tag trinken?",
                  a: "Die Faustregel ist 35ml pro kg Körpergewicht. Bei 70kg wären das 2.45 Liter. Sport, Hitze und bestimmte Erkrankungen erhöhen den Bedarf. Unser Rechner berücksichtigt all diese Faktoren.",
                },
                {
                  q: "Kann ich zu viel Wasser trinken?",
                  a: "Ja, aber es ist selten. Mehr als 5-6 Liter pro Tag können gefährlich sein (Wasservergiftung/Hyponatriämie). Halte dich an die Empfehlung und trinke nicht mehr als 1 Liter pro Stunde.",
                },
                {
                  q: "Zählt Kaffee zur Flüssigkeitszufuhr?",
                  a: "Teilweise. Kaffee hat eine leicht entwässernde Wirkung, aber der Effekt ist gering. 2-3 Tassen können zu etwa 50% angerechnet werden. Besser ist reines Wasser oder ungesüsster Tee.",
                },
                {
                  q: "Woran erkenne ich, ob ich genug trinke?",
                  a: "Der beste Indikator ist die Urinfarbe: hellgelb bis fast farblos = gut hydriert. Dunkelgelb oder bernsteinfarben = mehr trinken! Auch Durst, trockene Lippen und Kopfschmerzen sind Warnsignale.",
                },
                {
                  q: "Sollte ich auch nachts trinken?",
                  a: "Nachts pausiert der Körper und braucht weniger Wasser. Ein Glas vor dem Schlafen ist ok, aber zu viel stört den Schlaf. Trinke lieber morgens direkt ein grosses Glas, um das Defizit auszugleichen.",
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
              Tracke deine Ernährung mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du weisst jetzt, wie viel du trinken solltest. Mit Mahlzait trackst du Kalorien, Makros und Flüssigkeit – einfach per Foto!
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
              <a href="/protein-bedarf-rechner" className="btn btn-outline">
                Protein-Bedarf Rechner
              </a>
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI Rechner
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
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

export default WasserbedarfsRechnerPage;
