import type { Thing, WithContext } from "schema-dts";

interface WebPageConfig {
  url: string;
  name: string;
  description: string;
  dateModified?: string;
  datePublished?: string;
}

export function generateWebPageSchema(
  config: WebPageConfig
): WithContext<Thing> {
  // Use current date for dateModified - Schema will reflect actual update time
  const now = new Date().toISOString().split('T')[0];
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${config.url}#webpage`,
    url: config.url,
    name: config.name,
    description: config.description,
    datePublished: config.datePublished || "2025-01-15",
    dateModified: config.dateModified || "2026-02-28",
    isPartOf: {
      "@id": "https://www.mahlzait.de#website",
    },
    publisher: {
      "@id": "https://www.mahlzait.de#organization",
    },
    inLanguage: "de-DE",
  };
}
