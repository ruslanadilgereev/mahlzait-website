import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { useState, useMemo } from "react";
import type { ArticleMeta } from "@content/wissen";

interface Props {
  config: TemplateConfig;
  articles: ArticleMeta[];
  allTags: string[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function WissenPage({ config, articles, allTags }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesTag =
        !selectedTag ||
        article.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [articles, selectedTag, searchQuery]);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">
              Wissenschaftlich fundiert
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Wissen rund um Kalorien & Ernaehrung
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Paper-Analysen und Forschungserkenntnisse - verstaendlich
              aufbereitet. Lerne, was die Wissenschaft wirklich ueber Abnehmen,
              Stoffwechsel und Ernaehrung sagt.
            </p>
          </header>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Artikel durchsuchen..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tag Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              className={`btn btn-sm ${!selectedTag ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setSelectedTag(null)}
            >
              Alle
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`btn btn-sm ${selectedTag === tag ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Articles Grid */}
        <section className="bg-base-200 py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg opacity-70">
                  Keine Artikel gefunden. Versuche einen anderen Suchbegriff.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <a
                    key={article.slug}
                    href={`/wissen/${article.slug}`}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <div className="card-body">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="badge badge-outline badge-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.featured && (
                          <span className="badge badge-primary badge-sm">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="card-title text-lg leading-tight">
                        {article.title}
                      </h2>

                      {/* Description */}
                      <p className="opacity-80 text-sm line-clamp-3">
                        {article.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-4 text-xs opacity-60">
                        <span>{formatDate(article.publishedAt)}</span>
                        <span>{article.readingTime} Min. Lesezeit</span>
                      </div>

                      {/* Sources hint */}
                      {article.sources.length > 0 && (
                        <div className="mt-2 text-xs opacity-50">
                          {article.sources.length}{" "}
                          {article.sources.length === 1 ? "Quelle" : "Quellen"}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="card-actions justify-end mt-4">
                        <span className="text-primary font-semibold text-sm">
                          Artikel lesen
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg">
                  Ueber unsere Paper-Analysen
                </h3>
                <p className="opacity-80">
                  Alle Artikel basieren auf peer-reviewed Studien aus
                  anerkannten wissenschaftlichen Journals. Wir uebersetzen
                  komplexe Forschungsergebnisse in verstaendliche Sprache - ohne
                  zu vereinfachen oder wichtige Nuancen zu verlieren.
                </p>
                <p className="opacity-80 mt-2">
                  Jeder Artikel enthaelt Quellenangaben mit DOI, damit du die
                  Originalstudien selbst nachlesen kannst.
                </p>
                <div className="card-actions mt-4">
                  <a href="/rechner" className="btn btn-primary btn-sm">
                    Zu den Rechnern
                  </a>
                  <a href="/#live-demo" className="btn btn-ghost btn-sm">
                    App testen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Wissen in die Praxis umsetzen
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Mit Mahlzait trackst du deine Ernaehrung in Sekunden. Nutze die
              wissenschaftlichen Erkenntnisse und starte noch heute mit dem
              Tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/rechner" className="btn btn-lg bg-white text-primary">
                Rechner nutzen
              </a>
              <a
                href={config.appStoreLink}
                className="btn btn-lg bg-white text-primary hover:bg-white/90"
              >
                App laden
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">
              Weitere Ressourcen
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/rechner" className="btn btn-outline">
                Alle Rechner
              </a>
              <a href="/#features" className="btn btn-outline">
                Alle Features
              </a>
              <a href="/#faq" className="btn btn-outline">
                FAQ
              </a>
              <a href="/team" className="btn btn-outline">
                Team
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

export default WissenPage;
