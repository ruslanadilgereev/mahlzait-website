import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import templateConfig from "../utils/config";
import { articlesMeta } from "@content/wissen";

export const GET: APIRoute = async (context) => {
  const siteUrl = "https://www.mahlzait.de";

  // Wissen-Artikel als RSS Items
  const wissenItems = articlesMeta.map((article) => ({
    title: article.title,
    link: `${siteUrl}/wissen/${article.slug}`,
    description: article.description,
    pubDate: new Date(article.publishedAt),
    categories: ["Wissen", "Forschung", ...article.tags],
  }));

  return rss({
    title: `${templateConfig.name} - RSS Feed`,
    description: templateConfig.seo.description,
    site: context.site || siteUrl,
    
    items: [
      // Wissen-Artikel zuerst (neueste zuerst)
      ...wissenItems,
      // Bestehende Items
      {
        title: "Mahlzait - Kalorienzaehler mit KI jetzt verfuegbar",
        link: `${siteUrl}/`,
        description:
          "Entdecke Mahlzait - den modernen Kalorienzaehler mit KI-Unterstuetzung. Tracke Mahlzeiten per Foto, Barcode oder Suche. Jetzt kostenlos fuer iOS und Android.",
        pubDate: new Date("2024-11-01"),
        categories: [
          "Gesundheit",
          "Fitness",
          "Ernaehrung",
          "Apps",
          "KI",
          "Technologie",
        ],
      },
      {
        title: "KI-gestuetztes Meal-Logging - Die Zukunft des Kalorienzaehlens",
        link: `${siteUrl}/#features`,
        description:
          "Mit Mahlzait's KI-Feature loggst du Mahlzeiten in Sekunden. Einfach Foto machen oder per Text beschreiben - die KI analysiert und schlaegt Naehrwerte vor. Schneller war Kalorienzaehlen noch nie.",
        pubDate: new Date("2024-11-15"),
        categories: ["KI", "Ernaehrung", "Innovation", "Features"],
      },
      {
        title: "Barcode-Scanner und riesige Lebensmitteldatenbank",
        link: `${siteUrl}/#features`,
        description:
          "Scanne Produkte mit dem integrierten Barcode-Scanner oder durchsuche eine umfangreiche Datenbank mit tausenden Lebensmitteln. Praezise Naehrwertangaben in Sekundenschnelle.",
        pubDate: new Date("2024-11-18"),
        categories: ["Features", "Convenience", "Ernaehrung"],
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
        title: "Kostenlos starten - Mahlzait fuer alle",
        link: `${siteUrl}/#pricing`,
        description:
          "Mahlzait ist kostenlos nutzbar mit allen wichtigen Features. Fuer unlimited AI-Features gibt es Mahlzait Pro ab 4,99 Euro/Monat oder 29,99 Euro/Jahr. Keine versteckten Kosten.",
        pubDate: new Date("2024-11-22"),
        categories: ["Preise", "Angebote", "Free"],
      },
      {
        title: "Integration mit Apple Health und Google Fit",
        link: `${siteUrl}/#features`,
        description:
          "Synchronisiere Mahlzait mit Apple Health oder Google Fit und behalte alle Gesundheitsdaten an einem Ort. Schritte, Gewicht und mehr werden automatisch uebertragen.",
        pubDate: new Date("2024-11-25"),
        categories: ["Integration", "Health", "Features", "Sync"],
      },
      {
        title: "Mehrsprachig: Deutsch, Englisch, Russisch",
        link: `${siteUrl}/#features`,
        description:
          "Nutze Mahlzait in deiner bevorzugten Sprache. Die App ist auf Deutsch, Englisch und Russisch verfuegbar und kann jederzeit in den Einstellungen gewechselt werden.",
        pubDate: new Date("2024-11-28"),
        categories: ["Sprachen", "International", "Features"],
      },
    ],
    
    customData: `
      <language>de-DE</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <docs>https://www.mahlzait.de</docs>
      <generator>Astro RSS</generator>
      <category>Gesundheit & Fitness</category>
      <category>Ernaehrung</category>
      <category>Mobile Apps</category>
      <category>Kuenstliche Intelligenz</category>
      <category>Wissen</category>
      <image>
        <url>${siteUrl}/logo.png</url>
        <title>${templateConfig.name}</title>
        <link>${siteUrl}</link>
      </image>
    `,
  });
};
