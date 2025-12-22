import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface CalculatorResult {
  bmr: number;
  tdee: number;
  deficit: number;
  surplus: number;
}

function KalorienbedarfPage({ config }: Props) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState(1.55);
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculateCalories = () => {
    // Mifflin-St Jeor Formel
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = Math.round(bmr * activity);
    const deficit = Math.round(tdee - 500);
    const surplus = Math.round(tdee + 300);

    setResult({
      bmr: Math.round(bmr),
      tdee,
      deficit,
      surplus,
    });
  };

  const activityLevels = [
    { value: 1.2, label: "Kaum aktiv (sitzend, kein Sport)" },
    { value: 1.375, label: "Leicht aktiv (1-2x Sport/Woche)" },
    { value: 1.55, label: "Moderat aktiv (3-5x Sport/Woche)" },
    { value: 1.725, label: "Sehr aktiv (6-7x Sport/Woche)" },
    { value: 1.9, label: "Extrem aktiv (Leistungssport)" },
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
              Kalorienbedarf berechnen
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen taeglichen Kalorienbedarf mit der wissenschaftlich fundierten
              Mifflin-St Jeor Formel. Erfahre, wie viele Kalorien du zum Abnehmen, Halten oder
              Zunehmen brauchst.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Kalorienrechner</h2>

              {/* Gender */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Geschlecht</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="gender"
                      className="radio radio-primary"
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                    />
                    <span className="label-text">Maennlich</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="gender"
                      className="radio radio-primary"
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                    />
                    <span className="label-text">Weiblich</span>
                  </label>
                </div>
              </div>

              {/* Age */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Alter</span>
                  <span className="label-text-alt">{age} Jahre</span>
                </label>
                <input
                  type="range"
                  min="16"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Height */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Groesse</span>
                  <span className="label-text-alt">{height} cm</span>
                </label>
                <input
                  type="range"
                  min="140"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Weight */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Gewicht</span>
                  <span className="label-text-alt">{weight} kg</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Activity Level */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Aktivitaetslevel</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary btn-lg" onClick={calculateCalories}>
                Kalorienbedarf berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                    <div className="stat">
                      <div className="stat-title">Grundumsatz (BMR)</div>
                      <div className="stat-value text-primary">{result.bmr}</div>
                      <div className="stat-desc">kcal/Tag im Ruhezustand</div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">Gesamtbedarf (TDEE)</div>
                      <div className="stat-value text-secondary">{result.tdee}</div>
                      <div className="stat-desc">kcal/Tag zum Halten</div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="card bg-success/10 border border-success">
                      <div className="card-body py-4">
                        <h3 className="font-bold text-success">Zum Abnehmen</h3>
                        <p className="text-2xl font-bold">{result.deficit} kcal</p>
                        <p className="text-sm opacity-70">-500 kcal Defizit = ca. 0,5 kg/Woche</p>
                      </div>
                    </div>
                    <div className="card bg-info/10 border border-info">
                      <div className="card-body py-4">
                        <h3 className="font-bold text-info">Zum Zunehmen</h3>
                        <p className="text-2xl font-bold">{result.surplus} kcal</p>
                        <p className="text-sm opacity-70">+300 kcal Ueberschuss = Muskelaufbau</p>
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
                      <p className="font-semibold">Tracke deine Kalorien mit Mahlzait!</p>
                      <p className="text-sm">
                        Mit der App kannst du dein Kalorienziel setzen und Mahlzeiten in Sekunden
                        loggen.
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
              So funktioniert die Berechnung
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Grundumsatz (BMR)</h3>
                  <p className="opacity-80">
                    Der Grundumsatz ist die Kalorienmenge, die dein Koerper im Ruhezustand
                    verbraucht - also fuer Atmung, Herzschlag und andere lebenswichtige Funktionen.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-sm">
                      <strong>Mifflin-St Jeor Formel:</strong>
                      <br />
                      Maenner: 10 x Gewicht + 6.25 x Groesse - 5 x Alter + 5
                      <br />
                      Frauen: 10 x Gewicht + 6.25 x Groesse - 5 x Alter - 161
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Gesamtbedarf (TDEE)</h3>
                  <p className="opacity-80">
                    Der Gesamtbedarf (Total Daily Energy Expenditure) beruecksichtigt dein
                    Aktivitaetslevel. Je aktiver du bist, desto mehr Kalorien verbrauchst du.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-sm">
                      <strong>TDEE = BMR x Aktivitaetsfaktor</strong>
                      <br />
                      Faktoren: 1.2 bis 1.9 je nach Aktivitaet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Haeufig gestellte Fragen
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie genau ist die Kalorienberechnung?",
                  a: "Die Mifflin-St Jeor Formel gilt als genaueste Methode zur Schaetzung des Grundumsatzes. Individuelle Abweichungen von 10-15% sind moeglich. Beobachte dein Gewicht ueber 2-3 Wochen und passe dann an.",
                },
                {
                  q: "Welches Kaloriendefizit ist gesund?",
                  a: "Ein Defizit von 300-500 kcal pro Tag gilt als moderat und nachhaltig. Das entspricht etwa 0,5 kg Gewichtsverlust pro Woche. Mehr als 1000 kcal Defizit wird nicht empfohlen.",
                },
                {
                  q: "Muss ich jeden Tag genau diese Kalorien essen?",
                  a: "Nein, es geht um den Durchschnitt. Du kannst auch wochenweise rechnen. Wichtig ist die Konstanz ueber Zeit.",
                },
                {
                  q: "Wie tracke ich meine Kalorien am einfachsten?",
                  a: "Mit Mahlzait kannst du Mahlzeiten per Foto, Text oder Barcode loggen. Die KI erkennt dein Essen und berechnet die Kalorien automatisch - in Sekunden statt Minuten.",
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
              Jetzt Kalorien tracken mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen Kalorienbedarf. Mit Mahlzait trackst du deine Ernaehrung in
              Sekunden - per Foto, Text oder Barcode.
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
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
              </a>
              <a href="/makros-berechnen" className="btn btn-outline">
                Makros berechnen
              </a>
              <a href="/kalorien-zaehlen" className="btn btn-outline">
                Kalorien zählen
              </a>
              <a href="/abnehmen" className="btn btn-outline">
                Abnehmen
              </a>
              <a href="/#features" className="btn btn-outline">
                Alle Features
              </a>
              <a href="/#live-demo" className="btn btn-outline">
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

export default KalorienbedarfPage;

