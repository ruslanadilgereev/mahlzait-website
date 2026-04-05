import { articlesMeta } from "@content/wissen";

interface FoodMeta {
  slug: string;
}

export interface SitemapEntry {
  url: string;
  lastmod?: string;
}

const siteUrl = "https://www.mahlzait.de";
const foodFiles = import.meta.glob("../data/foods/*.json", { eager: true });
const foods = Object.values(foodFiles).map((mod: any) => mod.default || mod) as FoodMeta[];

const coreEntries: SitemapEntry[] = [
  { url: `${siteUrl}/` },
  { url: `${siteUrl}/rechner/` },
  { url: `${siteUrl}/wissen/` },
  { url: `${siteUrl}/kalorien/` },
  { url: `${siteUrl}/kalorien/kategorie/supermarkt/` },
  { url: `${siteUrl}/kalorien/kategorie/gericht/` },
  { url: `${siteUrl}/kalorien/kategorie/fast-food/` },
  { url: `${siteUrl}/kalorien/kategorie/getraenk/` },
  { url: `${siteUrl}/team/` },
  { url: `${siteUrl}/ueber-uns/` },
  { url: `${siteUrl}/vergleich/` },
];

const calculatorAndGuideEntries: SitemapEntry[] = [
  { url: `${siteUrl}/abnehmen/` },
  { url: `${siteUrl}/abnehmen-app/` },
  { url: `${siteUrl}/abnahmedatum-berechnen/` },
  { url: `${siteUrl}/alkohol-kalorien-rechner/` },
  { url: `${siteUrl}/bmi-rechner/` },
  { url: `${siteUrl}/cheat-day-rechner/` },
  { url: `${siteUrl}/doener-kalorien-rechner/` },
  { url: `${siteUrl}/grundumsatz-rechner/` },
  { url: `${siteUrl}/idealgewicht-rechner/` },
  { url: `${siteUrl}/intervallfasten-rechner/` },
  { url: `${siteUrl}/kalorien-zaehlen/` },
  { url: `${siteUrl}/kalorien-zaehlen-app/` },
  { url: `${siteUrl}/kalorienbedarf-berechnen/` },
  { url: `${siteUrl}/kaloriendefizit-berechnen/` },
  { url: `${siteUrl}/kalorienverbrauch-rechner/` },
  { url: `${siteUrl}/koerperfett-rechner/` },
  { url: `${siteUrl}/koffein-rechner/` },
  { url: `${siteUrl}/makros-berechnen/` },
  { url: `${siteUrl}/pizza-kalorien-rechner/` },
  { url: `${siteUrl}/protein-bedarf-rechner/` },
  { url: `${siteUrl}/schlaf-rechner/` },
  { url: `${siteUrl}/schritte-kalorien-rechner/` },
  { url: `${siteUrl}/taille-hueft-verhaeltnis-rechner/` },
  { url: `${siteUrl}/wasserbedarf-rechner/` },
  { url: `${siteUrl}/essensplan-erstellen/` },
  { url: `${siteUrl}/trainingsplan-erstellen/` },
];

const knowledgeEntries: SitemapEntry[] = articlesMeta.map((article) => ({
  url: `${siteUrl}/wissen/${article.slug}/`,
  lastmod: article.updatedAt || article.publishedAt,
}));

const foodEntries: SitemapEntry[] = foods.map((food) => ({
  url: `${siteUrl}/kalorien/${food.slug}/`,
}));

const legalEntries: SitemapEntry[] = [
  { url: `${siteUrl}/agb/` },
  { url: `${siteUrl}/cookies-policy/` },
  { url: `${siteUrl}/datenschutz/` },
  { url: `${siteUrl}/impressum/` },
  { url: `${siteUrl}/nutzungsbedingungen/` },
  { url: `${siteUrl}/widerrufsbelehrung/` },
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
      const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      return `<url><loc>${escapeXml(entry.url)}</loc>${lastmod}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}

export function renderSitemapIndex() {
  const items = segmentedSitemaps
    .map(
      (sitemap) =>
        `<sitemap><loc>${escapeXml(`${siteUrl}/sitemaps/${sitemap.slug}.xml`)}</loc></sitemap>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}
