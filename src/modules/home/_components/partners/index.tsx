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
        {partners.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={{ once: true }}
            className="text-neutral-content/70 text-sm mb-2"
          >
            {partners.subtitle}
          </motion.p>
        )}
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
              {stat.tooltip && (
                <div className="text-xs text-neutral-content/50 mt-1">
                  {stat.tooltip}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {/* DSGVO Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 w-full"
        >
          <div className="bg-neutral-content/5 backdrop-blur-sm rounded-2xl border border-neutral-content/10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Shield Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-success/20 flex items-center justify-center">
                  <svg 
                    className="w-10 h-10 md:w-12 md:h-12 text-success" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                    />
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-neutral-content mb-2">
                  🇪🇺 100% DSGVO-konform
                </h3>
                <p className="text-neutral-content/70 text-sm md:text-base mb-4">
                  Deine Daten gehören dir. Wir fragen immer erst um Erlaubnis, bevor wir Tracking nutzen. 
                  Keine versteckten Cookies, volle Transparenz.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Cookie-Consent
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Opt-Out jederzeit
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Server in EU
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Konto löschbar
                  </span>
                </div>
              </div>
              
              {/* CTA */}
              <div className="flex-shrink-0">
                <a 
                  href="/datenschutz" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-content text-neutral font-medium text-sm hover:bg-neutral-content/90 transition-colors no-underline"
                >
                  Datenschutz lesen
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Partners;
