import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { agentsSummary } from "@nuasite/agent-summary";

// https://astro.build/config
export default defineConfig({
  site: "https://mahlzait.de",
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
      customPages: [
        "https://mahlzait.de/",
        "https://mahlzait.de/app",
        "https://mahlzait.de/privacy-policy",
        "https://mahlzait.de/terms-and-conditions",
        "https://mahlzait.de/cookies-policy",
      ],
      serialize(item) {
        // Homepage höchste Priorität
        if (item.url === "https://mahlzait.de/") {
          item.priority = 1.0;
          item.changefreq = "daily";
        }
        // App-Seite hohe Priorität
        if (item.url === "https://mahlzait.de/app") {
          item.priority = 0.9;
          item.changefreq = "weekly";
        }
        // Legal-Seiten niedrigere Priorität
        if (
          item.url.includes("privacy-policy") ||
          item.url.includes("terms-and-conditions") ||
          item.url.includes("cookies-policy")
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
