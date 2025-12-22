import defaultTheme from "tailwindcss/defaultTheme";
import config from "./src/utils/config";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    screens: {
      "3xs": "350px",
      "2xs": "400px",
      xs: "475px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        // Mahlzait brand colors (Light Mode)
        'mahlzait-teal': '#009688',       // Premium
        'mahlzait-green': '#008635',      // Kalorien (Light)
        'mahlzait-blue': '#0285FF',       // Protein (Light)
        'mahlzait-red': '#E02E2A',        // Carbs (Light)
        'mahlzait-orange': '#E25507',     // Fat (Light)
        // Dark Mode variants
        'mahlzait-green-dark': '#40C977', // Kalorien (Dark)
        'mahlzait-blue-dark': '#0285FF',  // Protein (Dark)
        'mahlzait-red-dark': '#FF8583',   // Carbs (Dark)
        'mahlzait-orange-dark': '#FF9E6C', // Fat (Dark)
      },
      fontFamily: {
        sketch: ["CabinSketch", ...defaultTheme.fontFamily.mono],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Open Sans",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      animation: {
        "meteor-effect": "meteor 5s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: [
      {
        mahlzait: {
          // Primary colors
          "primary": "#009688",           // Teal (Premium)
          "secondary": "#008635",         // Green (Kalorien)
          "accent": "#0285FF",            // Blue (Protein)
          "neutral": "#0D0D0D",           // Text Primary Light
          
          // Base colors (Light Mode)
          "base-100": "#FFFFFF",          // Background Primary
          "base-200": "#F3F3F3",          // Background Tertiary
          "base-300": "#E8E8E8",          // Background Secondary
          "base-content": "#0D0D0D",      // Text Primary
          
          // Additional
          "info": "#0285FF",              // Blue
          "success": "#008635",           // Green
          "warning": "#E25507",           // Orange
          "error": "#E02E2A",             // Red
        },
        "mahlzait-dark": {
          // Primary colors
          "primary": "#009688",           // Teal (Premium)
          "secondary": "#40C977",         // Green Dark (Kalorien)
          "accent": "#0285FF",            // Blue (Protein)
          "neutral": "#FFFFFF",           // Text Primary Dark
          
          // Base colors (Dark Mode)
          "base-100": "#212121",          // Background Primary Dark
          "base-200": "#303030",          // Background Secondary Dark
          "base-300": "#414141",          // Background Tertiary Dark
          "base-content": "#FFFFFF",      // Text Primary Dark
          
          // Additional
          "info": "#0285FF",              // Blue
          "success": "#40C977",           // Green Dark
          "warning": "#FF9E6C",           // Orange Dark
          "error": "#FF8583",             // Red Dark
        },
      },
    ],
  },
};
