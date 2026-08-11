import AppBanner from "@components/appBanner";
import AuthorByline from "@components/AuthorByline";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

const cancelRoutes = [
  {
    where: "Direkt bei WW gebucht",
    steps: [
      "Auf weightwatchers.com einloggen",
      "Zum Konto und dort zur Kündigungsseite wechseln",
      "Das Kündigungsformular ausfüllen und absenden",
      "Bestätigung per E-Mail abwarten und aufbewahren",
    ],
  },
  {
    where: "Über den App Store gebucht",
    steps: [
      "iPhone: Einstellungen, eigener Name, Abonnements, WW, Abo kündigen",
      "Android: Play Store, Profilbild, Zahlungen und Abos, WW, kündigen",
      "Die Kündigung greift erst zum Ende der laufenden Periode",
    ],
  },
];

const pointsExamples = [
  { food: "Magerquark, 250 g", kcal: "≈ 170 kcal", note: "bei WW meist 0 Punkte" },
  { food: "Banane, mittelgroß", kcal: "≈ 90 kcal", note: "bei WW meist 0 Punkte" },
  { food: "Hähnchenbrust, 150 g", kcal: "≈ 165 kcal", note: "bei WW meist 0 Punkte" },
  { food: "Olivenöl, 1 EL", kcal: "≈ 90 kcal", note: "bei WW punktepflichtig" },
];

function WeightWatchersAlternativePage({ config }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <section className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              WeightWatchers gekündigt: was danach funktioniert
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg opacity-80 max-w-3xl">
              Wie du dein WW-Abo sauber beendest, steht weiter unten. Die
              schwierigere Frage kommt danach: Bei WW hast du in Punkten gedacht,
              draußen rechnet alles in Kalorien. Diese Seite erklärt den
              Unterschied, damit dein Ernährungswissen beim Wechsel nicht verloren
              geht. Die vorgestellte App ist unsere eigene, das sagen wir direkt.
            </p>
          </header>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Punkte und Kalorien sind nicht dasselbe
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Das WW-Punktesystem ist bewusst keine Kalorienzählung. Es gewichtet
            Zucker und gesättigtes Fett hoch, Protein und Ballaststoffe niedrig,
            und stellt eine ganze Reihe Lebensmittel auf null Punkte. Das ist
            didaktisch klug, führt beim Wechsel aber zu einer Überraschung:
            Nullpunkte-Lebensmittel haben natürlich Kalorien.
          </p>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Lebensmittel</th>
                  <th>Energie</th>
                  <th>Im Punktesystem</th>
                </tr>
              </thead>
              <tbody>
                {pointsExamples.map((p) => (
                  <tr key={p.food}>
                    <td>{p.food}</td>
                    <td>{p.kcal}</td>
                    <td className="opacity-80">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm opacity-60 mt-3">
            Richtwerte zur Veranschaulichung. Welche Lebensmittel bei WW wie viele
            Punkte kosten, hängt vom jeweiligen Programm und deinem Plan ab.
          </p>

          <p className="opacity-80 mt-6 max-w-3xl">
            Praktisch heißt das: Wer nach dem Wechsel einfach weiterisst wie
            bisher, landet oft höher als gedacht, weil die Nullpunkte-Portionen
            jetzt sichtbar werden. Das ist kein Rückschritt. Es ist dieselbe
            Ernährung, nur in einer Einheit, die überall gilt, auf jeder
            Verpackung steht und sich mit jeder App weiterführen lässt.
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Was du von WW mitnehmen solltest
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Das Gefühl für Portionen</h3>
                <p className="opacity-80">
                  Monate mit Punkten trainieren die Einschätzung, welche Portion
                  viel ist und welche wenig. Dieses Wissen bleibt, unabhängig von
                  der Einheit.
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Protein zuerst</h3>
                <p className="opacity-80">
                  Dass Quark, Hähnchen und Hülsenfrüchte großzügig erlaubt sind,
                  ist der beste Teil des Systems. In Kalorien gerechnet bleibt der
                  Grundsatz richtig, weil Protein am besten sättigt.
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Die tägliche Gewohnheit</h3>
                <p className="opacity-80">
                  Der Erfolg kam vom Aufschreiben, nicht vom Punktesystem. Wer das
                  Protokollieren beibehält, behält auch das Ergebnis.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            WW-Mitgliedschaft kündigen
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Es kommt darauf an, wo du gebucht hast. Die App zu löschen genügt in
            keinem Fall. Prüfe außerdem die Frist: WW arbeitet mit Laufzeiten von
            einem, drei oder sechs Monaten, und über den App Store gelten die
            Fristen des Stores.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {cancelRoutes.map((r) => (
              <div key={r.where} className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{r.where}</h3>
                  <ol className="list-decimal list-inside space-y-1 opacity-80">
                    {r.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm opacity-60 mt-4">
            Die aktuellen Konditionen und den verbindlichen Kündigungsweg nennt WW
            selbst auf weightwatchers.com. Preise und Fristen ändern sich, deshalb
            stehen hier bewusst keine Beträge.
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ist Mahlzait der richtige Nachfolger?
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Eher nicht, wenn du</h3>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>Coaching und persönliche Betreuung brauchst</li>
                  <li>die Community und die Treffen als Motivation nutzt</li>
                  <li>ein fertiges Programm willst, das dir Regeln vorgibt</li>
                </ul>
                <p className="opacity-70 mt-2">
                  Das alles bietet WW, und ein Kalorienzähler ersetzt es nicht.
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Eher ja, wenn du</h3>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>weißt, wie du isst, und nur noch mitschreiben willst</li>
                  <li>eine Einheit willst, die auf jeder Verpackung steht</li>
                  <li>nicht jede Mahlzeit lange suchen möchtest</li>
                  <li>deutlich weniger pro Monat zahlen willst</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="opacity-80 mt-6 max-w-3xl">
            In Mahlzait beschreibst du die Mahlzeit als Text oder fotografierst
            sie. Unbekannte Produkte werden live im Web recherchiert, jeder Eintrag
            nennt seine Quelle. Das Basis-Tracking ist kostenlos und werbefrei.
          </p>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default WeightWatchersAlternativePage;
