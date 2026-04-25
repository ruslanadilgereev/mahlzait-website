import type { TemplateConfig } from "./configType";
import stats from "../data/stats.json";

const templateConfig: TemplateConfig = {
  name: "Mahlzait",
  seo: {
    title: "Mahlzait – Kalorienzähler & Food-Tracker mit KI",
    description: "Kalorienzähler mit KI zum Abnehmen: Mahlzeiten per Foto, Barcode oder Text tracken. Ernährungstagebuch, Makro-Tracking, Gewicht verfolgen, Rezepte importieren. Jetzt kostenlos starten!",
  },
  // Draws grid behind main container
  backgroundGrid: false,
  logo: "/logo.png",
  theme: "mahlzait",
  // Forces theme to be chosen above, no matter what user prefers
  forceTheme: false,
  // Shows switch to toggle between dark and light modes
  showThemeSwitch: true,
  appStoreLink: "https://apps.apple.com/app/apple-store/id6747400456?pt=127913951&ct=homepage&mt=8",
  // Google Play: alle UTMs MÜSSEN URL-encoded im einzelnen `referrer=`-
  // Parameter stehen. Direkte Query-Params (?utm_source=…) werden vom
  // Play Store ignoriert und kommen NIE in der App an.
  // Doku: https://developer.android.com/google/play/installreferrer
  googlePlayLink:
    "https://play.google.com/store/apps/details?id=com.promptit.mytemple&referrer=utm_source%3Dmahlzait-website%26utm_medium%3Dwebsite%26utm_campaign%3Dhomepage",
  footer: {
    legalLinks: {
      termsAndConditions: true,
      cookiesPolicy: true,
      privacyPolicy: true,
    },
    socials: {
      instagram: "https://www.instagram.com/mahlzait/",
      facebook: "https://www.facebook.com/mahlzait",
      twitter: "https://x.com/mahlzait",
      pinterest: "https://www.pinterest.com/mahlzait/",
      tiktok: "https://www.tiktok.com/@mahlzait",
    },
    links: [
      { href: "/#features", title: "Funktionen" },
      { href: "/#live-demo", title: "Live Demo" },
      { href: "/#how-it-works", title: "So funktioniert's" },
      { href: "/#pricing", title: "Preise" },
    ],
    // SEO-Links für Calculator-Seiten
    calculatorLinks: [
      { href: "/kalorienbedarf-berechnen", title: "Kalorienbedarf berechnen" },
      { href: "/kaloriendefizit-berechnen", title: "Kaloriendefizit berechnen" },
      { href: "/makros-berechnen", title: "Makros berechnen" },
      { href: "/essensplan-erstellen", title: "Essensplan erstellen" },
      { href: "/trainingsplan-erstellen", title: "Trainingsplan erstellen" },
    ],
    // SEO-Links für App-Landingpages und Info
    appLinks: [
      { href: "/#faq", title: "FAQ" },
      { href: "/team", title: "Team" },
      { href: "/ueber-uns", title: "Über uns" },
      { href: "/redaktionelle-standards", title: "Redaktionelle Standards" },
      { href: "/vergleich", title: "App-Vergleich" },
      { href: "/wissen", title: "Wissen" },
      { href: "/kalorien", title: "Kalorientabelle" },
    ],
  },
  topNavbar: {
    cta: "App laden",
    disableWidthAnimation: false,
    hideAppStore: false,
    hideGooglePlay: false,
    links: [
      { href: "/#live-demo", title: "Demo" },
      { href: "/#features", title: "Features" },
      { href: "/#how-it-works", title: "Anleitung" },
      { href: "/#pricing", title: "Preise" },
      { href: "/essensplan-erstellen", title: "Essensplan" },
      { href: "/trainingsplan-erstellen", title: "Trainingsplan" },
      { href: "/rechner", title: "Rechner" },
      { href: "/wissen", title: "Wissen" },
    ],
  },
  appBanner: {
    id: "app-banner",
    title: "Jetzt Mahlzait laden!",
    subtitle:
      "Schnell, leicht und auch offline nutzbar – dein Kalorienzähler mit KI. Tracke Mahlzeiten in Sekunden und erreiche deine Ziele.",
    screenshots: [
      "/screenshots/untenmitte.webp",
      "/screenshots/untenlinks.webp",
      "/screenshots/untenrechts.webp",
    ],
  },
  home: {
    seo: {
      title: "Mahlzait – Kalorienzähler mit KI | Tracke Mahlzeiten in Sekunden",
      description: "Mahlzait ist ein Kalorienzähler mit KI-Erkennung für iOS und Android. Mahlzeiten per Foto, Barcode oder Text tracken. Über 10 Mio Lebensmittel, Ernährungstagebuch und Gewichtsverlauf. Entwickelt in Berlin.",
    },
    testimonials: {
      id: "testimonials",
      title: "Erfahrungsberichte",
      subtitle: "Ergebnisse von Mahlzait-Nutzern (Selbstberichte, keine Garantie für individuelle Ergebnisse)",
      cards: [
        {
          name: "Mojo89111 – App Store",
          comment:
            "Ich habe sehr viele Apps ausprobiert, aber diese ist einfach mit Abstand einer der besten die ich je getestet habe. Keine Werbung, KI erkennt einfach das Essen vom Foto und berechnet die Kalorien. Ich benutze die App seit 4 Wochen und habe schon fast 6 kg abgenommen und das ohne zu hungern.",
        },
        {
          name: "Dendrit99 – App Store",
          comment:
            "Früher habe ich immer ChatGPT genutzt um zu fragen wie viel Kalorien etwas hat, Mahlzait kann das genau so gut und ich habe sofort einen viel besseren Überblick! Seit 5 Wochen nutze ich bisher und 5 kg abgenommen.",
        },
        {
          name: "olaf_scholz_official – App Store",
          comment:
            "Klassischer Fall von einem \"hidden champ\". Keine große Firma dahinter aber wesentlich performanter und preiswerter als die Konkurrenz. Hier wird Datenschutz wertgeschätzt.",
        },
        {
          name: "Wladmax97 – App Store",
          comment:
            "Nicht nur ein sehr genauer Kalorienzähler, sondern ein persönlicher Ernährungscoach! Auswertung, Information, Gesundheitstipps und Rezeptvorschläge!",
        },
        {
          name: "solomraza – App Store",
          comment:
            "Einfach zu benutzen, ziemlich genaue KI zum Tracken. Hab paar Sachen getestet weil ich skeptisch war und er hat maximal 50-60 kcal abgewichen bei so Sachen wie Butterbrot und so.",
        },
        {
          name: "wes-pe – App Store",
          comment:
            "Nach 5 Tagen täglicher Nutzung bin ich sehr zufrieden. Ich vergleiche die Daten mit einer anderen App, und es gibt kaum Abweichungen. Top!",
        },
      ],
    },
    partners: {
      title: "Mahlzait in Zahlen",
      subtitle: `Stand: ${new Date(stats.updatedAt).toLocaleDateString("de-DE", { month: "long", year: "numeric" })} · Basierend auf anonymisierten Nutzungsdaten`,
      stats: [
        {
          icon: "🍽️",
          number: stats.mealsLoggedDisplay,
          label: "Geloggte Mahlzeiten",
          tooltip: "Kumuliert seit App-Launch",
        },
        {
          icon: "🤖",
          number: stats.aiPhotosDisplay,
          label: "KI-Foto-Logs",
          tooltip: "Mahlzeiten die per KI-Foto oder KI-Chat geloggt wurden",
        },
        {
          icon: "📱",
          number: stats.barcodeScansDisplay,
          label: "Barcode-Scans",
          tooltip: "Lebensmittel per Barcode gescannt und geloggt",
        },
        {
          icon: "👥",
          number: stats.displayCount,
          label: "Registrierte Nutzer",
          tooltip: "Kumuliert seit App-Launch",
        },
      ],
    },
    howItWorks: {
      id: "how-it-works",
      title: "So funktioniert's",
      subtitle:
        "Starte in unter 60 Sekunden – 3 einfache Schritte zum personalisierten Kalorienziel",
      steps: [
        {
          title: "Persönliche Daten eingeben",
          subtitle:
            "Gib dein Alter, Geschlecht, Größe und aktuelles Gewicht ein. Mahlzait benötigt diese Infos, um deinen individuellen Kalorienbedarf zu berechnen – so werden deine Ziele realistisch und erreichbar.",
          image: "/screenshots/welcome1.webp",
        },
        {
          title: "Gewichtsziel festlegen",
          subtitle:
            "Definiere dein Zielgewicht und wähle, wie schnell du es erreichen möchtest. Abnehmen, zunehmen oder halten – du entscheidest das Tempo (z.B. 0,5 kg pro Woche) für nachhaltigen Erfolg.",
          image: "/screenshots/welcome2.webp",
        },
        {
          title: "Aktivitätslevel auswählen",
          subtitle:
            "Wähle dein tägliches Aktivitätslevel: von sesshaft bis sehr aktiv. Damit passt Mahlzait deine Kalorienziele automatisch an deinen Lebensstil an – fertig in unter 60 Sekunden!",
          image: "/screenshots/welcome3.webp",
        },
      ],
    },
    features: {
      id: "features",
      title: "Alle Funktionen auf einen Blick",
      subtitle:
        "Kalorienzähler mit 9 Kernfunktionen: KI-Foto-Erkennung, Barcode-Scanner, Rezept-Import, Health-Sync und mehr. Stand: Februar 2026.",
      cards: [
        {
          title: "KI-Logging",
          subtitle:
            "Mahlzeiten per Foto oder Texteingabe loggen. Die KI erkennt Lebensmittel aus der Open Food Facts Datenbank (10 Mio+ Einträge). Bereits über 14.500 Mahlzeiten wurden per KI-Foto geloggt.",
          icon: "/3D/bulb-front-color.webp",
          screenshot: "/screenshots/chat.webp",
        },
        {
          title: "KI-Vorschläge",
          subtitle:
            "KI-basierte Mahlzeitvorschläge, angepasst an dein Kalorienziel und bisherige Einträge. Berücksichtigt verbleibende Makros (Protein, Kohlenhydrate, Fett) für den Tag.",
          icon: "/3D/bulb-front-color.webp",
          screenshot: "/screenshots/aivorschlag.webp",
        },
        {
          title: "Rezepte & YouTube",
          subtitle:
            "Erstelle Rezepte aus YouTube-Videos, manuell oder per Suche – speichere sie und logge wiederkehrende Mahlzeiten in Sekunden",
          icon: "/3D/video-camera-front-color.webp",
          screenshot: "/screenshots/rezept.webp",
        },
        {
          title: "Barcode-Scan",
          subtitle:
            "Scanne Produkt-Barcodes für automatisches Kalorien-Tracking. Schneller Barcode-Scanner ohne Tipparbeit – ideal für den Supermarkt-Einkauf",
          icon: "/3D/camera-front-color.webp",
          screenshot: "/screenshots/barcode.webp",
        },
        {
          title: "Insights & Trends",
          subtitle:
            "Visualisiere deine Ernährung mit Diagrammen für Kalorien, Makros und Trends – behalte den Überblick über deine Fortschritte",
          icon: "/3D/chart-front-color.webp",
          screenshot: "/screenshots/insights.webp",
        },
        {
          title: "Health-Integration",
          subtitle:
            "Verbinde Mahlzait mit Apple Health oder Google Fit und synchronisiere Schritte, Gewicht und weitere Gesundheitsdaten",
          icon: "/3D/heart-front-color.webp",
          screenshot: "/screenshots/health.webp",
        },
        {
          title: "Gewicht & Kalender",
          subtitle:
            "Gewichtstracking mit Fortschritts-Diagramm. Kalenderansicht zeigt alle getrackten Mahlzeiten und Kalorien – perfekt für Diät-Kontrolle",
          icon: "/3D/calender-front-color.webp",
          screenshot: "/screenshots/kalendar.webp",
        },
        {
          title: "Lebensmittel-Suche",
          subtitle:
            "Durchsuche die umfangreiche Food-Datenbank mit tausenden Lebensmitteln. Finde Nährwerte und Kalorien in Sekunden – perfekt für schnelles Meal-Tracking",
          icon: "/3D/zoom-front-color.webp",
          screenshot: "/screenshots/suche.webp",
        },
        {
          title: "Manuelle Eingabe",
          subtitle:
            "Erstelle eigene Einträge mit individuellen Portionsgrößen und Nährwerten – flexibel und präzise für jede Mahlzeit",
          icon: "/3D/pencil-front-color.webp",
          screenshot: "/screenshots/manuell.webp",
        },
      ],
    },
    faq: {
      id: "faq",
      title: "Häufig gestellte Fragen",
      qa: [
        {
          question: "Was ist Mahlzait?",
          answer:
            "Mahlzait ist ein Kalorienzähler mit KI für iOS und Android. Die App erkennt Mahlzeiten per Foto in ~2 Sekunden, bietet Barcode-Scanner, 10 Mio+ Lebensmittel-Datenbank, Makro-Tracking, Gewichtsverlauf und Apple Health / Google Fit Synchronisation. Entwickelt in Berlin, DSGVO-konform.",
        },
        {
          question: "Ist Mahlzait kostenlos? Was kostet die Kalorienzähler App?",
          answer:
            "Mahlzait ist kostenlos nutzbar mit Lebensmittelsuche, Barcode-Scanner, manueller Eingabe und Rezepterstellung. Mahlzait Pro kostet 4,99 €/Monat oder 29,99 €/Jahr (2,50 €/Monat) und bietet unbegrenzte KI-Features wie Foto-Logging und Mahlzeit-Vorschläge.",
        },
        {
          question: "Wie funktioniert das KI-Logging? Kann die KI deutsche Lebensmittel erkennen?",
          answer:
            "Das KI-Logging nutzt KI zur Bilderkennung und eine Datenbank mit 10 Mio+ Einträgen. Nutzer fotografieren oder beschreiben Mahlzeiten per Text. Über 14.500 Mahlzeiten wurden bereits per KI-Foto geloggt. Portionsgrößen sind manuell anpassbar.",
        },
        {
          question: "Wie genau ist der Barcode-Scanner beim Kalorienzählen?",
          answer:
            "Der Barcode-Scanner liest EAN/UPC-Codes und gleicht sie mit der Open Food Facts Datenbank ab (10 Mio+ Produkte, Quelle: openfoodfacts.org). Kalorien und Makronährstoffe (Protein, Kohlenhydrate, Fett) werden automatisch übernommen. Nicht enthaltene Produkte können manuell ergänzt werden.",
        },
        {
          question: "Kann ich eigene Rezepte erstellen und speichern?",
          answer:
            "Ja. Rezepte lassen sich manuell erstellen, aus YouTube-Videos importieren oder per Suche finden. Gespeicherte Rezepte können mit einem Klick geloggt und per Link geteilt werden. Die Nährwerte werden automatisch pro Portion berechnet.",
        },
        {
          question: "Unterstützt Mahlzait Apple Health und Google Fit?",
          answer:
            "Ja. Mahlzait synchronisiert bidirektional mit Apple Health (iOS) und Google Health Connect (Android). Schritte, Gewicht und verbrannte Kalorien werden automatisch übernommen und fließen in die tägliche Kalorienberechnung ein.",
        },
        {
          question: "Wie viele Kalorien sollte ich zum Abnehmen essen?",
          answer:
            "Der individuelle Kalorienbedarf wird nach der Mifflin-St Jeor-Formel berechnet (validiert durch Frankenfield et al., 2005). Die DGE empfiehlt ein Defizit von 300–500 kcal/Tag für gesundes Abnehmen – das entspricht ca. 0,5 kg Gewichtsverlust pro Woche.",
        },
        {
          question: "Wie unterscheidet sich Mahlzait von MyFitnessPal, YAZIO und Lifesum?",
          answer:
            "Mahlzait bietet KI-Foto-Logging, KI-Vorschläge und YouTube-Rezept-Import — Features, die bei Mitbewerbern oft deutlich teurer sind. Die Basis-Version ist werbefrei und enthält Barcode-Scanner, Lebensmittelsuche und manuelle Eingabe. Pro kostet 29,99 €/Jahr vs. 49,99 € (MyFitnessPal) bzw. 44,99 € (YAZIO/Lifesum).",
        },
        {
          question: "Gibt es Homescreen-Widgets für schnellen Zugriff?",
          answer:
            "Ja. Mahlzait bietet iOS- und Android-Widgets: ein Übersichts-Widget (Kalorien, Makros, Fortschritt) und Quick-Launch-Widgets für Suche, Barcode-Scanner, manuelle Eingabe und KI-Logging – direkt vom Homescreen ohne App-Öffnung.",
        },
        {
          question: "Funktioniert Mahlzait offline?",
          answer:
            "Ja, Mahlzait hat einen Offline-Modus. Bereits geloggte Mahlzeiten und gespeicherte Rezepte sind offline verfügbar. KI-Features wie Foto-Erkennung benötigen eine Internetverbindung.",
        },
        {
          question: "Wie genau ist die KI-Foto-Erkennung?",
          answer:
            "Die KI-Foto-Erkennung von Mahlzait hat eine Erkennungsrate von ca. 90% bei gut beleuchteten Fotos. Getestet mit 5.000 Foto-Logs. Portionsgrößen können manuell angepasst werden.",
        },
        {
          question: "Wie funktioniert die KI-Erkennung technisch?",
          answer:
            "Mahlzait nutzt Googles Gemini-Modell zur Bilderkennung. Hochgeladene Fotos werden verschlüsselt auf EU-Servern analysiert und nach der Erkennung nicht gespeichert. Die erkannten Lebensmittel werden mit der Open Food Facts Datenbank abgeglichen. Deine Fotos werden niemals für Trainingszwecke verwendet.",
        },
      ],
    },
    header: {
      headline: "Mahlzait – Kalorienzähler mit KI",
      subtitle:
        "Kalorienzähler mit KI für iOS und Android. Mahlzeiten per Foto, Barcode oder Text tracken. 10 Mio+ Lebensmittel, KI-Erkennung in ~2 Sekunden, Makro-Tracking und Gewichtsverlauf. Entwickelt in Berlin, DSGVO-konform.",
      screenshots: [
        "/screenshots/1.webp",
        "/screenshots/2.webp",
        "/screenshots/3.webp",
      ],
      rewards: ["4,8 Sterne \n im App Store", "Jetzt mit \n AI-Chat"],
      usersDescription: `${stats.displayCount} Nutzer:innen tracken bereits mit Mahlzait`,
      headlineMark: [0, 1],
    },
    pricing: {
      id: "pricing",
      title: "Preise",
      subtitle: "Kostenloser Kalorienzähler – Pro-Version für unlimited AI-Features (Stand: Februar 2026)",
      actionText: "App herunterladen",
      plans: [
        {
          title: "Kostenlos",
          price: "0 €",
          rows: [
            "Mahlzeiten loggen (Suche, Barcode, manuell)",
            "Rezepte erstellen & teilen (manuell)",
            "Kalorien & Makros tracken",
            "Gewichtsverlauf & Kalender",
            "Health-Integration",
            "Je 5x AI-Features testen",
          ],
        },
        {
          title: "Mahlzait Pro Jahr",
          price: "29,99 €/Jahr",
          featured: true,
          rows: [
            "Unlimited AI Meal Logging (Foto/Text)",
            "Unlimited AI-Vorschläge (Kühlschrank etc.)",
            "Unlimited Rezepte aus YouTube-Videos",
            "Spare 50% (nur 2,50 €/Monat)",
          ],
        },
        {
          title: "Mahlzait Pro Monat",
          price: "4,99 €/Monat",
          rows: [
            "Unlimited AI Meal Logging (Foto/Text)",
            "Unlimited AI-Vorschläge (Kühlschrank etc.)",
            "Unlimited Rezepte aus YouTube-Videos",
            "Monatlich kündbar",
          ],
        },
      ],
    },
  },
  privacyPolicy: {
    seo: {
      title: "Privacy Policy - Mahlzait Calorie Counter App",
      description: "Learn how Mahlzait protects your data: GDPR compliant, data stored in Germany, no third-party sharing. Transparent privacy policy for our calorie counter app.",
    },
    content: `# Datenschutzerklärung

**Stand:** Januar 2026

Diese Datenschutzerklärung gilt für:
- die Website "mahlzait.de" inkl. aller Unterseiten,
- die mobile App "Mahlzait" (iOS/Android),
- die dazugehörigen Backend‑Dienste (z.B. Login, Speicherung, Synchronisation, KI‑Funktionen).

## 1. Verantwortlicher

**Mahlzait (Einzelunternehmen)**  
Inhaber: Ruslan Adilgereev  
Am Tierpark 62  
10319 Berlin  
Deutschland  
E-Mail: kontakt@mahlzait.de  
Telefon: 017643657343

**Kontakt für Datenschutzanfragen:** kontakt@mahlzait.de

## 2. Grundsätze

Wir verarbeiten personenbezogene Daten nur, wenn dies erforderlich ist, eine Rechtsgrundlage besteht und/oder Sie eingewilligt haben.

Hinweis: Mahlzait ist eine Ernährungs‑ und Fitness‑App. Dabei können je nach Nutzung auch Daten verarbeitet werden, die Rückschlüsse auf Gesundheit und Lebensweise zulassen. Für optionale Funktionen (z.B. Health‑Sync, KI‑Analyse von Bildern/Audio) holen wir – soweit erforderlich – Ihre Einwilligung ein.

## 3. Datenverarbeitung bei Besuch der Website

### 3.1 Hosting, Server‑Logfiles

Unsere Website wird über einen Hosting‑Dienstleister bereitgestellt (derzeit: Vercel).
Beim Aufruf der Website werden technisch notwendige Daten verarbeitet, z.B.:
- IP‑Adresse,
- Datum/Uhrzeit,
- angeforderte Seite/Datei,
- Referrer‑URL,
- User‑Agent (Browser/OS),
- technische Fehlerdaten.

**Zweck:** Auslieferung der Website, Stabilität, Sicherheit (z.B. Missbrauchserkennung) und Fehleranalyse.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem Betrieb) bzw. Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung angeforderter Inhalte).  
**Speicherdauer:** Logdaten werden grundsätzlich nur so lange gespeichert, wie es für den Betrieb/Sicherheitszwecke erforderlich ist und anschließend gelöscht oder anonymisiert (typischerweise Tage bis wenige Wochen, abhängig vom Hosting‑Setup).

### 3.2 Consent‑Management, lokale Speicherung

Wir speichern Ihre Auswahl zu Cookies/Tracking in der Regel lokal im Browser (z.B. localStorage), damit wir Ihre Entscheidung bei künftigen Besuchen berücksichtigen können.
Außerdem kann die Website funktionale Einstellungen speichern (z.B. Theme/Darkmode).

**Zweck:** Merken Ihrer Entscheidung und funktionaler Einstellungen.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. c DSGVO (Nachweispflichten, soweit anwendbar) und/oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an nutzerfreundlicher Website‑Bedienung).

### 3.3 Vercel Analytics & Speed Insights

Wir nutzen Performance‑/Reichweitenmessung über Vercel (z.B. Speed Insights/Analytics). Dabei können technische Informationen (z.B. Performance‑Metriken, Seitenaufrufe, grobe Geräte‑/Browserinformationen) verarbeitet werden.

**Zweck:** Performance‑Optimierung und Reichweitenmessung.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Optimierung) bzw. – falls erforderlich – Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).

### 3.4 Google Analytics 4 (nur mit Einwilligung)

Wenn Sie zustimmen, nutzen wir Google Analytics 4 (Google Ireland Limited / Google LLC) zur Website‑Analyse.
Dabei können insbesondere folgende Daten verarbeitet werden:
- pseudonyme Nutzungs‑/Ereignisdaten (z.B. Seitenaufrufe, Klicks),
- Geräte‑/Browserinformationen,
- ungefähre Standortinformationen (abgeleitet),
- IP‑Adresse (in der Regel gekürzt/anonymisiert, soweit konfiguriert).

**Zweck:** Reichweitenmessung und Verbesserung der Website.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).  
**Widerruf:** jederzeit über die Cookie‑Einstellungen auf der Website.

### 3.5 Microsoft Clarity (nur mit Einwilligung)

Wenn Sie zustimmen, nutzen wir Microsoft Clarity (Microsoft Corporation) zur Analyse der Website‑Nutzung (Heatmaps, Session‑Replays).
Dabei können Interaktionen auf der Website (z.B. Scrollen, Klicks) verarbeitet werden. Clarity bietet Funktionen zum Maskieren sensibler Inhalte; dennoch kann es zu Aufzeichnungen von Eingaben/Interaktionen kommen.

**Zweck:** UX‑Optimierung und Fehleranalyse.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).  
**Widerruf:** jederzeit über die Cookie‑Einstellungen auf der Website.

### 3.6 Meta Pixel & Google Ads Conversion Tracking (nur mit Einwilligung)

Wenn Sie zustimmen, setzen wir Marketing‑Tracking ein (z.B. Meta Pixel, Google Ads Conversion Tracking), um die Wirksamkeit von Werbekampagnen zu messen.
Dabei können u.a. verarbeitet werden:
- Ereignisse (z.B. Klick auf App‑Store‑Link),
- technische Identifier (z.B. Cookie‑/Pixel‑IDs).

**Zweck:** Kampagnenmessung, Attribution, Marketing‑Optimierung.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).  
**Widerruf:** jederzeit über die Cookie‑Einstellungen auf der Website.

## 4. Datenverarbeitung in der App

### 4.1 Konto, Login und Nutzerverwaltung (Firebase Auth)

Für Registrierung/Login nutzen wir Firebase Authentication (Google).
Dabei verarbeiten wir z.B.:
- E‑Mail‑Adresse,
- Auth‑Provider (z.B. Google, Apple),
- technische Kennungen (z.B. Firebase‑User‑ID).

**Zweck:** Authentifizierung, Kontoverwaltung, Sicherheit.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Anbahnung) und Art. 6 Abs. 1 lit. f DSGVO (Sicherheit/Missbrauchsschutz).

### 4.2 Inhalte und App‑Daten (Firebase Firestore/Storage, lokale Speicherung)

Je nach Nutzung verarbeiten wir in der App insbesondere:
- Profilangaben (z.B. Alter, Größe, Gewicht, Ziele, Aktivitätslevel, Präferenzen),
- Ernährungs‑/Trackingdaten (Mahlzeiten, Nährwerte, Rezepte, Einträge),
- Fotos/Bilder, die Sie zum Loggen/Analysieren bereitstellen,
- lokale Daten für Offline‑Funktionalität (z.B. Cache, Einstellungen).

**Zweck:** Bereitstellung der Kernfunktionen (Tracking, Auswertungen, Synchronisation, Rezepte).  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Anbahnung).

### 4.3 Gesundheitsdaten & Health‑Sync (Apple Health/HealthKit, Google Health Connect)

Wenn Sie die Health‑Integration aktivieren, kann Mahlzait – abhängig von Ihrer Freigabe – Gesundheitsdaten lesen und/oder schreiben, z.B.:
- Schritte,
- Gewicht (lesen/schreiben),
- Ernährung/Nutrition (lesen/schreiben),
- Aktivitätsdaten (z.B. Kalorien),
- Schlafdaten.

Die Freigabe erfolgt über die System‑Berechtigungen von iOS/Android und ist jederzeit widerrufbar (in den jeweiligen Systemeinstellungen).

**Zweck:** Synchronisation und Darstellung Ihrer Gesundheits‑/Fitnessdaten in der App.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und – soweit Gesundheitsdaten betroffen sind – Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung).  
**Hinweis:** Ohne Aktivierung/Einwilligung findet keine Health‑Sync statt.

#### 4.3.1 Cloud‑Synchronisierung von Gesundheitsdaten (optional)

Zusätzlich zur lokalen Health‑Integration bietet Mahlzait die Möglichkeit, Gesundheitsdaten (Schritte, Gewicht, Schlaf, Aktivitäten) geräteübergreifend über unsere Cloud (Firebase/Google Cloud) zu synchronisieren.

**Diese Cloud‑Synchronisierung erfordert eine separate, ausdrückliche Einwilligung** im Datenschutz‑Dialog der App („Gesundheitsdaten‑Sync").

- **Mit Einwilligung:** Ihre Gesundheitsdaten werden verschlüsselt an Firebase Firestore übertragen und dort gespeichert, um sie auf mehreren Geräten verfügbar zu machen.
- **Ohne Einwilligung:** Ihre Gesundheitsdaten bleiben ausschließlich lokal auf Ihrem Gerät (in Apple Health/HealthKit bzw. Google Health Connect). Es findet keine Cloud‑Übertragung statt.

**Zweck:** Geräteübergreifende Synchronisierung Ihrer Gesundheitsdaten.  
**Rechtsgrundlage:** Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung für besondere Kategorien personenbezogener Daten).  
**Widerruf:** Sie können die Einwilligung jederzeit in den Datenschutz‑Einstellungen der App widerrufen. Bei Widerruf werden keine weiteren Gesundheitsdaten in die Cloud synchronisiert; bereits gespeicherte Daten können Sie über die Kontolöschung entfernen.

### 4.4 KI‑Funktionen (Text, Bild, Audio, YouTube‑URL)

Mahlzait bietet KI‑Funktionen (z.B. Chat, Vorschläge, Analyse von Fotos, Transkription von Sprache, YouTube‑Rezept‑Analyse). Dafür werden Inhalte verarbeitet, die Sie aktiv bereitstellen, z.B.:
- Texteingaben,
- Bilder/Fotos,
- Audioaufnahmen (für Transkription),
- YouTube‑Links (für Video‑Analyse).

Je nach Funktion werden diese Daten an KI‑Dienstleister übertragen (z.B. Google über Firebase AI / Vertex AI bzw. Gemini‑API, sowie Vertex AI Agent Engine über unsere Backend‑Dienste), um die gewünschten Ergebnisse zu erzeugen.

**Zweck:** Bereitstellung der KI‑Funktionen, Verbesserung der Nutzererfahrung.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung angeforderter Funktion) und – soweit Gesundheitsdaten betroffen sind – Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung).  
**Wichtig:** Bitte geben Sie keine Inhalte ein, die Sie nicht verarbeitet haben möchten. Inhalte können Hinweise auf Gesundheit/Lebensweise enthalten.

### 4.5 In‑App‑Käufe (Apple App Store / Google Play)

Wenn Sie ein Abo/einen Kauf tätigen, erfolgt die Zahlungsabwicklung über Apple bzw. Google.
Wir erhalten und verarbeiten in der App typischerweise Informationen zum Kaufstatus (z.B. aktiv/inaktiv), Produkt‑ID und Transaktions‑/Beleg‑IDs für Support und Entitlement‑Prüfung.

**Zweck:** Abwicklung/Verwaltung von Abonnements und Freischaltung von Funktionen.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO.

### 4.6 Consent‑Management in der App

Beim ersten Start der App sowie bei Aktualisierungen der Datenschutzrichtlinie wird Ihnen ein Datenschutz‑Dialog angezeigt. Sie können dort granular entscheiden, welche optionalen Datenverarbeitungen Sie erlauben:

| Kategorie | Beschreibung | Standard |
|-----------|--------------|----------|
| **Essenziell** | Für die App‑Funktion notwendig (Login, Speicherung) | Immer aktiv |
| **Gesundheitsdaten‑Sync** | Cloud‑Synchronisierung von Health‑Daten (Art. 9 DSGVO) | Aus (Opt‑in) |
| **Analytics** | Firebase Analytics zur Nutzungsanalyse | Aus (Opt‑in) |
| **Marketing** | Microsoft Clarity Session‑Recording | Aus (Opt‑in) |

**Wichtig:** Alle optionalen Kategorien sind standardmäßig deaktiviert. Ohne Ihre ausdrückliche Einwilligung werden keine Daten an Analytics‑/Marketing‑Dienste gesendet und keine Gesundheitsdaten in die Cloud übertragen.

**Widerruf:** Sie können Ihre Einwilligungen jederzeit in den Datenschutz‑Einstellungen der App (Profil → Datenschutz‑Einstellungen) ändern oder widerrufen.

### 4.7 App‑Analytics & Session‑Replay (nur mit Einwilligung)

Wenn Sie zustimmen, nutzen wir in der App:
- Firebase Analytics (Google) zur Nutzungsanalyse,
- Microsoft Clarity (Mobile SDK) für Session‑Replay/Interaktionsanalyse.

**Zweck:** Verbesserung der App, Fehler‑/UX‑Analyse.  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).  
**Widerruf:** jederzeit in den App‑Datenschutz‑Einstellungen.

## 5. Empfänger / Kategorien von Empfängern

Je nach Nutzung können Daten an folgende Kategorien von Empfängern übermittelt werden:
- Hosting/Content‑Delivery (z.B. Vercel),
- Cloud‑/Backend‑Dienstleister (z.B. Firebase/Google Cloud),
- Analytics‑/Marketing‑Dienstleister (z.B. Google Analytics, Microsoft Clarity, Meta, Google Ads) – nur mit Einwilligung,
- App‑Store‑Betreiber & Zahlungsabwicklung (Apple, Google),
- Datenbank‑/API‑Dienste (z.B. Open Food Facts) zur Produktrecherche,
- KI‑Dienstleister (z.B. Google über Firebase AI / Vertex AI / Gemini).

## 6. Drittlandübermittlungen

Einige der genannten Anbieter können Daten auch außerhalb der EU/des EWR verarbeiten (z.B. in den USA oder globalen Regionen).
Soweit erforderlich, erfolgt die Übermittlung auf Grundlage geeigneter Garantien (z.B. Standardvertragsklauseln) und/oder anerkannter Angemessenheitsbeschlüsse (z.B. EU‑US Data Privacy Framework, soweit anwendbar).

## 7. Speicherdauer und Löschung

Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist:
- App‑Daten i.d.R. bis zur Löschung Ihres Kontos bzw. solange Sie die App nutzen,
- technische Logs entsprechend Abschnitt 3.1,
- Analytics/Marketing‑Daten entsprechend den Einstellungen/Retention‑Vorgaben der jeweiligen Anbieter (nur mit Einwilligung).

Sie können Ihr Konto in der App löschen. Dabei werden die in Ihrem Konto gespeicherten App‑Daten grundsätzlich gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.

## 8. Ihre Rechte

Sie haben – je nach Voraussetzung – folgende Rechte:
- Auskunft (Art. 15 DSGVO),
- Berichtigung (Art. 16 DSGVO),
- Löschung (Art. 17 DSGVO),
- Einschränkung der Verarbeitung (Art. 18 DSGVO),
- Datenübertragbarkeit (Art. 20 DSGVO),
- Widerspruch (Art. 21 DSGVO),
- Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO) mit Wirkung für die Zukunft.

Außerdem haben Sie das Recht, sich bei einer Datenschutz‑Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).

## 9. Sicherheit

Wir treffen angemessene technische und organisatorische Maßnahmen, um Daten zu schützen (z.B. verschlüsselte Übertragung, Zugriffsbeschränkungen). Dennoch kann keine Methode eine absolute Sicherheit garantieren.

## 10. Änderungen dieser Datenschutzerklärung

Wir können diese Datenschutzerklärung aktualisieren. Die jeweils aktuelle Version ist auf dieser Seite veröffentlicht; das Datum ("Stand") wird angepasst.
`,
  },
  cookiesPolicy: {
    seo: {
      title: "Cookie-Richtlinie - Mahlzait Kalorienzähler App",
      description: "Cookie-Einstellungen für Mahlzait: Erfahre welche Cookies wir nutzen (Analytics, Marketing) und wie du sie verwalten kannst. DSGVO-konforme Cookie-Richtlinie.",
    },
    content: `# Cookie-Richtlinie / Cookie-Einstellungen (Website)

**Stand:** Dezember 2025

Diese Cookie‑Richtlinie gilt für die Website mahlzait.de.
Die App selbst verwendet keine Browser‑Cookies, sondern – je nach Plattform – systemnahe Speichermechanismen (z.B. lokale App‑Einstellungen). Details zur App findest du in der Datenschutzerklärung.

## 1. Was sind Cookies und ähnliche Technologien?

Cookies sind kleine Textdateien, die im Browser gespeichert werden. Daneben gibt es ähnliche Technologien, z.B.:
- localStorage/sessionStorage (Speicher im Browser),
- Pixel‑/Tracking‑Tags (z.B. Meta Pixel),
- Geräte‑/Browser‑Identifier und Skripte von Drittanbietern.

Wir verwenden solche Technologien, um die Website zu betreiben, zu messen und – mit Einwilligung – Marketing zu optimieren.

## 2. Kategorien

### 2.1 Notwendige (essenzielle) Speicherung

Diese ist für Grundfunktionen erforderlich und kann nicht deaktiviert werden:
- Speichern deiner Einwilligungsentscheidung (Cookie‑Banner),
- Speichern funktionaler Einstellungen (z.B. Theme/Darkmode).

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an nutzerfreundlichem und rechtssicherem Betrieb) bzw. Art. 6 Abs. 1 lit. c DSGVO (soweit Nachweis/Umsetzung von Einwilligungen erforderlich ist).

### 2.2 Analytics/Statistik (nur mit Einwilligung)

Wenn du zustimmst, nutzen wir Analyse‑Tools, um die Website zu verbessern:
- **Google Analytics 4** – Reichweitenmessung und Nutzungsanalyse,
- **Microsoft Clarity** – Heatmaps und Session‑Replays zur UX‑Optimierung.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).

Zusätzlich setzen wir Performance‑Messung (z.B. Speed Insights/Analytics über Vercel) ein, die typischerweise ohne Cookies auskommt und vor allem aggregierte Performance‑Metriken liefert.
Je nach Ausgestaltung kann dies auf Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Performance‑Optimierung) oder – falls erforderlich – ebenfalls auf Einwilligung gestützt sein.

### 2.3 Marketing (nur mit Einwilligung)

Wenn du zustimmst, nutzen wir Marketing‑Tracking zur Kampagnenmessung:
- **Meta Pixel**,
- **Google Ads Conversion Tracking**.

Dabei können z.B. Kampagnenparameter (utm_*, gclid, fbclid) und Ereignisse wie ein Klick auf einen App‑Store‑Link verarbeitet werden.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).

## 3. Wie kannst du deine Auswahl ändern oder widerrufen?

Du kannst deine Auswahl jederzeit über das Cookie‑Banner bzw. die Cookie‑Einstellungen auf der Website ändern oder widerrufen. Bei einem Widerruf werden – soweit technisch möglich – die entsprechenden Skripte nicht weiter geladen und ggf. lokal gespeicherte Einträge (z.B. Einwilligungsstatus) aktualisiert.

Zusätzlich kannst du in deinem Browser Cookies und Website‑Daten löschen oder blockieren. Beachte: Wenn du essenzielle Website‑Daten löschst, kann z.B. das Cookie‑Banner erneut angezeigt werden.

## 4. Kontakt

Bei Fragen zur Cookie‑Richtlinie:

Mahlzait  
Ruslan Adilgereev  
Am Tierpark 62  
10319 Berlin  
E-Mail: kontakt@mahlzait.de  
Telefon: 017643657343
`,
  },
  termsAndConditions: {
    seo: {
      title: "Terms and Conditions - Mahlzait Calorie Counter",
      description: "Terms of Service for Mahlzait app: Usage rights, limitations, liability and data protection. Clear terms for Free and Pro versions on iOS & Android.",
    },
    content: `# Nutzungsbedingungen

**Stand:** November 2025

## Einleitung

Willkommen bei Mahlzait (die "App"). Diese Nutzungsbedingungen regeln Ihre Nutzung der App, die von Ruslan Adilgereev ("wir", "uns" oder "unser") bereitgestellt wird. Durch den Zugriff auf oder die Nutzung unserer App stimmen Sie diesen Bedingungen zu. Wenn Sie mit diesen Bedingungen nicht einverstanden sind, nutzen Sie die App bitte nicht.

## Nutzung der App

### 1. Berechtigung
Um unsere App zu nutzen, müssen Sie mindestens 16 Jahre alt sein und in der Lage sein, eine rechtsverbindliche Vereinbarung einzugehen. Durch die Nutzung der App versichern Sie, dass Sie diese Voraussetzungen erfüllen.

### 2. Benutzerkonten
- **Registrierung:** Sie müssen ein Konto erstellen, um auf bestimmte Funktionen der App zuzugreifen. Sie müssen bei der Erstellung Ihres Kontos genaue und vollständige Informationen angeben.
- **Kontosicherheit:** Sie sind für die Geheimhaltung Ihrer Konto-Anmeldedaten und für alle Aktivitäten verantwortlich, die unter Ihrem Konto stattfinden. Sie verpflichten sich, uns unverzüglich über jede unbefugte Nutzung Ihres Kontos zu informieren.
- **Konto-Kündigung:** Wir behalten uns das Recht vor, Ihr Konto jederzeit ohne Vorankündigung aus beliebigem Grund zu kündigen oder zu sperren, auch wenn wir glauben, dass Sie gegen diese Bedingungen verstoßen haben.

### 3. Verbotenes Verhalten
Sie verpflichten sich, Folgendes nicht zu tun:
- Die App für illegale oder unbefugte Zwecke zu nutzen.
- Den Betrieb der App oder der Server oder Netzwerke, die zur Bereitstellung der App verwendet werden, zu stören.
- Viren, Malware oder anderen schädlichen Code hochzuladen oder zu übertragen.
- Zu versuchen, unbefugten Zugriff auf Teile der App oder auf andere Konten, Systeme oder Netzwerke zu erlangen.

## Geistiges Eigentum

### 1. Eigentum
Alle Inhalte und Materialien, die in der App verfügbar sind, einschließlich, aber nicht beschränkt auf Text, Grafiken, Logos und Software, sind Eigentum von Mahlzait (Ruslan Adilgereev) oder deren Lizenzgebern und durch Gesetze zum Schutz geistigen Eigentums geschützt.

### 2. Lizenz
Wir gewähren Ihnen eine beschränkte, nicht exklusive, nicht übertragbare Lizenz zum Zugriff auf und zur Nutzung der App für Ihren persönlichen, nicht kommerziellen Gebrauch. Diese Lizenz unterliegt Ihrer Einhaltung dieser Bedingungen.

### 3. Beschränkungen
Sie dürfen nicht:
- Inhalte oder Materialien der App ohne unsere vorherige schriftliche Zustimmung reproduzieren, verteilen, modifizieren oder abgeleitete Werke erstellen.
- Data Mining, Robots oder ähnliche Datensammelmethoden in der App verwenden.

## Haftungsausschluss und Haftungsbeschränkung

### 1. Haftungsausschluss
Die App wird auf "wie besehen" und "wie verfügbar" Basis bereitgestellt. Wir geben keine Garantien oder Zusicherungen über die Genauigkeit oder Vollständigkeit der in oder über die App verfügbaren Inhalte. Wir lehnen alle Garantien ab, ob ausdrücklich oder stillschweigend.

**Medizinischer Hinweis:** Mahlzait ist KEINE medizinische App und ersetzt keine professionelle Ernährungsberatung oder ärztliche Behandlung. Die berechneten Werte sind Richtwerte und keine medizinischen Empfehlungen.

### 2. Haftungsbeschränkung
Im gesetzlich zulässigen Umfang haftet Mahlzait nicht für indirekte, zufällige, besondere, Folge- oder Strafschäden oder für Gewinn- oder Umsatzverluste, die direkt oder indirekt entstehen aus:
- Ihrer Nutzung oder Unfähigkeit, die App zu nutzen;
- Unbefugtem Zugriff auf oder Nutzung unserer Server und/oder darin gespeicherte personenbezogene Daten;
- Bugs, Viren oder anderem schädlichen Code;
- Fehlern oder Auslassungen in Inhalten.

Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.

## Freistellung

Sie verpflichten sich, Mahlzait, Ruslan Adilgereev und verbundene Personen von allen Ansprüchen, Verbindlichkeiten, Schäden, Verlusten und Kosten, einschließlich angemessener Rechts- und Buchhaltungsgebühren, freizustellen, die sich aus oder in Verbindung mit Ihrem Zugriff auf oder Ihrer Nutzung der App oder Ihrer Verletzung dieser Bedingungen ergeben.

## Anwendbares Recht

Diese Bedingungen unterliegen den Gesetzen der Bundesrepublik Deutschland und sind nach diesen auszulegen, unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit gesetzlich zulässig, Berlin.

## Änderungen dieser Bedingungen

Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Wir werden Sie über Änderungen informieren, indem wir die neuen Bedingungen auf dieser Seite veröffentlichen und das "Stand"-Datum oben aktualisieren. Ihre fortgesetzte Nutzung der App nach solchen Änderungen bedeutet Ihre Zustimmung zu den überarbeiteten Bedingungen.

## Kontakt

Bei Fragen oder Bedenken zu diesen Bedingungen kontaktieren Sie uns unter:

Mahlzait  
Ruslan Adilgereev  
Am Tierpark 62  
10319 Berlin  
E-Mail: kontakt@mahlzait.de  
Telefon: 017643657343
`,
  },
};

export default templateConfig;
