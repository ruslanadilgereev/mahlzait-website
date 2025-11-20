import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import templateConfig from "../utils/config";

export const GET: APIRoute = async (context) => {
  const siteUrl = "https://mahlzait.de";

  return rss({
    title: `${templateConfig.name} - RSS Feed`,
    description: templateConfig.seo.description,
    site: context.site || siteUrl,
    
    items: [
      {
        title: "Mahlzait - Kalorienzähler mit KI jetzt verfügbar",
        link: `${siteUrl}/`,
        description:
          "Entdecke Mahlzait - den modernen Kalorienzähler mit KI-Unterstützung. Tracke Mahlzeiten per Foto, Barcode oder Suche. Jetzt kostenlos für iOS und Android.",
        pubDate: new Date("2024-11-01"),
        categories: [
          "Gesundheit",
          "Fitness",
          "Ernährung",
          "Apps",
          "KI",
          "Technologie",
        ],
      },
      {
        title: "KI-gestütztes Meal-Logging - Die Zukunft des Kalorienzählens",
        link: `${siteUrl}/#features`,
        description:
          "Mit Mahlzait's KI-Feature loggst du Mahlzeiten in Sekunden. Einfach Foto machen oder per Text beschreiben - die KI analysiert und schlägt Nährwerte vor. Schneller war Kalorienzählen noch nie.",
        pubDate: new Date("2024-11-15"),
        categories: ["KI", "Ernährung", "Innovation", "Features"],
      },
      {
        title: "Barcode-Scanner und riesige Lebensmitteldatenbank",
        link: `${siteUrl}/#features`,
        description:
          "Scanne Produkte mit dem integrierten Barcode-Scanner oder durchsuche eine umfangreiche Datenbank mit tausenden Lebensmitteln. Präzise Nährwertangaben in Sekundenschnelle.",
        pubDate: new Date("2024-11-18"),
        categories: ["Features", "Convenience", "Ernährung"],
      },
      {
        title: "Rezepte erstellen und teilen - Mahlzait Community",
        link: `${siteUrl}/#features`,
        description:
          "Erstelle deine eigenen Rezepte, importiere sie aus YouTube-Videos oder teile sie mit der Community. Wiederkehrende Mahlzeiten loggst du mit einem Klick.",
        pubDate: new Date("2024-11-20"),
        categories: ["Community", "Rezepte", "Features", "Social"],
      },
      {
        title: "Kostenlos starten - Mahlzait für alle",
        link: `${siteUrl}/#pricing`,
        description:
          "Mahlzait ist kostenlos nutzbar mit allen wichtigen Features. Für unlimited AI-Features gibt es Mahlzait Pro ab 4,99€/Monat oder 29,99€/Jahr. Keine versteckten Kosten.",
        pubDate: new Date("2024-11-22"),
        categories: ["Preise", "Angebote", "Free"],
      },
      {
        title: "Integration mit Apple Health und Google Fit",
        link: `${siteUrl}/#features`,
        description:
          "Synchronisiere Mahlzait mit Apple Health oder Google Fit und behalte alle Gesundheitsdaten an einem Ort. Schritte, Gewicht und mehr werden automatisch übertragen.",
        pubDate: new Date("2024-11-25"),
        categories: ["Integration", "Health", "Features", "Sync"],
      },
      {
        title: "Mehrsprachig: Deutsch, Englisch, Russisch",
        link: `${siteUrl}/#features`,
        description:
          "Nutze Mahlzait in deiner bevorzugten Sprache. Die App ist auf Deutsch, Englisch und Russisch verfügbar und kann jederzeit in den Einstellungen gewechselt werden.",
        pubDate: new Date("2024-11-28"),
        categories: ["Sprachen", "International", "Features"],
      },
    ],
    
    customData: `
      <language>de-DE</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <docs>https://mahlzait.de</docs>
      <generator>Astro RSS</generator>
      <category>Gesundheit & Fitness</category>
      <category>Ernährung</category>
      <category>Mobile Apps</category>
      <category>Künstliche Intelligenz</category>
      <image>
        <url>${siteUrl}/logo.png</url>
        <title>${templateConfig.name}</title>
        <link>${siteUrl}</link>
      </image>
    `,
  });
};

