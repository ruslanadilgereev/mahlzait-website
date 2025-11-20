import AnimatedText from "../../../../components/animatedText";
import { motion } from "framer-motion";
import { useContext } from "react";
import { ConfigContext } from "../../../../utils/configContext";

function Partners() {
  const {
    home: { partners },
  } = useContext(ConfigContext)!;
  if (!partners) return null;

  return (
    <section id={partners.id} className="relative p-4 py-16">
      <div className="absolute left-0 right-0 top-0 bottom-0 bg-neutral -z-10" />
      <div className="max-w-screen-lg mx-auto mb-12 flex flex-col items-center">
        <h2 className="text-neutral-content text-4xl my-4 font-bold">
          <AnimatedText text={partners.title} />
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3, once: true, margin: "0px 0px -100px 0px" }}
          className="mt-8 w-full grid gap-12 grid-cols-2 md:grid-cols-4 justify-items-center"
        >
          {partners.stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { y: 40, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              transition={{ delay: 0.15 + index * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-5xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-neutral-content mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-neutral-content/80 max-w-[140px]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Partners;
