import { useMemo, useState } from "react";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import AuthorByline from "@components/AuthorByline";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";

interface Props {
  config: TemplateConfig;
}

// MET-Werte fürs Laufen aus dem Compendium of Physical Activities (Ainsworth et al. 2011),
// Codes 12020 bis 12134, mph in km/h umgerechnet. Dazwischen wird linear interpoliert.
const MET_BY_SPEED: [number, number][] = [
  [6.4, 6.0],
  [8.0, 8.3],
  [8.4, 9.0],
  [9.7, 9.8],
  [10.8, 10.5],
  [11.3, 11.0],
  [12.1, 11.5],
  [12.9, 11.8],
  [13.8, 12.3],
  [14.5, 12.8],
  [16.1, 14.5],
  [17.7, 16.0],
  [19.3, 19.0],
];

export function metForSpeed(kmh: number): number {
  if (kmh <= MET_BY_SPEED[0][0]) return MET_BY_SPEED[0][1];
  const last = MET_BY_SPEED[MET_BY_SPEED.length - 1];
  if (kmh >= last[0]) return last[1];
  for (let i = 1; i < MET_BY_SPEED.length; i++) {
    const [s1, m1] = MET_BY_SPEED[i];
    const [s0, m0] = MET_BY_SPEED[i - 1];
    if (kmh <= s1) return m0 + ((kmh - s0) / (s1 - s0)) * (m1 - m0);
  }
  return last[1];
}

// Brutto: MET × kg × h. Netto zieht den Ruheumsatz (1 MET) ab, den der Körper auch auf dem Sofa hätte.
export function runningCalories(weightKg: number, kmh: number, minutes: number) {
  const hours = minutes / 60;
  const met = metForSpeed(kmh);
  return {
    met,
    gross: Math.round(met * weightKg * hours),
    net: Math.round((met - 1) * weightKg * hours),
    distanceKm: Math.round(kmh * hours * 10) / 10,
  };
}

function paceLabel(kmh: number): string {
  const secPerKm = Math.round(3600 / kmh);
  const m = Math.floor(secPerKm / 60);
  const s = secPerKm % 60;
  return `${m}:${s.toString().padStart(2, "0")} min/km`;
}

const TABLE_WEIGHTS = [60, 70, 80, 90, 100];
const TABLE_SPEEDS = [8, 10, 12, 14];

