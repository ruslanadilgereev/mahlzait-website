import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface DrinkEntry {
  id: string;
  drinkId: string;
  quantity: number;
}

interface CaffeineResult {
  totalCaffeine: number;
  percentOfMax: number;
  status: "safe" | "moderate" | "high" | "danger";
  statusLabel: string;
  advice: string;
}

const CAFFEINE_DRINKS = [
  { id: "espresso", name: "Espresso", caffeine: 63, serving: "1 Shot (30ml)", icon: "☕" },
  { id: "filterkaffee", name: "Filterkaffee", caffeine: 95, serving: "1 Tasse (200ml)", icon: "☕" },
  { id: "cappuccino", name: "Cappuccino", caffeine: 63, serving: "1 Tasse", icon: "☕" },
  { id: "latte", name: "Latte Macchiato", caffeine: 63, serving: "1 Glas", icon: "🥛" },
  { id: "coldBrew", name: "Cold Brew", caffeine: 200, serving: "1 Glas (350ml)", icon: "🧊" },
  { id: "energyDrink", name: "Energy Drink", caffeine: 80, serving: "1 Dose (250ml)", icon: "⚡" },
  { id: "energyDrinkLarge", name: "Energy Drink gross", caffeine: 160, serving: "1 Dose (500ml)", icon: "⚡" },
  { id: "schwarztee", name: "Schwarztee", caffeine: 47, serving: "1 Tasse (200ml)", icon: "🍵" },
  { id: "gruentee", name: "Grüntee", caffeine: 28, serving: "1 Tasse (200ml)", icon: "🍵" },
  { id: "matcha", name: "Matcha", caffeine: 70, serving: "1 Tasse", icon: "🍵" },
  { id: "cola", name: "Cola", caffeine: 34, serving: "1 Dose (330ml)", icon: "🥤" },
  { id: "colaLarge", name: "Cola gross", caffeine: 52, serving: "1 Flasche (500ml)", icon: "🥤" },
  { id: "schokolade", name: "Dunkle Schokolade", caffeine: 23, serving: "50g", icon: "🍫" },
  { id: "preworkout", name: "Pre-Workout", caffeine: 200, serving: "1 Portion", icon: "💪" },
];

const MAX_DAILY_CAFFEINE = 400; // mg - EFSA recommendation for healthy adults

function KoffeinRechnerPage({ config }: Props) {
  const [drinks, setDrinks] = useState<DrinkEntry[]>([]);
  const [result, setResult] = useState<CaffeineResult | null>(null);

  const addDrink = (drinkId: string) => {
    const newEntry: DrinkEntry = {
      id: `${drinkId}-${Date.now()}`,
      drinkId,
      quantity: 1,
    };
    setDrinks([...drinks, newEntry]);
  };

  const removeDrink = (id: string) => {
    setDrinks(drinks.filter((d) => d.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setDrinks(
      drinks.map((d) => (d.id === id ? { ...d, quantity: Math.max(1, quantity) } : d))
    );
  };

  const calculateCaffeine = () => {
    const totalCaffeine = drinks.reduce((sum, entry) => {
      const drink = CAFFEINE_DRINKS.find((d) => d.id === entry.drinkId);
      return sum + (drink?.caffeine || 0) * entry.quantity;
    }, 0);

    const percentOfMax = Math.round((totalCaffeine / MAX_DAILY_CAFFEINE) * 100);

    let status: CaffeineResult["status"];
    let statusLabel: string;
    let advice: string;

    if (totalCaffeine <= 200) {
      status = "safe";
      statusLabel = "Unbedenklich";
      advice = "Dein Koffeinkonsum ist moderat. Du bist weit unter dem empfohlenen Tageslimit.";
    } else if (totalCaffeine <= 300) {
      status = "moderate";
      statusLabel = "Moderat";
      advice = "Dein Koffeinkonsum ist noch im grünen Bereich, aber nähere dich dem Limit nicht weiter.";
    } else if (totalCaffeine <= 400) {
      status = "high";
      statusLabel = "Erhöht";
      advice = "Du bist nahe am empfohlenen Tageslimit von 400mg. Weitere koffeinhaltige Getränke solltest du heute vermeiden.";
    } else {
      status = "danger";
      statusLabel = "Zu hoch";
      advice = "Du hast das empfohlene Tageslimit überschritten. Mögliche Symptome: Unruhe, Herzrasen, Schlafprobleme. Trinke viel Wasser.";
    }

    setResult({ totalCaffeine, percentOfMax, status, statusLabel, advice });
  };

  const getDrinkById = (drinkId: string) => CAFFEINE_DRINKS.find((d) => d.id === drinkId);

  const statusColors = {
    safe: "text-success",
    moderate: "text-warning",
    high: "text-orange-500",
    danger: "text-error",
  };

  const statusBgColors = {
    safe: "bg-success/20",
    moderate: "bg-warning/20",
    high: "bg-orange-500/20",
    danger: "bg-error/20",
  };

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section - Coffee aesthetic */}
        <section className="relative overflow-hidden">
          {/* Animated coffee steam background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-700/20 via-transparent to-transparent"></div>
          
          {/* Floating coffee beans decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute text-amber-800/30 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${20 + Math.random() * 30}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                ☕
              </div>
            ))}
          </div>

          <div className="relative max-w-screen-lg mx-auto py-12 px-4 md:py-20">
            <header className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-medium mb-6">
                <span className="animate-bounce">⚡</span>
                Kostenloser Koffein-Tracker
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                Koffein-Rechner
              </h1>
              <p className="mt-4 text-lg md:text-xl text-amber-100/80 max-w-2xl mx-auto">
                Tracke deinen täglichen Koffeinkonsum. Finde heraus, ob du noch im sicheren Bereich bist oder ob dein Kaffeekonsum überhand nimmt.
              </p>
              <div className="flex items-center justify-center gap-2 mt-6 text-amber-200/60 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/10">400mg Tageslimit (EFSA)</span>
                <span className="px-3 py-1 rounded-full bg-white/10">Für gesunde Erwachsene</span>
              </div>
            </header>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="relative -mt-8 pb-16">
          <div className="max-w-screen-lg mx-auto px-4">
            {/* Drink Selector */}
            <div className="card bg-base-100 shadow-2xl border border-base-200">
              <div className="card-body p-6 md:p-8">
                <h2 className="card-title text-2xl mb-2">Was hast du heute getrunken?</h2>
                <p className="text-base-content/60 mb-6">Wähle deine Getränke aus und berechne deinen Koffeinkonsum.</p>

                {/* Drink Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                  {CAFFEINE_DRINKS.map((drink) => (
                    <button
                      key={drink.id}
                      onClick={() => addDrink(drink.id)}
                      className="group relative p-4 rounded-xl bg-base-200/50 hover:bg-amber-500/10 border-2 border-transparent hover:border-amber-500/50 transition-all duration-200 text-left"
                    >
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {drink.icon}
                      </div>
                      <div className="font-semibold text-sm leading-tight">{drink.name}</div>
                      <div className="text-xs text-base-content/50 mt-1">{drink.caffeine}mg</div>
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/0 group-hover:bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-primary-content text-sm font-bold">
                        +
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Drinks */}
                {drinks.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span>Deine Getränke</span>
                      <span className="badge badge-primary">{drinks.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {drinks.map((entry) => {
                        const drink = getDrinkById(entry.drinkId);
                        if (!drink) return null;
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-base-200/50 group"
                          >
                            <span className="text-2xl">{drink.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{drink.name}</div>
                              <div className="text-sm text-base-content/50">
                                {drink.caffeine * entry.quantity}mg Koffein
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(entry.id, entry.quantity - 1)}
                                className="btn btn-circle btn-sm btn-ghost"
                                disabled={entry.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-bold">{entry.quantity}</span>
                              <button
                                onClick={() => updateQuantity(entry.id, entry.quantity + 1)}
                                className="btn btn-circle btn-sm btn-ghost"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeDrink(entry.id)}
                                className="btn btn-circle btn-sm btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg w-full text-lg gap-2"
                  onClick={calculateCaffeine}
                  disabled={drinks.length === 0}
                >
                  <span>⚡</span>
                  Koffein berechnen
                </button>

                {/* Results */}
                {result && (
                  <div className="mt-8 space-y-6">
                    <div className="divider">Dein Ergebnis</div>

                    {/* Main Result Display */}
                    <div className={`text-center py-8 px-4 rounded-2xl ${statusBgColors[result.status]}`}>
                      <div className="text-6xl md:text-8xl font-black tabular-nums">
                        <span className={statusColors[result.status]}>{result.totalCaffeine}</span>
                        <span className="text-2xl md:text-3xl font-medium opacity-60">mg</span>
                      </div>
                      <div className="mt-2 text-xl font-semibold">
                        von {MAX_DAILY_CAFFEINE}mg Tageslimit
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-6 max-w-md mx-auto">
                        <div className="h-4 rounded-full bg-base-300 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              result.status === "safe" ? "bg-success" :
                              result.status === "moderate" ? "bg-warning" :
                              result.status === "high" ? "bg-orange-500" :
                              "bg-error"
                            }`}
                            style={{ width: `${Math.min(100, result.percentOfMax)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm mt-2 opacity-70">
                          <span>0mg</span>
                          <span>200mg</span>
                          <span>400mg</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full font-semibold ${statusBgColors[result.status]} ${statusColors[result.status]}`}>
                        {result.status === "safe" && "✓"}
                        {result.status === "moderate" && "⚠"}
                        {result.status === "high" && "⚠"}
                        {result.status === "danger" && "✕"}
                        <span>{result.statusLabel}</span>
                        <span>({result.percentOfMax}%)</span>
                      </div>
                    </div>

                    {/* Advice */}
                    <div className={`alert ${
                      result.status === "safe" ? "alert-success" :
                      result.status === "moderate" ? "alert-warning" :
                      "alert-error"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">{result.advice}</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="card bg-base-200">
                        <div className="card-body p-4 text-center">
                          <div className="text-sm opacity-60">Getränke</div>
                          <div className="text-2xl font-bold">{drinks.reduce((sum, d) => sum + d.quantity, 0)}</div>
                        </div>
                      </div>
                      <div className="card bg-base-200">
                        <div className="card-body p-4 text-center">
                          <div className="text-sm opacity-60">Noch möglich</div>
                          <div className="text-2xl font-bold text-success">
                            {Math.max(0, MAX_DAILY_CAFFEINE - result.totalCaffeine)}mg
                          </div>
                        </div>
                      </div>
                      <div className="card bg-base-200">
                        <div className="card-body p-4 text-center">
                          <div className="text-sm opacity-60">≈ Espressos</div>
                          <div className="text-2xl font-bold">
                            {(result.totalCaffeine / 63).toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="card bg-base-200">
                        <div className="card-body p-4 text-center">
                          <div className="text-sm opacity-60">≈ Energy Drinks</div>
                          <div className="text-2xl font-bold">
                            {(result.totalCaffeine / 80).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mahlzait CTA */}
                    <div className="alert bg-primary/10 border border-primary/30">
                      <span className="text-2xl">📱</span>
                      <div>
                        <p className="font-semibold">Tracke alles mit Mahlzait!</p>
                        <p className="text-sm opacity-80">
                          Koffein, Kalorien, Makros – alles per Foto. Behalte den Überblick über deine Ernährung.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Caffeine Reference Table */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Koffeingehalt beliebter Getränke
            </h2>
            <div className="overflow-x-auto max-w-3xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr>
                    <th>Getränk</th>
                    <th>Portionsgrösse</th>
                    <th>Koffein</th>
                    <th>% vom Tageslimit</th>
                  </tr>
                </thead>
                <tbody>
                  {CAFFEINE_DRINKS.slice(0, 10).map((drink) => (
                    <tr key={drink.id}>
                      <td className="font-medium">
                        <span className="mr-2">{drink.icon}</span>
                        {drink.name}
                      </td>
                      <td>{drink.serving}</td>
                      <td>
                        <span className="badge badge-primary">{drink.caffeine}mg</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-base-300 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(drink.caffeine / MAX_DAILY_CAFFEINE) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{Math.round((drink.caffeine / MAX_DAILY_CAFFEINE) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Alles über Koffein
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">⚡ Wie wirkt Koffein?</h3>
                  <p className="opacity-80">
                    Koffein blockiert Adenosin-Rezeptoren im Gehirn, was Müdigkeit unterdrückt und die Wachheit steigert. Die Wirkung setzt nach 15-45 Minuten ein und hält 3-5 Stunden an.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Steigert Konzentration & Aufmerksamkeit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Verbessert körperliche Leistung</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Kann Stoffwechsel leicht anregen</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">⚠️ Wie viel ist zu viel?</h3>
                  <p className="opacity-80">
                    Die EFSA empfiehlt maximal 400mg Koffein pro Tag für gesunde Erwachsene. Schwangere sollten unter 200mg bleiben. Einzeldosen sollten 200mg nicht überschreiten.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-warning">⚠</span>
                      <span className="text-sm">Zu viel: Unruhe, Herzrasen, Schlafstörungen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">⚠</span>
                      <span className="text-sm">Toleranzentwicklung bei regelmässigem Konsum</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">⚠</span>
                      <span className="text-sm">Entzugssymptome bei plötzlichem Stopp</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🌙 Koffein und Schlaf</h3>
                  <p className="opacity-80">
                    Die Halbwertszeit von Koffein beträgt etwa 5-6 Stunden. Das bedeutet: Eine Tasse Kaffee um 16 Uhr wirkt um 22 Uhr noch zur Hälfte.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-semibold text-center">🕐 Koffein-Cutoff</p>
                    <p className="text-sm opacity-70 text-center mt-2">
                      Letzter Kaffee: 6-8 Stunden vor dem Schlafen
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">👶 Wer sollte aufpassen?</h3>
                  <p className="opacity-80">
                    Nicht jeder verträgt Koffein gleich gut. Manche Menschen metabolisieren Koffein langsamer und spüren die Wirkung stärker.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-error">✕</span>
                      <span className="text-sm">Kinder und Jugendliche: max. 3mg/kg Körpergewicht</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error">✕</span>
                      <span className="text-sm">Schwangere: max. 200mg pro Tag</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error">✕</span>
                      <span className="text-sm">Bei Herzproblemen: Arzt konsultieren</span>
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
              Häufig gestellte Fragen zum Koffein
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie viel Koffein am Tag ist gesund?",
                  a: "Die EFSA empfiehlt maximal 400mg Koffein pro Tag für gesunde Erwachsene. Das entspricht etwa 4-5 Tassen Filterkaffee oder 6-7 Espressos. Individuelle Empfindlichkeiten können variieren.",
                },
                {
                  q: "Wie viel Koffein hat eine Tasse Kaffee?",
                  a: "Eine Tasse Filterkaffee (200ml) enthält etwa 95mg Koffein. Ein Espresso hat etwa 63mg, obwohl die Konzentration höher ist. Cold Brew kann bis zu 200mg pro Glas enthalten.",
                },
                {
                  q: "Ist Koffein schädlich?",
                  a: "In moderaten Mengen (bis 400mg/Tag) ist Koffein für die meisten Erwachsenen unbedenklich. Übermässiger Konsum kann jedoch zu Schlafstörungen, Unruhe und erhöhtem Blutdruck führen.",
                },
                {
                  q: "Wie lange wirkt Koffein?",
                  a: "Die Wirkung setzt nach 15-45 Minuten ein und hält etwa 3-5 Stunden an. Die Halbwertszeit beträgt 5-6 Stunden – so lange dauert es, bis die Hälfte des Koffeins abgebaut ist.",
                },
                {
                  q: "Hat entkoffeinierter Kaffee wirklich kein Koffein?",
                  a: "Entkoffeinierter Kaffee enthält noch geringe Mengen Koffein (2-15mg pro Tasse). Für die meisten Menschen ist das vernachlässigbar, aber bei extremer Empfindlichkeit relevant.",
                },
              ].map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion" defaultChecked={i === 0} />
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
        <section className="bg-gradient-to-br from-amber-900 to-amber-950 text-white py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Behalte den Überblick mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Tracke nicht nur Koffein, sondern deine komplette Ernährung. Per Foto, Text oder Barcode – in Sekunden weisst du, was du isst.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={config.appStoreLink} className="btn btn-lg bg-white text-amber-900 hover:bg-amber-100">
                iOS App laden
              </a>
              <a href={config.googlePlayLink} className="btn btn-lg bg-white text-amber-900 hover:bg-amber-100">
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
              <a href="/wasserbedarf-rechner" className="btn btn-outline">
                Wasserbedarf Rechner
              </a>
              <a href="/alkohol-kalorien-rechner" className="btn btn-outline">
                Alkohol Kalorien
              </a>
              <a href="/intervallfasten-rechner" className="btn btn-outline">
                Intervallfasten Rechner
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

export default KoffeinRechnerPage;
