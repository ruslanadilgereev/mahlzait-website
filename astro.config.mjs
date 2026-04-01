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
    react(),
    tailwind(),
    agentsSummary(),
    ...(enableIndexNow
      ? [indexnow({ key: "1c802a7f00434fe04c269ffb5f9e526a" })]
      : []),
  ],
});
