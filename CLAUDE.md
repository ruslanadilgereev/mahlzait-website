# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Marketing website for **Mahlzait** (mahlzait.de) — a calorie counter app with AI-powered meal logging. Built with Astro 5, React 18 islands, TailwindCSS + DaisyUI. Deployed on Vercel (auto-deploy on push). All content is German. (The `package.json` `name` is still the template leftover `mobile-app-template`.)

## Commands

```bash
pnpm i                    # Install dependencies
pnpm dev                  # Dev server at localhost:4321 (alias: pnpm start)
pnpm build                # Production build → dist/ (runs prebuild hook first, see below)
pnpm build:prod           # Production build with NODE_ENV=production
pnpm check                # TypeScript type checking (astro check)
pnpm preview              # Preview production build locally

pnpm indexing:submit      # Submit URLs to IndexNow + Google Indexing API (--all, --dry-run, or paths)
pnpm favicon:generate     # Regenerate favicon PNGs/ICO from public/favicon.svg
```

**No test framework.** There is no vitest/jest/playwright. The only quality gates are `prettier` (+ `prettier-plugin-astro`) and `pnpm check` (astro check, TS `strict`). **Verify changes with `pnpm check` + `pnpm build`.** Don't look for or invent a test suite.

### Build-time data (prebuild hook)

Every `pnpm build` first runs `prebuild`: `node scripts/fetch-user-count.cjs && node scripts/fetch-app-ratings.cjs`. These fetch **live data** and write it into `src/data/`:

- `fetch-user-count.cjs` → `src/data/stats.json` (Firebase Auth user count via Identity Toolkit, project `mytemple-460913`). Needs `GOOGLE_SA_KEY` (base64 SA JSON) or `GOOGLE_APPLICATION_CREDENTIALS` (path).
- `fetch-app-ratings.cjs` → `src/data/app-ratings.json` (App Store rating via public iTunes API, app id `6747400456`; only writes if ≥5 reviews). No auth.

Both **gracefully fall back** to the existing JSON if credentials are missing or the fetch fails, so offline/dev builds work. The homepage stats and Schema.org `aggregateRating` come from these files.

### Other scripts (not npm commands)

`scripts/fetch-registrations-by-day.cjs` (registration trend, log only), `scripts/ga4-golinks.cjs` (GA4 analysis of `/go/*` traffic), `scripts/generate-og-image.mjs` (1200×630 OG image), `scripts/fix_umlauts.py` (batch `ue`→`ü`, has `--dry-run`).

### Wissen (Research Articles) Workflow

```bash
pnpm wissen:extract       # Extract metadata from PDFs in src/modules/wissen/ → scripts/wissen/papers-extracted.json
pnpm wissen:resolve       # Enrich via Crossref API → scripts/wissen/papers-resolved.json
pnpm wissen:check         # Verify article slug == filename
```

Full workflow in `WISSEN_WORKFLOW.md`. Key rule: markdown filename = slug, **no H1** in article body (the React UI renders the H1).

## Architecture

### Rendering Pattern

Astro static site with React **islands** (`client:idle` / `client:load`). Each page is an `.astro` file that imports a React module as a hydrated island. `Layout.astro` handles `<head>`, SEO meta, canonical URLs, hreflang, the AI-crawler `<link rel="alternate">` set, and Vercel analytics.

```
src/pages/index.astro          → HomePage from @modules/home
src/pages/bmi-rechner.astro    → calculator pages (standalone, inline FAQ schema)
src/pages/kalorien/[slug].astro          → 318 food pages from src/data/foods/*.json
src/pages/kalorien/kategorie/[category].astro → food category browse pages
src/pages/wissen/[slug].astro  → research articles from src/content/wissen/articles/*.md
src/pages/go/index.astro       → app-store referral router (golinks)
src/pages/us/*.astro           → US-market pages (CCPA privacy/terms, USDA-flavored landing)
```

### Path Aliases (tsconfig.json)

