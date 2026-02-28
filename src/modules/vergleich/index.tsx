import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { motion } from "framer-motion";

interface ComparisonFeature {
  name: string;
  mahlzait: boolean;
  mfp: boolean;
  yazio: boolean;
  lifesum: boolean;
}

interface PricingInfo {
  app: string;
  free: string;
  pro: string;
}

interface Props {
  config: TemplateConfig;
  comparisonData: {
    apps: { name: string; logo: string }[];
    features: ComparisonFeature[];
    pricing: PricingInfo[];
  };
}

function VergleichPage({ config, comparisonData }: Props) {
  const { features, pricing } = comparisonData;

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Vergleich 2025</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Mahlzait vs MyFitnessPal vs Yazio vs Lifesum
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Welcher Kalorienzähler ist der beste für dich? 
              Wir vergleichen Features, Preise und die wichtigsten Unterschiede.
            </p>
          </header>
        </section>

        {/* Feature Comparison Table */}
        <section className="pb-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-x-auto"
            >
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-left">Feature</th>
                    <th className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <img src="/logo.png" alt="Mahlzait Logo" className="w-8 h-8 rounded-lg" width={32} height={32} />
                        <span className="font-bold text-primary">Mahlzait</span>
                      </div>
                    </th>
                    <th className="text-center">
                      <span className="font-semibold">MyFitnessPal</span>
                    </th>
                    <th className="text-center">
                      <span className="font-semibold">Yazio</span>
                    </th>
                    <th className="text-center">
                      <span className="font-semibold">Lifesum</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index}>
                      <td className="font-medium">{feature.name}</td>
                      <td className="text-center">
                        {feature.mahlzait ? (
                          <span className="text-success text-2xl">✓</span>
                        ) : (
                          <span className="text-error text-2xl">✗</span>
                        )}
                      </td>
                      <td className="text-center">
                        {feature.mfp ? (
                          <span className="text-success text-2xl">✓</span>
                        ) : (
                          <span className="text-error text-2xl">✗</span>
                        )}
                      </td>
                      <td className="text-center">
                        {feature.yazio ? (
                          <span className="text-success text-2xl">✓</span>
                        ) : (
                          <span className="text-error text-2xl">✗</span>
                        )}
                      </td>
                      <td className="text-center">
                        {feature.lifesum ? (
                          <span className="text-success text-2xl">✓</span>
                        ) : (
                          <span className="text-error text-2xl">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Preisvergleich
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pricing.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`card bg-base-100 shadow-xl ${
                    item.app === "Mahlzait" ? "border-2 border-primary" : ""
                  }`}
                >
                  <div className="card-body">
                    <h3 className={`card-title ${item.app === "Mahlzait" ? "text-primary" : ""}`}>
                      {item.app}
                      {item.app === "Mahlzait" && (
                        <span className="badge badge-primary badge-sm">Empfohlen</span>
                      )}
                    </h3>
                    <div className="divider my-2"></div>
                    <div>
                      <p className="text-sm opacity-70">Kostenlose Version:</p>
                      <p className="font-semibold">{item.free}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm opacity-70">Pro-Version:</p>
                      <p className="font-semibold">{item.pro}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Mahlzait */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum Mahlzait wählen?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card bg-gradient-to-br from-primary/10 to-primary/5"
              >
                <div className="card-body">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="card-title">Modernste KI</h3>
                  <p className="opacity-80">
                    Mahlzait nutzt Large Language Models mit Grounding auf aktuellen Datenquellen. 
                    Einfach "200g Hähnchen mit Reis und Soße" eingeben - die KI versteht es.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="card bg-gradient-to-br from-secondary/10 to-secondary/5"
              >
                <div className="card-body">
                  <div className="text-4xl mb-4">🔗</div>
                  <h3 className="card-title">Rezept-URLs importieren</h3>
                  <p className="opacity-80">
                    Chefkoch, Eat This, oder jede andere Rezeptseite - einfach URL einfügen und 
                    die KI extrahiert alle Nährwerte automatisch.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="card bg-gradient-to-br from-accent/10 to-accent/5"
              >
                <div className="card-body">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="card-title">DSGVO-konform</h3>
                  <p className="opacity-80">
                    Deine Daten bleiben in Europa und gehören dir. Keine Werbung, kein Verkauf 
                    deiner Ernährungsdaten an Dritte.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="collapse collapse-plus bg-base-100">
                <input type="radio" name="faq-accordion" defaultChecked />
                <div className="collapse-title text-lg font-medium">
                  Was unterscheidet Mahlzait von MyFitnessPal?
                </div>
                <div className="collapse-content">
                  <p>
                    Mahlzait nutzt moderne KI (LLMs) für die Lebensmittelerkennung, während MyFitnessPal 
                    auf eine traditionelle Datenbank setzt. Mit Mahlzait kannst du Mahlzeiten per Text 
                    beschreiben ("200g Hähnchen mit Reis") oder Rezept-URLs importieren. MyFitnessPal 
                    erfordert meist manuelle Suche und Auswahl aus der Datenbank.
                  </p>
                </div>
              </div>
              <div className="collapse collapse-plus bg-base-100">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-lg font-medium">
                  Ist Mahlzait wirklich kostenlos?
                </div>
                <div className="collapse-content">
                  <p>
                    Ja, Mahlzait bietet eine vollständige kostenlose Version ohne Werbung. Die Pro-Version 
                    (4,99€/Monat) bietet unbegrenzte KI-Anfragen und zusätzliche Features, aber das 
                    Basis-Tracking ist dauerhaft kostenlos.
                  </p>
                </div>
              </div>
              <div className="collapse collapse-plus bg-base-100">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-lg font-medium">
                  Welche Kalorienzähler-App ist am genauesten?
                </div>
                <div className="collapse-content">
                  <p>
                    Mahlzait nutzt KI mit Grounding auf aktuellen Datenquellen wie Open Food Facts, was 
                    zu präziseren Ergebnissen führt als statische Datenbanken. Die KI kann auch 
                    Portionsgrößen besser einschätzen und ungewöhnliche Gerichte erkennen.
                  </p>
                </div>
              </div>
              <div className="collapse collapse-plus bg-base-100">
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-lg font-medium">
                  Kann ich von MyFitnessPal zu Mahlzait wechseln?
                </div>
                <div className="collapse-content">
                  <p>
                    Ja, der Wechsel ist einfach. Mahlzait benötigt keine Datenübertragung - starte einfach 
                    neu und nutze die KI-Eingabe für schnelleres Tracking. Dein Kalorienziel und 
                    Körperdaten sind in Sekunden eingerichtet.
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
              Bereit für smarteres Tracking?
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Probiere Mahlzait kostenlos aus und erlebe den Unterschied. 
              KI-gestütztes Tracking, das wirklich funktioniert.
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

        {/* Data Sources */}
        <section className="py-8 bg-base-100">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <p className="text-sm opacity-60">
              Nährwertdaten basieren auf <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="link">Open Food Facts</a> und 
              weiteren verifizierten Quellen. Stand: 2025.
            </p>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default VergleichPage;
