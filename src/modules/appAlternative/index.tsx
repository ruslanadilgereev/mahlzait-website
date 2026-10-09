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
  calorieApps,
  formatGermanDate,
  getCalorieApp,
} from "../../data/calorieApps";
import type { AlternativePageContent, ExtraSection } from "./types";

interface Props {
  config: TemplateConfig;
  content: AlternativePageContent;
}

function Extra({ section }: { section: ExtraSection }) {
  return (
    <section className="max-w-screen-lg mx-auto px-4 pb-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">{section.heading}</h2>
      {section.paragraphs?.map((text) => (
        <p key={text} className="opacity-80 mb-4 max-w-3xl">
          {text}
        </p>
      ))}
      {section.table && (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  {section.table.head.map((cell) => (
                    <th key={cell}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.table.rows.map((row) => (
                  <tr key={row.join("|")}>
                    {row.map((cell, index) => (
                      <td key={index}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {section.table.note && (
            <p className="text-sm opacity-60 mt-3">{section.table.note}</p>
          )}
        </>
      )}
      {section.cards && (
        <div className="grid gap-4 md:grid-cols-3 mt-2">
          {section.cards.map((card) => (
            <div key={card.title} className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">{card.title}</h3>
                <p className="opacity-80">{card.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {section.closing?.map((text) => (
        <p key={text} className="opacity-80 mt-6 max-w-3xl">
          {text}
        </p>
      ))}
    </section>
  );
}

function AppAlternativePage({ config, content }: Props) {
  const competitor = getCalorieApp(content.competitor);
  const picks = content.alternatives.map((pick) => ({
    app: getCalorieApp(pick.slug),
    why: pick.why,
  }));
  const otherGuides = calorieApps.filter(
    (app) => app.alternativePath && app.slug !== competitor.slug,
  );

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <section className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {content.h1}
            </h1>
            <AuthorByline
              role="Gründer von Mahlzait"
              publishedAt={content.publishedAt}
              updatedAt={
                content.updatedAt !== content.publishedAt
                  ? content.updatedAt
                  : undefined
              }
            />
            {content.intro.map((text) => (
              <p key={text} className="mt-4 text-lg opacity-80 max-w-3xl">
                {text}
              </p>
            ))}
            <nav
              aria-label="Inhalt"
              className="mt-6 flex flex-wrap gap-2 text-sm"
            >
              <a href="#alternativen" className="btn btn-sm btn-outline">
                Alternativen
              </a>
              <a href="#kosten" className="btn btn-sm btn-outline">
                Kosten
              </a>
              <a href="#kuendigen" className="btn btn-sm btn-outline">
                Kündigen
              </a>
              <a href="#faq" className="btn btn-sm btn-outline">
                Häufige Fragen
              </a>
            </nav>
          </header>
        </section>

        <section
          id="alternativen"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {competitor.name}-Alternativen im Überblick
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">
            {content.alternativesIntro}
          </p>
          <AppComparisonTable
            apps={[competitor, ...picks.map((pick) => pick.app)]}
            highlightSlug={competitor.slug}
            caption={`${competitor.name} und Alternativen im Vergleich`}
          />
          <p className="text-xs opacity-60 mt-3">
            Preise laut deutschem App Store, Stand{" "}
            {formatGermanDate(appFactsAsOf)}. Bewertungen automatisch aus dem
            App Store. Alle {calorieApps.length} Apps mit Methodik im{" "}
            <a href="/kalorienzaehler-app/" className="underline">
              Kalorienzähler-App-Vergleich
            </a>
            .
          </p>
          <div className="space-y-6 mt-8">
            {picks.map((pick, index) => (
              <AppCard
                key={pick.app.slug}
                app={pick.app}
                position={index + 1}
                reason={pick.why}
              />
            ))}
          </div>
        </section>

        <section
          id="kosten"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {content.costHeading}
          </h2>
          {content.cost.map((text) => (
            <p key={text} className="opacity-80 mb-4 max-w-3xl">
              {text}
            </p>
          ))}
          <div className="card bg-base-200 max-w-3xl">
            <div className="card-body">
              <h3 className="card-title text-lg">
                {competitor.name} laut App Store
              </h3>
              <p className="opacity-80">{competitor.priceNote}</p>
              <p className="text-sm opacity-60">
                Stand {formatGermanDate(appFactsAsOf)}. Den verbindlichen Preis
                zeigt dir die App vor dem Kauf.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {content.freeHeading}
          </h2>
          {content.free.map((text) => (
            <p key={text} className="opacity-80 mb-4 max-w-3xl">
              {text}
            </p>
          ))}
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Warum Leute nach einer Alternative suchen
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {content.reasons.map((reason) => (
              <div key={reason.title} className="card bg-base-200">
                <div className="card-body">
                  <h3 className="card-title text-lg">{reason.title}</h3>
                  <p className="opacity-80">{reason.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {content.extraSections?.map((section) => (
          <Extra key={section.heading} section={section} />
        ))}

        <section
          id="kuendigen"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {content.cancelHeading}
          </h2>
          <p className="opacity-80 mb-6 max-w-3xl">{content.cancelIntro}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {content.cancelRoutes.map((route) => (
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
          {content.cancelNote && (
            <p className="text-sm opacity-60 mt-4 max-w-3xl">
              {content.cancelNote}
            </p>
          )}
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {content.stayHeading}
          </h2>
          <ul className="list-disc list-inside space-y-2 opacity-80 max-w-3xl">
            {content.stayIf.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section
          id="faq"
          className="max-w-screen-lg mx-auto px-4 pb-12 scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Häufige Fragen zu {competitor.name}
          </h2>
          <div className="space-y-6 max-w-3xl">
            {content.faq.map((item) => (
              <div key={item.q}>
                <h3 className="text-lg font-semibold">{item.q}</h3>
                <p className="opacity-80 mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold mb-4">Weitere Vergleiche</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            <li>
              <a href="/kalorienzaehler-app/" className="link link-primary">
                Alle {calorieApps.length} Kalorienzähler-Apps im Vergleich
              </a>
            </li>
            {otherGuides.map((app) => (
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

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default AppAlternativePage;