- `@modules/*` → `src/modules/*`
- `@styles/*` → `src/styles/*`
- `@components/*` → `src/components/*`
- `@content/*` → `src/content/*`
- `utils/*` is **not** an alias — it resolves via `baseUrl: ./src`.

### Central Config

`src/utils/config.ts` (type: `src/utils/configType.ts`) is the single source of truth for site-wide content: SEO defaults, app store links, navbar, footer, homepage sections, and legal page content.

**Performance note:** `src/pages/index.astro` strips legal content from config before passing it to the React island (~40KB → ~12KB HTML).

### Content Architecture (read before adding pages)

**There are no Astro content collections and no Zod** (no `src/content/config.ts`). Content is hand-rolled:

- **Foods** — plain JSON in `src/data/foods/*.json` (318 files; keys: `slug`, `name`, `emoji`, `category`, `seo`, `overview`, `variants`, `typical_portion_g`, `faq`, `related_foods`). Auto-discovered by `kalorien/[slug].astro` via `import.meta.glob` + `getStaticPaths`.
- **Wissen** — schema is the TS interface `ArticleMeta` in `src/content/wissen/index.ts` (the `articlesMeta` array is authoritative). Bodies are `articles/<slug>.md` (47 `.md` incl. `_template.md`), loaded as **raw strings** and rendered **client-side** in the React island `src/modules/wissen/article.tsx` via `react-markdown` + `remark-gfm` + `rehype-raw`. Article HTML is NOT pre-rendered.
- **Calculators** — standalone `.astro` page + a React module.

**Cross-link registry: `src/utils/topicClusters.ts`** wires wissen ↔ calculator ↔ food. It exports `calculators` (23 entries) plus matchers (`getCalculatorsForTags`, `getCalculatorsBySlugs`, `getWissenForCalculator`, `getCalculatorsForFood`). `wissen/[slug].astro` and `kalorien/[slug].astro` import it for "related calculators" — **a new calculator only appears in cross-links if registered here.**

**Adding content end-to-end:**
- *Food:* add JSON to `src/data/foods/` → add the slug to `src/utils/sitemaps.ts`.
- *Wissen:* add `articles/<slug>.md` (follow `_template.md`, no H1) **and** an `ArticleMeta` entry in `index.ts` → run `pnpm wissen:check`.
- *Calculator:* add `.astro` page + module → register in `topicClusters.ts` `calculators[]` → add to `src/utils/sitemaps.ts`.

### Module Pattern

Each page type has a module in `src/modules/<name>/` (37 modules). Larger ones (e.g. `home`, `kalorienbedarf`, `makros`) split sub-components into `_components/`; most are a single `index.tsx`. Shared, cross-page components live in `src/components/` (`seo/`, `navbar/`, `footer/`, `calculators/`, `logo/`, `themeSelector/`, `cookieConsent/`, `appBanner/`, etc., plus standalone `AuthorByline.tsx`, `Breadcrumbs.tsx`, `RelatedWissen.tsx`, `TrackedAppStoreLink.tsx`).

### SEO & AI-Crawler Infrastructure

- **Structured Data:** `src/components/seo/StructuredData.astro` assembles JSON-LD from generators in `src/components/seo/schemas/` (website, organization, mobileApp, softwareApp, faq, review, howto, breadcrumb, product, webpage).
- **Sitemaps:** flat — `sitemap-index.xml.ts` → `sitemap-0.xml.ts`. URLs aggregated in `src/utils/sitemaps.ts` as `allEntries` (core + calculators + wissen + foods + legal). Hand-built (no `@astrojs/sitemap`).
- **AI-crawler surface:** the site exposes a multi-channel AI/GEO layer linked from `Layout.astro` and `public/robots.txt` (whitelists 20+ AI agents): `/api/content.json` (structured app data), `/api/dataset.json` (Schema.org Dataset for the food DB), `/llms.txt` + `/llms-full.txt` (`src/pages/llms-full.txt.ts`, plain-text dumps), `/ai.txt`, `/ai-questions.json` (voice-agent FAQPage), `/comparison.json` (competitor matrix), `/rss.xml` (Wissen feed).
- **IndexNow:** via `astro-indexnow` (key in `astro.config.mjs`); **disabled on Windows** (`process.platform !== "win32"`).

