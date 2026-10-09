import AppBanner from "@components/appBanner";
import AppCard from "@components/appComparison/AppCard";
import AppComparisonTable from "@components/appComparison/AppComparisonTable";
import AuthorByline from "@components/AuthorByline";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import {
  appFactsAsOf,
  comparisonOrder,
  formatGermanDate,
  getCalorieApp,
  type CalorieApp,
} from "../../data/calorieApps";
import {
  criteria,
  kalorienzaehlerAppFaq,
  kalorienzaehlerAppPublishedAt,
  methodology,
  quickPicks,
} from "./content";

interface Props {
  config: TemplateConfig;
}

function freeGroups(apps: CalorieApp[]) {
  return [
    {
      title: "Gratis und ohne Werbung",
      apps: apps.filter((a) => a.freeTier === "ja" && a.adsInFree === false),
    },
    {
      title: "Gratis mit Werbung",
      apps: apps.filter((a) => a.freeTier === "ja" && a.adsInFree === true),
    },
    {
      title: "Gratis mit Einschränkungen",
      apps: apps.filter(
        (a) =>
          a.freeTier === "eingeschränkt" ||
          (a.freeTier === "ja" && a.adsInFree === null),
      ),
    },
    {
      title: "Nur mit Abo",
      apps: apps.filter((a) => a.freeTier === "nein"),
    },
  ].filter((group) => group.apps.length > 0);
}

