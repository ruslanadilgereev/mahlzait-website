import AppBanner from "@components/appBanner";
import AuthorByline from "@components/AuthorByline";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { formatGermanDate } from "../../data/calorieApps";
import {
  abbuchung,
  appStoreHinweis,
  appStorePreise,
  faq,
  gelesenAm,
  googlePlayText,
  gratis,
  h1,
  intro,
  kuendigung,
  quellen,
  vergleich,
  websiteText,
} from "./content";

interface Props {
  config: TemplateConfig;
}

function YazioKostenPage({ config }: Props) {
  const stand = formatGermanDate(gelesenAm);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <section className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {h1}
            </h1>
            <AuthorByline role="Gründer von Mahlzait" publishedAt={gelesenAm} />
            {intro.map((text) => (
              <p key={text} className="mt-4 text-lg opacity-80 max-w-3xl">
                {text}
              </p>
            ))}
            <nav
              aria-label="Inhalt"
              className="mt-6 flex flex-wrap gap-2 text-sm"
            >
              <a href="#preise" className="btn btn-sm btn-outline">
                Preise
              </a>
              <a href="#kostenlos" className="btn btn-sm btn-outline">
                Gratis-Version
              </a>
              <a href="#kuendigen" className="btn btn-sm btn-outline">
                Kündigen
              </a>
              <a href="#vergleich" className="btn btn-sm btn-outline">
                Vergleich mit Mahlzait
              </a>
              <a href="#faq" className="btn btn-sm btn-outline">
                Häufige Fragen
              </a>
            </nav>
          </header>
        </section>

        <section
          id="preise"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            YAZIO-Preise laut App Store
          </h2>
          <div className="overflow-x-auto max-w-3xl">
            <table className="table w-full">
              <caption className="text-left text-sm opacity-70 pb-2">
                In-App-Käufe von YAZIO im deutschen App Store, Stand {stand}
              </caption>
              <thead>
                <tr>
                  <th>Laufzeit</th>
                  <th>Preise</th>
                  <th>Umgerechnet pro Monat</th>
                </tr>
              </thead>
              <tbody>
                {appStorePreise.map((zeile) => (
                  <tr key={zeile.laufzeit}>
                    <td>{zeile.laufzeit}</td>
                    <td>{zeile.preise.join(", ")}</td>
                    <td>{zeile.proMonat ?? "keine Angabe"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm opacity-70 mt-3 max-w-3xl">{appStoreHinweis}</p>

          <h3 className="text-xl font-bold mt-8 mb-2">Bei Google Play</h3>
          <p className="opacity-80 max-w-3xl">
            {googlePlayText} Stand {stand}.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-2">Auf yazio.com</h3>
          <p className="opacity-80 max-w-3xl">{websiteText}</p>

          <h3 className="text-xl font-bold mt-8 mb-2">{abbuchung.heading}</h3>
          {abbuchung.paragraphs.map((text) => (
            <p key={text} className="opacity-80 max-w-3xl">
              {text}
            </p>
          ))}
        </section>

        <section
          id="kostenlos"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {gratis.heading}
          </h2>
          {gratis.paragraphs.map((text) => (
            <p key={text} className="opacity-80 mb-4 max-w-3xl">
              {text}
            </p>
          ))}
          <h3 className="text-xl font-bold mt-6 mb-2">{gratis.proHeading}</h3>
          <ul className="list-disc pl-6 space-y-1 opacity-80 max-w-3xl">
            {gratis.pro.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm opacity-60 mt-3">{gratis.proQuelle}</p>
        </section>

        <section
          id="kuendigen"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {kuendigung.heading}
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">{kuendigung.intro}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {kuendigung.routes.map((route) => (
              <div key={route.where} className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{route.where}</h3>
                  <ol className="list-decimal list-inside space-y-1 opacity-80">
                    {route.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
          <p className="opacity-80 mt-6 max-w-3xl">{kuendigung.erstattung}</p>
        </section>

        <section
          id="vergleich"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {vergleich.heading}
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">{vergleich.intro}</p>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>YAZIO</th>
                  <th>Mahlzait (unsere App)</th>
                </tr>
              </thead>
              <tbody>
                {vergleich.zeilen.map((zeile) => (
                  <tr key={zeile.merkmal}>
                    <th className="font-semibold">{zeile.merkmal}</th>
                    <td>{zeile.yazio}</td>
                    <td>{zeile.mahlzait}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {vergleich.fazit.map((text) => (
            <p key={text} className="opacity-80 mt-6 max-w-3xl">
              {text}
            </p>
          ))}
          <p className="opacity-80 mt-4 max-w-3xl">
            Wie das Eintragen per Sprache in Mahlzait funktioniert, steht auf
            der Hilfeseite{" "}
            <a href="/spracheingabe/" className="link link-primary">
              Mahlzeit per Spracheingabe eintragen
            </a>
            . Weitere Apps für Wechsler vergleicht die Seite{" "}
            <a href="/yazio-alternative/" className="link link-primary">
              Yazio-Alternativen
            </a>
            , alle zehn Apps der{" "}
            <a href="/kalorienzaehler-app/" className="link link-primary">
              Kalorienzähler-App-Vergleich
            </a>
            .
          </p>
        </section>

        <section
          id="faq"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Häufige Fragen zu den YAZIO-Kosten
          </h2>
          <div className="space-y-6 max-w-3xl">
            {faq.map((item) => (
              <div key={item.question}>
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <p className="opacity-80 mt-2">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold mb-3">Quellen</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm opacity-80 max-w-3xl">
            {quellen.map((quelle) => (
              <li key={quelle.url}>
                <a
                  href={quelle.url}
                  className="link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {quelle.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm opacity-60 mt-4 max-w-3xl">
            Preise ändern sich mit Angeboten. Verbindlich ist der Betrag, den
            der Store vor dem Kauf anzeigt.
          </p>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default YazioKostenPage;
