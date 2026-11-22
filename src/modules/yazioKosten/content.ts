// Inhalt von /yazio-kosten/ ("Was kostet YAZIO?").
// Jede Zahl stammt aus einer offiziellen Quelle von YAZIO (App Store, Google
// Play, YAZIO-Hilfe) oder für Mahlzait aus dem eigenen App-Store-Eintrag, jeweils
// mit dem Datum, an dem sie gelesen wurde. Ändert YAZIO die Preise, hier das
// Datum und die Werte zusammen aktualisieren. Die FAQ speist die sichtbaren
// Fragen und das FAQPage-Schema in yazio-kosten.astro.

/** ISO-Datum, an dem die Preise und Hilfetexte gelesen wurden. */
export const gelesenAm = "2026-11-22";

export const seo = {
  title: "Was kostet YAZIO? Preise, Gratis-Version und Kündigung | Mahlzait",
  description:
    "YAZIO-Preise laut App Store und Google Play vom 22.11.2026: was Pro kostet, was gratis bleibt, wie du kündigst und was Mahlzait Pro im Vergleich kostet.",
};

export const h1 = "Was kostet YAZIO? Preise, Gratis-Version und Kündigung";

export const intro = [
  "YAZIO kannst du kostenlos laden und nutzen, die Gratis-Version zeigt Werbung. Für YAZIO Pro listet der deutsche App Store am 22. November 2026 zwölf Monate zu 23,90 €, 35,90 € oder 83,90 €. Bezahlt wird der ganze Betrag zu Beginn der Laufzeit, welcher Preis für dich gilt, siehst du vor dem Kauf.",
  "Die Preise stammen aus den Store-Einträgen von YAZIO, die Regeln zu Abbuchung, Kündigung und Erstattung aus dem Hilfe-Center von YAZIO. Am Ende steht der Vergleich mit Mahlzait Pro. Mahlzait ist unsere eigene App.",
];

/** In-App-Käufe von YAZIO, wie der deutsche App Store sie am 22.11.2026 listet. */
export const appStorePreise = [
  {
    laufzeit: "12 Monate",
    preise: ["23,90 €", "35,90 €", "83,90 €"],
    proMonat: "1,99 € bis 6,99 €",
  },
  { laufzeit: "6 Monate", preise: ["14,99 €"], proMonat: "2,50 €" },
  { laufzeit: "3 Monate", preise: ["35,99 €"], proMonat: "12,00 €" },
  {
    laufzeit: "ohne Angabe („YAZIO PRO“)",
    preise: ["22,49 €", "23,90 €", "35,90 €"],
    proMonat: null,
  },
];

export const appStoreHinweis =
  "So listet der App Store die In-App-Käufe von YAZIO, einige Einträge stehen dort doppelt. Welche Stufe dir angeboten wird, zeigt die App; den Betrag siehst du vor dem Kauf im Bezahlvorgang.";

export const googlePlayText =
  "Google Play nennt keine Einzelpreise, sondern nur die Spanne der In-App-Käufe: 6,99 € bis 349,99 € bei Abrechnung über Google Play. Auch hier zeigt die App den Preis vor dem Kauf.";

export const websiteText =
  "Wer keine In-App-Käufe nutzen kann, kauft YAZIO Pro laut YAZIO auf yazio.com, mit Kreditkarte, PayPal, Apple Pay oder SEPA-Lastschrift. Eine kostenlose Testphase bietet YAZIO laut Hilfe-Center nur gelegentlich und nur über die Website an.";

