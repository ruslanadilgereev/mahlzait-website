import AnimatedText from "../../../../components/animatedText";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { ConfigContext } from "../../../../utils/configContext";
import NeonHexagon from "./svgs/neonHexagon";

function Faq() {
  const {
    home: { faq },
  } = useContext(ConfigContext)!;
  const [activeIndex, setActiveIndex] = useState<number>();

  if (!faq) return null;

  return (
    <section id={faq.id} className="max-w-screen-lg mx-auto px-4 mb-12">
      <div className="relative flex items-center justify-center mb-8 md:mb-12 h-32 md:h-40">
        <NeonHexagon />
        <h3 className="relative text-center font-bold text-3xl md:text-4xl leading-snug">
          <AnimatedText text={faq.title} initial={{ y: "0%" }} />
        </h3>
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 items-start"
      >
        {faq.qa.map((qa, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ delay: 0.05 + (index % 8) * 0.05, duration: 0.3, ease: "easeOut" }}
            className={clsx(
              "border-2 border-primary/30 collapse collapse-arrow self-start",
              {
                "collapse-open": activeIndex === index,
              }
            )}
          >
            <button
              onClick={() =>
                setActiveIndex((current) =>
                  current === index ? undefined : index
                )
              }
              className="text-start collapse-title text-base md:text-lg font-medium"
            >
              {qa.question}
            </button>
            <div
              className={clsx(
                "grid grid-rows-[0fr] duration-300 transition-[grid-template-rows,padding]",
                {
                  "grid-rows-[1fr] pb-4": activeIndex === index,
                }
              )}
            >
              <p className="overflow-hidden mx-4 text-sm md:text-base opacity-[.7]">{qa.answer}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Faq;
