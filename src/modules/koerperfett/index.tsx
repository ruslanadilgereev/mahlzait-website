import { useState } from "react";
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

interface BodyFatResult {
  bodyFatPercent: number;
  category: string;
  categoryColor: string;
  fatMass: number;
  leanMass: number;
  healthyMin: number;
  healthyMax: number;
}

// Gesunder Bereich nach Gallagher et al. 2000 (Am J Clin Nutr), abhängig von Alter und Geschlecht.
const healthyRanges = {
  male: [
    { age: "20 bis 39", min: 8, max: 20 },
    { age: "40 bis 59", min: 11, max: 22 },
    { age: "60 bis 79", min: 13, max: 25 },
  ],
  female: [
    { age: "20 bis 39", min: 21, max: 33 },
    { age: "40 bis 59", min: 23, max: 34 },
    { age: "60 bis 79", min: 24, max: 36 },
  ],
};

function healthyRangeFor(gender: "male" | "female", age: number) {
  const rows = healthyRanges[gender];
  if (age < 40) return rows[0];
  if (age < 60) return rows[1];
  return rows[2];
}

function KoerperfettRechnerPage({ config }: Props) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(35);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(80);
  const [waist, setWaist] = useState(85);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);
  const [result, setResult] = useState<BodyFatResult | null>(null);

  const calculateBodyFat = () => {
    // US-Navy-Formel (Hodgdon & Beckett 1984), Umfänge und Größe in cm
    let bodyFatPercent: number;

    if (gender === "male") {
      bodyFatPercent = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      bodyFatPercent = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }

    bodyFatPercent = Math.max(3, Math.min(60, bodyFatPercent));
    bodyFatPercent = Math.round(bodyFatPercent * 10) / 10;

    let category: string;
    let categoryColor: string;
    const healthy = healthyRangeFor(gender, age);

    if (gender === "male") {
      if (bodyFatPercent < 6) {
        category = "Essentielles Fett";
        categoryColor = "warning";
      } else if (bodyFatPercent < 14) {
        category = "Athletisch";
        categoryColor = "success";
      } else if (bodyFatPercent < 18) {
        category = "Fitness";
        categoryColor = "success";
      } else if (bodyFatPercent < 25) {
        category = "Durchschnitt";
        categoryColor = "info";
      } else {
        category = "Erhöht";
        categoryColor = "error";
      }
    } else {
      if (bodyFatPercent < 14) {
        category = "Essentielles Fett";
        categoryColor = "warning";
      } else if (bodyFatPercent < 21) {
        category = "Athletisch";
        categoryColor = "success";
      } else if (bodyFatPercent < 25) {
        category = "Fitness";
        categoryColor = "success";
      } else if (bodyFatPercent < 32) {
        category = "Durchschnitt";
        categoryColor = "info";
      } else {
        category = "Erhöht";
        categoryColor = "error";
      }
    }

    const fatMass = Math.round(weight * (bodyFatPercent / 100) * 10) / 10;
    const leanMass = Math.round((weight - fatMass) * 10) / 10;

    setResult({
      bodyFatPercent,
      category,
      categoryColor,
      fatMass,
      leanMass,
      healthyMin: healthy.min,
      healthyMax: healthy.max,
    });
  };

  const maleCategories = [
    { range: "2 bis 5 %", label: "Essentielles Fett" },
    { range: "6 bis 13 %", label: "Athletisch" },
    { range: "14 bis 17 %", label: "Fitness" },
    { range: "18 bis 24 %", label: "Durchschnitt" },
    { range: "ab 25 %", label: "Erhöht" },
  ];

  const femaleCategories = [
    { range: "10 bis 13 %", label: "Essentielles Fett" },
    { range: "14 bis 20 %", label: "Athletisch" },
    { range: "21 bis 24 %", label: "Fitness" },
    { range: "25 bis 31 %", label: "Durchschnitt" },
    { range: "ab 32 %", label: "Erhöht" },
  ];

  const faqs = [
    {
      q: "Was ist ein gesunder Körperfettanteil?",
      a: "Das hängt von Alter und Geschlecht ab. Für Männer zwischen 20 und 39 gelten 8 bis 20 % als gesund, für Frauen im gleichen Alter 21 bis 33 %. Mit jedem Lebensjahrzehnt verschiebt sich der Bereich um etwa zwei Prozentpunkte nach oben. Sportlich aktive Menschen liegen oft darunter; unter das essentielle Fett (Männer 2 bis 5 %, Frauen 10 bis 13 %) sollte niemand fallen.",
    },
    {
      q: "Wie genau ist die US-Navy-Methode?",
      a: "In Vergleichsstudien liegt die Abweichung zur DEXA-Messung bei etwa 3 bis 4 Prozentpunkten. Für die Verlaufskontrolle reicht das, solange du immer gleich misst. Als Einzelwert für eine Diagnose ist die Formel nicht gedacht.",
    },
    {
      q: "Warum ist der KFA bei Frauen höher?",
      a: "Frauen haben mehr essentielles Fett, das für Hormonhaushalt und Fortpflanzung gebraucht wird: etwa 10 bis 13 % gegenüber 2 bis 5 % bei Männern. Ein KFA von 25 % ist bei einer Frau Durchschnitt, bei einem Mann bereits erhöht.",
    },
    {
      q: "Wie schnell kann man Körperfett verlieren?",
      a: "Realistisch sind 0,5 bis 1 Prozentpunkt pro Monat. Bei einem moderaten Kaloriendefizit von 300 bis 500 kcal am Tag entspricht das etwa 0,3 bis 0,5 kg Fett pro Woche. Schneller geht es nur mit Muskelverlust, der den Grundumsatz senkt.",
    },
    {
      q: "Ich nehme ab, aber der KFA sinkt nicht. Warum?",
      a: "Dann verlierst du Muskeln und Fett im gleichen Verhältnis. Die Ursache ist fast immer zu wenig Protein oder fehlendes Krafttraining. Mit 1,6 bis 2,2 g Protein pro kg Körpergewicht und zwei bis drei Krafteinheiten pro Woche bleibt die Magermasse erhalten, und der Anteil sinkt.",
    },
    {
      q: "Reicht eine Körperfettwaage nicht?",
      a: "Körperfettwaagen messen den elektrischen Widerstand (BIA). Der schwankt mit dem Wasserhaushalt, deshalb springt der Wert nach dem Trinken, nach dem Sport oder morgens gegenüber abends um mehrere Prozentpunkte. Umfangsmessung und Waage haben eine ähnliche Genauigkeit; die Umfänge sind reproduzierbarer.",
    },
  ];

  const categories = gender === "male" ? maleCategories : femaleCategories;
  const currentHealthy = healthyRangeFor(gender, age);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Körperfettanteil-Rechner", url: "/koerperfett-rechner/" },
        ]} />

        <article className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header className="max-w-2xl mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Körperfettanteil berechnen: KFA-Rechner mit Navy-Formel
            </h1>
            <AuthorByline role="Gründer von Mahlzait" publishedAt="2025-11-04" updatedAt="2026-09-17" />
            <p className="text-lg md:text-xl opacity-80">
              Ein Maßband reicht. Der Rechner nutzt die Umfangsformel der US Navy, ordnet dein Ergebnis
              nach Alter und Geschlecht ein und zeigt, wie viel Kilogramm davon Fett und wie viel Magermasse sind.
            </p>
          </header>

          {/* Rechner */}
          <div className="card bg-base-200 max-w-2xl">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Körperfett berechnen</h2>

              <div className="mb-6">
                <span className="text-lg font-semibold block mb-3">Geschlecht</span>
                <div className="flex gap-4">
                  <button
                    className={`btn flex-1 ${gender === "male" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("male")}
                  >
                    Mann
                  </button>
                  <button
                    className={`btn flex-1 ${gender === "female" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setGender("female")}
                  >
                    Frau
                  </button>
                </div>
              </div>

              {[
                { label: "Alter", hint: "Für die Einordnung des Ergebnisses", value: age, set: setAge, min: 18, max: 90, unit: "Jahre" },
                { label: "Körpergröße", hint: null, value: height, set: setHeight, min: 140, max: 220, unit: "cm" },
                { label: "Körpergewicht", hint: null, value: weight, set: setWeight, min: 40, max: 180, unit: "kg" },
                { label: "Halsumfang", hint: "Direkt unter dem Kehlkopf", value: neck, set: setNeck, min: 25, max: 60, unit: "cm" },
                {
                  label: "Bauchumfang",
                  hint: gender === "male" ? "Auf Nabelhöhe, entspannt ausatmen" : "An der schmalsten Stelle der Taille",
                  value: waist, set: setWaist, min: 50, max: 150, unit: "cm",
                },
                ...(gender === "female"
                  ? [{ label: "Hüftumfang", hint: "An der breitesten Stelle", value: hip, set: setHip, min: 60, max: 160, unit: "cm" }]
                  : []),
              ].map((field) => (
                <div className="mb-6" key={field.label}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-semibold">{field.label}</span>
                      {field.hint && <p className="text-sm opacity-60">{field.hint}</p>}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={field.value}
                        onChange={(e) => field.set(Math.min(field.max, Math.max(field.min, Number(e.target.value))))}
                        className="input input-bordered input-lg w-24 text-center text-2xl font-bold text-primary"
                        aria-label={field.label}
                      />
                      <span className="text-lg font-medium opacity-70 w-14">{field.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    value={field.value}
                    onChange={(e) => field.set(Number(e.target.value))}
                    className="range range-primary"
                    aria-label={`${field.label} einstellen`}
                  />
                </div>
              ))}

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateBodyFat}>
                Körperfett berechnen
              </button>

              {result && (
                <div className="mt-8 space-y-4" aria-live="polite">
                  <h3 className="text-xl font-bold">Dein Ergebnis</h3>

                  <div className="py-4">
                    <div className={`text-6xl font-bold text-${result.categoryColor}`}>
                      {result.bodyFatPercent.toLocaleString("de-DE")} %
                    </div>
                    <div className={`text-xl font-semibold mt-2 text-${result.categoryColor}`}>
                      {result.category}
                    </div>
                  </div>

                  <div className="relative h-8 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-warning"></div>
                    <div className="bg-success" style={{ flex: 2 }}></div>
                    <div className="flex-1 bg-info"></div>
                    <div className="flex-1 bg-error"></div>
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-base-content"
                      style={{
                        left: `${Math.min(Math.max((result.bodyFatPercent / (gender === "male" ? 40 : 50)) * 100, 0), 100)}%`,
                        transform: "translateX(-50%)",
                      }}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div>
                      <p className="text-sm opacity-70">Fettmasse</p>
                      <p className="text-2xl font-bold">{result.fatMass.toLocaleString("de-DE")} kg</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Magermasse</p>
                      <p className="text-2xl font-bold">{result.leanMass.toLocaleString("de-DE")} kg</p>
                      <p className="text-xs opacity-60">Muskeln, Knochen, Organe, Wasser</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Gesund in deinem Alter</p>
                      <p className="text-2xl font-bold">{result.healthyMin} bis {result.healthyMax} %</p>
                      <p className="text-xs opacity-60">nach Gallagher et al. 2000</p>
                    </div>
                  </div>

                  <p className="text-sm opacity-80 pt-2">
                    {result.bodyFatPercent > result.healthyMax
                      ? `Dein Wert liegt über dem gesunden Bereich für ${gender === "male" ? "Männer" : "Frauen"} deines Alters. Wie du ihn senkst, ohne Muskeln zu verlieren, steht weiter unten.`
                      : result.bodyFatPercent < result.healthyMin
                        ? "Dein Wert liegt unter dem gesunden Bereich. Bei Leistungssportlern ist das zeitweise normal, dauerhaft sollte er nicht so niedrig bleiben."
                        : "Dein Wert liegt im gesunden Bereich für dein Alter."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-lg max-w-2xl mt-16">
            <h2>Wie der Rechner rechnet</h2>
            <p>
              Die Formel stammt aus einer Studie des Naval Health Research Center (Hodgdon und Beckett, 1984).
              Sie schätzt die Körperdichte aus wenigen Umfängen und rechnet sie in einen Fettanteil um.
              Bei Männern gehen Bauch- und Halsumfang ein, bei Frauen zusätzlich der Hüftumfang. Alle Werte in Zentimetern:
            </p>
            <p>
              <strong>Männer:</strong> KFA = 495 / (1,0324 − 0,19077 · log<sub>10</sub>(Bauch − Hals) + 0,15456 · log<sub>10</sub>(Größe)) − 450
            </p>
            <p>
              <strong>Frauen:</strong> KFA = 495 / (1,29579 − 0,35004 · log<sub>10</sub>(Bauch + Hüfte − Hals) + 0,22100 · log<sub>10</sub>(Größe)) − 450
            </p>
            <p>
              Ein Beispiel: Ein Mann mit 180 cm Größe, 88 cm Bauchumfang und 39 cm Halsumfang kommt auf log<sub>10</sub>(49) = 1,690
              und log<sub>10</sub>(180) = 2,255. Eingesetzt ergibt das 495 / 1,0585 − 450 = 17,6 %. Das Gewicht spielt für den
              Prozentwert keine Rolle; es wird nur gebraucht, um daraus Fett- und Magermasse in Kilogramm zu berechnen.
            </p>
            <p>
              Die Formel reagiert empfindlich auf den Bauchumfang: Ein Zentimeter mehr oder weniger verschiebt das Ergebnis
              bei Männern um rund einen Prozentpunkt. Deshalb entscheidet die Messtechnik über die Qualität des Ergebnisses.
            </p>

            <h2>So misst du richtig</h2>
            <ul>
              <li>
                <strong>Halsumfang:</strong> direkt unterhalb des Kehlkopfs, Maßband waagerecht, leicht nach unten geneigt Richtung Brust.
                Kopf gerade, nicht die Schultern hochziehen.
              </li>
              <li>
                <strong>Bauchumfang:</strong> Männer messen auf Nabelhöhe, Frauen an der schmalsten Stelle zwischen Rippenbogen und Hüftknochen.
                Entspannt ausatmen, nicht einziehen, Maßband liegt an, drückt aber nicht ein.
              </li>
              <li>
                <strong>Hüftumfang</strong> (nur Frauen): an der breitesten Stelle des Gesäßes, Füße zusammen.
              </li>
              <li>
                <strong>Zeitpunkt:</strong> morgens nach dem Toilettengang, vor dem Frühstück. Zwei Messungen, Mittelwert nehmen.
                Wer den Verlauf beobachten will, misst immer unter denselben Bedingungen, am besten einmal pro Woche.
              </li>
            </ul>

            <h2>Welche Werte gelten als normal?</h2>
            <p>
              Zwei Einteilungen sind verbreitet. Der American Council on Exercise (ACE) sortiert nach Fitness-Stufen ohne
              Rücksicht auf das Alter. Gallagher und Kollegen haben 2000 im American Journal of Clinical Nutrition
              gesunde Bereiche nach Alter und Geschlecht veröffentlicht, die Grundlage für die Einordnung im Rechner.
              Beide Tabellen im Vergleich:
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mt-8">
            <div>
              <h3 className="text-xl font-bold mb-3">ACE-Stufen, {gender === "male" ? "Männer" : "Frauen"}</h3>
              <table className="table bg-base-200">
                <thead>
                  <tr>
                    <th>Körperfett</th>
                    <th>Stufe</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.label}>
                      <td>{cat.range}</td>
                      <td>{cat.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Gesunder Bereich nach Alter, {gender === "male" ? "Männer" : "Frauen"}</h3>
              <table className="table bg-base-200">
                <thead>
                  <tr>
                    <th>Alter</th>
                    <th>Körperfett</th>
                  </tr>
                </thead>
                <tbody>
                  {healthyRanges[gender].map((row) => (
                    <tr key={row.age} className={row === currentHealthy ? "font-semibold" : ""}>
                      <td>{row.age} Jahre</td>
                      <td>{row.min} bis {row.max} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm opacity-70 mt-2">Quelle: Gallagher et al., Am J Clin Nutr 2000;72:694-701.</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-2xl mt-12">
            <h2>Körperfettanteil oder BMI?</h2>
            <p>
              Der <a href="/bmi-rechner/">BMI</a> setzt nur Gewicht und Größe ins Verhältnis. Er kann nicht unterscheiden,
              ob die Kilos aus Muskeln oder Fett bestehen. Ein Kraftsportler mit 90 kg bei 180 cm hat einen BMI von 27,8 und
              gilt damit als übergewichtig, obwohl sein KFA bei 12 % liegen kann. Umgekehrt kann jemand mit normalem BMI
              einen erhöhten Fettanteil haben, weil wenig Muskulatur vorhanden ist.
            </p>
            <p>
              Für die Frage, ob eine Diät Fett oder Muskeln abbaut, ist der KFA das bessere Maß. Für Bevölkerungsstatistik
              bleibt der BMI nützlich, weil er ohne Messung auskommt. Für dich als Einzelperson sagt der Umfang am Bauch
              mehr als die Zahl auf der Waage.
            </p>

            <h2>Die Grenzen der Methode</h2>
            <p>
              Die Navy-Formel wurde an Soldaten entwickelt und schätzt für den Durchschnitt gut, für Extreme schlecht.
              Bei sehr muskulösen Menschen überschätzt sie den Fettanteil, weil ein trainierter Rumpf den Bauchumfang erhöht.
              Bei starkem Übergewicht und bei sehr schlanken Frauen weicht sie ebenfalls stärker ab. Die typische Streuung
              gegenüber der DEXA-Messung liegt bei 3 bis 4 Prozentpunkten.
            </p>
            <p>
              Zum Vergleich der gängigen Verfahren:
            </p>
            <ul>
              <li><strong>DEXA-Scan:</strong> Referenzverfahren, Abweichung 1 bis 2 Punkte, kostet 80 bis 150 Euro pro Messung.</li>
              <li><strong>Caliper (Hautfaltenmessung):</strong> 3 bis 5 Punkte, stark abhängig von der Übung des Messenden.</li>
              <li><strong>Körperfettwaage (BIA):</strong> 3 bis 5 Punkte, schwankt zusätzlich mit dem Wasserhaushalt.</li>
              <li><strong>Umfangsformel (Navy):</strong> 3 bis 4 Punkte, kostenlos, gut reproduzierbar.</li>
            </ul>
            <p>
              Entscheidend ist die Veränderung über Wochen, nicht die Nachkommastelle eines Einzelwerts.
              Wer mit derselben Methode misst, sieht den Trend zuverlässig.
            </p>

            <h2>Körperfett senken: was tatsächlich zählt</h2>
            <p>
              Fett verschwindet nur bei negativer Energiebilanz. Ein Defizit von 300 bis 500 kcal pro Tag ist die Größenordnung,
              bei der der Körper Fett abbaut, ohne die Muskulatur anzugreifen. Dafür musst du deinen
              <a href="/kalorienbedarf-berechnen/"> Kalorienbedarf</a> kennen und die Zufuhr einige Wochen ehrlich erfassen.
            </p>
            <p>
              Der zweite Hebel ist Protein. 1,6 bis 2,2 g pro Kilogramm Körpergewicht am Tag schützen die Muskelmasse im
              Defizit; für 80 kg sind das 130 bis 175 g. Wie viel du brauchst, rechnet der
              <a href="/protein-bedarf-rechner/"> Proteinbedarf-Rechner</a> aus.
            </p>
            <p>
              Der dritte Hebel ist Krafttraining, zwei- bis dreimal pro Woche. Es gibt dem Körper den Grund, Muskeln zu
              behalten. Ausdauersport erhöht den Verbrauch, ersetzt das Krafttraining aber nicht. Schlaf unter sieben Stunden
              verschiebt den Abbau nachweislich in Richtung Muskeln.
            </p>
            <p>
              Realistisch sind 0,5 bis 1 Prozentpunkt pro Monat. Von 25 % auf 18 % dauert damit ein halbes bis ganzes Jahr.
              Wer schneller verspricht, verkauft entweder Wasserverlust oder Muskelverlust.
            </p>
          </div>

          <section className="max-w-2xl mt-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Häufige Fragen</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="collapse collapse-plus bg-base-200">
                  <input type="radio" name="faq-accordion" aria-label={faq.q} />
                  <div className="collapse-title text-lg font-medium">{faq.q}</div>
                  <div className="collapse-content">
                    <p className="opacity-80">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="prose max-w-2xl mt-14">
            <h2>Weiter rechnen</h2>
            <ul>
              <li><a href="/protein-bedarf-rechner/">Proteinbedarf berechnen</a>: wie viel Eiweiß die Muskulatur im Defizit braucht</li>
              <li><a href="/kaloriendefizit-berechnen/">Kaloriendefizit berechnen</a>: das Defizit, bei dem Fett und nicht Muskel abgebaut wird</li>
              <li><a href="/taille-hueft-verhaeltnis-rechner/">Taille-Hüft-Verhältnis</a>: Fettverteilung als Gesundheitsmarker</li>
              <li><a href="/bmi-rechner/">BMI-Rechner</a>: der grobe Vergleichswert</li>
            </ul>
            <p className="text-sm">
              Wer Kalorien und Protein im Alltag mitschreiben will, ohne Tabellen zu pflegen:
              Die <a href={getTrackedAppLink({ platform: "ios", source: "calculator" })} onClick={() => trackAppStoreClick("ios", "calculator")}>Mahlzait-App</a> erfasst
              Mahlzeiten per Foto. Der Rechner hier funktioniert auch ohne sie.
            </p>
          </div>
        </article>

        <RelatedWissen calculatorSlug="koerperfett-rechner" />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KoerperfettRechnerPage;
