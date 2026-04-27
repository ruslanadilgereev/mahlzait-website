import type { Thing, WithContext } from "schema-dts";
import appRatingsRaw from "../../../data/app-ratings.json";

interface AppRatings {
  hasAggregateRating: boolean;
  ratingValue?: number;
  ratingCount?: number;
  bestRating?: number;
  worstRating?: number;
  reason?: string;
  updatedAt?: string;
}
const appRatings = appRatingsRaw as AppRatings;

/**
 * MobileApplication-Schema für die Mahlzait-App.
 *
 * Das `aggregateRating`-Feld wird nur dann gesetzt, wenn der Prebuild-Script
 * `scripts/fetch-app-ratings.cjs` einen echten iTunes-Rating-Datensatz geladen
 * hat (`hasAggregateRating: true` in `src/data/app-ratings.json`). Damit
 * vermeiden wir jegliches Schema-Spam-Signal durch fake oder hardcoded Werte.
 */
export function generateMobileAppSchema(
  url: string,
  name: string,
  description: string,
  appStoreUrl: string,
  googlePlayUrl: string
): WithContext<Thing> {
  const base: WithContext<Thing> = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "@id": `${url}#mobileapp`,
    name: name,
    description: description,
    applicationCategory: "HealthApplication",
    operatingSystem: "iOS, Android",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        description: "Kostenlose Version",
      },
      {
        "@type": "Offer",
        price: "4.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        description: "Mahlzait Pro Monat",
      },
      {
        "@type": "Offer",
        price: "29.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        description: "Mahlzait Pro Jahr",
      },
    ],
    downloadUrl: [appStoreUrl, googlePlayUrl],
    screenshot: [
      `${url}/screenshots/1.webp`,
      `${url}/screenshots/2.webp`,
      `${url}/screenshots/3.webp`,
    ],
    softwareVersion: "1.0.0",
    releaseNotes: "Multimodale KI mit Live-Web-Recherche, 3 Gemini-Modelle, Rezept-Import, Quellenangabe pro Eintrag",
    datePublished: "2024-11-01",
    inLanguage: ["de-DE", "en-US", "ru-RU"],
    applicationSubCategory: "Diet & Nutrition",
    keywords: "kalorienzähler, multimodale ki, live web search, food tracking ki, kalorienzähler mit foto, kalorien per text tracken, gemini grounding, dsgvo kalorien-app",
    featureList: [
      "Multimodal Input (Photo, Text, Video, Barcode, Recipe URL Import)",
      "Live Web Search with Citations",
      "3 AI Models: Fast, Thinking, Pro (Gemini 3 family)",
      "Source Attribution per meal",
      "8 Macros: kcal, Protein, Fat, Carbs, Fiber, Saturated Fat, Sugar, Salt",
      "Recipe Import (Schema.org Recipe Parser, YouTube)",
      "10M+ Food Database (Open Food Facts + USDA)",
      "Self-Healing Database via Web Search Feedback Loop",
      "GDPR-Compliant EU Data Hosting",
      "Offline Mode",
      "Ad-Free Free Tier",
    ],
  };

  if (appRatings.hasAggregateRating && appRatings.ratingValue && appRatings.ratingCount) {
    (base as unknown as Record<string, unknown>).aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(appRatings.ratingValue),
      ratingCount: String(appRatings.ratingCount),
      bestRating: String(appRatings.bestRating ?? 5),
      worstRating: String(appRatings.worstRating ?? 1),
    };
  }

  return base;
}