function KalorienzaehlerAppPage({ config }: Props) {
  const apps = comparisonOrder();
  const appsWithGuides = apps.filter((app) => app.alternativePath);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <section className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Kalorienzähler-Apps im Vergleich: Welche passt zu dir?
            </h1>
            <AuthorByline
              role="Gründer von Mahlzait"
              publishedAt={kalorienzaehlerAppPublishedAt}
              updatedAt={
                appFactsAsOf !== kalorienzaehlerAppPublishedAt
                  ? appFactsAsOf
                  : undefined
              }
            />
            <p className="mt-2 text-lg opacity-80 max-w-3xl">
              {apps.length} Kalorienzähler-Apps, die in Deutschland verbreitet
              sind, nebeneinander: was die Gratis-Version kann, ob Werbung
              läuft, was das Abo laut App Store kostet, wie du Mahlzeiten
              erfasst und wo der Anbieter sitzt.
            </p>
            <p className="mt-4 opacity-80 max-w-3xl">
              Eine der {apps.length} Apps ist Mahlzait, unsere eigene. Deshalb
              steht bei jeder App, wofür sie besser ist als die anderen, auch
              dort, wo das gegen uns spricht. Preise und Funktionen haben wir am{" "}
              {formatGermanDate(appFactsAsOf)} geprüft, die Bewertungen kommen
              automatisch aus dem deutschen App Store.
            </p>
            <nav
              aria-label="Inhalt"
              className="mt-6 flex flex-wrap gap-2 text-sm"
            >
              <a href="#ueberblick" className="btn btn-sm btn-outline">
                Tabelle
              </a>
              <a href="#apps" className="btn btn-sm btn-outline">
                Alle Apps einzeln
              </a>
              <a href="#kostenlos" className="btn btn-sm btn-outline">
                Kostenlose Apps
              </a>
              <a href="#faq" className="btn btn-sm btn-outline">
                Häufige Fragen
              </a>
            </nav>
          </header>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Kurz gesagt: Welche App passt zu wem?
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {quickPicks.map((pick) => {
              const app = getCalorieApp(pick.slug);
              return (
                <a
                  key={pick.slug}
                  href={`#${app.slug}`}
                  className="rounded-2xl border border-base-300 p-4 transition-colors hover:border-primary/40 hover:bg-base-200/40"
                >
                  <span className="text-sm opacity-70">{pick.need}</span>
                  <span className="block text-lg font-semibold">
                    {app.name}
                  </span>
                  <span className="block text-sm opacity-80 mt-1">
                    {pick.why}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        <section
          id="ueberblick"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Alle {apps.length} Apps im Überblick
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Mahlzait steht oben, weil es unsere Seite ist. Die übrigen Apps sind
            nach der Zahl ihrer Bewertungen im deutschen App Store sortiert.
            „Gratis“ heißt: laut Anbieter in der kostenlosen Version enthalten.
            „Ja“ heißt: vorhanden, ob gratis oder im Abo, sagt der Anbieter
            nicht.
          </p>
          <AppComparisonTable
            apps={apps}
            caption="Kalorienzähler-Apps im Vergleich"
          />
          <p className="text-xs opacity-60 mt-3">
            Abo-Preis: Jahresabo laut deutschem App Store, wenn vorhanden, sonst
            Monatsabo. Stand {formatGermanDate(appFactsAsOf)}. Aktionspreise
            ändern sich laufend, verbindlich ist der Preis in der jeweiligen
            App.
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            So haben wir verglichen
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Dieser Vergleich ist kein Labortest. Er stellt nebeneinander, was
            die Anbieter selbst angeben und was der deutsche App Store zeigt. Wo
            ein Anbieter etwas offenlässt, steht „Keine Angabe“ statt einer
            Vermutung.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {methodology.map((item) => (
              <div key={item.title} className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{item.title}</h3>
                  <p className="opacity-80">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="opacity-80 mt-6 max-w-3xl">
            Eine Angabe zu einer anderen App stimmt nicht mehr? Schreib uns an{" "}
            <a href="mailto:kontakt@mahlzait.de" className="link link-primary">
              kontakt@mahlzait.de
            </a>
            , wir korrigieren sie.
          </p>
        </section>

        <section
          id="apps"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Die Apps im Einzelnen
          </h2>
          <div className="space-y-6">
            {apps.map((app, index) => (
              <AppCard key={app.slug} app={app} position={index + 1} />
            ))}
          </div>
        </section>

        <section
          id="kostenlos"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Kostenlose Kalorienzähler-Apps: Was gratis wirklich heißt
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            Fast jede App lässt sich kostenlos herunterladen. Wie viel du ohne
            Abo damit machen kannst, unterscheidet sich aber stark.
          </p>
          <div className="space-y-6">
            {freeGroups(apps).map((group) => (
              <div key={group.title}>
                <h3 className="text-xl font-semibold mb-3">{group.title}</h3>
                <ul className="space-y-2">
                  {group.apps.map((app) => (
                    <li key={app.slug} className="opacity-80">
                      <a
                        href={`#${app.slug}`}
                        className="font-semibold link link-hover"
                      >
                        {app.name}
                      </a>
                      : {app.freeSummary}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Worauf es bei einer Kalorienzähler-App ankommt
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {criteria.map((item) => (
              <div key={item.title} className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{item.title}</h3>
                  <p className="opacity-80">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="opacity-80 mt-6 max-w-3xl">
            Wie viel du überhaupt essen solltest, rechnet dir der{" "}
            <a href="/kalorienbedarf-berechnen/" className="link link-primary">
              Kalorienbedarfsrechner
            </a>{" "}
            aus. Wie du mit einer App sinnvoll startest, steht in der Anleitung{" "}
            <a href="/kalorien-zaehlen/" className="link link-primary">
              Kalorien zählen
            </a>
            .
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            App wechseln: Abo kündigen und neu starten
          </h2>
          <p className="opacity-80 max-w-3xl">
            Ein Abo kündigst du dort, wo du es abgeschlossen hast. Auf dem
            iPhone unter Einstellungen, dein Name, Abonnements. Auf Android im
            Play Store unter Profilbild, Zahlungen und Abos. Wurde direkt beim
            Anbieter gebucht, im Konto auf dessen Website. Die App zu löschen
            beendet kein Abo.
          </p>
          <p className="opacity-80 mt-4 max-w-3xl">
            Deine alten Einträge brauchst du für den Neustart nicht. Ziel und
            Körperdaten sind in wenigen Minuten neu gesetzt, wichtig sind die
            nächsten Wochen, nicht die letzten. Für einige Apps haben wir eigene
            Seiten mit Kosten, Kündigung und passenden Alternativen:
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {appsWithGuides.map((app) => (
              <li key={app.slug}>
                <a
                  href={app.alternativePath ?? undefined}
                  className="link link-primary"
                >
                  {app.name}: Kosten, Kündigung und Alternativen
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="faq"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Häufige Fragen
          </h2>
          <div className="space-y-6 max-w-3xl">
            {kalorienzaehlerAppFaq.map((item) => (
              <div key={item.q}>
                <h3 className="text-lg font-semibold">{item.q}</h3>
                <p className="opacity-80 mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KalorienzaehlerAppPage;
