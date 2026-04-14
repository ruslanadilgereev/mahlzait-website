/**
 * Topic-Cluster-Registry
 *
 * Zentrale Mapping-Tabelle zwischen Calculators und Wissen-Tags.
 * Wird genutzt, um Calculator → Wissen und Wissen → Calculator-Links
 * konsistent zu generieren (Pillar-Cluster-Verlinkung).
 *
 * - `tags`: Wissen-Tags, die thematisch zu diesem Rechner passen.
 *   Ein Wissen-Artikel ist "passend", wenn er **mindestens einen** dieser Tags hat.
 */

export interface CalculatorEntry {
  slug: string;
  title: string;
  description: string;
  /** Wissen-Tags, die thematisch zu diesem Rechner passen */
  tags: string[];
}

export const calculators: CalculatorEntry[] = [
  {
    slug: "kalorienbedarf-berechnen",
    title: "Kalorienbedarf berechnen",
    description:
      "Dein täglicher Gesamtbedarf (TDEE) nach Mifflin-St Jeor inkl. Aktivität.",
    tags: ["Kalorienbedarf", "TDEE", "Grundumsatz", "Abnehmen", "Makros"],
  },
  {
    slug: "grundumsatz-rechner",
    title: "Grundumsatz-Rechner (BMR)",
    description:
      "Berechne deinen Ruhe-Energieverbrauch. Basis für jede Kalorien-Planung.",
    tags: ["Grundumsatz", "BMR", "Stoffwechsel", "Kalorienbedarf"],
  },
  {
    slug: "kalorienverbrauch-rechner",
    title: "Kalorienverbrauch-Rechner",
    description:
      "Wie viele Kalorien verbrennst du beim Sport? Für 6+ Sportarten.",
    tags: ["Kalorienverbrauch", "Training", "Sport", "Aktivität"],
  },
  {
    slug: "kaloriendefizit-berechnen",
    title: "Kaloriendefizit-Rechner",
    description:
      "Plane ein realistisches Defizit zum Abnehmen — ohne Crash-Diät.",
    tags: [
      "Kaloriendefizit",
      "Abnehmen",
      "Defizit",
      "Gewichtsverlust",
      "Jojo-Effekt",
    ],
  },
  {
    slug: "makros-berechnen",
    title: "Makros berechnen",
    description:
      "Eiweiß, Kohlenhydrate, Fett — die optimale Aufteilung für dein Ziel.",
    tags: ["Makros", "Protein", "Kohlenhydrate", "Fett", "Ernährungsplan"],
  },
  {
    slug: "protein-bedarf-rechner",
    title: "Protein-Bedarf-Rechner",
    description:
      "Wie viel Eiweiß brauchst du pro Tag? Individuell nach Gewicht und Ziel.",
    tags: ["Protein", "Eiweiß", "Muskelaufbau", "Muskelmasse", "Makros"],
  },
  {
    slug: "bmi-rechner",
    title: "BMI-Rechner",
    description:
      "Body Mass Index mit WHO-Kategorien und Alters-Korrektur.",
    tags: ["BMI", "Gewicht", "Idealgewicht", "Gesundheit"],
  },
  {
    slug: "idealgewicht-rechner",
    title: "Idealgewicht-Rechner",
    description:
      "Dein Zielgewicht aus 4 wissenschaftlichen Formeln (Broca, Lorentz, BMI).",
    tags: ["Idealgewicht", "Zielgewicht", "BMI", "Gewicht"],
  },
  {
    slug: "koerperfett-rechner",
    title: "Körperfettanteil-Rechner",
    description:
      "Körperfett in % nach US-Navy-Methode. Aussagekräftiger als BMI.",
    tags: ["Körperfett", "KFA", "Körperkomposition", "Bauchfett"],
  },
  {
    slug: "taille-hueft-verhaeltnis-rechner",
    title: "Taille-Hüft-Verhältnis-Rechner",
    description:
      "WHR — dein Gesundheitsrisiko aus der Fettverteilung.",
    tags: ["WHR", "Bauchfett", "Körperfett", "Gesundheit"],
  },
  {
    slug: "schritte-kalorien-rechner",
    title: "Schritte-in-Kalorien-Rechner",
    description: "Wie viele Kalorien verbrennen 10.000 Schritte?",
    tags: ["Schritte", "NEAT", "Aktivität", "Kalorienverbrauch"],
  },
  {
    slug: "wasserbedarf-rechner",
    title: "Wasserbedarfs-Rechner",
    description:
      "Wie viel Wasser brauchst du? Nach Gewicht, Aktivität und Klima.",
    tags: ["Wasser", "Flüssigkeit", "Hydration"],
  },
  {
    slug: "schlaf-rechner",
    title: "Schlaf-Rechner",
    description: "Optimale Schlafzeiten nach 90-Min-Zyklen.",
    tags: ["Schlaf", "Schlafqualität", "Regeneration", "Chronotyp"],
  },
  {
    slug: "koffein-rechner",
    title: "Koffein-Rechner",
    description: "Tracke Koffein-Konsum gegen das EFSA-Limit (400 mg).",
    tags: ["Koffein", "Kaffee", "Stoffwechsel"],
  },
  {
    slug: "intervallfasten-rechner",
    title: "Intervallfasten-Rechner",
    description: "Finde dein Ess-/Fastenfenster: 16:8, 18:6, 20:4 oder 5:2.",
    tags: [
      "Intervallfasten",
      "16:8",
      "Fasten",
      "Fastenzeit",
      "Zeitfenster",
    ],
  },
  {
    slug: "cheat-day-rechner",
    title: "Cheat-Day-Rechner",
    description: "Plane Extra-Kalorien, ohne dein Defizit zu sprengen.",
    tags: ["Cheat-Day", "Kaloriendefizit", "Abnehmen", "Refeed"],
  },
  {
    slug: "doener-kalorien-rechner",
    title: "Döner-Kalorien-Rechner",
    description: "Kalorien für Döner Kebab, Dürüm, Lahmacun & Extras.",
    tags: ["Döner", "Fast-Food", "Kalorien"],
  },
  {
    slug: "pizza-kalorien-rechner",
    title: "Pizza-Kalorien-Rechner",
    description: "Pizza-Kalorien nach Sorte, Größe, Teig und Belag.",
    tags: ["Pizza", "Fast-Food", "Kalorien"],
  },
  {
    slug: "alkohol-kalorien-rechner",
    title: "Alkohol-Kalorien-Rechner",
    description: "Versteckte Kalorien in Bier, Wein, Cocktails pro Abend.",
    tags: ["Alkohol", "Kalorien", "Abnehmen"],
  },
  {
    slug: "abnahmedatum-berechnen",
    title: "Abnahmedatum-Rechner",
    description: "Wann erreichst du dein Zielgewicht? Taggenau prognostiziert.",
    tags: ["Zielgewicht", "Abnehmen", "Gewichtsverlust", "Kaloriendefizit"],
  },
  {
    slug: "essensplan-erstellen",
    title: "Essensplan erstellen",
    description: "KI-Wochenplan passend zu Kalorien- und Makro-Zielen.",
    tags: ["Ernährungsplan", "Meal Prep", "Makros", "Essensplan"],
  },
  {
    slug: "trainingsplan-erstellen",
    title: "Trainingsplan erstellen",
    description: "KI-Trainingsplan passend zu Ziel, Level und Verfügbarkeit.",
    tags: ["Training", "Muskelaufbau", "Sport", "Aktivität"],
  },
];

