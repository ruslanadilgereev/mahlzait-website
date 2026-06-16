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

export interface ArticleReviewer {
  /** Full name, e.g. "Dr. med. Anna Muster" */
  name: string;
  /** Professional title/credentials, e.g. "Ernährungsmedizinerin (DAEM/DGEM)" */
  credentials: string;
  /** Optional profile URL (LinkedIn, clinic page, etc.) */
  url?: string;
  /** ISO date of last review */
  reviewedAt: string;
}

export interface ArticleFaq {
  question: string;
  answer: string;
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
  /** Optional medical/nutrition expert review (E-E-A-T) */
  reviewer?: ArticleReviewer;
  /** Related calculator slugs (e.g. ["kalorienbedarf-berechnen"]) */
  relatedCalculators?: string[];
  /** Optional TL;DR block rendered directly beneath the H1 (50–80 words, AI-quotable). */
  kernaussage?: string;
  /** Optional FAQ section rendered at the end of the article (triggers FAQPage schema). */
  faqs?: ArticleFaq[];
}

// Metadata für alle Artikel (ohne Body, für schnelle Übersicht)
export const articlesMeta: ArticleMeta[] = [
  {
    slug: "keto-diaet-abnehmen-wissenschaft",
    title: "Keto-Diät: Was sagt die Wissenschaft wirklich?",
    description:
      "Keto-Diät im Faktencheck 2026: Meta-Analysen zeigen 1–2 kg Vorsprung kurzfristig, nach 12 Monaten kein Unterschied zu Low-Fat. LDL steigt bei klassischer Keto. Für wen sie passt und für wen nicht.",
    tags: [
      "Keto",
      "Low-Carb",
      "Abnehmen",
      "Makros",
      "Kohlenhydrate",
      "Ernährung",
      "Meta-Analyse",
    ],
    relatedCalculators: [
      "makros-berechnen",
      "kalorienbedarf-berechnen",
      "kaloriendefizit-berechnen",
    ],
    publishedAt: "2026-04-14",
    readingTime: 12,
    featured: true,
    sources: [
      {
        title:
          "Effect of Low-Fat Diet Interventions Versus Other Diet Interventions on Long-Term Weight Change in Adults: A Systematic Review and Meta-Analysis",
        authors: "Tobias DK, Chen M, Manson JE, Ludwig DS, Willett W, Hu FB",
        journal: "The Lancet Diabetes & Endocrinology",
        year: 2015,
        doi: "10.1016/S2213-8587(15)00367-8",
        pmid: "26527511",
      },
      {
        title:
          "Effect of Low-Fat vs Low-Carbohydrate Diet on 12-Month Weight Loss in Overweight Adults and the Association With Genotype Pattern or Insulin Secretion: The DIETFITS Randomized Clinical Trial",
        authors:
          "Gardner CD, Trepanowski JF, Del Gobbo LC, Hauser ME, Rigdon J, Ioannidis JPA, Desai M, King AC",
        journal: "JAMA",
        year: 2018,
        doi: "10.1001/jama.2018.0245",
        pmid: "29466592",
      },
      {
        title:
          "Dietary Intervention for Overweight and Obese Adults: Comparison of Low-Carbohydrate and Low-Fat Diets. A Meta-Analysis",
        authors: "Sackner-Bernstein J, Kanter D, Kaul S",
        journal: "PLOS ONE",
        year: 2015,
        doi: "10.1371/journal.pone.0139817",
      },
      {
        title:
          "Comparison of Weight Loss Among Named Diet Programs in Overweight and Obese Adults: A Meta-Analysis",
        authors: "Johnston BC, Kanters S, Bandayrel K, et al.",
        journal: "JAMA",
        year: 2014,
        doi: "10.1001/jama.2014.10397",
      },
      {
        title:
          "Calorie for Calorie, Dietary Fat Restriction Results in More Body Fat Loss than Carbohydrate Restriction in People with Obesity",
        authors:
          "Hall KD, Bemis T, Brychta R, Chen KY, Courville A, Crayner EJ, et al.",
        journal: "Cell Metabolism",
        year: 2015,
        doi: "10.1016/j.cmet.2015.07.021",
        pmid: "26278052",
      },
      {
        title: "The Ketogenic Diet for the Treatment of Childhood Epilepsy: A Review",
        authors: "Kossoff EH, Zupec-Kania BA, Amark PE, et al.",
        journal: "New England Journal of Medicine / Epilepsia",
        year: 2018,
        url: "https://www.nejm.org/doi/full/10.1056/NEJMra1600501",
      },
    ],
    kernaussage:
      "Meta-Analysen zeigen: Low-Carb und Keto bringen kurzfristig 1–2 kg mehr Gewichtsverlust als Low-Fat, doch nach 12 Monaten ist der Vorsprung verschwunden. Bei gleichem Kaloriendefizit führen beide Ansätze zu vergleichbaren Resultaten. Das LDL-Cholesterin kann bei klassischer Keto mit viel gesättigtem Fett signifikant steigen. Für Epilepsie medizinisch etabliert, fürs Abnehmen kein Wunder.",
    faqs: [
      {
        question: "Was ist eine ketogene Diät genau?",
        answer:
          "Eine Ernährungsform mit unter 50 g Kohlenhydraten pro Tag, bei der der Körper in den Zustand der Ketose wechselt und Fett statt Glucose als primäre Energiequelle nutzt. Typische Makroverteilung: 70–80 % Fett, 15–20 % Protein, 5–10 % Kohlenhydrate.",
      },
      {
        question: "Wie schnell nimmt man mit Keto ab?",
        answer:
          "In den ersten 1–2 Wochen oft 2–4 kg, primär durch Wasserverlust (1 g Glykogen bindet etwa 3 g Wasser). Danach 0,5–1 kg pro Woche bei ausreichendem Kaloriendefizit. Die schnelle Anfangsreduktion ist kein Fettverlust.",
      },
      {
        question: "Ist Keto wirklich besser als eine normale Diät?",
        answer:
          "Meta-Analysen (Tobias 2015, DIETFITS 2018, JAMA 2014) zeigen: Nach 12 Monaten keine signifikanten Unterschiede zu Low-Fat oder mediterraner Kost. Entscheidend ist das Kaloriendefizit, nicht die Makroverteilung. Kurzfristig hat Low-Carb einen Vorsprung, langfristig gleicht er sich aus.",
      },
      {
        question: "Welche Nebenwirkungen hat eine Keto-Diät?",
        answer:
          "Häufig in den ersten 1–2 Wochen: „Keto-Grippe\" mit Kopfschmerzen, Müdigkeit und Reizbarkeit. Langfristig möglich: LDL-Anstieg bei viel gesättigtem Fett, Mikronährstoffmangel, Verdauungsprobleme durch wenig Ballaststoffe sowie Nierenbelastung bei sehr proteinreicher Variante.",
      },
      {
        question: "Für wen ist Keto geeignet – und für wen nicht?",
        answer:
          "Medizinisch etabliert bei therapieresistenter Epilepsie (Kossoff 2018). Zum Abnehmen eine Option für Menschen, die Kohlenhydrate ohne Hunger reduzieren können. Nicht geeignet bei Typ-1-Diabetes, Schwangerschaft, Stillzeit, Essstörungen oder bekannter familiärer Fettstoffwechselstörung.",
      },
      {
        question: "Was darf man bei einer Keto-Diät essen?",
        answer:
          "Erlaubt: Fleisch, Fisch, Eier, Käse, Nüsse, Avocados, nicht-stärkehaltiges Gemüse, hochwertige Öle. Vermeiden: Brot, Reis, Nudeln, Zucker, zuckerhaltige Früchte, stärkehaltiges Gemüse (Kartoffeln) und die meisten Hülsenfrüchte.",
      },
    ],
  },
  {
    slug: "ernaehrungsplan-erstellen-anleitung",
    title: "Ernährungsplan erstellen: Schritt-für-Schritt Anleitung 2026",
    description:
      "Ernährungsplan selber erstellen in 7 Schritten: Kalorienbedarf berechnen, Makros aufteilen, Mahlzeiten planen. Mit 3 Beispiel-Tagesplänen, Einkaufslisten und kostenlosen Rechnern.",
    tags: ["Ernährungsplan", "Abnehmen", "Muskelaufbau", "Meal Prep", "Anleitung", "Makros", "Kalorienbedarf"],
    relatedCalculators: ["essensplan-erstellen", "kalorienbedarf-berechnen", "makros-berechnen"],
    publishedAt: "2026-03-02",
    readingTime: 22,
    featured: true,
    sources: [
      {
        title: "Meal planning is associated with food variety, diet quality and body weight status in a large sample of French adults",
        authors: "Ducrot P, Méjean C, Aroumougame V, et al.",
        journal: "International Journal of Behavioral Nutrition and Physical Activity",
        year: 2017,
        doi: "10.1186/s12966-017-0461-7",
      },
      {
        title: "Dietary Protein and Muscle Mass: Translating Science to Application and Health Benefit",
        authors: "Carbone JW, Pasiakos SM",
        journal: "Nutrients",
        year: 2019,
        doi: "10.3390/nu11051136",
      },
      {
        title: "Comparison of Weight Loss Among Named Diet Programs in Overweight and Obese Adults: A Meta-Analysis",
        authors: "Johnston BC, Kanters S, Bandayrel K, et al.",
        journal: "JAMA",
        year: 2014,
        doi: "10.1001/jama.2014.10397",
      },
      {
        title: "A satiety index of common foods",
        authors: "Holt SH, Miller JC, Petocz P, Farmakalidis E",
        journal: "European Journal of Clinical Nutrition",
        year: 1995,
        pmid: "7498104",
      },
    ],
  },
  {
    slug: "intervallfasten-16-8-anleitung-anfaenger",
    title: "Intervallfasten 16:8 für Anfänger: Der ultimative Guide 2026",
    description:
      "Komplett-Anleitung für Intervallfasten 16:8: 7-Tage-Starterplan, Rezeptideen, Getränke-Liste, Schichtarbeit-Tipps und wissenschaftliche Fakten. Perfekt zur Fastenzeit ab 5. März.",
    tags: ["Intervallfasten", "Abnehmen", "16:8", "Anfänger", "Fastenzeit", "Anleitung", "Plan"],
    relatedCalculators: ["intervallfasten-rechner", "kalorienbedarf-berechnen"],
    publishedAt: "2026-02-22",
    updatedAt: "2026-02-28",
    readingTime: 18,
    featured: true,
    sources: [
      {
        title: "Intermittent fasting strategies and their effects on body weight and other cardiometabolic risk factors: systematic review and network meta-analysis of randomised clinical trials",
        authors: "Semnani-Azad Z, et al.",
        journal: "BMJ",
        year: 2025,
        doi: "10.1136/bmj-2024-082007",
      },
      {
        title: "Late isocaloric eating increases hunger, decreases energy expenditure, and modifies metabolic pathways in adults with overweight and obesity",
        authors: "Vujović N, Piron MJ, Qian J, et al.",
        journal: "Cell Metabolism",
        year: 2022,
        doi: "10.1016/j.cmet.2022.09.007",
        pmid: "36198293",
      },
      {
        title: "Effects of Intermittent Fasting on Health, Aging, and Disease",
        authors: "de Cabo R, Mattson MP",
        journal: "New England Journal of Medicine",
        year: 2019,
        doi: "10.1056/NEJMra1905136",
      },
      {
        title: "Metabolic Effects of Intermittent Fasting",
        authors: "Patterson RE, Sears DD",
        journal: "Annual Review of Nutrition",
        year: 2017,
        doi: "10.1146/annurev-nutr-071816-064634",
      },
      {
        title: "Interview mit PD Dr. Dorothea Kesztyüs, Institut für Allgemeinmedizin, Universitätsklinikum Ulm",
        authors: "Universitätsklinikum Ulm",
        journal: "uniklinik-ulm.de",
        year: 2026,
        url: "https://www.uniklinik-ulm.de/aktuelles/detailansicht/16-stunden-ohne-essen-wie-geht-intervallfasten.html",
      },
    ],
    kernaussage:
      "Beim 16:8-Intervallfasten isst du nur in einem 8-Stunden-Fenster pro Tag. Meta-Analysen zeigen moderate Gewichtsverluste von 3–5 kg in 8–12 Wochen – primär durch das automatisch entstehende Kaloriendefizit. Kein magischer Stoffwechsel-Boost, aber einfach umzusetzen und alltagstauglich. Nicht geeignet bei Schwangerschaft, Essstörungen oder Typ-1-Diabetes. Die beste Methode ist die, die du langfristig durchhältst.",
    faqs: [
      {
        question: "Was darf ich beim 16:8-Intervallfasten trinken?",
        answer:
          "Während der Fastenphase: Wasser, ungesüßter Tee, schwarzer Kaffee und Mineralwasser. Nicht erlaubt: Milch im Kaffee, Säfte, Smoothies oder alles mit Kalorien, da bereits geringe Mengen die Insulin-Antwort auslösen und den Fasten-Effekt unterbrechen.",
      },
      {
        question: "Ab wann zeigt Intervallfasten Erfolge?",
        answer:
          "Erste Gewichtsveränderungen meist nach 2–4 Wochen. Meta-Analysen (BMJ 2025, Cell Metabolism 2022) zeigen 3–5 kg Verlust in 8–12 Wochen, vorausgesetzt das Essfenster bleibt in einem moderaten Kaloriendefizit. Ohne Defizit passiert auch beim Fasten nichts.",
      },
      {
        question: "Darf ich während der 8 Stunden alles essen?",
        answer:
          "Mengenmäßig ja, aber nicht unbegrenzt. Wer im Essfenster die gleiche oder mehr Kalorien als vorher zu sich nimmt, wird nicht abnehmen. Qualität (Protein, Ballaststoffe, Gemüse) bleibt entscheidend – Intervallfasten ersetzt keine ausgewogene Ernährung.",
      },
      {
        question: "Welches Essfenster ist am besten?",
        answer:
          "Studien zeigen keinen klaren Vorteil eines spezifischen Fensters. Am besten ist das, was zu deinem Alltag passt. Beliebt: 12–20 Uhr (klassisch), 10–18 Uhr (frühes Essfenster, TRE-Studien leicht vorteilhaft) oder 13–21 Uhr (Frühstück auslassen).",
      },
      {
        question: "Verlangsamt Intervallfasten den Stoffwechsel?",
        answer:
          "Kurzzeitfasten (16–24 Std) erhöht den Stoffwechsel sogar leicht – Studien zeigen +3–4 % Umsatz durch Noradrenalin-Anstieg. Erst bei mehrtägigem Fasten oder drastischen Kaloriendefiziten passt sich der Grundumsatz nach unten an.",
      },
      {
        question: "Für wen ist Intervallfasten nicht geeignet?",
        answer:
          "Schwangere, Stillende, Kinder und Jugendliche, Menschen mit Essstörungen, Typ-1-Diabetiker und Menschen mit niedrigem BMI. Bei Medikamenten, die zum Essen eingenommen werden müssen, vorher ärztlich abklären.",
      },
    ],
  },
  {
    slug: "abnehmspritze-ozempic-wegovy-wirkung",
    title: "Abnehmspritze: Ozempic, Wegovy & Co. – Was du wissen musst",
    description:
      "Die Abnehmspritze im Faktencheck: 15% Gewichtsverlust klingt super – aber was sind die Nebenwirkungen, Kosten und Langzeitrisiken? Wissenschaft vs. TikTok-Hype.",
    tags: ["Abnehmen", "Abnehmspritze", "Ozempic", "Wegovy", "Medikamente"],
    relatedCalculators: ["kaloriendefizit-berechnen", "bmi-rechner"],
    publishedAt: "2026-02-21",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title: "Semaglutide for the treatment of overweight and obesity: A review",
        authors: "Wilding JPH, Batterham RL, et al.",
        journal: "PMC / Obesity Reviews",
        year: 2023,
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10092086/",
      },
      {
        title: "Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)",
        authors: "Wilding JPH, Batterham RL, Calanna S, et al.",
        journal: "New England Journal of Medicine",
        year: 2021,
        doi: "10.1056/NEJMoa2032183",
        pmid: "33567185",
        url: "https://pubmed.ncbi.nlm.nih.gov/33567185/",
      },
      {
        title: "Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes (SELECT)",
        authors: "Lincoff AM, Brown-Frandsen K, Colhoun HM, et al.",
        journal: "New England Journal of Medicine",
        year: 2023,
        doi: "10.1056/NEJMoa2307563",
        pmid: "37952131",
        url: "https://pubmed.ncbi.nlm.nih.gov/37952131/",
      },
      {
        title: "Weight regain and cardiometabolic effects after withdrawal of semaglutide (STEP 1 extension)",
        authors: "Wilding JPH, Batterham RL, Davies M, et al.",
        journal: "Diabetes, Obesity and Metabolism",
        year: 2022,
        doi: "10.1111/dom.14725",
        pmid: "35441470",
        url: "https://pubmed.ncbi.nlm.nih.gov/35441470/",
      },
      {
        title: "Abnehmspritzen: Kosten, Wirkung und Nebenwirkungen",
        authors: "Apotheken Umschau",
        journal: "apotheken-umschau.de",
        year: 2025,
        url: "https://www.apotheken-umschau.de/gesund-bleiben/abnehmen/abnehmspritzen-wie-sie-wirken-und-wem-sie-helfen-koennen-1334365.html",
      },
    ],
    kernaussage:
      "Semaglutid-Präparate wie Ozempic und Wegovy führen laut STEP-1-Studie (NEJM 2021) zu durchschnittlich 14,9 % Gewichtsverlust nach 68 Wochen – deutlich mehr als jede Diät allein. Der Preis: 170–330 € monatlich, häufige Nebenwirkungen wie Übelkeit und Verstopfung, und nach Absetzen wandern laut STEP-1-Extension rund zwei Drittel des verlorenen Gewichts zurück. Für Adipositas (BMI ≥ 30) medizinisch sinnvoll, kein Lifestyle-Medikament.",
    faqs: [
      {
        question: "Wie funktioniert die Abnehmspritze?",
        answer:
          "Semaglutid imitiert das körpereigene Hormon GLP-1, verlangsamt die Magenentleerung und wirkt direkt auf das Sättigungszentrum im Gehirn. Ergebnis: stärkeres Sättigungsgefühl, weniger Hunger, kleinere Portionen ohne bewusste Anstrengung.",
      },
      {
        question: "Wie viel kann man mit Wegovy abnehmen?",
        answer:
          "Die STEP-1-Studie (Wilding et al. 2021, NEJM) zeigte 14,9 % Körpergewicht-Verlust in 68 Wochen gegenüber 2,4 % bei Placebo. Das sind bei 100 kg Ausgangsgewicht rund 15 kg – in Kombination mit Ernährungsumstellung und Bewegung.",
      },
      {
        question: "Was sind die häufigsten Nebenwirkungen?",
        answer:
          "Häufig (≥ 10 %): Übelkeit, Durchfall, Verstopfung, Erbrechen, Bauchschmerzen – meist dosisabhängig in den ersten Wochen. Selten: Gallensteine, Pankreatitis. Kontraindikation bei medullärem Schilddrüsenkarzinom in der Familienanamnese.",
      },
      {
        question: "Was kostet die Abnehmspritze in Deutschland?",
        answer:
          "Wegovy kostet als Selbstzahler-Leistung 170–330 € pro Monat je nach Dosis. Gesetzliche Krankenkassen übernehmen die Kosten in der Regel nicht (Lifestyle-Arzneimittel-Ausschluss §34 SGB V). Private Kassen nur in Einzelfällen bei klarer medizinischer Indikation.",
      },
      {
        question: "Nimmt man wieder zu, wenn man Wegovy absetzt?",
        answer:
          "Ja. Die STEP-1-Extension (Wilding 2022) zeigte: Nach einem Jahr ohne Medikament waren zwei Drittel des verlorenen Gewichts zurück. Die Abnehmspritze ist als Langzeit-Therapie konzipiert, nicht als Kurzzeit-Booster.",
      },
      {
        question: "Für wen ist Wegovy zugelassen?",
        answer:
          "In Deutschland für Erwachsene mit BMI ≥ 30 oder BMI ≥ 27 plus mindestens einer gewichtsbedingten Begleiterkrankung (Typ-2-Diabetes, Bluthochdruck, Schlafapnoe). Zulassung immer nur in Kombination mit Ernährungsumstellung und Bewegung.",
      },
    ],
  },
  {
    slug: "fett-macht-fett-mythos-abnehmen",
    title: "Fett macht fett: Stimmt der Abnehm-Mythos wirklich?",
    description:
      "Der Mythos aus den 80ern im Faktencheck: Meta-Analysen zeigen, dass Low-Fat-Diäten nicht besser funktionieren. Warum gute Fette beim Abnehmen sogar helfen können.",
    tags: ["Abnehmen", "Mythen", "Fett", "Ernährung", "Low-Fat"],
    relatedCalculators: ["makros-berechnen", "kaloriendefizit-berechnen"],
    publishedAt: "2026-02-20",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title:
          "Dietary Intervention for Overweight and Obese Adults: Comparison of Low-Carbohydrate and Low-Fat Diets. A Meta-Analysis",
        authors: "Sackner-Bernstein J, Kanter D, Kaul S",
        journal: "PLOS ONE",
        year: 2015,
        doi: "10.1371/journal.pone.0139817",
        url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0139817",
      },
      {
        title:
          "Effect of Low-Fat Diet Interventions Versus Other Diet Interventions on Long-Term Weight Change in Adults: A Systematic Review and Meta-Analysis",
        authors: "Tobias DK, Chen M, Manson JE, et al.",
        journal: "The Lancet Diabetes & Endocrinology",
        year: 2015,
        doi: "10.1016/S2213-8587(15)00367-8",
        pmid: "26527511",
        url: "https://pubmed.ncbi.nlm.nih.gov/26527511/",
      },
      {
        title:
          "Dietary fat and carbohydrate intake and cardiovascular disease: a narrative review",
        authors: "Ludwig DS, Willett WC, Volek JS, Neuhouser ML",
        journal: "Internal and Emergency Medicine",
        year: 2018,
        doi: "10.1007/s11739-018-1806-0",
        pmid: "29427130",
        url: "https://pubmed.ncbi.nlm.nih.gov/29427130/",
      },
      {
        title:
          "Short-term effect of eggs on satiety in overweight and obese subjects",
        authors: "Vander Wal JS, Marth JM, Khosla P, et al.",
        journal: "Journal of the American College of Nutrition",
        year: 2005,
        pmid: "16373948",
        url: "https://pubmed.ncbi.nlm.nih.gov/16373948/",
      },
    ],
    kernaussage:
      "Die Low-Fat-Welle der 80er ist wissenschaftlich widerlegt: Meta-Analysen (Tobias 2015, Sackner-Bernstein 2015) zeigen, dass Low-Fat-Diäten nicht besser beim Abnehmen funktionieren als andere Ansätze. Fett hat 9 kcal/g, sättigt aber stark und verlangsamt die Magenentleerung. Entscheidend ist das Gesamt-Kaloriendefizit, nicht die Fettquelle. Gute Fette wie Omega-3, Olivenöl und Nüsse unterstützen sogar gesunden Gewichtsverlust.",
    faqs: [
      {
        question: "Warum macht Fett nicht automatisch dick?",
        answer:
          "Fett hat zwar mehr Kalorien pro Gramm als Kohlenhydrate oder Protein (9 vs. 4 kcal/g), sättigt aber stärker und länger. In kontrollierten Studien erzielen Low-Fat-Diäten keine besseren Ergebnisse, wenn das Kaloriendefizit identisch ist (DIETFITS 2018, JAMA).",
      },
      {
        question: "Welche Fette sind beim Abnehmen gut?",
        answer:
          "Ungesättigte Fette: Olivenöl, Avocado, Nüsse (Walnüsse, Mandeln), fettiger Fisch (Lachs, Makrele). Omega-3-Fettsäuren reduzieren Entzündungsmarker. Nüsse senken laut Studien das Herz-Kreislauf-Risiko trotz hoher Kaloriendichte.",
      },
      {
        question: "Sollte ich gesättigte Fette komplett meiden?",
        answer:
          "Nein, in Maßen sind sie okay. Die DGE empfiehlt unter 10 % der Kalorien aus gesättigten Fetten. Problematisch wird es nur bei exzessivem Konsum in Kombination mit wenig Bewegung und Ballaststoffmangel – nicht bei einer einzigen Portion Butter oder Käse.",
      },
      {
        question: "Wie viel Fett sollte ich täglich essen?",
        answer:
          "Je nach Ziel: 20–35 % der Kalorien aus Fett (DGE-Empfehlung). Bei 2.000 kcal entspricht das 44–78 g Fett. Low-Carb und Keto liegen deutlich höher (60–75 %), mediterrane Kost bei 30–40 %. Unter 15 % Fett wird hormonell ungünstig.",
      },
      {
        question: "Macht Butter wirklich dick?",
        answer:
          "Nur wenn du insgesamt im Kalorienüberschuss bist. 10 g Butter = 75 kcal. Als Teil einer ausgewogenen Ernährung kein Problem. Dick wird man nicht von Butter, sondern von der Summe aller Kalorien über Wochen und Monate.",
      },
      {
        question: "Warum wurde der „Fett macht fett\"-Mythos populär?",
        answer:
          "In den 80ern interpretierten die USA frühe epidemiologische Daten falsch und initiierten eine „Low-Fat\"-Kampagne. Folge: Ersatz von Fett durch Zucker und raffinierte Kohlenhydrate. Adipositas-Raten stiegen anschließend drastisch. Seit ca. 2010 wird Fett in der Ernährungswissenschaft rehabilitiert.",
      },
    ],
  },
  {
    slug: "jojo-effekt-diaet-wieder-zunehmen",
    title: "Jojo-Effekt: Warum nehme ich nach jeder Diät wieder zu?",
    description:
      "Der Jojo-Effekt erklärt: Warum 80% nach einer Diät wieder zunehmen, wie Hormone und Stoffwechsel sich anpassen – und was die erfolgreichen 20% anders machen.",
    tags: ["Abnehmen", "Jojo-Effekt", "Diät", "Mythen", "Gewicht halten"],
    relatedCalculators: ["kaloriendefizit-berechnen", "kalorienbedarf-berechnen"],
    publishedAt: "2026-02-19",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title:
          "Long-term persistence of hormonal adaptations to weight loss",
        authors: "Sumithran P, Prendergast LA, Delbridge E, et al.",
        journal: "New England Journal of Medicine",
        year: 2011,
        doi: "10.1056/NEJMoa1105816",
        pmid: "21991007",
        url: "https://pubmed.ncbi.nlm.nih.gov/21991007/",
      },
      {
        title:
          "Weight-Loss Maintenance for 10 Years in the National Weight Control Registry",
        authors: "Thomas JG, Bond DS, Phelan S, et al.",
        journal: "American Journal of Preventive Medicine",
        year: 2014,
        doi: "10.1016/j.amepre.2013.08.019",
        pmid: "24355670",
        url: "https://pubmed.ncbi.nlm.nih.gov/24355670/",
      },
      {
        title:
          "Long-term weight loss maintenance",
        authors: "Wing RR, Phelan S",
        journal: "American Journal of Clinical Nutrition",
        year: 2005,
        pmid: "16002825",
        url: "https://pubmed.ncbi.nlm.nih.gov/16002825/",
      },
      {
        title:
          "Metabolic adaptation is not a major barrier to weight-loss maintenance",
        authors: "Martins C, Gower BA, Hill JO, Hunter GR",
        journal: "American Journal of Clinical Nutrition",
        year: 2020,
        doi: "10.1093/ajcn/nqaa220",
        pmid: "32844207",
        url: "https://pubmed.ncbi.nlm.nih.gov/32844207/",
      },
    ],
    kernaussage:
      "Rund 80 % aller Diäthaltenden nehmen innerhalb von 1–2 Jahren das verlorene Gewicht wieder zu. Grund sind hormonelle Anpassungen (Ghrelin steigt, Leptin fällt, NEJM 2011) und ein um 10–15 % reduzierter Grundumsatz. Die erfolgreichen 20 % aus dem National Weight Control Registry wiegen sich täglich, essen proteinreich und bewegen sich 60+ Minuten pro Tag. Crash-Diäten verstärken den Jojo-Effekt, langsame Umstellungen minimieren ihn.",
    faqs: [
      {
        question: "Warum passiert der Jojo-Effekt überhaupt?",
        answer:
          "Nach Gewichtsverlust passen sich Sättigungs- und Hungerhormone an: Ghrelin (Hunger) steigt, Leptin (Sättigung) fällt. Laut NEJM-Studie (Sumithran 2011) bleibt diese Anpassung mindestens 12 Monate nach der Diät bestehen. Der Körper „verteidigt\" sein altes Gewicht aktiv.",
      },
      {
        question: "Wie vermeide ich den Jojo-Effekt konkret?",
        answer:
          "Das National Weight Control Registry (Thomas 2014) identifiziert vier Gemeinsamkeiten bei erfolgreichen Abnehmern: tägliches Wiegen, hoher Proteinanteil (1,6–2,2 g/kg), 60+ Minuten Bewegung pro Tag und konsistente Essmuster auch am Wochenende.",
      },
      {
        question: "Ist mein Stoffwechsel nach der Diät dauerhaft kaputt?",
        answer:
          "Nein, aber adaptiert. Der Grundumsatz sinkt durch Gewichtsverlust um 10–15 % stärker als allein durch die reduzierte Körpermasse erklärbar („Metabolic Adaptation\"). Martins 2020 zeigt: Das ist kein dauerhafter Schaden, sondern teilweise reversibel mit Krafttraining und genug Protein.",
      },
      {
        question: "Was ist die beste Strategie, um Gewicht zu halten?",
        answer:
          "Moderate Kaloriendefizite statt Crash-Diäten, Krafttraining zum Muskelerhalt, 1,6–2,2 g Protein pro kg Körpergewicht und regelmäßiges Monitoring. Der Set-Point kann sich über 1–2 Jahre neu kalibrieren, wenn das neue Gewicht konsequent gehalten wird.",
      },
      {
        question: "Wie lange dauert es, bis sich der Stoffwechsel erholt?",
        answer:
          "Die Hormonanpassung bleibt laut NEJM 2011 mindestens 12 Monate nach der Diät messbar. Mit ausreichend Protein, Krafttraining und genug Schlaf normalisieren sich viele Werte in 6–12 Monaten bei stabilem Gewicht. Geduld mit dem eigenen Körper ist wichtig.",
      },
      {
        question: "Sind Low-Calorie-Diäten (VLCD) grundsätzlich schlecht?",
        answer:
          "Nein, aber sie erhöhen das Jojo-Risiko. Studien zeigen vergleichbare Langzeit-Ergebnisse wie moderate Diäten, wenn danach eine strukturierte Erhaltungsphase mit Verhaltenstherapie folgt. Ohne diese Nachsorge scheitern VLCDs oft dramatisch – das ist der eigentliche Knackpunkt.",
      },
    ],
  },
  {
    slug: "heisshunger-stoppen-ursachen-tipps",
    title: "Heißhunger stoppen: Warum Diäten ihn nicht verstärken",
    description:
      "Der Mythos entkräftet: Meta-Analysen zeigen, dass Kalorienreduktion Heißhunger senkt – nicht steigert. Plus: Die echten Ursachen (Schlaf, Protein, Blutzucker) und was wirklich hilft.",
    tags: ["Abnehmen", "Heißhunger", "Mythen", "Protein", "Schlaf"],
    relatedCalculators: ["protein-bedarf-rechner", "makros-berechnen"],
    publishedAt: "2026-02-18",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title:
          "Extended calorie restriction suppresses overall and specific food cravings: a systematic review and a meta-analysis",
        authors: "Kahathuduwa CN, Binks M, Martin CK, Dawson JA",
        journal: "Obesity Reviews",
        year: 2017,
        doi: "10.1111/obr.12566",
        pmid: "28557246",
        url: "https://pubmed.ncbi.nlm.nih.gov/28557246/",
      },
      {
        title:
          "Frequency of consuming foods predicts changes in cravings for those foods during weight loss: The POUNDS Lost Study",
        authors: "Apolzan JW, Myers CA, Champagne CM, et al.",
        journal: "Obesity",
        year: 2017,
        doi: "10.1002/oby.21895",
        pmid: "28653502",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5529244/",
      },
      {
        title:
          "Reduced food cravings correlated with a 24-month period of weight loss and weight maintenance",
        authors: "Jospe MR, Taylor RW, et al.",
        journal: "Appetite",
        year: 2025,
        pmid: "39826856",
        url: "https://pubmed.ncbi.nlm.nih.gov/39826856/",
      },
      {
        title:
          "Effect of short- and long-term protein consumption on appetite and appetite-regulating gastrointestinal hormones: a systematic review and meta-analysis",
        authors: "Kohanmoo A, Faghih S, Akhlaghi M",
        journal: "Physiology & Behavior",
        year: 2020,
        doi: "10.1016/j.physbeh.2020.113123",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0031938420304376",
      },
      {
        title:
          "Increased Hunger, Food Cravings, Food Reward, and Portion Size Selection after Sleep Curtailment in Women Without Obesity",
        authors: "Hanlon EC, Tasali E, Leproult R, et al.",
        journal: "Nutrients",
        year: 2019,
        pmid: "30893841",
        url: "https://pubmed.ncbi.nlm.nih.gov/30893841/",
      },
      {
        title: "The impact of sleep deprivation on food desire in the human brain",
        authors: "Greer SM, Goldstein AN, Walker MP",
        journal: "Nature Communications",
        year: 2013,
        doi: "10.1038/ncomms3259",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3763921/",
      },
    ],
  },
  {
    slug: "apfelessig-abnehmen-mythos-oder-wunder",
    title: "Apfelessig abnehmen: Wundermittel oder Hype?",
    description:
      "Der TikTok-Trend im Faktencheck: Die viralste Studie wurde zurückgezogen, und echte Evidenz für Fettverbrennung fehlt. Was Apfelessig wirklich kann – und was nicht.",
    tags: ["Abnehmen", "Mythen", "Apfelessig", "Ernährung", "Trend"],
    relatedCalculators: ["kaloriendefizit-berechnen"],
    publishedAt: "2026-02-17",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title: "Apfelessig: Gut zum Abnehmen?",
        authors: "BARMER",
        journal: "barmer.de",
        year: 2025,
        url: "https://www.barmer.de/gesundheit-verstehen/leben/ernaehrung/apfelessig-1327348",
      },
      {
        title: "Die Apfelessig-Diät — ein Hype ohne Grundlage",
        authors: "Quarks",
        journal: "quarks.de",
        year: 2025,
        url: "https://www.quarks.de/gesundheit/apfelessig-abnehmen/",
      },
      {
        title: "Abnehmen mit Apfelessig? Studie hinter Social-Media-Trend wegen vieler Fehler zurückgezogen",
        authors: "Apotheken Umschau",
        journal: "apotheken-umschau.de",
        year: 2025,
        url: "https://www.apotheken-umschau.de/gesund-bleiben/ernaehrung/apfelessig-hilft-er-wirklich-beim-abnehmen-1085533.html",
      },
      {
        title: "Vinegar intake reduces body weight, body fat mass, and serum triglyceride levels in obese Japanese subjects",
        authors: "Kondo T, Kishi M, Fushimi T, Ugajin S, Kaga T",
        journal: "Bioscience, Biotechnology, and Biochemistry",
        year: 2009,
        pmid: "19661687",
        url: "https://pubmed.ncbi.nlm.nih.gov/19661687/",
      },
      {
        title: "Entgiftungsdiäten – Stellungnahme",
        authors: "Deutsche Gesellschaft für Ernährung",
        journal: "DGE",
        year: 2024,
        url: "https://www.dge.de/gesunde-ernaehrung/diaeten-und-fasten/",
      },
    ],
  },
  {
    slug: "abnehmen-ohne-sport-ernaehrung",
    title: "Abnehmen ohne Sport: Funktioniert es wirklich?",
    description:
      "Kein Bock auf Gym? Die Wissenschaft zeigt: Mit Ernährung erreichst du 80% des Abnehm-Erfolgs. Meta-Analysen beweisen – Diät allein schlägt Sport allein um Längen.",
    tags: ["Abnehmen", "Sport", "Ernährung", "Mythen", "Meta-Analyse"],
    relatedCalculators: ["kaloriendefizit-berechnen", "kalorienbedarf-berechnen", "makros-berechnen"],
    publishedAt: "2026-02-16",
    readingTime: 6,
    featured: true,
    sources: [
      {
        title:
          "A meta-analysis of the past 25 years of weight loss research using diet, exercise or diet plus exercise intervention",
        authors: "Miller WC, Koceja DM, Hamilton EJ",
        journal: "International Journal of Obesity",
        year: 1997,
        pmid: "9347414",
        url: "https://pubmed.ncbi.nlm.nih.gov/9347414/",
      },
      {
        title:
          "Diet or exercise interventions vs combined behavioral weight management programs: a systematic review and meta-analysis of direct comparisons",
        authors: "Johns DJ, Hartmann-Boyce J, Jebb SA, Aveyard P",
        journal: "Journal of the Academy of Nutrition and Dietetics",
        year: 2014,
        doi: "10.1016/j.jand.2014.07.005",
        pmid: "25257365",
        url: "https://pubmed.ncbi.nlm.nih.gov/25257365/",
      },
      {
        title:
          "Does physical activity cause weight loss?",
        authors: "Pontzer H",
        journal: "International Journal of Obesity",
        year: 2022,
        doi: "10.1038/s41366-022-01247-4",
        url: "https://www.nature.com/articles/s41366-022-01247-4",
      },
    ],
  },
  {
    slug: "detox-diaet-entgiften-abnehmen",
    title: "Detox Diät: Hilft Entgiften wirklich beim Abnehmen?",
    description:
      "Grüne Säfte, Detox-Tees, Entschlackungskuren – überall verspricht 'Entgiften' schnelles Abnehmen. Doch die Wissenschaft ist eindeutig: Schlacken gibt es nicht, und dein Körper entgiftet sich selbst.",
    tags: ["Abnehmen", "Mythen", "Detox", "Ernährung", "Diät"],
    relatedCalculators: ["kaloriendefizit-berechnen", "kalorienbedarf-berechnen"],
    publishedAt: "2026-02-15",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title: "Entgiftungsdiäten – Stellungnahme",
        authors: "Deutsche Gesellschaft für Ernährung",
        journal: "DGE",
        year: 2024,
        url: "https://www.dge.de/gesunde-ernaehrung/diaeten-und-fasten/entgiftungsdiaeten/",
      },
      {
        title: "Detox: Mythos Entgiften",
        authors: "Stiftung Warentest",
        journal: "test.de",
        year: 2025,
        url: "https://www.test.de/Detox-Mythos-Entgiften-5825812-0/",
      },
      {
        title: "Detox – gesünder durch Entgiftung?",
        authors: "Verbraucherzentrale",
        journal: "verbraucherzentrale.de",
        year: 2024,
        url: "https://www.verbraucherzentrale.de/wissen/lebensmittel/nahrungsergaenzungsmittel/detox-gesuender-durch-entgiftung-25381",
      },
      {
        title: "Detox – was steckt dahinter?",
        authors: "BARMER",
        journal: "barmer.de",
        year: 2025,
        url: "https://www.barmer.de/gesundheit-verstehen/leben/ernaehrung/detox-1054636",
      },
      {
        title: "Detox: Der Mythos vom Entgiften",
        authors: "medizin-transparent.at",
        journal: "Cochrane Österreich",
        year: 2023,
        url: "https://medizin-transparent.at/detox-der-mythos-vom-entgiften/",
      },
    ],
  },
  {
    slug: "alkohol-abnehmen-fettverbrennung",
    title: "Alkohol beim Abnehmen: Stoppt er wirklich die Fettverbrennung?",
    description:
      "Alkohol pausiert die Fettverbrennung – aber das ist nicht das größte Problem. Warum der Heißhunger danach gefährlicher ist und wie du trotzdem abnehmen kannst.",
    tags: ["Abnehmen", "Alkohol", "Fettverbrennung", "Mythen", "Kalorien"],
    relatedCalculators: ["alkohol-kalorien-rechner", "kaloriendefizit-berechnen"],
    publishedAt: "2026-02-14",
    readingTime: 9,
    featured: true,
    sources: [
      {
        title:
          "De novo lipogenesis, lipid kinetics, and whole-body lipid balances in humans after acute alcohol consumption",
        authors: "Siler SQ, Neese RA, Hellerstein MK",
        journal: "American Journal of Clinical Nutrition",
        year: 1999,
        pmid: "10539756",
        url: "https://pubmed.ncbi.nlm.nih.gov/10539756/",
      },
      {
        title:
          "Effect of acute alcohol consumption on energy expenditure and substrate oxidation in healthy men",
        authors: "Suter PM, Jéquier E, Schutz Y",
        journal: "American Journal of Clinical Nutrition",
        year: 1994,
        pmid: "8237574",
        url: "https://pubmed.ncbi.nlm.nih.gov/8237574/",
      },
      {
        title:
          "Alcohol ingestion acutely antagonizes the refeeding suppression of plasma ghrelin",
        authors: "Calissendorff J, Danielsson O, Brismar K, Röjdmark S",
        journal: "Alcohol and Alcoholism",
        year: 2005,
        pmid: "16186144",
        url: "https://pubmed.ncbi.nlm.nih.gov/16186144/",
      },
      {
        title:
          "Alcohol Consumption and Obesity: An Update",
        authors: "Traversy G, Chaput JP",
        journal: "Current Obesity Reports",
        year: 2015,
        doi: "10.1007/s13679-014-0129-4",
        pmid: "25741455",
        url: "https://pubmed.ncbi.nlm.nih.gov/25741455/",
      },
      {
        title:
          "Alcohol Consumption Impairs Muscle Protein Synthesis",
        authors: "Parr EB, Camera DM, Areta JL, et al.",
        journal: "PLOS ONE",
        year: 2014,
        doi: "10.1371/journal.pone.0088384",
        url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0088384",
      },
    ],
  },
  {
    slug: "kaffee-abnehmen-stoffwechsel",
    title: "Kaffee beim Abnehmen: Hilft er oder schadet er?",
    description:
      "Kurbelt Kaffee wirklich den Stoffwechsel an? Meta-Analysen zeigen: Koffein erhöht den Kalorienverbrauch um 3–4%. Aber nur schwarzer Kaffee hilft – Latte Macchiato zählt nicht.",
    tags: ["Abnehmen", "Kaffee", "Stoffwechsel", "Mythen", "Meta-Analyse"],
    relatedCalculators: ["koffein-rechner", "kalorienbedarf-berechnen"],
    publishedAt: "2026-02-13",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title:
          "The effects of caffeine intake on weight loss: a systematic review and dos-response meta-analysis of randomized controlled trials",
        authors: "Tabrizi R, Saneei P, Lankarani KB, et al.",
        journal: "Critical Reviews in Food Science and Nutrition",
        year: 2018,
        doi: "10.1080/10408398.2018.1507996",
        pmid: "30335479",
        url: "https://pubmed.ncbi.nlm.nih.gov/30335479/",
      },
      {
        title:
          "Normal caffeine consumption: influence on thermogenesis and daily energy expenditure in lean and postobese human volunteers",
        authors: "Dulloo AG, Geissler CA, Horton T, Collins A, Miller DS",
        journal: "The American Journal of Clinical Nutrition",
        year: 1989,
        pmid: "2912010",
        url: "https://pubmed.ncbi.nlm.nih.gov/2912010/",
      },
      {
        title:
          "Effects of Caffeine on Brown Adipose Tissue Thermogenesis and Metabolic Homeostasis: A Review",
        authors: "Velickovic K, Luber F, et al.",
        journal: "Frontiers in Neuroscience",
        year: 2021,
        doi: "10.3389/fnins.2021.621356",
        url: "https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.621356/full",
      },
    ],
  },
  {
    slug: "kohlenhydrate-abends-mythos",
    title: "Kohlenhydrate abends: Machen sie wirklich dick?",
    description:
      "Der Mythos 'Keine Kohlenhydrate nach 18 Uhr' im Faktencheck. Eine 6-monatige RCT-Studie zeigt das überraschende Gegenteil: Kohlenhydrate am Abend können beim Abnehmen sogar helfen.",
    tags: ["Abnehmen", "Mythen", "Kohlenhydrate", "Ernährung", "Studie"],
    relatedCalculators: ["makros-berechnen", "kaloriendefizit-berechnen"],
    publishedAt: "2026-02-12",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title:
          "Greater weight loss and hormonal changes after 6 months diet with carbohydrates eaten mostly at dinner",
        authors: "Sofer S, Eliraz A, Kaplan S, et al.",
        journal: "Obesity (Silver Spring)",
        year: 2011,
        doi: "10.1038/oby.2011.48",
        pmid: "21475137",
        url: "https://pubmed.ncbi.nlm.nih.gov/21475137/",
      },
      {
        title:
          "Changes in daily leptin, ghrelin and adiponectin profiles following a diet with carbohydrates eaten at dinner in obese subjects",
        authors: "Sofer S, Eliraz A, Kaplan S, et al.",
        journal: "Nutrition, Metabolism and Cardiovascular Diseases",
        year: 2013,
        doi: "10.1016/j.numecd.2012.04.008",
        pmid: "22901843",
      },
    ],
  },
  {
    slug: "bauchfett-verlieren-gezielt-abnehmen",
    title: "Bauchfett verlieren: Kann man gezielt abnehmen?",
    description:
      "Bauchfett gezielt wegtrainieren – geht das? Die Wahrheit über 'Spot Reduction' und warum Bauchübungen allein nicht helfen. Plus: Was wirklich funktioniert.",
    tags: ["Abnehmen", "Mythen", "Training", "Fettabbau", "Bauchfett"],
    relatedCalculators: ["koerperfett-rechner", "taille-hueft-verhaeltnis-rechner"],
    publishedAt: "2026-02-11",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title:
          "A proposed model to test the hypothesis of exercise-induced localized fat reduction (spot reduction), including a systematic review with meta-analysis",
        authors: "Ramirez-Campillo R, Moran J, Drury B, et al.",
        journal: "Human Movement",
        year: 2021,
        doi: "10.5114/hm.2021.106281",
        url: "https://hummov.awf.wroc.pl/A-proposed-model-to-test-the-hypothesis-of-exercise-induced-localized-fat-reduction-spot-reduction-including-a-systematic-review-with-meta-analysis,143162,0,2.html",
      },
      {
        title:
          "Abdominal aerobic endurance exercise reveals spot reduction exists: A randomized controlled trial",
        authors: "Mæhlum MB, Unhjem R, Wang E",
        journal: "Physiological Reports",
        year: 2023,
        doi: "10.14814/phy2.15853",
        pmid: "38010058",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10680576/",
      },
    ],
  },
  {
    slug: "fruehstueck-wichtigste-mahlzeit-mythos-meta-analyse",
    title: "Frühstück: Die wichtigste Mahlzeit? Was Meta-Analysen wirklich zeigen",
    description:
      "Zwei Meta-Analysen (2020/2022) mit 17 RCTs zeigen: Frühstück essen oder weglassen macht keinen Unterschied fürs Gewicht. Der Mythos stammt aus Beobachtungsstudien – die Kausalität fehlt.",
    tags: ["Abnehmen", "Mythen", "Meta-Analyse", "Frühstück", "Ernährung"],
    relatedCalculators: ["intervallfasten-rechner", "kalorienbedarf-berechnen"],
    publishedAt: "2026-02-09",
    readingTime: 6,
    featured: true,
    sources: [
      {
        title:
          "Eating versus skipping breakfast has no discernible effect on obesity-related anthropometric outcomes: a systematic review and meta-analysis",
        authors: "Brown AW, Bohan Brown MM, Allison DB",
        journal: "F1000Research",
        year: 2022,
        doi: "10.12688/f1000research.22580.3",
        pmid: "35299410",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8924556/",
      },
      {
        title:
          "Breakfast Skipping, Body Composition, and Cardiometabolic Risk: A Systematic Review and Meta-Analysis of Randomized Trials",
        authors: "Bonnet JP, Cardel MI, Cellini J, et al.",
        journal: "Obesity",
        year: 2020,
        doi: "10.1002/oby.22791",
        pmid: "32304359",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7304383/",
      },
    ],
  },
  {
    slug: "suessstoffe-abnehmen-meta-analyse",
    title: "Machen Süßstoffe dick? Was 12 Meta-Analysen wirklich zeigen",
    description:
      "Umbrella-Meta-Analyse (2024) + SWEET-Studie (2025): RCTs zeigen – Süßstoffe helfen beim Abnehmen (BMI −0.28). Der Widerspruch zu Beobachtungsstudien erklärt sich durch Reverse Causation.",
    tags: ["Abnehmen", "Mythen", "Meta-Analyse", "Süßstoffe", "Ernährung"],
    relatedCalculators: ["kaloriendefizit-berechnen", "makros-berechnen"],
    publishedAt: "2026-02-08",
    readingTime: 6,
    featured: true,
    sources: [
      {
        title:
          "The effects of artificial sweeteners on body weight, body fat, and energy intake: A meta-analysis of meta-analyses",
        authors: "Hamedi-Kalajahi F, Asemani S, Prabahar K, et al.",
        journal: "BioSocial Health Journal",
        year: 2024,
        doi: "10.34172/bshj.22",
        url: "https://www.biosocialhealthjournal.com/FullHtml/bshj-22",
      },
      {
        title:
          "Effect of sweeteners and sweetness enhancers on weight management and gut microbiota composition in individuals with overweight or obesity: the SWEET study",
        authors: "Raben A, Blundell J, Astrup A, et al.",
        journal: "Nature Metabolism",
        year: 2025,
        doi: "10.1038/s42255-025-01381-z",
        url: "https://www.nature.com/articles/s42255-025-01381-z",
      },
      {
        title:
          "The effects of non-nutritive sweeteners on energy and macronutrients intake in adults: a grade-assessed systematic review and meta-analyses of randomized controlled trials",
        authors: "Ramezani-Jolfaie N, et al.",
        journal: "Frontiers in Nutrition",
        year: 2024,
        doi: "10.3389/fnut.2024.1475962",
        url: "https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2024.1475962/full",
      },
    ],
  },
  {
    slug: "viele-kleine-mahlzeiten-mythos",
    title: "Viele kleine Mahlzeiten kurbeln den Stoffwechsel an? Mythos! (Meta-Analysen 2023/2024)",
    description:
      "Zwei Meta-Analysen mit 2.500+ Teilnehmern zeigen: Häufiges Essen bringt keinen Stoffwechsel-Boost. Warum der Mythos falsch ist und was wirklich zählt.",
    tags: ["Abnehmen", "Mythen", "Stoffwechsel", "Meta-Analyse", "Mahlzeiten"],
    relatedCalculators: ["kalorienbedarf-berechnen"],
    publishedAt: "2026-02-07",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title:
          "Meal Timing and Anthropometric and Metabolic Outcomes: A Systematic Review and Meta-Analysis",
        authors: "Ezzat-Zadeh Z, Engel A, Engelsen SB, et al.",
        journal: "JAMA Network Open",
        year: 2024,
        doi: "10.1001/jamanetworkopen.2024.42163",
        pmid: "39485353",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11530941/",
      },
      {
        title:
          "The effects of eating frequency on changes in body composition and cardiometabolic health in adults: a systematic review with meta-analysis of randomized trials",
        authors: "Wright N, et al.",
        journal: "International Journal of Behavioral Nutrition and Physical Activity",
        year: 2023,
        doi: "10.1186/s12966-023-01532-z",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10647044/",
      },
    ],
  },
  {
    slug: "spaet-essen-gewichtszunahme-studie",
    title: "Macht spätes Essen dick? Was eine Harvard-Studie zeigt",
    description:
      "Kontrollierte Crossover-Studie: Spätes Essen verdoppelt Hungergefühl, senkt Kalorienverbrauch um ~60 kcal/Tag und programmiert Fettgewebe auf Speichern. Mechanismen erklärt.",
    tags: ["Abnehmen", "Mahlzeiten-Timing", "Studie", "Stoffwechsel", "Hunger"],
    relatedCalculators: ["intervallfasten-rechner", "kalorienbedarf-berechnen"],
    publishedAt: "2026-02-06",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title:
          "Late isocaloric eating increases hunger, decreases energy expenditure, and modifies metabolic pathways in adults with overweight and obesity",
        authors: "Vujović N, Piron MJ, Qian J, et al.",
        journal: "Cell Metabolism",
        year: 2022,
        doi: "10.1016/j.cmet.2022.09.007",
        pmid: "36198293",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10184753/",
      },
    ],
  },
  {
    slug: "wasser-trinken-abnehmen-meta-analyse",
    title: "Hilft Wasser trinken beim Abnehmen? (Meta-Analyse 2024)",
    description:
      "Meta-Analyse von 8 RCTs: Mehr Wasser trinken allein macht nicht schlank. Der Effekt entsteht nur, wenn kalorienhaltige Getränke ersetzt werden. Light-Drinks sind kein Problem.",
    tags: ["Abnehmen", "Wasser", "Mythen", "Meta-Analyse", "Getränke"],
    relatedCalculators: ["wasserbedarf-rechner", "kaloriendefizit-berechnen"],
    publishedAt: "2026-02-05",
    readingTime: 6,
    featured: true,
    sources: [
      {
        title:
          "Water Intake and Adiposity Outcomes among Overweight and Obese Individuals: A Systematic Review and Meta-Analysis of Randomized Controlled Trials",
        authors: "Chen QY, Khil J, Keum N",
        journal: "Nutrients",
        year: 2024,
        doi: "10.3390/nu16070963",
        pmid: "38612997",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11013432/",
      },
    ],
  },
  {
    slug: "ballaststoffe-saettigung-quick-fact",
    title: "Ballaststoffe und Sättigung: Der unterschätzte Abnehm-Hebel",
    description:
      "Warum Ballaststoffe länger satt machen und wie du mit einfachen Tricks auf 25–30 g pro Tag kommst.",
    tags: ["Ballaststoffe", "Sättigung", "Abnehmen", "Ernährung"],
    publishedAt: "2026-02-05",
    readingTime: 2,
    featured: false,
    sources: [],
  },
  {
    slug: "protein-timing-vor-nach-training-studie",
    title: "Protein-Timing: Direkt nach dem Training oder egal wann?",
    description:
      "RCT mit 31 trainierten Männern zeigt: Ob Protein direkt oder 3h vor/nach dem Training – kein Unterschied bei Muskelaufbau.",
    tags: ["Protein", "Muskelaufbau", "Training", "Timing", "Studie"],
    relatedCalculators: ["protein-bedarf-rechner", "trainingsplan-erstellen"],
    publishedAt: "2026-02-04",
    readingTime: 5,
    featured: false,
    sources: [
      {
        title: "Timing matters? The effects of two different timing of high protein diets on body composition",
        authors: "Nabavizadeh P, Mohammadi H, et al.",
        journal: "Frontiers in Nutrition",
        year: 2024,
        doi: "10.3389/fnut.2024.1397090",
        url: "https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2024.1397090/full",
      },
    ],
  },
  {
    slug: "restaurant-kalorien-unterschaetzung-studie",
    title: "Warum du im Restaurant mehr isst als du denkst (Studie 2023)",
    description:
      "Restaurant-Portionen haben durchschnittlich 1.200 Kalorien – oft doppelt so viel wie gedacht. Warum wir so schlecht schätzen und was du dagegen tun kannst.",
    tags: ["Restaurant", "Kalorien", "Portionen", "Tracking", "Abnehmen"],
    relatedCalculators: ["kalorienbedarf-berechnen", "kaloriendefizit-berechnen"],
    publishedAt: "2026-02-01",
    readingTime: 7,
    featured: true,
    sources: [
      {
        title: "Energy content of menus offered in fast food and sit-down restaurants",
        authors: "Urban LE, Roberts SB, et al.",
        journal: "JAMA Internal Medicine",
        year: 2016,
        doi: "10.1001/jamainternmed.2016.2198",
      },
      {
        title: "The accuracy of stated energy contents of reduced-energy, commercially prepared foods",
        authors: "Urban LE, Dallal GE, et al.",
        journal: "Journal of the American Dietetic Association",
        year: 2010,
        doi: "10.1016/j.jada.2009.10.003",
      },
    ],
  },
  {
    slug: "cheat-days-wahrheit-mythos-studie",
    title: "Cheat Days: Helfen sie wirklich beim Abnehmen? (Scoping Review 2025)",
    description:
      "Die Wahrheit über Cheat Days: Was sagt die Wissenschaft zu Stoffwechsel-Boost, Muskelerhalt und psychologischen Effekten? Ein aktueller Scoping Review klärt auf.",
    tags: ["Abnehmen", "Cheat Day", "Mythen", "Psychologie", "Diät"],
    relatedCalculators: ["cheat-day-rechner", "kaloriendefizit-berechnen"],
    publishedAt: "2026-01-31",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title: "The Role of Cheat Meals in Dieting: A Scoping Review of Physiological and Psychological Responses",
        authors: "Tan JH, Pang ETC, et al.",
        journal: "Nutrition Reviews",
        year: 2025,
        doi: "10.1093/nutrit/nuaf077",
        pmid: "40517327",
      },
      {
        title: "Caloric restriction with or without time-restricted eating in weight loss",
        authors: "Davoodi SH, et al.",
        journal: "Journal of Research in Medical Sciences",
        year: 2014,
        pmid: "25635156",
      },
    ],
  },
  {
    slug: "stoffwechsel-eingeschlafen-mythos",
    title: "Stoffwechsel eingeschlafen? Warum du nicht abnimmst (Mythos & Wahrheit)",
    description:
      "Der 'Hungerstoffwechsel' ist ein Mythos. Erfahre, was metabolische Anpassung wirklich ist, warum dein Plateau nicht am Stoffwechsel liegt und wie du es brichst. Wissenschaft vs. Bro-Science.",
    tags: ["Stoffwechsel", "Abnehmen", "Mythen", "Plateau", "Kalorien"],
    relatedCalculators: ["grundumsatz-rechner", "kalorienbedarf-berechnen"],
    publishedAt: "2026-01-30",
    readingTime: 8,
    featured: true,
    sources: [
      {
        title: "Metabolic adaptation is not a major barrier to weight-loss maintenance",
        authors: "Martins C, et al.",
        journal: "The American Journal of Clinical Nutrition",
        year: 2020,
        doi: "10.1093/ajcn/nqaa220",
      },
      {
        title: "Metabolic adaptation to weight loss: implications for the athlete",
        authors: "Trexler ET, et al.",
        journal: "Journal of the International Society of Sports Nutrition",
        year: 2014,
        doi: "10.1186/1550-2783-11-7",
      },
    ],
  },
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
      {
        title: "Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain: An Inpatient Randomized Controlled Trial of Ad Libitum Food Intake",
        authors: "Hall KD, et al.",
        journal: "Cell Metabolism",
        year: 2019,
        doi: "10.1016/j.cmet.2019.05.008",
        pmid: "31105044",
      },
      {
        title: "The importance of the ratio of omega-6/omega-3 essential fatty acids",
        authors: "Simopoulos AP",
        journal: "Biomedicine & Pharmacotherapy",
        year: 2002,
        doi: "10.1016/s0753-3322(02)00253-6",
        pmid: "12442909",
      },
      {
        title: "Obesity: the protein leverage hypothesis",
        authors: "Simpson SJ, Raubenheimer D",
        journal: "Obesity Reviews",
        year: 2005,
        doi: "10.1111/j.1467-789X.2005.00178.x",
        pmid: "15836464",
      },
      {
        title: "Dietary emulsifiers impact the mouse gut microbiota promoting colitis and metabolic syndrome",
        authors: "Chassaing B, et al.",
        journal: "Nature",
        year: 2015,
        doi: "10.1038/nature14232",
        pmid: "25731162",
      },
      {
        title: "Chronic inflammation and tissue damage",
        authors: "Piche ME, et al.",
        journal: "Harvard Health",
        year: 2021,
        url: "https://www.health.harvard.edu/staying-healthy/playing-with-the-fire-of-inflammation",
      },
      {
        title: "Advanced glycation end-products and skin collagen",
        authors: "Mavrogonatou E, et al.",
        journal: "Experimental Dermatology",
        year: 2020,
        doi: "10.1111/exd.15065",
        pmid: "32997816",
      },
      {
        title: "Oxidative stress: an imbalance between free radicals and antioxidants",
        authors: "Cleveland Clinic",
        journal: "Medical Reference",
        year: 2022,
        url: "https://my.clevelandclinic.org/health/articles/oxidative-stress",
      },
      {
        title: "Achieving Optimal Post-Exercise Muscle Protein Remodeling in Physically Active Adults through Whole Food Consumption",
        authors: "Burd NA, et al.",
        journal: "Nutrients",
        year: 2018,
        doi: "10.3390/nu10060731",
        pmid: "29874876",
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
    relatedCalculators: ["protein-bedarf-rechner", "makros-berechnen"],
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
    tags: ["Abnehmen", "Kalorien", "Meta-Analyse", "Ernährung"],
    relatedCalculators: ["makros-berechnen", "kaloriendefizit-berechnen"],
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
    title: "KI-Ernährungsanalyse per Foto: Wie genau ist das? (Review)",
    description:
      "Systematischer Review (Annals of Medicine, 2023): KI-basierte Ernährungsanalyse aus Essensfotos im Vergleich zu Menschen/Ground Truth. Ergebnis: stark variable Fehler – gut bei einfachen Foods, schwieriger bei komplexen Gerichten.",
    tags: ["KI", "Tracking", "Ernährung", "Review"],
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
    relatedCalculators: ["kaloriendefizit-berechnen", "abnahmedatum-berechnen"],
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
      "Randomisierte Studie (JAMA Intern Med, 2022): Schlafdauer +~1.2 h/Nacht durch Schlafhygiene-Coaching; Energieaufnahme −270 kcal/Tag vs Kontrolle – ohne Diaetvorgaben.",
    tags: ["Schlaf", "Abnehmen", "Studie", "Kalorien"],
    relatedCalculators: ["schlaf-rechner", "kalorienbedarf-berechnen"],
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
    title: "Ausdauertraining zum Abnehmen: Dosis-Wirkung (Meta-Analyse)",
    description:
      "Dose-Response Meta-Analyse (2024) mit 116 RCTs: pro +30 Min/Woche aerobes Training −0.52 kg Gewicht und −0.56 cm Taille im Mittel. 150 Min/Woche als sinnvoller Zielwert.",
    tags: ["Training", "Abnehmen", "Meta-Analyse", "Bewegung"],
    relatedCalculators: ["kalorienverbrauch-rechner", "trainingsplan-erstellen"],
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
      "Übersicht (2020): Proteinreiche Ernährung kann Abnehmen unterstützen (Sattigungshormone, DIT) und fettfreie Masse eher erhalten. Laengere Trials (6–12 Monate) berichten auch weniger Regain.",
    tags: ["Protein", "Abnehmen", "Ernährung", "Review"],
    relatedCalculators: ["protein-bedarf-rechner", "makros-berechnen"],
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
    tags: ["Kalorien", "Studie", "Verhalten", "Ernährung"],
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
      "Vergleichsstudie (2015): Erfolgreiche Gewicht-Halter (NWCR, n=690) waren häufiger Morgen-Typen und berichteten bessere Schlafqualitaet als Teilnehmende klassischer Abnehm-Interventionen.",
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
    title: "Gewicht halten: Warum Tracking-Apps so häufig sind (NWCR)",
    description:
      "Studie (2017): NWCR-Gewicht-Halter nutzen Self-Monitoring-Technologie und Smartphone-Tracking-Apps häufiger als eine nationale Vergleichsstichprobe. Tracking wirkt als Routine- und Feedback-System.",
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
      "Studie (2021): Bei App-basiertem Ernährungs-Tracking waren Konsistenz und Frequenz mit Gewichtsverlust assoziiert – Vollstaendigkeit weniger. Praxis: lieber regelmaessig loggen als perfekt.",
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
    relatedCalculators: ["kalorienbedarf-berechnen"],
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
  {
    slug: "viszerales-fett-bauchfett-innen-gesundheit-reduktion",
    title: "Viszerales Fett: Das gefährliche Bauchfett innen erkennen und reduzieren",
    description: "Viszerales Fett umhüllt die Organe und treibt das Diabetes- und Herzrisiko. Studien zeigen: Es schmilzt bei Gewichtsverlust überproportional schnell.",
    tags: [
      "viszerales fett",
      "bauchfett",
      "stoffwechsel",
      "typ-2-diabetes",
      "gewichtsabnahme",
      "bewegung",
      "taillenumfang",
      "herzgesundheit"
    ],
    relatedCalculators: [
      "taille-hueft-verhaeltnis-rechner",
      "koerperfett-rechner",
      "kaloriendefizit-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Primary care-led weight management for remission of type 2 diabetes (DiRECT): an open-label, cluster-randomised trial",
        authors: "Lean MEJ, Leslie WS, Barnes AC, et al.",
        journal: "The Lancet",
        year: 2018,
        doi: "10.1016/S0140-6736(17)33102-1",
        pmid: "29221645"
      },
      {
        title: "Reduction in the Incidence of Type 2 Diabetes with Lifestyle Intervention or Metformin",
        authors: "Knowler WC, Barrett-Connor E, Fowler SE, et al. (Diabetes Prevention Program Research Group)",
        journal: "New England Journal of Medicine",
        year: 2002,
        doi: "10.1056/NEJMoa012512",
        pmid: "11832527"
      },
      {
        title: "Exercise for overweight or obesity",
        authors: "Shaw KA, Gennat HC, O'Rourke P, Del Mar C",
        journal: "Cochrane Database of Systematic Reviews",
        year: 2006,
        doi: "10.1002/14651858.CD003817.pub3",
        pmid: "17054187"
      }
    ],
    kernaussage: "Viszerales Fett liegt tief im Bauchraum um die Organe und ist metabolisch hochaktiv. Es steigert nachweislich das Risiko für Typ-2-Diabetes und Herz-Kreislauf-Erkrankungen. Die gute Nachricht: Bei einem Kaloriendefizit und mehr Bewegung baut der Körper viszerales Fett oft schneller ab als das harmlosere Unterhautfett – schon ein moderater Gewichtsverlust verbessert die Stoffwechselwerte deutlich.",
    faqs: [
      {
        question: "Was ist der Unterschied zwischen viszeralem Fett und normalem Bauchfett?",
        answer: "Subkutanes Fett liegt direkt unter der Haut und lässt sich greifen – es ist stoffwechselmäßig relativ harmlos. Viszerales Fett sitzt tiefer im Bauchraum und umhüllt die inneren Organe. Es ist metabolisch hochaktiv, gibt Entzündungsbotenstoffe ab und ist eng mit Insulinresistenz und Herz-Kreislauf-Risiko verbunden."
      },
      {
        question: "Wie erkenne ich, ob ich zu viel viszerales Fett habe?",
        answer: "Ein einfacher Indikator ist der Taillenumfang: Ab etwa 102 cm bei Männern und 88 cm bei Frauen steigt das Risiko laut WHO deutlich. Auch das Taille-Hüft-Verhältnis gibt Hinweise. Eine exakte Messung ist nur per MRT oder CT möglich, für den Alltag reicht aber das Maßband als Verlaufskontrolle."
      },
      {
        question: "Lässt sich viszerales Fett gezielt durch Bauchübungen abbauen?",
        answer: "Nein. Eine gezielte Fettverbrennung an einer einzelnen Körperstelle (Spot-Reduktion) gibt es nicht. Bauchmuskeltraining kräftigt die Muskeln, verbrennt aber kein inneres Bauchfett. Abgebaut wird viszerales Fett ausschließlich über ein Gesamt-Energiedefizit kombiniert mit Bewegung."
      },
      {
        question: "Wie schnell baut sich viszerales Fett ab?",
        answer: "In Studien reagiert viszerales Fett oft überproportional schnell auf Gewichtsverlust – häufig schon, bevor sich das Körpergewicht stark verändert. Schon 5–10 % Gewichtsverlust verbessern die Stoffwechselwerte spürbar. Entscheidend ist ein moderates, dauerhaft durchhaltbares Kaloriendefizit statt einer Crash-Diät."
      },
      {
        question: "Kann der Abbau von viszeralem Fett Typ-2-Diabetes umkehren?",
        answer: "Bei Menschen mit relativ kurz bestehendem Typ-2-Diabetes ist das möglich. In der DiRECT-Studie erreichten 46 % der Teilnehmenden nach einem intensiven Gewichtsmanagement-Programm eine Remission, bei einem Gewichtsverlust ab 15 kg sogar 86 %. Der Abbau des Fetts in und um Leber und Bauchspeicheldrüse gilt als Schlüsselmechanismus."
      }
    ]
  },
  {
    slug: "mittelmeer-diaet-predimed-studie-abnehmen-herz",
    title: "Mittelmeer-Diät: Was die PREDIMED-Studie wirklich beweist",
    description: "Die PREDIMED-Studie zeigt: Die Mittelmeer-Diät senkt schwere Herz-Kreislauf-Ereignisse um rund 30 %. Was das fürs Abnehmen heißt.",
    tags: [
      "mittelmeer diät",
      "mediterrane ernährung",
      "predimed studie",
      "mittelmeerdiät abnehmen",
      "herzgesundheit",
      "ernährungswissenschaft",
      "olivenöl",
      "nüsse"
    ],
    relatedCalculators: [
      "kalorienbedarf-berechnen",
      "kaloriendefizit-berechnen",
      "makros-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with Extra-Virgin Olive Oil or Nuts (PREDIMED)",
        authors: "Estruch R, Ros E, Salas-Salvadó J, et al.",
        journal: "New England Journal of Medicine",
        year: 2018,
        doi: "10.1056/NEJMoa1800389",
        pmid: "29897866"
      },
      {
        title: "Mediterranean-style diet for the primary and secondary prevention of cardiovascular disease",
        authors: "Rees K, Takeda A, Martin N, et al.",
        journal: "Cochrane Database of Systematic Reviews",
        year: 2019,
        doi: "10.1002/14651858.CD009825.pub3",
        pmid: "30864165"
      }
    ],
    kernaussage: "Die Mittelmeer-Diät ist keine klassische Abnehmdiät, sondern ein Ernährungsmuster mit reichlich Olivenöl, Gemüse, Hülsenfrüchten, Fisch und Nüssen. Die große spanische PREDIMED-RCT zeigte über rund fünf Jahre eine etwa 30 % geringere Rate schwerer Herz-Kreislauf-Ereignisse (Herzinfarkt, Schlaganfall, kardiovaskulärer Tod) – eine der wenigen Ernährungsformen mit harter Endpunkt-Evidenz aus einer randomisierten Studie.",
    faqs: [
      {
        question: "Kann man mit der Mittelmeer-Diät abnehmen?",
        answer: "Nicht automatisch. Die PREDIMED-Studie schränkte die Kalorien nicht ein, und die Gewichtsunterschiede zwischen den Gruppen waren gering. Die Mittelmeer-Diät ist mit Olivenöl und Nüssen relativ energiedicht. Zum Abnehmen braucht es auch hier ein Kaloriendefizit – die Prinzipien lassen sich aber gut mit reduzierten Portionen kombinieren."
      },
      {
        question: "Was hat die PREDIMED-Studie konkret gezeigt?",
        answer: "In rund 7.400 Hochrisiko-Patienten senkte die Mittelmeer-Diät mit Olivenöl oder Nüssen über knapp fünf Jahre die Rate schwerer Herz-Kreislauf-Ereignisse (Herzinfarkt, Schlaganfall, kardiovaskulärer Tod) um etwa 30 % gegenüber einer fettarmen Kontrolldiät (Hazard Ratio ca. 0,69–0,72)."
      },
      {
        question: "Wurde die PREDIMED-Studie nicht zurückgezogen?",
        answer: "Die Originalpublikation von 2013 wurde 2018 wegen Mängeln bei der Randomisierung zurückgezogen und mit korrigierter Analyse erneut veröffentlicht. Das zentrale Ergebnis – die deutliche Senkung kardiovaskulärer Ereignisse – blieb auch nach der Neuanalyse bestehen."
      },
      {
        question: "Für wen gilt der 30-Prozent-Effekt?",
        answer: "PREDIMED untersuchte Menschen mit hohem kardiovaskulärem Risiko (Typ-2-Diabetes oder mehrere Risikofaktoren) in Spanien. Der Effekt lässt sich nicht eins zu eins auf junge, gesunde Menschen oder andere Ernährungskulturen übertragen."
      },
      {
        question: "Was sind die Grundpfeiler der Mittelmeer-Diät?",
        answer: "Reichlich Gemüse, Obst, Hülsenfrüchte und Vollkorn, Olivenöl als Hauptfettquelle, Fisch und Nüsse regelmäßig, wenig rotes und verarbeitetes Fleisch sowie wenig Zucker. Frisches Obst ersetzt typischerweise Süßigkeiten als Dessert."
      }
    ]
  },
  {
    slug: "formula-diaet-abnehmshakes-direct-studie-mahlzeitenersatz",
    title: "Abnehmshakes und Formula-Diäten: Was die DiRECT-Studie zeigt",
    description: "DiRECT-RCT: Ärztlich begleitete Formula-Diät erreichte bei 46 Prozent eine Typ-2-Diabetes-Remission nach einem Jahr. Was Abnehmshakes können – und was nicht.",
    tags: [
      "abnehmshakes",
      "formula diät",
      "mahlzeitenersatz",
      "direct studie",
      "typ-2-diabetes",
      "gewichtsabnahme",
      "remission",
      "abnehmshakes test"
    ],
    relatedCalculators: [
      "kaloriendefizit-berechnen",
      "kalorienbedarf-berechnen",
      "protein-bedarf-rechner"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Primary care-led weight management for remission of type 2 diabetes (DiRECT): an open-label, cluster-randomised trial",
        authors: "Lean MEJ, Leslie WS, Barnes AC, Brosnahan N, Thom G, McCombie L, Taylor R, et al.",
        journal: "The Lancet",
        year: 2018,
        doi: "10.1016/S0140-6736(17)33102-1",
        pmid: "29221645"
      },
      {
        title: "Durability of a primary care-led weight-management intervention for remission of type 2 diabetes: 2-year results of the DiRECT open-label, cluster-randomised trial",
        authors: "Lean MEJ, Leslie WS, Barnes AC, Brosnahan N, Thom G, McCombie L, Taylor R, et al.",
        journal: "The Lancet Diabetes & Endocrinology",
        year: 2019,
        doi: "10.1016/S2213-8587(19)30068-3",
        pmid: "30852132"
      }
    ],
    kernaussage: "Formula-Diäten mit Abnehmshakes können wirken: In der DiRECT-Studie (cluster-randomisiertes RCT, n=298) erreichten 46 Prozent der Teilnehmer nach einem Jahr eine Typ-2-Diabetes-Remission, gegenüber 4 Prozent in der Standardversorgung. Entscheidend war jedoch nicht der Shake allein, sondern das komplette ärztlich begleitete Programm: rund 12 Wochen ausschließlich Formula, dann strukturierte Wiedereinführung normaler Kost und langfristige Gewichtserhaltung.",
    faqs: [
      {
        question: "Funktionieren Abnehmshakes laut DiRECT-Studie wirklich?",
        answer: "In DiRECT erreichten 46 Prozent der Teilnehmer mit einer ärztlich begleiteten Formula-Diät nach einem Jahr eine Typ-2-Diabetes-Remission, gegenüber 4 Prozent in der Standardversorgung. Die Shakes wirkten aber nur im Rahmen eines kompletten Programms mit Begleitung und strukturierter Wiedereinführung normaler Kost – nicht als frei gekauftes Produkt allein."
      },
      {
        question: "Warum führte die Formula-Diät zur Diabetes-Remission?",
        answer: "Der entscheidende Faktor war der Gewichtsverlust, nicht der Shake selbst. Wer 15 kg oder mehr verlor, erreichte zu 86 Prozent eine Remission, bei unter 5 kg nur zu 7 Prozent. Die Formula-Phase mit rund 825 bis 853 Kilokalorien pro Tag machte ein starkes, durchhaltbares Kaloriendefizit möglich."
      },
      {
        question: "Halten die Erfolge der Formula-Diät langfristig an?",
        answer: "Nach zwei Jahren befanden sich noch 36 Prozent der Interventionsgruppe in Remission, der mittlere Gewichtsverlust war von etwa 10 kg auf rund 7,6 kg gesunken. Der Effekt ist real, erodiert aber, wenn das Gewicht nicht gehalten wird. Dauerhafte Verhaltensänderung ist entscheidend."
      },
      {
        question: "Sind frei verkäufliche Abnehmshakes mit der DiRECT-Diät vergleichbar?",
        answer: "Nur eingeschränkt. DiRECT war ein intensiv ärztlich betreutes Programm mit kontrolliertem Absetzen von Medikamenten und langfristiger Begleitung. Drogerie- oder Online-Shakes bieten diese Struktur nicht. Wer Diabetes-Medikamente nimmt, sollte eine solche Diät nie ohne ärztliche Begleitung beginnen."
      },
      {
        question: "Für wen gelten die DiRECT-Ergebnisse?",
        answer: "Die Studie untersuchte Menschen mit Typ-2-Diabetes, der höchstens sechs Jahre bestand. Die Ergebnisse lassen sich nicht ohne Weiteres auf gesunde Abnehmwillige oder Menschen mit langjährigem Diabetes übertragen. Das primäre Ziel war Diabetes-Remission, nicht reine Gewichtsabnahme."
      }
    ]
  },
  {
    slug: "abnehmtabletten-orlistat-otc-mittel-evidenz",
    title: "Abnehmtabletten im Faktencheck: Orlistat und frei verkaeufliche Mittel",
    description: "Orlistat senkt das Gewicht im Schnitt nur um etwa 2,9 kg mehr als Placebo. Was Fettbinder, Glucomannan und Co. wirklich koennen.",
    tags: [
      "abnehmtabletten",
      "orlistat",
      "abnehmpillen",
      "fettbinder",
      "glucomannan",
      "gewichtsverlust",
      "evidenz"
    ],
    relatedCalculators: [
      "kaloriendefizit-berechnen",
      "bmi-rechner",
      "kalorienbedarf-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Long term pharmacotherapy for obesity and overweight: updated meta-analysis",
        authors: "Rucker D, Padwal R, Li SK, Curioni C, Lau DCW",
        journal: "BMJ",
        year: 2007,
        doi: "10.1136/bmj.39385.413113.25",
        pmid: "18006966"
      },
      {
        title: "The efficacy of glucomannan supplementation in overweight and obesity: a systematic review and meta-analysis of randomized clinical trials",
        authors: "Onakpoya I, Posadzki P, Ernst E",
        journal: "Journal of the American College of Nutrition",
        year: 2014,
        doi: "10.1080/07315724.2014.870013",
        pmid: "24586952"
      },
      {
        title: "Effect of Low-Fat vs Low-Carbohydrate Diet on 12-Month Weight Loss in Overweight Adults and the Association With Genotype Pattern or Insulin Secretion: The DIETFITS Randomized Clinical Trial",
        authors: "Gardner CD, Trepanowski JF, Del Gobbo LC, et al.",
        journal: "JAMA",
        year: 2018,
        doi: "10.1001/jama.2018.0245",
        pmid: "29466592"
      }
    ],
    kernaussage: "Von den vielen Abnehmtabletten hat nur Orlistat solide Studienevidenz: In Meta-Analysen verlieren Anwender etwa 2,9 kg mehr als mit Placebo, und das nur in Kombination mit reduzierter Kalorienzufuhr. Glucomannan zeigt allenfalls einen kleinen, unsicheren Effekt. Die meisten frei verkaeuflichen Fettbinder und Pillen sind wissenschaftlich kaum belegt. Eine Ernaehrungsumstellung bleibt die Basis.",
    faqs: [
      {
        question: "Wirken Abnehmtabletten wirklich?",
        answer: "Nur Orlistat hat solide Studienevidenz und bringt im Mittel etwa 2,9 kg mehr Gewichtsverlust als Placebo ueber rund ein Jahr und das nur zusammen mit einer kalorienreduzierten Ernaehrung. Die meisten frei verkaeuflichen Mittel sind wissenschaftlich kaum belegt."
      },
      {
        question: "Was bringt Orlistat genau?",
        answer: "Orlistat blockiert ein Enzym, das Nahrungsfett im Darm spaltet, sodass ein Teil unverdaut ausgeschieden wird. In Meta-Analysen liegt der Zusatz-Gewichtsverlust bei etwa 2,9 kg gegenueber Placebo. Haeufige Nebenwirkungen sind Fettstuehle, Blaehungen und Stuhldrang, besonders bei fettreicher Kost."
      },
      {
        question: "Helfen Fettbinder und Glucomannan beim Abnehmen?",
        answer: "Eine Meta-Analyse fand fuer Glucomannan keinen statistisch klaren Effekt auf das Koerpergewicht. Die EFSA erkennt nur einen Beitrag im Rahmen einer kalorienreduzierten Ernaehrung an. Fuer viele andere Fettbinder fehlen hochwertige Studien."
      },
      {
        question: "Kann ich nur mit Tabletten abnehmen, ohne meine Ernaehrung umzustellen?",
        answer: "Nein. Auch der belegte Orlistat-Effekt zeigt sich ausschliesslich in Kombination mit einer reduzierten Kalorienzufuhr. Ohne Kaloriendefizit nehmen Sie nicht ab. Die Ernaehrungsumstellung ist die eigentliche Stellschraube."
      },
      {
        question: "Sind Abnehmtabletten gefaehrlich?",
        answer: "Rezeptpflichtige Mittel wie Orlistat haben bekannte Nebenwirkungen und sollten aerztlich begleitet werden, vor allem bei Vorerkrankungen oder anderen Medikamenten. Bei frei verkaeuflichen Produkten ist die Qualitaet sehr unterschiedlich klaeren Sie die Einnahme im Zweifel mit Ihrer Aerztin oder Ihrem Arzt ab."
      }
    ]
  },
  {
    slug: "abnehmen-in-den-wechseljahren-was-hilft",
    title: "Abnehmen in den Wechseljahren: Warum es schwerer wird und was hilft",
    description: "Studien zeigen: In der Menopause verschiebt sich Fett nach innen (viszeral). Krafttraining, mehr Protein und ein moderates Defizit wirken trotzdem.",
    tags: [
      "abnehmen in den wechseljahren",
      "wechseljahre abnehmen",
      "abnehmen menopause",
      "gewichtszunahme wechseljahre",
      "bauchfett wechseljahre",
      "krafttraining frauen",
      "protein",
      "viszerales fett"
    ],
    relatedCalculators: [
      "grundumsatz-rechner",
      "protein-bedarf-rechner",
      "kalorienbedarf-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Daily energy expenditure through the human life course",
        authors: "Pontzer H, Yamada Y, Sagayama H, et al.",
        journal: "Science",
        year: 2021,
        doi: "10.1126/science.abe5017",
        pmid: "34385400"
      },
      {
        title: "Progressive resistance strength training for improving physical function in older adults",
        authors: "Liu CJ, Latham NK",
        journal: "Cochrane Database of Systematic Reviews",
        year: 2009,
        doi: "10.1002/14651858.CD002759.pub2",
        pmid: "19588334"
      },
      {
        title: "Effects of dietary protein intake on body composition changes after weight loss in older adults: a systematic review and meta-analysis",
        authors: "Kim JE, O'Connor LE, Sands LP, Slebodnik MB, Campbell WW",
        journal: "Nutrition Reviews",
        year: 2016,
        doi: "10.1093/nutrit/nuv065",
        pmid: "26883880"
      },
      {
        title: "Changes in regional fat distribution and anthropometric measures across the menopause transition (SWAN)",
        authors: "Greendale GA, Sternfeld B, Huang M, et al.",
        journal: "JCI Insight",
        year: 2019,
        doi: "10.1172/jci.insight.124865",
        pmid: "30843880"
      }
    ],
    kernaussage: "In den Wechseljahren steigt das Gewicht vor allem altersbedingt; der sinkende Östrogenspiegel verlagert Fett aber zunehmend in den Bauchraum (viszeral). Der Grundumsatz bricht nicht plötzlich ein. Wirksam bleiben dieselben Hebel wie immer, nur konsequenter: ein moderates Kaloriendefizit, ausreichend Protein zum Erhalt der Muskelmasse und Krafttraining gegen den altersbedingten Muskelabbau.",
    faqs: [
      {
        question: "Verlangsamt sich der Stoffwechsel in den Wechseljahren wirklich?",
        answer: "Nicht so abrupt, wie oft angenommen. Eine grosse Auswertung mit der Goldstandard-Methode Doubly Labelled Water (Pontzer et al., Science 2021) zeigt, dass der Energieverbrauch pro fettfreier Masse zwischen etwa 20 und 60 Jahren stabil bleibt. Der Ruheverbrauch sinkt vor allem, weil mit dem Alter Muskelmasse verloren geht – ein Prozess, dem man mit Krafttraining aktiv entgegenwirken kann."
      },
      {
        question: "Warum nimmt gerade das Bauchfett in der Menopause zu?",
        answer: "Der sinkende Oestrogenspiegel verschiebt die Fetteinlagerung vom Hueft- und Oberschenkelbereich hin zum viszeralen Fett im Bauchraum. Laengsschnittdaten der SWAN-Studie zeigen, dass dieser viszerale Anteil im Menopausenuebergang staerker ansteigt, als es das Alter allein erklaeren wuerde. Deshalb kann der Taillenumfang zunehmen, selbst wenn das Gewicht gleich bleibt."
      },
      {
        question: "Wie viel Protein sollte ich in den Wechseljahren essen?",
        answer: "Als Orientierung gelten etwa 1,2-1,6 g pro Kilogramm Koerpergewicht pro Tag, gut ueber die Mahlzeiten verteilt. In einer Diaetphase hilft die hoehere Zufuhr, Muskelmasse zu erhalten (Kim et al., 2016). In Kombination mit Krafttraining ist der Effekt am groessten."
      },
      {
        question: "Hilft Krafttraining wirklich beim Abnehmen in der Menopause?",
        answer: "Ja, indirekt und direkt. Ein Cochrane-Review belegt, dass progressives Widerstandstraining bei aelteren Erwachsenen Kraft und Funktion verbessert und dem Muskelverlust entgegenwirkt. Mehr Muskelmasse stabilisiert den Ruheverbrauch und verbessert die Koerperzusammensetzung – wichtiger als die reine Zahl auf der Waage."
      },
      {
        question: "Reicht ein Kaloriendefizit allein aus?",
        answer: "Ein moderates Defizit von etwa 300-500 kcal pro Tag ist die Grundlage jeder Gewichtsabnahme. Ohne ausreichend Protein und Krafttraining verliert man im Defizit aber auch Muskelmasse, was den Stoffwechsel weiter senkt. Die Kombination aus moderatem Defizit, Protein und Training ist deshalb klar ueberlegen."
      }
    ]
  },
  {
    slug: "1200-kalorien-diaet-risiken-sehr-niedrigkalorisch",
    title: "1200-Kalorien-Diät: Sinnvoll oder zu wenig? Risiken im Überblick",
    description: "1200 kcal liegen für viele Erwachsene unter dem Grundumsatz. Warum sehr niedrigkalorische Diäten in ärztliche Begleitung gehören – die Studienlage.",
    tags: [
      "1200 Kalorien",
      "Sehr niedrigkalorische Diät",
      "VLCD",
      "Grundumsatz",
      "Abnehmen",
      "Kaloriendefizit",
      "Jojo-Effekt",
      "Crash-Diät"
    ],
    relatedCalculators: [
      "grundumsatz-rechner",
      "kaloriendefizit-berechnen",
      "kalorienbedarf-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 8,
    sources: [
      {
        title: "A new predictive equation for resting energy expenditure in healthy individuals",
        authors: "Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO",
        journal: "The American Journal of Clinical Nutrition",
        year: 1990,
        doi: "10.1093/ajcn/51.2.241",
        pmid: "2305711"
      },
      {
        title: "Primary care-led weight management for remission of type 2 diabetes (DiRECT): an open-label, cluster-randomised trial",
        authors: "Lean MEJ, Leslie WS, Barnes AC, et al.",
        journal: "The Lancet",
        year: 2018,
        doi: "10.1016/S0140-6736(17)33102-1",
        pmid: "29221645"
      },
      {
        title: "Clinical effectiveness of very-low-energy diets in the management of weight loss: a systematic review and meta-analysis of randomized controlled trials",
        authors: "Parretti HM, Jebb SA, Johns DJ, Lewis AL, Christian-Brown AM, Aveyard P",
        journal: "Obesity Reviews",
        year: 2016,
        doi: "10.1111/obr.12366"
      },
      {
        title: "Long-Term Persistence of Hormonal Adaptations to Weight Loss",
        authors: "Sumithran P, Prendergast LA, Delbridge E, et al.",
        journal: "New England Journal of Medicine",
        year: 2011,
        doi: "10.1056/NEJMoa1105816",
        pmid: "22029981"
      }
    ],
    kernaussage: "Eine pauschale 1200-Kalorien-Diät liegt für viele Erwachsene unter dem Grundumsatz und ist damit eine sehr niedrigkalorische Diät (VLCD). Solche Diäten führen zwar zu schnellem Gewichtsverlust, gehören laut Studienlage (DiRECT, Lancet 2018) aber in ärztliche Begleitung – wegen Risiken wie Muskelabbau, Nährstoffmangel und einer hormonellen Anpassung, die den Hunger über ein Jahr lang erhöht (Sumithran, NEJM 2011).",
    faqs: [
      {
        question: "Sind 1200 Kalorien am Tag zu wenig?",
        answer: "Für viele Erwachsene ja. Der Grundumsatz – also die Energie in völliger Ruhe – liegt nach der Mifflin-St-Jeor-Formel bei einer 70-kg-Frau bei rund 1400 kcal und bei einem 85-kg-Mann bei etwa 1750 kcal. 1200 kcal liegen damit oft unter dem, was der Körper schon ohne jede Bewegung verbraucht. Ob 1200 kcal für Sie zu wenig sind, hängt von Geschlecht, Gewicht, Größe, Alter und Aktivität ab."
      },
      {
        question: "Was ist eine sehr niedrigkalorische Diät (VLCD)?",
        answer: "Als sehr niedrigkalorische Diät (Very Low Calorie Diet) gelten in der Regel Pläne unter etwa 800 kcal pro Tag, meist als Formuladiät. Niedrigkalorische Diäten (LCD) liegen bei rund 800–1200 kcal. Eine 1200-Kalorien-Diät bewegt sich am oberen Rand der LCD, kann aber individuell – wenn sie unter dem Grundumsatz liegt – ähnlich restriktiv wirken."
      },
      {
        question: "Funktioniert eine sehr niedrigkalorische Diät überhaupt?",
        answer: "Ja, unter Aufsicht. In der DiRECT-Studie (Lancet 2018) verloren 24 % der Teilnehmenden unter einer ärztlich begleiteten Formuladiät (~825–853 kcal) mindestens 15 kg, und 46 % erreichten eine Diabetes-Remission. Entscheidend war die strukturierte Begleitung mit kontrolliertem Wiedereinstieg – nicht ein Selbstversuch."
      },
      {
        question: "Warum nimmt man nach einer Crash-Diät oft wieder zu?",
        answer: "Nach starkem Gewichtsverlust passt sich der Hormonhaushalt an: Das Hungerhormon Ghrelin steigt, das Sättigungshormon Leptin sinkt. Laut einer NEJM-Studie (Sumithran 2011) bleibt diese Veränderung mindestens 12 Monate messbar. Der Körper signalisiert also lange anhaltenden Hunger, was den Jojo-Effekt begünstigt."
      },
      {
        question: "Wie viele Kalorien sollte ich stattdessen zum Abnehmen essen?",
        answer: "Für die meisten Menschen reicht ein moderates Defizit von 300–500 kcal unter dem individuellen Gesamtbedarf. Das schützt Muskelmasse, deckt den Nährstoffbedarf leichter und ist nachhaltiger durchzuhalten. Berechnen Sie zuerst Ihren Grundumsatz und Gesamtbedarf, statt eine pauschale Zahl wie 1200 kcal zu übernehmen."
      }
    ]
  },
  {
    slug: "insulinresistenz-abnehmen-evidenz",
    title: "Insulinresistenz und Abnehmen: Was Studien wirklich zeigen",
    description: "Studien zeigen: Bei Insulinresistenz zaehlt vor allem das Kaloriendefizit. DIETFITS fand keinen Vorteil von Low-Carb (Gewichtsdifferenz 0,7 kg, n.s.).",
    tags: [
      "insulinresistenz",
      "abnehmen",
      "ernaehrung",
      "low-carb",
      "stoffwechsel",
      "kaloriendefizit",
      "homa-index",
      "evidenz"
    ],
    relatedCalculators: [
      "kaloriendefizit-berechnen",
      "kalorienbedarf-berechnen",
      "makros-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Effect of Low-Fat vs Low-Carbohydrate Diet on 12-Month Weight Loss in Overweight Adults and the Association With Genotype Pattern or Insulin Secretion: The DIETFITS Randomized Clinical Trial",
        authors: "Gardner CD, Trepanowski JF, Del Gobbo LC, et al.",
        journal: "JAMA",
        year: 2018,
        doi: "10.1001/jama.2018.0245",
        pmid: "29466592"
      },
      {
        title: "Primary care-led weight management for remission of type 2 diabetes (DiRECT): an open-label, cluster-randomised trial",
        authors: "Lean ME, Leslie WS, Barnes AC, et al.",
        journal: "The Lancet",
        year: 2018,
        doi: "10.1016/S0140-6736(17)33102-1",
        pmid: "29221645"
      },
      {
        title: "Cardiovascular Effects of Intensive Lifestyle Intervention in Type 2 Diabetes (Look AHEAD)",
        authors: "The Look AHEAD Research Group",
        journal: "New England Journal of Medicine",
        year: 2013,
        doi: "10.1056/NEJMoa1212914",
        pmid: "23796131"
      },
      {
        title: "Calorie for Calorie, Dietary Fat Restriction Results in More Body Fat Loss than Carbohydrate Restriction in People with Obesity",
        authors: "Hall KD, Bemis T, Brychta R, et al.",
        journal: "Cell Metabolism",
        year: 2015,
        doi: "10.1016/j.cmet.2015.07.021",
        pmid: "26278052"
      }
    ],
    kernaussage: "Insulinresistenz macht das Abnehmen nicht durch ein \"blockierendes\" Hormon unmoeglich, sondern vor allem ueber Kalorien. Studien wie DIETFITS zeigen: Bei gleicher Kalorienzufuhr nehmen Menschen mit Low-Carb und Low-Fat etwa gleich viel ab, unabhaengig vom Insulinstatus. Entscheidend ist der Gewichtsverlust selbst, der die Insulinsensitivitaet messbar verbessert, wie DiRECT und Look AHEAD belegen.",
    faqs: [
      {
        question: "Kann man mit Insulinresistenz ueberhaupt abnehmen?",
        answer: "Ja. Insulinresistenz blockiert die Gewichtsabnahme nicht. Entscheidend ist ein nachhaltiges Kaloriendefizit. Studien wie DiRECT zeigen sogar, dass der Gewichtsverlust selbst die Insulinsensitivitaet wieder verbessert und Typ-2-Diabetes in einem grossen Teil der Faelle in Remission gehen kann."
      },
      {
        question: "Muss ich bei Insulinresistenz Low-Carb essen?",
        answer: "Nicht zwingend. In der DIETFITS-Studie nahmen Low-Carb- und Low-Fat-Gruppen etwa gleich viel ab, und der Insulinstatus sagte nicht vorher, welche Diaet besser wirkt. Low-Carb kann den Blutzucker kurzfristig staerker senken, aber fuer den Gewichtsverlust zaehlt vor allem, dass Sie die Ernaehrung durchhalten."
      },
      {
        question: "Was ist der HOMA-Index?",
        answer: "Der HOMA-Index (Homeostasis Model Assessment) ist ein aus Nuechtern-Insulin und Nuechtern-Blutzucker berechneter Wert, der die Insulinresistenz abschaetzt. Ein hoeherer Wert deutet auf staerkere Insulinresistenz hin. Er dient der aerztlichen Verlaufskontrolle und sollte nicht isoliert interpretiert werden."
      },
      {
        question: "Verbessert Abnehmen die Insulinsensitivitaet wirklich?",
        answer: "Ja, und der Effekt ist gut belegt. In DiRECT erreichten 46 Prozent der Teilnehmenden durch Gewichtsverlust eine Diabetes-Remission, wobei groessere Gewichtsverluste mit hoeheren Remissionsraten einhergingen. Auch Bewegung, besonders Krafttraining, steigert die Insulinsensitivitaet."
      }
    ]
  },
  {
    slug: "gruener-tee-stoffwechsel-abnehmen-meta-analyse",
    title: "Grüner Tee und Stoffwechsel: Was die Meta-Analysen zum Abnehmen zeigen",
    description: "Cochrane-Daten zeigen: Grüntee senkt das Gewicht im Schnitt nur um etwa 0,2 kg – klinisch kaum relevant. Was Catechine und EGCG wirklich bewirken.",
    tags: [
      "grüner tee abnehmen",
      "grüntee stoffwechsel",
      "egcg",
      "fettverbrennung",
      "matcha",
      "catechine",
      "meta-analyse",
      "gewichtsabnahme"
    ],
    relatedCalculators: [
      "kalorienverbrauch-rechner",
      "kaloriendefizit-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 6,
    sources: [
      {
        title: "Green tea for weight loss and weight maintenance in overweight or obese adults",
        authors: "Jurgens TM, Whelan AM, Killian L, Doucette S, Kirk S, Foy E",
        journal: "Cochrane Database of Systematic Reviews",
        year: 2012,
        doi: "10.1002/14651858.CD008650.pub2"
      },
      {
        title: "Effect of green tea catechins with or without caffeine on anthropometric measures: a systematic review and meta-analysis",
        authors: "Phung OJ, Baker WL, Matthews LJ, Lanosa M, Thorne A, Coleman CI",
        journal: "American Journal of Clinical Nutrition",
        year: 2010,
        pmid: "19906797"
      },
      {
        title: "The effects of green tea on weight loss and weight maintenance: a meta-analysis",
        authors: "Hursel R, Viechtbauer W, Westerterp-Plantenga MS",
        journal: "International Journal of Obesity",
        year: 2009,
        pmid: "19597519"
      },
      {
        title: "Scientific opinion on the safety of green tea catechins",
        authors: "EFSA Panel on Food Additives and Nutrient Sources added to Food (ANS)",
        journal: "EFSA Journal",
        year: 2018,
        doi: "10.2903/j.efsa.2018.5239"
      }
    ],
    kernaussage: "Grüner Tee und sein Wirkstoff EGCG kurbeln den Stoffwechsel laut Meta-Analysen nur minimal an. Der Cochrane-Review fand bei übergewichtigen Erwachsenen eine durchschnittliche Gewichtsabnahme von rund 0,2 kg gegenüber Kontrolle – ein statistisch nachweisbarer, aber klinisch bedeutungsloser Effekt. Grüntee ersetzt kein Kaloriendefizit und ist als Abnehmhilfe weitgehend wirkungslos.",
    faqs: [
      {
        question: "Hilft grüner Tee wirklich beim Abnehmen?",
        answer: "Nur sehr begrenzt. Der methodisch strengste Beleg, der Cochrane-Review von 2012, fand bei übergewichtigen Erwachsenen eine durchschnittliche Gewichtsabnahme von nur rund 0,2 kg gegenüber Kontrolle – statistisch und klinisch nicht bedeutsam. Grüner Tee ersetzt kein Kaloriendefizit."
      },
      {
        question: "Wie stark kurbelt EGCG den Stoffwechsel an?",
        answer: "Messbar, aber minimal. Grüntee-Extrakt plus Koffein erhöht den 24-Stunden-Energieumsatz in Studien um etwa 4 Prozent, grob 80 kcal pro Tag. Dieser kleine Mehrverbrauch wird durch normale Alltagsschwankungen leicht ausgeglichen und führt nicht zu relevantem Gewichtsverlust."
      },
      {
        question: "Wirkt EGCG ohne Koffein genauso gut?",
        answer: "Nein. Mehrere Meta-Analysen zeigen, dass der thermogene Effekt vor allem in Kombination von Catechinen und Koffein auftritt. Entkoffeinierter Grüntee schneidet schwächer ab, und bei hohem gewohnheitsmässigem Koffeinkonsum verringert sich der Zusatzeffekt weiter."
      },
      {
        question: "Ist Matcha besser zum Abnehmen als normaler Grüntee?",
        answer: "Matcha liefert pro Portion mehr Catechine und Koffein, weil das ganze Blatt verzehrt wird. Belastbare RCTs speziell zur Gewichtsabnahme durch Matcha fehlen jedoch. Es gibt keinen Beleg, dass Matcha einen klinisch relevanten Abnehmeffekt erzielt."
      },
      {
        question: "Sind hochdosierte Grüntee-Extrakte zum Abnehmen sicher?",
        answer: "Vorsicht ist angebracht. Die EFSA stuft EGCG-Dosen ab 800 mg pro Tag aus Extrakten als möglicherweise leberschädigend ein. Da der Abnehmeffekt ohnehin klein ist, überwiegen bei hochdosierten Präparaten die Risiken den geringen Nutzen. Aufgegossener Tee in üblichen Mengen ist die sichere Wahl."
      }
    ]
  },
  {
    slug: "hcg-stoffwechselkur-faktencheck-studien",
    title: "HCG- und Stoffwechselkur im Faktencheck: Was Studien wirklich zeigen",
    description: "HCG wirkt in kontrollierten Studien nur auf Placebo-Niveau (Lijesen-Meta-Analyse, 24 Studien). Der Gewichtsverlust kommt allein von der 500-kcal-Diät.",
    tags: [
      "HCG Diät",
      "Stoffwechselkur",
      "HCG Tropfen",
      "Crash-Diät",
      "Kaloriendefizit",
      "Abnehmen",
      "Diät-Mythen",
      "Jojo-Effekt"
    ],
    relatedCalculators: [
      "kaloriendefizit-berechnen",
      "grundumsatz-rechner"
    ],
    publishedAt: "2026-06-16",
    readingTime: 8,
    sources: [
      {
        title: "The effect of human chorionic gonadotropin (HCG) in the treatment of obesity by means of the Simeons therapy: a criteria-based meta-analysis",
        authors: "Lijesen GK, Theeuwen I, Assendelft WJ, Van Der Wal G",
        journal: "British Journal of Clinical Pharmacology",
        year: 1995,
        doi: "10.1111/j.1365-2125.1995.tb05779.x",
        pmid: "8527285"
      },
      {
        title: "Ineffectiveness of human chorionic gonadotropin in weight reduction: a double-blind study",
        authors: "Stein MR, Julis RE, Peck CC, Hinshaw W, Sawicki JE, Deller JJ Jr",
        journal: "The American Journal of Clinical Nutrition",
        year: 1976,
        doi: "10.1093/ajcn/29.9.940"
      },
      {
        title: "Primary care-led weight management for remission of type 2 diabetes (DiRECT): an open-label, cluster-randomised trial",
        authors: "Lean MEJ, Leslie WS, Barnes AC, et al.",
        journal: "The Lancet",
        year: 2018,
        doi: "10.1016/S0140-6736(17)33102-1",
        pmid: "29221645"
      },
      {
        title: "Long-Term Persistence of Hormonal Adaptations to Weight Loss",
        authors: "Sumithran P, Prendergast LA, Delbridge E, et al.",
        journal: "New England Journal of Medicine",
        year: 2011,
        doi: "10.1056/NEJMoa1105816",
        pmid: "22029981"
      }
    ],
    kernaussage: "Der Gewichtsverlust bei der HCG- oder Stoffwechselkur entsteht ausschließlich durch die extreme Kalorienrestriktion auf rund 500 kcal pro Tag – nicht durch das Hormon HCG. Eine Meta-Analyse von 24 Studien (Lijesen, Br J Clin Pharmacol 1995) und kontrollierte Doppelblindstudien (Stein, AJCN 1976) zeigen übereinstimmend, dass HCG gegenüber Placebo keinen Vorteil bei Gewicht, Hunger oder Fettverteilung bringt. Die 500-kcal-Diät selbst gilt als sehr niedrigkalorisch und gesundheitlich riskant.",
    faqs: [
      {
        question: "Wirkt die HCG-Diät wirklich oder ist es nur die Diät?",
        answer: "Es ist die Diät. In kontrollierten Doppelblindstudien verloren HCG- und Placebo-Gruppe bei identischer 500-kcal-Diät gleich viel Gewicht (Stein, AJCN 1976). Eine Meta-Analyse von 24 Studien (Lijesen, Br J Clin Pharmacol 1995) bestätigt: HCG bringt keinen Vorteil gegenüber Placebo. Der Gewichtsverlust kommt allein aus der drastischen Kalorienrestriktion."
      },
      {
        question: "Sind HCG-Tropfen oder -Globuli sinnvoll zum Abnehmen?",
        answer: "Nein. Für HCG – egal ob als Injektion, Tropfen oder homöopathische Globuli – gibt es keine belastbare Evidenz, dass es beim Abnehmen hilft. Globuli enthalten zudem oft praktisch kein HCG mehr. Der Effekt der Kur stammt vollständig von der begleitenden 500-kcal-Diät, nicht vom Produkt."
      },
      {
        question: "Warum nimmt man mit der Stoffwechselkur trotzdem ab?",
        answer: "Weil rund 500 kcal pro Tag weit unter dem Energiebedarf liegen. Schon der Grundumsatz beträgt bei vielen Erwachsenen 1.400–1.750 kcal. Bei so wenig Energie entsteht ein riesiges Defizit, und Gewichtsverlust ist die zwangsläufige Folge – mit oder ohne HCG."
      },
      {
        question: "Ist die HCG-Stoffwechselkur gefährlich?",
        answer: "Die 500-kcal-Basis gilt als sehr niedrigkalorische Diät. Im unbegleiteten Selbstversuch drohen Nährstoffmangel, Muskelabbau und ein erhöhtes Gallenstein-Risiko durch den schnellen Gewichtsverlust. Hinzu kommt eine hormonelle Anpassung, die den Hunger über ein Jahr lang erhöht (Sumithran, NEJM 2011) und den Jojo-Effekt begünstigt."
      },
      {
        question: "Was ist eine bessere Alternative zur HCG-Kur?",
        answer: "Ein moderates, individuell berechnetes Kaloriendefizit von 300–500 kcal unter dem Gesamtbedarf, kombiniert mit ausreichend Protein. Das schützt die Muskelmasse, ist nachhaltiger durchzuhalten und kommt ohne fragwürdige Hormonprodukte aus. Wer eine sehr niedrigkalorische Diät braucht, sollte sie ärztlich begleiten lassen."
      }
    ]
  },
  {
    slug: "body-recomposition-muskelaufbau-fettabbau-gleichzeitig",
    title: "Body Recomposition: Muskelaufbau und Fettabbau gleichzeitig – geht das?",
    description: "Body Recomposition ist real: In einer RCT bauten Anfaenger in 4 Wochen 1,2 kg Muskeln auf und verloren 4,8 kg Fett – mit viel Protein und Krafttraining.",
    tags: [
      "body recomposition",
      "muskelaufbau",
      "fettabbau",
      "protein",
      "krafttraining",
      "koerperzusammensetzung",
      "abnehmen",
      "kaloriendefizit"
    ],
    relatedCalculators: [
      "protein-bedarf-rechner",
      "makros-berechnen",
      "koerperfett-rechner"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Higher compared with lower dietary protein during an energy deficit combined with intense exercise promotes greater lean mass gain and fat mass loss: a randomized trial",
        authors: "Longland TM, Oikawa SY, Mitchell CJ, Devries MC, Phillips SM",
        journal: "The American Journal of Clinical Nutrition",
        year: 2016,
        doi: "10.3945/ajcn.115.119339",
        pmid: "26817506"
      },
      {
        title: "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults",
        authors: "Morton RW, Murphy KT, McKellar SR, Schoenfeld BJ, Henselmans M, Helms E, Aragon AA, Devries MC, Banfield L, Krieger JW, Phillips SM",
        journal: "British Journal of Sports Medicine",
        year: 2018,
        doi: "10.1136/bjsports-2017-097608",
        pmid: "28698222"
      }
    ],
    kernaussage: "Gleichzeitiger Muskelaufbau und Fettabbau (Body Recomposition) ist wissenschaftlich belegt, aber nicht fuer alle gleich gut. Am staerksten profitieren Trainingseinsteiger, Uebergewichtige und Personen nach langer Trainingspause. Voraussetzung sind eine hohe Proteinzufuhr (etwa 1,6 g pro kg Koerpergewicht), regelmaessiges Krafttraining und ein nur moderates Kaloriendefizit. Fortgeschrittene und schlanke Trainierte erzielen dagegen meist nur sehr geringe Recomp-Effekte.",
    faqs: [
      {
        question: "Kann man als Anfaenger gleichzeitig Muskeln aufbauen und Fett verlieren?",
        answer: "Ja, gerade Trainingseinsteiger profitieren am staerksten. Durch die starken Anpassungen an neue Trainingsreize (sogenannte Newbie Gains) kann der Koerper selbst in einem Kaloriendefizit Muskeln aufbauen. In einer Studie an untrainierten, uebergewichtigen Maennern gelang dies in nur vier Wochen, sofern viel Protein gegessen und konsequent Krafttraining betrieben wurde."
      },
      {
        question: "Wie viel Protein brauche ich fuer Body Recomposition?",
        answer: "Studien legen etwa 1,6 g Protein pro kg Koerpergewicht pro Tag als Orientierung nahe; oberhalb dieses Werts flacht der zusaetzliche Nutzen ab. Im Kaloriendefizit greifen viele Fachleute eher zu 1,6 bis 2,0 g pro kg, um die Muskulatur besser zu schuetzen. Verteilen Sie die Menge ueber mehrere Mahlzeiten am Tag."
      },
      {
        question: "Funktioniert Recomposition auch ohne Krafttraining?",
        answer: "Kaum. Krafttraining liefert den entscheidenden Reiz, der dem Koerper signalisiert, Muskulatur trotz Energiemangel zu erhalten oder aufzubauen. Wer im Defizit nur die Ernaehrung umstellt, verliert in der Regel neben Fett auch einen Teil seiner Muskelmasse."
      },
      {
        question: "Warum profitieren Fortgeschrittene kaum von Body Recomposition?",
        answer: "Bei jahrelang Trainierten ist das Muskelaufbaupotenzial weitgehend ausgereizt, und ihr Koerperfettanteil ist meist niedrig. Im Kaloriendefizit ueberwiegt dann der Muskelerhalt statt eines weiteren Aufbaus. Fuer sie ist es meist effizienter, gezielte Aufbau- und Diaetphasen abzuwechseln, statt beides gleichzeitig zu versuchen."
      },
      {
        question: "Warum bewegt sich meine Waage bei Body Recomposition kaum?",
        answer: "Weil zwei gegenlaeufige Prozesse parallel laufen: Sie verlieren Fett und bauen gleichzeitig Muskeln auf. Das Koerpergewicht kann deshalb stagnieren, obwohl sich die Koerperzusammensetzung und das Aussehen veraendern. Verlassen Sie sich daher nicht nur auf die Waage, sondern messen Sie zusaetzlich Umfaenge oder den Koerperfettanteil."
      }
    ]
  },
  {
    slug: "glykaemischer-index-glyx-diaet-evidenz",
    title: "Glykämischer Index und GLYX-Diät: Was die Evidenz zum Abnehmen sagt",
    description: "Der glykämische Index bringt laut Cochrane-Review nur kleine Abnehm-Vorteile. Wichtiger als der GI-Wert sind Kalorien, Ballaststoffe und Protein.",
    tags: [
      "glykämischer index",
      "glyx diät",
      "glykämische last",
      "low gi",
      "abnehmen",
      "ernährung",
      "blutzucker",
      "evidenzbasiert"
    ],
    relatedCalculators: [
      "makros-berechnen",
      "kaloriendefizit-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Low glycaemic index or low glycaemic load diets for overweight and obesity",
        authors: "Thomas DE, Elliott EJ, Baur L",
        journal: "Cochrane Database of Systematic Reviews",
        year: 2007,
        doi: "10.1002/14651858.CD005105.pub2"
      },
      {
        title: "Diets with High or Low Protein Content and Glycemic Index for Weight-Loss Maintenance (DiOGenes)",
        authors: "Larsen TM, Dalskov SM, van Baak M, et al.",
        journal: "New England Journal of Medicine",
        year: 2010,
        doi: "10.1056/NEJMoa1007137"
      },
      {
        title: "Weight Loss with a Low-Carbohydrate, Mediterranean, or Low-Fat Diet (DIRECT)",
        authors: "Shai I, Schwarzfuchs D, Henkin Y, et al.",
        journal: "New England Journal of Medicine",
        year: 2008,
        doi: "10.1056/NEJMoa0708681"
      },
      {
        title: "Effect of Low-Fat vs Low-Carbohydrate Diet on 12-Month Weight Loss in Overweight Adults and the Association With Genotype Pattern or Insulin Secretion (DIETFITS)",
        authors: "Gardner CD, Trepanowski JF, Del Gobbo LC, et al.",
        journal: "JAMA",
        year: 2018,
        doi: "10.1001/jama.2018.0245"
      }
    ],
    kernaussage: "Ein niedriger glykämischer Index hat in der Cochrane-Meta-Analyse nur kleine Abnehm-Vorteile gegenüber Vergleichsdiäten. Entscheidend für den Gewichtsverlust sind nicht der GI-Wert allein, sondern die Gesamtkalorien, der Ballaststoff- und der Proteingehalt der Lebensmittel. Im großen DiOGenes-Versuch hielt vor allem mehr Protein das Gewicht – der GI-Effekt war demgegenüber klein.",
    faqs: [
      {
        question: "Was ist der Unterschied zwischen glykämischem Index und glykämischer Last?",
        answer: "Der glykämische Index (GI) misst, wie schnell ein Lebensmittel den Blutzucker ansteigen lässt. Die glykämische Last (GL) berücksichtigt zusätzlich die tatsächlich verzehrte Kohlenhydratmenge pro Portion und ist damit alltagsnäher. Beispiel: Wassermelone hat einen hohen GI, aber wegen des geringen Kohlenhydratgehalts pro Portion eine niedrige GL."
      },
      {
        question: "Nimmt man mit der GLYX-Diät wirklich besser ab?",
        answer: "Die Cochrane-Meta-Analyse fand für Low-GI-Diäten nur einen kleinen zusätzlichen Gewichtsverlust von etwa 1 kg gegenüber Vergleichsdiäten. Das ist ein realer, aber kleiner Effekt. Entscheidender für den Abnehmerfolg sind die Gesamtkalorien sowie der Ballaststoff- und Proteingehalt der Ernährung."
      },
      {
        question: "Sind Lebensmittel mit hohem GI automatisch ungesund?",
        answer: "Nein. Karotten, Wassermelone oder gekochte Kartoffeln haben einen relativ hohen GI, sind aber nährstoffreich und in einer ausgewogenen Ernährung völlig unbedenklich. Der GI sagt nichts über Vitamine, Ballaststoffe oder die Gesamtqualität eines Lebensmittels aus."
      },
      {
        question: "Ist der GI bei Diabetes wichtiger als beim Abnehmen?",
        answer: "Für Menschen mit Diabetes oder Insulinresistenz kann die Beachtung der glykämischen Last sinnvoll sein, um Blutzuckerspitzen zu vermeiden. Das ist jedoch eine andere Fragestellung als reines Abnehmen, bei dem die Energiebilanz im Vordergrund steht. Bei Diabetes sollte die Ernährung ärztlich begleitet werden."
      },
      {
        question: "Worauf sollte ich statt auf den GI-Wert achten?",
        answer: "Auf ein moderates Kaloriendefizit, ausreichend Protein und ballaststoffreiche, wenig verarbeitete Lebensmittel. Diese sättigen, helfen das Gewicht zu halten und haben meist ohnehin einen niedrigeren GI – ganz ohne dass Sie eine GLYX-Tabelle führen müssen."
      }
    ]
  },
  {
    slug: "zucker-reduzieren-zuckerverzicht-gewicht",
    title: "Zucker reduzieren: Was Zuckerverzicht wirklich fuers Gewicht bringt",
    description: "Was bringt Zuckerverzicht fuers Abnehmen? RCTs und WHO-Daten zeigen: Weniger freier Zucker senkt das Gewicht um rund 0,8 kg - vor allem ueber eingesparte Kalorien.",
    tags: [
      "zucker reduzieren",
      "abnehmen",
      "zuckerverzicht",
      "ernaehrung",
      "kaloriendefizit",
      "suessgetraenke",
      "gewichtsabnahme",
      "WHO"
    ],
    relatedCalculators: [
      "kaloriendefizit-berechnen",
      "kalorienbedarf-berechnen"
    ],
    publishedAt: "2026-06-16",
    readingTime: 7,
    sources: [
      {
        title: "Dietary sugars and body weight: systematic review and meta-analyses of randomised controlled trials and cohort studies",
        authors: "Te Morenga L, Mallard S, Mann J",
        journal: "BMJ",
        year: 2013,
        doi: "10.1136/bmj.e7492",
        pmid: "23321486"
      },
      {
        title: "A trial of sugar-free or sugar-sweetened beverages and body weight in children",
        authors: "de Ruyter JC, Olthof MR, Seidell JC, Katan MB",
        journal: "New England Journal of Medicine",
        year: 2012,
        doi: "10.1056/NEJMoa1203034",
        pmid: "22998340"
      },
      {
        title: "Effect of Low-Fat vs Low-Carbohydrate Diet on 12-Month Weight Loss in Overweight Adults and the Association With Genotype Pattern or Insulin Secretion: The DIETFITS Randomized Clinical Trial",
        authors: "Gardner CD, Trepanowski JF, Del Gobbo LC, et al.",
        journal: "JAMA",
        year: 2018,
        doi: "10.1001/jama.2018.0245",
        pmid: "29466592"
      }
    ],
    kernaussage: "Zuckerverzicht hilft beim Abnehmen, aber nicht durch eine besondere Stoffwechselwirkung des Zuckers, sondern durch eingesparte Kalorien. Eine WHO-Metaanalyse zeigt: Wer freien Zucker reduziert, verliert im Schnitt rund 0,8 kg. Den groessten Hebel haben zuckergesuesste Getraenke, weil fluessige Kalorien kaum saettigen. Wer eingesparten Zucker durch andere Kalorien ersetzt, nimmt nicht ab - entscheidend bleibt die Energiebilanz.",
    faqs: [
      {
        question: "Nehme ich automatisch ab, wenn ich Zucker weglasse?",
        answer: "Nicht automatisch. Eine WHO-Metaanalyse fand bei freier Zuckerreduktion im Schnitt rund 0,8 kg weniger Gewicht - aber nur, weil dabei Kalorien eingespart wurden. Wenn Sie den weggelassenen Zucker durch andere Lebensmittel mit gleichen Kalorien ersetzen, bleibt das Gewicht gleich. Entscheidend ist das Kaloriendefizit, nicht der Verzicht auf das Molekuel Zucker selbst."
      },
      {
        question: "Warum sind Suessgetraenke besonders problematisch?",
        answer: "Fluessige Kalorien saettigen kaum und werden meist zusaetzlich zur normalen Nahrung aufgenommen. In einer verblindeten RCT mit ueber 600 Kindern fuehrte ein taeglich zuckergesuesstes Getraenk nach 18 Monaten zu rund 1 kg mehr Gewicht gegenueber einem suessstoffgesuessten. Limonaden, Saefte und Energydrinks zu reduzieren ist daher der am besten belegte Hebel."
      },
      {
        question: "Ist Zucker schlimmer als andere Kalorien?",
        answer: "Fuer das Koerpergewicht spricht die Evidenz dagegen: Wird Zucker bei gleicher Kalorienzahl durch andere Kohlenhydrate ersetzt, aendert sich das Gewicht nicht. Auch die WHO begruendet ihre Empfehlung damit, dass der Effekt aus der Energieaufnahme stammt und nicht aus einer besonderen Stoffwechselwirkung des Zuckers."
      },
      {
        question: "Wie viel Zucker ist okay?",
        answer: "Die WHO empfiehlt, freien Zucker auf unter 10 Prozent der taeglichen Energiezufuhr zu begrenzen, idealerweise unter 5 Prozent. Freier Zucker meint zugesetzten Zucker plus Zucker in Saeften und Honig - nicht den natuerlich in ganzem Obst oder Milch enthaltenen Zucker."
      },
      {
        question: "Muss ich komplett auf Zucker verzichten, um abzunehmen?",
        answer: "Nein. Ein vollstaendiger Verzicht ist weder noetig noch durch Studien als ueberlegen belegt. Wichtiger ist, die Gesamtkalorien zu senken. Zucker reduzieren - vor allem in Getraenken - ist dabei ein praktischer Baustein, weil es Kalorien spart, ohne stark satt zu machen."
      }
    ]
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

// Helper: Verwandte Artikel finden (basierend auf gemeinsamen Tags)
export function getRelatedArticles(slug: string, limit: number = 4): ArticleMeta[] {
  const article = getArticleMeta(slug);
  if (!article) return [];

  const scored = articlesMeta
    .filter((a) => a.slug !== slug)
    .map((a) => {
      const sharedTags = a.tags.filter((t) =>
        article.tags.some((at) => at.toLowerCase() === t.toLowerCase())
      ).length;
      return { article: a, score: sharedTags };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.article);
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

