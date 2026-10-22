import { motion } from "framer-motion";
import { useContext } from "react";
import { ConfigContext } from "../../../../utils/configContext";
import { trackCommunityClick } from "../../../../utils/trackingLinks";
import SVGWhatsApp from "./svg/whatsapp";

function Community() {
  const {
    whatsappCommunityLink,
    home: { community },
  } = useContext(ConfigContext)!;
  if (!community || !whatsappCommunityLink) return null;

  return (
    <section
      id={community.id}
      className="max-w-screen-lg mx-auto px-4 pt-6 pb-12 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-10"
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-base-100 border border-base-300 text-sm font-medium">
              <SVGWhatsApp className="w-4 h-4 flex-shrink-0 text-success" />
              {community.eyebrow}
            </span>
            <h2 className="mt-4 mb-3 text-3xl md:text-4xl font-bold text-balance">
              {community.title}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-base-content/80">
              {community.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-6 md:w-80">
            <ul className="flex flex-col gap-3">
              {community.points.map((point) => (
                <li key={point} className="flex items-center gap-3 font-medium">
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
            <div>
              <a
                href={whatsappCommunityLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCommunityClick("home")}
                className="btn btn-primary btn-lg w-full px-4"
              >
                <SVGWhatsApp className="w-5 h-5" />
                {community.actionText}
              </a>
              <p className="mt-2 text-sm text-center text-base-content/70">
                {community.note}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Community;
