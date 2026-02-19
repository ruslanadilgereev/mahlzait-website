import { useState, useMemo } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

type Mode = "wake" | "sleep";

interface SleepTime {
  time: string;
  cycles: number;
  hours: number;
  quality: "optimal" | "good" | "acceptable";
}

const CYCLE_DURATION = 90; // minutes
const FALL_ASLEEP_TIME = 15; // minutes to fall asleep

function formatTime(date: Date): string {
  return date.toLocaleTimeString("de-DE", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false 
  });
}

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

function SchlafRechnerPage({ config }: Props) {
  const [mode, setMode] = useState<Mode>("wake");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [showResults, setShowResults] = useState(false);

  const results = useMemo<SleepTime[]>(() => {
    if (mode === "wake") {
      // Calculate bedtimes for target wake time
      const wake = parseTime(wakeTime);
      const times: SleepTime[] = [];
      
      for (let cycles = 6; cycles >= 3; cycles--) {
        const sleepDuration = cycles * CYCLE_DURATION;
        const bedtime = subtractMinutes(wake, sleepDuration + FALL_ASLEEP_TIME);
        
        times.push({
          time: formatTime(bedtime),
          cycles,
          hours: sleepDuration / 60,
          quality: cycles >= 5 ? "optimal" : cycles >= 4 ? "good" : "acceptable",
        });
      }
      
      return times;
    } else {
      // Calculate wake times for bedtime
      const sleep = parseTime(sleepTime);
      const times: SleepTime[] = [];
      
      for (let cycles = 4; cycles <= 7; cycles++) {
        const sleepDuration = cycles * CYCLE_DURATION;
        const wakeUp = addMinutes(sleep, sleepDuration + FALL_ASLEEP_TIME);
        
        times.push({
          time: formatTime(wakeUp),
          cycles,
          hours: sleepDuration / 60,
          quality: cycles >= 5 ? "optimal" : cycles >= 4 ? "good" : "acceptable",
        });
      }
      
      return times;
    }
  }, [mode, wakeTime, sleepTime]);

  const handleCalculate = () => {
    setShowResults(true);
  };

  const sleepTips = [
    { 
      icon: "🌙", 
      title: "Dunkles Zimmer", 
      text: "Nutze Verdunkelungsvorhänge oder eine Schlafmaske. Licht stört die Melatonin-Produktion." 
    },
    { 
      icon: "📱", 
      title: "Kein Blaulicht", 
      text: "Vermeide Bildschirme 1-2 Stunden vor dem Schlafen. Nutze den Nachtmodus." 
    },
    { 
      icon: "☕", 
      title: "Koffein-Stopp", 
      text: "Kein Kaffee oder Energy Drinks nach 14 Uhr. Koffein wirkt bis zu 8 Stunden." 
    },
    { 
      icon: "🌡️", 
      title: "Kühle Temperatur", 
      text: "16-18°C sind ideal. Der Körper muss abkühlen, um einzuschlafen." 
    },
    { 
      icon: "⏰", 
      title: "Feste Zeiten", 
      text: "Geh jeden Tag zur gleichen Zeit ins Bett – auch am Wochenende." 
    },
    { 
      icon: "🍽️", 
      title: "Leichtes Abendessen", 
      text: "Schwere Mahlzeiten belasten die Verdauung. Iss 2-3 Stunden vor dem Schlaf." 
    },
  ];

  const qualityBadge = (quality: SleepTime["quality"]) => {
    switch (quality) {
      case "optimal":
        return <span className="badge badge-success gap-1">★ Optimal</span>;
      case "good":
        return <span className="badge badge-info gap-1">✓ Gut</span>;
      case "acceptable":
        return <span className="badge badge-warning gap-1">○ Akzeptabel</span>;
    }
  };

  const cycleVisualization = (cycles: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-6 rounded-sm transition-all ${
              i < cycles
                ? cycles >= 5
                  ? "bg-success"
                  : cycles >= 4
                  ? "bg-info"
                  : "bg-warning"
                : "bg-base-300"
            }`}
          />
        ))}
      </div>
    );
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
              Schlaf-Rechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deine optimalen Schlaf- und Aufwachzeiten basierend auf 
              90-Minuten-Schlafzyklen. Wach erfrischt auf statt mitten im Tiefschlaf.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto overflow-hidden">
            {/* Mode Toggle with Gradient Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  className={`btn btn-lg flex-1 transition-all ${
                    mode === "wake"
                      ? "bg-white text-indigo-600 hover:bg-white/90 border-0"
                      : "btn-ghost bg-white/10 hover:bg-white/20 border-white/30"
                  }`}
                  onClick={() => { setMode("wake"); setShowResults(false); }}
                >
                  <span className="text-2xl mr-2">⏰</span>
                  Ich muss aufstehen um...
                </button>
                <button
                  className={`btn btn-lg flex-1 transition-all ${
                    mode === "sleep"
                      ? "bg-white text-indigo-600 hover:bg-white/90 border-0"
                      : "btn-ghost bg-white/10 hover:bg-white/20 border-white/30"
                  }`}
                  onClick={() => { setMode("sleep"); setShowResults(false); }}
                >
                  <span className="text-2xl mr-2">🌙</span>
                  Ich gehe schlafen um...
                </button>
              </div>
            </div>

            <div className="card-body p-6 md:p-8">
              {/* Time Input */}
              <div className="mb-8">
                <label className="block text-center mb-4">
                  <span className="text-lg font-semibold">
                    {mode === "wake" ? "Gewünschte Aufwachzeit" : "Geplante Schlafenszeit"}
                  </span>
                </label>
                <div className="flex justify-center">
                  <input
                    type="time"
                    value={mode === "wake" ? wakeTime : sleepTime}
                    onChange={(e) => {
                      if (mode === "wake") {
                        setWakeTime(e.target.value);
                      } else {
                        setSleepTime(e.target.value);
                      }
                      setShowResults(false);
                    }}
                    className="input input-bordered input-lg text-4xl font-bold text-center w-48 text-primary"
                  />
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-base-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium">So funktioniert's:</p>
                    <p className="text-sm opacity-80">
                      Ein Schlafzyklus dauert ca. 90 Minuten. Der Rechner berücksichtigt auch 
                      ~15 Minuten Einschlafzeit. Am besten aufwachen tust du am Ende eines Zyklus.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-lg w-full text-lg"
                onClick={handleCalculate}
              >
                {mode === "wake" ? "Optimale Schlafenszeiten berechnen" : "Optimale Aufwachzeiten berechnen"}
              </button>

              {/* Results */}
              {showResults && (
                <div className="mt-8 space-y-4">
                  <div className="divider">
                    {mode === "wake" ? "Geh schlafen um..." : "Weck dich um..."}
                  </div>

                  <p className="text-center text-sm opacity-70 mb-4">
                    Wähle die Zeit, die am besten zu deinem Zeitplan passt. 
                    {mode === "wake" 
                      ? " Je früher du ins Bett gehst, desto mehr Zyklen bekommst du."
                      : " Mehr Zyklen = erholsamerer Schlaf."}
                  </p>

                  <div className="space-y-3">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                          result.quality === "optimal"
                            ? "border-success bg-success/5"
                            : result.quality === "good"
                            ? "border-info bg-info/5"
                            : "border-warning bg-warning/5"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-primary">
                              {result.time}
                            </div>
                            <div>
                              {qualityBadge(result.quality)}
                              <p className="text-sm opacity-70 mt-1">
                                {result.hours} Std. Schlaf · {result.cycles} Zyklen
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs opacity-50">Schlafzyklen</span>
                            {cycleVisualization(result.cycles)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation */}
                  <div className="alert bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 mt-6">
                    <span className="text-3xl">✨</span>
                    <div>
                      <p className="font-semibold">Empfehlung</p>
                      <p className="text-sm opacity-80">
                        {mode === "wake" 
                          ? "Versuche 5-6 Schlafzyklen (7.5-9 Stunden) zu bekommen. Das ist für die meisten Erwachsenen ideal."
                          : "Die meisten Erwachsenen brauchen 5-6 Zyklen. Wähle eine Zeit, die dir mindestens 7.5 Stunden Schlaf gibt."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sleep Cycles Explanation */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Was sind Schlafzyklen?
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-12">
              Dein Schlaf besteht aus mehreren 90-Minuten-Zyklen. Jeder Zyklus durchläuft 
              verschiedene Phasen – von leichtem Schlaf bis zum Tiefschlaf und REM-Schlaf.
            </p>

            {/* Visual Sleep Cycle */}
            <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto overflow-hidden">
              <div className="card-body">
                <div className="relative">
                  {/* Sleep Phase Visualization */}
                  <div className="flex flex-col gap-2">
                    {[
                      { phase: "Wach", width: "5%", color: "bg-warning", desc: "Übergang" },
                      { phase: "Leichtschlaf (N1-N2)", width: "45%", color: "bg-info", desc: "~45 Min pro Zyklus" },
                      { phase: "Tiefschlaf (N3)", width: "25%", color: "bg-primary", desc: "Körperliche Erholung" },
                      { phase: "REM-Schlaf", width: "25%", color: "bg-secondary", desc: "Träumen, Gedächtnis" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium">{item.phase}</div>
                        <div className="flex-1 h-8 bg-base-200 rounded-lg overflow-hidden">
                          <div 
                            className={`h-full ${item.color} rounded-lg flex items-center justify-center text-xs text-white font-medium`}
                            style={{ width: item.width }}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-base-200 rounded-xl">
                    <p className="text-sm">
                      <strong>Warum aufwachen am Ende eines Zyklus?</strong><br />
                      Wenn du mitten im Tiefschlaf geweckt wirst, fühlst du dich benommen 
                      und müde – das nennt man "Sleep Inertia". Aufwachen nach einem kompletten 
                      Zyklus (während der leichten Schlafphase) lässt dich erfrischt fühlen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cycle Count Recommendations */}
            <div className="grid gap-4 md:grid-cols-3 mt-8 max-w-3xl mx-auto">
              <div className="card bg-base-100 shadow">
                <div className="card-body text-center py-6">
                  <div className="text-4xl mb-2">😴</div>
                  <h3 className="font-bold">4 Zyklen</h3>
                  <p className="text-2xl font-bold text-warning">6 Stunden</p>
                  <p className="text-sm opacity-70">Minimum für Erwachsene</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow border-2 border-success">
                <div className="card-body text-center py-6">
                  <div className="text-4xl mb-2">💪</div>
                  <h3 className="font-bold">5-6 Zyklen</h3>
                  <p className="text-2xl font-bold text-success">7.5-9 Stunden</p>
                  <p className="text-sm opacity-70">Ideal für die meisten</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow">
                <div className="card-body text-center py-6">
                  <div className="text-4xl mb-2">👶</div>
                  <h3 className="font-bold">7+ Zyklen</h3>
                  <p className="text-2xl font-bold text-info">10.5+ Stunden</p>
                  <p className="text-sm opacity-70">Teenager & Kinder</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sleep Tips */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Tipps für besseren Schlaf
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-12">
              Optimale Schlafzeiten sind nur die halbe Miete. 
              Diese Gewohnheiten verbessern deine Schlafqualität zusätzlich.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sleepTips.map((tip, index) => (
                <div key={index} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{tip.icon}</span>
                      <h3 className="font-bold">{tip.title}</h3>
                    </div>
                    <p className="text-sm opacity-80">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sleep & Weight Connection */}
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Schlaf & Gewicht: Die unterschätzte Verbindung
                </h2>
                <p className="opacity-90 mb-6">
                  Zu wenig Schlaf beeinflusst deine Hormone – und damit auch dein Gewicht. 
                  Schlafmangel erhöht Ghrelin (Hunger-Hormon) und senkt Leptin (Sättigungs-Hormon).
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">📈</span>
                    <span>Schlafmangel erhöht das Risiko für Übergewicht um bis zu 55%</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">🍔</span>
                    <span>Müde Menschen essen durchschnittlich 385 kcal mehr pro Tag</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">💪</span>
                    <span>Ausreichend Schlaf verbessert Muskelaufbau und Regeneration</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-4">Tracke beides mit Mahlzait</h3>
                <p className="opacity-90 mb-4">
                  Ernährung und Schlaf gehören zusammen. Mit Mahlzait trackst du deine 
                  Kalorien und Makros in Sekunden – für ein ganzheitliches Bild deiner Gesundheit.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={config.appStoreLink} className="btn bg-white text-indigo-600 hover:bg-white/90">
                    iOS App
                  </a>
                  <a href={config.googlePlayLink} className="btn bg-white text-indigo-600 hover:bg-white/90">
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
              Häufig gestellte Fragen zum Schlaf
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie viele Stunden Schlaf brauche ich?",
                  a: "Die meisten Erwachsenen (18-64 Jahre) brauchen 7-9 Stunden Schlaf. Teenager brauchen 8-10 Stunden, ältere Erwachsene (65+) oft nur 7-8 Stunden. Wichtiger als die Dauer ist aber, am Ende eines Schlafzyklus aufzuwachen.",
                },
                {
                  q: "Warum 90 Minuten pro Schlafzyklus?",
                  a: "90 Minuten ist der Durchschnittswert für einen kompletten Schlafzyklus (Leichtschlaf → Tiefschlaf → REM). Der Wert kann individuell zwischen 80-120 Minuten variieren. Probiere verschiedene Zeiten aus, um deinen persönlichen Rhythmus zu finden.",
                },
                {
                  q: "Ist es schlimm, wenn ich nicht sofort einschlafe?",
                  a: "Unser Rechner kalkuliert bereits 15 Minuten Einschlafzeit ein. Wenn du regelmäßig länger brauchst, passe deine Schlafenszeit entsprechend an. Bei dauerhaften Einschlafproblemen kann ein Schlaftagebuch oder ärztliche Beratung helfen.",
                },
                {
                  q: "Kann ich Schlaf am Wochenende nachholen?",
                  a: "'Social Jetlag' – also unter der Woche wenig und am Wochenende viel schlafen – stört deinen Biorhythmus. Besser: Jeden Tag zur gleichen Zeit aufstehen (±30 Min). Ein kurzer Mittagsschlaf (20-30 Min) kann Schlafdefizite ausgleichen.",
                },
                {
                  q: "Sind Power Naps sinnvoll?",
                  a: "Ja! Ein 20-30 Minuten Nickerchen am frühen Nachmittag kann Konzentration und Energie steigern. Wichtig: Nicht länger als 30 Minuten (sonst kommst du in den Tiefschlaf) und nicht nach 15 Uhr (stört den Nachtschlaf).",
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
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Rechner & Informationen</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf berechnen
              </a>
              <a href="/koffein-rechner" className="btn btn-outline">
                Koffein-Rechner
              </a>
              <a href="/wasserbedarf-rechner" className="btn btn-outline">
                Wasserbedarf-Rechner
              </a>
              <a href="/intervallfasten-rechner" className="btn btn-outline">
                Intervallfasten-Rechner
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

export default SchlafRechnerPage;
