import { motion } from "framer-motion";

interface CompRow {
  feature: string;
  mahlzait: string;
  mfp: string;
  yazio: string;
  lifesum: string;
}

const rows: CompRow[] = [
  { feature: "KI-Foto-Erkennung", mahlzait: "✅ (Pro)", mfp: "✅ (Premium)", yazio: "✅ (Pro)", lifesum: "✅ (Premium)" },
  { feature: "Barcode-Scanner", mahlzait: "✅ Kostenlos", mfp: "✅ Kostenlos", yazio: "✅ Kostenlos", lifesum: "✅ Kostenlos" },
  { feature: "Lebensmittel-DB", mahlzait: "10 Mio+", mfp: "14 Mio+", yazio: "4 Mio+", lifesum: "Nicht bekannt" },
  { feature: "KI-Mahlzeit-Vorschläge", mahlzait: "✅ (Pro)", mfp: "❌", yazio: "❌", lifesum: "❌" },
  { feature: "YouTube-Rezept-Import", mahlzait: "✅", mfp: "❌", yazio: "❌", lifesum: "❌" },
  { feature: "Offline-Modus", mahlzait: "Teilweise (ohne KI)", mfp: "Teilweise", yazio: "Teilweise", lifesum: "❌" },
  { feature: "Werbefrei (Gratis)", mahlzait: "✅", mfp: "❌", yazio: "❌", lifesum: "❌" },
  { feature: "Apple Health / Google Fit", mahlzait: "✅", mfp: "✅", yazio: "✅", lifesum: "✅" },
  { feature: "Sprache", mahlzait: "Deutsch", mfp: "Multi (EN-fokussiert)", yazio: "Deutsch", lifesum: "Multi" },
  { feature: "Gratis-Version", mahlzait: "Basis (ohne KI)", mfp: "Eingeschränkt", yazio: "Eingeschränkt", lifesum: "Eingeschränkt" },
  { feature: "Pro-Preis (Monat)", mahlzait: "4,99 €", mfp: "9,99 €", yazio: "6,99 €", lifesum: "7,99 €" },
  { feature: "Pro-Preis (Jahr)", mahlzait: "29,99 €", mfp: "49,99 €", yazio: "44,99 €", lifesum: "44,99 €" },
];

function ComparisonTable() {
  return (
    <section className="max-w-screen-lg mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Kalorienzähler-Apps im Vergleich</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto mb-4">
            Mahlzait vs MyFitnessPal vs YAZIO vs Lifesum – Feature- und Preisvergleich.
            Stand: März 2026. <a href="/vergleich" className="link link-primary">Ausführlicher Vergleich →</a>
          </p>
          <p className="text-base-content/80 max-w-2xl mx-auto text-sm leading-relaxed">
            Alle vier Apps bieten KI-Foto-Erkennung im Premium-Abo. Mahlzait unterscheidet sich durch KI-Mahlzeit-Vorschläge, YouTube-Rezept-Import und eine werbefreie Gratis-Version.
            Mit 10 Mio. Lebensmitteln und einem Jahrespreis von 29,99&nbsp;€ ist Mahlzait die günstigste Option — MyFitnessPal kostet 49,99&nbsp;€, YAZIO und Lifesum je 44,99&nbsp;€/Jahr.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr className="text-base">
                <th className="bg-base-200">Feature</th>
                <th className="bg-primary/10 font-bold">Mahlzait</th>
                <th className="bg-base-200">MyFitnessPal</th>
                <th className="bg-base-200">YAZIO</th>
                <th className="bg-base-200">Lifesum</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="font-medium">{row.feature}</td>
                  <td className="bg-primary/5 font-medium">{row.mahlzait}</td>
                  <td>{row.mfp}</td>
                  <td>{row.yazio}</td>
                  <td>{row.lifesum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-base-content/50 mt-4 text-center">
          Preise und Features können abweichen. Daten basieren auf öffentlich verfügbaren Informationen der jeweiligen App-Store-Einträge und Websites (Stand: Februar 2026).
        </p>
      </motion.div>
    </section>
  );
}

export default ComparisonTable;
