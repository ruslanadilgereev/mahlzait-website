# SEO Testing Guide - So testest du alles!

## 🧪 1. Lokales Testing

### Dev-Server starten
```bash
cd website_new/mobile-app-landing-template
pnpm dev
```

Dann öffne: http://localhost:4321

### Neue Endpoints checken:
- **Sitemap**: http://localhost:4321/sitemap-index.xml
- **RSS Feed**: http://localhost:4321/rss.xml
- **API Content (für AI)**: http://localhost:4321/api/content.json
- **robots.txt**: http://localhost:4321/robots.txt

---

## 🔍 2. Browser Testing

### Im Browser:
1. **Rechtsklick → "Seitenquelltext anzeigen"**
2. Suche nach:
   - `<script type="application/ld+json">` - Structured Data Schemas
   - `<meta name="keywords"` - Keywords
   - `<link rel="canonical"` - Canonical URL
   - `og:` - Open Graph Tags
   - `twitter:` - Twitter Card Tags

### DevTools Console:
```javascript
// Alle Meta-Tags anzeigen
document.querySelectorAll('meta').forEach(m => console.log(m.name || m.property, ':', m.content));

// Alle JSON-LD Schemas anzeigen
document.querySelectorAll('script[type="application/ld+json"]').forEach(s => console.log(JSON.parse(s.textContent)));

// Alle Bilder ohne Alt-Tags finden (sollte leer sein!)
document.querySelectorAll('img:not([alt])').forEach(img => console.log('Missing alt:', img.src));
```

---

## 🌐 3. Online SEO-Testing Tools

### Must-Have Tests:

#### A) Google Rich Results Test
**URL**: https://search.google.com/test/rich-results

1. Gib deine URL ein (oder füge HTML ein)
2. Klicke "Test URL"
3. **Sollte zeigen**: ✅ FAQPage, MobileApplication, Organization, etc.

#### B) Schema.org Validator
**URL**: https://validator.schema.org/

1. Füge deine URL oder HTML ein
2. Validiere alle Schemas
3. Prüfe auf Fehler/Warnungen

#### C) Google PageSpeed Insights
**URL**: https://pagespeed.web.dev/

1. URL eingeben
2. **Ziel**: 90+ Score für SEO
3. Prüfe Core Web Vitals

#### D) Meta Tags Checker
**URL**: https://metatags.io/

1. URL eingeben
2. Sieh Vorschau für Google, Facebook, Twitter
3. Prüfe alle Social Media Tags

#### E) XML Sitemap Validator
**URL**: https://www.xml-sitemaps.com/validate-xml-sitemap.html

1. Sitemap URL eingeben
2. Validiere Format
3. Prüfe alle URLs

---

## 🤖 4. AI/LLM Testing

### API Content Test:
```bash
curl http://localhost:4321/api/content.json | jq
```

**Oder im Browser**: Öffne `/api/content.json` und prüfe:
- ✅ Strukturierte Daten lesbar
- ✅ Features, FAQ, Keywords vorhanden
- ✅ JSON valide

### RSS Feed Test:
```bash
curl http://localhost:4321/rss.xml
```

**Oder**: https://validator.w3.org/feed/
- Füge RSS-URL ein
- Validiere Feed-Format

---

## 📊 5. Lighthouse Audit (Chrome DevTools)

1. **Chrome DevTools öffnen** (F12)
2. **Lighthouse Tab**
3. **Categories auswählen**: SEO, Performance, Accessibility
4. **Generate report**

### Erwartete Scores:
- **SEO**: 95-100 ✅
- **Performance**: 90+ ✅
- **Accessibility**: 90+ ✅
- **Best Practices**: 95+ ✅

---

## 🔥 6. Live-Testing nach Deployment

### Google Search Console:
1. Gehe zu: https://search.google.com/search-console
2. Property hinzufügen: `https://www.mahlzait.de`
3. Verifizieren (DNS/HTML-Tag)
4. **Sitemap einreichen**: `https://www.mahlzait.de/sitemap-index.xml`
5. **URL-Prüfung**: Teste einzelne Seiten
6. **Indexierung anfordern**

### Bing Webmaster Tools:
1. Gehe zu: https://www.bing.com/webmasters
2. Website hinzufügen
3. Sitemap einreichen
4. URL-Prüfung

