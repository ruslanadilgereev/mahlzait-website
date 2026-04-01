export interface SeoHubLink {
  title: string;
  href: string;
  description: string;
}

export const priorityHubLinks: SeoHubLink[] = [
  {
    title: "Kalorienbedarf berechnen",
    href: "/kalorienbedarf-berechnen/",
    description: "Berechne deinen täglichen Bedarf mit BMR- und TDEE-Grundlage.",
  },
  {
    title: "Kaloriendefizit berechnen",
    href: "/kaloriendefizit-berechnen/",
    description: "Finde ein realistisches Defizit zum Abnehmen ohne Crash-Diät.",
  },
  {
    title: "Makros berechnen",
    href: "/makros-berechnen/",
    description: "Plane Protein, Kohlenhydrate und Fett passend zu deinem Ziel.",
  },
  {
    title: "BMI Rechner",
    href: "/bmi-rechner/",
    description: "Ordne dein Gewicht schnell ein und springe von dort in die passenden Guides.",
  },
  {
    title: "Kalorien zählen",
    href: "/kalorien-zaehlen/",
    description: "Schritt-für-Schritt-Anleitung für Tracking, Defizit und Routine.",
  },
  {
    title: "Abnehmen mit Plan",
    href: "/abnehmen/",
    description: "Der zentrale Guide für Defizit, Protein, Alltag und Fortschritt.",
  },
  {
    title: "Kalorien zählen App",
    href: "/kalorien-zaehlen-app/",
    description: "Landingpage für Nutzer mit klarer App- und Tracking-Intention.",
  },
  {
    title: "Abnehmen App",
    href: "/abnehmen-app/",
    description: "Vergleichsnahe Einstiegsseite für App-Suchanfragen mit Kaufabsicht.",
  },
];

export const calculatorSupportLinks = priorityHubLinks.filter((link) =>
  ["/kalorienbedarf-berechnen/", "/kaloriendefizit-berechnen/", "/makros-berechnen/", "/bmi-rechner/"].includes(link.href)
);

export const guideSupportLinks = priorityHubLinks.filter((link) =>
  ["/kalorien-zaehlen/", "/abnehmen/", "/kalorien-zaehlen-app/", "/abnehmen-app/"].includes(link.href)
);

export const foodSupportLinksByCategory: Record<string, SeoHubLink[]> = {
  supermarkt: [priorityHubLinks[2], priorityHubLinks[4], priorityHubLinks[0]],
  gericht: [priorityHubLinks[1], priorityHubLinks[4], priorityHubLinks[5]],
  "fast-food": [priorityHubLinks[1], priorityHubLinks[5], priorityHubLinks[6]],
  getraenk: [priorityHubLinks[1], priorityHubLinks[5], priorityHubLinks[7]],
};

export const defaultFoodSupportLinks: SeoHubLink[] = [
  priorityHubLinks[0],
  priorityHubLinks[1],
  priorityHubLinks[4],
];
