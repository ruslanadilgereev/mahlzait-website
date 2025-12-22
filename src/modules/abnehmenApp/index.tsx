import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { abnehmenAppFaq, abnehmenAppFeatures, abnehmenAppKeyPoints } from "./content";

interface Props {
  config: TemplateConfig;
}

function AbnehmenAppPage({ config }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-10">
            <span className="badge badge-primary badge-lg mb-4">App‑Guide</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Abnehmen App: Tracking, das du durchziehst
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
              Abnehmen scheitert selten an Wissen – sondern an Reibung. Eine gute Abnehmen App macht
              Tracking so leicht, dass du konstant bleibst. Genau das bringt dich nach oben.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {abnehmenAppKeyPoints.map((p) => (
              <div key={p.title} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title text-base">{p.title}</h2>
                  <p className="opacity-80 text-sm">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What to look for */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was eine gute Abnehmen App können sollte
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {abnehmenAppFeatures.map((f) => (
                <div key={f.title} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">{f.title}</h3>
                    <p className="opacity-80">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a className="btn btn-primary" href="/abnehmen">
                Abnehmen‑Plan
              </a>
              <a className="btn btn-outline" href="/kaloriendefizit-berechnen">
                Defizit‑Rechner
              </a>
              <a className="btn btn-outline" href="/kalorienbedarf-berechnen">
                Kalorienbedarf‑Rechner
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufige Fragen zur Abnehmen App
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {abnehmenAppFaq.map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion-aba" />
                  <div className="collapse-title text-lg font-medium">{faq.q}</div>
                  <div className="collapse-content">
                    <p className="opacity-80">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Kostenlos starten mit Mahlzait</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Logge Mahlzeiten in Sekunden, setze ein Ziel und sieh deinen Trend. Weniger Aufwand –
              mehr Konsistenz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={config.appStoreLink}
                className="btn btn-lg bg-white text-primary hover:bg-white/90"
              >
                iOS App laden
              </a>
              <a
                href={config.googlePlayLink}
                className="btn btn-lg bg-white text-primary hover:bg-white/90"
              >
                Android App laden
              </a>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weiterlesen</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorien-zaehlen-app" className="btn btn-outline">
                Kalorien zählen App
              </a>
              <a href="/kalorien-zaehlen" className="btn btn-outline">
                Kalorien zählen (Anleitung)
              </a>
              <a href="/wissen" className="btn btn-outline">
                Ernaehrungswissen
              </a>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default AbnehmenAppPage;


