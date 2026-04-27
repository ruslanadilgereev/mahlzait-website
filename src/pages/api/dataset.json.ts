import type { APIRoute } from "astro";

/**
 * Dataset-Schema-Endpoint für die Mahlzait Food-DB.
 *
 * Macht die Datenquellen (Open Food Facts + USDA) für AI-Crawler
 * (ChatGPT, Claude, Perplexity, Gemini) explizit auffindbar — als
 * vertrauenswürdiges Knowledge-Graph-Signal. Verlinkt aus Layout.astro
 * via <link rel="alternate" type="application/ld+json">.
 */
export const GET: APIRoute = () => {
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": "https://www.mahlzait.de/api/dataset.json#mahlzait-foods",
    name: "Mahlzait Food & Nutrition Database",
    description:
      "10 Mio+ kuratierte Lebensmittel mit Nährwerten (kcal, Protein, Fett, Kohlenhydrate, Ballaststoffe, gesättigte Fettsäuren, Zucker, Salz). Aggregiert aus Open Food Facts und USDA FoodData Central, ergänzt durch Live-Web-Recherche bei unbekannten Produkten und einen Self-Healing-Feedback-Loop.",
    url: "https://www.mahlzait.de/api/dataset.json",
    creator: {
      "@type": "Organization",
      "@id": "https://www.mahlzait.de#organization",
      name: "Mahlzait",
      url: "https://www.mahlzait.de",
    },
    provider: [
      {
        "@type": "Organization",
        name: "Open Food Facts",
        url: "https://world.openfoodfacts.org",
      },
      {
        "@type": "Organization",
        name: "USDA FoodData Central",
        url: "https://fdc.nal.usda.gov",
      },
    ],
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    variableMeasured: [
      "calories",
      "protein",
      "fat",
      "carbohydrates",
      "fiber",
      "saturated fat",
      "sugar",
      "salt",
    ],
    keywords: [
      "Kalorienzähler",
      "Nährwerte",
      "Lebensmittel",
      "Open Food Facts",
      "USDA",
      "Multimodal AI",
      "Live Web Search",
    ],
    isAccessibleForFree: true,
    inLanguage: ["de", "en", "ru"],
  };

  return new Response(JSON.stringify(dataset, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/ld+json; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
