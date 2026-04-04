import { motion } from "framer-motion";

const tools = [
  {
    href: "/essensplan-erstellen/",
    title: "Essensplan erstellen",
    description:
      "Dein persönlicher 7-Tage-Ernährungsplan mit KI. Abgestimmt auf Kalorien, Makros, Ernährungsform und Allergien — in Sekunden generiert.",
    badge: "Neu",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
      </svg>
    ),
  },
  {
    href: "/trainingsplan-erstellen/",
    title: "Trainingsplan erstellen",
    description:
      "Individueller Wochentrainingsplan mit KI. Passend zu Level, Equipment und Zeitbudget — mit Übungen, Sätzen und Progressionsplan.",
    badge: "Neu",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
      </svg>
    ),
  },
];

function AiTools() {
  return (
    <section id="ki-tools" className="max-w-screen-lg mx-auto px-4 py-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-center mb-10"
        >
          <span className="badge badge-primary badge-lg mb-3 gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            KI-Generatoren
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">
            Dein Plan in Sekunden — erstellt von KI
          </h2>
          <p className="mt-3 text-base-content/60 max-w-2xl mx-auto">
            Gib deine Daten ein und bekomme einen personalisierten Essens- oder Trainingsplan.
            Kostenlos, ohne Anmeldung, wissenschaftlich fundiert.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool, index) => (
            <motion.a
              key={tool.href}
              href={tool.href}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-base-100 p-6 no-underline transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-content transition-colors">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-base-content">{tool.title}</h3>
                    <span className="badge badge-primary badge-sm">{tool.badge}</span>
                  </div>
                  <p className="text-sm leading-6 text-base-content/65">{tool.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                Jetzt kostenlos erstellen
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default AiTools;