export const gratis = {
  heading: "Was ist bei YAZIO kostenlos?",
  paragraphs: [
    "Die App ist kostenlos und zeigt Werbung, so steht es im App Store und bei Google Play. Laut der Beschreibung bei Google Play sind Kalorienzähler, Ernährungstagebuch und Gewichtstracker kostenlos nutzbar, für das Abnehmen braucht man Pro nach Angabe von YAZIO nicht.",
  ],
  proHeading: "Was bringt YAZIO Pro?",
  pro: [
    "keine Werbung",
    "alle Nährstoffe inklusive Vitamine und Mineralstoffe",
    "Erfassen von Mahlzeiten per Foto mit KI",
    "voller Zugriff auf über 3.000 Rezepte und Einkaufslisten",
    "alle Intervallfasten-Pläne, etwa 16:8, 12:12 und 5:2",
    "Statistiken über bis zu zwei Jahre und alle Körpermaße",
  ],
  proQuelle:
    "Laut App Store, Google Play und dem Hilfe-Artikel von YAZIO zu Pro.",
};

export const abbuchung = {
  heading: "Wie wird YAZIO Pro abgerechnet?",
  paragraphs: [
    "YAZIO berechnet den kompletten Betrag für die gewählte Laufzeit zu Beginn, eine monatliche Abbuchung gibt es nicht. Ohne Kündigung verlängert sich das Abo automatisch. Die Laufzeit eines laufenden Abos lässt sich nicht ändern: Dafür kündigst du und schließt ein neues Abo ab.",
  ],
};

export const kuendigung = {
  heading: "YAZIO Pro kündigen",
  intro:
    "Gekündigt wird dort, wo du gekauft hast. Nach der Kündigung läuft Pro bis zum Ende der bezahlten Zeit weiter und verlängert sich nicht mehr. Die App zu deinstallieren oder das YAZIO-Konto zu löschen kündigt das Abo nicht.",
  routes: [
    {
      where: "Gekauft im App Store",
      steps: [
        "App Store öffnen und auf dein Profilbild tippen",
        "Abonnements wählen",
        "YAZIO antippen",
        "Automatische Verlängerung deaktivieren",
      ],
    },
    {
      where: "Gekauft bei Google Play",
      steps: [
        "Play Store öffnen und auf dein Profilbild tippen",
        "Zahlungen und Abonnements, dann Abonnements wählen",
        "YAZIO antippen",
        "Abonnement kündigen und bestätigen",
      ],
    },
    {
      where: "Gekauft auf yazio.com",
      steps: [
        "yazio.com/app/account öffnen und anmelden",
        "Beim aktiven Abo Abonnement kündigen wählen",
        "Bestätigen, danach steht dort „Gekündigt“ mit dem Enddatum",
        "Alternativ in der App: Profil, Einstellungen, Konto, Abonnement",
      ],
    },
  ],
  erstattung:
    "Eine Kündigung erstattet nichts. Für Käufe im App Store oder bei Google Play beantragst du eine Erstattung bei Apple oder Google. Bei einem Kauf auf yazio.com hast du laut YAZIO 14 Tage ab Vertragsschluss ein Widerrufsrecht. Die kostenlose Testphase von der Website kündigst du laut YAZIO spätestens einen Tag vor ihrem Ende.",
};

export interface VergleichZeile {
  merkmal: string;
  yazio: string;
  mahlzait: string;
}

