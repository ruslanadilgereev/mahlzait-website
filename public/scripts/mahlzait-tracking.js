/**
 * Mahlzait Custom Tracking
 *
 * This module is intentionally loaded ONLY after cookie-consent enables
 * analytics and/or marketing. Keeping it out of the base HTML reduces bytes
 * and JS parse/execute time for users without consent.
 */

function getState() {
  // eslint-disable-next-line no-underscore-dangle
  const w = window;
  if (!w.__mahlzaitTrackingState) {
    w.__mahlzaitTrackingState = {
      prefs: { analytics: false, marketing: false },
      contextComputed: false,
      analyticsBootstrapped: false,
      marketingBootstrapped: false,
      listenersAttached: false,
      timeoutsScheduled: false,
      trafficSource: "direct",
      acquisitionType: "organic",
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      maxScroll: 0,
      clickCount: 0,
      downloadClicked: false,
    };
  }
  return w.__mahlzaitTrackingState;
}

function clarityEvent(name) {
  if (typeof clarity === "function") clarity("event", name);
}

function clarityTag(key, value) {
  if (typeof clarity === "function") clarity("set", key, value);
}

function gaEvent(name, params) {
  if (typeof gtag === "function") gtag("event", name, params);
}

function fbEvent(name, params) {
  if (typeof fbq === "function") fbq("track", name, params);
}

function pinterestEvent(name, params) {
  if (typeof pintrk === "function") pintrk("track", name, params);
}

function computeContext(state) {
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source");
  const utmMedium = urlParams.get("utm_medium");
  const utmCampaign = urlParams.get("utm_campaign");
  const gclid = urlParams.get("gclid");
  const fbclid = urlParams.get("fbclid");

  let trafficSource = "direct";
  let acquisitionType = "organic";

  if (gclid) {
    trafficSource = "google_ads";
    acquisitionType = "paid";
  } else if (fbclid) {
    trafficSource = "meta_ads";
    acquisitionType = "paid";
  } else if (utmSource) {
    trafficSource = utmSource;
    acquisitionType =
      utmMedium === "cpc" || utmMedium === "paid" ? "paid" : "organic";
  } else {
    const ref = document.referrer || "";
    if (ref.includes("google")) trafficSource = "google_organic";
    else if (ref.includes("facebook") || ref.includes("instagram"))
      trafficSource = "meta_organic";
    else if (ref.includes("tiktok")) trafficSource = "tiktok";
    else if (ref.includes("youtube")) trafficSource = "youtube";
    else if (ref) trafficSource = "referral";
    else trafficSource = "direct";
    acquisitionType = "organic";
  }

  state.trafficSource = trafficSource;
  state.acquisitionType = acquisitionType;
  state.utmCampaign = utmCampaign || undefined;

  state.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  state.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  state.isAndroid = /Android/i.test(navigator.userAgent);
}

