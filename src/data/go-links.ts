/**
 * Go-Link Redirect System
 *
 * Kurzlinks für Content-Marketing mit plattformspezifischem Store-Redirect
 * und Campaign-Tracking (Apple ct + Google UTM).
 *
 * Neuen Link hinzufügen: einfach einen Eintrag in GO_LINKS ergänzen.
 * URL-Schema: mahlzait.de/go/{slug}/
 * Naming: {thema}-{plattform}  (bei mehreren zum gleichen Thema: wasser2-yt, wasser3-yt)
 *   Plattformen: yt (YouTube), tt (TikTok), ig (Instagram), fb (Facebook), rd (Reddit), x (X/Twitter)
 */

export interface GoLink {
  /** UTM source — youtube, tiktok, instagram, facebook */
  source: string;
  /** UTM medium — shorts, reels, post, story, bio */
  medium: string;
  /** UTM campaign — z.B. tutorials_q2_2026 */
  campaign: string;
  /** UTM content — z.B. wasser_001 */
  content: string;
  /** Optional: Custom Apple ct Token (max 40 Zeichen). Default = Slug */
  ct?: string;
}

// ─── App Store Constants ───────────────────────────────────────────────
export const APP_STORE_ID = "id6747400456";
export const APP_STORE_PT = "127913951"; // Provider Token
export const PLAY_STORE_ID = "com.promptit.mytemple";
export const FALLBACK_URL = "https://www.mahlzait.de/";

// ─── Redirect Links ────────────────────────────────────────────────────
export const GO_LINKS: Record<string, GoLink> = {
  "wasser-yt": {
    source: "youtube",
    medium: "shorts",
    campaign: "tutorials",
    content: "wasser",
  },
  "wasser-rd": {
    source: "reddit",
    medium: "post",
    campaign: "tutorials",
    content: "wasser",
  },
  "wasser-tt": {
    source: "tiktok",
    medium: "video",
    campaign: "tutorials",
    content: "wasser",
  },
  "wasser-ig": {
    source: "instagram",
    medium: "reels",
    campaign: "tutorials",
    content: "wasser",
  },
  "wasser-fb": {
    source: "facebook",
    medium: "post",
    campaign: "tutorials",
    content: "wasser",
  },
  "wasser-x": {
    source: "twitter",
    medium: "post",
    campaign: "tutorials",
    content: "wasser",
  },
  "bio-yt": {
    source: "youtube",
    medium: "bio",
    campaign: "bio",
    content: "bio",
  },
  "bio-rd": {
    source: "reddit",
    medium: "bio",
    campaign: "bio",
    content: "bio",
  },
  "bio-tt": {
    source: "tiktok",
    medium: "bio",
    campaign: "bio",
    content: "bio",
  },
  "bio-ig": {
    source: "instagram",
    medium: "bio",
    campaign: "bio",
    content: "bio",
  },
  "bio-fb": {
    source: "facebook",
    medium: "bio",
    campaign: "bio",
    content: "bio",
  },
  "bio-x": {
    source: "twitter",
    medium: "bio",
    campaign: "bio",
    content: "bio",
  },
};

// ─── URL Generators ────────────────────────────────────────────────────
export function getAppStoreUrl(slug: string, link: GoLink): string {
  const ct = (link.ct || slug).slice(0, 40);
  return `https://apps.apple.com/app/apple-store/${APP_STORE_ID}?pt=${APP_STORE_PT}&ct=${ct}&mt=8`;
}

export function getPlayStoreUrl(link: GoLink): string {
  const params = new URLSearchParams({
    id: PLAY_STORE_ID,
    utm_source: link.source,
    utm_medium: link.medium,
    utm_campaign: link.campaign,
    utm_content: link.content,
  });
  return `https://play.google.com/store/apps/details?${params}`;
}
