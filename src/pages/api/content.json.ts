import type { APIRoute } from "astro";
import templateConfig from "../../utils/config";

export const GET: APIRoute = async () => {
  const siteUrl = "https://mahlzait.de";

  // Strukturierte Content-Daten für AI/LLM-Crawler
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

    // Keywords für AI
    keywords: [
      "kalorienzähler",
      "kalorienzähler app",
      "food tracker",
      "kalorienzähler mit ki",
      "kalorienzähler kostenlos",
      "kalorien tracker",
      "mahlzeiten tracken",
      "barcode scanner",
      "rezepte teilen",
      "gewicht tracken",
      "makros tracken",
      "ernährungstagebuch",
      "diät app",
      "abnehmen app",
      "fitness tracker",
      "ai food logging",
      "künstliche intelligenz ernährung",
      "health tracking",
    ],

    // Hauptmerkmale für AI-Zusammenfassung
    summary: {
      whatIsIt: "Mahlzait ist ein moderner Kalorienzähler mit KI-Unterstützung für iOS und Android. Die App ermöglicht schnelles und präzises Tracking von Mahlzeiten durch verschiedene Methoden: Suche in einer umfangreichen Datenbank, Barcode-Scanner, manuelle Eingabe oder KI-gestütztes Logging per Foto oder Text.",
      mainFeatures: [
        "KI-gestütztes Meal-Logging per Foto oder Text",
        "Barcode-Scanner für schnelles Erfassen von Produkten",
        "Umfangreiche Lebensmitteldatenbank mit Suche",
        "Rezepte erstellen und mit der Community teilen",
        "Integration mit YouTube-Rezepten",
        "Ziele für Kalorien und Makronährstoffe setzen",
        "Gewichtstracking mit Kalenderansicht",
        "Insights und Trends zur Ernährung",
        "Integration mit Apple Health und Google Fit",
        "Mehrsprachig: Deutsch, Englisch, Russisch",
        "Gamification durch Level-System",
        "Offline-Nutzung möglich",
      ],
      targetAudience: "Personen, die ihre Ernährung tracken möchten - ob zum Abnehmen, Muskelaufbau oder für ein gesünderes Leben. Besonders geeignet für alle, die eine schnelle, unkomplizierte Lösung mit modernen KI-Features suchen.",
      pricing: "Kostenlos nutzbar mit allen Basis-Features. Pro-Version ab 4,99€/Monat oder 29,99€/Jahr für unlimited AI-Features.",
      platforms: "iOS (App Store) und Android (Google Play Store)",
    },

    // Metadaten
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: "1.0.0",
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

