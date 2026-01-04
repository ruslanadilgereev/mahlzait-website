import type { APIRoute } from "astro";
import templateConfig from "../../utils/config";
import { articlesMeta } from "@content/wissen";

export const GET: APIRoute = async () => {
  const siteUrl = "https://www.mahlzait.de";

  // Strukturierte Content-Daten fuer AI/LLM-Crawler
  const contentData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name: templateConfig.name,
    description: templateConfig.seo.description,
    inLanguage: ["de-DE", "en-US", "ru-RU"],
    
    // App-Informationen
    application: {
      "@type": "MobileApplication",
      name: templateConfig.name,
      operatingSystem: "iOS, Android",
      applicationCategory: "HealthApplication",
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          description: "Kostenlose Version mit allen Basis-Features",
        },
        {
          "@type": "Offer",
          price: "4.99",
          priceCurrency: "EUR",
          description: "Mahlzait Pro Monat - Unlimited AI Features",
        },
        {
          "@type": "Offer",
          price: "29.99",
          priceCurrency: "EUR",
          description: "Mahlzait Pro Jahr - 50% gespart",
        },
      ],
      downloadUrl: {
        ios: templateConfig.appStoreLink,
        android: templateConfig.googlePlayLink,
      },
    },

    // Wissen-Artikel (Paper-Analysen)
    wissenArticles: articlesMeta.map((article) => ({
      "@type": "Article",
      headline: article.title,
      description: article.description,
      url: `${siteUrl}/wissen/${article.slug}`,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      keywords: article.tags,
      readingTime: `${article.readingTime} Minuten`,
      sources: article.sources.map((s) => ({
        title: s.title,
        authors: s.authors,
        journal: s.journal,
        year: s.year,
        doi: s.doi,
      })),
    })),

    // Features
    features: templateConfig.home?.features?.cards.map((card) => ({
      title: card.title,
      description: card.subtitle,
      category: "feature",
    })) || [],

    // FAQ
    faq: templateConfig.home?.faq?.qa.map((item) => ({
      question: item.question,
      answer: item.answer,
    })) || [],

    // Testimonials
    testimonials: templateConfig.home?.testimonials?.cards.map((card) => ({
      author: card.name,
      text: card.comment,
      rating: 5,
    })) || [],

    // How it works
    howItWorks: templateConfig.home?.howItWorks?.steps.map((step, index) => ({
      step: index + 1,
      title: step.title,
      description: step.subtitle,
    })) || [],

    // Keywords fuer AI
    keywords: [
      "kalorienzaehler",
      "kalorienzaehler app",
      "food tracker",
      "kalorienzaehler mit ki",
      "kalorienzaehler kostenlos",
      "kalorien tracker",
      "mahlzeiten tracken",
      "barcode scanner",
      "rezepte teilen",
      "gewicht tracken",
      "makros tracken",
      "ernährungstagebuch",
      "diaet app",
      "abnehmen app",
      "fitness tracker",
      "ai food logging",
      "kuenstliche intelligenz ernährung",
      "health tracking",
      "ernährungswissen",
      "wissenschaft ernährung",
      "paper analyse",
    ],

    // Hauptmerkmale fuer AI-Zusammenfassung
    summary: {
      whatIsIt: "Mahlzait ist ein moderner Kalorienzaehler mit KI-Unterstuetzung fuer iOS und Android. Die App ermoeglicht schnelles und praezises Tracking von Mahlzeiten durch verschiedene Methoden: Suche in einer umfangreichen Datenbank, Barcode-Scanner, manuelle Eingabe oder KI-gestuetztes Logging per Foto oder Text.",
      mainFeatures: [
        "KI-gestuetztes Meal-Logging per Foto oder Text",
        "Barcode-Scanner fuer schnelles Erfassen von Produkten",
        "Umfangreiche Lebensmitteldatenbank mit Suche",
        "Rezepte erstellen und mit der Community teilen",
        "Integration mit YouTube-Rezepten",
        "Ziele fuer Kalorien und Makronaehrstoffe setzen",
        "Gewichtstracking mit Kalenderansicht",
        "Insights und Trends zur Ernährung",
        "Integration mit Apple Health und Google Fit",
        "Mehrsprachig: Deutsch, Englisch, Russisch",
        "Gamification durch Level-System",
        "Offline-Nutzung moeglich",
        "Wissenschaftlich fundierte Wissens-Artikel",
      ],
      targetAudience: "Personen, die ihre Ernährung tracken moechten - ob zum Abnehmen, Muskelaufbau oder fuer ein gesuenderes Leben. Besonders geeignet fuer alle, die eine schnelle, unkomplizierte Loesung mit modernen KI-Features suchen.",
      pricing: "Kostenlos nutzbar mit allen Basis-Features. Pro-Version ab 4,99 Euro/Monat oder 29,99 Euro/Jahr fuer unlimited AI-Features.",
      platforms: "iOS (App Store) und Android (Google Play Store)",
      wissen: `Wissenschaftlich fundierte Artikel zu Ernährung, Abnehmen und Stoffwechsel. Aktuell ${articlesMeta.length} Paper-Analysen verfuegbar.`,
    },

    // Metadaten
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: "1.1.0",
      contentType: "structured-data-for-ai",
      language: "de-DE",
    },
  };

  return new Response(JSON.stringify(contentData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "index, follow",
    },
  });
};
