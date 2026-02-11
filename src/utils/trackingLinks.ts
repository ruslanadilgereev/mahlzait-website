// Utility for tracked App Store links with UTM parameters

import templateConfig from "./config";

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
 * Generates an App Store link with UTM parameters for tracking
 */
export function getTrackedAppLink(options: TrackedLinkOptions): string {
  const { platform, source, campaign = "website" } = options;
  
  if (platform === "ios") {
    // Apple App Store - uses 'ct' (campaign token) and 'pt' (provider token)
    const baseUrl = templateConfig.appStoreLink;
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}ct=${campaign}_${source}`;
  } else {
    // Google Play - uses referrer parameter with UTM
    const baseUrl = templateConfig.googlePlayLink;
    const utmParams = encodeURIComponent(
      `utm_source=website&utm_medium=${source}&utm_campaign=${campaign}`
    );
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}referrer=${utmParams}`;
  }
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
