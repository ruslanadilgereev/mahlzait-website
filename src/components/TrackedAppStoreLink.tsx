import { getTrackedAppLink, trackAppStoreClick } from "../utils/trackingLinks";

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

interface TrackedAppStoreLinkProps {
  platform: StorePlatform;
  source: TrackingSource;
  campaign?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A tracked App Store link that:
 * 1. Adds UTM/campaign parameters to the URL
 * 2. Fires a GA4 event on click
 */
export function TrackedAppStoreLink({
  platform,
  source,
  campaign,
  className,
  children,
}: TrackedAppStoreLinkProps) {
  const href = getTrackedAppLink({ platform, source, campaign });

  const handleClick = () => {
    trackAppStoreClick(platform, source);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export default TrackedAppStoreLink;
