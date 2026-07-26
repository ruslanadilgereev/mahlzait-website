import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import AuthorByline from "@components/AuthorByline";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface LUResult {
  bmr: number;
  leistungsumsatz: number;
  gesamtumsatz: number;
  pal: number;
  palLabel: string;
}

function LeistungsumsatzRechnerPage({ config }: Props) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState("office");
  const [result, setResult] = useState<LUResult | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // PAL-Referenzwerte nach DGE (je Stufe der Mittelwert der DGE-Spanne)
  const palLevels = [
    { id: "resting", label: "Nur sitzend oder liegend", description: "Z. B. gebrechliche, immobile Menschen", pal: 1.2 },
    { id: "office", label: "Sitzend, kaum Bewegung", description: "Büroarbeit, wenig Freizeitaktivität (PAL 1,4-1,5)", pal: 1.45 },
    { id: "mixed", label: "Sitzend, zeitweise stehend/gehend", description: "Studierende, Fahrer, Laborarbeit (PAL 1,6-1,7)", pal: 1.65 },
    { id: "standing", label: "Überwiegend stehend/gehend", description: "Verkauf, Gastronomie, Handwerk (PAL 1,8-1,9)", pal: 1.85 },
    { id: "heavy", label: "Körperlich anstrengende Arbeit", description: "Bau, Landwirtschaft, Leistungssport (PAL 2,0-2,4)", pal: 2.2 },
  ];

  const calculate = () => {
    // Grundumsatz nach Mifflin-St Jeor (wie auf der Grundumsatz-Seite)
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const level = palLevels.find((l) => l.id === activity) || palLevels[1];
    const gesamtumsatz = bmr * level.pal;
    const leistungsumsatz = gesamtumsatz - bmr;

    setResult({
      bmr: Math.round(bmr),
      leistungsumsatz: Math.round(leistungsumsatz),
      gesamtumsatz: Math.round(gesamtumsatz),
      pal: level.pal,
      palLabel: level.label,
    });
  };

  const faqs = [
    {
      q: "Was ist der Leistungsumsatz?",
      a: "Der Leistungsumsatz ist die Energie, die dein Körper zusätzlich zum Grundumsatz für alle Aktivitäten verbraucht: Arbeit, Sport, Haushalt und jede Alltagsbewegung. Während der Grundumsatz die Kalorien für Herzschlag, Atmung und Organfunktionen im völligen Ruhezustand abdeckt, entsteht der Leistungsumsatz durch alles, was du über dieses Minimum hinaus tust. Grundumsatz plus Leistungsumsatz ergeben zusammen deinen Gesamtumsatz.",
    },
    {
      q: "Wie berechnet man den Leistungsumsatz?",
      a: "Die Standardmethode läuft über den PAL-Wert (Physical Activity Level): Leistungsumsatz = Grundumsatz × (PAL − 1). Beispiel: Bei einem Grundumsatz von 1.700 kcal und Büroarbeit (PAL 1,45) beträgt der Leistungsumsatz 1.700 × 0,45 = 765 kcal. Der Gesamtumsatz liegt dann bei 2.465 kcal. Unser Rechner berechnet den Grundumsatz mit der Mifflin-St-Jeor-Formel und multipliziert ihn mit dem PAL-Wert deines Alltags.",
    },
    {
      q: "Was ist der PAL-Wert?",
      a: "PAL steht für Physical Activity Level und beschreibt, wie aktiv dein Alltag ist. Die Referenzwerte der Deutschen Gesellschaft für Ernährung reichen von 1,2 (ausschließlich sitzend oder liegend) über 1,4-1,5 (Büroarbeit) und 1,8-1,9 (überwiegend stehende Tätigkeit) bis 2,0-2,4 (körperlich harte Arbeit oder Leistungssport). Der PAL-Wert ist der Faktor, mit dem der Grundumsatz multipliziert wird, um den Gesamtumsatz zu erhalten.",
    },
    {
      q: "Was ist der Unterschied zwischen Grundumsatz, Leistungsumsatz und Gesamtumsatz?",
      a: "Der Grundumsatz ist das Energieminimum deines Körpers in völliger Ruhe. Der Leistungsumsatz kommt durch Bewegung und Aktivität obendrauf. Der Gesamtumsatz (auch Gesamtenergieumsatz oder TDEE genannt) ist die Summe aus beiden und damit die Zahl, an der du deine Ernährung ausrichten solltest: Isst du dauerhaft weniger als deinen Gesamtumsatz, nimmst du ab, isst du mehr, nimmst du zu.",
    },
    {
      q: "Wie hoch ist ein typischer Leistungsumsatz?",
      a: "Das hängt fast vollständig vom Alltag ab. Eine Büroangestellte mit 1.400 kcal Grundumsatz und PAL 1,45 kommt auf rund 630 kcal Leistungsumsatz. Ein Handwerker mit 1.780 kcal Grundumsatz und PAL 1,85 erreicht dagegen etwa 1.510 kcal. Sport erhöht den Wert zusätzlich: Eine Stunde zügiges Gehen verbrennt grob 250 bis 350 kcal extra.",
    },
    {
      q: "Wie kann ich meinen Leistungsumsatz erhöhen?",
      a: "Am wirksamsten über Alltagsbewegung (NEAT): Treppen statt Aufzug, zu Fuß oder mit dem Rad zur Arbeit, Spaziergänge in Pausen und ein tägliches Schrittziel von 8.000 bis 10.000 Schritten. Dazu regelmäßiger Sport, denn jede Trainingseinheit zählt direkt in den Leistungsumsatz. Der Vorteil gegenüber strengerem Kaloriensparen: Du erhöhst deinen Spielraum beim Essen, statt ihn zu verkleinern.",
    },
  ];

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Leistungsumsatz-Rechner", url: "/leistungsumsatz-rechner/" },
        ]} />

        {/* Hero */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Leistungsumsatz berechnen
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Der Leistungsumsatz ist die Energie, die du über deinen Grundumsatz hinaus verbrauchst:
              durch Arbeit, Sport und jede Alltagsbewegung. Berechne ihn hier kostenlos über deinen
              PAL-Wert, zusammen mit Grundumsatz und Gesamtumsatz.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">Leistungsumsatz-Rechner</h2>

              {/* Gender */}
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
              </div>

              {/* PAL */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-3">Dein Alltag (PAL-Wert)</span>
                <div className="space-y-2">
                  {palLevels.map((level) => (
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
                        name="pal"
                        className="radio radio-primary"
                        checked={activity === level.id}
                        onChange={() => setActivity(level.id)}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{level.label}</div>
                        <div className="text-sm opacity-70">{level.description}</div>
                      </div>
                      <span className="badge badge-outline">{level.pal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full" onClick={calculate}>
                Leistungsumsatz berechnen
              </button>

              {/* Result */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="bg-primary/10 border-2 border-primary rounded-xl p-6 text-center">
                    <div className="text-sm uppercase tracking-wide opacity-70 mb-1">Dein Leistungsumsatz</div>
                    <div className="text-5xl font-extrabold text-primary">{result.leistungsumsatz} kcal</div>
                    <div className="mt-2 text-sm opacity-70">pro Tag, bei PAL {result.pal} ({result.palLabel})</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200 rounded-xl p-4 text-center">
                      <div className="text-sm opacity-70 mb-1">Grundumsatz</div>
                      <div className="text-2xl font-bold">{result.bmr} kcal</div>
                    </div>
                    <div className="bg-base-200 rounded-xl p-4 text-center">
                      <div className="text-sm opacity-70 mb-1">Gesamtumsatz</div>
                      <div className="text-2xl font-bold">{result.gesamtumsatz} kcal</div>
                    </div>
                  </div>
                  <p className="text-sm opacity-70 text-center">
                    Rechenweg: Grundumsatz (Mifflin-St-Jeor) × PAL {result.pal} = Gesamtumsatz;
                    Gesamtumsatz − Grundumsatz = Leistungsumsatz.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Formel & PAL-Tabelle */}
          <section className="max-w-2xl mx-auto mt-16 prose prose-lg">
            <h2>So wird der Leistungsumsatz berechnet</h2>
            <p>
              Die Formel ist einfach: <strong>Leistungsumsatz = Grundumsatz × (PAL − 1)</strong>.
              Der PAL-Wert (Physical Activity Level) beschreibt, wie aktiv dein Alltag ist. Den
              Grundumsatz berechnet unser Rechner mit der Mifflin-St-Jeor-Formel, die auch der{" "}
              <a href="/grundumsatz-rechner/">Grundumsatz-Rechner</a> verwendet.
            </p>
            <div className="overflow-x-auto not-prose">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>PAL-Wert</th>
                    <th>Alltag</th>
                    <th>Beispiele</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1,2</td><td>Nur sitzend oder liegend</td><td>Immobile, gebrechliche Menschen</td></tr>
                  <tr><td>1,4-1,5</td><td>Sitzend, kaum Bewegung</td><td>Büroarbeit am Schreibtisch</td></tr>
                  <tr><td>1,6-1,7</td><td>Sitzend mit Geh- und Stehanteilen</td><td>Studierende, Fahrer, Laborarbeit</td></tr>
                  <tr><td>1,8-1,9</td><td>Überwiegend stehend und gehend</td><td>Verkauf, Gastronomie, Handwerk</td></tr>
                  <tr><td>2,0-2,4</td><td>Körperlich anstrengende Arbeit</td><td>Bau, Landwirtschaft, Leistungssport</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm opacity-70">
              PAL-Referenzwerte nach den D-A-CH-Referenzwerten der Deutschen Gesellschaft für Ernährung (DGE).
            </p>

            <h2>Zwei Beispielrechnungen</h2>
            <p>
              <strong>Büroangestellte, 35 Jahre, 168 cm, 68 kg:</strong> Grundumsatz 1.394 kcal.
              Mit PAL 1,45 ergibt das 627 kcal Leistungsumsatz und rund 2.021 kcal Gesamtumsatz.
            </p>
            <p>
              <strong>Handwerker, 40 Jahre, 180 cm, 85 kg:</strong> Grundumsatz 1.780 kcal.
              Mit PAL 1,85 ergibt das 1.513 kcal Leistungsumsatz und rund 3.293 kcal Gesamtumsatz.
            </p>
            <p>
              Für die Ernährungsplanung zählt am Ende der Gesamtumsatz: Berechne ihn direkt mit dem{" "}
              <a href="/kalorienbedarf-berechnen/">Kalorienbedarfs-Rechner</a> oder plane dein Abnehm-Ziel
              mit dem <a href="/kaloriendefizit-berechnen/">Kaloriendefizit-Rechner</a>. Wie viele Kalorien
              deine Schritte bringen, zeigt der <a href="/schritte-kalorien-rechner/">Schritte-Rechner</a>.
            </p>
          </section>

          {/* FAQ */}
          <section className="max-w-2xl mx-auto mt-16">
            <h2 className="text-2xl font-bold mb-6">Häufige Fragen zum Leistungsumsatz</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-base-300 rounded-lg">
                  <button
                    className="w-full text-left p-4 font-semibold flex justify-between items-center"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <span className="text-xl">{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && <p className="px-4 pb-4 opacity-80">{faq.a}</p>}
                </div>
              ))}
            </div>
          </section>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default LeistungsumsatzRechnerPage;
