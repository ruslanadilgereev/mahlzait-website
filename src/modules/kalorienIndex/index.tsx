import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { calculatorSupportLinks, guideSupportLinks } from "utils/seoHubLinks";

interface FoodData {
  slug: string;
  name: string;
  emoji: string;
  category: string;
  overview: {
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
  };
}

interface Props {
  config: TemplateConfig;
  foods: FoodData[];
}

const categories: Record<string, { label: string; emoji: string }> = {
  'supermarkt': { label: 'Supermarkt & Grundnahrungsmittel', emoji: '🛒' },
  'gericht': { label: 'Gerichte & Mahlzeiten', emoji: '🍽️' },
  'fast-food': { label: 'Fast Food & Snacks', emoji: '🍔' },
  'getraenk': { label: 'Getränke', emoji: '🥤' },
};

function KalorienIndexPage({ config, foods }: Props) {
  const grouped: Record<string, FoodData[]> = {};
  for (const food of foods) {
    const cat = food.category || 'sonstiges';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(food);
  }

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
              <li><a href="/" className="hover:text-emerald-600">Startseite</a></li>
              <li>/</li>
              <li className="text-gray-800 font-medium">Kalorientabelle</li>
            </ol>
          </nav>

          {/* Hero */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🍎 Kalorientabelle: Kalorien & Nährwerte von {foods.length}+ Lebensmitteln
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              Wie viele Kalorien hat ein Döner? Wie viel Protein steckt in Hähnchenbrust? 
              Unsere Kalorientabelle zeigt dir <strong>Kalorien, Protein, Kohlenhydrate und Fett</strong> von 
              über {foods.length} Lebensmitteln – von Fast Food bis Obst, von Fertiggerichten bis Grundnahrungsmitteln.
              Alle Angaben pro 100 g, wissenschaftlich fundiert.
            </p>
          </header>

          <section className="mb-10 grid gap-4 md:grid-cols-2">
            {[...guideSupportLinks.slice(0, 2), ...calculatorSupportLinks.slice(0, 2)].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg"
              >
                <h2 className="text-lg font-semibold text-gray-900">{link.title}</h2>
                <p className="mt-2 text-sm text-gray-600">{link.description}</p>
              </a>
            ))}
          </section>

          <div className="flex flex-wrap gap-2 mb-10">
            {Object.entries(categories).map(([catKey, catInfo]) => (
              <a
                key={catKey}
                href={`#${catKey}`}
                className="badge badge-lg badge-outline border-emerald-300 px-4 py-3 text-sm text-emerald-700 hover:bg-emerald-50"
              >
                {catInfo.emoji} {catInfo.label}
              </a>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-700">{foods.length}+</div>
              <div className="text-sm text-emerald-600">Lebensmittel</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{Object.keys(grouped).length}</div>
              <div className="text-sm text-blue-600">Kategorien</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">100%</div>
              <div className="text-sm text-purple-600">Kostenlos</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">2026</div>
              <div className="text-sm text-orange-600">Aktualisiert</div>
            </div>
          </div>

          {/* Intro text for SEO */}
          <section className="prose prose-lg max-w-none mb-10">
            <p>
              Du willst <strong>Kalorien zählen</strong> und suchst eine zuverlässige Kalorientabelle? 
              Bei Mahlzait findest du die Nährwerte von über {foods.length} Lebensmitteln – 
              inklusive beliebter Gerichte wie <a href="/kalorien/doener/">Döner</a>, 
              <a href="/kalorien/pizza/">Pizza</a> und <a href="/kalorien/schnitzel/">Schnitzel</a>. 
              Jede Seite enthält detaillierte Angaben zu <strong>Kalorien, Eiweiß, Kohlenhydraten und Fett</strong> 
              pro 100 g sowie typische Portionsgrößen.
            </p>
            <p>
              Noch einfacher geht's mit der <a href="/">Mahlzait App</a>: 
              Fotografiere dein Essen und unsere KI erkennt automatisch die Kalorien. 
              Oder scanne den Barcode – aus einer Datenbank mit über 10 Millionen Produkten.
              <strong> Kostenlos und werbefrei.</strong>
            </p>
          </section>

          {/* Categories */}
          {Object.entries(categories).map(([catKey, catInfo]) => {
            const items = grouped[catKey];
            if (!items || items.length === 0) return null;
            return (
              <section className="mb-12" id={catKey} key={catKey}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {catInfo.emoji} {catInfo.label} ({items.length})
                  </h2>
                  <a
                    href={`/kalorien/kategorie/${catKey}/`}
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Alle anzeigen →
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((food) => (
                    <a 
                      key={food.slug}
                      href={`/kalorien/${food.slug}/`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors group"
                    >
                      <span className="text-2xl flex-shrink-0">{food.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 group-hover:text-emerald-700 truncate">
                          {food.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {food.overview.calories_per_100g} kcal · {food.overview.protein_per_100g}g Protein · {food.overview.carbs_per_100g}g KH · {food.overview.fat_per_100g}g Fett
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-center text-white mt-12 mb-10">
            <h2 className="text-2xl font-bold mb-3">Kalorien zählen leicht gemacht</h2>
            <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
              Statt jedes Lebensmittel einzeln nachzuschlagen: Lade die Mahlzait App herunter 
              und tracke dein Essen per Foto, Barcode oder Textsuche. Kostenlos & werbefrei.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={config.appStoreLink}
                 className="inline-flex items-center justify-center bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
                 target="_blank" rel="noopener noreferrer">
                🍎 App Store
              </a>
              <a href={config.googlePlayLink}
                 className="inline-flex items-center justify-center bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
                 target="_blank" rel="noopener noreferrer">
                🤖 Google Play
              </a>
            </div>
          </section>

          {/* FAQ for SEO */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Häufige Fragen zur Kalorientabelle</h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                  Wie genau sind die Kalorienangaben?
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  Unsere Nährwertangaben basieren auf der Bundeslebensmittelschlüssel-Datenbank (BLS), 
                  Open Food Facts und wissenschaftlichen Quellen. Alle Werte beziehen sich auf 100 g 
                  des jeweiligen Lebensmittels. Abweichungen je nach Zubereitung und Hersteller sind möglich.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                  Wie viele Kalorien brauche ich am Tag?
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  Der tägliche Kalorienbedarf hängt von Geschlecht, Alter, Größe, Gewicht und Aktivitätslevel ab. 
                  Frauen benötigen durchschnittlich 1.800–2.200 kcal, Männer 2.200–2.800 kcal pro Tag. 
                  Berechne deinen individuellen Bedarf mit unserem <a href="/grundumsatz-rechner/" className="text-emerald-600 hover:underline">Grundumsatz-Rechner</a>.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                  Was ist der Unterschied zwischen Kalorien und Kilokalorien?
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  Im Alltag werden „Kalorien" und „Kilokalorien" (kcal) synonym verwendet. 
                  Streng genommen sind 1 kcal = 1.000 Kalorien. Wenn wir sagen „ein Apfel hat 52 Kalorien", 
                  meinen wir eigentlich 52 Kilokalorien (kcal).
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                  Kann ich mit Kalorien zählen abnehmen?
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  Ja! Das Prinzip ist einfach: Wer weniger Kalorien zu sich nimmt als er verbraucht, 
                  nimmt ab (Kaloriendefizit). Ein Defizit von 500 kcal/Tag führt zu ca. 0,5 kg Gewichtsverlust pro Woche. 
                  Die <a href="/" className="text-emerald-600 hover:underline">Mahlzait App</a> hilft dir dabei, 
                  dein Kaloriendefizit einfach im Blick zu behalten.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                  Welches Lebensmittel hat die meisten Kalorien?
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  Reines Fett und Öle haben mit ca. 900 kcal/100g die höchste Kaloriendichte. 
                  Bei alltäglichen Lebensmitteln sind Nüsse (600+ kcal), Schokolade (500+ kcal) und Chips (500+ kcal) 
                  besonders kalorienreich. In unserer Tabelle findest du die genauen Werte für jedes Lebensmittel.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                  Wie tracke ich Kalorien am einfachsten?
                </summary>
                <p className="px-4 pb-4 text-gray-600">
                  Am schnellsten geht es mit der Mahlzait App: Einfach ein Foto von deinem Essen machen und die 
                  KI erkennt automatisch alle Kalorien und Nährwerte. Alternativ kannst du den Barcode scannen 
                  oder in der Datenbank mit über 10 Mio. Produkten suchen.{" "}
                  <a href="/" className="text-emerald-600 hover:underline">Jetzt kostenlos testen →</a>
                </p>
              </details>
            </div>
          </section>

          {/* Last updated */}
          <p className="text-sm text-gray-400 text-center">
            Zuletzt aktualisiert: März 2026 · {foods.length} Lebensmittel · Alle Angaben ohne Gewähr
          </p>
        </div>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KalorienIndexPage;
