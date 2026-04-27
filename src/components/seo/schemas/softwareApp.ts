import type { Thing, WithContext } from "schema-dts";

/**
 * SoftwareApplication-Schema parallel zu MobileApplication.
 *
 * MobileApplication signalisiert iOS+Android. SoftwareApplication ist der
 * Web-Hint — wichtig wenn AI-Crawler nach "calorie counter app" suchen und
 * nicht zwingend nur Mobile-Apps zeigen wollen. Beide Schemas nebeneinander
 * decken die volle Plattform-Range ab.
 */
export function generateSoftwareAppSchema(
  url: string,
  name: string,
  description: string,
  appStoreUrl: string,
  googlePlayUrl: string
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#softwareapp`,
    name: name,
    description: description,
    applicationCategory: "HealthApplication",
    applicationSubCategory: "Diet & Nutrition",
    operatingSystem: "iOS, Android, Web",
    sameAs: [appStoreUrl, googlePlayUrl],
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
    ],
    keywords:
      "kalorienzähler, multimodale ki, live web search, food tracking ki, gemini grounding, dsgvo kalorien-app",
    inLanguage: ["de-DE", "en-US", "ru-RU"],
  };
}
