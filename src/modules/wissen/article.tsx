import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import type { ArticleMeta } from "@content/wissen";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface RelatedFood {
  slug: string;
  name: string;
  emoji: string;
  calories_per_100g: number;
}

interface RelatedCalculator {
  slug: string;
  title: string;
  description: string;
}

interface Props {
  config: TemplateConfig;
  article: ArticleMeta;
  content: string;
  relatedArticles?: ArticleMeta[];
  relatedFoods?: RelatedFood[];
  relatedCalculators?: RelatedCalculator[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticlePage({ config, article, content, relatedArticles, relatedFoods, relatedCalculators }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Article Header */}
        <article className="max-w-screen-md mx-auto py-8 px-4 md:py-16">
          {/* Breadcrumb */}
          <nav className="text-sm breadcrumbs mb-6">
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/wissen">Wissen</a>
              </li>
              <li className="opacity-70">{article.title}</li>
            </ul>
          </nav>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <a
                key={tag}
                href={`/wissen?tag=${encodeURIComponent(tag)}`}
                className="badge badge-outline hover:badge-primary transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            {article.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm opacity-70 mb-4">
            <span>
              Von{" "}
              <a href="/team" className="font-medium text-primary hover:underline">
                Ruslan Adilgereev
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(article.publishedAt)}</span>
            {article.updatedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>Aktualisiert: {formatDate(article.updatedAt)}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} Min. Lesezeit</span>
          </div>

