/**
 * Go-Link Redirect System — dynamic catch-all
 *
 * Any URL mahlzait.de/go/<slug> works without code changes.
 * Naming convention: <name>-<platform>  (e.g. peter-ig, video42-tt, insta1-ig)
 * The platform suffix is auto-detected → utm_source.
 * The full slug is used as Apple ct token and as utm_campaign/utm_content.
 */

// ─── App Store Constants ───────────────────────────────────────────────
export const APP_STORE_ID = "id6747400456";
export const APP_STORE_PT = "127913951"; // Provider Token
export const PLAY_STORE_ID = "com.promptit.mytemple";
export const FALLBACK_URL = "https://www.mahlzait.de/";

// ─── Platform Suffix → utm_source ─────────────────────────────────────
const SUFFIX_SOURCE_MAP: Record<string, string> = {
  ig: "instagram",
  insta: "instagram",
  tt: "tiktok",
  tiktok: "tiktok",
  yt: "youtube",
  youtube: "youtube",
  fb: "facebook",
  facebook: "facebook",
  x: "twitter",
  twitter: "twitter",
  rd: "reddit",
  reddit: "reddit",
  sms: "sms",
  wa: "whatsapp",
  whatsapp: "whatsapp",
  email: "email",
  mail: "email",
};

export const VALID_SOURCES = [
  ...new Set(Object.values(SUFFIX_SOURCE_MAP)),
  "direct",
] as const;

export interface ParsedSlug {
  slug: string;
  source: string;
}

export function parseSlug(raw: string | null | undefined): ParsedSlug | null {
  const slug = String(raw || "").toLowerCase().trim();
  if (!/^[a-z0-9_-]{1,40}$/.test(slug)) return null;
  const match = slug.match(/-([a-z]+)$/);
  const source =
    match && SUFFIX_SOURCE_MAP[match[1]] ? SUFFIX_SOURCE_MAP[match[1]] : "direct";
  return { slug, source };
}

// ─── URL Generators ────────────────────────────────────────────────────
export function getAppStoreUrl(slug: string): string {
  const ct = slug.slice(0, 40);
  return `https://apps.apple.com/app/apple-store/${APP_STORE_ID}?pt=${APP_STORE_PT}&ct=${ct}&mt=8`;
}

export function getPlayStoreUrl(slug: string, source: string): string {
  // Google Play Install Referrer braucht ALLE UTMs URL-encoded im
  // EINZELNEN `referrer=`-Parameter. Direkte Query-Params (?utm_source=…)
  // werden vom Play Store ignoriert und kommen NIE in der App an.
  // Doku: https://developer.android.com/google/play/installreferrer
  const referrer = new URLSearchParams({
    utm_source: source,
    utm_medium: "golink",
    utm_campaign: slug,
    utm_content: slug,
  }).toString();
  return `https://play.google.com/store/apps/details?id=${PLAY_STORE_ID}&referrer=${encodeURIComponent(referrer)}`;
}
