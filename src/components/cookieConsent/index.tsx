import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_CONSENT_VERSION = "1.0";

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent was already given
    const consent = getConsent();
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 500);
    } else {
      // Load scripts based on previous consent
      loadScripts(consent.preferences);
    }
  }, []);

  const getConsent = (): { preferences: ConsentPreferences; version: string; date: string } | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) return null;
      const consent = JSON.parse(stored);
      // Check if consent version matches (for future updates)
      if (consent.version === COOKIE_CONSENT_VERSION) {
        return consent;
      }
      return null; // Version mismatch, ask again
    } catch {
      return null;
    }
  };

  const saveConsent = (prefs: ConsentPreferences) => {
    if (typeof window === "undefined") return;
    const consent = {
      preferences: prefs,
      version: COOKIE_CONSENT_VERSION,
      date: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    loadScripts(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const loadMahlzaitTracking = (prefs: ConsentPreferences) => {
    if (typeof window === "undefined") return;
    if (!prefs.analytics && !prefs.marketing) return;

    // Prevent duplicate loads
    if (document.querySelector('script[src="/scripts/mahlzait-tracking.js"]')) return;

    const run = () => {
      const script = document.createElement("script");
      script.src = "/scripts/mahlzait-tracking.js";
      script.type = "module";
      script.onload = () => {
        // After script loads, call init if available
        if (typeof (window as any).initMahlzaitTracking === "function") {
          (window as any).initMahlzaitTracking(prefs);
        }
      };
      document.head.appendChild(script);
    };

    // Defer to idle time to avoid competing with critical rendering
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout?: number }) => void)
      | undefined;
    if (typeof ric === "function") {
      ric(run, { timeout: 2000 });
    } else {
      setTimeout(run, 0);
    }
  };

  const loadScripts = (prefs: ConsentPreferences) => {
    if (typeof window === "undefined") return;

    // Analytics scripts
    if (prefs.analytics) {
      loadGoogleAnalytics();
      loadMicrosoftClarity();
    }

    // Marketing scripts
    if (prefs.marketing) {
      loadGoogleAds();
      loadMetaPixel();
    }

    // Custom tracking (only after optional consent)
    loadMahlzaitTracking(prefs);
  };

  const ensureGtagJsLoaded = (tagIdForSrc: string) => {
    if (typeof window === "undefined") return;
    // Prevent duplicate loads (any gtag.js is sufficient)
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]'))
      return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      tagIdForSrc,
    )}`;
    document.head.appendChild(script);
  };

  const ensureGtagInitialized = () => {
    if (typeof window === "undefined") return;
    if ((window as any).gtag) return;

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function gtag() {
      (window as any).dataLayer.push(arguments);
    };
    (window as any).gtag("js", new Date());
  };

  const loadGoogleAnalytics = () => {
    if (typeof window === "undefined") return;
    // Load gtag.js (needed for GA4)
    ensureGtagJsLoaded("G-ZEGRW1C5EF");
    ensureGtagInitialized();

    // Configure GA4 (analytics only)
    (window as any).gtag("config", "G-ZEGRW1C5EF", {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  };

  const loadGoogleAds = () => {
    if (typeof window === "undefined") return;
    // Load gtag.js (needed for Google Ads conversions)
    ensureGtagJsLoaded("AW-17308112458");
    ensureGtagInitialized();

    // Configure Google Ads / Google Tag (marketing only)
    (window as any).gtag("config", "AW-17308112458");
    (window as any).gtag("config", "GT-5M8SQ984");
  };

  const loadMetaPixel = () => {
    if (typeof window === "undefined" || (window as any).fbq) return;

    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1159405849657763');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  };

  const loadMicrosoftClarity = () => {
    if (typeof window === "undefined" || (window as any).clarity) return;

    const script = document.createElement("script");
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "ud4zp58j1r");
    `;
    document.head.appendChild(script);
  };

  // Expose revokeConsent function globally for opt-out links
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).revokeCookieConsent = () => {
        // Remove stored consent
        localStorage.removeItem(COOKIE_CONSENT_KEY);

        // Remove tracking-related keys we created
        const localKeysToRemove = [
          "visitor_id",
          "visit_count",
          "first_visit",
          "acquisition_source",
          "clicked_download",
          "download_store",
        ];
        localKeysToRemove.forEach((k) => localStorage.removeItem(k));
        try {
          sessionStorage.removeItem("page_views");
        } catch {
          // ignore
        }

        // Remove tracking scripts
        const scripts = document.querySelectorAll(
          'script[src*="googletagmanager"], script[src*="clarity"], script[src*="facebook"]',
        );
        scripts.forEach((script) => script.remove());

        // Best-effort cleanup of globals (will be recreated only after new consent)
        try {
          delete (window as any).gtag;
          delete (window as any).dataLayer;
          delete (window as any).fbq;
          delete (window as any).clarity;
        } catch {
          // ignore
        }

        // Reload page to apply changes
        window.location.reload();
      };
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleToggleAnalytics = () => {
    setPreferences((prev) => ({ ...prev, analytics: !prev.analytics }));
  };

  const handleToggleMarketing = () => {
    setPreferences((prev) => ({ ...prev, marketing: !prev.marketing }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 shadow-2xl border-t border-base-300"
        >
          <div className="max-w-screen-lg mx-auto px-4 py-6">
            {!showSettings ? (
              // Main Banner
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Cookie-Einstellungen</h3>
                  <p className="text-sm text-base-content/80">
                    Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und unsere Website zu analysieren. 
                    Einige Cookies sind notwendig für den Betrieb der Website, andere helfen uns, die Nutzung zu verstehen. 
                    Sie können Ihre Präferenzen jederzeit anpassen.
                  </p>
                  <a
                    href="/cookies-policy"
                    className="text-sm font-medium underline mt-2 inline-block"
                  >
                    Cookie-Richtlinie lesen
                  </a>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="btn btn-outline btn-sm"
                  >
                    Einstellungen
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="btn btn-ghost btn-sm"
                  >
                    Nur notwendige
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="btn btn-primary btn-sm"
                  >
                    Alle akzeptieren
                  </button>
                </div>
              </div>
            ) : (
              // Settings Panel
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Cookie-Einstellungen</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    x
                  </button>
                </div>

                {/* Necessary Cookies */}
                <div className="card bg-base-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">Notwendige Cookies</h4>
                      <p className="text-sm text-base-content/70">
                        Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="checkbox checkbox-primary"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="card bg-base-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">Analytics Cookies</h4>
                      <p className="text-sm text-base-content/70">
                        Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren (Google Analytics, Microsoft Clarity).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={handleToggleAnalytics}
                      className="checkbox checkbox-primary"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="card bg-base-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">Marketing Cookies</h4>
                      <p className="text-sm text-base-content/70">
                        Diese Cookies werden verwendet, um Werbung zu messen und zu optimieren (Meta Pixel, Google Ads).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={handleToggleMarketing}
                      className="checkbox checkbox-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleRejectAll}
                    className="btn btn-ghost btn-sm"
                  >
                    Alle ablehnen
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="btn btn-primary btn-sm"
                  >
                    Präferenzen speichern
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;

