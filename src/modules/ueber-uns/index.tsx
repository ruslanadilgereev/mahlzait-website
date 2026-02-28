import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import { motion } from "framer-motion";

interface TechItem {
  name: string;
  desc: string;
}

interface Props {
  config: TemplateConfig;
  company: {
    name: string;
    founded: string;
    location: string;
    email: string;
    website: string;
    mission: string;
    vision: string;
  };
  founder: {
    name: string;
    role: string;
    bio: string;
    linkedin: string;
  };
  techStack: TechItem[];
}

function UeberUnsPage({ config, company, founder, techStack }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/logo.png" 
                alt="Mahlzait Logo" 
                className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-lg"
                width={96}
                height={96}
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight"
            >
              Über {company.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto"
            >
              {company.mission}
            </motion.p>
          </header>
        </section>

        {/* Vision Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Unsere Vision</h2>
              <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto leading-relaxed">
                {company.vision}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Die Geschichte</h2>
                <div className="space-y-4 opacity-80">
                  <p>
                    Mahlzait entstand aus persönlicher Frustration. Existierende Kalorienzähler-Apps 
                    waren entweder zu kompliziert, ungenau, oder versteckten wichtige Features hinter 
                    teuren Paywalls.
                  </p>
                  <p>
                    Die Idee war einfach: Was wäre, wenn man moderne KI nutzen würde, um das Tracking 
                    so einfach wie möglich zu machen? Keine endlose Suche in Datenbanken, kein 
                    mühsames Eintippen - einfach beschreiben, was man gegessen hat.
                  </p>
                  <p>
                    So wurde Mahlzait geboren: Ein Kalorienzähler, der versteht, was du isst, 
                    und dir die Arbeit abnimmt.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="stats stats-vertical shadow bg-base-100">
                  <div className="stat">
                    <div className="stat-title">Gegründet</div>
                    <div className="stat-value text-primary">{company.founded}</div>
                    <div className="stat-desc">{company.location}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Geloggte Mahlzeiten</div>
                    <div className="stat-value text-secondary">6.000+</div>
                    <div className="stat-desc">Und wachsend</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Aktive Nutzer</div>
                    <div className="stat-value text-accent">300+</div>
                    <div className="stat-desc">Täglich aktiv</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Das Team</h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto"
            >
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="avatar placeholder mb-4">
                    <div className="bg-primary text-primary-content rounded-full w-24">
                      <span className="text-3xl">RA</span>
                    </div>
                  </div>
                  <h3 className="card-title text-xl">{founder.name}</h3>
                  <p className="text-primary font-medium">{founder.role}</p>
                  <p className="opacity-80 mt-4">{founder.bio}</p>
                  <div className="card-actions mt-4">
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Technologie</h2>
            <p className="text-center opacity-80 mb-12 max-w-xl mx-auto">
              Mahlzait nutzt modernste Technologien, um dir das beste Tracking-Erlebnis zu bieten.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg">{tech.name}</h3>
                    <p className="opacity-70 text-sm">{tech.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Unsere Werte</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2">Einfachheit</h3>
                <p className="opacity-80">
                  Tracking sollte nicht kompliziert sein. Wir entfernen Hürden, nicht fügen sie hinzu.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-2">Datenschutz</h3>
                <p className="opacity-80">
                  Deine Ernährungsdaten gehören dir. DSGVO-konform und ohne Werbung.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="opacity-80">
                  Wir nutzen KI, um das Tracking auf ein neues Level zu heben.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="py-8 bg-base-100">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <p className="text-sm opacity-60">
              Nährwertdaten basieren auf <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="link">Open Food Facts</a>, 
              dem Bundeslebensmittelschlüssel (BLS) und weiteren verifizierten Quellen.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Kontakt</h2>
            <p className="opacity-90 mb-6">
              Fragen, Feedback oder Partnerschaftsanfragen? Wir freuen uns von dir zu hören!
            </p>
            <a
              href={`mailto:${company.email}`}
              className="btn btn-lg bg-white text-primary hover:bg-white/90"
            >
              {company.email}
            </a>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default UeberUnsPage;
