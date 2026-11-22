import configWithoutLegal from "utils/configWithoutLegal";
import { getTrackedLinks } from "utils/trackingLinks";

/**
 * configWithoutLegal mit Store-Links, die das Kampagnenkürzel einer
 * Seitenfamilie tragen: website_food, website_calculator, website_wissen.
 *
 * Navbar, App-Banner und die Knöpfe der Seiten lesen appStoreLink und
 * googlePlayLink aus der Config. Ohne diese Kopie zählten alle Store-Klicks
 * von Lebensmittel-, Rechner- und Wissen-Seiten als "homepage" und waren von
 * der Startseite nicht zu trennen (OpenSEO-Audit vom 22.11.2026).
 *
 * Nur in .astro-Seiten importieren, nicht in React-Komponenten: Die Datei
 * zieht die ganze Config nach.
 */
function withFamilyStoreLinks(family: "food" | "calculator" | "wissen") {
  const links = getTrackedLinks(family);
  return {
    ...configWithoutLegal,
    appStoreLink: links.ios,
    googlePlayLink: links.android,
  };
}

export const foodPageConfig = withFamilyStoreLinks("food");
export const calculatorPageConfig = withFamilyStoreLinks("calculator");
export const wissenPageConfig = withFamilyStoreLinks("wissen");
