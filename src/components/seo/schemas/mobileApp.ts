import type { Thing, WithContext } from "schema-dts";

export function generateMobileAppSchema(
  url: string,
  name: string,
  description: string,
  appStoreUrl: string,
  googlePlayUrl: string
): WithContext<Thing> {
  return {
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      ratingCount: "100",
      bestRating: "5",
      worstRating: "1",
    },
    downloadUrl: [appStoreUrl, googlePlayUrl],
    screenshot: [
      `${url}/screenshots/1.webp`,
      `${url}/screenshots/2.webp`,
      `${url}/screenshots/3.webp`,
    ],
    softwareVersion: "1.0.0",
    releaseNotes: "Kalorienzähler mit KI, Barcode-Scanner und Rezeptverwaltung",
    datePublished: "2024-11-01",
    inLanguage: ["de-DE"],
  };
}

