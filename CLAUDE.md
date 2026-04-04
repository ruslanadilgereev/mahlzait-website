# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Marketing website for **Mahlzait** (mahlzait.de) — a calorie counter app with AI-powered meal logging. Built with Astro 5, React 18 islands, TailwindCSS + DaisyUI. Deployed on Vercel (auto-deploy on push). All content is German.

## Commands

```bash
pnpm i                    # Install dependencies
pnpm dev                  # Dev server at localhost:4321
pnpm build                # Production build (outputs to dist/)
pnpm build:prod           # Production build with NODE_ENV=production
pnpm check                # TypeScript type checking (astro check)
pnpm preview              # Preview production build locally
```

### Wissen (Research Articles) Workflow

```bash
pnpm wissen:extract       # Extract metadata from PDFs in src/modules/wissen/
pnpm wissen:resolve       # Resolve metadata via Crossref API
pnpm wissen:check         # Verify article slug consistency (slug in index.ts matches filename)
```

Full workflow documented in `WISSEN_WORKFLOW.md`. Key rule: markdown filename = slug, no H1 in article body (the page template renders H1).

## Architecture

### Rendering Pattern

Astro static site with React **islands** (`client:idle` / `client:load`). Each page is an `.astro` file that imports a React module as a hydrated island. The `Layout.astro` wrapper handles `<head>`, SEO meta, canonical URLs, and Vercel analytics.

```
src/pages/index.astro          → imports HomePage from @modules/home
src/pages/kalorienbedarf-berechnen.astro → imports KalorienbedarfPage from @modules/kalorienbedarf
src/pages/kalorien/[slug].astro → dynamic routes from JSON files in src/data/foods/
src/pages/wissen/[slug].astro   → dynamic routes from markdown in src/content/wissen/articles/
```

### Path Aliases (tsconfig.json)

- `@modules/*` → `src/modules/*`
- `@styles/*` → `src/styles/*`
- `@components/*` → `src/components/*`
- `@content/*` → `src/content/*`
- `utils/*` → `src/utils/*` (no alias prefix, uses baseUrl)

### Central Config

`src/utils/config.ts` is the single source of truth for site-wide content: SEO defaults, app store links, navbar, footer, homepage sections (header, features, testimonials, FAQ, pricing, how-it-works), and legal page content. Type: `src/utils/configType.ts`.

**Performance note:** The homepage strips legal content from config before passing to the React island to reduce HTML payload (~40KB → ~12KB).

### Page Types

1. **Homepage** (`index.astro`) — React island with sections driven by config
2. **Calculator/Tool pages** (~15 pages like `kalorienbedarf-berechnen.astro`, `bmi-rechner.astro`) — standalone Astro pages with embedded React calculator components, inline FAQ schemas
3. **SEO landing pages** (`abnehmen-app.astro`, `kalorien-zaehlen.astro`, etc.) — long-form content pages targeting specific keywords
4. **Wissen articles** (`wissen/[slug].astro`) — research paper analyses rendered from markdown, metadata in `src/content/wissen/index.ts`
5. **Food pages** (`kalorien/[slug].astro`) — ~301 food calorie pages generated from JSON files in `src/data/foods/`
6. **Legal pages** — content lives in `config.ts`

### Module Pattern

Each page type has a corresponding module in `src/modules/<name>/` containing the main React component and its sub-components in `_components/`. Example: `src/modules/home/` has `_components/header/`, `_components/features/`, `_components/pricing/`, etc.

### SEO Infrastructure

- **Structured Data:** `src/components/seo/StructuredData.astro` assembles JSON-LD from schema generators in `src/components/seo/schemas/` (website, organization, mobileApp, faq, review, howto, breadcrumb, product, webpage)
- **Sitemaps:** Split sitemaps in `src/pages/sitemaps/` (core, calculators, foods, wissen, legal)
- **AI content endpoint:** `src/pages/api/content.json.ts` serves structured data for AI crawlers
- **IndexNow:** Enabled via `astro-indexnow` integration (disabled on Windows dev)

### Theming

Custom DaisyUI themes `mahlzait` (light) and `mahlzait-dark` defined in `tailwind.config.mjs`. Brand colors: teal `#009688` (primary/premium), green `#008635` (calories), blue `#0285FF` (protein), red `#E02E2A` (carbs), orange `#E25507` (fat). Dark mode variants exist. Theme toggle via `src/components/themeSelector/`.

Light/dark themed screenshots are handled by `src/hooks/useThemedScreenshot.ts` and `src/components/logo/ThemeLogo.tsx`.

### Vercel Configuration

`vercel.json` handles redirects (non-www → www, legacy WordPress paths → `/gone/`), security headers (CSP, HSTS, X-Frame-Options), and aggressive caching for static assets. The CSP allowlist includes Google Analytics, Facebook Pixel, Pinterest, Clarity, and Vercel.

## Conventions

- All URLs use trailing slashes (`trailingSlash: "always"` in astro config)
- Site URL is hardcoded as `https://www.mahlzait.de` in Layout and schema generators
- Astro pages handle SEO/meta/structured data; React modules handle interactive UI
- Calculator pages define FAQ schemas inline in the `.astro` frontmatter
- Food data JSONs in `src/data/foods/` include `slug`, `name`, `emoji`, `seo`, `faq`, `related_foods`