export const vergleich: {
  heading: string;
  intro: string;
  zeilen: VergleichZeile[];
  fazit: string[];
} = {
  heading: "YAZIO Pro oder Mahlzait Pro: der Vergleich",
  intro:
    "Beide Apps sind kostenlos nutzbar und verkaufen ein Pro-Abo. Die Tabelle stellt nur nebeneinander, was die Anbieter selbst angeben, Stand 22. November 2026.",
  zeilen: [
    {
      merkmal: "Pro für 12 Monate (App Store)",
      yazio: "23,90 €, 35,90 € oder 83,90 €, je nach Angebot",
      mahlzait: "39,99 €",
    },
    {
      merkmal: "Kürzere Laufzeiten (App Store)",
      yazio: "6 Monate 14,99 €, 3 Monate 35,99 €",
      mahlzait: "7,99 € im Monat",
    },
    {
      merkmal: "Kostenlos testen",
      yazio: "Testphase nur gelegentlich, nur über die Website",
      mahlzait: "7 Tage, in der App",
    },
    { merkmal: "Werbung in der Gratis-Version", yazio: "ja", mahlzait: "nein" },
    {
      merkmal: "Gratis-Version",
      yazio: "Kalorienzähler, Ernährungstagebuch, Gewichtstracker",
      mahlzait:
        "Suche, Barcode-Scanner, manuelle Eingabe; Eintragen mit KI fünfmal zum Testen",
    },
    {
      merkmal: "Mahlzeit per Foto",
      yazio: "laut YAZIO-Hilfe Teil von Pro",
      mahlzait: "mit Pro, vorher fünfmal zum Testen",
    },
    {
      merkmal: "Mahlzeit per Sprache",
      yazio: "laut Google-Play-Beschreibung vorhanden",
      mahlzait: "mit Pro, vorher fünfmal zum Testen",
    },
    {
      merkmal: "Rezepte und Fastenpläne",
      yazio: "über 3.000 Rezepte, mehr als 20 Fastenpläne",
      mahlzait:
        "eigene Rezepte und Intervallfasten-Tracker, keine große Rezeptsammlung",
    },
  ],
  fazit: [
    "Mit einem günstigen Angebot ist YAZIO Pro im Jahr billiger als Mahlzait Pro, und YAZIO bietet eine große Rezeptsammlung und über 20 Fastenpläne. Wer eine Gratis-Version ohne Werbung möchte oder Mahlzeiten lieber fotografiert oder einspricht, als sie zu suchen, ist bei Mahlzait richtig.",
  ],
};

export interface YazioFaq {
  question: string;
  answer: string;
}

export const faq: YazioFaq[] = [
  {
    question: "Was kostet YAZIO Pro?",
    answer:
      "Im deutschen App Store kosteten zwölf Monate YAZIO Pro am 22. November 2026 je nach Angebot 23,90 €, 35,90 € oder 83,90 €, umgerechnet 1,99 € bis 6,99 € im Monat. Bezahlt wird der ganze Betrag zu Beginn der Laufzeit. Welcher Preis für dich gilt, siehst du vor dem Kauf im Bezahlvorgang.",
  },
  {
    question: "Ist YAZIO kostenlos?",
    answer:
      "Ja, die App ist kostenlos und zeigt Werbung. Laut YAZIO sind Kalorienzähler, Ernährungstagebuch und Gewichtstracker kostenlos nutzbar. Pro bringt unter anderem keine Werbung, alle Nährstoffe inklusive Vitamine und Mineralstoffe und Statistiken über längere Zeit.",
  },
  {
    question: "Wird YAZIO Pro monatlich abgebucht?",
    answer:
      "Nein. Laut YAZIO wird der komplette Betrag für die gewählte Laufzeit zu Beginn berechnet, eine monatliche Abbuchung gibt es nicht. Ohne Kündigung verlängert sich das Abo automatisch.",
  },
  {
    question: "Wie kündige ich YAZIO Pro?",
    answer:
      "Dort, wo du gekauft hast: im App Store oder bei Google Play unter Abonnements, bei einem Kauf auf yazio.com unter yazio.com/app/account oder in der App unter Profil, Einstellungen, Konto, Abonnement. Pro läuft bis zum Ende der bezahlten Zeit weiter. Die App oder das Konto zu löschen kündigt das Abo nicht.",
  },
  {
    question: "Bekomme ich nach der Kündigung Geld zurück?",
    answer:
      "Durch die Kündigung allein nicht. Erstattungen für Käufe im App Store oder bei Google Play laufen über Apple oder Google. Bei einem Kauf auf yazio.com hast du laut YAZIO 14 Tage ab Vertragsschluss ein Widerrufsrecht.",
  },
  {
    question: "Zahlt die Krankenkasse YAZIO Pro?",
    answer:
      "Laut YAZIO erstattet in Deutschland die BKK Werra-Meissner im Programm „Vorsorge Plus“ die Kosten des ersten Kaufs vollständig, wenn die Voraussetzungen des Programms erfüllt sind. Bei anderen Krankenkassen lohnt es sich nachzufragen.",
  },
  {
    question: "Was kostet Mahlzait Pro im Vergleich?",
    answer:
      "Mahlzait Pro kostet laut App Store 39,99 € im Jahr oder 7,99 € im Monat, die ersten 7 Tage sind kostenlos. Die Gratis-Version zeigt keine Werbung; Eintragen mit KI per Foto, Text oder Sprache kannst du fünfmal kostenlos testen.",
  },
];

