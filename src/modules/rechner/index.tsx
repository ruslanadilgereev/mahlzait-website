import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

const calculators = [
  {
    title: "Kalorienbedarf berechnen",
    desc: "Berechne deinen täglichen Kalorienbedarf mit der Mifflin-St Jeor Formel. Erfahre deinen Grundumsatz (BMR) und Gesamtbedarf (TDEE).",
    link: "/kalorienbedarf-berechnen",
    icon: "/3D/bulb-front-color.webp",
    features: ["Grundumsatz (BMR)", "Gesamtbedarf (TDEE)", "Aktivitätslevel"],
    color: "primary",
  },
  {
    title: "Kaloriendefizit berechnen",
    desc: "Plane dein Abnehm-Ziel. Berechne das ideale Kaloriendefizit und erfahre, wann du dein Zielgewicht erreichst.",
    link: "/kaloriendefizit-berechnen",
    icon: "/3D/target-front-color.webp",
    features: ["Defizit-Rechner", "Zielgewicht-Prognose", "Wochen bis zum Ziel"],
    color: "success",
  },
  {
    title: "Makros berechnen",
    desc: "Berechne deine optimale Makroverteilung für Abnehmen, Muskelaufbau oder Gewicht halten. Protein, Carbs und Fett in Gramm.",
    link: "/makros-berechnen",
    icon: "/3D/chart-front-color.webp",
    features: ["Protein in Gramm", "Kohlenhydrate in Gramm", "Fett in Gramm"],
    color: "secondary",
  },
];

function RechnerPage({ config }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenlose Tools</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Ernährungsrechner
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Kostenlose Rechner für Kalorien, Makros und mehr. 
              Berechne deinen Bedarf und starte mit dem Tracking.
            </p>
          </header>
        </section>

        {/* Calculator Cards */}
        <section className="pb-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {calculators.map((calc, index) => (
                <a
                  key={index}
                  href={calc.link}
                  className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-${calc.color}`}
                >
                  <div className="card-body">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-${calc.color}/10`}>
                        <img src={calc.icon} alt="" className="w-12 h-12 object-contain aspect-square" />
                      </div>
                      <h2 className="card-title text-xl">{calc.title}</h2>
                    </div>
                    <p className="opacity-80 mb-4">{calc.desc}</p>
                    <ul className="space-y-2">
                      {calc.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <svg
                            className={`w-4 h-4 text-${calc.color}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="card-actions justify-end mt-6">
                      <span className="btn btn-primary">Rechner öffnen</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Why Use Calculators */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum diese Rechner nutzen?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card bg-base-100 shadow">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">1</div>
                  <h3 className="font-bold">Wissenschaftlich fundiert</h3>
                  <p className="opacity-80 text-sm">
                    Alle Berechnungen basieren auf anerkannten Formeln wie der Mifflin-St Jeor Gleichung.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">2</div>
                  <h3 className="font-bold">Personalisiert</h3>
                  <p className="opacity-80 text-sm">
                    Die Ergebnisse werden individuell auf dein Alter, Gewicht, Grösse und Ziel angepasst.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">3</div>
                  <h3 className="font-bold">Sofort umsetzbar</h3>
                  <p className="opacity-80 text-sm">
                    Nutze die Ergebnisse direkt in der Mahlzait App und starte mit dem Tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ergebnisse direkt in der App tracken
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen Bedarf. Mit Mahlzait setzt du dein Kalorienziel und 
              trackst Mahlzeiten in Sekunden - per Foto, Text oder Barcode.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={config.appStoreLink} className="btn btn-lg bg-white text-primary hover:bg-white/90">
                iOS App laden
              </a>
              <a href={config.googlePlayLink} className="btn btn-lg bg-white text-primary hover:bg-white/90">
                Android App laden
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Mehr entdecken</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/wissen" className="btn btn-outline">
                Ernährungswissen
              </a>
              <a href="/kalorien-zaehlen" className="btn btn-outline">
                Kalorien zählen
              </a>
              <a href="/abnehmen" className="btn btn-outline">
                Abnehmen
              </a>
              <a href="/#features" className="btn btn-outline">
                Alle Features
              </a>
              <a href="/#live-demo" className="btn btn-outline">
                Live Demo
              </a>
              <a href="/#faq" className="btn btn-outline">
                FAQ
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

export default RechnerPage;

