import type { APIRoute } from "astro";
import {
  adsLabel,
  appFactsAsOf,
  appStoreUrl,
  comparisonOrder,
  featureLabel,
  freeTierLabel,
  getAppRating,
} from "../data/calorieApps";

// Maschinenlesbare Fassung von /kalorienzaehler-app/ für KI-Crawler und
// Sprachassistenten: dieselben Daten, Quellen und Einschränkungen wie auf der
// Seite, damit sich beide nie widersprechen.
export const GET: APIRoute = () => {
  const siteUrl = "https://www.mahlzait.de";

  const data = {
    title: "Kalorienzähler-Apps im Vergleich",
    url: `${siteUrl}/kalorienzaehler-app/`,
    language: "de-DE",
    publisher: "Mahlzait",
    disclosure:
      "Mahlzait ist die App des Herausgebers. Angaben zu anderen Apps stammen aus dem deutschen App Store und von den Anbietern selbst, mit Quellen pro App.",
    factsCheckedAt: appFactsAsOf,
    methodology: {
      prices:
        "In-App-Käufe laut deutschem App Store. Spannen, weil Anbieter dieselbe Laufzeit je nach Angebot unterschiedlich bepreisen.",
      features:
        "App-Store-Beschreibung und Website des Anbieters. 'Ja' bedeutet vorhanden, ohne Angabe, ob gratis oder im Abo.",
      ratings:
        "Durchschnitt und Anzahl im deutschen App Store (iTunes Lookup API).",
    },
    apps: comparisonOrder().map((app) => {
      const rating = getAppRating(app);
      return {
        name: app.name,
        provider: app.provider,
        seat: app.seat,
        seatInEu: app.euSeat,
        germanInterface: app.germanUi,
        appStoreRating: rating
          ? { value: rating.ratingValue, count: rating.ratingCount }
          : null,
        freeVersion: freeTierLabel[app.freeTier],
        freeVersionDetails: app.freeSummary,
        adsInFreeVersion: adsLabel(app),
        barcodeScanner: featureLabel[app.barcode],
        photoRecognition: featureLabel[app.photo],
        priceMonthly: app.monthly,
        priceYearly: app.yearly,
        priceNote: app.priceNote,
        strengths: app.strengths,
        weaknesses: app.weaknesses,
        bestFor: app.bestFor,
        detailsPage: app.alternativePath
          ? `${siteUrl}${app.alternativePath}`
          : `${siteUrl}/kalorienzaehler-app/#${app.slug}`,
        appStoreUrl: appStoreUrl(app),
        sources: app.sources,
      };
    }),
  };

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
