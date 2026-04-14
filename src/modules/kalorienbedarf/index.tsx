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
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Kalorienbedarf berechnen", url: "/kalorienbedarf-berechnen/" },
        ]} />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Kalorienbedarf berechnen – Dein täglicher Energieverbrauch
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen täglichen Kalorienbedarf mit der wissenschaftlich fundierten
              Mifflin-St Jeor Formel. Erfahre deinen Grundumsatz (BMR), Gesamtbedarf (TDEE) und wie viele Kalorien du zum Abnehmen, Halten oder Zunehmen brauchst – individuell auf dein Alter, Geschlecht und Aktivitätslevel abgestimmt.
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
                    <span className="label-text">Männlich</span>
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
                  <span className="label-text font-semibold">Grösse</span>
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
                  <span className="label-text font-semibold">Aktivitätslevel</span>
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
                        <p className="text-sm opacity-70">+300 kcal Überschuss = Muskelaufbau</p>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold">Tracke deine Kalorien mit Mahlzait!</p>
                      <p className="text-sm">
                        Du kennst jetzt deinen Bedarf. Mit Mahlzait loggst du Mahlzeiten in Sekunden – per Foto, Text oder Barcode.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Comprehensive Guide */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was ist der Kalorienbedarf? – Dein kompletter Guide
            </h2>
            
            <p>
              Dein <strong>täglicher Kalorienbedarf</strong> ist die Energiemenge, die dein Körper in 24 Stunden verbraucht – für alle Funktionen von der Zellerneuerung bis zum Marathon. Er setzt sich aus zwei Hauptkomponenten zusammen: dem <strong>Grundumsatz (BMR)</strong> und dem <strong>Leistungsumsatz</strong>. Zusammen ergeben sie deinen <strong>Gesamtenergieumsatz (TDEE – Total Daily Energy Expenditure)</strong>.
            </p>
            <p>
              Warum ist das wichtig? Weil <strong>Kalorien die Währung deines Körpers</strong> sind. Isst du mehr als du verbrauchst, nimmst du zu. Isst du weniger, nimmst du ab. So einfach ist die Energiebilanz – und so wichtig ist es, deinen persönlichen Bedarf zu kennen. Unser Kalorienrechner oben berechnet das in Sekunden für dich.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Grundumsatz (BMR) – Die Basis deines Kalorienbedarfs</h3>
            <p>
              Der <strong>Grundumsatz (Basal Metabolic Rate, BMR)</strong> ist die Kalorienmenge, die dein Körper im absoluten Ruhezustand verbraucht – also wenn du 24 Stunden lang nur im Bett liegen würdest, ohne dich zu bewegen. Er macht bei den meisten Menschen <strong>60–75 % des Gesamtverbrauchs</strong> aus und wird von folgenden Faktoren beeinflusst:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Muskelmasse:</strong> Der wichtigste Faktor. Muskeln verbrauchen auch in Ruhe mehr Energie als Fettgewebe. Deshalb haben muskulöse Menschen einen höheren Grundumsatz.</li>
              <li><strong>Alter:</strong> Ab dem 30. Lebensjahr sinkt der Grundumsatz um ca. 1–2 % pro Jahrzehnt, vor allem durch den natürlichen Muskelschwund (Sarkopenie).</li>
              <li><strong>Geschlecht:</strong> Männer haben im Schnitt einen 5–10 % höheren Grundumsatz als Frauen, bedingt durch mehr Muskelmasse und weniger Körperfett.</li>
              <li><strong>Körpergrösse:</strong> Grössere Menschen haben mehr Körperoberfläche und damit einen höheren Grundumsatz.</li>
              <li><strong>Genetik &amp; Schilddrüse:</strong> Schilddrüsenhormone regulieren den Stoffwechsel massgeblich. Eine Unter- oder Überfunktion kann den Grundumsatz um bis zu 20 % verändern.</li>
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4">Die Mifflin-St Jeor Formel – Der Goldstandard</h3>
            <p>
              Unser Kalorienrechner nutzt die <strong>Mifflin-St Jeor Formel</strong>, die 1990 entwickelt wurde und von der American Dietetic Association als genaueste Schätzformel empfohlen wird. Sie ist der modernen Bevölkerung besser angepasst als ältere Formeln wie Harris-Benedict (1919).
            </p>
            <div className="p-6 bg-base-200 rounded-lg my-6">
              <p className="font-mono text-center">
                <strong>Männer:</strong> BMR = 10 × Gewicht (kg) + 6,25 × Grösse (cm) – 5 × Alter + 5<br/>
                <strong>Frauen:</strong> BMR = 10 × Gewicht (kg) + 6,25 × Grösse (cm) – 5 × Alter – 161
              </p>
            </div>
            <p>
              Der Gesamtbedarf (TDEE) ergibt sich dann durch Multiplikation mit dem <strong>PAL-Faktor (Physical Activity Level)</strong>:
            </p>
            <div className="overflow-x-auto my-4 not-prose">
              <table className="table bg-base-100 shadow">
                <thead>
                  <tr>
                    <th>Aktivitätslevel</th>
                    <th>PAL-Faktor</th>
                    <th>Beschreibung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Kaum aktiv</td><td className="font-mono">1,2</td><td>Bürojob, kein Sport, hauptsächlich sitzend</td></tr>
                  <tr><td>Leicht aktiv</td><td className="font-mono">1,375</td><td>1–2× Sport pro Woche, leichte Alltagsbewegung</td></tr>
                  <tr><td>Moderat aktiv</td><td className="font-mono">1,55</td><td>3–5× Sport pro Woche, aktiver Alltag</td></tr>
                  <tr><td>Sehr aktiv</td><td className="font-mono">1,725</td><td>6–7× Sport pro Woche, körperlicher Beruf</td></tr>
                  <tr><td>Extrem aktiv</td><td className="font-mono">1,9</td><td>Leistungssport, 2× täglich Training</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>Wichtig:</strong> Die meisten Menschen überschätzen ihr Aktivitätslevel. Wenn du einen Bürojob hast und 3× pro Woche ins Gym gehst, bist du wahrscheinlich „leicht aktiv" (1,375), nicht „moderat aktiv". Beginne konservativ und passe nach 2–3 Wochen an, basierend auf deiner Gewichtsentwicklung.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Mifflin-St Jeor vs. Harris-Benedict – Welche Formel ist besser?</h3>
            <p>
              Die <strong>Harris-Benedict-Formel</strong> (1919, revidiert 1984) war jahrzehntelang der Standard. Sie neigt jedoch dazu, den Grundumsatz um 5–15 % zu überschätzen, besonders bei übergewichtigen Personen. Die Mifflin-St Jeor Formel (1990) wurde an einer moderneren Studienpopulation validiert und liefert genauere Ergebnisse. Eine Vergleichsstudie im Journal of the American Dietetic Association (2005) bestätigte, dass Mifflin-St Jeor bei 70 % der Teilnehmer den tatsächlichen Grundumsatz (gemessen per indirekter Kalorimetrie) am besten vorhersagte. Deshalb verwenden wir ausschliesslich diese Formel.
            </p>
          </div>
        </section>

        {/* 3 Beispielrechnungen */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              3 Beispielrechnungen – Kalorienbedarf Schritt für Schritt
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">
              Um die Berechnung greifbar zu machen, zeigen wir dir drei typische Profile. Jede Rechnung erklärt den Grundumsatz, den Gesamtbedarf und die Empfehlung zum Abnehmen oder Zunehmen.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Beispiel 1 */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 1: Anna, 25 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Geschlecht:</strong> Weiblich</p>
                    <p className="text-sm"><strong>Grösse:</strong> 168 cm | <strong>Gewicht:</strong> 65 kg</p>
                    <p className="text-sm"><strong>Aktivität:</strong> Leicht aktiv (Yoga 2×/Woche)</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">
                      BMR = 10×65 + 6,25×168 – 5×25 – 161<br/>
                      BMR = 650 + 1050 – 125 – 161<br/>
                      <strong>BMR = 1.414 kcal</strong>
                    </p>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">
                      TDEE = 1.414 × 1,375<br/>
                      <strong>TDEE = 1.944 kcal</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="badge badge-success">Abnehmen: 1.444 kcal</div>
                      <div className="badge badge-info">Zunehmen: 2.244 kcal</div>
                    </div>
                    <p className="text-sm opacity-70 mt-2">
                      Anna möchte 3 kg abnehmen. Mit 1.444 kcal/Tag (500 kcal Defizit) erreicht sie das in ca. 6 Wochen – ohne Hungergefühl, wenn sie auf <a href="/protein-bedarf-rechner" className="link link-primary">ausreichend Protein</a> achtet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Beispiel 2 */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 2: Markus, 35 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Geschlecht:</strong> Männlich</p>
                    <p className="text-sm"><strong>Grösse:</strong> 182 cm | <strong>Gewicht:</strong> 90 kg</p>
                    <p className="text-sm"><strong>Aktivität:</strong> Moderat aktiv (Gym 4×/Woche)</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">
                      BMR = 10×90 + 6,25×182 – 5×35 + 5<br/>
                      BMR = 900 + 1137,5 – 175 + 5<br/>
                      <strong>BMR = 1.868 kcal</strong>
                    </p>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">
                      TDEE = 1.868 × 1,55<br/>
                      <strong>TDEE = 2.895 kcal</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="badge badge-success">Abnehmen: 2.395 kcal</div>
                      <div className="badge badge-info">Zunehmen: 3.195 kcal</div>
                    </div>
                    <p className="text-sm opacity-70 mt-2">
                      Markus will Muskeln aufbauen und gleichzeitig etwas Fett verlieren (Recomposition). Er startet mit 2.600 kcal/Tag (leichtes Defizit) und hohem Protein (180 g/Tag). <a href="/makros-berechnen" className="link link-primary">Makroverteilung berechnen</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Beispiel 3 */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Beispiel 3: Petra, 55 Jahre</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm"><strong>Geschlecht:</strong> Weiblich</p>
                    <p className="text-sm"><strong>Grösse:</strong> 162 cm | <strong>Gewicht:</strong> 72 kg</p>
                    <p className="text-sm"><strong>Aktivität:</strong> Kaum aktiv (Bürojob)</p>
                    <div className="divider my-2"></div>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">
                      BMR = 10×72 + 6,25×162 – 5×55 – 161<br/>
                      BMR = 720 + 1012,5 – 275 – 161<br/>
                      <strong>BMR = 1.297 kcal</strong>
                    </p>
                    <p className="text-sm font-mono bg-base-200 p-3 rounded">
                      TDEE = 1.297 × 1,2<br/>
                      <strong>TDEE = 1.556 kcal</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="badge badge-success">Abnehmen: 1.256 kcal</div>
                      <div className="badge badge-info">Halten: 1.556 kcal</div>
                    </div>
                    <p className="text-sm opacity-70 mt-2">
                      Petras Grundumsatz ist durch Alter und geringe Aktivität niedrig. Statt 500 kcal Defizit empfehlen wir hier 300 kcal (1.256 kcal), um nicht unter den Grundumsatz zu fallen. Mehr Bewegung wäre der grössere Hebel. <a href="/schritte-kalorien-rechner" className="link link-primary">Schritte-Kalorien-Rechner</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kalorienbedarf für verschiedene Ziele */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Kalorienbedarf für verschiedene Ziele
            </h2>

            <h3 className="text-xl font-bold mt-6 mb-4">Abnehmen: Das richtige Kaloriendefizit</h3>
            <p>
              Um abzunehmen, musst du weniger Kalorien zu dir nehmen, als du verbrauchst. Das klingt einfach – aber wie gross sollte das Defizit sein? Die Forschung ist hier eindeutig:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Moderates Defizit (300–500 kcal/Tag):</strong> Empfohlen für nachhaltiges Abnehmen. Entspricht ca. 0,3–0,5 kg Gewichtsverlust pro Woche. Muskelmasse bleibt weitgehend erhalten, Hungergefühl ist kontrollierbar.</li>
              <li><strong>Aggressives Defizit (500–750 kcal/Tag):</strong> Schnellere Ergebnisse (0,5–0,75 kg/Woche), aber höheres Risiko für Muskelverlust, Heisshunger und Stoffwechselanpassung. Nur mit ausreichend Protein (2 g/kg) ratsam.</li>
              <li><strong>Sehr hohes Defizit (&gt;1000 kcal/Tag):</strong> Nicht empfohlen. Führt zu Muskelverlust, Nährstoffmangel, Hormonstörungen und dem berüchtigten Jojo-Effekt. Dein <a href="/grundumsatz-rechner" className="link link-primary">Grundumsatz</a> sinkt drastisch.</li>
            </ul>
            <p>
              <strong>Goldene Regel:</strong> Iss nie dauerhaft unter deinem Grundumsatz (BMR). Dein Kaloriendefizit sollte die Differenz zwischen TDEE und BMR nicht überschreiten. Berechne dein optimales <a href="/kaloriendefizit-berechnen" className="link link-primary">Kaloriendefizit</a> für dein Ziel.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Gewicht halten: Die Erhaltungskalorien</h3>
            <p>
              Dein TDEE (Total Daily Energy Expenditure) ist genau die Kalorienmenge, bei der du dein Gewicht hältst. In der Praxis schwankt der TDEE täglich um 100–200 kcal – je nachdem, wie aktiv du bist, wie warm es ist und wie gut du geschlafen hast. Deshalb ist es sinnvoll, den Wochendurchschnitt im Blick zu behalten statt sich an einzelnen Tagen verrückt zu machen.
            </p>
            <p>
              Wenn du dein Zielgewicht erreicht hast, erhöhe deine Kalorien langsam (100–200 kcal/Woche), bis du dein Gewicht stabil hältst. Diesen Prozess nennt man <strong>Reverse Dieting</strong> – er hilft, den Stoffwechsel nach einer Diätphase wieder hochzufahren, ohne sofort zuzunehmen.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Zunehmen und Muskelaufbau: Der Kalorienüberschuss</h3>
            <p>
              Für Muskelaufbau brauchst du einen <strong>Kalorienüberschuss von 200–400 kcal/Tag</strong> über deinem TDEE. Mehr ist nicht besser – ein zu hoher Überschuss führt hauptsächlich zu Fettaufbau, nicht zu mehr Muskeln. Der Körper kann pro Monat nur ca. 0,5–1 kg Muskelmasse aufbauen (bei Anfängern etwas mehr).
            </p>
            <p>
              Entscheidend ist die <strong>Proteinzufuhr</strong>: 1,6–2,2 g Protein pro kg Körpergewicht sind optimal für Muskelaufbau. Nutze unseren <a href="/protein-bedarf-rechner" className="link link-primary">Proteinrechner</a>, um deinen individuellen Bedarf zu ermitteln, und den <a href="/makros-berechnen" className="link link-primary">Makrorechner</a> für die optimale Verteilung von Protein, Kohlenhydraten und Fett.
            </p>
          </div>
        </section>

        {/* Häufige Fehler */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Die 6 häufigsten Fehler bei der Kalorienberechnung
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body py-4">
                  <h3 className="font-bold text-error">❌ 1. Aktivitätslevel überschätzen</h3>
                  <p className="text-sm opacity-80">Die häufigste Falle: Du trainierst 3×/Woche, aber sitzt 10 Stunden am Schreibtisch. Wähle lieber „leicht aktiv" und addiere Trainingstage manuell.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body py-4">
                  <h3 className="font-bold text-error">❌ 2. Kalorien nicht tracken</h3>
                  <p className="text-sm opacity-80">Studien zeigen: Menschen unterschätzen ihre Kalorienzufuhr um 30–50 %. Ohne Tracking weisst du nicht, ob du im Defizit bist. <a href="/kalorien-zaehlen" className="link link-primary">Kalorien zählen lernen</a>.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body py-4">
                  <h3 className="font-bold text-error">❌ 3. Unter dem Grundumsatz essen</h3>
                  <p className="text-sm opacity-80">Wer dauerhaft unter dem BMR isst, riskiert Muskelverlust, Stoffwechselabsenkung und Nährstoffmangel. Dein Defizit sollte maximal 500–750 kcal unter dem TDEE liegen.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body py-4">
                  <h3 className="font-bold text-error">❌ 4. Getränke vergessen</h3>
                  <p className="text-sm opacity-80">Saft, Limo, Milch im Kaffee, Alkohol – flüssige Kalorien summieren sich schnell. Ein Glas Orangensaft hat 110 kcal. <a href="/alkohol-kalorien-rechner" className="link link-primary">Alkohol-Kalorien-Rechner</a>.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body py-4">
                  <h3 className="font-bold text-error">❌ 5. Nicht anpassen</h3>
                  <p className="text-sm opacity-80">Dein Kalorienbedarf ändert sich mit deinem Gewicht. Nach 5 kg Gewichtsverlust sinkt dein TDEE um ca. 100–200 kcal. Berechne alle 4–6 Wochen neu.</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body py-4">
                  <h3 className="font-bold text-error">❌ 6. Wochenenden ignorieren</h3>
                  <p className="text-sm opacity-80">5 Tage Defizit und 2 Tage „frei" kann das gesamte Defizit zunichte machen. Ein Restaurantbesuch hat schnell 1.500+ kcal. Die Wochenbilanz zählt.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kalorienbedarf nach Alter und Geschlecht */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Kalorienbedarf nach Alter, Geschlecht und Aktivität
            </h2>
            
            <h3 className="text-xl font-bold mt-6 mb-4">Durchschnittlicher Kalorienbedarf – Richtwerte</h3>
            <p>
              Die Deutsche Gesellschaft für Ernährung (DGE) gibt folgende Richtwerte für den durchschnittlichen Kalorienbedarf an. Diese Werte gelten für Personen mit geringer körperlicher Aktivität (PAL 1,4):
            </p>
            <div className="overflow-x-auto my-4 not-prose">
              <table className="table bg-base-100 shadow">
                <thead>
                  <tr>
                    <th>Alter</th>
                    <th>Männer (kcal/Tag)</th>
                    <th>Frauen (kcal/Tag)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>19–25 Jahre</td><td>2.400</td><td>1.900</td></tr>
                  <tr><td>25–51 Jahre</td><td>2.300</td><td>1.800</td></tr>
                  <tr><td>51–65 Jahre</td><td>2.100</td><td>1.700</td></tr>
                  <tr><td>65+ Jahre</td><td>1.900</td><td>1.600</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>Achtung:</strong> Das sind Durchschnittswerte. Dein individueller Bedarf hängt stark von deiner Körpergrösse, deinem Gewicht und vor allem deiner Aktivität ab. Eine 1,55 m grosse Frau mit Bürojob braucht deutlich weniger als eine 1,80 m grosse Leistungssportlerin. Nutze deshalb immer unseren <strong>Kalorienrechner</strong> oben für dein persönliches Ergebnis.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Kalorienbedarf in der Schwangerschaft und Stillzeit</h3>
            <p>
              Während der Schwangerschaft steigt der Kalorienbedarf – aber nicht „für zwei essen"! Im ersten Trimester ist kein Mehrbedarf nötig. Ab dem zweiten Trimester empfiehlt die DGE +250 kcal/Tag, im dritten Trimester +500 kcal/Tag. In der Stillzeit liegt der Mehrbedarf bei ca. +500 kcal/Tag. Diese Werte sind Richtwerte – die individuelle Gewichtsentwicklung sollte regelmässig mit dem Arzt besprochen werden.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Wie Kalorien tracken ohne Stress?</h3>
            <p>
              Das Tracken von Kalorien muss keine Wissenschaft sein. Moderne Apps wie <strong>Mahlzait</strong> machen es denkbar einfach: Fotografiere dein Essen, und die KI erkennt automatisch die Lebensmittel und berechnet die Kalorien. Kein manuelles Suchen in Datenbanken, kein Wiegen jeder einzelnen Zutat. In Studien zeigt sich immer wieder: <strong>Wer seine Kalorien trackt, nimmt doppelt so erfolgreich ab</strong> wie Personen ohne Tracking (Lichtman et al., Burke et al.). Der Schlüssel ist Konsistenz – und das gelingt am besten, wenn das Tracking einfach und schnell ist.
            </p>
          </div>
        </section>

        {/* Thermogenese und versteckte Kalorienverbrennung */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Die 4 Komponenten deines Kalorienverbrauchs
            </h2>
            
            <p>
              Dein täglicher Gesamtverbrauch (TDEE) setzt sich aus vier Komponenten zusammen. Die meisten Menschen kennen nur zwei davon – die anderen beiden sind „versteckte Kalorienburner", die du optimieren kannst:
            </p>

            <h3 className="text-xl font-bold mt-6 mb-4">1. Grundumsatz (BMR) – 60–70 % deines Verbrauchs</h3>
            <p>
              Der grösste Posten: Die Energie, die dein Körper für lebenswichtige Funktionen braucht. Dein Gehirn allein verbraucht ca. 20 % des Grundumsatzes (etwa 400 kcal/Tag), obwohl es nur 2 % des Körpergewichts ausmacht. Deine Leber verbraucht weitere 20 %, Muskeln 20–25 % und der Rest verteilt sich auf Herz, Nieren und andere Organe. Du kannst den Grundumsatz langfristig steigern, indem du Muskelmasse aufbaust – jedes zusätzliche Kilogramm Muskeln verbrennt ca. 13 kcal/Tag in Ruhe. Klingt wenig, aber 5 kg mehr Muskeln bedeuten 65 kcal/Tag extra – das sind 24.000 kcal (≈ 3,4 kg Fett) pro Jahr. Berechne deinen aktuellen <a href="/grundumsatz-rechner" className="link link-primary">Grundumsatz</a> mit unserem Rechner.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">2. NEAT (Non-Exercise Activity Thermogenesis) – 15–30 %</h3>
            <p>
              <strong>NEAT</strong> ist der grösste variable Faktor – und der am meisten unterschätzte. NEAT umfasst alle Bewegungen, die kein geplantes Training sind: Gehen, Tippen, Stehen, Zappeln, Kochen, Putzen, Treppensteigen. Studien von James Levine (Mayo Clinic) zeigen, dass NEAT zwischen Personen um bis zu <strong>2.000 kcal/Tag</strong> variieren kann! Jemand mit Steharbeitsplatz, der viel läuft, kann leicht 500–800 kcal mehr verbrennen als jemand, der den ganzen Tag sitzt. 
            </p>
            <p>
              Praktische Tipps zur NEAT-Steigerung: Nimm die Treppe statt den Aufzug, stehe beim Telefonieren auf, laufe in der Mittagspause 15 Minuten, stelle dir einen Steh-Schreibtisch ein. Nutze unseren <a href="/schritte-kalorien-rechner" className="link link-primary">Schritte-Kalorien-Rechner</a>, um zu sehen, wie viel Bewegung im Alltag ausmacht. 10.000 Schritte pro Tag verbrennen je nach Körpergewicht 300–500 kcal extra – das entspricht einem kleinen Abendessen.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">3. TEF (Thermic Effect of Food) – 8–15 %</h3>
            <p>
              Dein Körper verbraucht Energie, um Nahrung zu verdauen, aufzunehmen und zu verarbeiten. Dieser <strong>thermische Effekt der Nahrung (TEF)</strong> macht 8–15 % deines Gesamtverbrauchs aus und variiert je nach Makronährstoff erheblich:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Protein:</strong> 20–30 % der Kalorien werden für die Verdauung verbraucht. Bei 100 kcal aus Protein bleiben also nur 70–80 kcal netto übrig.</li>
              <li><strong>Kohlenhydrate:</strong> 5–10 % thermischer Effekt. Ballaststoffreiche Kohlenhydrate haben einen höheren TEF als raffinierte.</li>
              <li><strong>Fett:</strong> Nur 0–3 % thermischer Effekt. Fett wird am effizientesten gespeichert und verdaut.</li>
            </ul>
            <p>
              Das bedeutet: Eine proteinreiche Ernährung erhöht deinen tatsächlichen Kalorienverbrauch, selbst wenn du die gleiche Kalorienmenge isst. Bei 2.000 kcal/Tag mit 30 % Protein (600 kcal = 150 g) verbrennst du allein durch TEF ca. 150 kcal extra im Vergleich zu einer fettreichen Ernährung. Berechne deine optimale <a href="/makros-berechnen" className="link link-primary">Makroverteilung</a> für maximalen TEF.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">4. EAT (Exercise Activity Thermogenesis) – 5–10 %</h3>
            <p>
              Überraschung: Geplantes Training macht bei den meisten Menschen nur 5–10 % des Gesamtverbrauchs aus. Eine Stunde moderates Joggen verbrennt ca. 400–600 kcal – das ist weniger als das, was viele Menschen durch NEAT verbrennen. Trotzdem ist Training essentiell: Es baut Muskeln auf (höherer BMR), verbessert die Insulinsensitivität, senkt Stresshormone und schützt die Muskelmasse beim Abnehmen. Die beste Strategie: <strong>Krafttraining 2–3×/Woche + hohe Alltagsaktivität (NEAT) + proteinreiche Ernährung</strong>. Das ist die „Triple-Formel" für optimale Körperkomposition. Nutze unseren <a href="/kalorienverbrauch-rechner" className="link link-primary">Kalorienverbrauch-Rechner</a>, um den Verbrauch verschiedener Sportarten zu vergleichen.
            </p>
          </div>
        </section>

        {/* Reverse Dieting und Stoffwechsel */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Metabolische Anpassung – Warum dein Stoffwechsel sich anpasst
            </h2>
            
            <p>
              Einer der frustrierendsten Aspekte des Abnehmens: Dein Körper wehrt sich dagegen. Wenn du längere Zeit im Kaloriendefizit bist, passt sich dein Stoffwechsel an – ein Phänomen, das als <strong>metabolische Adaptation</strong> (auch „adaptive Thermogenese") bekannt ist. Dein Grundumsatz sinkt stärker, als allein durch den Gewichtsverlust zu erklären wäre. Die berühmte „Biggest Loser"-Studie (Fothergill et al., 2016) zeigte, dass Teilnehmer 6 Jahre nach der Show im Schnitt 500 kcal/Tag weniger verbrannten als erwartet.
            </p>
            <p>
              Die gute Nachricht: Metabolische Anpassung ist <strong>reversibel</strong>. Durch sogenanntes <strong>Reverse Dieting</strong> (schrittweise Kalorienerhöhung um 100–200 kcal/Woche nach einer Diätphase) kannst du deinen Stoffwechsel wieder hochfahren, ohne sofort zuzunehmen. Weitere Strategien gegen metabolische Anpassung:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Diet Breaks:</strong> Alle 8–12 Wochen Defizit eine 1–2-wöchige Pause auf Erhaltungskalorien einlegen</li>
              <li><strong>Refeed Days:</strong> 1–2 Tage pro Woche auf TDEE-Niveau essen, mit höherem Kohlenhydratanteil</li>
              <li><strong>Krafttraining:</strong> Muskelmasse erhalten = Grundumsatz erhalten</li>
              <li><strong>Ausreichend Protein:</strong> Mindestens 1,6 g/kg schützt vor Muskelverlust im Defizit</li>
              <li><strong>Schlaf optimieren:</strong> Schlafmangel verstärkt die metabolische Anpassung und erhöht Cortisol</li>
            </ul>
            <p>
              Für langfristigen Erfolg empfehlen wir: Kein Defizit länger als 12–16 Wochen am Stück. Dann 2–4 Wochen Pause auf TDEE. Dann ggf. ein neuer Zyklus. So vermeidest du die schlimmsten metabolischen Anpassungen und hältst dein Gewicht nachhaltig. Berechne deinen aktuellen Bedarf regelmässig neu mit unserem Kalorienrechner oben.
            </p>
          </div>
        </section>

        {/* FAQ Section – 8 FAQs */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum Kalorienbedarf
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie genau ist die Kalorienberechnung?",
                  a: "Die Mifflin-St Jeor Formel gilt als genaueste Methode zur Schätzung des Grundumsatzes und trifft bei 70 % der Personen den tatsächlichen Verbrauch auf ±10 %. Individuelle Abweichungen sind möglich – durch Genetik, Schilddrüsenfunktion und Körperzusammensetzung. Beobachte dein Gewicht über 2–3 Wochen und passe die Kalorien entsprechend an.",
                },
                {
                  q: "Welches Kaloriendefizit ist gesund?",
                  a: "Ein Defizit von 300–500 kcal pro Tag gilt als moderat und nachhaltig. Das entspricht etwa 0,3–0,5 kg Gewichtsverlust pro Woche. Ein Defizit über 1.000 kcal wird nicht empfohlen, da es zu Muskelverlust, Nährstoffmangel und dem Jojo-Effekt führen kann. Wichtig: Nie dauerhaft unter dem Grundumsatz (BMR) essen.",
                },
                {
                  q: "Was ist der Unterschied zwischen BMR und TDEE?",
                  a: "BMR (Basal Metabolic Rate / Grundumsatz) ist die Kalorienmenge, die dein Körper im absoluten Ruhezustand verbraucht – nur für lebenswichtige Funktionen wie Atmung, Herzschlag und Zellerneuerung. TDEE (Total Daily Energy Expenditure / Gesamtbedarf) berücksichtigt zusätzlich dein gesamtes Aktivitätslevel: Arbeit, Sport, Alltagsbewegung und die Thermogenese der Nahrung.",
                },
                {
                  q: "Wie tracke ich meine Kalorien am einfachsten?",
                  a: "Mit Mahlzait fotografierst du dein Essen und die KI erkennt automatisch die Lebensmittel und Kalorien – in Sekunden statt Minuten. Alternativ kannst du Barcodes scannen oder Mahlzeiten per Text eingeben. Das Ziel: Tracking soll so einfach sein, dass du es dauerhaft durchhältst.",
                },
                {
                  q: "Muss ich jeden Tag genau diese Kalorien essen?",
                  a: "Nein, es zählt der Durchschnitt über die Woche. Du kannst an Trainingstagen mehr essen und an Ruhetagen weniger. Solange die Wochenbilanz stimmt, nimmst du ab oder zu. Manche Menschen nutzen auch Calorie Cycling: z. B. 1.800 kcal an Trainingstagen und 1.400 an Ruhetagen.",
                },
                {
                  q: "Wie viele Kalorien sollte ich mindestens essen?",
                  a: "Als absolute Untergrenze gelten 1.200 kcal/Tag für Frauen und 1.500 kcal/Tag für Männer – und selbst das nur kurzfristig und unter ärztlicher Aufsicht. Langfristig solltest du nie unter deinem Grundumsatz (BMR) essen. Bei sehr niedrigem TDEE ist mehr Bewegung der bessere Hebel als weniger Essen.",
                },
                {
                  q: "Ändert sich mein Kalorienbedarf beim Abnehmen?",
                  a: "Ja! Mit jedem Kilogramm, das du verlierst, sinkt dein TDEE um ca. 20–30 kcal. Nach 10 kg Gewichtsverlust verbrauchst du also 200–300 kcal weniger pro Tag. Deshalb stagniert das Gewicht irgendwann – du musst dein Defizit anpassen. Berechne deinen Bedarf alle 4–6 Wochen neu.",
                },
                {
                  q: "Sind 1.200 Kalorien genug zum Abnehmen?",
                  a: "1.200 kcal sind für die meisten Erwachsenen zu wenig – besonders langfristig. Bei so wenig Kalorien ist es schwer, alle Nährstoffe abzudecken. Muskelverlust und metabolische Anpassung (verlangsamter Stoffwechsel) sind häufige Folgen. Besser: Ein moderates Defizit von 300–500 kcal unter dem TDEE und dafür regelmässiges Krafttraining.",
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

        {/* Kalorien zählen in der Praxis */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4 prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Kalorien zählen in der Praxis – Der ultimative Leitfaden
            </h2>
            
            <h3 className="text-xl font-bold mt-6 mb-4">Warum Kalorien zählen funktioniert</h3>
            <p>
              Kalorien zählen ist die <strong>evidenzbasierte Methode Nr. 1</strong> zum Abnehmen. Eine Meta-Analyse von Burke et al. (2011, veröffentlicht im Journal of the American Dietetic Association) analysierte 22 Studien und kam zu einem eindeutigen Ergebnis: <strong>Personen, die ihre Nahrungsaufnahme systematisch tracken, nehmen signifikant mehr ab als Personen ohne Tracking</strong> – im Schnitt doppelt so viel. Der Grund ist simpel: Tracking schafft Bewusstsein. Die meisten Menschen haben keine Ahnung, wie viele Kalorien sie tatsächlich zu sich nehmen. Studien zeigen, dass Menschen ihre Kalorienaufnahme um 30–50 % unterschätzen – ein Schokocroissant hat nicht „so ungefähr 200 kcal", sondern 400–450 kcal.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Die häufigsten Kalorienfallen im Alltag</h3>
            <p>
              Wer seinen Kalorienbedarf kennt, muss auch wissen, wo die versteckten Kalorien lauern. Hier die häufigsten Überraschungen:
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Olivenöl zum Kochen:</strong> 1 Esslöffel = 120 kcal. Zwei Löffel in der Pfanne und du hast 240 kcal extra, ohne es zu bemerken.</li>
              <li><strong>Nüsse als Snack:</strong> Eine Handvoll Cashews (50 g) = 290 kcal. Gesund, aber kaloriendicht.</li>
              <li><strong>Dressings und Saucen:</strong> 2 Esslöffel Caesar-Dressing = 170 kcal. Der „gesunde Salat" wird schnell zur Kalorienbombe.</li>
              <li><strong>Getränke:</strong> Latte Macchiato = 180 kcal. Ein Glas <a href="/alkohol-kalorien-rechner" className="link link-primary">Wein oder Bier</a> = 150–200 kcal. Smoothies: 200–400 kcal.</li>
              <li><strong>Restaurant-Portionen:</strong> Im Schnitt haben Restaurantgerichte 50–100 % mehr Kalorien als die Heimversion – durch mehr Öl, Butter und grössere Portionen.</li>
              <li><strong>„Gesunde" Snacks:</strong> Müsliriegel (250 kcal), Trockenfrüchte (70 kcal pro Handvoll), Avocado-Toast (350 kcal). Gesund ≠ kalorienarm.</li>
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4">Mahlzait: Kalorien tracken in 3 Sekunden</h3>
            <p>
              Das grösste Problem beim Kalorien zählen ist nicht die Methode – sondern der Aufwand. Wer in einer Datenbank jede Zutat manuell suchen und Grammzahlen eingeben muss, gibt nach spätestens 2 Wochen auf. Genau dieses Problem löst <strong>Mahlzait</strong>: Du machst ein Foto deiner Mahlzeit, und die KI erkennt automatisch die Lebensmittel, schätzt die Portionsgrösse und berechnet Kalorien, Protein, Kohlenhydrate und Fett. In 3 Sekunden statt 3 Minuten. Alternativ tippst du einfach „Döner mit Salat" ein oder scannst den Barcode deines Joghurts. So wird <a href="/kalorien-zaehlen" className="link link-primary">Kalorien zählen</a> endlich alltagstauglich.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Meal Prep: Kalorien planen statt schätzen</h3>
            <p>
              Eine der effektivsten Strategien für präzises Kalorienmanagement ist <strong>Meal Prep</strong> – also das Vorkochen und Portionieren von Mahlzeiten. Wenn du am Sonntag drei bis vier Gerichte für die Woche vorkochst, weisst du bei jeder Mahlzeit exakt, wie viele Kalorien und Makros drin stecken. Das eliminiert Schätzfehler, spart Zeit unter der Woche und reduziert die Versuchung, spontan Fast Food zu bestellen. Typische Meal-Prep-Gerichte für ein moderates Defizit: Hähnchenbrust mit Reis und Brokkoli (ca. 450 kcal), Linseneintopf (ca. 380 kcal), Lachs mit Süsskartoffel und Spinat (ca. 520 kcal). Tracke jedes Rezept einmal in Mahlzait, und du hast die Werte für immer gespeichert.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Kalorienberechnung für besondere Situationen</h3>
            <p>
              Dein Kalorienbedarf ist nicht starr – er ändert sich mit deinen Lebensumständen. An <strong>Trainingstagen</strong> verbrauchst du mehr als an Ruhetagen. Bei <strong>Stress</strong> steigt der Cortisolspiegel, was Wassereinlagerungen verursacht und den Grundumsatz kurzfristig erhöhen, aber Heisshunger verstärken kann. Bei <strong>Krankheit</strong> (Fieber) steigt der Grundumsatz um ca. 13 % pro Grad Celsius Temperaturerhöhung. Im <strong>Winter</strong> verbraucht der Körper etwas mehr Energie, um die Körpertemperatur zu halten – allerdings nur minimal (30–50 kcal/Tag), sofern du nicht stundenlang draussen in der Kälte bist. All diese Schwankungen sind normal und gleichen sich über die Woche aus. Deshalb ist der <strong>Wochendurchschnitt</strong> wichtiger als einzelne Tageswerte.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4">Wie lange sollte man Kalorien tracken?</h3>
            <p>
              Die Antwort überrascht viele: <strong>Du musst nicht für immer tracken.</strong> Die meisten Experten empfehlen 3–6 Monate konsequentes Tracking. In dieser Zeit lernst du ein intuitives Gefühl für Portionsgrössen und Kaloriendichten. Danach kannst du auf „lockeres Tracking" umsteigen – z. B. nur noch an kritischen Tagen (Restaurantbesuche, Wochenenden) oder wenn das Gewicht stagniert. Viele Mahlzait-Nutzer tracken dauerhaft, weil es so schnell und einfach ist – aber das ist eine Wahl, keine Pflicht.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Jetzt Kalorien tracken mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen Kalorienbedarf. Der nächste Schritt: Deine Ernährung tracken und dein Ziel erreichen. Mit Mahlzait loggst du Mahlzeiten in Sekunden – per Foto, Text oder Barcode. Keine komplizierten Tabellen, keine manuelle Datenbanksuche. Einfach Foto machen und die KI erledigt den Rest.
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
              <a href="/grundumsatz-rechner" className="btn btn-outline">
                Grundumsatz Rechner
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
              </a>
              <a href="/makros-berechnen" className="btn btn-outline">
                Makros berechnen
              </a>
              <a href="/protein-bedarf-rechner" className="btn btn-outline">
                Proteinbedarf Rechner
              </a>
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI Rechner
              </a>
              <a href="/kalorien-zaehlen" className="btn btn-outline">
                Kalorien zählen lernen
              </a>
              <a href="/schritte-kalorien-rechner" className="btn btn-outline">
                Schritte-Kalorien-Rechner
              </a>
              <a href="/abnahmedatum-berechnen" className="btn btn-outline">
                Abnahmedatum berechnen
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

        <RelatedWissen calculatorSlug="kalorienbedarf-berechnen" />
        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KalorienbedarfPage;
