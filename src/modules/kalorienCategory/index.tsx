import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { useState } from "react";

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

interface RelatedArticle {
  slug: string;
  title: string;
  description: string;
}

interface CategoryConfig {
  label: string;
  emoji: string;
  intro: string;
  faq: Array<{ question: string; answer: string }>;
}

interface Props {
  config: TemplateConfig;
  category: string;
  categoryConfig: CategoryConfig;
  foods: FoodData[];
  relatedArticles: RelatedArticle[];
}

const allCategories: Record<string, { label: string; emoji: string; slug: string }> = {
  supermarkt: { label: "Supermarkt", emoji: "🛒", slug: "supermarkt" },
  gericht: { label: "Gerichte", emoji: "🍽️", slug: "gericht" },
  "fast-food": { label: "Fast Food", emoji: "🍔", slug: "fast-food" },
  getraenk: { label: "Getränke", emoji: "🥤", slug: "getraenk" },
};

function KalorienCategoryPage({ config, category, categoryConfig, foods, relatedArticles }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const avgCalories = Math.round(foods.reduce((s, f) => s + f.overview.calories_per_100g, 0) / foods.length);
  const avgProtein = Math.round(foods.reduce((s, f) => s + f.overview.protein_per_100g, 0) / foods.length * 10) / 10;
  const lowestCal = foods.reduce((min, f) => f.overview.calories_per_100g < min.overview.calories_per_100g ? f : min, foods[0]);
  const highestProtein = foods.reduce((max, f) => f.overview.protein_per_100g > max.overview.protein_per_100g ? f : max, foods[0]);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm breadcrumbs mb-6">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/kalorien/">Kalorientabelle</a></li>
              <li className="opacity-70">{categoryConfig.label}</li>
            </ul>
          </nav>

          {/* Category Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(allCategories).map(([key, cat]) => (
              <a
                key={key}
                href={`/kalorien/kategorie/${key}/`}
                className={`badge badge-lg px-4 py-3 text-sm transition-colors ${
                  key === category
                    ? "badge-primary"
                    : "badge-outline hover:badge-primary"
                }`}
              >
                {cat.emoji} {cat.label}
              </a>
            ))}
          </div>

          {/* Hero */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {categoryConfig.emoji} {categoryConfig.label}: Kalorien & Nährwerte
            </h1>
            <p className="text-lg opacity-80 leading-relaxed max-w-3xl">
              {categoryConfig.intro}
            </p>
          </header>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="card bg-base-200">
              <div className="card-body p-4 items-center text-center">
                <div className="text-2xl font-bold text-primary">{foods.length}</div>
                <div className="text-sm opacity-70">Lebensmittel</div>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body p-4 items-center text-center">
                <div className="text-2xl font-bold text-primary">{avgCalories}</div>
                <div className="text-sm opacity-70">Ø kcal/100g</div>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body p-4 items-center text-center">
                <div className="text-2xl font-bold text-primary">{lowestCal.emoji}</div>
                <div className="text-sm opacity-70">Wenigste: {lowestCal.name} ({lowestCal.overview.calories_per_100g})</div>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body p-4 items-center text-center">
                <div className="text-2xl font-bold text-primary">{avgProtein}g</div>
                <div className="text-sm opacity-70">Ø Protein/100g</div>
              </div>
            </div>
          </div>

          {/* Food Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Alle {foods.length} {categoryConfig.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {foods.map((food) => (
                <a
                  key={food.slug}
                  href={`/kalorien/${food.slug}/`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-200 transition-colors group"
                >
                  <span className="text-2xl flex-shrink-0">{food.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-medium group-hover:text-primary truncate">
                      {food.name}
                    </div>
                    <div className="text-sm opacity-60">
                      {food.overview.calories_per_100g} kcal · {food.overview.protein_per_100g}g P · {food.overview.carbs_per_100g}g KH · {food.overview.fat_per_100g}g F
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* FAQ */}
          {categoryConfig.faq.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Häufige Fragen</h2>
              <div className="space-y-3">
                {categoryConfig.faq.map((faq, idx) => (
                  <div key={idx} className="collapse collapse-arrow bg-base-200">
                    <input
                      type="radio"
                      name="category-faq"
                      checked={openFaq === idx}
                      onChange={() => setOpenFaq(openFaq === idx ? null : idx)}
                    />
                    <div className="collapse-title font-semibold">{faq.question}</div>
                    <div className="collapse-content">
                      <p className="opacity-80">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Wissen Articles */}
          {relatedArticles.length > 0 && (
            <section className="mb-12">
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
            </section>
          )}

          {/* Back to Hub + Other Categories */}
          <section className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/kalorien/" className="btn btn-outline">
                ← Alle Lebensmittel
              </a>
              {Object.entries(allCategories)
                .filter(([key]) => key !== category)
                .map(([key, cat]) => (
                  <a key={key} href={`/kalorien/kategorie/${key}/`} className="btn btn-outline">
                    {cat.emoji} {cat.label}
                  </a>
                ))}
            </div>
          </section>

          {/* App CTA */}
          <div className="card bg-primary text-primary-content shadow-xl mb-12">
            <div className="card-body p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Kalorien tracken leicht gemacht</h2>
              <p className="opacity-90 mb-4 max-w-xl mx-auto">
                Statt nachschlagen: Fotografiere dein Essen und Mahlzait berechnet sofort alle Nährwerte. Kostenlos & werbefrei.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={config.appStoreLink} className="btn bg-white text-primary hover:bg-gray-100" target="_blank" rel="noopener noreferrer">
                  🍎 App Store
                </a>
                <a href={config.googlePlayLink} className="btn bg-white text-primary hover:bg-gray-100" target="_blank" rel="noopener noreferrer">
                  ▶️ Google Play
                </a>
              </div>
            </div>
          </div>
        </div>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default KalorienCategoryPage;
