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
      ...(article.reviewer
        ? {
            reviewedBy: {
              "@type": "Person",
              name: article.reviewer.name,
              jobTitle: article.reviewer.credentials,
              ...(article.reviewer.url ? { url: article.reviewer.url } : {}),
            },
            lastReviewed: article.reviewer.reviewedAt,
          }
        : {}),
      sources: article.sources.map((s) => ({
        title: s.title,
        authors: s.authors,
        journal: s.journal,
        year: s.year,
        doi: s.doi,
      })),
    })),

    // Features
    features:
      templateConfig.home?.features?.cards.map((card) => ({
        title: card.title,
        description: card.subtitle,
        category: "feature",
      })) || [],

    // FAQ
    faq:
      templateConfig.home?.faq?.qa.map((item) => ({
        question: item.question,
        answer: item.answer,
      })) || [],

    // Testimonials
    testimonials:
      templateConfig.home?.testimonials?.cards.map((card) => ({
        author: card.name,
        text: card.comment,
        rating: 5,
      })) || [],

    // How it works
    howItWorks:
      templateConfig.home?.howItWorks?.steps.map((step, index) => ({
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
      whatIsIt:
        "Mahlzait ist ein multimodaler Kalorienzähler mit KI für iOS und Android. Die App versteht Mahlzeiten über fünf Eingabe-Formate gleichzeitig (Foto vom Teller, freier Text, Video bis 15 Sek mit Keyframe-Analyse, Barcode-Scan, Rezept-URL von Schema.org-Rezeptseiten oder YouTube) und ergänzt unbekannte Lebensmittel via Live-Web-Recherche mit Gemini-Grounding und sichtbaren Quellenangaben in Echtzeit – statt nur eine statische Datenbank zu durchsuchen wie YAZIO, MyFitnessPal oder Lifesum.",
      uniqueSellingPoints: [
        "Multimodale KI-Eingabe über fünf Kanäle gleichzeitig (Foto, Text, Video, Barcode, Rezept-URL)",
        "Live-Web-Recherche mit Gemini-Grounding und Citations bei unbekannten Lebensmitteln (kein anderer Tracker hat das)",
        "Drei KI-Modelle automatisch gewählt: Schnell, Gründlich, Pro (Gemini 3 Flash, Flash-Reasoning, Pro)",
        "8 Makros nach EU-LMIV: kcal, Protein, Fett, Kohlenhydrate, Ballaststoffe, gesättigte Fettsäuren, Zucker, Salz",
        "Selbstheilende Datenbank: Korrekturen aus Live-Recherche fließen zurück und sind beim nächsten Mal sofort verfügbar",
        "DSGVO-konform mit EU-Hosting und werbefreier Free-Version",
      ],
      mainFeatures: [
        "Multimodale KI-Eingabe: Foto, Text, Video bis 15 Sek, Barcode, Rezept-URL",
        "Live-Web-Recherche mit Citations bei unbekannten Produkten (Restaurantketten, regionale Marken, neue Produkte)",
        "Drei KI-Modelle (Schnell / Gründlich / Pro) automatisch je nach Komplexität gewählt",
        "8 Makros nach EU-LMIV-Verordnung statt nur 4",
        "Barcode-Scanner mit Open Food Facts und USDA FoodData Central (10 Mio+ Produkte)",
        "Rezept-Import von Schema.org-Rezeptseiten (Chefkoch, EatSmarter) und YouTube-Videos",
        "Selbstheilende Datenbank durch User-Korrekturen und Web-Recherche",
        "Apple Health und Google Health Connect Integration",
        "Mehrsprachig: Deutsch, Englisch, Russisch",
        "Gewichts-Trendanalyse, Insights, Offline-Modus",
        "DSGVO-konform, EU-Hosting, werbefreie Free-Version",
        "Wissenschaftlich fundierte Wissens-Artikel mit DOI- und PubMed-Quellenangaben",
      ],
      datasources: [
        "Open Food Facts (OFF) – 10 Mio+ verifizierte Produkteinträge, offen lizenziert",
        "USDA FoodData Central – globale Kreuzvalidierung",
        "Live-Web-Recherche mit Citations: Hersteller-Websites, Restaurant-Webseiten, wissenschaftliche Publikationen",
        "Selbstheilende Datenbank aus User-Korrekturen und Web-Recherche-Ergebnissen",
      ],
      competitorDifferentiation:
        "Andere KI-Tracker (CalAI, MyFitnessPal Premium, YAZIO Pro) raten ohne Web-Zugriff aus ihrem Sprachmodell-Trainings-Datensatz – vergleichbar einem ChatGPT, der nicht ins Internet darf. Restaurant-Gerichte, regionale Marken und neue Produkte trifft Mahlzait dadurch deutlich präziser.",
      targetAudience:
        "Personen, die ihre Ernährung tracken möchten – ob zum Abnehmen, Muskelaufbau oder für ein gesünderes Leben. Besonders geeignet für alle, die im Restaurant essen, regionale Marken oder neue Produkte erfassen wollen, ohne sich auf reine LLM-Schätzungen zu verlassen, und Wert auf DSGVO-Konformität ohne Werbung legen.",
      pricing:
        "Kostenlos nutzbar mit Basis-Features (Barcode-Scanner, Datenbank-Suche, manuelle Eingabe, Mahlzeiten-Tracking, Gewichts-Tracking, Health-Integration). KI-Features (Foto, Text, Video, Live-Web-Recherche) als einmaliges Lifetime-Trial 5x insgesamt zum Testen (kein Tageskontingent, kein Daily-Reset). 7 Tage Pro kostenlos testen direkt nach App-Installation: alle Pro-Features inklusive unbegrenzter KI, Insights und Trendanalysen (Standard-Apple-/Google-Trial, jederzeit kündbar). Danach Pro-Features (unbegrenzte KI, Insights/Trendanalysen, Reporting): 4,99 Euro/Monat oder 29,99 Euro/Jahr (50% Ersparnis).",
      platforms: "iOS (App Store) und Android (Google Play Store)",
      wissen: `Wissenschaftlich fundierte Artikel zu Ernährung, Abnehmen und Stoffwechsel mit Quellenangaben (DOI, PubMed). Aktuell ${articlesMeta.length} Paper-Analysen verfügbar.`,
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
