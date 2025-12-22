import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import {
  kalorienZaehlenFaq,
  kalorienZaehlenKeyPoints,
  kalorienZaehlenMistakes,
} from "./content";

interface Props {
  config: TemplateConfig;
}

function KalorienZaehlenPage({ config }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-10">
            <span className="badge badge-primary badge-lg mb-4">Ratgeber</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Kalorien zählen: Schritt-für-Schritt Anleitung
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
              Wenn du abnehmen willst, ist Kalorien zählen der verlässlichste Hebel. Hier bekommst du
              eine klare Anleitung: Kalorienbedarf berechnen, Defizit setzen, Fehler vermeiden – plus
              kostenlose Rechner und Tools.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kalorienZaehlenKeyPoints.map((p) => (
              <div key={p.title} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title text-base">{p.title}</h2>
                  <p className="opacity-80 text-sm">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              So funktioniert Kalorien zählen
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">1) Bedarf berechnen</h3>
                  <p className="opacity-80">
                    Starte mit deinem Kalorienbedarf (TDEE). Ohne diese Zahl ist jede Diät nur
                    Schätzen.
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
                  <h3 className="card-title">2) Defizit planen</h3>
                  <p className="opacity-80">
                    Für nachhaltiges Abnehmen reicht meist ein moderates Defizit. Plane realistisch
                    und bleib konstant.
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
                  <h3 className="card-title">3) Tracken (große Hebel zuerst)</h3>
                  <p className="opacity-80">
                    Erfasse zuerst die „kalorien-dichten“ Zutaten: Öl, Nüsse, Käse, Snacks, Saucen.
                    Damit vermeidest du die häufigsten Abnehm-Stolpersteine.
                  </p>
                  <div className="card-actions mt-4">
                    <a className="btn btn-outline" href="/#live-demo">
                      Live Demo anschauen
                    </a>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">4) Makros als Hilfe nutzen</h3>
                  <p className="opacity-80">
                    Makros sind kein Muss – aber hilfreich: Protein und Ballaststoffe machen satt
                    und erleichtern das Durchhalten.
                  </p>
                  <div className="card-actions mt-4">
                    <a className="btn btn-outline" href="/makros-berechnen">
                      Makro-Rechner
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
              Typische Fehler beim Kalorien zählen
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {kalorienZaehlenMistakes.map((item) => (
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
              {kalorienZaehlenFaq.map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion-kz" />
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Kalorien zählen in Sekunden – mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Logge Mahlzeiten per Foto, Text oder Barcode. Setze dein Kalorienziel und bleib
              konstant – ohne nervige Tipparbeit.
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
            <h3 className="text-lg font-bold mb-6 text-center">Weiterführende Tools</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorien-zaehlen-app" className="btn btn-outline">
                Kalorien zählen App
              </a>
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf berechnen
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
              </a>
              <a href="/makros-berechnen" className="btn btn-outline">
                Makros berechnen
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

export default KalorienZaehlenPage;


