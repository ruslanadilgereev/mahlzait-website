import { motion } from "framer-motion";

const highlights = [
  { icon: "📸", label: "Foto, Barcode oder Text" },
  { icon: "🍎", label: "10 Mio+ Lebensmittel" },
  { icon: "🇪🇺", label: "DSGVO-konform" },
  { icon: "⚡", label: "KI in ~2 Sekunden" },
];

function EntityDefinition() {
  return (
    <section className="max-w-screen-lg mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed mb-6">
          Mahlzait ist ein kostenloser Kalorienzähler mit KI-Unterstützung für iOS und Android.
          Die App trackt Mahlzeiten per Foto, Barcode oder Text und nutzt eine Datenbank mit
          über 10 Millionen Lebensmitteln. Entwickelt in Berlin, DSGVO-konform.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {highlights.map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/60 text-sm font-medium text-base-content/80"
            >
              <span>{item.icon}</span>
              {item.label}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default EntityDefinition;
