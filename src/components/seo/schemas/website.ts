import type { Thing, WithContext } from "schema-dts";

export function generateWebsiteSchema(
  url: string,
  name: string,
  description: string
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    url: url,
    name: name,
    description: description,
    inLanguage: "de-DE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/?s={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${url}#organization`,
    },
  };
}