function bootstrapAnalytics(state) {
  // Visitor identification
  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId =
      "v_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("visitor_id", visitorId);
    clarityTag("visitor_type", "new");
    clarityEvent("new_visitor");
  } else {
    clarityTag("visitor_type", "returning");
  }
  clarityTag("visitor_id", visitorId);

  // Visit count
  const visitCount = parseInt(localStorage.getItem("visit_count") || "0", 10) + 1;
  localStorage.setItem("visit_count", String(visitCount));
  clarityTag(
    "visit_count",
    visitCount <= 1
      ? "1_first"
      : visitCount <= 3
        ? "2-3"
        : visitCount <= 10
          ? "4-10"
          : "10+",
  );

  // Days since first visit
  let firstVisit = localStorage.getItem("first_visit");
  if (!firstVisit) {
    firstVisit = String(Date.now());
    localStorage.setItem("first_visit", firstVisit);
  }
  const daysSinceFirst = Math.floor(
    (Date.now() - parseInt(firstVisit, 10)) / (1000 * 60 * 60 * 24),
  );
  clarityTag(
    "days_since_first_visit",
    daysSinceFirst === 0
      ? "today"
      : daysSinceFirst <= 7
        ? "1-7_days"
        : daysSinceFirst <= 30
          ? "8-30_days"
          : "30+_days",
  );

  // Device / browser
  clarityTag("device_type", state.isMobile ? "mobile" : "desktop");
  clarityTag(
    "device_os",
    state.isIOS ? "iOS" : state.isAndroid ? "Android" : "other",
  );
  clarityTag(
    "screen_size",
    window.innerWidth <= 768
      ? "small"
      : window.innerWidth <= 1200
        ? "medium"
        : "large",
  );

  // Time / locale
  const hour = new Date().getHours();
  clarityTag(
    "hour_of_day",
    hour < 6 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening",
  );
  clarityTag(
    "day_of_week",
    ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()],
  );
  clarityTag("is_weekend", [0, 6].includes(new Date().getDay()) ? "yes" : "no");
  clarityTag("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  clarityTag("language", navigator.language);

  // Traffic source / acquisition
  clarityTag("traffic_source", state.trafficSource);
  clarityTag("acquisition_type", state.acquisitionType);
  if (state.utmCampaign) clarityTag("utm_campaign", state.utmCampaign);

  const origSource = localStorage.getItem("acquisition_source");
  if (origSource) clarityTag("original_source", origSource);

  // Page tracking
  const path = window.location.pathname;
  clarityTag("page_path", path);
  clarityTag(
    "page_type",
    path === "/"
      ? "homepage"
      : path.includes("datenschutz") || path.includes("privacy")
        ? "legal"
        : "subpage",
  );

  // Pinterest PageVisit tracking for article and product pages
  if (state.prefs.marketing && typeof pintrk === "function") {
    const isArticlePage = path.startsWith("/wissen/") && path !== "/wissen";
    const isProductPage = ["/app", "/kalorien-zaehlen-app", "/abnehmen-app", "/kalorien-zaehlen", "/abnehmen", "/rechner", "/makros-berechnen"].includes(path);
    
    if (isArticlePage || isProductPage) {
      // Generate unique event_id based on path and timestamp
      const eventId = "pagevisit_" + path.replace(/\//g, "_").replace(/^_/, "") + "_" + Date.now();
      pinterestEvent("pagevisit", {
        event_id: eventId
      });
    }
  }

  // Page views this session
  let pageViews = 1;
  try {
    pageViews = parseInt(sessionStorage.getItem("page_views") || "0", 10) + 1;
    sessionStorage.setItem("page_views", String(pageViews));
  } catch {
    // ignore
  }
  clarityTag("pages_this_session", String(pageViews));

  // Returning converter signal
  if (localStorage.getItem("clicked_download") === "true") {
    clarityTag("returning_converter", "yes");
  }
}

function bootstrapMarketing(state) {
  // Persist acquisition source only for marketing attribution
  localStorage.setItem("acquisition_source", state.trafficSource);
}

function scheduleEngagementTimers(state) {
  if (state.timeoutsScheduled) return;
  state.timeoutsScheduled = true;

  const sessionStart = Date.now();

  const schedule = (seconds, eventName, levelTag) => {
    window.setTimeout(() => {
      const currentPrefs = getState().prefs;
      if (!currentPrefs.analytics) return;
      clarityEvent(eventName);
      clarityTag("engagement_level", levelTag);
    }, seconds * 1000);
  };

  schedule(30, "engaged_30s", "30s+");
  schedule(60, "engaged_60s", "60s+");
  schedule(120, "engaged_2min", "2min+");
  schedule(300, "engaged_5min", "5min+");

  // Store for unload metrics
  state.sessionStart = sessionStart;
}

function attachListeners(state) {
  // Scroll tracking (analytics only) – throttled via rAF
  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      const currentPrefs = getState().prefs;
      if (!currentPrefs.analytics) return;
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        scrollTicking = false;
        const denom = document.body.scrollHeight - window.innerHeight;
        if (denom <= 0) return;
        const scrollPercent = Math.round((window.scrollY / denom) * 100);
        if (scrollPercent > state.maxScroll) {
          state.maxScroll = scrollPercent;
          clarityTag("max_scroll", state.maxScroll + "%");
          if (state.maxScroll >= 25 && state.maxScroll < 50)
            clarityEvent("scroll_25");
          else if (state.maxScroll >= 50 && state.maxScroll < 75)
            clarityEvent("scroll_50");
          else if (state.maxScroll >= 75 && state.maxScroll < 100)
            clarityEvent("scroll_75");
          else if (state.maxScroll >= 100) clarityEvent("scroll_100");
        }
      });
    },
    { passive: true },
  );

  // Click tracking (analytics + marketing)
  document.addEventListener("click", (e) => {
    const currentPrefs = getState().prefs;

    if (currentPrefs.analytics) {
      state.clickCount += 1;
      clarityTag("clicks_this_session", String(state.clickCount));
    }

    const link = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!link) return;

    const href = link.href || "";
    const isAppStore = href.includes("apps.apple.com");
    const isPlayStore = href.includes("play.google.com");

    if (!isAppStore && !isPlayStore) return;

    state.downloadClicked = true;
    const store = isAppStore ? "ios" : "android";

    // Marketing attribution (only if marketing consent)
    if (currentPrefs.marketing) {
      localStorage.setItem("clicked_download", "true");
      localStorage.setItem("download_store", store);
    }

    // Analytics signals
    if (currentPrefs.analytics) {
      clarityTag("download_store", store);
      clarityEvent("download_click");
      clarityEvent("download_" + store);

      gaEvent("download_click", {
        store,
        device: state.isMobile ? "mobile" : "desktop",
        source: state.trafficSource || "unknown",
      });
    }

    // Marketing conversions
    if (currentPrefs.marketing) {
      gaEvent("conversion", {
        send_to: "AW-17308112458",
        event_category: "App Download",
        event_label: store,
      });

      fbEvent("Lead", {
        content_name: store + "_download",
        content_category: "App Download",
        value: 1.0,
        currency: "EUR",
      });
    }
  });

  // Section visibility (analytics only)
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const currentPrefs = getState().prefs;
        if (!currentPrefs.analytics) return;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const section =
            el.id || (el.className ? String(el.className).split(" ")[0] : "section");
          clarityEvent("viewed_" + section);
          clarityTag("last_section_viewed", section);
          sectionObserver.unobserve(el);
        });
      },
      { threshold: 0.3 },
    );

    document
      .querySelectorAll("section, [data-section]")
      .forEach((el) => sectionObserver.observe(el));
  }

  // Exit intent (desktop, analytics only)
  let exitIntentShown = false;
  document.addEventListener("mouseout", (e) => {
    const currentPrefs = getState().prefs;
    if (!currentPrefs.analytics) return;
    if (state.isMobile) return;
    if (exitIntentShown) return;
    if (state.downloadClicked) return;
    if (e && typeof e.clientY === "number" && e.clientY < 10) {
      exitIntentShown = true;
      clarityEvent("exit_intent");
      clarityTag("showed_exit_intent", "yes");
    }
  });

  // Unload metrics (analytics only)
  window.addEventListener("beforeunload", () => {
    const currentPrefs = getState().prefs;
    if (!currentPrefs.analytics) return;

    const sessionStart = state.sessionStart || Date.now();
    const timeOnPage = Math.floor((Date.now() - sessionStart) / 1000);

    clarityTag("final_time_on_page", timeOnPage + "s");
    clarityTag("final_scroll_depth", state.maxScroll + "%");
    clarityTag("final_click_count", String(state.clickCount));
    clarityTag("did_convert", state.downloadClicked ? "yes" : "no");

    let score = 0;
    if (timeOnPage > 30) score += 20;
    if (timeOnPage > 120) score += 20;
    if (state.maxScroll > 50) score += 20;
    if (state.maxScroll > 90) score += 10;
    if (state.clickCount > 3) score += 10;
    if (state.downloadClicked) score += 20;
    clarityTag("engagement_score", String(score));
  });
}

export function initMahlzaitTracking(prefs) {
  try {
    if (!prefs || (!prefs.analytics && !prefs.marketing)) return;

    const state = getState();
    state.prefs = { analytics: !!prefs.analytics, marketing: !!prefs.marketing };

    if (!state.contextComputed) {
      computeContext(state);
      state.contextComputed = true;
    }

    // Bootstraps
    if (state.prefs.analytics && !state.analyticsBootstrapped) {
      bootstrapAnalytics(state);
      scheduleEngagementTimers(state);
      state.analyticsBootstrapped = true;
    }
    if (state.prefs.marketing && !state.marketingBootstrapped) {
      bootstrapMarketing(state);
      state.marketingBootstrapped = true;
    }

    if (!state.listenersAttached) {
      attachListeners(state);
      state.listenersAttached = true;
    }
  } catch {
    // Never break the page for tracking.
  }
}

// Also expose on window so it can be called after script-tag load
if (typeof window !== "undefined") {
  window.initMahlzaitTracking = initMahlzaitTracking;
}


