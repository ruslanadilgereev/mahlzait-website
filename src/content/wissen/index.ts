// Wissen Article Metadata + Content Loader
// Artikel werden als Markdown in ./articles/ abgelegt

export interface ArticleSource {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  url?: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string; // ISO date
  updatedAt?: string; // ISO date
  readingTime: number; // minutes
  sources: ArticleSource[];
  featured?: boolean;
}

// Metadata für alle Artikel (ohne Body, für schnelle Übersicht)
export const articlesMeta: ArticleMeta[] = [
  {
    slug: "ernaehrungswissenschaft-grundlagen-erklaert",
    title: "Ernährungswissenschaft einfach erklärt: 13 Minuten für deine Gesundheit",
    description:
      "Eine wissenschaftlich fundierte Zusammenfassung der wichtigsten Ernährungs-Basics. Von Verdauung über Makros bis zu praktischen Tipps – ohne Bullshit.",
    tags: ["Ernährung", "Wissenschaft", "Grundlagen", "Gesundheit"],
    publishedAt: "2026-01-04",
    readingTime: 10,
    featured: true,
    sources: [
      {
        title: "ALL OF NUTRITION SCIENCE in 13 Minutes (No BS)",
        authors: "Dabby",
        journal: "YouTube",
        year: 2023,
        url: "https://www.youtube.com/watch?v=YDDjkxz2_1k",
      },
    ],
  },
  {
    slug: "gewichtsverlust-halten-wissenschaft",
    title: "Warum Gewicht halten so schwer ist - Was die Wissenschaft sagt",
    description:
      "Eine Analyse aktueller Forschung zu den Mechanismen hinter Weight-Loss Maintenance. Erfahre, warum der Körper sich gegen Abnehmen wehrt und was du dagegen tun kannst.",
    tags: ["Abnehmen", "Stoffwechsel", "Forschung", "Gewicht halten"],
    publishedAt: "2025-01-15",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title:
          "New insights in the mechanisms of weight-loss maintenance: Summary from a Pennington symposium",
        authors: "Flanagan EW, Spann R, Berry SE, et al.",
        journal: "Obesity (Silver Spring)",
        year: 2023,
        doi: "10.1002/oby.23905",
        pmid: "37794657",
      },
    ],
  },
  {
    slug: "zeitfenster-essen-ohne-kalorien-zaehlen",
    title: "Zeitfenster-Essen ohne Kalorien zaehlen: Was eine 12-Monats-Studie zeigt",
    description:
      "Randomisierte 12-Monats-Studie: 8h Time-Restricted Eating vs. taegliche Kalorienrestriktion vs. Kontrolle. Ergebnis: ~5% Gewichtsverlust – TRE nicht besser als Kalorienzaehlen.",
    tags: ["Abnehmen", "Intervallfasten", "Studie", "Kalorien"],
    publishedAt: "2025-12-22",
    readingTime: 7,
    sources: [
      {
        title:
          "Time-Restricted Eating Without Calorie Counting for Weight Loss in a Racially Diverse Population: A Randomized Controlled Trial",
        authors: "Lin S, Cienfuegos S, Ezpeleta M, et al.",
        journal: "Ann Intern Med",
        year: 2023,
        doi: "10.7326/M23-0052",
        pmid: "37364268",
      },
    ],
  },
  {
    slug: "protein-ballaststoffe-training-gewichtsmanagement-review",
    title: "Protein, Ballaststoffe & Training: 3 Hebel für Gewichtsmanagement (Review)",
    description:
      "Narrativer Review (2025): Warum mehr Protein, mehr Ballaststoffe und regelmaessige Bewegung beim Abnehmen und Gewicht halten helfen können – inkl. kardiometabolischer Effekte.",
    tags: ["Abnehmen", "Protein", "Ballaststoffe", "Bewegung", "Review"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Protein, fiber, and exercise: a narrative review of their roles in weight management and cardiometabolic health",
        authors: "Guarneiri L, et al.",
        journal: "Lipids in Health and Disease",
        year: 2025,
        doi: "10.1186/s12944-025-02659-7",
      },
    ],
  },
  {
    slug: "facebook-post-typen-abnehmen-engagement",
    title: "Facebook-Gruppe beim Abnehmen: Welche Post-Typen erzeugen Engagement?",
    description:
      "Studie (2014): Umfragen und interaktive Posts erzeugen mehr Engagement in Facebook-Supportgruppen – und Engagement war in der Erhaltungsphase mit Gewichtsverlust assoziiert.",
    tags: ["Abnehmen", "Social Media", "Verhalten", "Studie"],
    publishedAt: "2025-12-22",
    readingTime: 5,
    sources: [
      {
        title:
          "Varying social media post types differentially impacts engagement in a behavioral weight loss intervention",
        authors: "Hales S, et al.",
        journal: "Translational Behavioral Medicine",
        year: 2014,
        doi: "10.1007/s13142-014-0274-z",
      },
    ],
  },
  {
    slug: "kalorienzaehlen-apps-effektivitaet-studie",
    title: "Kalorienzaehlen-Apps: Wie gut sind sie wirklich? (Studie)",
    description:
      "Analyse + 8-Wochen-Studie (2019): Qualitaet und Effekt von Kalorienzaehlen-Apps. Viele Apps verfehlen Standards; kurzzeitig keine klaren Unterschiede in Anthropometrie.",
    tags: ["Kalorien", "Tracking", "App", "Studie"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Calorie counting smart phone apps: Effectiveness in nutritional awareness, lifestyle modification and weight management among young Indian adults",
        authors: "Banerjee P, et al.",
        journal: "Health Informatics Journal",
        year: 2019,
        doi: "10.1177/1460458219852531",
      },
    ],
  },
  {
    slug: "intervallfasten-strategien-netzwerk-meta-analyse",
    title: "Intervallfasten: Welche Strategie wirkt am besten? (BMJ Meta-Analyse)",
    description:
      "Netzwerk-Metaanalyse (BMJ, 2025) mit 99 RCTs: Intervallfasten vs. Kaloriendefizit vs. ad libitum. Kleine Unterschiede; ADF teils leicht besser als TRE.",
    tags: ["Intervallfasten", "Meta-Analyse", "Abnehmen", "Studie"],
    publishedAt: "2025-12-22",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title:
          "Intermittent fasting strategies and their effects on body weight and other cardiometabolic risk factors: systematic review and network meta-analysis of randomised clinical trials",
        authors: "Semnani-Azad Z, et al.",
        journal: "BMJ",
        year: 2025,
        doi: "10.1136/bmj-2024-082007",
      },
    ],
  },
  {
    slug: "protein-abnehmen-muskelmasse-aeltere-meta-analyse",
    title: "Mehr Protein beim Abnehmen (50+): weniger Muskelverlust? (Meta-Analyse)",
    description:
      "Systematische Übersicht/Meta-Analyse (2016): Bei aelteren Erwachsenen kann ein höherer Proteinanteil helfen, fettfreie Masse beim Abnehmen besser zu erhalten.",
    tags: ["Protein", "Abnehmen", "Meta-Analyse", "Muskel"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Effects of dietary protein intake on body composition changes after weight loss in older adults: a systematic review and meta-analysis",
        authors: "Kim JE, et al.",
        journal: "Nutrition Reviews",
        year: 2016,
        doi: "10.1093/nutrit/nuv065",
      },
    ],
  },
  {
    slug: "low-carb-vs-low-fat-meta-analyse",
    title: "Low-Carb vs. Low-Fat: Was ist besser zum Abnehmen? (Meta-Analyse)",
    description:
      "Meta-Analyse (2015) zu RCTs: Low-Carb (≤120 g/Tag) vs. Low-Fat (≤30% Fett). Praxis-Fazit: Adhaerenz und Kalorienbilanz sind meist der grössere Hebel.",
    tags: ["Abnehmen", "Kalorien", "Meta-Analyse", "Ernaehrung"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Dietary Intervention for Overweight and Obese Adults: Comparison of Low-Carbohydrate and Low-Fat Diets. A Meta-Analysis",
        authors: "Sackner-Bernstein J, et al.",
        journal: "PLOS ONE",
        year: 2015,
        doi: "10.1371/journal.pone.0139817",
      },
    ],
  },
  {
    slug: "ki-ernaehrungsanalyse-aus-fotos-review",
    title: "KI-Ernaehrungsanalyse per Foto: Wie genau ist das? (Review)",
    description:
      "Systematischer Review (Annals of Medicine, 2023): KI-basierte Ernaehrungsanalyse aus Essensfotos im Vergleich zu Menschen/Ground Truth. Ergebnis: stark variable Fehler – gut bei einfachen Foods, schwieriger bei komplexen Gerichten.",
    tags: ["KI", "Tracking", "Ernaehrung", "Review"],
    publishedAt: "2025-12-22",
    readingTime: 7,
    sources: [
      {
        title:
          "AI-based digital image dietary assessment methods compared to humans and ground truth: a systematic review",
        authors: "Shonkoff E, et al.",
        journal: "Annals of Medicine",
        year: 2023,
        doi: "10.1080/07853890.2023.2273497",
      },
    ],
  },
  {
    slug: "schnell-vs-langsam-abnehmen-studie",
    title: "Schnell vs. langsam abnehmen: was ist besser? (Studie)",
    description:
      "Randomisierte Studie (2017): 5% Gewichtsverlust in 5 Wochen vs 15 Wochen. Beide verbessern Werte; langsam kann Körperzusammensetzung begünstigen, schnell zeigte teils staerkere metabolische Effekte.",
    tags: ["Abnehmen", "Studie", "Körperzusammensetzung", "Stoffwechsel"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Rapid Weight Loss vs. Slow Weight Loss: Which is More Effective on Body Composition and Metabolic Risk Factors?",
        authors: "Ashtary-Larky D, et al.",
        journal: "International Journal of Endocrinology and Metabolism",
        year: 2017,
        doi: "10.5812/ijem.13249",
      },
    ],
  },
  {
    slug: "schlaf-verlaengern-weniger-kalorien-rct",
    title: "Mehr Schlaf, weniger Kalorien: Sleep-Extension RCT",
    description:
      "Randomisierte Studie (JAMA Intern Med, 2022): Schlafdaür +~1.2 h/Nacht durch Schlafhygiene-Coaching; Energieaufnahme −270 kcal/Tag vs Kontrolle – ohne Diaetvorgaben.",
    tags: ["Schlaf", "Abnehmen", "Studie", "Kalorien"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Effect of Sleep Extension on Objectively Assessed Energy Intake Among Adults With Overweight in Real-life Settings",
        authors: "Tasali E, et al.",
        journal: "JAMA Internal Medicine",
        year: 2022,
        doi: "10.1001/jamainternmed.2021.8098",
      },
    ],
  },
  {
    slug: "aerobes-training-abnehmen-dosis-wirkung-meta-analyse",
    title: "Ausdaürtraining zum Abnehmen: Dosis-Wirkung (Meta-Analyse)",
    description:
      "Dose-Response Meta-Analyse (2024) mit 116 RCTs: pro +30 Min/Woche aerobes Training −0.52 kg Gewicht und −0.56 cm Taille im Mittel. 150 Min/Woche als sinnvoller Zielwert.",
    tags: ["Training", "Abnehmen", "Meta-Analyse", "Bewegung"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title: "Aerobic Exercise and Weight Loss in Adults",
        authors: "Jayedi A, et al.",
        journal: "JAMA Network Open",
        year: 2024,
        doi: "10.1001/jamanetworkopen.2024.52185",
      },
    ],
  },
  {
    slug: "digitales-abnehmprogramm-12-monate-csiro-studie",
    title: "Digitales Abnehmprogramm: 12 Monate Daten (24.000+ Nutzer)",
    description:
      "Kohorten-Auswertung (JMIR, 2025) eines kommerziellen Programms: 24.035 Mitglieder, nach 12 Monaten ~5.5 kg (imputation) im Mittel; 52% erreichen ≥5% Gewichtsverlust. Engagement korreliert mit Erfolg.",
    tags: ["Abnehmen", "App", "Tracking", "Studie"],
    publishedAt: "2025-12-22",
    readingTime: 7,
    sources: [
      {
        title:
          "Weight Loss Patterns and Outcomes Over 12 Months on a Commercial Weight Management Program (CSIRO Total Wellbeing Diet Online): Large-Community Cohort Evaluation Study",
        authors: "Hendrie G, et al.",
        journal: "Journal of Medical Internet Research",
        year: 2025,
        doi: "10.2196/65122",
      },
    ],
  },
  {
    slug: "high-protein-diet-abnehmen-mechanismen-uebersicht",
    title: "High-Protein Diet: Mechanismen & Evidenz für Gewichtsverlust",
    description:
      "Übersicht (2020): Proteinreiche Ernaehrung kann Abnehmen unterstützen (Sattigungshormone, DIT) und fettfreie Masse eher erhalten. Laengere Trials (6–12 Monate) berichten auch weniger Regain.",
    tags: ["Protein", "Abnehmen", "Ernaehrung", "Review"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title: "Clinical Evidence and Mechanisms of High-Protein Diet-Induced Weight Loss",
        authors: "Moon J, et al.",
        journal: "Journal of Obesity & Metabolic Syndrome",
        year: 2020,
        doi: "10.7570/jomes20028",
      },
    ],
  },
  {
    slug: "vereinfachtes-tracking-vs-kalorienzaehlen-studie",
    title: "Tracking ohne Kalorienzaehlen: Vereinfachtes Monitoring (Studie)",
    description:
      "Pilot-RCT (Obesity, 2022): Simplified Tracking (High-Calorie Foods) vs Standard-Kalorientracking in einer mobilen Intervention. Nach 6 Monaten aehnliche, klinisch relevante Gewichtsverluste.",
    tags: ["Tracking", "Kalorien", "Abnehmen", "Studie", "App"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "A pilot randomized trial of simplified versus standard calorie dietary self‐monitoring in a mobile weight loss intervention",
        authors: "Nezami B, et al.",
        journal: "Obesity",
        year: 2022,
        doi: "10.1002/oby.23377",
      },
    ],
  },
  {
    slug: "calerie-studie-design-25-prozent-kalorienrestriktion",
    title: "CALERIE: 25% Kalorienrestriktion über 2 Jahre (Design & Methoden)",
    description:
      "Design-&-Methods Paper (2011): Multi-Center RCT mit 220 nicht-adipösen Erwachsenen (BMI 22–<28), 2 Jahre 25% Kalorienrestriktion. Fokus: Interventions-Mechanik (Training, Tools, Feedback, Toolbox).",
    tags: ["Kalorien", "Studie", "Verhalten", "Ernaehrung"],
    publishedAt: "2025-12-22",
    readingTime: 7,
    sources: [
      {
        title: "The CALERIE Study: Design and methods of an innovative 25% caloric restriction intervention",
        authors: "Rickman A, et al.",
        journal: "Contemporary Clinical Trials",
        year: 2011,
        doi: "10.1016/j.cct.2011.07.002",
      },
    ],
  },
  {
    slug: "chronotyp-schlafqualitaet-gewichthalten-studie",
    title: "Gewicht halten: Morgen-Typ und besserer Schlaf? (Studie)",
    description:
      "Vergleichsstudie (2015): Erfolgreiche Gewicht-Halter (NWCR, n=690) waren haeufiger Morgen-Typen und berichteten bessere Schlafqualitaet als Teilnehmende klassischer Abnehm-Interventionen.",
    tags: ["Gewicht halten", "Schlaf", "Studie", "Verhalten"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Successful weight loss maintenance associated with morning chronotype and better sleep quality",
        authors: "Ross K, et al.",
        journal: "Journal of Behavioral Medicine",
        year: 2015,
        doi: "10.1007/s10865-015-9704-8",
      },
    ],
  },
  {
    slug: "gewichthalten-health-tracking-apps-nwcr",
    title: "Gewicht halten: Warum Tracking-Apps so haeufig sind (NWCR)",
    description:
      "Studie (2017): NWCR-Gewicht-Halter nutzen Self-Monitoring-Technologie und Smartphone-Tracking-Apps haeufiger als eine nationale Vergleichsstichprobe. Tracking wirkt als Routine- und Feedback-System.",
    tags: ["Gewicht halten", "Tracking", "App", "Studie"],
    publishedAt: "2025-12-22",
    readingTime: 6,
    sources: [
      {
        title:
          "Successful weight loss maintainers use health-tracking smartphone applications more than a nationally representative sample: comparison of the National Weight Control Registry to Pew Tracking for Health",
        authors: "Goldstein C, et al.",
        journal: "Obesity Science & Practice",
        year: 2017,
        doi: "10.1002/osp4.102",
      },
    ],
  },
  {
    slug: "app-self-monitoring-adhaerenz-gewichtsverlust",
    title: "Tracking in Apps: Konsistenz schlaegt Perfektion (Studie)",
    description:
      "Studie (2021): Bei App-basiertem Ernaehrungs-Tracking waren Konsistenz und Freqünz mit Gewichtsverlust assoziiert – Vollstaendigkeit weniger. Praxis: lieber regelmaessig loggen als perfekt.",
    tags: ["Tracking", "App", "Abnehmen", "Studie"],
    publishedAt: "2025-12-22",
    readingTime: 5,
    sources: [
      {
        title: "Adherence to mobile‐app‐based dietary self‐monitoring—Impact on weight loss in adults",
        authors: "Payne J, et al.",
        journal: "Obesity Science & Practice",
        year: 2021,
        doi: "10.1002/osp4.566",
      },
    ],
  },
  {
    slug: "gewichtsverlust-halten-10-jahre-nwcr",
    title: "Gewichtsverlust halten: 10 Jahre Daten aus dem NWCR",
    description:
      "10-Jahres-Auswertung (2014) im National Weight Control Registry: durchschnittlich ~23 kg Gewichtsverlust nach 10 Jahren; >87% halten ≥10% Gewichtsverlust. Routinen und Self-Monitoring sind zentrale Marker.",
    tags: ["Gewicht halten", "Abnehmen", "Studie", "Langzeit"],
    publishedAt: "2025-12-22",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title: "Weight-Loss Maintenance for 10 Years in the National Weight Control Registry",
        authors: "Thomas J, et al.",
        journal: "American Journal of Preventive Medicine",
        year: 2014,
        doi: "10.1016/j.amepre.2013.08.019",
      },
    ],
  },
  {
    slug: "fitness-mythen-faktencheck",
    title: "Fitness-Mythen im Faktencheck: 10 Cardio-Mythen, die sich hartnäckig halten",
    description:
      "Evidenzbasierter Faktencheck zu 10 verbreiteten Cardio-/Fitness-Mythen: Gehen, Schweiss, 10.000 Schritte, Zone 2, Wearables und \"Cardio killt Gains\" – mit Studien und Mechanismen.",
    tags: ["Training", "Fitness", "Cardio", "Mythen"],
    publishedAt: "2025-12-26",
    readingTime: 10,
    sources: [
      {
        title: "Beyond epidemiology: field studies and the physiology laboratory as the whole world",
        authors: "Nose H, et al.",
        journal: "The Journal of Physiology",
        year: 2009,
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2805369/",
      },
      {
        title:
          "High-Intensity Walking Time Is a Key Determinant to Increase Physical Fitness and Improve Health Outcomes After Interval Walking Training in Middle-Aged and Older People",
        authors: "Masuki S, et al.",
        journal: "Mayo Clinic Proceedings",
        year: 2019,
        pmid: "31477320",
      },
      {
        title:
          "Effects of high-intensity interval walking training on physical fitness and blood pressure in middle-aged and older people",
        authors: "Nemoto K, et al.",
        journal: "Mayo Clinic Proceedings",
        year: 2007,
        pmid: "17605959",
      },
      {
        title: "Health benefits of interval walking training",
        authors: "Karstoft K, et al.",
        journal: "Applied Physiology, Nutrition, and Metabolism",
        year: 2024,
        doi: "10.1139/apnm-2023-0595",
      },
      {
        title:
          "Accuracy of Heart Rate and Energy Expenditure Estimations of Wrist-Worn and Arm-Worn Apple Watches",
        authors: "Falter M, et al.",
        journal: "Journal for the Measurement of Physical Behaviour",
        year: 2019,
        doi: "10.1123/jmpb.2018-0037",
      },
      {
        title:
          "Accuracy of the Apple Watch Series 9 for Measures of Energy Expenditure and Heart Rate at Rest and During Exercise: Impact of Skin Pigmentation",
        authors: "Etiwy M, et al.",
        journal: "Sports",
        year: 2024,
        pmid: "39728259",
      },
      {
        title: "Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts",
        authors: "Paluch AE, et al.",
        journal: "The Lancet Public Health",
        year: 2022,
        pmid: "35247352",
      },
      {
        title: "Daily steps and all-cause mortality: An umbrella review and meta-analysis",
        authors: "Kazemi A, et al.",
        journal: "Journal of Cachexia, Sarcopenia and Muscle",
        year: 2024,
        doi: "10.1002/jcsm.13525",
      },
      {
        title:
          "Daily steps and health outcomes in adults: a systematic review and dose-response meta-analysis",
        authors: "Banach M, et al.",
        journal: "European Journal of Preventive Cardiology",
        year: 2024,
        pmid: "40713949",
      },
      {
        title: "Brief Intense Stair Climbing Improves Cardiorespiratory Fitness",
        authors: "Allison MK, et al.",
        journal: "Medicine & Science in Sports & Exercise",
        year: 2017,
        pmid: "28009784",
      },
      {
        title:
          "Aerobic exercise does not compromise muscle hypertrophy response to short-term resistance training",
        authors: "Lundberg TR, et al.",
        journal: "Journal of Applied Physiology",
        year: 2013,
        doi: "10.1152/japplphysiol.01013.2012",
      },
    ],
  },
];

// Helper: Alle Artikel-Slugs (für getStaticPaths)
export function getAllSlugs(): string[] {
  return articlesMeta.map((a) => a.slug);
}

// Helper: Artikel-Meta per Slug
export function getArticleMeta(slug: string): ArticleMeta | undefined {
  return articlesMeta.find((a) => a.slug === slug);
}

// Helper: Featured Artikel
export function getFeaturedArticles(): ArticleMeta[] {
  return articlesMeta.filter((a) => a.featured);
}

// Helper: Artikel nach Tag filtern
export function getArticlesByTag(tag: string): ArticleMeta[] {
  return articlesMeta.filter((a) =>
    a.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

// Helper: Alle einzigartigen Tags
export function getAllTags(): string[] {
  const tags = new Set<string>();
  articlesMeta.forEach((a) => a.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

// Helper: Artikel-Content laden (async, für Detailseite)
// Nutzt import.meta.glob um Markdown-Dateien zu laden
const articleModules = import.meta.glob<{ default: string }>(
  "./articles/*.md",
  {
    query: "?raw",
    eager: false,
  }
);

export async function getArticleContent(slug: string): Promise<string | null> {
  const path = `./articles/${slug}.md`;
  const loader = articleModules[path];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}

