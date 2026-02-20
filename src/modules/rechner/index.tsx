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
    title: "Grundumsatz Rechner",
    desc: "Berechne deinen Grundumsatz (BMR) und Gesamtenergieumsatz (TDEE). Die perfekte Basis für Abnehmen oder Muskelaufbau.",
    link: "/grundumsatz-rechner",
    icon: "/3D/bulb-front-color.webp",
    features: ["Grundumsatz (BMR)", "Gesamtenergieumsatz (TDEE)", "Kalorienziele"],
    color: "primary",
  },
  {
    title: "BMI Rechner",
    desc: "Berechne deinen Body Mass Index (BMI) und finde heraus, ob dein Gewicht im gesunden Bereich liegt. Mit WHO-Kategorien und Idealgewicht.",
    link: "/bmi-rechner",
    icon: "/3D/heart-front-color.webp",
    features: ["BMI berechnen", "WHO-Kategorien", "Idealgewicht"],
    color: "info",
  },
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
  {
    title: "Abnahmedatum berechnen",
    desc: "Wann erreichst du dein Zielgewicht? Berechne dein exaktes Datum basierend auf deinem geplanten Defizit.",
    link: "/abnahmedatum-berechnen",
    icon: "/3D/calender-front-color.webp",
    features: ["Exaktes Zieldatum", "Tage bis zum Ziel", "Defizit-Slider"],
    color: "accent",
  },
  {
    title: "Kalorienverbrauch Rechner",
    desc: "Wie lange musst du joggen für einen Döner? Finde heraus, wie viel Sport dein Essen kostet.",
    link: "/kalorienverbrauch-rechner",
    icon: "/3D/gym-front-color.webp",
    features: ["10 beliebte Foods", "6 Sportarten", "Minuten-Berechnung"],
    color: "warning",
  },
  {
    title: "Protein-Bedarf Rechner",
    desc: "Berechne deinen optimalen täglichen Proteinbedarf. Basierend auf Gewicht, Aktivitätslevel und deinen Zielen.",
    link: "/protein-bedarf-rechner",
    icon: "/3D/heart-front-color.webp",
    features: ["Individueller Proteinbedarf", "Nach Aktivitätslevel", "Zielbasiert"],
    color: "error",
  },
  {
    title: "Alkohol-Kalorien Rechner",
    desc: "Wie viele Kalorien hat dein Feierabendbier? Finde heraus, wie viele Kalorien verschiedene Getränke haben.",
    link: "/alkohol-kalorien-rechner",
    icon: "/3D/bulb-front-color.webp",
    features: ["Bier, Wein, Cocktails", "Pro Glas & pro Abend", "Versteckte Kalorien"],
    color: "info",
  },
  {
    title: "Wasserbedarfs-Rechner",
    desc: "Wie viel Wasser solltest du täglich trinken? Berechne deinen optimalen Wasserbedarf basierend auf Gewicht, Aktivität und Klima.",
    link: "/wasserbedarf-rechner",
    icon: "/3D/heart-front-color.webp",
    features: ["Individueller Wasserbedarf", "Aktivität & Klima", "Praktische Tipps"],
    color: "primary",
  },
  {
    title: "Intervallfasten-Rechner",
    desc: "Finde den perfekten Fasten-Zeitplan für deinen Alltag. 16:8, 18:6, 5:2 oder individuell – berechne dein Ess- und Fastenfenster.",
    link: "/intervallfasten-rechner",
    icon: "/3D/calender-front-color.webp",
    features: ["16:8, 18:6, 20:4, 5:2", "Persönlicher Zeitplan", "Tipps & FAQ"],
    color: "secondary",
  },
  {
    title: "Schritte in Kalorien Rechner",
    desc: "Wie viele Kalorien verbrennen 10.000 Schritte? Berechne deinen Kalorienverbrauch beim Gehen basierend auf Gewicht und Tempo.",
    link: "/schritte-kalorien-rechner",
    icon: "/3D/gym-front-color.webp",
    features: ["Kalorien pro Schritt", "Distanz & Dauer", "Wöchentliche Prognose"],
    color: "accent",
  },
  {
    title: "Döner Kalorien Rechner",
    desc: "Wie viele Kalorien hat dein Döner wirklich? Berechne Kalorien für Döner Kebab, Dürüm, Lahmacun und mehr.",
    link: "/doener-kalorien-rechner",
    icon: "/3D/bulb-front-color.webp",
    features: ["Döner, Dürüm, Lahmacun", "Fleisch, Sauce, Extras", "Kalorientabelle"],
    color: "warning",
  },
  {
    title: "Cheat-Day Rechner",
    desc: "Plane deinen Cheat-Day clever! Berechne, wie viele Extra-Kalorien du dir gönnen kannst, ohne dein Ziel zu gefährden.",
    link: "/cheat-day-rechner",
    icon: "/3D/target-front-color.webp",
    features: ["Extra-Kalorien planen", "Wöchentliche Bilanz", "Ohne Schuldgefühle"],
    color: "error",
  },
  {
    title: "Körperfettanteil Rechner",
    desc: "Berechne deinen Körperfettanteil (KFA) mit der US Navy Methode. Genauer als BMI und perfekt für Fitness-Ziele.",
    link: "/koerperfett-rechner",
    icon: "/3D/heart-front-color.webp",
    features: ["KFA in Prozent", "Fett- & Magermasse", "Genauer als BMI"],
    color: "success",
  },
  {
    title: "Idealgewicht Rechner",
    desc: "Berechne dein persönliches Idealgewicht mit 4 wissenschaftlichen Formeln. Broca, Lorentz, BMI-Methode und mehr.",
    link: "/idealgewicht-rechner",
    icon: "/3D/target-front-color.webp",
    features: ["4 Berechnungsmethoden", "Geschlecht & Körperbau", "Idealgewicht-Tabelle"],
    color: "info",
  },
  {
    title: "Koffein-Rechner",
    desc: "Wie viel Koffein nimmst du täglich zu dir? Tracke deinen Konsum und finde heraus, ob du das Tageslimit überschreitest.",
    link: "/koffein-rechner",
    icon: "/3D/bulb-front-color.webp",
    features: ["Kaffee, Energy Drinks, Tee", "EFSA-Tageslimit (400mg)", "Koffeingehalt pro Getränk"],
    color: "warning",
  },
  {
    title: "Schlaf-Rechner",
    desc: "Berechne optimale Schlaf- und Aufwachzeiten basierend auf 90-Minuten-Schlafzyklen. Wach erfrischt auf statt müde.",
    link: "/schlaf-rechner",
    icon: "/3D/calender-front-color.webp",
    features: ["Optimale Schlafenszeit", "Aufwachzeit berechnen", "Schlafzyklen verstehen"],
    color: "secondary",
  },
  {
    title: "Pizza Kalorien Rechner",
    desc: "Wie viele Kalorien hat deine Pizza? Berechne Kalorien für Margherita, Salami, Hawaii und mehr – mit Grösse und Belägen.",
    link: "/pizza-kalorien-rechner",
    icon: "/3D/bulb-front-color.webp",
    features: ["10+ Pizza-Sorten", "Grösse, Teig & Beläge", "Kalorientabelle"],
    color: "error",
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