### Generated file: AGENTS.md

`AGENTS.md` (git-tracked, repo root) is **auto-generated** by the `agentsSummary()` integration (`@nuasite/agent-summary` in `astro.config.mjs`) on every build — a per-route `<page_summary>` JSON dump for AI agents. **Do not hand-edit it; it is regenerated.**

### Theming

DaisyUI themes `mahlzait` (light) and `mahlzait-dark` in `tailwind.config.mjs`. Brand colors: teal `#009688` (primary/premium), green `#008635` (calories), blue `#0285FF` (protein), red `#E02E2A` (carbs), orange `#E25507` (fat); dark variants exist. Theme toggle via `src/components/themeSelector/`. Light/dark themed screenshots via `src/hooks/useThemedScreenshot.ts` and `src/components/logo/ThemeLogo.tsx`.

### Serverless API (Vercel functions, root `/api/`)

Separate from the static `src/pages/api/` endpoints, the root `/api/` dir holds Vercel functions (each exports `config = { maxDuration }`):

- `leaderboard.mjs` — referral dashboard: RevenueCat customers → Firestore cache, mints share tokens. Auth `?pw=<DASHBOARD_PASSWORD>`.
- `apple-ads-leaderboard.mjs` — Apple Search Ads spend × RevenueCat ROI dashboard (ASA JWT). Auth `?pw=<DASHBOARD_PASSWORD>`.
- `i.mjs` — read-only influencer share endpoint (`?t=<token>`, Firestore lookup).
- `track-click.mjs` — golink click tracking → Firestore `link_clicks` (IP hashed).
- `generate-plan.mjs` — AI meal/training plan via Google Gemini (`@google/genai`), SSE stream.
- `gone.ts` — HTTP 410 handler for retired URLs.

**Env vars** (set in Vercel, not committed): `GOOGLE_SA_KEY` (base64 GCP SA → Firestore/Firebase), `DASHBOARD_PASSWORD`, `RC_SECRET_API_KEY` (RevenueCat), `GEMINI_API_KEY`, `ASA_CLIENT_ID`/`ASA_TEAM_ID`/`ASA_KEY_ID`/`ASA_ORG_ID`/`ASA_PRIVATE_KEY_PEM_B64` (Apple Search Ads), `IP_HASH_SALT`. `indexing:submit` additionally uses `GCP_SA_B64`/`GCP_SA_FILE`.

### Vercel Configuration

`vercel.json` handles: rewrites (`/api/*`, `/go/*`, `/i/:token`), redirects (non-www → www, legacy WordPress/food paths → `/kalorien/*` or `/api/gone`), security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy), and caching (HTML `must-revalidate`; JS/CSS/fonts immutable 1y; images SWR 30d). The CSP allowlist covers Google Analytics/Ads, Facebook Pixel, Pinterest, Clarity, Metricool, Perplexity CDN, and Vercel.

## Conventions

- All URLs use trailing slashes (`trailingSlash: "always"`).
- Site URL is hardcoded as `https://www.mahlzait.de` in Layout and schema generators.
- Astro pages own SEO/meta/structured data; React modules own interactive UI.
- Calculator pages define FAQ schemas inline in the `.astro` frontmatter.
- Operational/marketing dirs are **not** site source — ignore them when changing code: `seo/`, `influencer-outreach/`, `.omx/`, and root docs like `SEO_*.md`, `LIVE_DEMO_*.md`, `POST_DEPLOYMENT_CHECKLIST.md`, `gsc-*`.

## Agent skills

### Issue tracker

GitHub Issues via `gh` CLI (repo `ruslanadilgereev/mahlzait-website`). PRs not treated as a request surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root (created lazily). See `docs/agents/domain.md`.
