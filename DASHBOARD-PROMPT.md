# Claude Code Prompt — Mahlzait Cockpit Dashboard

## Aufgabe
Baue ein vollständiges Dashboard unter `public/cockpit.html` mit API-Backend unter `/api/` (Vercel Serverless Functions als `.mjs`, KEINE externen Dependencies, nur `node:crypto` und `node:zlib`).

## Aktueller Stand
- `public/cockpit.html` existiert (einfaches Dashboard, nur Apple Subscriber-Daten)
- `api/dashboard.mjs` existiert (Apple ASC API mit JWT via node:crypto)
- `vercel.json` hat rewrites für `/api/*`
- Astro bleibt STATIC (kein Adapter, kein hybrid/server mode)
- Repo ist PUBLIC → keine Secrets im Code, alles über Vercel Env Vars

## Dashboard Sektionen

### 0. Full Funnel (Kette) 🔗
Die wichtigste Sektion — zeigt die komplette User Journey als horizontale Pipeline:

```
Impression → Tap → Install → Paywall Shown → Trial Started → Converted to Paid → Month 2+ Retained → Cancelled
```

Für jeden Step:
- Absolute Zahl
- Conversion Rate zum nächsten Step (z.B. "33% Tap Rate")
- Visuell als Funnel (Balken werden schmaler)

Datenquellen pro Step:
- **Impressions + Taps**: Apple Ads API (Campaign Reports)
- **Installs**: Apple Ads API (conversions) + ASC App Analytics (wenn verfügbar)
- **Trial Started**: ASC Subscription Reports (Active Free Trial count)
- **Converted to Paid**: ASC Subscription Reports (neue Standard Price Subs)
- **Retained (Month 2+)**: ASC Subscriber Detail Report (Paid Duration > 1 month)
- **Cancelled/Churned**: ASC Subscription Events (Cancel, Refund events)

Zeige auch:
- CPA (Cost per Install aus Apple Ads)
- Cost per Trial
- Cost per Paid User
- LTV vs CPA Ratio
- Durchschnittliche Subscription-Dauer (Monate bis Cancel)

### 1. MRR & Revenue 🎯
- MRR gesamt (Apple + Google kombiniert), brutto und netto (nach 15% Store-Fee)
- Wöchentlicher MRR-Trend als Bar-Chart (letzte 4-8 Wochen)
- Preise: Monthly €4,99, Yearly €29,99 (→ €2,50/Monat)

### 2. Subscribers 📱
- Total Paid (Apple + Google), Total Trial, Total Aktiv
- Monthly vs Yearly Split mit visueller Darstellung
- Net Growth pro Woche (new - churn)
- Apple: aus ASC Subscription Reports API (bereits in dashboard.mjs)
- Google: aus Firestore `subscribers` Collection via REST API

### 3. Apple Ads 📣
- Campaign ID: `2143557206`, Budget: €400 total, €25/day
- Impressions, Taps, Installs, CPA
- Apple Search Ads API v5

### 4. App Usage (GA4) 📊
- DAU / WAU / MAU
- Feature-Split: AI Chat, Barcode, Manual, Food Search
- Session-Dauer
- GA4 Property: `490479548`

### 5. SEO Traffic (GSC) 🔍
- Klicks + Impressions letzte 28 Tage
- CTR + Avg Position
- Top 10 Pages
- Site: `sc-domain:mahlzait.de`

## API Architektur

Separate Vercel Functions pro Datenquelle (alle `.mjs`, zero deps):

| File | Datenquelle |
|------|-------------|
| `api/dashboard.mjs` | Apple ASC Subscriptions (EXISTIERT, erweitern) |
| `api/dash-google.mjs` | Google Play Subs via Firestore REST |
| `api/dash-ads.mjs` | Apple Search Ads Campaign Reports |
| `api/dash-ga4.mjs` | GA4 Analytics Data |
| `api/dash-gsc.mjs` | Google Search Console |

Jede Function:
- Prüft `?pw=` gegen `process.env.DASHBOARD_PASSWORD`
- Nutzt NUR `node:crypto` für JWT-Signing
- JSON Response mit `Cache-Control: no-cache`
- try-catch mit aussagekräftigen Fehlermeldungen

## Environment Variables

### Bereits vorhanden:
- `DASHBOARD_PASSWORD`
- `APPLE_ISSUER_ID` = `a2de8f1c-8dce-45d2-98d2-d3d73dc638f8`
- `APPLE_KEY_ID` = `536N39RKVZ`
- `APPLE_PRIVATE_KEY_B64` (base64 .p8 EC key)
- `APPLE_VENDOR` = `93509467`

### Neu nötig:
- `GCP_SA_B64` — base64-encoded Google SA JSON (mahlzait-mj-readonly@mytemple-460913.iam.gserviceaccount.com, hat GA4 Analyst + GSC Full User + Firestore Cloud Datastore Viewer)
- `APPLE_ADS_CLIENT_ID` = `SEARCHADS.ddb1bc0f-0424-4148-947e-ebd922146cf8`
- `APPLE_ADS_KEY_ID` = `b8a3ba0a-e6b5-4b44-81ec-5d915404e9b1`
- `APPLE_ADS_PRIVATE_KEY_B64` (base64 Apple Ads EC key)
- `APPLE_ADS_ORG_ID` = `19224590`

## API Auth Details

### Apple ASC Analytics Reports API (für Impressions, Downloads, Revenue):
Die App Store Analytics Daten (Impressions, Product Page Views, Downloads, Revenue) kommen über die **Analytics Reports API**, NICHT über Sales Reports.

**Report Request ID:** `5305be75-8413-4f20-92de-819ca6dcc9c8` (bereits erstellt, ONGOING)

