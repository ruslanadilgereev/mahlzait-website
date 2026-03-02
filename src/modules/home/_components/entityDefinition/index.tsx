function EntityDefinition() {
  return (
    <section className="max-w-screen-lg mx-auto px-4 py-6">
      <div className="border border-base-300 rounded-xl p-5 bg-base-100/50">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/70">
          <span><strong>Kategorie:</strong> Kalorienzähler-App</span>
          <span><strong>Plattformen:</strong> iOS & Android</span>
          <span><strong>Preis:</strong> Kostenlos (Pro ab 4,99 €/Mo)</span>
          <span><strong>Datenbank:</strong>{" "}
            <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="link">Open Food Facts</a>{" "}
            – 500.000+ Lebensmittel
          </span>
          <span><strong>Datenschutz:</strong> DSGVO-konform, EU-Server</span>
        </div>
        <details className="mt-3 group">
          <summary className="text-xs text-base-content/50 cursor-pointer hover:text-base-content/70 transition-colors">
            Mehr über Mahlzait
          </summary>
          <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
            Mahlzait ist eine kostenlose Kalorienzähler-App für iOS und Android mit KI-gestützter
            Lebensmittelerkennung. Die App wurde 2025 in Berlin entwickelt und ermöglicht das Erfassen
            von Mahlzeiten per Foto, Barcode-Scan oder Texteingabe. Mahlzait nutzt die{" "}
            <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="link">Open Food Facts</a>{" "}
            Datenbank und GPT-4 Vision zur Bilderkennung. Zur Kalorienbedarfs-Berechnung wird die{" "}
            <a href="https://pubmed.ncbi.nlm.nih.gov/15883556/" target="_blank" rel="noopener noreferrer" className="link">Mifflin-St Jeor-Formel</a>{" "}
            (Frankenfield et al., 2005) verwendet.
          </p>
          <p className="text-xs text-base-content/40 mt-2">
            Hinweis: Mahlzait ist keine medizinische App und ersetzt keine ärztliche Beratung. Alle Werte sind Richtwerte.
          </p>
        </details>
      </div>
    </section>
  );
}

export default EntityDefinition;