function KalorienverbrauchJoggenPage({ config }: Props) {
  const [weight, setWeight] = useState(75);
  const [speed, setSpeed] = useState(10);
  const [minutes, setMinutes] = useState(30);

  const result = useMemo(() => runningCalories(weight, speed, minutes), [weight, speed, minutes]);

  const fields = [
    { label: "Körpergewicht", value: weight, set: setWeight, min: 40, max: 160, step: 1, unit: "kg", hint: null as string | null },
    { label: "Tempo", value: speed, set: setSpeed, min: 6, max: 18, step: 0.5, unit: "km/h", hint: paceLabel(speed) },
    { label: "Dauer", value: minutes, set: setMinutes, min: 5, max: 180, step: 5, unit: "min", hint: null as string | null },
  ];

  const faqs = [
    {
      q: "Wie viele Kalorien verbrennt man bei 30 Minuten Joggen?",
      a: "Bei 75 kg und 10 km/h rund 375 kcal brutto, etwa 340 kcal netto. Mit 60 kg sind es 300 kcal, mit 90 kg 450 kcal. Das Gewicht wirkt fast proportional, das Tempo weniger stark als die meisten annehmen.",
    },
    {
      q: "Wie viele Kalorien verbrennt 1 km Joggen?",
      a: "Als Faustregel etwa 1 kcal pro Kilogramm Körpergewicht und Kilometer, bei 75 kg also 75 kcal. Der Wert ist vom Tempo weitgehend unabhängig, weil schnelleres Laufen zwar mehr pro Minute verbrennt, die Minuten aber kürzer werden.",
    },
    {
      q: "Was ist der Unterschied zwischen brutto und netto?",
      a: "Brutto ist der gesamte Verbrauch während des Laufens. Netto zieht davon den Ruheumsatz ab, den der Körper in derselben Zeit ohnehin gehabt hätte, etwa 1 kcal pro kg und Stunde. Für die Kalorienbilanz beim Abnehmen zählt netto. Sportuhren zeigen meist brutto.",
    },
    {
      q: "Warum zeigt meine Sportuhr einen anderen Wert?",
      a: "Uhren schätzen über die Herzfrequenz, und die reagiert auf Hitze, Schlafmangel, Koffein und Trainingszustand, nicht nur auf die Belastung. In Vergleichsstudien lagen die Abweichungen bei 15 bis 30 Prozent. Die MET-Rechnung ist nicht genauer, aber sie ist reproduzierbar.",
    },
    {
      q: "Verbrennt langsames Joggen mehr Fett?",
      a: "Anteilig ja, absolut nein. Bei niedriger Intensität stammt ein größerer Teil der Energie aus Fett, aber der Gesamtverbrauch ist kleiner. Für die Bilanz über den Tag zählt der Gesamtverbrauch, nicht die Quelle während der Einheit.",
    },
    {
      q: "Wie viel muss ich joggen, um ein Kilo Fett zu verlieren?",
      a: "Ein Kilogramm Körperfett entspricht etwa 7.000 kcal. Bei rund 340 kcal netto pro 30-Minuten-Lauf sind das etwa 21 Läufe, wenn die Ernährung gleich bleibt. Drei Läufe pro Woche ergeben also ein Kilo in sieben Wochen, ohne dass sich am Essen etwas ändert.",
    },
  ];

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Kalorienverbrauch Joggen", url: "/kalorienverbrauch-joggen/" },
        ]} />

        <article className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header className="max-w-2xl mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Kalorienverbrauch beim Joggen berechnen
            </h1>
            <AuthorByline role="Gründer von Mahlzait" publishedAt="2026-09-17" />
            <p className="text-lg md:text-xl opacity-80">
              Eine Person mit 75 kg verbrennt bei 30 Minuten Joggen mit 10 km/h rund <strong>375 kcal</strong>,
              etwa 340 kcal netto nach Abzug des Ruheumsatzes. Der Rechner nutzt die MET-Werte des Compendium of
              Physical Activities und zeigt beide Zahlen, dazu die gelaufene Strecke.
            </p>
          </header>

          {/* Rechner */}
          <div className="card bg-base-200 max-w-2xl">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Deinen Lauf berechnen</h2>

              {fields.map((field) => (
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
                        step={field.step}
                        value={field.value}
                        onChange={(e) => field.set(Math.min(field.max, Math.max(field.min, Number(e.target.value))))}
                        className="input input-bordered input-lg w-28 text-center text-2xl font-bold text-primary"
                        aria-label={field.label}
                      />
                      <span className="text-lg font-medium opacity-70 w-14">{field.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={field.value}
                    onChange={(e) => field.set(Number(e.target.value))}
                    className="range range-primary"
                    aria-label={`${field.label} einstellen`}
                  />
                </div>
              ))}

              <div className="pt-2" aria-live="polite">
                <h3 className="text-xl font-bold mb-4">Dein Ergebnis</h3>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <p className="text-sm opacity-70">Verbrauch brutto</p>
                    <p className="text-4xl font-bold text-primary">{result.gross.toLocaleString("de-DE")} kcal</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Netto, ohne Ruheumsatz</p>
                    <p className="text-4xl font-bold">{result.net.toLocaleString("de-DE")} kcal</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Strecke</p>
                    <p className="text-4xl font-bold">{result.distanceKm.toLocaleString("de-DE")} km</p>
                  </div>
                </div>
                <p className="text-sm opacity-70 mt-4">
                  Rechnung: {result.met.toLocaleString("de-DE", { maximumFractionDigits: 1 })} MET × {weight} kg × {(minutes / 60).toLocaleString("de-DE", { maximumFractionDigits: 2 })} h.
                  Netto zieht 1 MET Ruheumsatz ab.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-2xl mt-16">
            <h2>So rechnet der Rechner</h2>
            <p>
              Die Grundlage ist das metabolische Äquivalent, kurz MET. 1 MET ist der Energieumsatz in Ruhe, rund
              1 kcal pro Kilogramm Körpergewicht und Stunde. Für Hunderte Aktivitäten wurde gemessen, um welchen Faktor
              der Umsatz steigt; die Werte stehen im Compendium of Physical Activities (Ainsworth et al., 2011),
              der Referenz, die auch Sportwissenschaft und Krankenkassen nutzen. Joggen mit 8 km/h hat 8,3 MET,
              10 km/h etwa 9,8 bis 10,5, 12 km/h 11,5 und 14,5 km/h 12,8 MET.
            </p>
            <p>
              Die Formel: <strong>Kalorien = MET × Gewicht in kg × Dauer in Stunden</strong>. Für 75 kg, 10 km/h und
              30 Minuten: 10,0 × 75 × 0,5 = 375 kcal. Zwischen den Stützwerten interpoliert der Rechner linear,
              deshalb ändert sich das Ergebnis mit jedem halben km/h.
            </p>
            <p>
              Der Nettowert zieht 1 MET ab, weil der Körper diesen Anteil auch im Sitzen verbraucht hätte. Wer den
              Lauf in eine Kalorienbilanz einträgt, sollte den Nettowert nehmen; sonst wird derselbe Ruheumsatz doppelt
              gezählt, einmal im <a href="/grundumsatz-rechner/">Grundumsatz</a> und einmal im Sport.
            </p>

            <h2>Kalorienverbrauch beim Joggen: Tabelle für 30 Minuten</h2>
            <p>
              Bruttowerte in kcal für eine halbe Stunde, nach Gewicht und Tempo. Für 60 Minuten verdoppeln.
            </p>
          </div>

          <div className="overflow-x-auto max-w-2xl mt-6">
            <table className="table bg-base-200">
              <thead>
                <tr>
                  <th>Gewicht</th>
                  {TABLE_SPEEDS.map((s) => (
                    <th key={s} className="text-right">{s} km/h<br /><span className="font-normal opacity-70">{paceLabel(s)}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_WEIGHTS.map((w) => (
                  <tr key={w} className={w === Math.round(weight / 10) * 10 ? "font-semibold" : ""}>
                    <td>{w} kg</td>
                    {TABLE_SPEEDS.map((s) => (
                      <td key={s} className="text-right">{runningCalories(w, s, 30).gross}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm opacity-70 mt-2">MET-Werte: Compendium of Physical Activities 2011, Codes 12020 bis 12134.</p>
          </div>

          <div className="prose prose-lg max-w-2xl mt-12">
            <h2>Was den Verbrauch wirklich bestimmt</h2>
            <p>
              <strong>Das Gewicht</strong> ist der größte Faktor. Jedes Kilogramm muss bei jedem Schritt beschleunigt
              und abgefangen werden, deshalb verbrennt eine Person mit 90 kg bei gleichem Lauf rund 50 Prozent mehr
              als eine mit 60 kg. Das erklärt auch, warum der Verbrauch pro Lauf sinkt, je mehr man abnimmt.
            </p>
            <p>
              <strong>Die Strecke</strong> zählt mehr als das Tempo. Eine gute Faustregel lautet: etwa 1 kcal pro
              Kilogramm und Kilometer, bei 75 kg also 75 kcal pro Kilometer. Wer schneller läuft, verbrennt pro Minute
              mehr, ist aber früher fertig; für dieselbe Strecke landet man am Ende nahe beieinander. Das Tempo
              entscheidet also vor allem darüber, wie viel Strecke in die verfügbare Zeit passt.
            </p>
            <p>
              <strong>Steigung, Untergrund, Wind</strong> kommen obendrauf. Bergauf steigt der Verbrauch je Prozent
              Steigung um grob 10 Prozent, auf Sand oder weichem Waldboden um 10 bis 20 Prozent gegenüber Asphalt.
              Das Laufband liegt ohne Steigung etwas unter dem Straßenwert, weil der Luftwiderstand fehlt; 1 Prozent
              Steigung gleicht das aus.
            </p>
            <p>
              <strong>Der Trainingszustand</strong> spielt für den Verbrauch eine kleinere Rolle, als oft behauptet.
              Trainierte Läufer sind ökonomischer, der Unterschied liegt bei 5 bis 10 Prozent. Sie laufen dafür
              länger und schneller, was den Vorteil mehr als aufhebt.
            </p>

            <h2>Warum die Uhr etwas anderes anzeigt</h2>
            <p>
              Sportuhren und Fitness-Tracker schätzen den Verbrauch aus der Herzfrequenz, manche zusätzlich aus Tempo und
              Höhenprofil. Die Herzfrequenz ist aber kein sauberes Maß für die Leistung: Hitze, Dehydration, Schlafmangel,
              Koffein und Aufregung treiben sie nach oben, ohne dass mehr Energie umgesetzt wird. In Vergleichsstudien
              gegen die Atemgasanalyse wichen gängige Uhren um 15 bis 30 Prozent ab, überwiegend nach oben.
            </p>
            <p>
              Die MET-Rechnung hat einen anderen Fehler: Sie kennt dich nicht, sondern den Durchschnitt. Ihr Vorteil ist,
              dass sie an jedem Tag dasselbe Ergebnis liefert. Wer den eigenen Verbrauch über Wochen verfolgen will,
              kommt mit einer reproduzierbaren Schätzung weiter als mit einer, die täglich schwankt.
            </p>

            <h2>Joggen zum Abnehmen: eine ehrliche Rechnung</h2>
            <p>
              Drei Läufe pro Woche à 30 Minuten bei 75 kg und 10 km/h ergeben rund 1.000 kcal netto. Ein Kilogramm
              Körperfett entspricht etwa 7.000 kcal. Bei unveränderter Ernährung sind das also 140 g Fett pro Woche,
              ein Kilo in sieben Wochen. Das ist real, aber langsam, und es setzt voraus, dass der Appetit nicht mitwächst.
            </p>
            <p>
              Die Praxis zeigt das Gegenteil: Nach dem Lauf isst man mehr, oft ohne es zu merken. Ein Müsliriegel und
              ein Glas Saft gleichen 300 kcal aus. Deshalb funktioniert Joggen zum Abnehmen dann, wenn die Zufuhr bekannt
              ist. Wer seinen <a href="/kalorienbedarf-berechnen/">Kalorienbedarf</a> kennt und ein moderates
              <a href="/kaloriendefizit-berechnen/"> Defizit</a> hält, für den ist der Lauf ein Puffer, der das Defizit
              erträglicher macht. Wer nur läuft, hält meistens das Gewicht, was für die Gesundheit auch schon viel wert ist.
            </p>
            <p>
              Was Joggen unabhängig von der Waage bringt: Es verbessert die Insulinsensitivität, senkt den Ruhepuls und
              erhöht die Sauerstoffaufnahme, und das bereits bei 75 bis 150 Minuten pro Woche. Das ist der Grund, es
              zu tun. Die Kalorien sind ein Nebeneffekt.
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
              <li><a href="/schritte-kalorien-rechner/">Schritte in Kalorien</a>: was Gehen im Alltag bringt</li>
              <li><a href="/kalorienverbrauch-rechner/">Kalorienverbrauch-Rechner</a>: Döner, Pizza und Bier in Laufminuten</li>
              <li><a href="/grundumsatz-rechner/">Grundumsatz berechnen</a>: der Verbrauch ohne jede Bewegung</li>
              <li><a href="/kaloriendefizit-berechnen/">Kaloriendefizit berechnen</a>: wie viel Defizit sinnvoll ist</li>
            </ul>
            <p className="text-sm">
              Wer die Zufuhr neben dem Verbrauch mitschreiben will:
              Die <a href={getTrackedAppLink({ platform: "ios", source: "calculator" })} onClick={() => trackAppStoreClick("ios", "calculator")}>Mahlzait-App</a> erfasst
              Mahlzeiten per Foto. Der Rechner hier braucht sie nicht.
            </p>
          </div>
        </article>

        <RelatedWissen calculatorSlug="kalorienverbrauch-joggen" />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KalorienverbrauchJoggenPage;
