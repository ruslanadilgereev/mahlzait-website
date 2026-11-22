// Formel-Beispiele, FAQ und Quellen für /kaloriendefizit-berechnen/.
// Die FAQ speist die sichtbaren Fragen auf der Seite und das FAQPage-Schema
// in kaloriendefizit-berechnen.astro, damit beide wortgleich bleiben.

export interface DefizitFaq {
  question: string;
  answer: string;
  /** Optionaler Weiterlesen-Link unter der Antwort (nicht Teil des Schemas). */
  link?: { href: string; label: string };
}

export interface DefizitBeispiel {
  person: string;
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  activity: number;
  activityLabel: string;
}

/**
 * Beispiele für die Formel-Erklärung. Die Werte daneben rechnet die Seite mit
 * derselben Funktion aus wie der Rechner (calculateDeficitPlan), nicht von Hand.
 */
export const defizitBeispiele: DefizitBeispiel[] = [
  {
    person: "Frau, 35 Jahre, 168 cm, 75 kg",
    gender: "female",
    age: 35,
    height: 168,
    weight: 75,
    activity: 1.375,
    activityLabel: "leicht aktiv (1,375)",
  },
  {
    person: "Frau, 35 Jahre, 168 cm, 75 kg",
    gender: "female",
    age: 35,
    height: 168,
    weight: 75,
    activity: 1.55,
    activityLabel: "3 bis 5 Mal Sport pro Woche (1,55)",
  },
  {
    person: "Mann, 40 Jahre, 182 cm, 92 kg",
    gender: "male",
    age: 40,
    height: 182,
    weight: 92,
    activity: 1.55,
    activityLabel: "3 bis 5 Mal Sport pro Woche (1,55)",
  },
];

export const kaloriendefizitFaq: DefizitFaq[] = [
  {
    question: "Was ist ein Kaloriendefizit?",
    answer:
      "Ein Kaloriendefizit heißt, dass du weniger Energie isst und trinkst, als dein Körper verbraucht. Das ist beim Abnehmen der entscheidende Punkt: Laut gesundheitsinformation.de, dem Portal des IQWiG, kommt es darauf an, weniger Energie aufzunehmen, als man verbraucht. Wie sich die Ernährung zusammensetzt, ist dabei nicht entscheidend.",
  },
  {
    question: "Wie berechne ich mein Kaloriendefizit?",
    answer:
      "Erst den Grundumsatz schätzen, zum Beispiel mit der Mifflin-St-Jeor-Formel, dann mit einem Aktivitätsfaktor zum Gesamtumsatz hochrechnen und davon das gewünschte Defizit abziehen. Beispiel: Eine 35-jährige Frau mit 168 cm und 75 kg hat einen Grundumsatz von 1.464 kcal und leicht aktiv (Faktor 1,375) einen Gesamtumsatz von 2.013 kcal. Mit 500 kcal Defizit liegt ihr Ziel bei 1.513 kcal pro Tag.",
  },
  {
    question: "Wie groß sollte mein Kaloriendefizit sein?",
    answer:
      "Für Übergewicht und Adipositas nennt der Leitfaden Ernährungstherapie in Klinik und Praxis (LEKuP) der deutschen Fachgesellschaften ein Energiedefizit von 500 bis 600 kcal pro Tag. Formula-Diäten mit 800 bis 1.200 kcal am Tag sieht er nur zeitlich begrenzt und mit ärztlicher Begleitung vor, von Crash-Diäten rät er ab.",
  },
  {
    question: "Wie viel nehme ich mit 500 kcal Defizit pro Woche ab?",
    answer:
      "Rechnerisch etwa 0,45 kg: 500 kcal mal 7 Tage sind 3.500 kcal, geteilt durch 7.700 kcal pro Kilogramm. In der Praxis fällt die Abnahme anfangs oft höher aus, weil der Körper mit dem Glykogen auch gebundenes Wasser abgibt, und über Monate geringer, weil der Verbrauch mit dem Gewicht sinkt. Die verbreitete Regel von 3.500 kcal pro Pfund überschätzt den Gewichtsverlust auf Dauer deutlich.",
  },
  {
    question: "Kaloriendefizit berechnen als Frau: Was ist anders?",
    answer:
      "Die Mifflin-St-Jeor-Formel zieht bei Frauen 161 kcal ab und rechnet bei Männern 5 kcal dazu. Bei gleichem Gewicht, gleicher Größe und gleichem Alter liegt der geschätzte Grundumsatz einer Frau damit 166 kcal niedriger. Dasselbe Defizit ist für Frauen deshalb meist ein größerer Teil des Tagesbedarfs.",
  },
  {
    question: "Warum nehme ich trotz Kaloriendefizit nicht ab?",
    answer:
      "Meist ist das Defizit kleiner als gedacht. In einer Studie im New England Journal of Medicine hatten Menschen, die trotz angeblich weniger als 1.200 kcal am Tag nicht abnahmen, einen normalen Energieverbrauch. Sie unterschätzten aber ihre Essensmenge im Schnitt um 47 Prozent und überschätzten ihre Bewegung um 51 Prozent. Dazu kommen Schwankungen durch Wasser, die einen Fettverlust auf der Waage für einige Tage verdecken können.",
    link: {
      href: "/wissen/trotz-kaloriendefizit-nicht-abnehmen-gruende/",
      label: "Trotz Kaloriendefizit nicht abnehmen: die häufigsten Gründe",
    },
  },
];

export interface Quelle {
  label: string;
  url: string;
}

export const kaloriendefizitQuellen: Quelle[] = [
  {
    label:
      "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247",
    url: "https://doi.org/10.1093/ajcn/51.2.241",
  },
  {
    label:
      "Hauner H, et al. Leitfaden Ernährungstherapie in Klinik und Praxis (LEKuP). Aktuel Ernahrungsmed. 2019;44:384-419, Abschnitt 4.1 Übergewicht bzw. Adipositas",
    url: "https://doi.org/10.1055/a-1030-5207",
  },
  {
    label:
      "Thomas DM, Martin CK, et al. Can a weight loss of one pound a week be achieved with a 3500-kcal deficit? Int J Obes. 2013;37(12):1611-1613",
    url: "https://doi.org/10.1038/ijo.2013.51",
  },
  {
    label:
      "Hall KD, Sacks G, et al. Quantification of the effect of energy imbalance on bodyweight. Lancet. 2011;378(9793):826-837",
    url: "https://doi.org/10.1016/S0140-6736(11)60812-X",
  },
  {
    label:
      "Kreitzman SN, Coxon AY, Szaz KF. Glycogen storage: illusions of easy weight loss, excessive weight regain, and distortions in estimates of body composition. Am J Clin Nutr. 1992;56(1 Suppl):292S-293S",
    url: "https://doi.org/10.1093/ajcn/56.1.292S",
  },
  {
    label:
      "Lichtman SW, et al. Discrepancy between self-reported and actual caloric intake and exercise in obese subjects. N Engl J Med. 1992;327(27):1893-1898",
    url: "https://doi.org/10.1056/NEJM199212313272701",
  },
  {
    label:
      "IQWiG, gesundheitsinformation.de: Programme und Medikamente zum Abnehmen (aktualisiert am 24. August 2022, abgerufen am 22. November 2026)",
    url: "https://www.gesundheitsinformation.de/programme-und-medikamente-zum-abnehmen.html",
  },
];
