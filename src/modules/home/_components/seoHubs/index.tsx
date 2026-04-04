import { motion } from "framer-motion";
import { priorityHubLinks } from "utils/seoHubLinks";

function SeoHubs() {
  return (
    <section className="max-w-screen-lg mx-auto px-4 py-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-2xl md:text-3xl font-bold text-center mb-2"
        >
          Rechner und Guides zum Einstieg
        </motion.h2>
        <motion.p
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          transition={{ delay: 0.08 }}
          className="text-center text-base-content/60 mb-8 max-w-2xl mx-auto"
        >
          Kalorienbedarf, Defizit, Makros und Abnehmen — die wichtigsten Rechner und Guides
          für deinen Start ins Tracking.
        </motion.p>

        <div className="grid gap-4 md:grid-cols-2">
          {priorityHubLinks.map((link, index) => (
            <motion.a
              key={link.href}
              href={link.href}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-base-300/60 bg-base-200/40 p-5 no-underline transition-all hover:border-primary/40 hover:bg-base-200"
            >
              <h3 className="text-lg font-semibold text-base-content">{link.title}</h3>
              <p className="mt-2 text-sm leading-6 text-base-content/65">{link.description}</p>
            </motion.a>
          ))}
        </div>

        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm"
        >
          <a href="/rechner/" className="link link-primary font-semibold">
            Alle Rechner ansehen
          </a>
          <a href="/wissen/" className="link link-primary font-semibold">
            Alle Artikel im Wissen-Bereich
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default SeoHubs;