const calculatorBySlug: Record<string, CalculatorEntry> = Object.fromEntries(
  calculators.map((c) => [c.slug, c])
);

/**
 * Finde Calculator-Einträge, deren Tags mit mindestens einem der
 * übergebenen Wissen-Tags überlappen.
 * Ergebnis ist nach Anzahl überlappender Tags sortiert (höchste zuerst),
 * Limit = 4.
 */
export function getCalculatorsForTags(
  wissenTags: string[],
  limit: number = 4
): CalculatorEntry[] {
  const tagSet = new Set(wissenTags.map((t) => t.toLowerCase()));
  const scored = calculators
    .map((c) => {
      const overlap = c.tags.filter((t) => tagSet.has(t.toLowerCase())).length;
      return { calc: c, overlap };
    })
    .filter((s) => s.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit).map((s) => s.calc);
}

/**
 * Gibt die Calculator-Metadaten für die angegebenen Slugs zurück
 * (behält die übergebene Reihenfolge).
 */
export function getCalculatorsBySlugs(slugs: string[]): CalculatorEntry[] {
  return slugs
    .map((slug) => calculatorBySlug[slug])
    .filter((c): c is CalculatorEntry => Boolean(c));
}

/**
 * Finde die 3 passendsten Wissen-Artikel zu einem Calculator.
 * Basiert auf Tag-Overlap zwischen calculator.tags und article.tags.
 */
export function getWissenForCalculator<
  T extends { slug: string; tags: string[] }
>(
  calculatorSlug: string,
  allArticles: T[],
  limit: number = 3
): T[] {
  const calc = calculatorBySlug[calculatorSlug];
  if (!calc) return [];
  const calcTagSet = new Set(calc.tags.map((t) => t.toLowerCase()));
  const scored = allArticles
    .map((a) => {
      const overlap = a.tags.filter((t) => calcTagSet.has(t.toLowerCase()))
        .length;
      return { article: a, overlap };
    })
    .filter((s) => s.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit).map((s) => s.article);
}

/**
 * Finde Food-spezifische Calculators für eine Food-Page.
 * Matcht über Slug-/Name-Keywords auf Calculator-Tags.
 *
 * Beispiele:
 *   - pizza → pizza-kalorien-rechner
 *   - doener → doener-kalorien-rechner
 *   - bier / wein / sekt → alkohol-kalorien-rechner
 *   - kaffee / espresso → koffein-rechner
 */
export function getCalculatorsForFood(food: {
  slug: string;
  name: string;
  category?: string;
}): CalculatorEntry[] {
  const text = `${food.slug} ${food.name.toLowerCase()}`;
  const matches: CalculatorEntry[] = [];

  const rules: Array<{ match: RegExp; slug: string }> = [
    { match: /pizza/i, slug: "pizza-kalorien-rechner" },
    { match: /d[öo]ner|kebab|d[üu]r[üu]m|lahmacun|shawarma|schwarma/i, slug: "doener-kalorien-rechner" },
    {
      match: /bier|wein|sekt|prosecco|champagner|cocktail|whisky|vodka|rum|gin|schnaps|liko?r|alkohol/i,
      slug: "alkohol-kalorien-rechner",
    },
    { match: /kaffee|espresso|cappuccino|latte|mokka|koffein/i, slug: "koffein-rechner" },
    { match: /wasser|mineralwasser/i, slug: "wasserbedarf-rechner" },
  ];

  const seen = new Set<string>();
  for (const rule of rules) {
    if (rule.match.test(text)) {
      const c = calculatorBySlug[rule.slug];
      if (c && !seen.has(c.slug)) {
        matches.push(c);
        seen.add(c.slug);
      }
    }
  }

  return matches;
}
