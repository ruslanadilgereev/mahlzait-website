import { motion } from "framer-motion";

function EntityDefinition() {
  return (
    <section className="max-w-screen-lg mx-auto px-4 pt-2 pb-4">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center text-base md:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed"
      >
        Mahlzait ist ein kostenloser Kalorienzähler mit KI-Unterstützung für iOS und Android.
        Die App trackt Mahlzeiten per Foto, Barcode oder Text und nutzt eine Datenbank mit
        über 10 Millionen Lebensmitteln. Entwickelt in Berlin, DSGVO-konform.
      </motion.p>
    </section>
  );
}

export default EntityDefinition;
