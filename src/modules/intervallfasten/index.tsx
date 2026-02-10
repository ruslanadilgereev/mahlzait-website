import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

type FastingMethod = "16-8" | "18-6" | "20-4" | "5-2" | "eat-stop-eat" | "custom";

interface FastingSchedule {
  method: FastingMethod;
  fastingHours: number;
  eatingHours: number;
  eatingStart: string;
  eatingEnd: string;
  fastingStart: string;
  fastingEnd: string;
  calorieWindow: number;
  mealsRecommended: number;
}

function IntervallfastenRechnerPage({ config }: Props) {
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [method, setMethod] = useState<FastingMethod>("16-8");
  const [customFastingHours, setCustomFastingHours] = useState(16);
  const [preferEarlyEating, setPreferEarlyEating] = useState(true);
  const [goal, setGoal] = useState<"weight-loss" | "maintenance" | "muscle">("weight-loss");
  const [result, setResult] = useState<FastingSchedule | null>(null);

  const fastingMethods: Record<FastingMethod, { name: string; fastHours: number; eatHours: number; desc: string; emoji: string; difficulty: string }> = {
    "16-8": { name: "16:8", fastHours: 16, eatHours: 8, desc: "Klassiker für Einsteiger", emoji: "🌟", difficulty: "Leicht" },
    "18-6": { name: "18:6", fastHours: 18, eatHours: 6, desc: "Fortgeschrittene", emoji: "💪", difficulty: "Mittel" },
    "20-4": { name: "20:4 (Warrior)", fastHours: 20, eatHours: 4, desc: "Eine grosse Mahlzeit", emoji: "⚔️", difficulty: "Schwer" },
    "5-2": { name: "5:2 Diät", fastHours: 0, eatHours: 24, desc: "2 Fastentage pro Woche", emoji: "📅", difficulty: "Mittel" },
    "eat-stop-eat": { name: "Eat-Stop-Eat", fastHours: 24, eatHours: 0, desc: "1-2x 24h Fasten pro Woche", emoji: "⏰", difficulty: "Schwer" },
    "custom": { name: "Eigene Zeiten", fastHours: customFastingHours, eatHours: 24 - customFastingHours, desc: "Individuell anpassen", emoji: "⚙️", difficulty: "Variabel" },
  };

  const addHours = (time: string, hours: number): string => {
    const [h, m] = time.split(":").map(Number);
    const totalMinutes = (h * 60 + m + hours * 60) % (24 * 60);
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  };

  const calculateSchedule = () => {
    const methodInfo = fastingMethods[method];
    const fastHours = method === "custom" ? customFastingHours : methodInfo.fastHours;
    const eatHours = method === "custom" ? 24 - customFastingHours : methodInfo.eatHours;

    // Skip time-based calculation for 5:2 method
    if (method === "5-2") {
      setResult({
        method,
        fastingHours: 0,
        eatingHours: 24,
        eatingStart: wakeUpTime,
        eatingEnd: sleepTime,
        fastingStart: "-",
        fastingEnd: "-",
        calorieWindow: goal === "weight-loss" ? 500 : 600,
        mealsRecommended: 2,
      });
      return;
    }

    let eatingStart: string;
    let eatingEnd: string;

    if (preferEarlyEating) {
      // Early eating: Start eating 1-2 hours after waking
      eatingStart = addHours(wakeUpTime, 1);
      eatingEnd = addHours(eatingStart, eatHours);
    } else {
      // Late eating: End eating 2-3 hours before sleep
      eatingEnd = addHours(sleepTime, -2);
      eatingStart = addHours(eatingEnd, -eatHours);
    }

    const fastingStart = eatingEnd;
    const fastingEnd = eatingStart;

    // Meals based on eating window
    let mealsRecommended = 3;
    if (eatHours <= 4) mealsRecommended = 1;
    else if (eatHours <= 6) mealsRecommended = 2;
    else if (eatHours <= 8) mealsRecommended = 2;

    setResult({
      method,
      fastingHours: fastHours,
      eatingHours: eatHours,
      eatingStart,
      eatingEnd,
      fastingStart,
      fastingEnd,
      calorieWindow: eatHours,
      mealsRecommended,
    });
  };

  const formatTime = (time: string): string => {
    const [h, m] = time.split(":");
    return `${h}:${m} Uhr`;
  };

  const benefits = [
    { title: "Fettverbrennung", desc: "Nach 12-16h Fasten nutzt der Körper Fett als Energiequelle", emoji: "🔥" },
    { title: "Autophagie", desc: "Zellerneuerung und \"Aufräumprozesse\" werden aktiviert", emoji: "🧬" },
    { title: "Insulinsensitivität", desc: "Verbesserte Blutzuckerkontrolle und Hormonbalance", emoji: "💉" },
    { title: "Mentale Klarheit", desc: "Viele berichten von besserer Konzentration im gefasteten Zustand", emoji: "🧠" },
    { title: "Einfachheit", desc: "Weniger Mahlzeiten = weniger Planung und Entscheidungen", emoji: "✨" },
    { title: "Langlebigkeit", desc: "Studien zeigen positive Effekte auf Alterungsprozesse", emoji: "⏳" },
  ];

  const tips = [
    { tip: "Viel Wasser, Tee und schwarzen Kaffee während des Fastens trinken", icon: "💧" },
    { tip: "Langsam starten – erst 12:12, dann steigern", icon: "🐢" },
    { tip: "Elektrolyte bei längeren Fastenperioden supplementieren", icon: "⚡" },
    { tip: "Erste Mahlzeit nicht zu gross – der Magen muss sich gewöhnen", icon: "🍽️" },
    { tip: "Sport ist auch im gefasteten Zustand möglich", icon: "🏃" },
    { tip: "Bei Schwindel oder Unwohlsein das Fasten unterbrechen", icon: "⚠️" },
  ];

  const allowedDuringFast = [
    { item: "Wasser", allowed: true, emoji: "💧" },
    { item: "Schwarzer Kaffee", allowed: true, emoji: "☕" },
    { item: "Ungesüsster Tee", allowed: true, emoji: "🍵" },
    { item: "Kaffee mit Milch", allowed: false, emoji: "🥛" },
    { item: "Kaugummi (zuckerfrei)", allowed: true, emoji: "🫧", note: "umstritten" },
    { item: "Süssgetränke", allowed: false, emoji: "🥤" },
    { item: "Brühe (klar)", allowed: true, emoji: "🍲", note: "bei längeren Fasten" },
    { item: "Smoothies", allowed: false, emoji: "🥤" },
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
              Intervallfasten-Rechner ⏰
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen optimalen Fasten- und Essensplan. Finde die perfekte Methode für deinen Alltag und Ziele!
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">⏰ Fasten-Zeitplan berechnen</h2>

              {/* Fasting Method */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Fasten-Methode wählen</span>
                <div className="grid gap-2">
                  {Object.entries(fastingMethods).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        method === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        className="radio radio-primary"
                        checked={method === key}
                        onChange={() => setMethod(key as FastingMethod)}
                      />
                      <span className="text-2xl">{value.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{value.name}</span>
                          <span className={`badge badge-sm ${
                            value.difficulty === "Leicht" ? "badge-success" :
                            value.difficulty === "Mittel" ? "badge-warning" :
                            value.difficulty === "Schwer" ? "badge-error" : "badge-ghost"
                          }`}>
                            {value.difficulty}
                          </span>
                        </div>
                        <span className="text-sm opacity-70">{value.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Hours Slider */}
              {method === "custom" && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold">Fastenstunden</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">{customFastingHours}</span>
                      <span className="text-xl font-medium opacity-70">Stunden</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="23"
                    value={customFastingHours}
                    onChange={(e) => setCustomFastingHours(Number(e.target.value))}
                    className="range range-primary range-lg"
                  />
                  <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                    <span>12h</span>
                    <span>16h</span>
                    <span>20h</span>
                    <span>23h</span>
                  </div>
                </div>
              )}

              {method !== "5-2" && method !== "eat-stop-eat" && (
                <>
                  {/* Wake-up and Sleep Times */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <label className="text-sm font-semibold block mb-2">🌅 Aufstehzeit</label>
                      <input
                        type="time"
                        value={wakeUpTime}
                        onChange={(e) => setWakeUpTime(e.target.value)}
                        className="input input-bordered w-full text-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-2">🌙 Schlafenszeit</label>
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="input input-bordered w-full text-lg"
                      />
                    </div>
                  </div>

                  {/* Eating Preference */}
                  <div className="mb-8">
                    <span className="text-lg font-semibold block mb-4">Essensfenster-Präferenz</span>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                          preferEarlyEating
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-base-200 border-2 border-transparent hover:border-base-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="preference"
                          className="radio radio-primary mb-2"
                          checked={preferEarlyEating}
                          onChange={() => setPreferEarlyEating(true)}
                        />
                        <span className="text-3xl mb-1">🌅</span>
                        <span className="font-medium">Früh essen</span>
                        <span className="text-xs opacity-70">Frühstück & Mittagessen</span>
                      </label>
                      <label
                        className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                          !preferEarlyEating
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-base-200 border-2 border-transparent hover:border-base-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="preference"
                          className="radio radio-primary mb-2"
                          checked={!preferEarlyEating}
                          onChange={() => setPreferEarlyEating(false)}
                        />
                        <span className="text-3xl mb-1">🌙</span>
                        <span className="font-medium">Spät essen</span>
                        <span className="text-xs opacity-70">Mittag- & Abendessen</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Goal */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Dein Ziel</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "weight-loss", label: "Abnehmen", emoji: "🔥" },
                    { key: "maintenance", label: "Halten", emoji: "⚖️" },
                    { key: "muscle", label: "Aufbauen", emoji: "💪" },
                  ].map((g) => (
                    <label
                      key={g.key}
                      className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all text-center ${
                        goal === g.key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        className="radio radio-primary radio-sm mb-1"
                        checked={goal === g.key}
                        onChange={() => setGoal(g.key as typeof goal)}
                      />
                      <span className="text-2xl">{g.emoji}</span>
                      <span className="text-sm font-medium">{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateSchedule}>
                ⏰ Zeitplan berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Fasten-Zeitplan</div>

                  {method === "5-2" ? (
                    <div className="text-center py-6">
                      <div className="text-5xl mb-4">📅</div>
                      <h3 className="text-2xl font-bold mb-4">5:2 Methode</h3>
                      <p className="opacity-80 max-w-md mx-auto">
                        Esse 5 Tage normal und faste an 2 nicht aufeinanderfolgenden Tagen (z.B. Montag & Donnerstag).
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto">
                        <div className="card bg-base-200">
                          <div className="card-body py-4 text-center">
                            <h4 className="text-sm opacity-70">Normale Tage</h4>
                            <p className="text-2xl font-bold text-success">5 Tage</p>
                            <p className="text-xs opacity-60">Normal essen</p>
                          </div>
                        </div>
                        <div className="card bg-base-200">
                          <div className="card-body py-4 text-center">
                            <h4 className="text-sm opacity-70">Fastentage</h4>
                            <p className="text-2xl font-bold text-primary">2 Tage</p>
                            <p className="text-xs opacity-60">Max. {result.calorieWindow} kcal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : method === "eat-stop-eat" ? (
                    <div className="text-center py-6">
                      <div className="text-5xl mb-4">⏰</div>
                      <h3 className="text-2xl font-bold mb-4">Eat-Stop-Eat</h3>
                      <p className="opacity-80 max-w-md mx-auto">
                        1-2 komplette 24-Stunden-Fastenperioden pro Woche. Von Abendessen zu Abendessen oder Mittag zu Mittag.
                      </p>
                      <div className="card bg-base-200 mt-6 max-w-sm mx-auto">
                        <div className="card-body py-4 text-center">
                          <h4 className="text-sm opacity-70">Beispiel-Schema</h4>
                          <p className="text-lg font-bold">
                            Sonntag 19:00 → Montag 19:00
                          </p>
                          <p className="text-xs opacity-60">24 Stunden komplettes Fasten</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Visual Timeline */}
                      <div className="relative bg-base-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm opacity-70">00:00</span>
                          <span className="text-sm opacity-70">06:00</span>
                          <span className="text-sm opacity-70">12:00</span>
                          <span className="text-sm opacity-70">18:00</span>
                          <span className="text-sm opacity-70">24:00</span>
                        </div>
                        <div className="h-12 bg-error/30 rounded-full relative overflow-hidden">
                          {/* Eating window visualization */}
                          <div
                            className="absolute h-full bg-success rounded-full"
                            style={{
                              left: `${(parseInt(result.eatingStart.split(":")[0]) / 24) * 100}%`,
                              width: `${(result.eatingHours / 24) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-center gap-8 mt-4 text-sm">
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-success rounded-full" />
                            Essensfenster
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-error/30 rounded-full" />
                            Fastenzeit
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 mt-6">
                        <div className="card bg-success/10 border-2 border-success">
                          <div className="card-body py-6 text-center">
                            <span className="text-4xl mb-2">🍽️</span>
                            <h3 className="text-lg font-bold text-success">Essensfenster</h3>
                            <p className="text-3xl font-bold">
                              {formatTime(result.eatingStart)} – {formatTime(result.eatingEnd)}
                            </p>
                            <p className="text-lg opacity-80">{result.eatingHours} Stunden</p>
                            <p className="text-sm opacity-60 mt-2">
                              Empfohlen: {result.mealsRecommended} Mahlzeit{result.mealsRecommended > 1 ? "en" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="card bg-error/10 border-2 border-error">
                          <div className="card-body py-6 text-center">
                            <span className="text-4xl mb-2">⏸️</span>
                            <h3 className="text-lg font-bold text-error">Fastenzeit</h3>
                            <p className="text-3xl font-bold">
                              {formatTime(result.fastingStart)} – {formatTime(result.fastingEnd)}
                            </p>
                            <p className="text-lg opacity-80">{result.fastingHours} Stunden</p>
                            <p className="text-sm opacity-60 mt-2">
                              Nur Wasser, Tee, schwarzer Kaffee
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Goal-specific tip */}
                      <div className={`alert mt-4 ${
                        goal === "weight-loss" ? "alert-warning" :
                        goal === "muscle" ? "alert-info" : "alert-success"
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
                          {goal === "weight-loss" && (
                            <>
                              <p className="font-semibold">Tipp zum Abnehmen:</p>
                              <p className="text-sm">
                                Achte auf ein leichtes Kaloriendefizit innerhalb deines Essensfensters. Intervallfasten allein führt nicht automatisch zur Abnahme!
                              </p>
                            </>
                          )}
                          {goal === "muscle" && (
                            <>
                              <p className="font-semibold">Tipp zum Muskelaufbau:</p>
                              <p className="text-sm">
                                Achte auf ausreichend Protein (1.6-2.2g/kg) und trainiere idealerweise während oder kurz vor dem Essensfenster.
                              </p>
                            </>
                          )}
                          {goal === "maintenance" && (
                            <>
                              <p className="font-semibold">Tipp zum Gewicht halten:</p>
                              <p className="text-sm">
                                Intervallfasten kann die Kalorienkontrolle erleichtern. Höre auf deinen Körper und iss dich satt!
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}

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
                      <p className="font-semibold">Tracke deine Mahlzeiten!</p>
                      <p className="text-sm">
                        Mit Mahlzait kannst du einfach per Foto tracken, was du isst – perfekt für dein Essensfenster.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* What's Allowed Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was ist während des Fastens erlaubt?
            </h2>
            <div className="grid gap-4 md:grid-cols-4 max-w-3xl mx-auto">
              {allowedDuringFast.map((item, i) => (
                <div
                  key={i}
                  className={`card shadow-xl ${item.allowed ? "bg-success/10" : "bg-error/10"}`}
                >
                  <div className="card-body py-4 text-center">
                    <span className="text-3xl">{item.emoji}</span>
                    <h3 className="font-bold">{item.item}</h3>
                    <span className={`badge ${item.allowed ? "badge-success" : "badge-error"}`}>
                      {item.allowed ? "✓ Erlaubt" : "✗ Bricht Fasten"}
                    </span>
                    {item.note && <span className="text-xs opacity-60">{item.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Vorteile von Intervallfasten
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{benefit.emoji}</span>
                      <h3 className="card-title">{benefit.title}</h3>
                    </div>
                    <p className="opacity-80">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              💡 Tipps für erfolgreiches Intervallfasten
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {tips.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-base-100 rounded-lg shadow">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-medium">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Welche Methode passt zu mir?
            </h2>
            <div className="overflow-x-auto">
              <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
                <div className="card bg-base-100 shadow-xl border-2 border-success">
                  <div className="card-body text-center">
                    <span className="badge badge-success mx-auto mb-2">Einsteiger</span>
                    <h3 className="card-title justify-center">16:8</h3>
                    <ul className="text-left text-sm space-y-2 mt-4">
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Einfach in den Alltag integrierbar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Frühstück auslassen reicht oft</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Gut für Berufstätige</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Sozial kompatibel</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl border-2 border-warning">
                  <div className="card-body text-center">
                    <span className="badge badge-warning mx-auto mb-2">Fortgeschritten</span>
                    <h3 className="card-title justify-center">18:6 / 5:2</h3>
                    <ul className="text-left text-sm space-y-2 mt-4">
                      <li className="flex items-start gap-2">
                        <span className="text-warning">✓</span>
                        <span>Stärkere Autophagie-Effekte</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning">✓</span>
                        <span>Mehr Flexibilität (5:2)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning">✓</span>
                        <span>2 volle Mahlzeiten möglich</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning">!</span>
                        <span>Gewöhnungszeit nötig</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl border-2 border-error">
                  <div className="card-body text-center">
                    <span className="badge badge-error mx-auto mb-2">Experten</span>
                    <h3 className="card-title justify-center">20:4 / OMAD</h3>
                    <ul className="text-left text-sm space-y-2 mt-4">
                      <li className="flex items-start gap-2">
                        <span className="text-error">✓</span>
                        <span>Maximale Autophagie</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-error">✓</span>
                        <span>Zeitersparnis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-error">!</span>
                        <span>Schwierig genug Nährstoffe zu bekommen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-error">!</span>
                        <span>Nicht für jeden geeignet</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum Intervallfasten
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Was ist Intervallfasten?",
                  a: "Intervallfasten (Intermittent Fasting) ist ein Ernährungsrhythmus, bei dem sich Ess- und Fastenperioden abwechseln. Es geht nicht darum, WAS du isst, sondern WANN du isst.",
                },
                {
                  q: "Wie schnell kann ich mit Intervallfasten abnehmen?",
                  a: "Die Abnahme hängt vom Kaloriendefizit ab, nicht vom Fasten selbst. Intervallfasten kann helfen, die Kalorienzufuhr zu reduzieren. Realistisch sind 0.5-1kg pro Woche bei einem moderaten Defizit.",
                },
                {
                  q: "Kann ich während des Fastens Sport machen?",
                  a: "Ja! Viele trainieren sogar lieber nüchtern. Bei intensiven Einheiten kann es sinnvoll sein, kurz vor oder während des Essensfensters zu trainieren, um danach Protein zuzuführen.",
                },
                {
                  q: "Bricht Kaffee mit Milch das Fasten?",
                  a: "Technisch ja – Milch enthält Kalorien und Proteine, die Verdauungsprozesse auslösen. Für Anfänger ist ein Schuss Milch ok, Puristen trinken schwarz.",
                },
                {
                  q: "Ist Intervallfasten für jeden geeignet?",
                  a: "Nein. Schwangere, Stillende, Menschen mit Essstörungen (aktuell oder in der Vergangenheit), Diabetiker und Untergewichtige sollten vorher einen Arzt konsultieren.",
                },
                {
                  q: "Verliere ich Muskeln beim Intervallfasten?",
                  a: "Bei ausreichend Proteinzufuhr (1.6-2.2g/kg) und Krafttraining nicht. Kurzzeitiges Fasten erhöht sogar das Wachstumshormon, was muskelschützend wirkt.",
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
              Intervallfasten funktioniert am besten mit bewusstem Essen. Mit Mahlzait trackst du Kalorien und Makros – einfach per Foto!
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
              <a href="/wasserbedarf-rechner" className="btn btn-outline">
                Wasserbedarf Rechner
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

export default IntervallfastenRechnerPage;
