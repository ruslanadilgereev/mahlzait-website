import data from "./calorie-apps.json";
import ratingsData from "./calorie-app-ratings.json";

/**
 * Kalorienzähler-Apps im Vergleich: eine Datenquelle für /kalorienzaehler-app/,
 * die Alternativ-Seiten, die Vergleichstabelle auf der Startseite und
 * /comparison.json.
 *
 * Die Fakten stehen in calorie-apps.json, jede App mit Quellen (App-Store-Seite,
 * Beschreibung oder Website des Anbieters). Preise sind In-App-Preise aus dem
 * deutschen App Store und schwanken mit Angeboten, deshalb Spannen statt
 * Einzelpreise. Was ein Anbieter offenlässt, bleibt "ja" oder "unbekannt"
 * statt einer Vermutung.
 *
 * Bewertungen schreibt scripts/fetch-app-ratings.cjs vor jedem Build in
 * calorie-app-ratings.json (iTunes Lookup API, deutscher App Store).
 */

/**
 * kostenlos: in der Gratis-Version enthalten
 * abo: nur mit Bezahl-Abo
 * ja: vorhanden, der Anbieter nennt nicht, ob gratis oder im Abo
 * nein: nicht vorhanden
 * unbekannt: keine Angabe des Anbieters
 */
export type FeatureStatus = "kostenlos" | "abo" | "ja" | "nein" | "unbekannt";
export type FreeTier = "ja" | "eingeschränkt" | "nein";

export interface AppSource {
  label: string;
  url: string;
}

export interface CalorieApp {
  slug: string;
  name: string;
  provider: string;
  seat: string;
  euSeat: boolean;
  appStoreId: string;
  website: string;
  germanUi: boolean;
  freeTier: FreeTier;
  freeSummary: string;
  /** null: keine Angabe des Anbieters oder keine Gratis-Version */
  adsInFree: boolean | null;
  barcode: FeatureStatus;
  photo: FeatureStatus;
  monthly: string | null;
  yearly: string | null;
  priceNote: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  alternativePath: string | null;
  sources: AppSource[];
}

export interface AppRating {
  ratingValue: number;
  ratingCount: number;
}

const FEATURE_STATUSES: FeatureStatus[] = [
  "kostenlos",
  "abo",
  "ja",
  "nein",
  "unbekannt",
];
const FREE_TIERS: FreeTier[] = ["ja", "eingeschränkt", "nein"];

// Handgepflegte JSON: falsche Werte sollen den Build abbrechen, nicht still
// eine falsche Tabelle erzeugen.
function assertValid(app: CalorieApp): CalorieApp {
  const problems: string[] = [];
  if (!FREE_TIERS.includes(app.freeTier)) problems.push("freeTier");
  if (!FEATURE_STATUSES.includes(app.barcode)) problems.push("barcode");
  if (!FEATURE_STATUSES.includes(app.photo)) problems.push("photo");
  if (!/^\d+$/.test(app.appStoreId)) problems.push("appStoreId");
  if (app.sources.length === 0) problems.push("sources");
  if (app.alternativePath && !/^\/[a-z0-9-]+\/$/.test(app.alternativePath)) {
    problems.push("alternativePath");
  }
  if (problems.length > 0) {
    throw new Error(
      `calorie-apps.json: ungültige Felder bei ${app.slug}: ${problems.join(", ")}`,
    );
  }
  return app;
}

export const calorieApps: CalorieApp[] = (data.apps as CalorieApp[]).map(
  assertValid,
);

/** ISO-Datum (YYYY-MM-DD), an dem Preise und Funktionen geprüft wurden. */
export const appFactsAsOf: string = data.asOf;

const ratings = ratingsData.apps as Record<string, AppRating>;

export function getCalorieApp(slug: string): CalorieApp {
  const app = calorieApps.find((candidate) => candidate.slug === slug);
  if (!app) throw new Error(`Unbekannte App im Vergleich: ${slug}`);
  return app;
}

export function getAppRating(app: CalorieApp): AppRating | null {
  const rating = ratings[app.appStoreId];
  if (!rating || rating.ratingCount <= 0) return null;
  return rating;
}

export function appStoreUrl(app: CalorieApp): string {
  return `https://apps.apple.com/de/app/id${app.appStoreId}`;
}

/**
 * Reihenfolge für Tabellen und Listen: Mahlzait zuerst, weil es unsere Seite
 * ist und das sichtbar sein soll, danach nach Anzahl der App-Store-Bewertungen.
 */
export function comparisonOrder(
  apps: CalorieApp[] = calorieApps,
): CalorieApp[] {
  const count = (app: CalorieApp) => getAppRating(app)?.ratingCount ?? 0;
  return [...apps].sort((a, b) => {
    if (a.slug === "mahlzait") return -1;
    if (b.slug === "mahlzait") return 1;
    return count(b) - count(a);
  });
}

const oneDecimal = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const thousands = new Intl.NumberFormat("de-DE");

/** "4,6 ★" */
export function formatStars(rating: AppRating): string {
  return `${oneDecimal.format(rating.ratingValue)} ★`;
}

/** "445.188 Bewertungen" */
export function formatRatingCount(rating: AppRating): string {
  return `${thousands.format(rating.ratingCount)} Bewertungen`;
}

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/**
 * "2026-10-09" -> "9. Oktober 2026". Ohne Date-Objekt, damit Server und
 * Browser in jeder Zeitzone dasselbe Datum rendern.
 */
export function formatGermanDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return `${day}. ${MONTHS[month - 1]} ${year}`;
}

/** "Oktober 2026" */
export function formatGermanMonth(iso: string): string {
  const [year, month] = iso.slice(0, 7).split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export const featureLabel: Record<FeatureStatus, string> = {
  kostenlos: "Gratis",
  abo: "Nur im Abo",
  ja: "Ja",
  nein: "Nein",
  unbekannt: "Keine Angabe",
};

export const freeTierLabel: Record<FreeTier, string> = {
  ja: "Ja",
  eingeschränkt: "Eingeschränkt",
  nein: "Nein",
};

export function adsLabel(app: CalorieApp): string {
  if (app.freeTier === "nein") return "–";
  if (app.adsInFree === null) return "Keine Angabe";
  return app.adsInFree ? "Ja" : "Nein";
}

/** Kurzer Preis für Tabellen: Jahresabo, sonst Monatsabo. */
export function priceSummary(app: CalorieApp): string {
  if (app.yearly) return `${app.yearly} / Jahr`;
  if (app.monthly) return `${app.monthly} / Monat`;
  return "Je nach Angebot";
}
