import type { TemplateConfig } from "./configType";

const templateConfig: TemplateConfig = {
  name: "Mahlzait",
  seo: {
    title: "Mahlzait – Kalorienzähler & Food-Tracker mit KI",
    description: "Tracke Mahlzeiten per Suche, Barcode oder KI. Rezepte erstellen & teilen, Ziele setzen, Gewicht tracken, Insights & Health-Integration. Deutsch, Englisch, Russisch. Kostenlos starten!",
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
      { href: "/#faq", title: "FAQ" },
    ],
  },
  topNavbar: {
    cta: "App laden",
    disableWidthAnimation: false,
    hideAppStore: false,
    hideGooglePlay: false,
    links: [
      { href: "/#features", title: "Features" },
      { href: "/#live-demo", title: "Demo" },
      { href: "/#how-it-works", title: "Anleitung" },
      { href: "/#pricing", title: "Preise" },
      { href: "/#faq", title: "FAQ" },
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
      title: "Datenschutzerklärung - Mahlzait",
      description: "Datenschutzerklärung für Mahlzait Kalorienzähler App",
    },
    content: `# Datenschutzerklärung

**Stand:** November 2025

## Einleitung

Willkommen bei Mahlzait. Ruslan Adilgereev ("wir", "uns" oder "unser") verpflichtet sich, Ihre Privatsphäre zu schützen. Diese Datenschutzerklärung erklärt, wie wir Ihre personenbezogenen Daten erheben, verwenden und weitergeben, wenn Sie unsere App nutzen.

## Welche Daten wir erheben

### 1. Von Ihnen bereitgestellte Informationen
- **Account-Informationen:** Wenn Sie sich für unsere App registrieren, erheben wir Ihren Namen, E-Mail-Adresse und andere Kontaktinformationen.
- **Nutzerdaten:** Wir erheben Inhalte, die Sie hochladen, posten oder anderweitig über die App übermitteln, einschließlich Mahlzeiten-Logs, Fotos und andere Medien.
- **Ernährungsdaten:** Ihre getrackten Mahlzeiten, Kalorien, Makronährstoffe, Gewicht und Ziele.

### 2. Automatisch erhobene Informationen
- **Nutzungsdaten:** Wir erfassen Informationen über Ihre Interaktionen mit der App, z.B. welche Funktionen Sie nutzen und wie lange.
- **Geräteinformationen:** Wir erfassen Informationen über das Gerät, mit dem Sie auf die App zugreifen, einschließlich IP-Adresse, Gerätetyp und Betriebssystem.

### 3. Informationen von Drittanbietern
- **Drittanbieter-Dienste:** Wenn Sie die App über einen Drittanbieter-Service verbinden (z.B. Apple Health, Google Fit), können wir Informationen von diesem Service gemäß deren Datenschutzrichtlinien erfassen.

## Wie wir Ihre Daten verwenden

Wir können die erhobenen Informationen für folgende Zwecke verwenden:
- **Bereitstellung und Wartung unseres Services:** Wir nutzen Ihre Daten, um die App zu betreiben und zu verbessern.
- **Kommunikation mit Ihnen:** Wir können Ihre Kontaktdaten nutzen, um Ihnen Updates, Benachrichtigungen und andere Mitteilungen bezüglich der App zu senden.
- **Personalisierung:** Wir können Ihre Daten nutzen, um Ihr Erlebnis in der App zu personalisieren und Ihnen auf Ihre Interessen zugeschnittene Inhalte anzubieten (z.B. KI-Essensvorschläge).
- **Analytik und Forschung:** Wir nutzen die Daten, um zu analysieren, wie Nutzer mit der App interagieren und unsere Dienste zu verbessern.

## Weitergabe Ihrer Daten

Wir geben Ihre personenbezogenen Daten nicht an Dritte weiter, außer in folgenden Fällen:
- **Mit Ihrer Zustimmung:** Wir können Ihre Daten mit Dritten teilen, wenn Sie uns ausdrücklich dazu ermächtigen.
- **Dienstleister:** Wir können Ihre Daten mit Drittanbietern teilen, die Dienste in unserem Auftrag erbringen (z.B. Firebase für Backend, Apple/Google für In-App-Käufe).
- **Gesetzliche Anforderungen:** Wir können Ihre Daten offenlegen, wenn dies gesetzlich vorgeschrieben ist oder wenn wir glauben, dass dies notwendig ist, um rechtlichen Verpflichtungen nachzukommen, unsere Rechte zu schützen oder Betrug zu verhindern.

## Ihre Rechte und Wahlmöglichkeiten

Gemäß DSGVO haben Sie folgende Rechte:
- **Auskunft und Korrektur:** Sie haben das Recht, auf die personenbezogenen Daten, die wir über Sie speichern, zuzugreifen und diese zu korrigieren.
- **Löschung:** Sie können die Löschung Ihrer personenbezogenen Daten verlangen, indem Sie uns unter datenschutz@mahlzait.de kontaktieren oder die Löschfunktion in der App nutzen.
- **Widerspruch:** Sie können der Verarbeitung Ihrer Daten widersprechen.
- **Datenübertragbarkeit:** Sie haben das Recht, Ihre Daten in einem strukturierten, maschinenlesbaren Format zu erhalten.
- **Opt-Out:** Sie können Marketing-Kommunikation jederzeit abbestellen.

## Sicherheit

Wir ergreifen angemessene Maßnahmen, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Nutzung oder Offenlegung zu schützen. Wir nutzen Firebase (Google) als Backend mit verschlüsselter Datenübertragung. Dennoch ist kein Sicherheitssystem vollständig sicher, und wir können die absolute Sicherheit Ihrer Daten nicht garantieren.

## Änderungen dieser Datenschutzerklärung

Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Wir werden Sie über Änderungen informieren, indem wir die neue Datenschutzerklärung auf dieser Seite veröffentlichen und das "Stand"-Datum oben aktualisieren. Ihre fortgesetzte Nutzung der App nach solchen Änderungen bedeutet Ihre Zustimmung zur überarbeiteten Datenschutzerklärung.

## Kontakt

Bei Fragen oder Bedenken zu dieser Datenschutzerklärung kontaktieren Sie uns unter:

Mahlzait  
Ruslan Adilgereev  
Am Tierpark 62  
10319 Berlin  
E-Mail: datenschutz@mahlzait.de  
Telefon: 017643657343

`,
  },
  cookiesPolicy: {
    seo: {
      title: "Cookie-Richtlinie - Mahlzait",
      description: "Cookie-Richtlinie für Mahlzait Kalorienzähler App",
    },
    content: `# Cookie-Richtlinie

**Stand:** November 2025

## Einleitung

Diese Cookie-Richtlinie erklärt, wie Mahlzait (Ruslan Adilgereev) Cookies und ähnliche Technologien verwendet, um Sie zu erkennen, wenn Sie unsere App nutzen. Sie erläutert, was diese Technologien sind, warum wir sie verwenden und welche Rechte Sie haben, deren Nutzung zu kontrollieren.

## Was sind Cookies?

Cookies sind kleine Datendateien, die auf Ihrem Gerät abgelegt werden, wenn Sie eine Website besuchen oder eine App nutzen. Cookies werden häufig von Online-Dienstanbietern verwendet, um die Interaktion zwischen Nutzern und Websites/Apps zu erleichtern und schneller zu machen sowie Berichtsinformationen bereitzustellen.

### Arten von Cookies, die wir verwenden

Wir verwenden folgende Arten von Cookies in unserer App:

1. **Unbedingt erforderliche Cookies:**  
   Diese Cookies sind für die Nutzung einiger Funktionen unserer App unerlässlich. Ohne diese Cookies können einige Dienste nicht bereitgestellt werden (z.B. Login, Theme-Einstellung).

2. **Performance- und Analytics-Cookies:**  
   Diese Cookies sammeln Informationen darüber, wie Nutzer mit unserer App interagieren. Wir nutzen diese Informationen, um die Funktionsweise unserer App zu verbessern (Vercel Analytics).

3. **Funktionalitäts-Cookies:**  
   Diese Cookies ermöglichen es unserer App, sich an Ihre Entscheidungen zu erinnern, z.B. Login-Daten oder Sprachpräferenz (Deutsch, Englisch, Russisch).

4. **Keine Werbe-Cookies:**  
   Mahlzait verwendet KEINE Werbe- oder Tracking-Cookies von Drittanbietern für Werbezwecke.

### Cookies von Drittanbietern

Wir nutzen ausschließlich Vercel Analytics zur Nutzungsanalyse. Keine Werbe-Cookies.

## Wie wir Cookies verwenden

Wir verwenden Cookies, um:

- **Ihre Login-Daten und Präferenzen zu speichern (Theme, Sprache).**
- **Nutzungsmuster zu analysieren und die Funktionalität unserer App zu verbessern.**
- **Relevante Inhalte bereitzustellen (KI-Vorschläge basierend auf Ihren Präferenzen).**
- **Ihre Präferenzen basierend auf früheren App-Aktivitäten zu verstehen.**

**Wichtig:** Wir verwenden KEINE Werbe-Cookies oder Tracking für Marketing-Zwecke!

## Ihre Wahlmöglichkeiten bezüglich Cookies

Sie haben das Recht zu entscheiden, ob Sie Cookies akzeptieren oder ablehnen. Sie können Ihre Cookie-Präferenzen anpassen, indem Sie die Einstellungen in Ihrem Browser ändern. Die meisten Browser ermöglichen Ihnen:

- **Anzuzeigen, welche Cookies auf Ihrem Gerät gespeichert sind und diese einzeln zu löschen.**
- **Drittanbieter-Cookies zu blockieren.**
- **Cookies von bestimmten Websites zu blockieren.**
- **Alle Cookies zu blockieren.**
- **Alle Cookies beim Schließen des Browsers zu löschen.**

Bitte beachten Sie, dass einige Funktionen der App möglicherweise nicht ordnungsgemäß funktionieren, wenn Sie Cookies blockieren oder löschen (z.B. Theme-Speicherung, Login-Status).

## Änderungen dieser Cookie-Richtlinie

Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren. Wir werden Sie über Änderungen informieren, indem wir die neue Cookie-Richtlinie auf dieser Seite veröffentlichen und das "Stand"-Datum oben aktualisieren.

## Kontakt

Bei Fragen oder Bedenken zu unserer Verwendung von Cookies kontaktieren Sie uns unter:

Mahlzait  
Ruslan Adilgereev  
Am Tierpark 62  
10319 Berlin  
E-Mail: datenschutz@mahlzait.de  
Telefon: 017643657343
`,
  },
  termsAndConditions: {
    seo: {
      title: "Nutzungsbedingungen - Mahlzait",
      description: "Nutzungsbedingungen für Mahlzait Kalorienzähler App",
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
E-Mail: info@mahlzait.de  
Telefon: 017643657343
`,
  },
};

export default templateConfig;