export interface Quelle {
  label: string;
  url: string;
}

export const quellen: Quelle[] = [
  {
    label:
      "App Store (Deutschland): Yazio, In-App-Käufe, Hinweis auf Werbung und Pro-Vorteile, gelesen am 22.11.2026",
    url: "https://apps.apple.com/de/app/yazio-kalorien-z%C3%A4hler-di%C3%A4t/id946099227",
  },
  {
    label:
      "Google Play (Deutschland): Yazio, Spanne der In-App-Käufe, Hinweis auf Werbung, kostenlose Funktionen, gelesen am 22.11.2026",
    url: "https://play.google.com/store/apps/details?id=com.yazio.android&hl=de",
  },
  {
    label:
      "YAZIO-Hilfe: Wird der Betrag für Pro monatlich oder für den kompletten Zeitraum abgebucht?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/208554989-Wird-der-Betrag-f%C3%BCr-Pro-monatlich-oder-f%C3%BCr-den-kompletten-Zeitraum-abgebucht",
  },
  {
    label:
      "YAZIO-Hilfe: Wie unterstützt dich Yazio Pro bei deinen Zielen?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/208847005-Wie-unterst%C3%BCtzt-dich-Yazio-Pro-bei-deinen-Zielen",
  },
  {
    label: "YAZIO-Hilfe: Wie kann ich Yazio Pro kaufen?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/208127729-Wie-kann-ich-Yazio-Pro-kaufen",
  },
  {
    label:
      "YAZIO-Hilfe: Worum handelt es sich bei unserer Testversion?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/4436727821073-Worum-handelt-es-sich-bei-unserer-Testversion",
  },
  {
    label:
      "YAZIO-Hilfe: Wie kann ich meine Abo-Laufzeit ändern oder verlängern?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/360000753985-Wie-kann-ich-meine-Abo-Laufzeit-%C3%A4ndern-oder-verl%C3%A4ngern",
  },
  {
    label:
      "YAZIO-Hilfe: Wie kann ich mein Pro-Abo kündigen?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/115005660409-Wie-kann-ich-mein-Pro-Abo-k%C3%BCndigen",
  },
  {
    label:
      "YAZIO-Hilfe: Wie kann ich eine Rückerstattung für mein Pro-Abo beantragen?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/360000753485-Wie-kann-ich-eine-R%C3%BCckerstattung-f%C3%BCr-mein-Pro-Abo-beantragen",
  },
  {
    label:
      "YAZIO-Hilfe: Übernimmt meine Krankenkasse die Kosten für Yazio Pro?, gelesen am 22.11.2026",
    url: "https://help.yazio.com/hc/de/articles/115004740349-%C3%9Cbernimmt-meine-Krankenkasse-die-Kosten-f%C3%BCr-Yazio-Pro",
  },
  {
    label:
      "App Store (Deutschland): Mahlzait, In-App-Käufe 7,99 € und 39,99 €, 7 Tage kostenlos testen, gelesen am 22.11.2026",
    url: "https://apps.apple.com/de/app/mahlzait-ki-kalorienz%C3%A4hler/id6747400456",
  },
];
