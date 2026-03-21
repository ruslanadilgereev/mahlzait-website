import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import AuthorByline from "@components/AuthorByline";

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
    fiber_per_100g: number;
    typical_portion_g: number;
    typical_portion_name: string;
  };
  variants: FoodVariant[];
  comparison: FoodComparison[];
  tips: FoodTip[];
  faq: FoodFAQ[];
  related_foods: string[];
}

interface Props {
  config: TemplateConfig;
  food: FoodData;
}

function KalorienFoodPage({ config, food }: Props) {
  const [portionGrams, setPortionGrams] = useState<number>(food.overview.typical_portion_g);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const multiplier = portionGrams / 100;
  const currentCalories = Math.round(food.overview.calories_per_100g * multiplier);
  const currentProtein = Math.round(food.overview.protein_per_100g * multiplier * 10) / 10;
  const currentCarbs = Math.round(food.overview.carbs_per_100g * multiplier * 10) / 10;
  const currentFat = Math.round(food.overview.fat_per_100g * multiplier * 10) / 10;
  const currentFiber = Math.round(food.overview.fiber_per_100g * multiplier * 10) / 10;

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
              {food.emoji} {food.name} Kalorien Rechner
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Wie viele Kalorien hat {food.name.toLowerCase()}? Berechne die Nährwerte mit
              unserem kostenlosen Rechner – mit Portionsgrößen und Varianten.
            </p>
          </header>

          {/* Interactive Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-6">Kalorien berechnen</h2>

              {/* Portion Size Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Portionsgröße</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">{portionGrams}g</span>
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
                  <span>{Math.round(food.overview.typical_portion_g * 0.25)}g</span>
                  <span>{food.overview.typical_portion_name} ({food.overview.typical_portion_g}g)</span>
                  <span>{Math.round(food.overview.typical_portion_g * 3)}g</span>
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
                    <div className="text-lg font-bold text-blue-500">{currentProtein}g</div>
                  </div>
                  <div className="text-center p-3 bg-base-100 rounded-xl">
                    <div className="text-xs opacity-60 mb-1">Kohlenhydrate</div>
                    <div className="text-lg font-bold text-yellow-500">{currentCarbs}g</div>
                  </div>
                  <div className="text-center p-3 bg-base-100 rounded-xl">
                    <div className="text-xs opacity-60 mb-1">Fett</div>
                    <div className="text-lg font-bold text-red-500">{currentFat}g</div>
                  </div>
                  <div className="text-center p-3 bg-base-100 rounded-xl">
                    <div className="text-xs opacity-60 mb-1">Ballaststoffe</div>
                    <div className="text-lg font-bold text-green-500">{currentFiber}g</div>
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

          {/* Nährwerttabelle pro 100g */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">📊 Nährwerte pro 100g</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nährstoff</th>
                      <th className="text-right">pro 100g</th>
                      <th className="text-right">pro {food.overview.typical_portion_name} ({food.overview.typical_portion_g}g)</th>
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
                      <td className="text-right">{food.overview.protein_per_100g}g</td>
                      <td className="text-right">{Math.round(food.overview.protein_per_100g * food.overview.typical_portion_g / 100 * 10) / 10}g</td>
                    </tr>
                    <tr>
                      <td>Kohlenhydrate</td>
                      <td className="text-right">{food.overview.carbs_per_100g}g</td>
                      <td className="text-right">{Math.round(food.overview.carbs_per_100g * food.overview.typical_portion_g / 100 * 10) / 10}g</td>
                    </tr>
                    <tr>
                      <td>Fett</td>
                      <td className="text-right">{food.overview.fat_per_100g}g</td>
                      <td className="text-right">{Math.round(food.overview.fat_per_100g * food.overview.typical_portion_g / 100 * 10) / 10}g</td>
                    </tr>
                    <tr>
                      <td>Ballaststoffe</td>
                      <td className="text-right">{food.overview.fiber_per_100g}g</td>
                      <td className="text-right">{Math.round(food.overview.fiber_per_100g * food.overview.typical_portion_g / 100 * 10) / 10}g</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Varianten Vergleich */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">🔄 Varianten im Vergleich</h2>
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
                        <td className="text-right">{v.portion_g}g</td>
                        <td className="text-right font-bold">{v.calories}</td>
                        <td className="text-right">{v.protein}g</td>
                        <td className="text-right">{v.fat}g</td>
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
              <h2 className="text-2xl font-bold mb-4">⚖️ Kalorienvergleich</h2>
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
              <h2 className="text-2xl font-bold mb-4">💡 Tipps: Kalorien sparen bei {food.name}</h2>
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
              <h2 className="text-2xl font-bold mb-4">❓ Häufige Fragen zu {food.name} Kalorien</h2>
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
          {food.related_foods && food.related_foods.length > 0 && (
            <div className="max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-4">🔗 Ähnliche Lebensmittel</h2>
              <div className="flex flex-wrap gap-2">
                {food.related_foods.map((slug: string) => (
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

          {/* App CTA */}
          <div className="card bg-primary text-primary-content shadow-xl max-w-2xl mx-auto mb-12">
            <div className="card-body p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">{food.emoji} {food.name} tracken mit Mahlzait</h2>
              <p className="opacity-90 mb-4">
                Fotografiere dein Essen und erhalte sofort alle Nährwerte. KI-gestützt, kostenlos, auf Deutsch.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={config.appStoreLink}
                  className="btn btn-lg bg-white text-primary hover:bg-gray-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🍎 App Store
                </a>
                <a
                  href={config.googlePlayLink}
                  className="btn btn-lg bg-white text-primary hover:bg-gray-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🤖 Google Play
                </a>
              </div>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KalorienFoodPage;
