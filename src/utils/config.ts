import type { TemplateConfig } from "./configType";

const templateConfig: TemplateConfig = {
  name: "Mahlzait",
  seo: {
    title: "Mahlzait – Kalorienzähler & Food-Tracker mit KI",
    description: "Kalorienzähler mit KI: Mahlzeiten per Foto, Barcode oder Text tracken. Rezepte teilen, Gewicht verfolgen, Makros im Blick. Kostenlos starten!",
  },
  // Draws grid behind main container
  backgroundGrid: false,
  logo: "/logo.png",
  theme: "mahlzait",
  // Forces theme to be chosen above, no matter what user prefers
  forceTheme: false,
  // Shows switch to toggle between dark and light modes
  showThemeSwitch: true,
  appStoreLink: "https://apps.apple.com/de/app/mahlzait-kalorienz%C3%A4hler/id6747400456",
  googlePlayLink:
    "https://play.google.com/store/apps/details?id=com.promptit.mytemple",
  footer: {
    legalLinks: {
      termsAndConditions: true,
      cookiesPolicy: true,
      privacyPolicy: true,
    },
    socials: {
      // Füge hier deine echten Social-Media-Links ein, oder entferne sie
      // instagram: "https://instagram.com/mahlzait",
      // facebook: "https://facebook.com/mahlzait",
      // twitter: "https://x.com/mahlzait",
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
    ],
    // SEO-Links für App-Landingpages und Info
    appLinks: [
      { href: "/#faq", title: "FAQ" },
      { href: "/team", title: "Team" },
      { href: "/wissen", title: "Wissen" },
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
      { href: "/wissen", title: "Wissen" },
      { href: "/rechner", title: "Rechner" },
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
      description: "Mahlzait ist dein schneller Kalorienzähler mit KI. Logge Mahlzeiten per Suche, Barcode oder Foto. Rezepte teilen, Ziele erreichen, Gewicht tracken. Kostenlos für iOS & Android.",
    },
    testimonials: {
      id: "testimonials",
      title: "Kundenstimmen",
      subtitle: "Das sagen unsere zufriedenen Nutzer",
      cards: [
        {
          name: "Anna Müller",
          comment:
            "Endlich eine Tracking-App, die nicht nervt! Die Foto-Funktion ist der Hammer – einfach abfotografieren und die KI erkennt alles. Spare mir so viel Zeit beim Eingeben. Nach 3 Wochen schon 4kg runter!",
        },
        {
          name: "Ben Wagner",
          comment:
            "Der Barcode-Scanner ist mega praktisch! Einkaufen scannen, fertig. Und dass die App kostenlos ist – krass! Hab schon mehrere Apps ausprobiert, aber Mahlzait ist mit Abstand die beste. Tracke jetzt seit 2 Monaten konsequent.",
        },
        {
          name: "Dendrit99",
          comment:
            "Früher habe ich immer ChatGPT genutzt um zu fragen wie viel Kalorien etwas hat. Mahlzait kann das genau so gut und ich habe sofort einen viel besseren Überblick! Seit 5 Wochen nutze ich bisher und 5kg abgenommen.",
        },
        {
          name: "Diana Weber",
          comment:
            "Hab ewig nach einer simplen Kalorienzähler-App gesucht. Mahlzait ist so intuitiv! Die Suche findet alles sofort und die KI-Vorschläge sind richtig gut. Keine nervigen Premium-Features hinter Paywalls. Einfach perfekt!",
        },
        {
          name: "Eva Schmidt",
          comment:
            "Was ich liebe: Mahlzeiten in Sekunden geloggt! Foto machen, fertig. Die App lernt mit und erkennt meine Standard-Mahlzeiten inzwischen automatisch. Super motivierend, seine Ziele jeden Tag zu sehen. 10/10!",
        },
      ],
    },
    partners: {
      title: "Mahlzait in Zahlen",
      stats: [
        {
          icon: "🍽️",
          number: "6.000+",
          label: "Geloggte Mahlzeiten",
        },
        {
          icon: "👥",
          number: "300+",
          label: "Aktive User",
        },
        {
          icon: "📖",
          number: "120+",
          label: "Geteilte Rezepte",
        },
        {
          icon: "💡",
          number: "3.000+",
          label: "Essensvorschläge",
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
        "Dein kompletter Food-Tracker: Von KI-Logging über Barcode-Scanner bis Health-Integration – alle Features für erfolgreiches Kalorien-Tracking",
      cards: [
        {
          title: "KI-Logging",
          subtitle:
            "Revolutionäres Food-Tracking mit künstlicher Intelligenz: Mahlzeiten per Foto oder Text loggen. Die KI erkennt Lebensmittel und berechnet Kalorien automatisch",
          icon: "/3D/bulb-front-color.webp",
          screenshot: "/screenshots/chat.webp",
        },
        {
          title: "KI-Vorschläge",
          subtitle:
            "Die KI schlägt dir passende Mahlzeiten vor, wenn du nicht weißt was du essen sollst. Basierend auf deinen Zielen und bereits gegessenen Lebensmitteln – smart und personalisiert",
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
          question: "Ist Mahlzait kostenlos? Was kostet die Kalorienzähler App?",
          answer:
            "Ja, Mahlzait ist kostenlos! Die App bietet alle wichtigen Funktionen zum Tracken von Mahlzeiten, Kalorien und Makronährstoffen ohne Abo-Zwang. Du kannst Lebensmittel suchen, per Barcode scannen, manuell eingeben und Rezepte erstellen – komplett gratis. Für unbegrenzte KI-Features (AI Meal Logging, KI-Vorschläge, YouTube-Rezept-Import) gibt es optional Mahlzait Pro ab 4,99 € pro Monat oder 29,99 € pro Jahr.",
        },
        {
          question: "Wie funktioniert das KI-Logging? Kann die KI deutsche Lebensmittel erkennen?",
          answer:
            "Mit dem KI-Logging von Mahlzait kannst du Mahlzeiten per Foto oder Text erfassen – einfach schreiben 'Hab grad Pizza gegessen' oder ein Foto hochladen. Die KI erkennt deutsche und internationale Lebensmittel, analysiert die Nährwerte und schlägt passende Einträge vor. Du kannst Portionsgrößen anpassen und Vorschläge korrigieren – so behältst du volle Kontrolle über dein Kalorienzählen.",
        },
        {
          question: "Wie genau ist der Barcode-Scanner beim Kalorienzählen?",
          answer:
            "Der Barcode-Scanner von Mahlzait nutzt eine umfangreiche Lebensmitteldatenbank mit hunderttausenden Produkten. Nach dem Scannen werden Kalorien, Makros (Protein, Kohlenhydrate, Fett) und Nährwerte automatisch übernommen. Du kannst die Portionsgröße anpassen. Falls ein Produkt fehlt, kannst du es manuell hinzufügen und für andere Nutzer verfügbar machen.",
        },
        {
          question: "Kann ich eigene Rezepte erstellen und speichern?",
          answer:
            "Ja! Mit Mahlzait kannst du eigene Rezepte erstellen, manuell eingeben oder direkt aus YouTube-Videos importieren. Speichere deine Lieblingsgerichte und logge sie mit einem Klick. Du kannst Rezepte auch per Link mit Freunden teilen. Perfekt für wiederkehrende Mahlzeiten wie Frühstück oder Meal Prep.",
        },
        {
          question: "Unterstützt Mahlzait Apple Health und Google Fit Integration?",
          answer:
            "Ja, Mahlzait synchronisiert sich mit Apple Health (iOS) und Google Fit (Android). Die App übernimmt automatisch Schritte, verbrannte Kalorien und Gewichtsdaten aus deinen Gesundheits-Apps und passt dein Kalorienziel entsprechend an. So hast du alle Fitness- und Ernährungsdaten zentral an einem Ort.",
        },
        {
          question: "Wie viele Kalorien sollte ich essen zum Abnehmen?",
          answer:
            "Mahlzait berechnet deinen individuellen Kalorienbedarf basierend auf Alter, Geschlecht, Größe, Gewicht und Aktivitätslevel. Zum gesunden Abnehmen empfiehlt die App ein moderates Kaloriendefizit von 300-500 kcal pro Tag, was etwa 0,5 kg Gewichtsverlust pro Woche entspricht. Die KI-Vorschläge helfen dir, deine Ziele zu erreichen ohne zu hungern.",
        },
        {
          question: "Was macht Mahlzait besser als andere Kalorienzähler Apps?",
          answer:
            "Mahlzait kombiniert klassisches Food-Tracking mit KI-Power: Mahlzeiten per Foto oder Chat loggen (statt mühsames Tippen), KI-Vorschläge wenn du nicht weißt was du essen sollst, YouTube-Rezept-Import, Barcode-Scanner, Offline-Funktion und Health-Integration. Alles kostenlos nutzbar, ohne Abo-Zwang. Die App ist auf Deutsch optimiert und erkennt deutsche Lebensmittel perfekt.",
        },
        {
          question: "Gibt es Homescreen-Widgets für schnellen Zugriff?",
          answer:
            "Ja! Mahlzait bietet praktische Homescreen-Widgets für iOS und Android. Das Übersichts-Widget zeigt dir deine täglichen Kalorien, Makros und Fortschritte direkt auf dem Homescreen. Zusätzlich gibt es Quick-Launch-Widgets für alle 4 Logging-Methoden: Direktzugriff auf Lebensmittel-Suche, Barcode-Scanner, manuelle Eingabe oder KI-Logging – einfach antippen und sofort loslegen, ohne die App zu öffnen.",
        },
      ],
    },
    header: {
      headline: "Mahlzait – Kalorienzähler mit KI",
      subtitle:
        "Der intelligente Kalorienzähler für schnelles Food-Tracking: Per Barcode-Scanner, KI-Logging oder Suche. Tracke Kalorien, Makros und Gewicht – ideal zum Abnehmen, Muskelaufbau und gesunde Ernährung.",
      screenshots: [
        "/screenshots/1.webp",
        "/screenshots/2.webp",
        "/screenshots/3.webp",
      ],
      rewards: ["5,0 Sterne \n im App Store", "Jetzt mit \n AI-Chat"],
      usersDescription: "100+ Nutzer:innen tracken bereits mit Mahlzait",
      headlineMark: [0, 1],
    },
    pricing: {
      id: "pricing",
      title: "Preise",
      subtitle: "Kostenloser Kalorienzähler – Pro-Version für unlimited AI-Features",
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

**Stand:** Dezember 2025

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

### 4.6 App‑Analytics & Session‑Replay (nur mit Einwilligung)

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
