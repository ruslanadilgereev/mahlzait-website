import AppBanner from "@components/appBanner";
import AuthorByline from "@components/AuthorByline";
import Breadcrumbs from "@components/Breadcrumbs";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import type { PlanContent, PlanLink } from "utils/planPages";
import { PLAN_SECTIONS } from "utils/planSections";

interface Props {
  config: TemplateConfig;
  hub: PlanContent;
  pages: PlanLink[];
}

function PlanHubPage({ config, hub, pages }: Props) {
  const section = PLAN_SECTIONS[hub.section];
  const isMeal = hub.section === "ernaehrungsplan";
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: section.label, url: `/${hub.section}/` },
        ]} />

        <div className="mx-auto max-w-screen-lg px-4 py-8 md:py-12">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{hub.h1}</h1>
            <AuthorByline />
            <p className="mt-4 text-lg opacity-80">{hub.intro}</p>
            <a href={section.generatorPath} className="btn btn-primary mt-6">
              {isMeal ? "Eigenen Ernährungsplan erstellen" : "Eigenen Trainingsplan erstellen"}
            </a>
          </header>

          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">
              {pages.length} {isMeal ? "Ernährungspläne mit 7-Tage-Beispiel" : "Trainingspläne mit Beispielwoche"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <a key={page.url} href={page.url} className="card border border-base-300 bg-base-100 transition-colors hover:border-primary">
                  <div className="card-body p-5">
                    <span className="badge badge-primary badge-outline">{page.name}</span>
                    <h3 className="font-bold leading-snug">{page.h1}</h3>
                    <p className="text-sm opacity-70">{page.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <div className="prose prose-lg mx-auto mt-12 max-w-3xl">
            {hub.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                {s.bullets?.length ? <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul> : null}
              </section>
            ))}
          </div>

          <section className="mx-auto mt-12 max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold">Häufige Fragen</h2>
            <div className="space-y-3">
              {hub.faq.map((item) => (
                <details key={item.question} className="rounded-xl border border-base-300 bg-base-100 p-4">
                  <summary className="cursor-pointer font-semibold">{item.question}</summary>
                  <p className="mt-2 text-sm opacity-80">{item.answer}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-sm">
              <a href={isMeal ? "/trainingsplan/" : "/ernaehrungsplan/"} className="link link-primary">
                {isMeal ? "Zu den Trainingsplänen" : "Zu den Ernährungsplänen"}
              </a>
              {" · "}
              <a href={section.generatorPath} className="link link-primary">{section.generatorLabel}</a>
            </p>
          </section>
        </div>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default PlanHubPage;
