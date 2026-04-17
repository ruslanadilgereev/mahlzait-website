import { articlesMeta } from "@content/wissen";

interface FoodMeta {
  slug: string;
}

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: ChangeFreq;
  priority?: number;
}

const siteUrl = "https://www.mahlzait.de";

// Build-Timestamp als Default-lastmod für alle Seiten ohne eigenes Datum.
// Jeder Deploy erzeugt ein neues Freshness-Signal für AI-Crawler.
const BUILD_TIME =
  process.env.VERCEL_GIT_COMMIT_DATE ?? new Date().toISOString();

const foodFiles = import.meta.glob("../data/foods/*.json", { eager: true });
const foods = Object.values(foodFiles).map((mod: any) => mod.default || mod) as FoodMeta[];

const coreEntries: SitemapEntry[] = [
  { url: `${siteUrl}/`, changefreq: "weekly", priority: 1.0 },
  { url: `${siteUrl}/rechner/`, changefreq: "weekly", priority: 0.9 },
  { url: `${siteUrl}/wissen/`, changefreq: "weekly", priority: 0.9 },
  { url: `${siteUrl}/kalorien/`, changefreq: "weekly", priority: 0.9 },
  { url: `${siteUrl}/kalorien/kategorie/supermarkt/`, changefreq: "monthly", priority: 0.7 },
  { url: `${siteUrl}/kalorien/kategorie/gericht/`, changefreq: "monthly", priority: 0.7 },
  { url: `${siteUrl}/kalorien/kategorie/fast-food/`, changefreq: "monthly", priority: 0.7 },
  { url: `${siteUrl}/kalorien/kategorie/getraenk/`, changefreq: "monthly", priority: 0.7 },
  { url: `${siteUrl}/team/`, changefreq: "monthly", priority: 0.5 },
  { url: `${siteUrl}/ueber-uns/`, changefreq: "monthly", priority: 0.5 },
  { url: `${siteUrl}/vergleich/`, changefreq: "monthly", priority: 0.6 },
];

const calculatorSlugs = [
  "abnehmen",
  "abnehmen-app",
  "abnahmedatum-berechnen",
  "alkohol-kalorien-rechner",
  "bmi-rechner",
  "cheat-day-rechner",
  "doener-kalorien-rechner",
  "grundumsatz-rechner",
  "idealgewicht-rechner",
  "intervallfasten-rechner",
  "kalorien-zaehlen",
  "kalorien-zaehlen-app",
  "kalorienbedarf-berechnen",
  "kaloriendefizit-berechnen",
  "kalorienverbrauch-rechner",
  "koerperfett-rechner",
  "koffein-rechner",
  "makros-berechnen",
  "pizza-kalorien-rechner",
  "protein-bedarf-rechner",
  "schlaf-rechner",
  "schritte-kalorien-rechner",
  "taille-hueft-verhaeltnis-rechner",
  "wasserbedarf-rechner",
  "essensplan-erstellen",
  "trainingsplan-erstellen",
];

const calculatorAndGuideEntries: SitemapEntry[] = calculatorSlugs.map(
  (slug) => ({
    url: `${siteUrl}/${slug}/`,
    changefreq: "weekly",
    priority: 0.9,
  }),
);

const knowledgeEntries: SitemapEntry[] = articlesMeta.map((article) => ({
  url: `${siteUrl}/wissen/${article.slug}/`,
  lastmod: article.updatedAt || article.publishedAt,
  changefreq: "monthly",
  priority: 0.7,
}));

const foodEntries: SitemapEntry[] = foods.map((food) => ({
  url: `${siteUrl}/kalorien/${food.slug}/`,
  changefreq: "monthly",
  priority: 0.6,
}));

const legalEntries: SitemapEntry[] = [
  { url: `${siteUrl}/agb/`, changefreq: "yearly", priority: 0.3 },
  { url: `${siteUrl}/cookies-policy/`, changefreq: "yearly", priority: 0.3 },
  { url: `${siteUrl}/datenschutz/`, changefreq: "yearly", priority: 0.3 },
  { url: `${siteUrl}/impressum/`, changefreq: "yearly", priority: 0.3 },
  { url: `${siteUrl}/nutzungsbedingungen/`, changefreq: "yearly", priority: 0.3 },
  { url: `${siteUrl}/widerrufsbelehrung/`, changefreq: "yearly", priority: 0.3 },
];

export const segmentedSitemaps = [
  { slug: "core", entries: coreEntries },
  { slug: "calculators", entries: calculatorAndGuideEntries },
  { slug: "wissen", entries: knowledgeEntries },
  { slug: "foods", entries: foodEntries },
  { slug: "legal", entries: legalEntries },
];

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderUrlSet(entries: SitemapEntry[]) {
  const items = entries
    .map((entry) => {
      const lastmod = entry.lastmod ?? BUILD_TIME;
      const changefreqTag = entry.changefreq
        ? `<changefreq>${entry.changefreq}</changefreq>`
        : "";
      const priorityTag =
        entry.priority !== undefined
          ? `<priority>${entry.priority.toFixed(1)}</priority>`
          : "";
      return `<url><loc>${escapeXml(entry.url)}</loc><lastmod>${escapeXml(lastmod)}</lastmod>${changefreqTag}${priorityTag}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}

export function renderSitemapIndex() {
  const items = segmentedSitemaps
    .map(
      (sitemap) =>
        `<sitemap><loc>${escapeXml(`${siteUrl}/sitemaps/${sitemap.slug}.xml`)}</loc><lastmod>${escapeXml(BUILD_TIME)}</lastmod></sitemap>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}