---

## ✅ Quick Check Checklist

### Strukturierte Daten:
- [ ] WebSite Schema vorhanden
- [ ] MobileApplication Schema mit Preisen
- [ ] FAQPage Schema für alle FAQ-Items
- [ ] Review Schemas für Testimonials
- [ ] Organization Schema mit Logo
- [ ] HowTo Schema für Anleitung
- [ ] BreadcrumbList auf allen Seiten

### Meta-Tags:
- [ ] Title unique auf jeder Seite
- [ ] Description unique (max 155 Zeichen)
- [ ] Keywords Meta-Tag vorhanden
- [ ] Canonical URL auf allen Seiten
- [ ] hreflang Tags vorhanden
- [ ] Open Graph vollständig
- [ ] Twitter Card vollständig
- [ ] Robots Meta: index, follow

### Images:
- [ ] Alle Bilder haben alt-Tags
- [ ] Alt-Tags beschreibend und keyword-optimiert
- [ ] Lazy Loading aktiviert
- [ ] WebP-Format verwendet

### Technical:
- [ ] robots.txt erreichbar
- [ ] Sitemap erreichbar und valide
- [ ] RSS Feed erreichbar und valide
- [ ] API Content JSON erreichbar
- [ ] 404-Seite existiert
- [ ] HTTPS aktiv

### Performance:
- [ ] Fonts preloaded
- [ ] Wichtige Seiten prefetched
- [ ] DNS prefetch für externe Resources
- [ ] Lazy Loading für Bilder
- [ ] Gzip/Brotli Kompression aktiv

---

## 🐛 Debugging-Tipps

### Problem: Schema nicht erkannt
```javascript
// Im Browser: Schema-Struktur prüfen
JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
```

### Problem: Sitemap nicht gefunden
- Prüfe: `public/robots.txt` enthält Sitemap-URL
- Prüfe: `astro.config.mjs` hat `site: "https://www.mahlzait.de"`

### Problem: Meta-Tags fehlen
- Prüfe: `Layout.astro` enthält alle Tags
- Prüfe: SEO-Props werden übergeben

### Problem: Bilder ohne Alt-Tags
```javascript
// Finde alle Bilder ohne Alt
[...document.images].filter(img => !img.alt).forEach(img => console.log(img.src))
```

---

## 📱 Mobile Testing

### Chrome DevTools Device Emulation:
1. DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Teste verschiedene Geräte
3. Prüfe responsive Design
4. Lighthouse Mobile Audit

### Real Device Testing:
- iOS Safari
- Android Chrome
- Prüfe Touch-Targets
- Prüfe Schriftgrößen

---

## 🎯 KPIs nach 30 Tagen

Track diese Metriken in Google Search Console:

- **Impressionen**: Wie oft Website in Suchergebnissen erscheint
- **Klicks**: Tatsächliche Klicks aus Suche
- **CTR**: Click-Through-Rate (Ziel: >3%)
- **Position**: Durchschnittliche Position (Ziel: Top 3)
- **Indexierte Seiten**: Alle Seiten sollten indexiert sein

### Google Analytics:
- Organischer Traffic
- Bounce Rate (Ziel: <50%)
- Session Duration (Ziel: >2min)
- Pages per Session (Ziel: >2)

---

## 🚀 Production Checklist

Vor dem Live-Gang:

- [ ] `pnpm build` läuft fehlerfrei durch
- [ ] Alle Seiten rendern korrekt
- [ ] Sitemap wird generiert
- [ ] RSS Feed funktioniert
- [ ] API Content JSON valide
- [ ] Meta-Tags auf allen Seiten
- [ ] Structured Data validiert
- [ ] Lighthouse Score 90+
- [ ] Mobile responsive
- [ ] Domain auf HTTPS
- [ ] robots.txt korrekt konfiguriert

Nach dem Deployment:
- [ ] Google Search Console eingerichtet
- [ ] Sitemap eingereicht
- [ ] Bing Webmaster eingerichtet
- [ ] Analytics aktiv
- [ ] Monitoring aktiv

---

**Pro-Tipp**: Erstelle einen Kalender-Reminder, um nach 7, 14 und 30 Tagen die Rankings zu checken! 📊

