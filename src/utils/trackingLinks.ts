// Utility for tracked App Store links with UTM parameters

import { APP_STORE_ID, APP_STORE_PT, PLAY_STORE_ID } from "../data/go-links";

type StorePlatform = "ios" | "android";
type TrackingSource =
  | "header"
  | "hero"
  | "cta_banner"
  | "calculator"
  | "wissen"
  | "footer"
  | "pricing"
  | "features";

interface TrackedLinkOptions {
  platform: StorePlatform;
  source: TrackingSource;
  campaign?: string;
}

/**
 * Generates an App Store link with UTM parameters for tracking.
 *
 * Builds clean URLs from the App-ID constants (NOT from `templateConfig.*Link`,
 * because those carry default homepage UTMs and would produce duplicates that
 * the stores discard).
 */
export function getTrackedAppLink(options: TrackedLinkOptions): string {
  const { platform, source, campaign = "website" } = options;

  if (platform === "ios") {
    // Apple App Store: ct = campaign token (max 40 chars), pt = provider token.
    const ct = `${campaign}_${source}`.slice(0, 40);
    return `https://apps.apple.com/app/apple-store/${APP_STORE_ID}?pt=${APP_STORE_PT}&ct=${ct}&mt=8`;
  }

  // Google Play: ALL UTMs must be URL-encoded inside ONE `referrer=` parameter,
  // otherwise Play Store discards them and the app receives no install referrer.
  // Doku: https://developer.android.com/google/play/installreferrer
  const referrer = encodeURIComponent(
    `utm_source=website&utm_medium=${source}&utm_campaign=${campaign}`
  );
  return `https://play.google.com/store/apps/details?id=${PLAY_STORE_ID}&referrer=${referrer}`;
}

/**
 * Track App Store click event to GA4
 * Call this on link click
 */
export function trackAppStoreClick(platform: StorePlatform, source: TrackingSource): void {
  // Check if gtag is available (GA4)
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "app_store_click", {
      event_category: "conversion",
      event_label: `${platform}_${source}`,
      platform: platform,
      source: source,
    });
  }
  
  // Also log to console in dev
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    console.log(`[Tracking] App Store Click: ${platform} from ${source}`);
  }
}

/**
 * Get both tracked links for a given source
 */
export function getTrackedLinks(source: TrackingSource, campaign?: string) {
  return {
    ios: getTrackedAppLink({ platform: "ios", source, campaign }),
    android: getTrackedAppLink({ platform: "android", source, campaign }),
  };
}
