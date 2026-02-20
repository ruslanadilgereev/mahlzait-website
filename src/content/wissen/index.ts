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
    slug: "fett-macht-fett-mythos-abnehmen",
    title: "Fett macht fett: Stimmt der Abnehm-Mythos wirklich?",
    description:
      "Der Mythos aus den 80ern im Faktencheck: Meta-Analysen zeigen, dass Low-Fat-Diäten nicht besser funktionieren. Warum gute Fette beim Abnehmen sogar helfen können.",
    tags: ["Abnehmen", "Mythen", "Fett", "Ernährung", "Low-Fat"],
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
  },
  {
    slug: "jojo-effekt-diaet-wieder-zunehmen",
    title: "Jojo-Effekt: Warum nehme ich nach jeder Diät wieder zu?",
    description:
      "Der Jojo-Effekt erklärt: Warum 80% nach einer Diät wieder zunehmen, wie Hormone und Stoffwechsel sich anpassen – und was die erfolgreichen 20% anders machen.",
    tags: ["Abnehmen", "Jojo-Effekt", "Diät", "Mythen", "Gewicht halten"],
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
  },
  {
    slug: "heisshunger-stoppen-ursachen-tipps",
    title: "Heißhunger stoppen: Warum Diäten ihn nicht verstärken",
    description:
      "Der Mythos entkräftet: Meta-Analysen zeigen, dass Kalorienreduktion Heißhunger senkt – nicht steigert. Plus: Die echten Ursachen (Schlaf, Protein, Blutzucker) und was wirklich hilft.",
    tags: ["Abnehmen", "Heißhunger", "Mythen", "Protein", "Schlaf"],
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
    slug: "ernährungswissenschaft-grundlagen-erklaert",
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
    slug: "ki-ernährungsanalyse-aus-fotos-review",
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

