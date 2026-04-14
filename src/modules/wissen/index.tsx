import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { useState, useMemo } from "react";
import type { ArticleMeta } from "@content/wissen";
import { calculatorSupportLinks, guideSupportLinks } from "utils/seoHubLinks";

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
  const [searchquery, setSearchquery] = useState("");

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesTag =
        !selectedTag ||
        article.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      const matchesSearch =
        !searchquery ||
        article.title.toLowerCase().includes(searchquery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchquery.toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [articles, selectedTag, searchquery]);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">
              Wissenschaftlich fundiert · {articles.length} Artikel
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Wissen rund um Kalorien &amp; Ernährung
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              {articles.length} Paper-Analysen aus peer-reviewed Journals
              (JAMA, Lancet, NEJM, BMJ) — verständlich aufbereitet, mit DOI-
              und PubMed-Zitaten. Lerne, was die Wissenschaft wirklich über
              Abnehmen, Stoffwechsel und Ernährung sagt.
            </p>
          </header>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Artikel durchsuchen..."
                className="input input-bordered w-full"
                value={searchquery}
                onChange={(e) => setSearchquery(e.target.value)}
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

          <div className="grid gap-4 md:grid-cols-2 mb-4">
            {[...guideSupportLinks.slice(0, 2), ...calculatorSupportLinks.slice(0, 2)].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <h2 className="text-lg font-semibold">{link.title}</h2>
                <p className="mt-2 text-sm opacity-70">{link.description}</p>
              </a>
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

        {/* Pillar Content: Themen-Cluster */}
        <section className="py-12">
          <div className="max-w-screen-md mx-auto px-4">
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <h2>Worum geht's hier?</h2>
              <p>
                Nutrition-Content ist voll mit widersprüchlichen Meinungen,
                TikTok-Mythen und Diät-Trends. Im Mahlzait-Wissensbereich machen
                wir das Gegenteil: Wir analysieren einzelne Studien und
                Meta-Analysen, benennen Stichprobengröße, Methodik und
                Limitationen, und liefern dir die Forschungslage in 5–20
                Minuten Lesezeit — inklusive DOI zum Selbst-Nachlesen.
              </p>

              <h3>🏃 Abnehmen &amp; Kaloriendefizit</h3>
              <p>
                Der mit Abstand größte Themenblock: Wie viel Defizit ist
                realistisch? Warum funktioniert das{" "}
                <a href="/wissen/schnell-vs-langsam-abnehmen-studie/">
                  schnelle Abnehmen
                </a>{" "}
                trotz aller Gerüchte? Was sagt das NWCR-Register über{" "}
                <a href="/wissen/gewichtsverlust-halten-10-jahre-nwcr/">
                  langfristiges Halten nach 10 Jahren
                </a>
                ? Und welche Rolle spielt{" "}
                <a href="/wissen/app-self-monitoring-adhaerenz-gewichtsverlust/">
                  App-basiertes Self-Monitoring
                </a>{" "}
                dabei? Pro-Tipp: Direkt mit dem{" "}
                <a href="/kaloriendefizit-berechnen/">Defizit-Rechner</a>{" "}
                kombinieren.
              </p>

              <h3>🧠 Mythen &amp; Faktenchecks</h3>
              <p>
                „Kohlenhydrate abends machen dick." „Viele kleine Mahlzeiten
                kurbeln den Stoffwechsel an." „Fett macht fett." Alle diese
                Aussagen halten der Evidenz nicht stand — wir zeigen mit
                Meta-Analysen, wo der Mythos herkommt und was die Forschung
                tatsächlich sagt. Siehe z. B.{" "}
                <a href="/wissen/kohlenhydrate-abends-mythos/">Carbs abends</a>,{" "}
                <a href="/wissen/viele-kleine-mahlzeiten-mythos/">
                  Mahlzeiten-Frequenz
                </a>{" "}
                und <a href="/wissen/fett-macht-fett-mythos-abnehmen/">Fett-Mythos</a>.
              </p>

              <h3>⏰ Intervallfasten &amp; Timing</h3>
              <p>
                Die größte BMJ-Netzwerk-Meta-Analyse 2025, Nachtschicht-Effekte,
                Chronotypen, Zeitfenster-Essen ohne Kalorienzählen — alles, was
                du zum{" "}
                <a href="/wissen/intervallfasten-16-8-anleitung-anfaenger/">
                  Fasten
                </a>{" "}
                wissen solltest. Zum Planen:{" "}
                <a href="/intervallfasten-rechner/">Intervallfasten-Rechner</a>.
              </p>

              <h3>💪 Protein &amp; Muskelaufbau</h3>
              <p>
                Wie viel Eiweiß brauchst du wirklich? Was sagt die{" "}
                <a href="/wissen/protein-abnehmen-muskelmasse-aeltere-meta-analyse/">
                  Meta-Analyse zu Protein bei Älteren
                </a>
                ? Spielt das{" "}
                <a href="/wissen/protein-timing-vor-nach-training-studie/">
                  Timing vor/nach Training
                </a>{" "}
                eine Rolle? Passend dazu:{" "}
                <a href="/protein-bedarf-rechner/">Protein-Bedarf-Rechner</a>{" "}
                und <a href="/makros-berechnen/">Makro-Rechner</a>.
              </p>

              <h3>💊 Medikamente &amp; Neue Ansätze</h3>
              <p>
                Ozempic, Wegovy, Mounjaro — die GLP-1-Agonisten verändern die
                Abnehm-Landschaft. Was sagen STEP 1 und SELECT über Wirkung,
                Nebenwirkungen und Langzeiteffekte? Siehe{" "}
                <a href="/wissen/abnehmspritze-ozempic-wegovy-wirkung/">
                  Abnehmspritze: Ozempic, Wegovy &amp; Co.
                </a>
                .
              </p>

              <h3>😴 Schlaf, Stress, Verhalten</h3>
              <p>
                Abnehmen ist nicht nur Kalorien-Mathematik. Wie wirkt{" "}
                <a href="/wissen/schlaf-verlaengern-weniger-kalorien-rct/">
                  längerer Schlaf auf die Kalorienaufnahme
                </a>
                ? Warum unterschätzen wir{" "}
                <a href="/wissen/restaurant-kalorien-unterschaetzung-studie/">
                  Restaurant-Kalorien
                </a>
                ? Solche Studien zeigen die Verhaltens-Komponenten hinter der
                Waage.
              </p>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg">
                  Über unsere Paper-Analysen
                </h3>
                <p className="opacity-80">
                  Alle Artikel basieren auf peer-reviewed Studien aus
                  anerkannten wissenschaftlichen Journals (JAMA, Lancet, NEJM,
                  BMJ, Cell Metabolism u. a.). Wir übersetzen komplexe
                  Forschungsergebnisse in verständliche Sprache — ohne zu
                  vereinfachen oder wichtige Nuancen zu verlieren.
                </p>
                <p className="opacity-80 mt-2">
                  Jeder Artikel enthält Quellenangaben mit DOI und PubMed-ID,
                  damit du die Originalstudien selbst nachlesen kannst.
                  Medizinische Fragen besprich bitte mit einem Arzt oder einer
                  Ernährungsfachkraft — unsere Artikel dienen der Information,
                  nicht der individuellen Diagnose oder Therapie.
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
              Mit Mahlzait trackst du deine Ernährung in Sekunden. Nutze die
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
