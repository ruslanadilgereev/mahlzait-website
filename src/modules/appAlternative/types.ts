/**
 * Inhalt einer Alternativ-Seite (/yazio-alternative/ usw.). Die Fakten zur App
 * selbst (Preise, Gratis-Umfang, Bewertung) kommen aus src/data/calorie-apps.json,
 * hier steht nur der Text, der für diese eine App geschrieben ist.
 */

export interface AlternativePick {
  /** Slug aus calorie-apps.json */
  slug: string;
  /** Warum diese App für Wechsler von der Konkurrenz-App passt. */
  why: string;
}

export interface CancelRoute {
  where: string;
  steps: string[];
}

/** Zusätzlicher, nur für diese App sinnvoller Abschnitt. */
export interface ExtraSection {
  heading: string;
  paragraphs?: string[];
  table?: { head: string[]; rows: string[][]; note?: string };
  cards?: { title: string; body: string }[];
  closing?: string[];
}

export interface AlternativePageContent {
  /** Slug der Konkurrenz-App in calorie-apps.json */
  competitor: string;
  /** URL-Pfad mit Slash am Ende, z. B. "/yazio-alternative/" */
  path: string;
  seo: { title: string; description: string };
  /** Kurzname für Breadcrumb und WebPage-Schema */
  breadcrumb: string;
  h1: string;
  intro: string[];
  alternativesIntro: string;
  alternatives: AlternativePick[];
  costHeading: string;
  cost: string[];
  /**
   * Verweis auf eine eigene Kostenseite. Ist er gesetzt, bleibt der
   * Kostenabschnitt eine Kurzfassung mit diesem Link, ohne Preiskarte, damit
   * beide Seiten nicht dieselbe Suche bedienen (z. B. /yazio-kosten/).
   */
  costLink?: { href: string; label: string };
  /** Abschnitt "Ist X kostenlos?"; entfällt, wenn die Kostenseite ihn abdeckt. */
  freeHeading?: string;
  free?: string[];
  reasons: { title: string; body: string }[];
  extraSections?: ExtraSection[];
  cancelHeading: string;
  cancelIntro: string;
  cancelRoutes: CancelRoute[];
  cancelNote?: string;
  stayHeading: string;
  stayIf: string[];
  faq: { q: string; a: string }[];
  publishedAt: string;
  updatedAt: string;
}
