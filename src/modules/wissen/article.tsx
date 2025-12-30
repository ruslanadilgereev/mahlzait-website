import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import type { ArticleMeta } from "@content/wissen";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Props {
  config: TemplateConfig;
  article: ArticleMeta;
  content: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticlePage({ config, article, content }: Props) {
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

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm opacity-70 mb-8">
            <span>Veröffentlicht: {formatDate(article.publishedAt)}</span>
            {article.updatedAt && (
              <span>Aktualisiert: {formatDate(article.updatedAt)}</span>
            )}
            <span>{article.readingTime} Min. Lesezeit</span>
          </div>

          {/* Lead / Description */}
          <p className="text-lg md:text-xl opacity-80 mb-8 border-l-4 border-primary pl-4">
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
                    <li key={idx} className="text-sm">
                      <p className="font-medium">{source.title}</p>
                      <p className="opacity-70">
                        {source.authors} ({source.year}). <em>{source.journal}</em>.
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
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

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
              bitte an einen Arzt oder eine Ernährungsfachkraft.
            </span>
          </div>
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

