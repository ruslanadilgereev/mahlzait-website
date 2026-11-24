import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { agentsSummary } from "@nuasite/agent-summary";
import indexnow from "astro-indexnow";

const enableIndexNow = process.platform !== "win32";

// https://astro.build/config
export default defineConfig({
  site: "https://www.mahlzait.de",
  trailingSlash: "always",
  compressHTML: true,
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
    // Ohne Streaming: React 18 schreibt beim Streamen NUL-Zeichen vor Zeichen an Puffergrenzen (Umlaute, Emojis).
    react({ experimentalDisableStreaming: true }),
    tailwind(),
    agentsSummary(),
    ...(enableIndexNow
      ? [indexnow({ key: "7bb723df280c7edd23f15dfedf45fb3f" })]
      : []),
  ],
});
