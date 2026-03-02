import { motion } from "framer-motion";

function EntityDefinition() {
  return (
    <section className="max-w-screen-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="prose prose-lg max-w-none"
      >
        <h2 className="text-2xl font-bold mb-4">Was ist Mahlzait?</h2>
        <p className="text-base-content/80">
          Mahlzait ist eine kostenlose Kalorienzähler-App für iOS und Android mit KI-gestützter
          Lebensmittelerkennung. Die App wurde 2025 in Berlin entwickelt und ermöglicht das Erfassen
          von Mahlzeiten per Foto, Barcode-Scan oder Texteingabe. Mahlzait greift auf die{" "}
          <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="link">Open Food Facts</a>{" "}
          Datenbank mit über 500.000 Lebensmitteln zu und nutzt GPT-4 Vision zur
          Bilderkennung. Die App trackt Kalorien, Makronährstoffe (Protein, Kohlenhydrate, Fett)
          sowie den Gewichtsverlauf. Zur Berechnung des individuellen Kalorienbedarfs verwendet
          Mahlzait die{" "}
          <a href="https://pubmed.ncbi.nlm.nih.gov/15883556/" target="_blank" rel="noopener noreferrer" className="link">Mifflin-St Jeor-Formel</a>,
          die laut einer Metaanalyse von Frankenfield et al. (2005) den Grundumsatz bei gesunden
          Erwachsenen am genauesten schätzt. Mahlzait ist DSGVO-konform, werbefrei in der
          Gratis-Version und speichert Daten auf EU-Servern.
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 not-prose">
          <div className="bg-base-200 rounded-lg p-4">
            <dt className="text-sm font-semibold text-base-content/60 mb-1">Kategorie</dt>
            <dd className="font-medium">Kalorienzähler-App / Food-Tracker</dd>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <dt className="text-sm font-semibold text-base-content/60 mb-1">Plattformen</dt>
            <dd className="font-medium">iOS (App Store) und Android (Google Play)</dd>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <dt className="text-sm font-semibold text-base-content/60 mb-1">Datenbank</dt>
            <dd className="font-medium"><a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="link">Open Food Facts</a> – 500.000+ Lebensmittel</dd>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <dt className="text-sm font-semibold text-base-content/60 mb-1">Preis</dt>
            <dd className="font-medium">Kostenlos (Pro: 4,99 €/Monat oder 29,99 €/Jahr)</dd>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <dt className="text-sm font-semibold text-base-content/60 mb-1">Entwickler</dt>
            <dd className="font-medium">Ruslan Adilgereev, Berlin</dd>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <dt className="text-sm font-semibold text-base-content/60 mb-1">Datenschutz</dt>
            <dd className="font-medium">DSGVO-konform, Daten auf EU-Servern</dd>
          </div>
        </dl>
        <p className="text-xs text-base-content/50 mt-4">
          Hinweis: Mahlzait ist keine medizinische App und ersetzt keine ärztliche Beratung oder 
          professionelle Ernährungsberatung. Alle berechneten Werte sind Richtwerte.
        </p>
      </motion.div>
    </section>
  );
}

export default EntityDefinition;
