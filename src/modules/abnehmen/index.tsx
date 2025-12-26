import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { abnehmenFaq, abnehmenKeyPoints, abnehmenMistakes } from "./content";

interface Props {
  config: TemplateConfig;
}

function AbnehmenPage({ config }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-10">
            <span className="badge badge-primary badge-lg mb-4">Ratgeber</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Abnehmen: nachhaltig, planbar, ohne Chaos
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
              Abnehmen muss nicht kompliziert sein. Der Kern ist ein Kaloriendefizit – der Rest sind
              Tools, die dir helfen dranzubleiben. Hier bekommst du einen einfachen Plan inklusive
              Rechnern und Tracking‑Tipps.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {abnehmenKeyPoints.map((p) => (
              <div key={p.title} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title text-base">{p.title}</h2>
                  <p className="opacity-80 text-sm">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Plan */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Abnehmen mit Plan</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">1) Kalorienbedarf berechnen</h3>
                  <p className="opacity-80">
                    Ohne Bedarf wird oft „blind“ zu wenig oder zu viel gegessen. Nutze den Rechner
                    als Startpunkt.
                  </p>
                  <div className="card-actions mt-4">
                    <a className="btn btn-primary" href="/kalorienbedarf-berechnen">
                      Kalorienbedarf-Rechner
                    </a>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">2) Defizit festlegen</h3>
                  <p className="opacity-80">
                    Starte moderat. Das fühlt sich im Alltag besser an und ist leichter durchzuhalten
                    als aggressive Cuts.
                  </p>
                  <div className="card-actions mt-4">
                    <a className="btn btn-primary" href="/kaloriendefizit-berechnen">
                      Defizit-Rechner
                    </a>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">3) Makros als Leitplanken</h3>
                  <p className="opacity-80">
                    Ein Makro‑Ziel (v.a. Protein) macht es einfacher satt zu bleiben. Du brauchst
                    keine Perfektion – nur Leitplanken.
                  </p>
                  <div className="card-actions mt-4">
                    <a className="btn btn-primary" href="/makros-berechnen">
                      Makro-Rechner
                    </a>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">4) Tracken, auswerten, anpassen</h3>
                  <p className="opacity-80">
                    Nutze den 7‑Tage‑Trend. Wenn du nicht abnimmst, passe das Ziel leicht an – nicht
                    radikal.
                  </p>
                  <div className="card-actions mt-4">
                    <a className="btn btn-outline" href="/wissen">
                      Studien & Tipps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mistakes */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufige Fehler beim Abnehmen
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {abnehmenMistakes.map((item) => (
                <div key={item.mistake} className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h3 className="font-bold text-error">{item.mistake}</h3>
                    <p className="opacity-80 mt-2">
                      <span className="text-success font-semibold">Besser:</span> {item.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {abnehmenFaq.map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion-ab" />
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Abnehmen mit weniger Reibung</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Setze dein Ziel und logge Mahlzeiten in Sekunden. Wenn Tracking leicht ist, bleibt man
              dran – und genau das bringt Ergebnisse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={config.appStoreLink} className="btn btn-lg bg-white text-primary hover:bg-white/90">
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

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Tools & Ressourcen</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/abnehmen-app" className="btn btn-outline">
                Abnehmen App
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Defizit-Rechner
              </a>
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf-Rechner
              </a>
              <a href="/makros-berechnen" className="btn btn-primary">
                Makro-Rechner
              </a>
              <a href="/wissen" className="btn btn-outline">
                Wissen
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

export default AbnehmenPage;


