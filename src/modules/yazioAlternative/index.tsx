import AppBanner from "@components/appBanner";
import AuthorByline from "@components/AuthorByline";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface PricingRow {
  app: string;
  free: string;
  pro: string;
  note?: string;
}

interface Props {
  config: TemplateConfig;
  pricing: PricingRow[];
  priceAsOf: string;
}

const cancelSteps = [
  {
    platform: "iPhone / iPad",
    steps: [
      "Einstellungen öffnen und oben auf den eigenen Namen tippen",
      "Abonnements auswählen",
      "Yazio antippen",
      "Abo kündigen und bestätigen",
    ],
  },
  {
    platform: "Android",
    steps: [
      "Google Play Store öffnen",
      "Rechts oben auf das Profilbild tippen",
      "Zahlungen und Abos, dann Abos wählen",
      "Yazio antippen und Abo kündigen",
    ],
  },
  {
    platform: "Direkt bei Yazio gebucht",
    steps: [
      "Auf yazio.com einloggen",
      "Zum Konto und dort zu Abonnement wechseln",
      "Abonnement kündigen wählen und bestätigen",
    ],
  },
];

const reasons = [
  {
    title: "Der Preis stört, nicht die App",
    body: "Wer nach den Kosten sucht, hat die App meist schon getestet. Die Suche gilt dann selten der Funktion, sondern der Frage, ob sich das Abo noch lohnt.",
  },
  {
    title: "Bezahlen für Funktionen, die man nicht braucht",
    body: "Rezeptwelten, Fastentracker und Ernährungspläne sind ordentlich gemacht. Wer nur Kalorien und Makros erfassen will, zahlt sie trotzdem mit.",
  },
  {
    title: "Tracken dauert zu lange",
    body: "Jede Mahlzeit einzeln suchen und Portionen schätzen kostet Minuten pro Tag. Genau daran scheitert Tracking langfristig, nicht an fehlenden Funktionen.",
  },
];

function YazioAlternativePage({ config, pricing, priceAsOf }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <section className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Yazio Alternative: Kosten, Kündigung und ein ehrlicher Vergleich
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg opacity-80 max-w-3xl">
              Yazio ist eine gute App. 4,6 Sterne bei über 435.000 Bewertungen im
              App Store sprechen für sich. Die häufigste Frage dazu ist trotzdem,
              was das Pro-Abo kostet und ob es sich lohnt. Diese Seite beantwortet
              beides, zeigt wie du dein Abo sauber kündigst, und stellt eine
              Alternative vor. Dass die von uns kommt, sagen wir gleich dazu.
            </p>
          </header>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Was kostet Yazio?</h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Die Basisversion ist kostenlos und reicht zum Kalorienzählen aus. Geld
            kostet Yazio Pro. Die folgenden Preise sind der Stand vom {priceAsOf};
            Yazio wirbt regelmäßig mit Rabatten und Jahresangeboten, und über den
            App Store können die Beträge abweichen. Den verbindlichen Preis siehst
            du immer in der App oder auf yazio.com.
          </p>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>App</th>
                  <th>Kostenlos</th>
                  <th>Bezahlversion</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row) => (
                  <tr key={row.app} className={row.app === "Mahlzait" ? "font-semibold" : ""}>
                    <td>{row.app}</td>
                    <td className="opacity-80">{row.free}</td>
                    <td>{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm opacity-60 mt-3">
            Preise laut Anbieterangaben, Stand {priceAsOf}. Aktionspreise und
            Studentenrabatte sind nicht berücksichtigt.
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Warum Leute nach einer Alternative suchen
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.title} className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{r.title}</h3>
                  <p className="opacity-80">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Yazio Pro kündigen, so geht es
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Wichtig: Die App zu löschen beendet das Abo nicht. Gekündigt wird dort,
            wo du bezahlt hast. Nach der Kündigung läuft Pro bis zum Ende der
            bezahlten Laufzeit weiter, deine Einträge bleiben erhalten.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {cancelSteps.map((c) => (
              <div key={c.platform} className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{c.platform}</h3>
                  <ol className="list-decimal list-inside space-y-1 opacity-80">
                    {c.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm opacity-60 mt-4">
            Kündigst du über den App Store, gilt die Frist des Stores, in der Regel
            bis 24 Stunden vor Ablauf der Laufzeit.
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Wo Mahlzait anders arbeitet
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Der Unterschied liegt nicht in der Zahl der Funktionen, sondern in der
            Eingabe. Yazio setzt auf eine gepflegte Datenbank, die du durchsuchst.
            Mahlzait lässt dich die Mahlzeit beschreiben oder fotografieren und
            recherchiert unbekannte Produkte live im Web, mit Quellenangabe zu
            jedem Eintrag, damit du die Zahl nachprüfen kannst.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Wofür Yazio die bessere Wahl ist</h3>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>Sehr große, über Jahre gepflegte Lebensmitteldatenbank</li>
                  <li>Umfangreiche Rezeptwelt und fertige Ernährungspläne</li>
                  <li>Integrierter Fastentracker</li>
                  <li>Etabliert, mit entsprechend vielen Erfahrungsberichten</li>
                </ul>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Wofür Mahlzait die bessere Wahl ist</h3>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>Eingabe per Text oder Foto statt Suchen und Auswählen</li>
                  <li>Quellenangabe pro Eintrag statt einer Zahl ohne Herkunft</li>
                  <li>Live-Recherche bei Produkten, die keine Datenbank kennt</li>
                  <li>Günstigeres Abo, kostenlose Version ohne Werbung</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default YazioAlternativePage;
