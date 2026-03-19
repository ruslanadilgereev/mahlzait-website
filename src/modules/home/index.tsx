import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import AppBanner from "../../components/appBanner";
import { ConfigContext } from "../../utils/configContext";
import type { TemplateConfig } from "../../utils/configType";
import Header from "./_components/header";
import Features from "./_components/features";
import Partners from "./_components/partners";
import Faq from "./_components/faq";
import HowItWorks from "./_components/howItWorks";
import Pricing from "./_components/pricing";
import Testimonials from "./_components/testimonials";
import LiveDemo from "./_components/liveDemo";
import ComparisonTable from "./_components/comparisonTable";

function MedicalDisclaimer() {
  return (
    <section className="max-w-screen-lg mx-auto px-4 py-6">
      <div className="bg-base-200/50 rounded-xl p-6 text-sm text-base-content/70 space-y-3">
        <h3 className="font-semibold text-base text-base-content/90">⚕️ Wichtiger Hinweis</h3>
        <p>
          Mahlzait ist ein Hilfsmittel zur Ernährungsdokumentation und ersetzt keine ärztliche Beratung.
          Bei gesundheitlichen Beschwerden, Vorerkrankungen (z.&nbsp;B. Diabetes, Essstörungen) oder Unsicherheiten
          konsultiere bitte einen Arzt oder Ernährungsberater. Die angegebenen Durchschnittswerte basieren auf
          Nutzerdaten und sind nicht als medizinische Empfehlung zu verstehen.
        </p>
        <p>
          <strong>Datenschutz &amp; DSGVO:</strong> Mahlzait ist 100&nbsp;% DSGVO-konform. Alle Daten werden auf Servern
          in der EU gespeichert. Tracking erfolgt nur nach expliziter Zustimmung (Opt-In). Nutzer können ihr
          Konto jederzeit vollständig löschen.
        </p>
      </div>
    </section>
  );
}

interface Props {
  config: TemplateConfig;
}

function Home({ config }: Props) {
  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Header />
        <Partners />
        <LiveDemo />
        <Features />
        <ComparisonTable />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <MedicalDisclaimer />
        <Faq />
        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default Home;
