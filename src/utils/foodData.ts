// Zentrale Food-Daten-Aggregation für Cluster-/Hub-Seiten (Kalorientabelle,
// kalorienarme/eiweißreiche/kalorienreiche Lebensmittel).
// Lädt alle Food-JSONs (wie sitemaps.ts) und stellt typisierte, sortierte Listen bereit.

export interface FoodEntry {
  slug: string;
  name: string;
  emoji: string;
  category: string;
  overview: {
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    fiber_per_100g?: number;
    typical_portion_g?: number;
    typical_portion_name?: string;
  };
}

const foodFiles = import.meta.glob("../data/foods/*.json", { eager: true });

export const allFoods: FoodEntry[] = Object.values(foodFiles)
  .map((mod: any) => (mod.default || mod) as FoodEntry)
  .filter((f) => f && f.slug && f.overview && typeof f.overview.calories_per_100g === "number");

export const CATEGORY_LABELS: Record<string, string> = {
  supermarkt: "Supermarkt & Grundnahrungsmittel",
  gericht: "Gerichte & Mahlzeiten",
  "fast-food": "Fast Food & Snacks",
  getraenk: "Getränke",
};

// Nach Kalorien aufsteigend (kalorienarm zuerst)
export function foodsByCaloriesAsc(): FoodEntry[] {
  return [...allFoods].sort(
    (a, b) => a.overview.calories_per_100g - b.overview.calories_per_100g,
  );
}

// Nach Kalorien absteigend (kalorienreich zuerst)
export function foodsByCaloriesDesc(): FoodEntry[] {
  return [...allFoods].sort(
    (a, b) => b.overview.calories_per_100g - a.overview.calories_per_100g,
  );
}

// Nach Protein absteigend (eiweißreich zuerst)
export function foodsByProteinDesc(): FoodEntry[] {
  return [...allFoods].sort(
    (a, b) => b.overview.protein_per_100g - a.overview.protein_per_100g,
  );
}

// Alphabetisch (für die große Kalorientabelle)
export function foodsByName(): FoodEntry[] {
  return [...allFoods].sort((a, b) => a.name.localeCompare(b.name, "de"));
}

// Nach Kohlenhydraten aufsteigend (low carb / kohlenhydratarm zuerst).
// Getränke ausgeschlossen (verzerren die Liste mit 0g) — Fokus auf echte Lebensmittel.
export function foodsByCarbsAsc(): FoodEntry[] {
  return [...allFoods]
    .filter((f) => f.category !== "getraenk")
    .sort((a, b) => a.overview.carbs_per_100g - b.overview.carbs_per_100g);
}