**Workflow:**
1. List reports: `GET /v1/analyticsReportRequests/{requestId}/reports`
2. Für jeden Report die Instances holen: `GET /v1/analyticsReports/{reportId}/instances`
3. Für jede Instance die Segments (Download-URLs): `GET /v1/analyticsReportInstances/{instanceId}/segments`
4. Download URL aus `attributes.url` → gibt TSV/gzip zurück

**Relevante Report IDs (Prefix + Request ID):**
- `r14-{RID}`: App Store Discovery & Engagement Standard → **Impressions, Product Page Views**
- `r15-{RID}`: App Store Discovery & Engagement Detailed → mit Dimensions (Source, Territory)
- `r3-{RID}`: App Downloads Standard → **Downloads**
- `r4-{RID}`: App Downloads Detailed → mit Dimensions
- `r12-{RID}`: App Store Purchases Standard → **Revenue, IAP**
- `r13-{RID}`: App Store Purchases Detailed
- `r6-{RID}`: Installation & Deletion Standard → **Installs/Uninstalls**
- `r8-{RID}`: App Sessions Standard → **Sessions, Active Devices**
- `r194-{RID}`: Platform App Installs

**WICHTIG:** `Accept: application/a-gzip, application/json` Header bei Sales Reports! Ohne den kommt HTTP 406.

**WICHTIG:** Report Instances brauchen 24-48h nach Request-Erstellung. Prüfe ob instances vorhanden sind.

### Apple ASC Subscription Event Reports (für Funnel):
- `GET /v1/salesReports?filter[reportType]=SUBSCRIPTION_EVENT&filter[version]=1_3`
- Events: Start Trial, Convert Trial, Cancel, Refund, Renew, Billing Retry
- Felder: Event Date, Event, Subscription Name, Country, Customer Price, Developer Proceeds
- Für Churn-Rate: Events "Cancel" und "Refund" zählen
- Für Conversion: "Paid Subscription from Introductory Offer" Events

### Apple ASC Subscriber Detail Reports (für Retention):
- `GET /v1/salesReports?filter[reportType]=SUBSCRIBER&filter[reportSubType]=DETAILED&filter[version]=1_3`
- Felder: Active/Cancelled Standard Price Subscribers, Days Before/Since Cancelling
- Für avg Subscription-Dauer: "Days Before Cancelling" Feld

### Apple ASC JWT (bereits implementiert):
- ES256, kid=APPLE_KEY_ID, iss=APPLE_ISSUER_ID, aud=appstoreconnect-v1
- Subscription Reports: `GET /v1/salesReports?filter[reportType]=SUBSCRIPTION&filter[version]=1_4`
- Response: gzip TSV

### Google SA JWT → Access Token:
```
1. Parse SA JSON aus GCP_SA_B64
2. JWT Header: { alg: "RS256", typ: "JWT" }
3. JWT Payload: { iss: client_email, scope: "<scope>", aud: "https://oauth2.googleapis.com/token", iat, exp: iat+3600 }
4. Sign mit private_key (RSA SHA-256, node:crypto createSign)
5. POST https://oauth2.googleapis.com/token
   body: grant_type=urn:ietf:params:oauth:grant_type:jwt-bearer&assertion=<signed_jwt>
6. Response: { access_token: "..." }
```

### GA4 Data API:
- Scope: `https://www.googleapis.com/auth/analytics.readonly`
- `POST https://analyticsdata.googleapis.com/v1beta/properties/490479548:runReport`
- DAU body: `{ dateRanges: [{startDate: "28daysAgo", endDate: "today"}], metrics: [{name: "activeUsers"}, {name: "sessions"}], dimensions: [{name: "date"}] }`
- Features body: `{ dimensions: [{name: "eventName"}], metrics: [{name: "eventCount"}], dimensionFilter: ... }`

### GSC API:
- Scope: `https://www.googleapis.com/auth/webmasters.readonly`
- `POST https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Amahlzait.de/searchAnalytics/query`
- Body: `{ startDate, endDate, dimensions: ["page"], rowLimit: 10 }`

### Firestore REST (Google Play Subs):
- Scope: `https://www.googleapis.com/auth/datastore`
- `GET https://firestore.googleapis.com/v1/projects/mytemple-460913/databases/(default)/documents/subscribers?pageSize=500`
- Filter active Google subs (source contains "google" or platform == "android"), status not expired
- Count monthly vs yearly via productId (`mahlzait.pro.monthly` / `mahlzait.pro.yearly`)

### Apple Search Ads API:
- ES256 client_assertion JWT for OAuth2
- `POST https://appleid.apple.com/auth/oauth2/token` (client_credentials grant)
- Reports: `POST https://api.searchads.apple.com/api/v5/reports/campaigns`
- Header: `X-AP-Context: orgId=19224590`
- Body: `{ startTime, endTime, granularity: "DAILY", selector: { conditions: [{field: "campaignId", operator: "EQUALS", values: ["2143557206"]}] } }`

## Frontend (public/cockpit.html)

- Standalone HTML, kein Framework, kein Build
- Dark theme (#0a0a0a bg, #1a1a1a cards)
- Mobile-responsive
- Login → localStorage
- Alle 5 APIs parallel fetchen
- Loading-State pro Sektion (Skeleton)
- Fehler pro Sektion (nicht alles crashen)
- Bar-Charts mit CSS (keine Library)
- Refresh-Button
- Farben: Emerald=Paid/Revenue, Blue=Trials, Yellow=Ads, Purple=Usage

## Regeln
- KEINE npm deps in /api/ Functions (nur node: built-ins)
- KEIN TypeScript in /api/ (nur .mjs)
- astro.config.mjs NICHT ändern
- Repo ist PUBLIC: keine Secrets im Code
- cockpit.html ist aus Sitemap ausgeschlossen
- Keine Comments im Code
