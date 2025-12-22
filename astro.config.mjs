import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { agentsSummary } from "@nuasite/agent-summary";

// https://astro.build/config
export default defineConfig({
  site: "https://www.mahlzait.de",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
  integrations: [
    react(),
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        const url = item.url;
        
        // Homepage hoechste Prioritaet
        if (url === "https://www.mahlzait.de/" || url === "https://www.mahlzait.de") {
          item.priority = 1.0;
          item.changefreq = "daily";
        }
        // Hub-Seiten (Wissen, Rechner, Guides) hohe Prioritaet
        else if (
          url.endsWith("/wissen") ||
          url.endsWith("/wissen/") ||
          url.endsWith("/rechner") ||
          url.endsWith("/rechner/") ||
          url.endsWith("/kalorien-zaehlen") ||
          url.endsWith("/kalorien-zaehlen/") ||
          url.endsWith("/abnehmen") ||
          url.endsWith("/abnehmen/")
        ) {
          item.priority = 0.8;
          item.changefreq = "weekly";
        }
        // Wissen-Artikel hohe Prioritaet (SEO-Content)
        else if (url.includes("/wissen/")) {
          item.priority = 0.85;
          item.changefreq = "monthly";
        }
        // App-Intent Guides (long-tail, hohe Conversion)
        else if (
          url.endsWith("/kalorien-zaehlen-app") ||
          url.endsWith("/kalorien-zaehlen-app/") ||
          url.endsWith("/abnehmen-app") ||
          url.endsWith("/abnehmen-app/")
        ) {
          item.priority = 0.75;
          item.changefreq = "monthly";
        }
        // Rechner-Seiten hohe Prioritaet
        else if (
          url.includes("/kalorienbedarf-berechnen") ||
          url.includes("/kaloriendefizit-berechnen") ||
          url.includes("/makros-berechnen")
        ) {
          item.priority = 0.8;
          item.changefreq = "monthly";
        }
        // App-Redirect Seite
        else if (url.includes("/app")) {
          item.priority = 0.9;
          item.changefreq = "weekly";
        }
        // Team-Seite mittlere Prioritaet
        else if (url.includes("/team")) {
          item.priority = 0.6;
          item.changefreq = "monthly";
        }
        // Legal-Seiten niedrigere Prioritaet
        else if (
          url.includes("privacy-policy") ||
          url.includes("datenschutz") ||
          url.includes("terms-and-conditions") ||
          url.includes("nutzungsbedingungen") ||
          url.includes("cookies-policy") ||
          url.includes("impressum") ||
          url.includes("agb") ||
          url.includes("widerrufsbelehrung")
        ) {
          item.priority = 0.3;
          item.changefreq = "monthly";
        }
        return item;
      },
    }),
    agentsSummary(),
  ],
});
