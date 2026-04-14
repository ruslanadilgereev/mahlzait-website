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
    foundingDate: "2024-11",
    foundingLocation: {
      "@type": "Place",
      name: "Berlin, Deutschland",
    },
    founder: {
      "@type": "Person",
      "@id": `${url}/#person-ruslan`,
      name: "Ruslan Adilgereev",
      url: `${url}/team`,
      jobTitle: "Founder",
      sameAs: ["https://www.linkedin.com/in/ruslanadilgereev"],
    },
    knowsAbout: [
      "Kalorienzählen",
      "Ernährung",
      "Abnehmen",
      "Makronährstoffe",
      "Ernährungstracking",
      "Intervallfasten",
      "Stoffwechsel",
      "BMI",
      "Kalorienbedarf",
      "KI-Ernährungsanalyse",
    ],
    sameAs: [
      "https://apps.apple.com/de/app/mahlzait-kalorienz%C3%A4hler/id6747400456",
      "https://play.google.com/store/apps/details?id=com.promptit.mytemple",
      "https://www.instagram.com/mahlzait",
      "https://www.tiktok.com/@mahlzait",
      "https://www.facebook.com/mahlzait",
      "https://www.pinterest.com/mahlzait/",
      "https://x.com/mahlzait",
      "https://www.youtube.com/@mahlzait-de",
      "https://www.reddit.com/r/Mahlzait/",
    ],
    description: "Mahlzait - Kalorienzähler mit KI für iOS und Android",
    contactPoint: {
      "@type": "ContactPoint",
      email: "kontakt@mahlzait.de",
      contactType: "customer service",
      availableLanguage: ["German", "English", "Russian"],
    },
  };
}

