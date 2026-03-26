import { useContext } from "react";
import { ConfigContext } from "../../utils/configContext";
import InstagramLogo from "./svgs/instagram";
import FacebookLogo from "./svgs/facebook";
import TwitterLogo from "./svgs/twitter";
import PinterestLogo from "./svgs/pinterest";
import TikTokLogo from "./svgs/tiktok";
import { motion } from "framer-motion";

function Footer() {
  const {
    footer: { links, legalLinks, socials, calculatorLinks, appLinks },
  } = useContext(ConfigContext)!;

  return (
    <footer className="relative bg-neutral text-neutral-content px-4 pt-0 pb-12">
      <div className="absolute rounded-t-[50%] -top-12 left-0 bg-neutral w-full h-12" />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-screen-lg mx-auto mt-12"
      >
        {/* Top Section: Brand + Description */}
        <div className="mb-10 text-center md:text-left">
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-primary mb-2"
          >
            Mahlzait
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ delay: 0.2 }}
            className="text-sm opacity-70 max-w-md"
          >
            Der KI-Kalorienzähler aus Deutschland. Foto machen, Kalorien erkennen — einfach, schnell und DSGVO-konform.
          </motion.p>
        </div>

        {/* Links Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-10">
          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-1">Navigation</span>
            {links.map(({ title, href }, index) => (
              <motion.a
                key={index}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
                href={href}
              >
                {title}
              </motion.a>
            ))}
          </nav>

          {/* Rechner / Tools */}
          {calculatorLinks && calculatorLinks.length > 0 && (
            <nav className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-1">Tools & Rechner</span>
              {calculatorLinks.map(({ title, href }, index) => (
                <motion.a
                  key={index}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
                  href={href}
                >
                  {title}
                </motion.a>
              ))}
            </nav>
          )}

          {/* App & Wissen */}
          {appLinks && appLinks.length > 0 && (
            <nav className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-1">App & Wissen</span>
              {appLinks.map(({ title, href }, index) => (
                <motion.a
                  key={index}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                  className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
                  href={href}
                >
                  {title}
                </motion.a>
              ))}
            </nav>
          )}

          {/* Rechtliches */}
          <nav className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-1">Rechtliches</span>
            {legalLinks.termsAndConditions && (
              <motion.a
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ delay: 0.4 }}
                className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
                href="/nutzungsbedingungen"
              >
                Nutzungsbedingungen
              </motion.a>
            )}
            {legalLinks.privacyPolicy && (
              <motion.a
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ delay: 0.45 }}
                className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
                href="/datenschutz"
              >
                Datenschutz
              </motion.a>
            )}
            <motion.a
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.5 }}
              className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
              href="/impressum"
            >
              Impressum
            </motion.a>
            <motion.a
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.55 }}
              className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
              href="/agb"
            >
              AGB
            </motion.a>
            {legalLinks.cookiesPolicy && (
              <motion.a
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ delay: 0.6 }}
                className="text-sm link no-underline text-primary/80 hover:text-primary transition-colors"
                href="/cookies-policy"
              >
                Cookies
              </motion.a>
            )}
            <motion.button
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.65 }}
              className="text-sm text-left text-primary/80 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0"
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).revokeCookieConsent) {
                  (window as any).revokeCookieConsent();
                }
              }}
              title="Cookie-Einstellungen widerrufen"
            >
              Cookie-Einstellungen
            </motion.button>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-primary/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-5 text-primary/60">
              {socials?.instagram && (
                <a className="w-5 h-5 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer" href={socials.instagram} aria-label="Instagram">
                  <InstagramLogo />
                </a>
              )}
              {socials?.tiktok && (
                <a className="w-5 h-5 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer" href={socials.tiktok} aria-label="TikTok">
                  <TikTokLogo />
                </a>
              )}
              {socials?.facebook && (
                <a className="w-5 h-5 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer" href={socials.facebook} aria-label="Facebook">
                  <FacebookLogo />
                </a>
              )}
              {socials?.pinterest && (
                <a className="w-5 h-5 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer" href={socials.pinterest} aria-label="Pinterest">
                  <PinterestLogo />
                </a>
              )}
              {socials?.twitter && (
                <a className="w-5 h-5 hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer" href={socials.twitter} aria-label="X (Twitter)">
                  <TwitterLogo />
                </a>
              )}
            </div>

            {/* Copyright */}
            <p className="text-xs opacity-50 text-center md:text-right">
              © {new Date().getFullYear()} Mahlzait · Made with ❤️ in Germany
            </p>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer;
