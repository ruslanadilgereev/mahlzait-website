import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface CheatDayResult {
  dailyCalories: number;
  weeklyBudget: number;
  normalDayCalories: number;
  cheatDayCalories: number;
  extraCalories: number;
  weeklyDeficit: number;
  expectedWeeklyLoss: number;
  cheatDayImpact: string;
  strategy: string;
}

function CheatDayRechnerPage({ config }: Props) {
  const [tdee, setTdee] = useState(2000);
  const [goal, setGoal] = useState<"loss" | "maintain">("loss");
  const [deficitPercent, setDeficitPercent] = useState(20);
  const [cheatFrequency, setCheatFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [cheatIntensity, setCheatIntensity] = useState<"mild" | "moderate" | "epic">("moderate");
  const [result, setResult] = useState<CheatDayResult | null>(null);

  const intensityMultipliers: Record<string, { multiplier: number; label: string; desc: string; emoji: string }> = {
    mild: { multiplier: 1.3, label: "Mild", desc: "+30% mehr Kalorien", emoji: "🍕" },
    moderate: { multiplier: 1.5, label: "Moderat", desc: "+50% mehr Kalorien", emoji: "🍔🍕" },
    epic: { multiplier: 2.0, label: "Episch", desc: "+100% mehr Kalorien", emoji: "🍔🍕🍰🍦" },
  };

  const frequencyLabels: Record<string, { label: string; weeks: number; emoji: string }> = {
    weekly: { label: "Wöchentlich", weeks: 1, emoji: "📅" },
    biweekly: { label: "Alle 2 Wochen", weeks: 2, emoji: "📆" },
    monthly: { label: "Monatlich", weeks: 4, emoji: "🗓️" },
  };

  const calculate = () => {
    const dailyDeficit = goal === "loss" ? tdee * (deficitPercent / 100) : 0;
    const dailyCalories = Math.round(tdee - dailyDeficit);
    
    const weeksInCycle = frequencyLabels[cheatFrequency].weeks;
    const daysInCycle = weeksInCycle * 7;
    const cheatDaysInCycle = 1;
    const normalDaysInCycle = daysInCycle - cheatDaysInCycle;
    
    // Calculate weekly budget for the cycle
    const cycleBudget = dailyCalories * daysInCycle;
    
    // Cheat day calories
    const cheatMultiplier = intensityMultipliers[cheatIntensity].multiplier;
    const cheatDayCalories = Math.round(dailyCalories * cheatMultiplier);
    const extraCalories = cheatDayCalories - dailyCalories;
    
    // Distribute the extra calories across normal days to maintain weekly deficit
    const normalDayCalories = Math.round((cycleBudget - cheatDayCalories) / normalDaysInCycle);
    
    // Calculate actual weekly metrics
    const actualWeeklyCalories = (normalDayCalories * normalDaysInCycle + cheatDayCalories) / weeksInCycle;
    const weeklyDeficit = (tdee * 7) - actualWeeklyCalories;
    const expectedWeeklyLoss = weeklyDeficit / 7700; // 1kg = 7700 kcal
    
    // Determine impact
    let cheatDayImpact = "";
    let strategy = "";
    
    if (expectedWeeklyLoss >= 0.4) {
      cheatDayImpact = "Minimal – du bleibst auf Kurs!";
      strategy = "Perfekt ausbalanciert. Du kannst deinen Cheat-Day voll geniessen.";
    } else if (expectedWeeklyLoss >= 0.2) {
      cheatDayImpact = "Moderat – etwas langsamer, aber machbar";
      strategy = "Dein Fortschritt verlangsamt sich leicht, bleibt aber stabil.";
    } else if (expectedWeeklyLoss > 0) {
      cheatDayImpact = "Spürbar – Fortschritt verlangsamt sich deutlich";
      strategy = "Erwäge ein kleineres Defizit an normalen Tagen oder seltener Cheat-Days.";
    } else {
      cheatDayImpact = "Kritisch – Defizit wird aufgehoben";
      strategy = "Reduziere die Cheat-Day-Intensität oder mache seltener Cheat-Days.";
    }

    setResult({
      dailyCalories,
      weeklyBudget: Math.round(actualWeeklyCalories),
      normalDayCalories,
      cheatDayCalories,
      extraCalories,
      weeklyDeficit: Math.round(weeklyDeficit),
      expectedWeeklyLoss,
      cheatDayImpact,
      strategy,
    });
  };

  const cheatDayFoods = [
    { food: "Pizza (ganze)", kcal: "1800-2500", emoji: "🍕" },
    { food: "Burger + Pommes + Shake", kcal: "1500-2000", emoji: "🍔" },
    { food: "Döner mit allem", kcal: "800-1200", emoji: "🥙" },
    { food: "Eis (500ml Becher)", kcal: "800-1200", emoji: "🍨" },
    { food: "Chips (200g Tüte)", kcal: "1000-1100", emoji: "🥔" },
    { food: "Schokolade (100g)", kcal: "500-600", emoji: "🍫" },
    { food: "Kuchen (1 Stück)", kcal: "300-500", emoji: "🍰" },
    { food: "Bier (0.5L)", kcal: "200-250", emoji: "🍺" },
  ];

  const smartTips = [
    { tip: "Trainiere am Cheat-Day – nutze die Extra-Energie!", icon: "💪" },
    { tip: "Starte mit Protein – du wirst schneller satt", icon: "🥩" },
    { tip: "Kein Schuldgefühl – es ist GEPLANT!", icon: "✨" },
    { tip: "Am nächsten Tag normal weiter – kein Ausgleichs-Hungern", icon: "⚖️" },
    { tip: "Trinke viel Wasser – hilft gegen das aufgedunsene Gefühl", icon: "💧" },
    { tip: "Geniesse bewusst statt sinnlos zu schlingen", icon: "🧘" },
  ];

  const cheatDayMistakes = [
    { mistake: "Das ganze Wochenende als Cheat-Day zählen", why: "2-3 Tage können eine ganze Woche zunichte machen" },
    { mistake: "Aus Schuldgefühlen am nächsten Tag hungern", why: "Führt zu einem Teufelskreis und Essstörungen" },
    { mistake: "Cheat-Day als Ausrede für Fressattacken", why: "Es geht ums Geniessen, nicht ums Maximum" },
    { mistake: "Jeden Tag ein bisschen cheaten", why: "Kleine tägliche Extras summieren sich schnell" },
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
              Cheat-Day-Rechner 🍕
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Plane deinen Cheat-Day clever! Berechne, wie viele Extra-Kalorien du dir gönnen kannst, ohne dein Ziel zu gefährden.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">🍕 Cheat-Day planen</h2>

              {/* TDEE Input */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-semibold">Dein Kalorienbedarf (TDEE)</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">{tdee}</span>
                    <span className="text-xl font-medium opacity-70">kcal</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="4000"
                  step="50"
                  value={tdee}
                  onChange={(e) => setTdee(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>1200</span>
                  <span>2000</span>
                  <span>3000</span>
                  <span>4000</span>
                </div>
                <p className="text-sm opacity-60 mt-2 text-center">
                  <a href="/kalorienbedarf-berechnen" className="link link-primary">
                    → Kalorienbedarf berechnen
                  </a>
                </p>
              </div>

              {/* Goal */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Aktuelles Ziel</span>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                      goal === "loss"
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-base-200 border-2 border-transparent hover:border-base-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="goal"
                      className="radio radio-primary mb-2"
                      checked={goal === "loss"}
                      onChange={() => setGoal("loss")}
                    />
                    <span className="text-3xl mb-1">🔥</span>
                    <span className="font-medium">Abnehmen</span>
                    <span className="text-xs opacity-70">im Kaloriendefizit</span>
                  </label>
                  <label
                    className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                      goal === "maintain"
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-base-200 border-2 border-transparent hover:border-base-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="goal"
                      className="radio radio-primary mb-2"
                      checked={goal === "maintain"}
                      onChange={() => setGoal("maintain")}
                    />
                    <span className="text-3xl mb-1">⚖️</span>
                    <span className="font-medium">Gewicht halten</span>
                    <span className="text-xs opacity-70">Erhaltungskalorien</span>
                  </label>
                </div>
              </div>

              {/* Deficit Slider (only for weight loss) */}
              {goal === "loss" && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-lg font-semibold">Tägliches Defizit</label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">{deficitPercent}%</span>
                      <span className="text-base font-medium opacity-70">
                        ({Math.round(tdee * deficitPercent / 100)} kcal)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="5"
                    value={deficitPercent}
                    onChange={(e) => setDeficitPercent(Number(e.target.value))}
                    className="range range-primary range-lg"
                  />
                  <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                    <span>10% (leicht)</span>
                    <span>20% (moderat)</span>
                    <span>30% (aggressiv)</span>
                  </div>
                </div>
              )}

              {/* Cheat Day Frequency */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Wie oft Cheat-Day?</span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(frequencyLabels).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all text-center ${
                        cheatFrequency === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        className="radio radio-primary radio-sm mb-1"
                        checked={cheatFrequency === key}
                        onChange={() => setCheatFrequency(key as typeof cheatFrequency)}
                      />
                      <span className="text-2xl">{value.emoji}</span>
                      <span className="text-sm font-medium">{value.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cheat Day Intensity */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Cheat-Day Intensität</span>
                <div className="grid gap-2">
                  {Object.entries(intensityMultipliers).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        cheatIntensity === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="intensity"
                        className="radio radio-primary"
                        checked={cheatIntensity === key}
                        onChange={() => setCheatIntensity(key as typeof cheatIntensity)}
                      />
                      <span className="text-2xl">{value.emoji}</span>
                      <div className="flex-1">
                        <span className="font-bold">{value.label}</span>
                        <span className="text-sm opacity-70 ml-2">{value.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculate}>
                🍕 Cheat-Day berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Cheat-Day Plan</div>

                  {/* Main Stats */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h4 className="text-sm opacity-70">Normale Tage</h4>
                        <p className="text-3xl font-bold text-success">{result.normalDayCalories} kcal</p>
                        <p className="text-xs opacity-60">pro Tag</p>
                      </div>
                    </div>
                    <div className="card bg-primary/10 border-2 border-primary">
                      <div className="card-body py-4 text-center">
                        <h4 className="text-sm opacity-70">🍕 Cheat-Day</h4>
                        <p className="text-3xl font-bold text-primary">{result.cheatDayCalories} kcal</p>
                        <p className="text-xs opacity-60">+{result.extraCalories} Extra-Kalorien</p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Impact */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="font-bold text-lg">📊 Wöchentliche Bilanz</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm opacity-70">Durchschnitt/Tag</p>
                          <p className="text-xl font-bold">{Math.round(result.weeklyBudget / 7)} kcal</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-70">Wöchentliches Defizit</p>
                          <p className="text-xl font-bold">{result.weeklyDeficit} kcal</p>
                        </div>
                      </div>
                      {goal === "loss" && (
                        <div className="mt-4 pt-4 border-t border-base-300">
                          <p className="text-sm opacity-70">Erwartete Abnahme pro Woche</p>
                          <p className="text-2xl font-bold text-success">
                            ~{Math.max(0, result.expectedWeeklyLoss).toFixed(2)} kg
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impact Assessment */}
                  <div className={`alert ${
                    result.expectedWeeklyLoss >= 0.4 ? "alert-success" :
                    result.expectedWeeklyLoss >= 0.2 ? "alert-info" :
                    result.expectedWeeklyLoss > 0 ? "alert-warning" : "alert-error"
                  }`}>
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
                      <p className="font-semibold">Auswirkung: {result.cheatDayImpact}</p>
                      <p className="text-sm">{result.strategy}</p>
                    </div>
                  </div>

                  {/* Visual Week Planner */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="font-bold text-lg mb-4">📅 Beispiel-Wochenplan</h3>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => (
                          <div key={day} className="text-xs font-bold opacity-60">{day}</div>
                        ))}
                        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => {
                          const isCheatDay = day === "Sa";
                          return (
                            <div
                              key={`cal-${day}`}
                              className={`py-2 rounded text-xs font-bold ${
                                isCheatDay
                                  ? "bg-primary text-primary-content"
                                  : "bg-base-100"
                              }`}
                            >
                              {isCheatDay ? "🍕" : result.normalDayCalories}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs opacity-60 text-center mt-2">
                        Wähle deinen Cheat-Day flexibel – Samstag ist nur ein Beispiel!
                      </p>
                    </div>
                  </div>

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
                      <p className="font-semibold">Tracke auch deinen Cheat-Day!</p>
                      <p className="text-sm">
                        Mit Mahlzait einfach per Foto tracken – auch wenn es Pizza ist! 📸
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cheat Day Foods Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              🍕 Typische Cheat-Day Kalorien
            </h2>
            <div className="grid gap-3 md:grid-cols-4 max-w-3xl mx-auto">
              {cheatDayFoods.map((item, i) => (
                <div key={i} className="card bg-base-100 shadow">
                  <div className="card-body py-4 text-center">
                    <span className="text-4xl">{item.emoji}</span>
                    <h3 className="font-bold text-sm">{item.food}</h3>
                    <span className="text-lg font-bold text-primary">{item.kcal} kcal</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm opacity-60 mt-4">
              Werte sind Richtwerte und variieren je nach Zubereitung und Portionsgrösse
            </p>
          </div>
        </section>

        {/* Smart Tips */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              💡 Smarte Cheat-Day Tipps
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {smartTips.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-base-100 rounded-lg shadow">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-medium">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              ⚠️ Häufige Cheat-Day Fehler
            </h2>
            <div className="grid gap-4 max-w-2xl mx-auto">
              {cheatDayMistakes.map((item, i) => (
                <div key={i} className="card bg-error/10 border-l-4 border-error">
                  <div className="card-body py-4">
                    <h3 className="font-bold text-error">{item.mistake}</h3>
                    <p className="text-sm opacity-80">{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* When Cheat Days Make Sense */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Für wen sind Cheat-Days sinnvoll?
            </h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="card bg-success/10 border-2 border-success">
                <div className="card-body">
                  <h3 className="card-title text-success">✓ Gut geeignet für:</h3>
                  <ul className="space-y-2 mt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Menschen, die wochentags strikt sein können</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Wer psychisch von "erlaubten" Tagen profitiert</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Sportler mit hohem Kalorienverbrauch</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Wer soziale Events geniesst (Geburtstage, Feiern)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card bg-error/10 border-2 border-error">
                <div className="card-body">
                  <h3 className="card-title text-error">✗ Weniger geeignet für:</h3>
                  <ul className="space-y-2 mt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-error">✗</span>
                      <span>Menschen mit Binge-Eating-Neigung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error">✗</span>
                      <span>Wer nach einem Cheat-Day nicht aufhören kann</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error">✗</span>
                      <span>Bei sehr niedrigem Kalorienbudget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error">✗</span>
                      <span>Geschichte von Essstörungen</span>
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
              Häufig gestellte Fragen zu Cheat-Days
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Zerstört ein Cheat-Day meinen Fortschritt?",
                  a: "Nein, wenn er geplant ist! Ein einzelner Tag kann maximal ~500g echtes Fett aufbauen (selbst bei 4000 kcal Überschuss). Das meiste Gewicht am nächsten Tag ist Wasser und verschwindet in 2-3 Tagen.",
                },
                {
                  q: "Wie oft sollte ich einen Cheat-Day einlegen?",
                  a: "Das hängt von deinem Ziel und deiner Psyche ab. Für die meisten funktioniert 1x pro Woche oder alle 2 Wochen gut. Häufigere Cheat-Days verlangsamen den Fortschritt deutlich.",
                },
                {
                  q: "Sollte ich am Tag danach weniger essen?",
                  a: "Nein! Kehre einfach zu deinem normalen Plan zurück. Ausgleichs-Hungern führt zu einem ungesunden Teufelskreis und ist kontraproduktiv.",
                },
                {
                  q: "Kann ich auch nur eine Cheat-Mahlzeit machen?",
                  a: "Absolut! Eine Cheat-Mahlzeit statt eines ganzen Tages ist oft die bessere Option. Du geniesst etwas Besonderes, ohne komplett über die Stränge zu schlagen.",
                },
                {
                  q: "Was esse ich am besten an einem Cheat-Day?",
                  a: "Was immer du vermisst! Der psychologische Aspekt ist wichtig. Ob Pizza, Burger, Eis oder Schokolade – geniesse es ohne Schuldgefühle.",
                },
                {
                  q: "Soll ich meinen Cheat-Day tracken?",
                  a: "Optional, aber empfohlen! Es hilft, ein Gefühl für die Mengen zu behalten und verhindert, dass aus 2000 Extra-Kalorien 5000 werden.",
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
              Auch am Cheat-Day im Blick behalten, was du isst – einfach per Foto! Keine Schuldgefühle, nur Transparenz.
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
              <a href="/doener-kalorien-rechner" className="btn btn-outline">
                Döner Kalorien Rechner
              </a>
              <a href="/alkohol-kalorien-rechner" className="btn btn-outline">
                Alkohol Kalorien Rechner
              </a>
              <a href="/intervallfasten-rechner" className="btn btn-outline">
                Intervallfasten Rechner
              </a>
              <a href="/rechner" className="btn btn-outline">
                Alle Rechner
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

export default CheatDayRechnerPage;
