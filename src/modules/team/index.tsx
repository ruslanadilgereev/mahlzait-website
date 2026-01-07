import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

const company = {
  name: "Mahlzait",
  mission: "Abnehmen durch Präzision: Das einfachste Tracking-Erlebnis der Welt bauen.",
  founded: "2025",
  location: "Berlin",
  email: "kontakt@mahlzait.de",
};

const founder = {
  name: "Ruslan Adilgereev",
  role: "Founder & Product",
  bio:
    "Ingenieur & Pragmatiker. Hat Mahlzait gebaut, weil ihm existierende Apps zu ungenau und Barcodes zu nervig waren. Setzt auf modernste AI (LLMs mit Grounding) statt veralteter Datenbanken. Fokus: UX, die funktioniert.",
  linkedin: "https://www.linkedin.com/in/ruslanadilgereev",
};

function TeamPage({ config }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <section className="max-w-screen-lg mx-auto py-4 px-4 md:py-16">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold">Team</h1>
            <p className="mt-3 text-base opacity-80">{company.mission}</p>
            <div className="mt-4 text-sm opacity-70">
              <span>
                Gegründet {company.founded} · {company.location} · Founder‑led & bootstrapped
              </span>
              <span className="mx-2">·</span>
              <a className="link link-hover" href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold">Über Mahlzait</h3>
                <p className="mt-2">
                  Mahlzait ist ein moderner Kalorienzähler mit KI‑Unterstützung. Menschen loggen
                  Mahlzeiten per Foto/Chat, Barcode oder Suche – in Sekunden statt Minuten.
                </p>
                <ul className="list-disc list-inside mt-3 text-sm opacity-80">
                  <li>iOS & Android App mit KI‑Logging</li>
                  <li>Rezepte (inkl. YouTube‑Import) & Teilen</li>
                  <li>Health‑Integration (Apple Health / Google Fit)</li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold">Zahlen & Fortschritt</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="opacity-80">Geloggte Mahlzeiten</span>
                    <span className="font-semibold">6.000+</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="opacity-80">Aktive Nutzer:innen</span>
                    <span className="font-semibold">300+</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="opacity-80">Geteilte Rezepte</span>
                    <span className="font-semibold">120+</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="opacity-80">KI‑Essensvorschläge</span>
                    <span className="font-semibold">3.000+</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div aria-labelledby="team-heading" className="mt-8">
            <h2 id="team-heading" className="sr-only">
              Team
            </h2>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start gap-5">
                  <div className="avatar placeholder">
                    <div className="w-20 h-20 rounded-full bg-neutral text-neutral-content">
                      <span className="text-xl">RA</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{founder.name}</h3>
                    <p className="mt-1 text-sm opacity-70">{founder.role}</p>
                    <p className="mt-3 opacity-90">{founder.bio}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <a
                        className="link link-hover"
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </a>
                      <a className="link link-hover" href={`mailto:${company.email}`}>
                        Kontakt
                      </a>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="badge badge-outline">Product</span>
                      <span className="badge badge-outline">Mobile</span>
                      <span className="badge badge-outline">AI</span>
                      <span className="badge badge-outline">Full‑stack</span>
                      <span className="badge badge-outline">Growth</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold">Transparenz</h4>
                  <ul className="list-disc list-inside mt-2 text-sm opacity-80">
                    <li>Einzelgründung · Founder‑led</li>
                    <li>Bootstrapped (keine Investoren)</li>
                    <li>Standort: {company.location}</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm opacity-60">
              Foto wird nachgereicht. Sobald vorhanden, wird hier ein Porträt angezeigt.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold">Fokus & Verantwortlichkeiten</h3>
                <ul className="mt-2 space-y-2">
                  <li>Produktstrategie, UX & Roadmap</li>
                  <li>iOS/Android App & Backend</li>
                  <li>KI‑Features (Foto/Chat‑Logging, Vorschläge)</li>
                  <li>Analytics, Datenschutz & Qualität</li>
                </ul>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold">Tech Stack</h3>
                <ul className="mt-2 space-y-2">
                  <li>Flutter (iOS/Android) · Firebase</li>
                  <li>Vision/LLM‑basierte KI‑Features</li>
                  <li>Astro + React (Website)</li>
                  <li>GA4, Clarity, Vercel Analytics (mit Consent)</li>
                </ul>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold">Nächste Schritte</h3>
                <ul className="mt-2 space-y-2">
                  <li>Marketing & Wachstum fokussieren</li>
                  <li>Strategische Partnerschaften aufbauen</li>
                  <li>Noch schnellere AI‑Performance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default TeamPage;


