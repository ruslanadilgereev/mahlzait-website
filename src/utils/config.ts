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
      instagram: "https://instagram.com/google",
      facebook: "https://facebook.com/google",
      twitter: "https://x.com/google",
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
      "/screenshots/1.webp",
      "/screenshots/2.webp",
      "/screenshots/3.webp",
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
          name: "Chris Becker",
          comment:
            "Die Rezept-Funktion ist genial! Hab meine Lieblingsgerichte einmal eingegeben und kann sie jetzt immer wieder loggen. Das Gewichts-Tracking zeigt mir schön meine Fortschritte. Bin nach 6 Wochen endlich bei meinem Wunschgewicht!",
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
        "Kalorienzählen war nie einfacher – in 3 Schritten zum erfolgreichen Food-Tracking",
      steps: [
        {
          title: "Ziel setzen & loslegen",
          subtitle:
            "Account erstellen, Kalorien- & Makroziele eingeben – fertig in 60 Sekunden. Keine nervigen Onboardings, keine Zwangstutorials. Einfach starten.",
          image: "/screenshots/1.webp",
        },
        {
          title: "Essen loggen – so wie DU willst",
          subtitle:
            "Food-Tracking flexibel: KI-Chat ('Hab grad Pizza gegessen'), Barcode-Scanner, Suche in 500.000+ Lebensmitteln oder YouTube-Rezept-Import. Funktioniert auch offline.",
          image: "/screenshots/2.webp",
        },
        {
          title: "Smart tracken & Ziele erreichen",
          subtitle:
            "Die KI schlägt dir passende Mahlzeiten vor – basierend auf Tageszeit und bereits Gegessenem. Teile Rezepte per Link, level up durch konsequentes Tracking, sync mit Apple Health.",
          image: "/screenshots/3.webp",
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
          title: "Lebensmittel-Suche",
          subtitle:
            "Durchsuche die umfangreiche Food-Datenbank mit tausenden Lebensmitteln. Finde Nährwerte und Kalorien in Sekunden – perfekt für schnelles Meal-Tracking",
          icon: "/3D/zoom-front-color.webp",
        },
        {
          title: "Barcode-Scan",
          subtitle:
            "Scanne Produkt-Barcodes für automatisches Kalorien-Tracking. Schneller Barcode-Scanner ohne Tipparbeit – ideal für den Supermarkt-Einkauf",
          icon: "/3D/camera-front-color.webp",
        },
        {
          title: "Manuelle Eingabe",
          subtitle:
            "Erstelle eigene Einträge mit individuellen Portionsgrößen und Nährwerten – flexibel und präzise für jede Mahlzeit",
          icon: "/3D/pencil-front-color.webp",
        },
        {
          title: "KI-Logging",
          subtitle:
            "Revolutionäres Food-Tracking mit künstlicher Intelligenz: Mahlzeiten per Foto oder Text loggen. Die KI erkennt Lebensmittel und berechnet Kalorien automatisch",
          icon: "/3D/bulb-front-color.webp",
        },
        {
          title: "Rezepte & YouTube",
          subtitle:
            "Erstelle Rezepte aus YouTube-Videos, manuell oder per Suche – speichere sie und logge wiederkehrende Mahlzeiten in Sekunden",
          icon: "/3D/video-camera-front-color.webp",
        },
        {
          title: "Einfach teilen",
          subtitle:
            "Teile Rezepte und Mahlzeiten mit einem Link – perfekt für Freunde, Familie oder deine Community",
          icon: "/3D/link-front-color.webp",
        },
        {
          title: "Ziele & Makros",
          subtitle:
            "Setze Kalorienziele und tracke Makronährstoffe (Protein, Kohlenhydrate, Fett). Perfekt für Abnehmen, Diät, Muskelaufbau und gesunde Ernährung",
          icon: "/3D/target-front-color.webp",
        },
        {
          title: "Gewicht & Kalender",
          subtitle:
            "Gewichtstracking mit Fortschritts-Diagramm. Kalenderansicht zeigt alle getrackten Mahlzeiten und Kalorien – perfekt für Diät-Kontrolle",
          icon: "/3D/calender-front-color.webp",
        },
        {
          title: "Insights & Trends",
          subtitle:
            "Visualisiere deine Ernährung mit Diagrammen für Kalorien, Makros und Trends – behalte den Überblick über deine Fortschritte",
          icon: "/3D/chart-front-color.webp",
        },
        {
          title: "Health-Integration",
          subtitle:
            "Verbinde Mahlzait mit Apple Health oder Google Fit und synchronisiere Schritte, Gewicht und weitere Gesundheitsdaten",
          icon: "/3D/heart-front-color.webp",
        },
        {
          title: "Mehrsprachig",
          subtitle:
            "Nutze die App auf Deutsch, Englisch oder Russisch – wechsle jederzeit die Sprache nach deinen Vorlieben",
          icon: "/3D/text-front-color.webp",
        },
        {
          title: "Level-System",
          subtitle:
            "Erreiche täglich deine Ziele, sammle Level und bleib motiviert – gamifiziertes Tracking für langfristigen Erfolg",
          icon: "/3D/trophy-front-color.webp",
        },
      ],
    },
    faq: {
      id: "faq",
      title: "Häufig gestellte Fragen",
      qa: [
        {
          question: "Wie funktioniert das KI-Logging?",
          answer:
            "Mit dem KI-Logging kannst du Mahlzeiten per Foto oder Text erfassen. Die KI analysiert deine Eingabe und schlägt passende Lebensmittel mit Nährwerten vor. Du kannst die Vorschläge bestätigen, anpassen oder ergänzen – so hast du volle Kontrolle über deine Einträge.",
        },
        {
          question: "Kann ich Mahlzait auch offline nutzen?",
          answer:
            "Ja, Mahlzait funktioniert auch offline! Du kannst Mahlzeiten loggen, Rezepte erstellen und deine Daten einsehen, auch ohne Internetverbindung. Sobald du wieder online bist, werden deine Daten automatisch synchronisiert.",
        },
        {
          question: "Unterstützt Mahlzait Health-Dienste wie Apple Health oder Google Fit?",
          answer:
            "Ja, Mahlzait lässt sich mit Apple Health und Google Fit verbinden. So kannst du Schritte, Gewicht und weitere Gesundheitsdaten automatisch synchronisieren und in der App im Blick behalten.",
        },
        {
          question: "In welchen Sprachen ist die App verfügbar?",
          answer:
            "Mahlzait ist auf Deutsch, Englisch und Russisch verfügbar. Du kannst die Sprache jederzeit in den Einstellungen wechseln.",
        },
        {
          question: "Was kostet Mahlzait?",
          answer:
            "Mahlzait ist kostenlos nutzbar und bietet alle wichtigen Funktionen zum Tracken von Mahlzeiten, Kalorien und Makros. Für erweiterte Features wie zusätzliche Auswertungen und Komfortfunktionen gibt es optional Mahlzait Pro ab 3,99 € pro Monat oder 29,99 € pro Jahr.",
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
      title: "Privacy Policy - Mobile App Landing Template",
      description: "Privacy Policy",
    },
    content: `# Privacy Policy

**Effective Date:** [Insert Date]

## Introduction

Welcome to [Your App Name] (the "App"). [Your Company Name] ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our App.

## Information We Collect

### 1. Information You Provide
- **Account Information:** When you sign up for our App, we may collect your name, email address, and other contact information.
- **User Content:** We may collect any content you upload, post, or otherwise transmit through the App, including messages, photos, and other media.

### 2. Information We Collect Automatically
- **Usage Data:** We collect information about your interactions with the App, such as the features you use and the time spent on the App.
- **Device Information:** We collect information about the device you use to access the App, including IP address, device type, and operating system.

### 3. Information from Third Parties
- **Third-Party Services:** If you connect to the App through a third-party service (e.g., social media), we may collect information from that service as permitted by their privacy policies.

## How We Use Your Information

We may use the information we collect for the following purposes:
- **To Provide and Maintain Our Service:** We use your information to operate and improve the App.
- **To Communicate with You:** We may use your contact information to send you updates, notifications, and other communications related to the App.
- **To Personalize Your Experience:** We may use your information to personalize your experience with the App and to offer you content tailored to your interests.
- **For Analytics and Research:** We use the information to analyze how our users interact with the App and to improve our services.

## Sharing Your Information

We do not share your personal information with third parties except in the following circumstances:
- **With Your Consent:** We may share your information with third parties if you give us explicit consent to do so.
- **Service Providers:** We may share your information with third-party service providers who perform services on our behalf.
- **Legal Requirements:** We may disclose your information if required by law, or if we believe that such action is necessary to comply with legal obligations, protect our rights, or prevent fraud.

## Your Rights and Choices

- **Access and Correction:** You have the right to access and correct the personal information we hold about you.
- **Data Deletion:** You may request that we delete your personal information by contacting us at [Your Contact Information].
- **Opt-Out:** You may opt out of receiving promotional communications from us by following the instructions in those communications.

## Security

We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no security system is completely secure, and we cannot guarantee the absolute security of your information.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" above. Your continued use of the App after such changes signifies your acceptance of the revised Privacy Policy.

## Contact Us

If you have any questions or concerns about this Privacy Policy, please contact us at:

[Your Company Name]  
[Your Contact Information]  
[Email Address]  
[Phone Number (optional)]

`,
  },
  cookiesPolicy: {
    seo: {
      title: "Cookies Policy - Mobile App Landing Template",
      description: "Cookies Policy",
    },
    content: `# Cookies Policy

**Effective Date:** [Insert Date]

## Introduction

This Cookies Policy explains how [Your Company Name] ("we," "our," or "us") uses cookies and similar technologies to recognize you when you visit our app, [Your App Name] (the "App"). It explains what these technologies are and why we use them, as well as your rights to control their use.

## What Are Cookies?

Cookies are small data files that are placed on your device when you visit a website or use an app. Cookies are widely used by online service providers to facilitate and help to make the interaction between users and websites/apps faster and easier, as well as to provide reporting information.

### Types of Cookies We Use

We use the following types of cookies in our App:

1. **Strictly Necessary Cookies:**  
   These cookies are essential for you to use some of the features of our App. Without these cookies, some services cannot be provided.

2. **Performance and Analytics Cookies:**  
   These cookies collect information about how users interact with our App, including which pages are visited most often. We use this information to improve how our App works.

3. **Functionality Cookies:**  
   These cookies allow our App to remember choices you make when you use the App, such as remembering your login details or language preference.

4. **Targeting and Advertising Cookies:**  
   These cookies are used to deliver advertisements that are relevant to you. They also limit the number of times you see an ad and help measure the effectiveness of advertising campaigns.

### Cookies From Third Parties

In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the App and to deliver advertisements on and through the App.

## How We Use Cookies

We use cookies to:

- **Remember your login details and preferences.**
- **Analyze usage patterns and improve the functionality of our App.**
- **Deliver relevant content and advertisements.**
- **Understand your preferences based on previous or current App activity.**

## Your Choices Regarding Cookies

You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by adjusting the settings in your browser. Most browsers allow you to:

- **View what cookies are stored on your device and delete them individually.**
- **Block third-party cookies.**
- **Block cookies from particular websites.**
- **Block all cookies from being set.**
- **Delete all cookies when you close your browser.**

Please note that if you block or delete cookies, some features of the App may not function properly.

## Changes to This Cookies Policy

We may update this Cookies Policy from time to time. We will notify you of any changes by posting the new Cookies Policy on this page and updating the "Effective Date" above. Your continued use of the App after such changes signifies your acceptance of the revised Cookies Policy.

## Contact Us

If you have any questions or concerns about our use of cookies, please contact us at:

[Your Company Name]  
[Your Contact Information]  
[Email Address]  
[Phone Number (optional)]
`,
  },
  termsAndConditions: {
    seo: {
      title: "Terms and conditions - Mobile App Landing Template",
      description: "Terms and conditions",
    },
    content: `# Terms and Conditions

**Effective Date:** [Insert Date]

## Introduction

Welcome to [Your App Name] (the "App"). These Terms and Conditions ("Terms") govern your use of the App provided by [Your Company Name] ("we," "our," or "us"). By accessing or using our App, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the App.

## Use of the App

### 1. Eligibility
To use our App, you must be at least [Insert Age] years old and capable of entering into a legally binding agreement. By using the App, you represent and warrant that you meet these eligibility requirements.

### 2. User Accounts
- **Registration:** You may be required to create an account to access certain features of the App. You must provide accurate and complete information when creating your account.
- **Account Security:** You are responsible for maintaining the confidentiality of your account login details and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
- **Account Termination:** We reserve the right to terminate or suspend your account at any time, without notice, for any reason, including if we believe you have violated these Terms.

### 3. Prohibited Conduct
You agree not to:
- Use the App for any illegal or unauthorized purpose.
- Interfere with or disrupt the operation of the App or the servers or networks used to make the App available.
- Upload or transmit any viruses, malware, or other harmful code.
- Attempt to gain unauthorized access to any part of the App or to other accounts, systems, or networks connected to the App.

## Intellectual Property

### 1. Ownership
All content and materials available on the App, including but not limited to text, graphics, logos, and software, are the property of [Your Company Name] or its licensors and are protected by intellectual property laws.

### 2. License
We grant you a limited, non-exclusive, non-transferable license to access and use the App for your personal, non-commercial use. This license is subject to your compliance with these Terms.

### 3. Restrictions
You may not:
- Reproduce, distribute, modify, or create derivative works of any content or materials on the App without our prior written consent.
- Use any data mining, robots, or similar data gathering or extraction methods on the App.

## Disclaimers and Limitation of Liability

### 1. Disclaimers
The App is provided on an "as is" and "as available" basis. We make no warranties or representations about the accuracy or completeness of the content available on or through the App. We disclaim all warranties, whether express or implied, including any warranties of merchantability, fitness for a particular purpose, and non-infringement.

### 2. Limitation of Liability
To the fullest extent permitted by law, [Your Company Name] shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
- Your use or inability to use the App;
- Any unauthorized access to or use of our servers and/or any personal information stored therein;
- Any bugs, viruses, or other harmful code that may be transmitted to or through the App;
- Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content posted, emailed, transmitted, or otherwise made available through the App.

## Indemnification

You agree to indemnify, defend, and hold harmless [Your Company Name], its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the App or your violation of these Terms.

## Governing Law

These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in [Your Jurisdiction] to resolve any legal matter arising from these Terms.

## Changes to These Terms

We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Effective Date" above. Your continued use of the App after such changes signifies your acceptance of the revised Terms.

## Contact Us

If you have any questions or concerns about these Terms, please contact us at:

[Your Company Name]  
[Your Contact Information]  
[Email Address]  
[Phone Number (optional)]
`,
  },
};

export default templateConfig;