          {/* Expert Review Byline (E-E-A-T) */}
          {article.reviewer && (
            <div className="flex items-start gap-2 text-sm mb-8 p-3 rounded-lg bg-success/10 border border-success/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-success shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <span className="font-medium">Fachlich geprüft von: </span>
                {article.reviewer.url ? (
                  <a
                    href={article.reviewer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {article.reviewer.name}
                  </a>
                ) : (
                  <span className="font-medium">{article.reviewer.name}</span>
                )}
                <span className="opacity-70"> · {article.reviewer.credentials}</span>
                <span className="opacity-60 block text-xs mt-0.5">
                  Letzte Prüfung: {formatDate(article.reviewer.reviewedAt)}
                </span>
              </div>
            </div>
          )}

          {/* Kernaussage / TL;DR (AI-quotable) */}
          {article.kernaussage && (
            <aside
              aria-label="Kernaussage"
              className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-5"
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Kernaussage
              </div>
              <p className="text-base md:text-lg leading-relaxed">
                {article.kernaussage}
              </p>
            </aside>
          )}

          {/* Lead / Description */}
          <p className="article-lead text-lg md:text-xl opacity-80 mb-8 border-l-4 border-primary pl-4">
            {article.description}
          </p>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary prose-blockquote:bg-base-200 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-table:border-collapse prose-th:border prose-th:border-base-300 prose-th:bg-base-200 prose-th:p-2 prose-td:border prose-td:border-base-300 prose-td:p-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
          </div>

          {/* Sources Box */}
          {article.sources.length > 0 && (
            <div id="quellen" className="mt-12 card bg-base-200 scroll-mt-24">
              <div className="card-body">
                <h3 className="card-title text-lg">
                  Wissenschaftliche Quellen
                </h3>
                <ul className="space-y-3">
                  {article.sources.map((source, idx) => (
                    <li key={idx} className="text-sm flex gap-3">
                      <span className="font-mono text-xs opacity-50 mt-0.5 shrink-0">
                        [{idx + 1}]
                      </span>
                      <div>
                        <p>
                          <span className="font-semibold">{source.authors}</span>.{" "}
                          "{source.title}."{" "}
                          <em className="opacity-80">{source.journal}</em>,{" "}
                          {source.year}.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {source.doi && (
                            <a
                              href={`https://doi.org/${source.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary text-xs"
                            >
                              DOI: {source.doi}
                            </a>
                          )}
                          {source.pmid && (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary text-xs"
                            >
                              PubMed: {source.pmid}
                            </a>
                          )}
                          {source.url && !source.doi && !source.pmid && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary text-xs"
                            >
                              Link
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* FAQ Section (AI-quotable + FAQPage schema) */}
          {article.faqs && article.faqs.length > 0 && (
            <section id="faq" aria-labelledby="faq-heading" className="mt-12 scroll-mt-24">
              <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold mb-6">
                Häufige Fragen
              </h2>
              <div className="space-y-3">
                {article.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group rounded-lg border border-base-300 bg-base-100 overflow-hidden"
                  >
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-4 py-3 font-semibold hover:bg-base-200 transition-colors">
                      <span>{faq.question}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-base leading-relaxed opacity-90">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* USP Brand Hint (AI-quotable + Branding) */}
          <aside
            aria-label="Mahlzait-Differenzierung"
            className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-5"
          >
            <h3 className="text-lg font-bold mb-2">
              Mahlzait — die einzige App in DACH, die …
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
              <li>
                Mahlzeiten gleichzeitig per Foto, Video, Barcode, Text und Rezept-Link erkennt
              </li>
              <li>
                bei unklaren Werten live im Web nach offiziellen Nährwerten recherchiert (mit Quellenangabe)
              </li>
              <li>
                8 Makros statt 4 trackt — mit Quellenangabe pro Eintrag, sodass du siehst, woher die Werte kommen
              </li>
            </ul>
            <a
              href={config.appStoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm mt-4"
            >
              Jetzt kostenlos testen
            </a>
          </aside>

          {/* Disclaimer */}
          <div className="mt-8 alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-sm">
              Dieser Artikel dient der allgemeinen Information und ersetzt keine
              ärztliche Beratung. Bei Fragen zu deiner Gesundheit wende dich
              bitte an einen Arzt oder eine Ernährungsfachkraft. Mehr dazu in
              unseren{" "}
              <a href="/redaktionelle-standards/" className="link link-primary">
                redaktionellen Standards
              </a>
              .
            </span>
          </div>
          {/* Related Calculators */}
          {relatedCalculators && relatedCalculators.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Passende Rechner</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedCalculators.map((calc) => (
                  <a
                    key={calc.slug}
                    href={`/${calc.slug}/`}
                    className="card card-compact bg-base-200 hover:bg-base-300 transition-colors"
                  >
                    <div className="card-body p-4">
                      <h3 className="font-semibold text-base leading-tight">{calc.title} →</h3>
                      <p className="text-sm opacity-70 line-clamp-2">{calc.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related Foods */}
          {relatedFoods && relatedFoods.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Relevante Lebensmittel</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedFoods.map((food) => (
                  <a
                    key={food.slug}
                    href={`/kalorien/${food.slug}/`}
                    className="card card-compact bg-base-200 hover:bg-base-300 transition-colors"
                  >
                    <div className="card-body items-center text-center p-3">
                      <span className="text-2xl">{food.emoji}</span>
                      <span className="font-semibold text-sm">{food.name}</span>
                      <span className="text-xs opacity-70">{food.calories_per_100g} kcal/100g</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Verwandte Artikel</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedArticles.map((ra) => (
                  <a
                    key={ra.slug}
                    href={`/wissen/${ra.slug}/`}
                    className="card bg-base-200 hover:bg-base-300 transition-colors"
                  >
                    <div className="card-body p-4">
                      <h3 className="card-title text-base">{ra.title}</h3>
                      <p className="text-sm opacity-70 line-clamp-2">{ra.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ra.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="badge badge-sm badge-outline">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-12">
          <div className="max-w-screen-md mx-auto px-4 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Erkenntnisse in die Praxis umsetzen?
            </h2>
            <p className="opacity-90 max-w-lg mx-auto mb-6">
              Mit Mahlzait trackst du deine Ernährung einfach und schnell -
              damit du deine Ziele erreichst.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={config.appStoreLink}
                className="btn bg-white text-primary"
              >
                App laden
              </a>
              <a
                href="/wissen"
                className="btn bg-white text-primary hover:bg-white/90"
              >
                Mehr Artikel
              </a>
            </div>
          </div>
        </section>

        {/* Related / Back */}
        <section className="py-12">
          <div className="max-w-screen-md mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/wissen" className="btn btn-outline">
                Alle Artikel
              </a>
              <a href="/rechner" className="btn btn-outline">
                Rechner
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

export default ArticlePage;

