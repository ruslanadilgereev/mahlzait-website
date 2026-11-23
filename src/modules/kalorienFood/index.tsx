import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import AuthorByline from "@components/AuthorByline";
import { defaultFoodSupportLinks, foodSupportLinksByCategory } from "utils/seoHubLinks";
import { menge } from "utils/menge";

// Types for the food data JSON
interface FoodVariant {
  name: string;
  portion_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tip?: string;
}

interface FoodComparison {
  name: string;
  calories: number;
  emoji: string;
}

interface FoodTip {
  title: string;
  text: string;
  icon: string;
}

interface FoodFAQ {
  question: string;
  answer: string;
}

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
    // null: der FDC-Eintrag nennt keinen Ballaststoffwert (Anzeige "k. A.")
    fiber_per_100g: number | null;
    typical_portion_g: number;
    typical_portion_name: string;
    // "ml": Werte je 100 ml und Mengen in ml (Herstellerangaben für Getränke)
    einheit?: "ml";
  };
  // Herstellerangabe für Markenprodukte, die USDA FoodData Central nicht führt
  hersteller?: Herstellerangabe;
  variants: FoodVariant[];
  comparison: FoodComparison[];
  tips: FoodTip[];
  faq: FoodFAQ[];
  related_foods: string[];
  // Herkunft der Werte (docs/naehrwerte-herkunft-audit.md); fehlt bei offenen Seiten
  source?: string;
  // Zutaten mit FDC-ID oder mit den Werten einer anderen Seite (slug, Herstellerangabe)
  rezept?: { zutaten: Array<{ name: string; g: number; ml?: number; fdcId?: number; slug?: string }>; gewicht_g?: number };
}

interface Herstellerangabe {
  name: string;
  produkt: string;
  url: string;
  abgerufen: string;
  // allgemeine Seite, deren Werte ein Markenprodukt als Beispiel nennen
  beispiel?: boolean;
}

// Rezeptzutat mit den Werten einer anderen Seite, deren Werte eine Herstellerangabe sind
interface RezeptHerstellerangabe {
  zutat: string;
  slug: string;
  seite: string;
  hersteller: Herstellerangabe;
}

const datum = (iso: string) => iso.split("-").reverse().join(".");
// Hinweis unter der Nährwerttabelle ("Herstellerangabe: ..."), Fußzeile ("Quelle: Herstellerangabe ...")
// oder Rezeptzutat; allgemeine Seiten "Werte am Beispiel ... (Herstellerangabe)"
function herstellerHinweis(h: Herstellerangabe, form: "hinweis" | "quelle" | "zutat") {
  const vor = form === "quelle" ? "Quelle: " : "";
  if (h.beispiel) return `${vor}Werte am Beispiel ${h.name} ${h.produkt} (Herstellerangabe), abgerufen am ${datum(h.abgerufen)}`;
  const art = "Herstellerangabe";
  if (form === "hinweis") return `${art}: ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}`;
  return `${vor}${art} ${h.name}, ${h.produkt}, abgerufen am ${datum(h.abgerufen)}`;
}

