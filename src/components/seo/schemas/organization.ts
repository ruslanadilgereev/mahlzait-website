import type { Thing, WithContext } from "schema-dts";

export function generateOrganizationSchema(
  url: string,
  name: string,
  logo: string
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#organization`,
    name: name,
    url: url,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: "512",
      height: "512",
    },
    sameAs: [
      "https://apps.apple.com/de/app/mahlzait-kalorienz%C3%A4hler/id6747400456",
      "https://play.google.com/store/apps/details?id=com.promptit.mytemple",
    ],
    description: "Mahlzait - Kalorienzähler mit KI für iOS und Android",
  };
}

