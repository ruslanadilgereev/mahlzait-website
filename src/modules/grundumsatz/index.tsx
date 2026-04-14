import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";

import AuthorByline from "@components/AuthorByline";
interface Props {
  config: TemplateConfig;
}

interface BMRResult {
  bmr: number;
  bmrHarrisBenedict: number;
  bmrKatchMcArdle: number;
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    // Harris-Benedict (revised)
    let bmrHB: number;
    if (gender === "male") {
      bmrHB = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmrHB = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    }

    // Katch-McArdle (using estimated lean body mass)
    const bodyFatEstimate = gender === "male" ? 0.18 : 0.25;
    const leanMass = weight * (1 - bodyFatEstimate);
    const bmrKMA = 370 + 21.6 * leanMass;

    // Calculate TDEE for all activity levels
    const tdee: Record<string, number> = {};
    activityLevels.forEach((level) => {
      tdee[level.id] = Math.round(bmr * level.factor);
    });

    const selectedLevel = activityLevels.find((l) => l.id === activity) || activityLevels[0];

    setResult({
      bmr: Math.round(bmr),
      bmrHarrisBenedict: Math.round(bmrHB),
      bmrKatchMcArdle: Math.round(bmrKMA),
      tdee,
      formula: "Mifflin-St Jeor",
      selectedTdee: tdee[activity],
      activityLevel: selectedLevel.label,
    });
  };

  const faqs = [
    {
      q: "Was ist der Unterschied zwischen Grundumsatz und Gesamtumsatz?",
      a: "Der Grundumsatz (BMR, Basal Metabolic Rate) ist die Energie, die dein Körper im absoluten Ruhezustand verbrennt – für Atmung, Herzschlag, Zellerneuerung und alle lebenserhaltenden Prozesse. Der Gesamtenergieumsatz (TDEE, Total Daily Energy Expenditure) addiert deine täglichen Aktivitäten dazu: Sport, Arbeit, Haushalt, Verdauung (thermischer Effekt der Nahrung) und NEAT (Non-Exercise Activity Thermogenesis, also unbewusste Alltagsbewegungen). Der TDEE ist die relevantere Zahl für deine Ernährungsplanung.",
    },
    {
      q: "Wie genau ist der Grundumsatz-Rechner?",
      a: "Die Mifflin-St Jeor Formel, die unser Rechner verwendet, ist die genaueste prädiktive Gleichung ohne Labortest. Sie liegt bei etwa 80 % der Menschen innerhalb von ±10 % des tatsächlichen Werts (gemessen per indirekter Kalorimetrie). Eine Studie der American Dietetic Association (2005) verglich 4 gängige BMR-Formeln und fand, dass Mifflin-St Jeor die kleinste Fehlerrate hat. Für maximale Genauigkeit kannst du beim Sportarzt eine Atemgasanalyse (Spiroergometrie) durchführen lassen.",
    },
    {
      q: "Sollte ich unter meinem Grundumsatz essen?",
      a: "Nein! Unter dem Grundumsatz zu essen ist ungesund und kontraproduktiv. Dein Körper braucht diese Kalorien für lebensnotwendige Funktionen wie Herzschlag, Gehirnaktivität und Immunsystem. Chronisches Unteressen führt zu metabolischer Adaptation (dein Stoffwechsel drosselt sich), Muskelabbau, Haarausfall, Hormonstörungen und einem geschwächten Immunsystem. Orientiere dich stattdessen am TDEE und ziehe davon maximal 20–25 % ab. Das ergibt ein gesundes, nachhaltiges Kaloriendefizit.",
    },
    {
      q: "Wie kann ich meinen Grundumsatz erhöhen?",
      a: "Der effektivste Weg ist Muskelaufbau durch regelmässiges Krafttraining. Jedes Kilogramm Muskelmasse verbrennt im Ruhezustand ca. 13 kcal pro Tag mehr als ein Kilogramm Fett (ca. 4,5 kcal). Das klingt wenig, summiert sich aber: 5 kg mehr Muskeln = ca. 40–65 kcal zusätzlich pro Tag. Weitere Faktoren: ausreichend Protein essen (schützt Muskeln und hat den höchsten thermischen Effekt aller Makros), genug Schlaf (7–9 Stunden), Koffein (steigert den Stoffwechsel kurzfristig um 3–11 %) und kalte Exposition (aktiviert braunes Fettgewebe).",
    },
    {
      q: "Warum sinkt mein Grundumsatz beim Abnehmen?",
      a: "Zwei Gründe: Erstens, weniger Körpermasse bedeutet weniger Energiebedarf – dein Körper muss weniger Gewebe versorgen. Zweitens gibt es die metabolische Adaptation (auch adaptive Thermogenese genannt): Bei anhaltendem Kaloriendefizit drosselt dein Körper aktiv den Stoffwechsel um 5–15 % über das hinaus, was durch den Gewichtsverlust allein zu erwarten wäre. Deshalb sind moderate Defizite (300–500 kcal/Tag) besser als Crashdiäten. Regelmässige Refeed-Tage und Krafttraining können die metabolische Adaptation teilweise kompensieren.",
    },
    {
      q: "Was ist die Mifflin-St Jeor Formel?",
      a: "Die Mifflin-St Jeor Formel wurde 1990 von den amerikanischen Forschern Mark Mifflin und Sachiko St Jeor entwickelt. Sie lautet: Für Männer: 10 × Gewicht (kg) + 6,25 × Grösse (cm) − 5 × Alter + 5. Für Frauen: 10 × Gewicht (kg) + 6,25 × Grösse (cm) − 5 × Alter − 161. Sie ist die von der Academy of Nutrition and Dietetics empfohlene Standardformel und genauer als die ältere Harris-Benedict-Gleichung, weil sie an modernen Populationen kalibriert wurde.",
    },
    {
      q: "Wie oft sollte ich meinen Grundumsatz neu berechnen?",
      a: "Berechne deinen Grundumsatz neu, wenn sich deine Körperdaten wesentlich verändert haben – zum Beispiel nach 5 kg Gewichtsveränderung, zum Geburtstag (jedes Lebensjahr senkt den BMR leicht), oder wenn sich dein Aktivitätslevel deutlich ändert (neuer Job, mehr oder weniger Sport). Während einer Diät empfiehlt es sich, alle 4–6 Wochen den Kalorienbedarf anzupassen, um Plateaus zu vermeiden. Nutze dafür einfach unseren Rechner oben.",
    },
    {
      q: "Welche Rolle spielt der Grundumsatz beim Abnehmen?",
      a: "Der Grundumsatz ist das absolute Minimum, das dein Körper braucht. Dein TDEE (Grundumsatz × Aktivitätsfaktor) ist die entscheidende Zahl: Isst du weniger als deinen TDEE, nimmst du ab. Isst du mehr, nimmst du zu. Ein Defizit von 500 kcal/Tag unter dem TDEE führt zu ca. 0,5 kg Gewichtsverlust pro Woche. Wichtig: Dein Kalorienziel sollte nie unter deinen Grundumsatz fallen. Berechne zuerst deinen TDEE, dann ziehe 15–25 % ab – das ergibt dein optimales Kaloriendefizit.",
    },
  ];

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Grundumsatz-Rechner", url: "/grundumsatz-rechner/" },
        ]} />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Grundumsatz Rechner – BMR & TDEE berechnen
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen Grundumsatz (BMR) und Gesamtenergieumsatz (TDEE) kostenlos mit der wissenschaftlich fundierten Mifflin-St Jeor Formel. Dein Grundumsatz ist die Basis für jede Ernährungsplanung – egal ob du abnehmen, Muskeln aufbauen oder dein Gewicht halten willst. Unser Rechner zeigt dir in Sekunden, wie viele Kalorien dein Körper wirklich braucht.
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

                  {/* Formula Comparison */}
                  <div className="card bg-base-200 mt-4">
                    <div className="card-body">
                      <h3 className="font-bold mb-4">Formelvergleich – 3 BMR-Methoden</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded bg-primary/20">
                          <div>
                            <span className="font-medium">Mifflin-St Jeor</span>
                            <span className="badge badge-primary badge-sm ml-2">Empfohlen</span>
                          </div>
                          <span className="font-bold text-lg">{result.bmr} kcal</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded">
                          <span className="font-medium">Harris-Benedict (rev.)</span>
                          <span className="font-bold text-lg">{result.bmrHarrisBenedict} kcal</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded">
                          <div>
                            <span className="font-medium">Katch-McArdle</span>
                            <span className="text-xs opacity-60 ml-2">(geschätzter KFA)</span>
                          </div>
                          <span className="font-bold text-lg">{result.bmrKatchMcArdle} kcal</span>
                        </div>
                      </div>
                      <p className="text-xs opacity-60 mt-3">Die Mifflin-St Jeor Formel wird von der Academy of Nutrition and Dietetics als Standard empfohlen.</p>
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
                          <div className="text-xs opacity-50 mt-1">≈ {Math.round((result.selectedTdee * 0.2 * 7) / 7700 * 10) / 10} kg/Woche</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-info/20">
                          <div className="text-sm opacity-70 mb-1">Halten</div>
                          <div className="text-2xl font-bold text-info">{result.selectedTdee}</div>
                          <div className="text-sm">kcal/Tag</div>
                          <div className="text-xs opacity-60 mt-1">Erhaltung</div>
                          <div className="text-xs opacity-50 mt-1">Gewicht stabil</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-warning/20">
                          <div className="text-sm opacity-70 mb-1">Aufbauen</div>
                          <div className="text-2xl font-bold text-warning">
                            {Math.round(result.selectedTdee * 1.15)}
                          </div>
                          <div className="text-sm">kcal/Tag</div>
                          <div className="text-xs opacity-60 mt-1">+15% Überschuss</div>
                          <div className="text-xs opacity-50 mt-1">≈ {Math.round((result.selectedTdee * 0.15 * 7) / 7700 * 10) / 10} kg/Woche</div>
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

        {/* Comprehensive Guide: Was ist der Grundumsatz? */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Was ist der Grundumsatz? – Dein kompletter Guide</h2>
            <p>
              Der <strong>Grundumsatz</strong> (auch Basalstoffwechsel oder <strong>Basal Metabolic Rate, BMR</strong>) bezeichnet die Energiemenge, die dein Körper im absoluten Ruhezustand verbraucht – also die Kalorien, die du selbst dann benötigst, wenn du den ganzen Tag im Bett liegst und dich nicht bewegst. Dieser Energiebedarf deckt alle lebenserhaltenden Funktionen: Atmung, Herzschlag, Gehirnaktivität, Zellerneuerung, Thermoregulation und die Aufrechterhaltung des Immunsystems.
            </p>
            <p>
              Der Grundumsatz macht bei den meisten Menschen den mit Abstand grössten Anteil des täglichen Kalorienverbrauchs aus – typischerweise <strong>60–75 % des Gesamtenergieumsatzes</strong>. Selbst bei sehr aktiven Sportlern liegt der Grundumsatz-Anteil selten unter 50 %. Das bedeutet: Die meisten Kalorien, die du am Tag verbrennst, werden nicht beim Sport verbrannt, sondern von deinem Körper im Hintergrund genutzt, um dich am Leben zu halten.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Grundumsatz vs. Gesamtenergieumsatz (TDEE) – Der Unterschied</h3>
            <p>Der Gesamtenergieumsatz (TDEE) setzt sich aus mehreren Komponenten zusammen:</p>
            <div className="p-6 bg-base-200 rounded-lg my-6">
              <p className="font-mono text-center"><strong>TDEE = Grundumsatz (BMR) + TEF + NEAT + EAT</strong></p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm">
                <li><strong>Grundumsatz (BMR):</strong> 60–75 % – Energie für lebenserhaltende Funktionen</li>
                <li><strong>TEF (Thermischer Effekt der Nahrung):</strong> 8–15 % – Energie für Verdauung und Nährstoffverarbeitung. Protein hat den höchsten TEF (20–30 %), gefolgt von Kohlenhydraten (5–10 %) und Fett (0–3 %)</li>
                <li><strong>NEAT (Non-Exercise Activity Thermogenesis):</strong> 15–30 % – unbewusste Alltagsbewegungen wie Gehen, Stehen, Zappeln, Gestikulieren. Der grösste variable Faktor!</li>
                <li><strong>EAT (Exercise Activity Thermogenesis):</strong> 5–10 % – bewusstes Training und Sport</li>
              </ul>
            </div>
            <p>
              Überraschend: Sport (EAT) macht bei den meisten Menschen nur 5–10 % des täglichen Kalorienverbrauchs aus. NEAT (Alltagsbewegung) ist oft doppelt so hoch. Deshalb ist die Empfehlung, 8.000–10.000 Schritte am Tag zu gehen, so wirkungsvoll – es erhöht deinen NEAT massiv, ohne dass du dafür ins Fitnessstudio gehen musst. Nutze unseren <a href="/schritte-kalorien-rechner" className="link link-primary">Schritte-Kalorien-Rechner</a>, um den Effekt zu berechnen.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Die Mifflin-St Jeor Formel – Der wissenschaftliche Standard</h3>
            <p>Unser Grundumsatz-Rechner verwendet die <strong>Mifflin-St Jeor Formel</strong>, die 1990 von Mark D. Mifflin und Sachiko T. St Jeor an der University of Nevada entwickelt wurde. Sie gilt heute als genaueste prädiktive Formel für den Grundumsatz und wird von der <strong>Academy of Nutrition and Dietetics</strong> als Standard empfohlen.</p>
            <div className="p-6 bg-base-200 rounded-lg my-6 text-center">
              <p className="font-mono text-lg mb-2"><strong>Mifflin-St Jeor Formel</strong></p>
              <p className="font-mono">Männer: <strong>BMR = 10 × Gewicht (kg) + 6,25 × Grösse (cm) − 5 × Alter + 5</strong></p>
              <p className="font-mono mt-2">Frauen: <strong>BMR = 10 × Gewicht (kg) + 6,25 × Grösse (cm) − 5 × Alter − 161</strong></p>
            </div>
            <p>
              Die Formel berücksichtigt die vier wichtigsten Determinanten des Grundumsatzes: Körpergewicht (mehr Masse = mehr Energie), Körpergrösse (grössere Oberfläche = mehr Wärmeverlust), Alter (mit zunehmendem Alter sinkt der Stoffwechsel) und Geschlecht (Männer haben durch mehr Muskelmasse einen höheren BMR). Der <strong>TDEE</strong> ergibt sich dann aus der Multiplikation des Grundumsatzes mit einem Aktivitätsfaktor zwischen 1,2 (kaum aktiv) und 1,9 (extrem aktiv).
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Warum ist der Grundumsatz so wichtig?</h3>
            <p>
              Dein Grundumsatz ist die <strong>absolute Untergrenze</strong> deiner Kalorienzufuhr. Egal wie ambitioniert dein Abnehm-Ziel ist – du solltest nie dauerhaft unter deinem BMR essen. Warum? Dein Körper interpretiert extreme Kalorienrestriktion als Hungersnot und reagiert mit:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Metabolischer Adaptation:</strong> Dein Stoffwechsel drosselt sich um 5–15 % unter den erwarteten Wert</li>
              <li><strong>Muskelabbau:</strong> Dein Körper baut Muskeln ab, um Protein als Energiequelle zu nutzen</li>
              <li><strong>Hormonelle Dysregulation:</strong> Leptin (Sättigungshormon) sinkt, Ghrelin (Hungerhormon) steigt, Cortisol (Stresshormon) steigt</li>
              <li><strong>Immunsuppression:</strong> Häufigere Infektionen und langsamere Wundheilung</li>
              <li><strong>Haarausfall und Nagelbrüchigkeit:</strong> Der Körper spart an nicht-essentiellen Funktionen</li>
            </ul>
            <p>
              Deshalb ist die goldene Regel: Berechne deinen TDEE, ziehe 15–25 % ab, aber bleibe <strong>immer über deinem Grundumsatz</strong>. Genau das macht unser Rechner oben für dich – automatisch und kostenlos. Wenn du deinen <a href="/kalorienbedarf-berechnen" className="link link-primary">Kalorienbedarf genauer berechnen</a> willst, nutze unseren separaten TDEE-Rechner.
            </p>
          </div>
        </section>

        {/* 3 Beispielrechnungen */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">3 Beispielrechnungen – Grundumsatz Schritt für Schritt</h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">Damit du die Berechnung nachvollziehen kannst, zeigen wir dir drei konkrete Beispiele mit der Mifflin-St Jeor Formel und den dazugehörigen Kalorienziel-Empfehlungen.</p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 1: Anna, 25 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Geschlecht:</strong> Weiblich | <strong>Grösse:</strong> 168 cm | <strong>Gewicht:</strong> 65 kg</p>
                    <p className="text-sm"><strong>Aktivität:</strong> Leicht aktiv (×1,375)</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">BMR = 10 × 65 + 6,25 × 168 − 5 × 25 − 161<br/>BMR = 650 + 1050 − 125 − 161<br/><strong>BMR = 1.414 kcal</strong></p>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded mt-2">TDEE = 1.414 × 1,375<br/><strong>TDEE = 1.944 kcal</strong></p>
                    <div className="badge badge-success">Normalgewicht</div>
                    <p className="text-sm opacity-70 mt-2"><strong>Zum Abnehmen:</strong> ~1.555 kcal/Tag (−20%). <strong>Zum Halten:</strong> ~1.944 kcal/Tag. Anna könnte mit dem <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit-Rechner</a> ihr optimales Defizit bestimmen.</p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 2: Markus, 40 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Geschlecht:</strong> Männlich | <strong>Grösse:</strong> 182 cm | <strong>Gewicht:</strong> 92 kg</p>
                    <p className="text-sm"><strong>Aktivität:</strong> Moderat aktiv (×1,55)</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">BMR = 10 × 92 + 6,25 × 182 − 5 × 40 + 5<br/>BMR = 920 + 1137,5 − 200 + 5<br/><strong>BMR = 1.863 kcal</strong></p>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded mt-2">TDEE = 1.863 × 1,55<br/><strong>TDEE = 2.888 kcal</strong></p>
                    <div className="badge badge-warning">Übergewicht (BMI 27,8)</div>
                    <p className="text-sm opacity-70 mt-2"><strong>Zum Abnehmen:</strong> ~2.310 kcal/Tag (−20%). Bei 500 kcal/Tag Defizit verliert Markus ca. 0,5 kg/Woche. Mit dem <a href="/bmi-rechner" className="link link-primary">BMI-Rechner</a> kann er seinen Fortschritt verfolgen.</p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 3: Lena, 22 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Geschlecht:</strong> Weiblich | <strong>Grösse:</strong> 172 cm | <strong>Gewicht:</strong> 55 kg</p>
                    <p className="text-sm"><strong>Aktivität:</strong> Sehr aktiv (×1,725)</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">BMR = 10 × 55 + 6,25 × 172 − 5 × 22 − 161<br/>BMR = 550 + 1075 − 110 − 161<br/><strong>BMR = 1.354 kcal</strong></p>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded mt-2">TDEE = 1.354 × 1,725<br/><strong>TDEE = 2.336 kcal</strong></p>
                    <div className="badge badge-info">Muskelaufbau-Ziel</div>
                    <p className="text-sm opacity-70 mt-2"><strong>Zum Aufbauen:</strong> ~2.686 kcal/Tag (+15%). Lena braucht genug <a href="/protein-bedarf-rechner" className="link link-primary">Protein</a> (ca. 1,6–2,2 g/kg = 88–121 g/Tag) und sollte ihre <a href="/makros-berechnen" className="link link-primary">Makros optimal verteilen</a>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Formelvergleich – Detailliert */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Grundumsatz-Formeln im Vergleich – Welche ist die beste?</h2>
            <p>Es gibt verschiedene wissenschaftliche Formeln zur Berechnung des Grundumsatzes. Jede hat ihre Stärken und Schwächen. Hier ist ein detaillierter Vergleich der drei wichtigsten:</p>

            <div className="grid gap-6 md:grid-cols-1 mt-6 not-prose">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🏆 Mifflin-St Jeor (1990) – Unser Standard</h3>
                  <div className="mt-2 p-4 bg-base-200 rounded-lg font-mono text-sm">
                    <p>Männer: 10 × Gewicht + 6,25 × Grösse − 5 × Alter + 5</p>
                    <p>Frauen: 10 × Gewicht + 6,25 × Grösse − 5 × Alter − 161</p>
                  </div>
                  <p className="opacity-80 mt-3">Entwickelt an 498 gesunden Probanden. Eine Vergleichsstudie (Frankenfield et al., 2005) mit 36 Studien und über 9.000 Teilnehmern zeigte, dass Mifflin-St Jeor den BMR bei 82 % der Normalgewichtigen und 70 % der Übergewichtigen auf ±10 % genau vorhersagt. <strong>Empfohlen von der Academy of Nutrition and Dietetics seit 2002.</strong></p>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-success">Genaueste Formel</span>
                    <span className="badge badge-outline">Kein KFA nötig</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">📜 Harris-Benedict (1919/1984 revidiert)</h3>
                  <div className="mt-2 p-4 bg-base-200 rounded-lg font-mono text-sm">
                    <p>Männer: 88,362 + 13,397 × Gewicht + 4,799 × Grösse − 5,677 × Alter</p>
                    <p>Frauen: 447,593 + 9,247 × Gewicht + 3,098 × Grösse − 4,330 × Alter</p>
                  </div>
                  <p className="opacity-80 mt-3">Die Urversion (1919) wurde an nur 239 Personen entwickelt und überschätzt den Grundumsatz bei den meisten modernen Populationen um 5–15 %. Die revidierte Version (Roza & Shizgal, 1984) ist etwas genauer, aber immer noch weniger präzise als Mifflin-St Jeor. Trotzdem findet man die Harris-Benedict-Formel noch in vielen älteren Lehrbüchern und Online-Rechnern.</p>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-warning">Tendiert zur Überschätzung</span>
                    <span className="badge badge-outline">Historisch wichtig</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">💪 Katch-McArdle (1996)</h3>
                  <div className="mt-2 p-4 bg-base-200 rounded-lg font-mono text-sm">
                    <p>BMR = 370 + 21,6 × Magermasse (kg)</p>
                    <p>Magermasse = Gewicht × (1 − Körperfettanteil)</p>
                  </div>
                  <p className="opacity-80 mt-3">Die einzige Formel, die den Körperfettanteil (KFA) berücksichtigt. Dadurch ist sie besonders genau für Menschen mit atypischer Körperzusammensetzung – z. B. sehr muskulöse Sportler oder Menschen mit hohem Körperfettanteil. Der Nachteil: Du musst deinen KFA kennen, was ohne Caliper, DEXA-Scan oder Bioimpedanzanalyse schwierig ist. Nutze unseren <a href="/koerperfett-rechner" className="link link-primary">Körperfett-Rechner</a> für eine Schätzung.</p>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-info">Ideal für Sportler</span>
                    <span className="badge badge-outline">KFA erforderlich</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6"><strong>Fazit:</strong> Für die meisten Menschen ist Mifflin-St Jeor die beste Wahl. Wenn du deinen Körperfettanteil kennst, nutze zusätzlich Katch-McArdle als Gegenprobe. Harris-Benedict ist veraltet, liefert aber noch brauchbare Schätzungen. Unser Rechner oben zeigt dir automatisch alle drei Ergebnisse zum Vergleich.</p>
          </div>
        </section>

        {/* Was beeinflusst den Grundumsatz? – Ausführlich */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Was beeinflusst den Grundumsatz? – Die 8 wichtigsten Faktoren</h2>
            <p>Dein Grundumsatz ist keine fixe Zahl – er wird von zahlreichen Faktoren beeinflusst. Einige kannst du beeinflussen, andere nicht. Hier sind die acht wichtigsten Einflussfaktoren im Detail:</p>

            <div className="grid gap-4 md:grid-cols-2 mt-6 not-prose">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">💪 1. Muskelmasse</h3>
                  <p className="opacity-80 text-sm">Der wichtigste beeinflussbare Faktor! Muskelgewebe ist metabolisch aktiv und verbrennt ca. 13 kcal/kg/Tag, während Fettgewebe nur ca. 4,5 kcal/kg/Tag verbraucht. Deshalb haben muskulöse Menschen einen höheren Grundumsatz. Regelmässiges <strong>Krafttraining</strong> kann deinen BMR dauerhaft steigern – ein Grund mehr, neben der Ernährung auch Hanteln zu schwingen.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">⚖️ 2. Körpergewicht & Körpergrösse</h3>
                  <p className="opacity-80 text-sm">Mehr Masse = mehr Energiebedarf. Ein grösserer Körper hat mehr Zellen, die versorgt werden müssen, und eine grössere Oberfläche, über die Wärme verloren geht. Pro Kilogramm Körpergewicht beträgt der Grundumsatz grob <strong>1 kcal pro Stunde bei Männern</strong> und 0,9 kcal bei Frauen – eine Faustregel, die schnell eine erste Schätzung liefert.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">🎂 3. Alter</h3>
                  <p className="opacity-80 text-sm">Ab dem 20. Lebensjahr sinkt der Grundumsatz um ca. <strong>1–2 % pro Dekade</strong>. Hauptgrund: altersbedingter Muskelabbau (Sarkopenie). Ab 30 verlierst du ohne Gegenmassnahmen 3–8 % Muskelmasse pro Dekade. Die gute Nachricht: Krafttraining kann diesen Abbau fast vollständig verhindern – selbst bei 70-Jährigen zeigen Studien signifikante Muskelzuwächse.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">♀️♂️ 4. Geschlecht</h3>
                  <p className="opacity-80 text-sm">Männer haben bei gleichem Gewicht und Alter einen ca. <strong>5–10 % höheren Grundumsatz</strong> als Frauen. Der Hauptgrund: Männer haben mehr Muskelmasse (durchschnittlich 40–50 % des Körpergewichts vs. 30–40 % bei Frauen) und weniger essentielles Körperfett. Der Zyklus beeinflusst den BMR bei Frauen zusätzlich – in der Lutealphase (zweite Zyklushälfte) steigt der Grundumsatz um ca. 100–300 kcal.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">🧬 5. Genetik</h3>
                  <p className="opacity-80 text-sm">Deine Gene bestimmen die Grundausstattung deines Stoffwechsels. Studien an eineiigen Zwillingen zeigen, dass genetische Faktoren <strong>bis zu 40 % der Varianz</strong> im Grundumsatz erklären. Das bedeutet: Zwei gleichgrosse, gleichschwere, gleich alte Personen können Grundumsatz-Unterschiede von 200–300 kcal haben. Ein Grund, warum manche Menschen „einfacher" zu- oder abnehmen als andere.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">🌡️ 6. Schilddrüsenhormone</h3>
                  <p className="opacity-80 text-sm">Die Schilddrüsenhormone T3 und T4 sind die wichtigsten Regulatoren des Grundumsatzes. Eine <strong>Schilddrüsenüberfunktion</strong> (Hyperthyreose) kann den BMR um 50–100 % steigern, eine <strong>Unterfunktion</strong> (Hypothyreose) ihn um 30–40 % senken. Wenn du trotz kontrollierter Ernährung unerklärlich zu- oder abnimmst, lass deine Schilddrüsenwerte (TSH, fT3, fT4) beim Arzt checken.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">🌡️ 7. Umgebungstemperatur</h3>
                  <p className="opacity-80 text-sm">Bei Kälte muss dein Körper mehr Energie aufwenden, um die Kerntemperatur von 37 °C zu halten. Moderate Kälteexposition kann den Grundumsatz kurzfristig um <strong>5–30 %</strong> steigern. Chronische Kälteanpassung aktiviert zusätzlich braunes Fettgewebe (BAT), das Kalorien direkt in Wärme umwandelt. Kalt duschen oder bei niedrigeren Temperaturen schlafen (ca. 18 °C) kann den Stoffwechsel leicht ankurbeln.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">🍽️ 8. Kalorienrestriktion & Diäten</h3>
                  <p className="opacity-80 text-sm">Extreme Diäten senken deinen Grundumsatz aktiv – ein Schutzmechanismus deines Körpers. Die berühmte <strong>Minnesota Starvation Study (1944)</strong> zeigte: Nach 24 Wochen Semi-Starvation sank der BMR der Teilnehmer um 40 %. Auch moderate Crashdiäten (&lt;1.200 kcal) können den Grundumsatz um 10–15 % senken. Deshalb empfehlen wir ein moderates <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit</a> von maximal 20–25 %.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grundumsatz nach Alter und Geschlecht */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Grundumsatz nach Alter und Geschlecht – Richtwerte</h2>
            <p>Die folgenden Tabellen zeigen durchschnittliche Grundumsatz-Werte für verschiedene Altersgruppen. Die Werte basieren auf der Mifflin-St Jeor Formel bei durchschnittlicher Körpergrösse und Gewicht. Dein persönlicher Wert kann je nach Muskelmasse und Genetik abweichen – nutze unseren Rechner oben für eine individuelle Berechnung.</p>

            <div className="grid gap-6 md:grid-cols-2 mt-6 not-prose">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">👨 Grundumsatz Männer (Richtwerte)</h3>
                  <div className="overflow-x-auto mt-2">
                    <table className="table table-zebra w-full text-sm">
                      <thead><tr><th>Alter</th><th>BMR (kcal)</th><th>Bedingungen</th></tr></thead>
                      <tbody>
                        <tr><td>18–25</td><td className="font-bold">1.700–1.900</td><td>180 cm, 75 kg</td></tr>
                        <tr><td>25–35</td><td className="font-bold">1.650–1.800</td><td>180 cm, 80 kg</td></tr>
                        <tr><td>35–45</td><td className="font-bold">1.600–1.750</td><td>180 cm, 82 kg</td></tr>
                        <tr><td>45–55</td><td className="font-bold">1.550–1.700</td><td>180 cm, 83 kg</td></tr>
                        <tr><td>55–65</td><td className="font-bold">1.500–1.650</td><td>178 cm, 82 kg</td></tr>
                        <tr><td>65+</td><td className="font-bold">1.400–1.550</td><td>176 cm, 78 kg</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">👩 Grundumsatz Frauen (Richtwerte)</h3>
                  <div className="overflow-x-auto mt-2">
                    <table className="table table-zebra w-full text-sm">
                      <thead><tr><th>Alter</th><th>BMR (kcal)</th><th>Bedingungen</th></tr></thead>
                      <tbody>
                        <tr><td>18–25</td><td className="font-bold">1.350–1.500</td><td>166 cm, 62 kg</td></tr>
                        <tr><td>25–35</td><td className="font-bold">1.300–1.450</td><td>166 cm, 65 kg</td></tr>
                        <tr><td>35–45</td><td className="font-bold">1.250–1.400</td><td>166 cm, 67 kg</td></tr>
                        <tr><td>45–55</td><td className="font-bold">1.200–1.350</td><td>165 cm, 68 kg</td></tr>
                        <tr><td>55–65</td><td className="font-bold">1.150–1.300</td><td>164 cm, 67 kg</td></tr>
                        <tr><td>65+</td><td className="font-bold">1.100–1.250</td><td>162 cm, 65 kg</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6"><strong>Wichtig:</strong> Diese Richtwerte sind Durchschnittswerte. Dein individueller Grundumsatz hängt von deiner Muskelmasse, Genetik und Schilddrüsenfunktion ab. Ein muskulöser 50-Jähriger kann einen höheren BMR haben als ein untrainierter 25-Jähriger. Berechne deinen persönlichen Wert immer mit unserem Rechner. Für die Berechnung deines <a href="/idealgewicht-rechner" className="link link-primary">Idealgewichts</a> ist der Grundumsatz ebenfalls eine wichtige Ausgangsgrösse.</p>
          </div>
        </section>

        {/* Grundumsatz und Abnehmen – Praxisleitfaden */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Grundumsatz und Abnehmen – Der Praxisleitfaden</h2>

            <h3 className="text-xl font-bold mt-6 mb-4">Schritt 1: Grundumsatz und TDEE berechnen</h3>
            <p>Nutze unseren Rechner oben, um deinen Grundumsatz und TDEE zu ermitteln. Der TDEE ist dein tatsächlicher Kalorienverbrauch pro Tag inklusive aller Aktivitäten. Das ist die Zahl, mit der du arbeitest.</p>

            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 2: Kaloriendefizit festlegen</h3>
            <p>Für nachhaltiges Abnehmen empfehlen wir ein Defizit von <strong>15–25 % unter deinem TDEE</strong>. Das entspricht je nach Person einem Defizit von 300–600 kcal pro Tag. Bei 500 kcal Defizit pro Tag verlierst du ca. 0,5 kg Fett pro Woche (7.700 kcal = 1 kg Körperfett). Nutze unseren <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit-Rechner</a> für eine genaue Berechnung.</p>
            <div className="p-6 bg-base-100 rounded-lg my-6 shadow">
              <p className="font-bold text-center mb-2">Die goldene Regel:</p>
              <p className="text-center text-lg">Kalorienziel = TDEE × 0,80 (20 % Defizit)</p>
              <p className="text-center text-sm opacity-60 mt-1">Aber IMMER über dem Grundumsatz bleiben!</p>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 3: Makronährstoffe verteilen</h3>
            <p>Nicht nur die Gesamtkalorien zählen – auch die Verteilung der Makronährstoffe ist entscheidend. Für Abnehmen bei maximalem Muskelerhalt empfehlen wir:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Protein:</strong> 1,6–2,2 g pro kg Körpergewicht (ca. 30–35 % der Kalorien). Berechne deinen Bedarf mit unserem <a href="/protein-bedarf-rechner" className="link link-primary">Proteinrechner</a></li>
              <li><strong>Fett:</strong> 0,8–1,0 g pro kg (ca. 25–30 % der Kalorien). Essentielle Fette sind wichtig für Hormone und Vitaminaufnahme</li>
              <li><strong>Kohlenhydrate:</strong> Der Rest (ca. 35–45 % der Kalorien). Bevorzuge komplexe Kohlenhydrate mit vielen Ballaststoffen</li>
            </ul>
            <p>Mit unserem <a href="/makros-berechnen" className="link link-primary">Makrorechner</a> kannst du die optimale Verteilung für dein Ziel berechnen.</p>

            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 4: Kalorien tracken</h3>
            <p>Studien zeigen, dass Menschen, die ihre Kalorien tracken, <strong>doppelt so viel abnehmen</strong> wie Menschen, die es nicht tun. Der Grund: Wir überschätzen unseren Energieverbrauch und unterschätzen unsere Kalorienaufnahme systematisch – oft um 30–50 %. Mit <strong>Mahlzait</strong> trackst du deine Kalorien in Sekunden: Einfach Essen fotografieren, und die KI erkennt automatisch alle Nährwerte. Kein manuelles Suchen in Datenbanken, kein mühsames Abwiegen. Mehr über die Methode findest du in unserem Guide zum <a href="/kalorien-zaehlen" className="link link-primary">Kalorien zählen</a>.</p>

            <h3 className="text-xl font-bold mt-8 mb-4">Schritt 5: Regelmässig anpassen</h3>
            <p>Dein Grundumsatz sinkt, wenn du abnimmst. Pro 10 kg Gewichtsverlust sinkt dein TDEE um ca. 150–250 kcal. Das bedeutet: Alle 5–10 kg solltest du deinen Kalorienbedarf neu berechnen. Stagniert dein Gewicht trotz Defizit länger als 2 Wochen, liegt wahrscheinlich ein Plateau vor. Strategien: <strong>Refeed-Tag</strong> einbauen (1 Tag auf TDEE-Niveau essen), Aktivität erhöhen (z. B. <a href="/schritte-kalorien-rechner" className="link link-primary">mehr Schritte</a>) oder eine 1-wöchige Diätpause machen.</p>
          </div>
        </section>

        {/* Metabolische Adaptation – Wissenschaftlicher Deep-Dive */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Metabolische Adaptation – Warum der Stoffwechsel sich anpasst</h2>
            <p>
              Wenn du über längere Zeit im Kaloriendefizit isst, reagiert dein Körper mit einer <strong>metabolischen Adaptation</strong> (auch adaptive Thermogenese genannt). Das bedeutet: Dein tatsächlicher Grundumsatz sinkt stärker, als es allein durch den Gewichtsverlust zu erklären wäre. Dieser Effekt ist ein evolutionärer Schutzmechanismus – in Zeiten knapper Nahrung war es überlebenswichtig, Energie zu sparen.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-4">Die „Biggest Loser"-Studie (2016)</h3>
            <p>
              Eine berühmte Studie von Kevin Hall (NIH) untersuchte 14 Teilnehmer der TV-Show „The Biggest Loser" sechs Jahre nach der Show. Ergebnis: Der Grundumsatz der Teilnehmer war im Durchschnitt <strong>500 kcal/Tag niedriger</strong> als erwartet – trotz teilweiser Gewichtszunahme. Diese Studie zeigt das Worst-Case-Szenario extremer Diäten: Der Körper „merkt" sich das Kaloriendefizit und drosselt den Stoffwechsel nachhaltig.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">So minimierst du die metabolische Adaptation</h3>
            <div className="grid gap-4 md:grid-cols-2 mt-4 not-prose">
              <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-bold">Moderates Defizit wählen</h4>
                  <p className="text-sm opacity-70">Maximal 20–25 % unter TDEE. Crashdiäten unter 1.200 kcal verursachen die stärkste Adaptation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                <span className="text-2xl">💪</span>
                <div>
                  <h4 className="font-bold">Krafttraining beibehalten</h4>
                  <p className="text-sm opacity-70">Muskelerhalt ist entscheidend. Muskeln halten deinen Grundumsatz oben. 2–3× pro Woche reicht.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                <span className="text-2xl">🥩</span>
                <div>
                  <h4 className="font-bold">Proteinreich essen</h4>
                  <p className="text-sm opacity-70">1,6–2,2 g/kg Protein schützt Muskeln im Defizit. Protein hat ausserdem den höchsten thermischen Effekt.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                <span className="text-2xl">🔄</span>
                <div>
                  <h4 className="font-bold">Regelmässige Refeed-Tage</h4>
                  <p className="text-sm opacity-70">1× pro Woche auf TDEE essen (v. a. mehr Kohlenhydrate). Das signalisiert dem Körper: keine Hungersnot.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                <span className="text-2xl">😴</span>
                <div>
                  <h4 className="font-bold">Ausreichend Schlaf</h4>
                  <p className="text-sm opacity-70">7–9 Stunden. Schlafmangel erhöht Cortisol und verstärkt die metabolische Adaptation. Nutze den <a href="/schlaf-rechner" className="link link-primary">Schlafrechner</a>.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-base-200 rounded-lg">
                <span className="text-2xl">⏸️</span>
                <div>
                  <h4 className="font-bold">Diätpausen einplanen</h4>
                  <p className="text-sm opacity-70">Nach 8–12 Wochen Diät: 1–2 Wochen auf TDEE-Niveau essen. Studien zeigen, dass intermittierende Diäten mehr Fett verbrennen als durchgängige.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grundumsatz steigern – Praktische Tipps */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Grundumsatz steigern – 7 wissenschaftlich fundierte Methoden</h2>
            <p>Ein höherer Grundumsatz bedeutet: Du verbrennst mehr Kalorien, auch wenn du nichts tust. Hier sind sieben Methoden, die nachweislich funktionieren:</p>

            <div className="grid gap-4 md:grid-cols-2 mt-6 not-prose">
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">1. Krafttraining (wichtigster Faktor)</h3><p className="text-sm opacity-80">Baue Muskelmasse auf. Jedes kg Muskeln erhöht deinen Grundumsatz um ca. 13 kcal/Tag. 5 kg Muskelzuwachs = 65 kcal mehr pro Tag = 23.725 kcal mehr pro Jahr. Langfristig macht das einen enormen Unterschied. Trainiere 2–3× pro Woche mit progressiver Überlastung.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">2. Proteinzufuhr erhöhen</h3><p className="text-sm opacity-80">Protein hat einen thermischen Effekt von 20–30 % – das heisst, dein Körper verbraucht 20–30 % der Protein-Kalorien allein für deren Verdauung. Bei Kohlenhydraten sind es nur 5–10 %, bei Fett sogar nur 0–3 %. Mehr Protein = höherer täglicher Kalorienverbrauch. Berechne deinen Bedarf mit unserem <a href="/protein-bedarf-rechner" className="link link-primary">Proteinrechner</a>.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">3. NEAT steigern (Alltagsbewegung)</h3><p className="text-sm opacity-80">NEAT kann 200–900 kcal/Tag ausmachen. Kleine Änderungen wirken: Stehschreibtisch nutzen, Treppe statt Aufzug, nach dem Essen spazieren, beim Telefonieren herumlaufen. 10.000 Schritte verbrennen ca. 350–500 kcal zusätzlich. Nutze unseren <a href="/schritte-kalorien-rechner" className="link link-primary">Schritte-Rechner</a> für genaue Werte.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">4. Ausreichend Schlaf (7–9 Stunden)</h3><p className="text-sm opacity-80">Schlafmangel senkt den Grundumsatz um 2,6 % (Studie: Spaeth et al., 2015), erhöht Cortisol und Ghrelin (Hungerhormon) und führt zu mehr Heisshunger auf kohlenhydratreiche Snacks. Ein regelmässiger Schlafrhythmus mit 7–9 Stunden optimiert deinen Stoffwechsel. Unser <a href="/schlaf-rechner" className="link link-primary">Schlafrechner</a> berechnet deine optimale Schlafenszeit.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">5. Koffein (Kaffee & grüner Tee)</h3><p className="text-sm opacity-80">Koffein steigert den Stoffwechsel kurzfristig um 3–11 %. 100 mg Koffein (ca. 1 Tasse Kaffee) erhöhen den Energieverbrauch um ca. 75–100 kcal über 24 Stunden. Grüner Tee liefert zusätzlich Catechine (EGCG), die synergistisch wirken. Aber: Der Effekt lässt bei regelmässigem Konsum nach (Toleranzentwicklung). Nutze unseren <a href="/koffein-rechner" className="link link-primary">Koffeinrechner</a> für die optimale Dosierung.</p></div></div>
              <div className="card bg-base-100 shadow-lg"><div className="card-body py-4"><h3 className="font-bold">6. Kälteexposition</h3><p className="text-sm opacity-80">Kalte Duschen, Eisbäder oder Schlafzimmer bei 18 °C aktivieren braunes Fettgewebe (BAT). BAT verbrennt Kalorien direkt als Wärme. Studien zeigen: 2 Stunden bei 17 °C können den Kalorienverbrauch um 100–200 kcal steigern. Langfristig erhöht Kälteexposition die Menge an braunem Fett in deinem Körper.</p></div></div>
              <div className="card bg-base-100 shadow-lg md:col-span-2"><div className="card-body py-4"><h3 className="font-bold">7. Keine Crashdiäten</h3><p className="text-sm opacity-80">Paradox, aber wahr: Zu wenig essen senkt deinen Grundumsatz dauerhaft. Crashdiäten unter 1.200 kcal lösen eine metabolische Adaptation aus, die noch Jahre nachwirken kann. Besser: Moderates Defizit von 300–500 kcal/Tag. Das schont deinen Stoffwechsel und liefert trotzdem ca. 0,5 kg Gewichtsverlust pro Woche. Berechne dein optimales <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit</a> hier.</p></div></div>
            </div>
          </div>
        </section>

        {/* Grundumsatz in Deutschland – Statistiken */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Grundumsatz und Ernährung in Deutschland – Zahlen & Fakten</h2>
            <p>
              Laut der <strong>Nationalen Verzehrsstudie II</strong> (Max Rubner-Institut) liegt die durchschnittliche Energieaufnahme in Deutschland bei Männern bei ca. 2.413 kcal/Tag und bei Frauen bei ca. 1.833 kcal/Tag. Verglichen mit den berechneten TDEE-Durchschnittswerten zeigt sich: Viele Deutsche essen deutlich mehr als ihr Körper braucht – was die hohe Übergewichtsrate von 53 % bei Frauen und 67 % bei Männern (Robert Koch-Institut, GEDA 2022) erklärt.
            </p>
            <p>
              Der durchschnittliche Grundumsatz in Deutschland liegt bei Männern bei ca. <strong>1.700–1.800 kcal/Tag</strong> und bei Frauen bei ca. <strong>1.300–1.400 kcal/Tag</strong>. Der Gesamtenergieumsatz (bei moderater Aktivität) beträgt durchschnittlich 2.200–2.500 kcal für Männer und 1.800–2.000 kcal für Frauen. Jeder Deutsche, der dauerhaft mehr als seinen TDEE isst, nimmt zu – im Durchschnitt ca. 0,5 kg pro Jahr.
            </p>
            <p>
              Das Bundesministerium für Ernährung empfiehlt, den individuellen Kalorienbedarf regelmässig zu berechnen und die Ernährung daran anzupassen. Tools wie unser Grundumsatz-Rechner und die <a href="/kalorien-zaehlen-app" className="link link-primary">Mahlzait Kalorien-App</a> machen das einfach und zugänglich für jeden. Wer seinen Grundumsatz kennt, hat die Basis für eine gesunde, bedarfsgerechte Ernährung – egal ob zum Abnehmen, Halten oder Aufbauen.
            </p>
          </div>
        </section>

        {/* FAQ Section – 8 FAQs */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Häufig gestellte Fragen zum Grundumsatz</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input
                    type="radio"
                    name="faq-accordion"
                    checked={openFaq === i}
                    onChange={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                  <div className="collapse-title text-lg font-medium" onClick={() => setOpenFaq(openFaq === i ? null : i)}>{faq.q}</div>
                  <div className="collapse-content"><p className="opacity-80">{faq.a}</p></div>
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
              Du kennst jetzt deinen Grundumsatz und TDEE. Der nächste Schritt: Deine Ernährung tracken und dein Ziel erreichen. Mit Mahlzait trackst du deine Kalorien in Sekunden – per Foto, Text oder Barcode. Keine komplizierten Tabellen, keine manuelle Eingabe. Einfach fotografieren und die KI erledigt den Rest.
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

        {/* Internal Links – 10 Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Rechner & Ratgeber</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">Kalorienbedarf berechnen</a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">Kaloriendefizit berechnen</a>
              <a href="/bmi-rechner" className="btn btn-outline">BMI Rechner</a>
              <a href="/makros-berechnen" className="btn btn-outline">Makros berechnen</a>
              <a href="/protein-bedarf-rechner" className="btn btn-outline">Proteinbedarf Rechner</a>
              <a href="/koerperfett-rechner" className="btn btn-outline">Körperfett Rechner</a>
              <a href="/idealgewicht-rechner" className="btn btn-outline">Idealgewicht Rechner</a>
              <a href="/schritte-kalorien-rechner" className="btn btn-outline">Schritte-Kalorien-Rechner</a>
              <a href="/kalorien-zaehlen" className="btn btn-outline">Kalorien zählen Guide</a>
              <a href="/rechner" className="btn btn-outline">Alle Rechner</a>
            </div>
          </div>
        </section>

        <RelatedWissen calculatorSlug="grundumsatz-rechner" />
        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default GrundumsatzRechnerPage;
