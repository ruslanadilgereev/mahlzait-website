/**
 * "Wissenschaftlich fundiert" Block für Calculator-Pages.
 *
 * Zeigt bis zu 3 passende Wissen-Artikel zu einem Calculator-Slug,
 * gematched über Tag-Overlap in utils/topicClusters.ts.
 *
 * Wird in Calculator-Modulen zwischen Content und AppBanner gerendert.
 */
import { articlesMeta } from "@content/wissen";
import { getWissenForCalculator } from "utils/topicClusters";

interface Props {
  calculatorSlug: string;
  heading?: string;
  subtitle?: string;
  limit?: number;
}

function RelatedWissen({
  calculatorSlug,
  heading = "Wissenschaftlich fundiert",
  subtitle = "Studien & Meta-Analysen, auf denen dieser Rechner basiert.",
  limit = 3,
}: Props) {
  const relatedArticles = getWissenForCalculator(
    calculatorSlug,
    articlesMeta,
    limit
  );

  if (relatedArticles.length === 0) return null;

  return (
    <section className="bg-base-200 py-12">
      <div className="max-w-screen-lg mx-auto px-4">
        <header className="mb-6 text-center">
          <span className="badge badge-primary badge-outline mb-3">Evidenzbasiert</span>
          <h2 className="text-2xl md:text-3xl font-bold">{heading}</h2>
          <p className="mt-2 opacity-80 max-w-xl mx-auto">{subtitle}</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedArticles.map((article) => (
            <a
              key={article.slug}
              href={`/wissen/${article.slug}/`}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 hover:border-primary/40 border border-transparent"
            >
              <div className="card-body p-5">
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="badge badge-xs badge-outline">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="card-title text-base leading-snug">{article.title}</h3>
                <p className="text-sm opacity-70 line-clamp-3">{article.description}</p>
                <div className="card-actions justify-between items-center mt-3">
                  <span className="text-xs opacity-60">
                    {article.readingTime} Min. Lesezeit
                  </span>
                  <span className="text-sm font-medium text-primary">Lesen →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-6">
          <a href="/wissen/" className="link link-primary text-sm">
            → Alle {articlesMeta.length} Artikel im Wissen-Bereich
          </a>
        </div>
      </div>
    </section>
  );
}

export default RelatedWissen;
