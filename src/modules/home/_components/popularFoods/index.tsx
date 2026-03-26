import { motion } from "framer-motion";

const popularFoods = [
  { name: "Döner", slug: "doener", cal: 215 },
  { name: "Banane", slug: "banane", cal: 89 },
  { name: "Reis", slug: "reis", cal: 130 },
  { name: "Haferflocken", slug: "haferflocken", cal: 372 },
  { name: "Ei", slug: "ei", cal: 155 },
  { name: "Avocado", slug: "avocado", cal: 160 },
  { name: "Lachs", slug: "lachs", cal: 208 },
  { name: "Pizza", slug: "pizza", cal: 266 },
  { name: "Kartoffeln", slug: "kartoffeln", cal: 77 },
  { name: "Hähnchenbrust", slug: "haehnchenbrust", cal: 165 },
  { name: "Magerquark", slug: "magerquark", cal: 67 },
  { name: "Nudeln", slug: "nudeln", cal: 131 },
  { name: "Brokkoli", slug: "brokkoli", cal: 34 },
  { name: "Tofu", slug: "tofu", cal: 76 },
  { name: "Brot", slug: "brot", cal: 265 },
];

function PopularFoods() {
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
          Beliebte Kalorientabellen
        </motion.h2>
        <motion.p
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          transition={{ delay: 0.1 }}
          className="text-center text-base-content/60 mb-8 max-w-xl mx-auto"
        >
          Nährwerte und Kalorien der beliebtesten Lebensmittel — mit interaktivem Rechner
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {popularFoods.map((food, index) => (
            <motion.a
              key={food.slug}
              href={`/kalorien/${food.slug}/`}
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: index * 0.03 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-base-200/50 hover:bg-base-200 border border-base-300/50 hover:border-primary/30 transition-all no-underline group"
            >
              <span className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors">
                {food.name}
              </span>
              <span className="text-xs text-base-content/50 mt-1">
                {food.cal} kcal/100g
              </span>
            </motion.a>
          ))}
        </div>
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <a
            href="/kalorien/"
            className="text-sm link link-primary font-semibold"
          >
            Alle 300+ Lebensmittel ansehen →
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default PopularFoods;