interface RelatedArticle {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

interface FoodSpecificCalculator {
  slug: string;
  title: string;
  description: string;
}

interface Props {
  config: TemplateConfig;
  food: FoodData;
  relatedFoodsMeta: Array<{
    slug: string;
    name: string;
    emoji?: string;
  }>;
  relatedArticles?: RelatedArticle[];
  foodSpecificCalculators?: FoodSpecificCalculator[];
  rezeptHerstellerangaben?: RezeptHerstellerangabe[];
}

function KalorienFoodPage({ config, food, relatedFoodsMeta, relatedArticles, foodSpecificCalculators, rezeptHerstellerangaben = [] }: Props) {
  const [portionGrams, setPortionGrams] = useState<number>(food.overview.typical_portion_g);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const multiplier = portionGrams / 100;
  const currentCalories = Math.round(food.overview.calories_per_100g * multiplier);
  const currentProtein = Math.round(food.overview.protein_per_100g * multiplier * 10) / 10;
  const currentCarbs = Math.round(food.overview.carbs_per_100g * multiplier * 10) / 10;
  const currentFat = Math.round(food.overview.fat_per_100g * multiplier * 10) / 10;
  const fiberPer100g = food.overview.fiber_per_100g;
  // FDC-IDs aus dem source-Feld (eigenes Format, siehe scripts/fdc-referenz.mjs)
  const istFdc = typeof food.source === "string" && food.source.startsWith("USDA FoodData Central");
  const istRezept = istFdc && (food.rezept != null || food.source!.includes("Rezeptrechnung"));
  const fdcIds = istFdc
    ? [...new Set([...food.source!.matchAll(/\b\d{6,7}\b/g)].map((m) => m[0]))]
    : [];
  const unit = food.overview.einheit === "ml" ? "ml" : "g";
  const amount = (n: number) => menge(n, unit);
  const per100 = unit === "ml" ? "100 ml" : "100g";
  const currentFiber = fiberPer100g == null ? null : Math.round(fiberPer100g * multiplier * 10) / 10;

  // Statische Mengen-Tabelle: beantwortet "X g <Food> Kalorien"-Suchanfragen crawlbar,
  // ohne dass der Besucher den Schieberegler bedienen muss.
  const amountRows = [...new Set([25, 50, 100, 150, 200, 250, 500, food.overview.typical_portion_g])]
    .sort((a, b) => a - b)
    .map((grams) => ({
      grams,
      isTypical: grams === food.overview.typical_portion_g,
      calories: Math.round((food.overview.calories_per_100g * grams) / 100),
      protein: Math.round((food.overview.protein_per_100g * grams) / 100 * 10) / 10,
      fat: Math.round((food.overview.fat_per_100g * grams) / 100 * 10) / 10,
    }));
  const supportLinks = foodSupportLinksByCategory[food.category] || defaultFoodSupportLinks;

  // Jede Food-Seite verlinkt den App-Vergleich und, reihum nach Slug, eine der
  // Alternativ-Seiten, damit sich die Links gleichmäßig verteilen.
  const comparisonHub = "/kalorienzaehler-app/";
  const alternativeGuides = (config.footer.comparisonLinks ?? []).filter(
    (link) => link.href !== comparisonHub,
  );
  const slugHash = [...food.slug].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
  const alternativeGuide =
    alternativeGuides.length > 0
      ? alternativeGuides[slugHash % alternativeGuides.length]
      : null;

  const burnComparison = [
    { activity: "Joggen", minutes: Math.round(currentCalories / 10), emoji: "🏃" },
    { activity: "Radfahren", minutes: Math.round(currentCalories / 7), emoji: "🚴" },
    { activity: "Schwimmen", minutes: Math.round(currentCalories / 9), emoji: "🏊" },
    { activity: "Spazieren", minutes: Math.round(currentCalories / 4), emoji: "🚶" },
  ];

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {food.name}: Kalorien & Nährwerte
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Wie viele Kalorien hat {food.name.toLowerCase()}? Berechne die Nährwerte mit
              unserem kostenlosen Rechner – mit Portionsgrößen und Varianten.
            </p>
          </header>

          {/* Interactive Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-4">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-6">Kalorien berechnen</h2>

              {/* Portion Size Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Portionsgröße</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">{amount(portionGrams)}</span>
                    {portionGrams === food.overview.typical_portion_g && (
                      <span className="text-sm opacity-60">({food.overview.typical_portion_name})</span>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={Math.round(food.overview.typical_portion_g * 0.25)}
                  max={Math.round(food.overview.typical_portion_g * 3)}
                  step={food.overview.typical_portion_g > 100 ? 10 : 5}
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>{amount(Math.round(food.overview.typical_portion_g * 0.25))}</span>
                  <span>{food.overview.typical_portion_name} ({amount(food.overview.typical_portion_g)})</span>
                  <span>{amount(Math.round(food.overview.typical_portion_g * 3))}</span>
                </div>
              </div>

              {/* Results */}
              <div className="bg-base-200 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <span className="text-5xl font-extrabold text-primary">{currentCalories}</span>
                  <span className="text-xl ml-2 opacity-70">kcal</span>
                </div>

                {/* Macro Breakdown */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="text-center p-3 bg-base-100 rounded-xl">
                    <div className="text-xs opacity-60 mb-1">Protein</div>
                    <div className="text-lg font-bold text-blue-500">{menge(currentProtein)}</div>
                  </div>
                  <div className="text-center p-3 bg-base-100 rounded-xl">
                    <div className="text-xs opacity-60 mb-1">Kohlenhydrate</div>
                    <div className="text-lg font-bold text-yellow-500">{menge(currentCarbs)}</div>
                  </div>
                  <div className="text-center p-3 bg-base-100 rounded-xl">
                    <div className="text-xs opacity-60 mb-1">Fett</div>
                    <div className="text-lg font-bold text-red-500">{menge(currentFat)}</div>
                  </div>
                  <div className="text-center p-3 bg-base-100 rounded-xl">
                    <div className="text-xs opacity-60 mb-1">Ballaststoffe</div>
                    <div className="text-lg font-bold text-green-500">{currentFiber == null ? "k. A." : menge(currentFiber)}</div>
                  </div>
                </div>

                {/* Calorie Bar Visual */}
                <div className="mt-4">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500" style={{ width: `${(currentProtein * 4 / (currentCalories || 1)) * 100}%` }} />
                    <div className="bg-yellow-500" style={{ width: `${(currentCarbs * 4 / (currentCalories || 1)) * 100}%` }} />
                    <div className="bg-red-500" style={{ width: `${(currentFat * 9 / (currentCalories || 1)) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1 opacity-50">
                    <span>Protein {Math.round((currentProtein * 4 / (currentCalories || 1)) * 100)}%</span>
                    <span>Kohlenhydrate {Math.round((currentCarbs * 4 / (currentCalories || 1)) * 100)}%</span>
                    <span>Fett {Math.round((currentFat * 9 / (currentCalories || 1)) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Burn Comparison */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">So verbrennst du {currentCalories} kcal:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {burnComparison.map((b) => (
                    <div key={b.activity} className="text-center p-3 bg-base-200 rounded-xl">
                      <div className="text-2xl mb-1">{b.emoji}</div>
                      <div className="font-bold">{b.minutes} Min.</div>
                      <div className="text-xs opacity-60">{b.activity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* App-Hinweis direkt unter der Kalorien-Antwort, kompakt. Stand vorher
              erst nach FAQ und Artikeln, bei rund 80 % der Seitenlänge
              (OpenSEO-Audit vom 22.11.2026). */}
          <div className="max-w-2xl mx-auto mb-12 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm">
              <span className="font-semibold">{food.name} tracken mit Mahlzait:</span> Foto machen
              oder sagen, was du gegessen hast. Die App schätzt Kalorien und Nährwerte für dein
              Tagebuch.
            </p>
            <div className="flex shrink-0 gap-2">
              <a
                href={config.appStoreLink}
                className="btn btn-sm btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                App Store
              </a>
              <a
                href={config.googlePlayLink}
                className="btn btn-sm btn-outline btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Play
              </a>
            </div>
          </div>

          {/* Nährwerttabelle pro 100g */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">{`Nährwerte pro ${per100}`}</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nährstoff</th>
                      <th className="text-right">pro {per100}</th>
                      <th className="text-right">pro {food.overview.typical_portion_name} ({amount(food.overview.typical_portion_g)})</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold">Kalorien</td>
                      <td className="text-right">{food.overview.calories_per_100g} kcal</td>
                      <td className="text-right font-bold text-primary">{Math.round(food.overview.calories_per_100g * food.overview.typical_portion_g / 100)} kcal</td>
                    </tr>
                    <tr>
                      <td>Protein</td>
                      <td className="text-right">{menge(food.overview.protein_per_100g)}</td>
                      <td className="text-right">{menge(Math.round(food.overview.protein_per_100g * food.overview.typical_portion_g / 100 * 10) / 10)}</td>
                    </tr>
                    <tr>
                      <td>Kohlenhydrate</td>
                      <td className="text-right">{menge(food.overview.carbs_per_100g)}</td>
                      <td className="text-right">{menge(Math.round(food.overview.carbs_per_100g * food.overview.typical_portion_g / 100 * 10) / 10)}</td>
                    </tr>
                    <tr>
                      <td>Fett</td>
                      <td className="text-right">{menge(food.overview.fat_per_100g)}</td>
                      <td className="text-right">{menge(Math.round(food.overview.fat_per_100g * food.overview.typical_portion_g / 100 * 10) / 10)}</td>
                    </tr>
                    <tr>
                      <td>Ballaststoffe</td>
                      <td className="text-right">{fiberPer100g == null ? "k. A." : menge(fiberPer100g)}</td>
                      <td className="text-right">{fiberPer100g == null ? "k. A." : menge(Math.round(fiberPer100g * food.overview.typical_portion_g / 100 * 10) / 10)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {food.hersteller && (
                <p className="mt-4 text-sm opacity-70">
                  {herstellerHinweis(food.hersteller, "hinweis")}.{" "}
                  <a
                    href={food.hersteller.url}
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    Nährwerte beim Hersteller
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Kalorien nach Menge (statisch, crawlbar) */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Kalorien nach Menge</h2>
              <p className="opacity-80 mb-4">
                Wie viele Kalorien haben 50 {unit}, 200 {unit} oder 500 {unit} {food.name}? Die Tabelle zeigt
                Kalorien, Protein und Fett für gängige Mengen, berechnet aus{" "}
                {food.overview.calories_per_100g} kcal pro 100 {unit}.
              </p>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Menge</th>
                      <th className="text-right">Kalorien</th>
                      <th className="text-right">Protein</th>
                      <th className="text-right">Fett</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amountRows.map((row) => (
                      <tr key={row.grams} className={row.isTypical ? "font-semibold" : undefined}>
                        <td>
                          {`${amount(row.grams)} ${food.name}`}
                          {row.isTypical && (
                            <span className="opacity-60 font-normal"> ({food.overview.typical_portion_name})</span>
                          )}
                        </td>
                        <td className={`text-right ${row.isTypical ? "text-primary" : ""}`}>{row.calories} kcal</td>
                        <td className="text-right">{menge(row.protein)}</td>
                        <td className="text-right">{menge(row.fat)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Varianten Vergleich */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Varianten im Vergleich</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Variante</th>
                      <th className="text-right">Portion</th>
                      <th className="text-right">kcal</th>
                      <th className="text-right">Protein</th>
                      <th className="text-right">Fett</th>
                    </tr>
                  </thead>
                  <tbody>
                    {food.variants.map((v, i) => (
                      <tr key={i} className={i === 0 ? "font-semibold" : ""}>
                        <td>
                          {v.name}
                          {v.tip && <div className="text-xs text-primary mt-1">💡 {v.tip}</div>}
                        </td>
                        <td className="text-right">{amount(v.portion_g)}</td>
                        <td className="text-right font-bold">{v.calories}</td>
                        <td className="text-right">{menge(v.protein)}</td>
                        <td className="text-right">{menge(v.fat)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kalorienvergleich */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Kalorienvergleich</h2>
              <p className="opacity-70 mb-4">
                So schneidet {food.name} im Vergleich zu anderen Lebensmitteln ab (pro Portion):
              </p>
              <div className="space-y-3">
                {[{ name: food.name, calories: Math.round(food.overview.calories_per_100g * food.overview.typical_portion_g / 100), emoji: food.emoji }, ...food.comparison]
                  .sort((a, b) => b.calories - a.calories)
                  .map((item, i) => {
                    const maxCal = Math.max(...food.comparison.map(c => c.calories), Math.round(food.overview.calories_per_100g * food.overview.typical_portion_g / 100));
                    const width = (item.calories / maxCal) * 100;
                    const isCurrentFood = item.name === food.name;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isCurrentFood ? "font-bold text-primary" : ""}>
                            {item.emoji} {item.name} {isCurrentFood && "← Dein Essen"}
                          </span>
                          <span className="font-semibold">{item.calories} kcal</span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${isCurrentFood ? "bg-primary" : "bg-base-300"}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Tipps */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Tipps: Kalorien sparen bei {food.name}</h2>
              <div className="space-y-4">
                {food.tips.map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-base-200 rounded-xl">
                    <span className="text-3xl">{tip.icon}</span>
                    <div>
                      <h3 className="font-bold">{tip.title}</h3>
                      <p className="text-sm opacity-80 mt-1">{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Häufige Fragen zu {food.name} Kalorien</h2>
              <div className="space-y-2">
                {food.faq.map((item, i) => (
                  <div key={i} className="collapse collapse-arrow bg-base-200">
                    <input
                      type="radio"
                      name="faq-accordion"
                      checked={openFaq === i}
                      onChange={() => setOpenFaq(openFaq === i ? null : i)}
                    />
                    <div className="collapse-title text-lg font-medium" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      {item.question}
                    </div>
                    <div className="collapse-content">
                      <p className="opacity-80">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Foods */}
          {relatedFoodsMeta.length > 0 && (
            <div className="max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-4">Ähnliche Lebensmittel</h2>
              <div className="flex flex-wrap gap-2">
                {relatedFoodsMeta.map(({ slug }) => (
                  <a
                    key={slug}
                    href={`/kalorien/${slug}/`}
                    className="badge badge-lg badge-outline hover:badge-primary transition-colors py-3 px-4 text-sm"
                  >
                    {slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')} →
                  </a>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                <a href="/kalorien/" className="text-primary hover:underline">
                  → Alle {'>'}200 Lebensmittel in der Kalorientabelle
                </a>
              </p>
            </div>
          )}

          {/* Food-specific Calculators */}
          {foodSpecificCalculators && foodSpecificCalculators.length > 0 && (
            <div className="max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-4">Passende {food.name}-Rechner</h2>
              <p className="opacity-80 mb-5">
                Berechne {food.name.toLowerCase()} im Detail – mit Varianten, Beilagen und
                verschiedenen Portionsgrößen.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {foodSpecificCalculators.map((calc) => (
                  <a
                    key={calc.slug}
                    href={`/${calc.slug}/`}
                    className="card card-compact bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors"
                  >
                    <div className="card-body p-4">
                      <h3 className="font-semibold text-base leading-tight">
                        {calc.title} →
                      </h3>
                      <p className="text-sm opacity-70 line-clamp-2">{calc.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related Wissen Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-4">Wissenschaftlich fundiert</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedArticles.map((ra) => (
                  <a
                    key={ra.slug}
                    href={`/wissen/${ra.slug}/`}
                    className="card card-compact bg-base-200 hover:bg-base-300 transition-colors"
                  >
                    <div className="card-body p-4">
                      <h3 className="font-semibold text-sm leading-tight">{ra.title}</h3>
                      <p className="text-xs opacity-70 line-clamp-2">{ra.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Mehr Kontext zu {food.name}</h2>
              <p className="opacity-80 mb-5">
                Nutze diese Rechner und Guides, wenn du {food.name.toLowerCase()} im Rahmen von
                Kalorienziel, Defizit oder Makro-Planung einordnen willst.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {supportLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-base-300 p-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-base-200/40"
                  >
                    <h3 className="font-semibold">{link.title}</h3>
                    <p className="mt-2 text-sm opacity-70">{link.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Der App-Hinweis steht oben unter dem Rechner; hier bleiben die
              Links zum App-Vergleich. */}
          <p className="max-w-2xl mx-auto mb-12 text-sm text-center opacity-80">
            Du suchst noch die passende App?{" "}
            <a href={comparisonHub} className="link link-primary font-semibold">
              Kalorienzähler-Apps im Vergleich
            </a>
            {alternativeGuide && (
              <>
                {" · "}
                <a href={alternativeGuide.href} className="link link-primary">
                  {alternativeGuide.title}
                </a>
              </>
            )}
          </p>
          {/* Quelle der Werte laut source-Feld (für Zitierbarkeit); ohne belegte Quelle kein Hinweis */}
          <div className="max-w-2xl mx-auto mt-4 mb-12 text-xs opacity-60 text-center leading-relaxed">
            {food.hersteller ? (
              <>{herstellerHinweis(food.hersteller, "quelle")}. </>
            ) : fdcIds.length > 0 ? (
              <>
                Quelle:{" "}
                <a
                  href={fdcIds.length === 1 ? `https://fdc.nal.usda.gov/food-details/${fdcIds[0]}/nutrients` : "https://fdc.nal.usda.gov"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-100"
                >
                  USDA FoodData Central
                </a>
                {istRezept
                  ? `, Rezeptrechnung aus Zutaten mit den FDC-IDs ${fdcIds.join(", ")}${rezeptHerstellerangaben.length ? "" : ". "}`
                  : `, FDC-ID ${fdcIds[0]}, Werte je 100 g. `}
                {istRezept &&
                  rezeptHerstellerangaben.map((r) => (
                    <span key={r.slug}>
                      {`; ${r.zutat}: ${herstellerHinweis(r.hersteller, "zutat")} (Seite `}
                      <a href={`/kalorien/${r.slug}/`} className="underline hover:opacity-100">
                        {r.seite}
                      </a>
                      )
                    </span>
                  ))}
                {istRezept && rezeptHerstellerangaben.length > 0 && ". "}
              </>
            ) : null}
            Korrekturen an{" "}
            <a href="mailto:kontakt@mahlzait.de" className="underline hover:opacity-100">
              kontakt@mahlzait.de
            </a>
            .
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KalorienFoodPage;
