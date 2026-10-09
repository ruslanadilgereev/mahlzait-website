import { motion } from "framer-motion";
import AppComparisonTable from "@components/appComparison/AppComparisonTable";
import {
  appFactsAsOf,
  calorieApps,
  comparisonOrder,
  formatGermanMonth,
} from "../../../../data/calorieApps";

// Auf der Startseite nur die bekanntesten Apps, der volle Vergleich liegt auf
// /kalorienzaehler-app/.
const HOMEPAGE_APPS = [
  "mahlzait",
  "yazio",
  "myfitnesspal",
  "fddb",
  "lifesum",
  "cal-ai",
];

function ComparisonTable() {
  const apps = comparisonOrder(
    calorieApps.filter((app) => HOMEPAGE_APPS.includes(app.slug)),
  );

  return (
    <section className="max-w-screen-lg mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Kalorienzähler-Apps im Vergleich
          </h2>
          <p className="text-base-content/70 max-w-2xl mx-auto mb-4">
            Mahlzait neben den bekanntesten Kalorienzählern: was gratis geht, ob
            Werbung läuft und was das Abo laut deutschem App Store kostet.
            Stand: {formatGermanMonth(appFactsAsOf)}.{" "}
            <a href="/kalorienzaehler-app/" className="link link-primary">
              Alle {calorieApps.length} Apps mit Stärken und Schwächen →
            </a>
          </p>
        </div>
        <AppComparisonTable
          apps={apps}
          caption="Mahlzait und andere Kalorienzähler-Apps im Vergleich"
        />
        <p className="text-xs text-base-content/50 mt-4 text-center">
          Preise laut deutschem App Store, Bewertungen automatisch aus dem App
          Store. Preise und Funktionen können sich ändern, verbindlich ist die
          Angabe in der jeweiligen App.
        </p>
      </motion.div>
    </section>
  );
}

export default ComparisonTable;
