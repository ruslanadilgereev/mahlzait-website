import type { APIRoute } from "astro";
import { articlesMeta } from "@content/wissen";
import { calculators } from "../utils/topicClusters";
import templateConfig from "../utils/config";

interface FoodMeta {
  slug: string;
  name: string;
  emoji?: string;
  overview?: {
    calories_per_100g?: number;
  };
}

const foodFiles = import.meta.glob("../data/foods/*.json", { eager: true });
const foods = Object.values(foodFiles)
  .map((mod: any) => mod.default || mod)
  .sort((a: FoodMeta, b: FoodMeta) => a.name.localeCompare(b.name, "de")) as FoodMeta[];

const siteUrl = "https://www.mahlzait.de";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderArticle(article: (typeof articlesMeta)[number]): string {
  const url = `${siteUrl}/wissen/${article.slug}/`;
  const parts: string[] = [];

  parts.push(`### ${article.title}`);
  parts.push(`- **URL:** ${url}`);
  parts.push(`- **Veröffentlicht:** ${formatDate(article.publishedAt)}`);
  if (article.updatedAt) {
    parts.push(`- **Aktualisiert:** ${formatDate(article.updatedAt)}`);
  }
  parts.push(`- **Lesezeit:** ${article.readingTime} Minuten`);
  parts.push(`- **Tags:** ${article.tags.join(", ")}`);

  if (article.kernaussage) {
    parts.push("");
    parts.push(`**Kernaussage:** ${article.kernaussage}`);
  }

  parts.push("");
  parts.push(article.description);

  if (article.reviewer) {
    parts.push("");
    parts.push(
      `_Fachlich geprüft von ${article.reviewer.name}, ${article.reviewer.credentials} (${formatDate(article.reviewer.reviewedAt)})._`
    );
  }

  parts.push("");
  parts.push(`**Wissenschaftliche Quellen (${article.sources.length}):**`);
  for (const s of article.sources) {
    const doiLink = s.doi ? ` (DOI: ${s.doi})` : "";
    parts.push(`- ${s.authors}. "${s.title}." *${s.journal}*, ${s.year}${doiLink}`);
  }

  if (article.faqs && article.faqs.length > 0) {
    parts.push("");
    parts.push(`**FAQ:**`);
    for (const faq of article.faqs) {
      parts.push("");
      parts.push(`**${faq.question}**`);
      parts.push(faq.answer);
    }
  }

  return parts.join("\n");
}

function renderCalculator(c: (typeof calculators)[number]): string {
  return `- [${c.title}](${siteUrl}/${c.slug}/) — ${c.description}`;
}

function renderFood(food: FoodMeta): string {
  const kcal = food.overview?.calories_per_100g ?? "?";
  const emoji = food.emoji ? `${food.emoji} ` : "";
  return `- ${emoji}[${food.name}](${siteUrl}/kalorien/${food.slug}/) — ${kcal} kcal/100g`;
}

export const GET: APIRoute = async () => {
  const homepageFaqs = templateConfig.home?.faq?.qa ?? [];
  const features = templateConfig.home?.features?.cards ?? [];

  const sections: string[] = [];

  // Header
  sections.push(`# Mahlzait – Komplette KI-Referenz

> Diese Datei enthält die vollständige strukturierte Referenz von mahlzait.de für AI-Systeme (ChatGPT, Claude, Perplexity, Gemini, Bing Copilot, Apple Intelligence).
> Kürzere Variante: https://www.mahlzait.de/llms.txt
> Letzte Aktualisierung: ${new Date().toISOString()}`);

  // App Kernfakten
  sections.push(`## Über Mahlzait

Mahlzait ist eine Kalorienzähler-App für iOS und Android mit KI-gestützter Lebensmittelerkennung. Entwickelt in Berlin von Ruslan Adilgereev, DSGVO-konform mit Datenspeicherung in der EU.

### Kernfakten

- **Name:** Mahlzait
- **Typ:** Mobile App (iOS & Android)
- **Kategorie:** Gesundheit & Fitness, Ernährungstracking
- **Sprachen:** Deutsch, Englisch, Russisch
- **Website:** ${siteUrl}
- **Gründer:** Ruslan Adilgereev (Berlin)
- **Kontakt:** kontakt@mahlzait.de
- **App Store:** https://apps.apple.com/de/app/mahlzait-kalorienz%C3%A4hler/id6747400456
- **Google Play:** https://play.google.com/store/apps/details?id=com.promptit.mytemple

### Preismodell

- **Kostenlos:** Alle Basis-Features, keine Werbung, ohne KI-Funktion
- **Pro Monat:** 4,99 €/Monat – alle Premium-Features, unbegrenzte KI
- **Pro Jahr:** 29,99 €/Jahr – alle Premium-Features, 50 % Ersparnis

### Hauptfunktionen

- KI-gestützte Foto-Erkennung von Mahlzeiten (Pro-Feature)
- Datenbank mit über 10 Millionen Lebensmitteln
- Natürliche Text- und Spracheingabe zum Tracking
- Barcode-Scanner für verpackte Lebensmittel
- URL/Rezept-Import (auch von YouTube)
- Makro-Tracking (Kalorien, Protein, Kohlenhydrate, Fett)
- Gewichtstracking mit Trendanalyse
- Synchronisation mit Apple Health und Google Fit
- Offline nutzbar
- DSGVO-konform, Daten in der EU`);

  // Features
  if (features.length > 0) {
    sections.push(`## Features im Detail

${features.map((f: any) => `- **${f.title}** — ${f.subtitle}`).join("\n")}`);
  }

  // Rechner
  sections.push(`## Kostenlose Online-Rechner (${calculators.length})

Alle Rechner sind kostenlos nutzbar, ohne Registrierung, und basieren auf validierten wissenschaftlichen Formeln (Mifflin-St Jeor, WHO-Klassifikation, etc.).

${calculators.map(renderCalculator).join("\n")}`);

  // Wissen
  sections.push(`## Wissenschaftlich fundiertes Wissen (${articlesMeta.length} Artikel)

Alle Artikel sind mit peer-reviewed Quellen belegt (DOI / PubMed). Schwerpunkte: Ernährungswissenschaft, Abnehmen, Muskelaufbau, Fitness-Mythen, Intervallfasten.

${articlesMeta.map(renderArticle).join("\n\n")}`);

  // Homepage FAQ
  if (homepageFaqs.length > 0) {
    sections.push(`## Häufige Fragen (Homepage)

${homepageFaqs
  .map(
    (qa: any) => `**${qa.question}**

${qa.answer}`
  )
  .join("\n\n")}`);
  }

  // Food-Datenbank
  sections.push(`## Kalorien-Datenbank (${foods.length} Lebensmittel)

Übersicht aller Lebensmittel mit Kalorien-Detailseiten. Jede Seite enthält Makronährstoffe, typische Portionsgrößen, Varianten und passende Alternativen.

${foods.map(renderFood).join("\n")}`);

  // Footer
  sections.push(`---

_Generiert automatisch aus mahlzait.de. Bei Fragen zu Inhalten oder Lizenzierung: kontakt@mahlzait.de_`);

  const body = sections.join("\n\n") + "\n";

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "index, follow",
    },
  });
};
