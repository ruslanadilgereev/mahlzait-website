import AnimatedText from "../../../../components/animatedText";
import { motion } from "framer-motion";
import { useContext } from "react";
import { ConfigContext } from "../../../../utils/configContext";

function Differentiators() {
  const config = useContext(ConfigContext)!;
  const differentiators = config.home.differentiators;
  if (!differentiators) return null;

  return (
    <section id={differentiators.id} className="max-w-screen-lg mx-auto px-4 py-12">
      <div className="mb-12 max-w-none flex flex-col items-center prose prose-lg text-center">
        <h2 className="mb-3">
          <AnimatedText text={differentiators.title} />
        </h2>
        <motion.div
          className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full overflow-hidden [--w:200px] md:[--w:350px]"
          whileInView={{ width: "var(--w)" }}
          viewport={{ amount: 1, once: true, margin: "0px 0px -100px 0px" }}
        />
        {differentiators.subtitle && (
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            whileInView={{ y: 0, opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-md max-w-2xl"
          >
            {differentiators.subtitle}
          </motion.p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {differentiators.cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="card-body p-6">
              <div className="text-3xl mb-2" aria-hidden="true">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold leading-tight">{card.title}</h3>
              <p className="text-sm opacity-80 mt-2">{card.body}</p>
              {card.example && (
                <p className="text-xs opacity-60 mt-3 pt-3 border-t border-base-200">
                  {card.example}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Differentiators;
