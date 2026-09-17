import { useRef } from "react";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";

// Die zehn App-Store-Screens (Stand 5. September 2026), als WebP in public/screenshots/store/.
// Die Bildtexte sind bereits Teil der Grafik, alt beschreibt den Inhalt für Screenreader und Google.
const screens = [
  { file: "01_home", alt: "Tagesübersicht: 1.542 kcal gegessen, 752 übrig, Eiweiß, Kohlenhydrate und Fette als Balken" },
  { file: "02_ki_foto", alt: "Ein fotografierter Frühstücksteller mit Lachs, Ei und Avocado, von der KI als Mahlzeit mit 592 kcal erkannt" },
  { file: "03_chat", alt: "Mahlzeit per Sprache eingeben: 'Apfel und Kaffee mit Hafermilch' wird in zwei Einträge zerlegt" },
  { file: "04_meal_vorschlag", alt: "KI-Essensvorschlag für heute: pikantes Hähnchengeschnetzeltes mit Kartoffeln, 410 kcal, passend zum Ziel" },
  { file: "05_gewicht", alt: "Gewichtsverlauf über drei Monate mit Zielgewicht 85 kg und Wochenschnitt" },
  { file: "06_kalender", alt: "Kalenderansicht Februar 2026 mit Kalorien und Eiweiß pro Tag" },
  { file: "07_home_health", alt: "Mit Apple Health verbunden: Schritte, Gewicht, Aktivität, Schlaf, Wasser und Fasten auf einen Blick" },
  { file: "08_stats", alt: "Wochenstatistik: Eiweiß, Kohlenhydrate, Fette, Ballaststoffe und Salz im Vergleich zum Ziel" },
  { file: "09_suche", alt: "Lebensmittelsuche nach Magerquark mit Nährwerten je 100 g verschiedener Marken" },
  { file: "10_reviews", alt: "4,6 Sterne im App Store und drei Nutzerbewertungen" },
];

function AppGallery() {
  const track = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section id="app-gallery" className="py-12 md:py-16">
      <div className="max-w-screen-lg mx-auto px-4 mb-8 flex flex-col items-center prose prose-lg text-center">
        <h2 className="mb-3">Ein Blick in die App</h2>
        <p className="text-md max-w-lg opacity-70">
          Zehn Screens, so wie sie im App Store stehen.
        </p>
      </div>

      <div className="relative">
        <ul
          ref={track}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto px-4 pb-4 list-none m-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-[max(1rem,calc((100vw-64rem)/2))] scroll-px-4 md:scroll-px-[max(1rem,calc((100vw-64rem)/2))]"
          aria-label="Screenshots der Mahlzait-App"
        >
          {screens.map((s, i) => (
            <li key={s.file} className="snap-start shrink-0 w-[260px] md:w-[300px]">
              <img
                src={`/screenshots/store/${s.file}.webp`}
                alt={s.alt}
                width={640}
                height={1391}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-auto rounded-2xl bg-white ring-1 ring-black/5"
              />
            </li>
          ))}
        </ul>

        <div className="hidden md:flex justify-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="btn btn-circle btn-outline"
            aria-label="Vorherige Screens"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="btn btn-circle btn-outline"
            aria-label="Nächste Screens"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-center text-sm opacity-70 mt-4 px-4">
        <a
          href={getTrackedAppLink({ platform: "ios", source: "gallery" })}
          onClick={() => trackAppStoreClick("ios", "gallery")}
          className="link link-hover"
        >
          Im App Store ansehen
        </a>
      </p>
    </section>
  );
}

export default AppGallery;
