import { useRef } from "react";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";

// Die zehn Screens des Redesigns (Herbst 2026) in Store-Reihenfolge, als WebP in
// public/screenshots/store/. Live seit 30.09.2026, vor dem Store-Release des
// Redesigns (Ruslans Entscheidung); deshalb kein "wie im App Store" im Text.
// Die Headline ist Teil der Grafik, alt beschreibt den Inhalt.
const screens = [
  { file: "01_foto", alt: "Ein fotografierter Frühstücksteller mit Lachs, Ei und Beeren, von der KI mit 602 kcal erkannt" },
  { file: "02_home", alt: "Tagesübersicht: 1.868 von 1.950 kcal gegessen, 82 kcal übrig, dazu Fett, Kohlenhydrate, Ballaststoffe, Eiweiß und Salz" },
  { file: "03_text", alt: "Per Text eingetragen: 1 Apfel und 250 ml Kaffee mit Hafermilch, zusammen 121 kcal" },
  { file: "04_vorschlaege", alt: "KI-Vorschlag für den Rest des Tages: Hähnchenpfanne mit buntem Gemüse und Basmati-Reis, 494 kcal" },
  { file: "05_gewicht", alt: "Gewichtsverlauf seit Juli: 78,2 kg, 6,2 kg weniger, Ziel 75 kg" },
  { file: "06_naehrwerte", alt: "Nährwerte der Woche: Eiweiß im Schnitt 110 g pro Tag, dazu Fett, Kohlenhydrate, Ballaststoffe und Salz" },
  { file: "07_suche", alt: "Lebensmittelsuche nach Magerquark mit Nährwerten je 100 g verschiedener Marken" },
  { file: "08_historie", alt: "Kalender September 2026 mit 29 Tagen im Ziel und dem Tagesstand samt Mahlzeiten" },
  { file: "09_statistik", alt: "Wochenstatistik mit Tagesdurchschnitt, Bilanz und Gewichtsverlauf" },
  { file: "10_stimmen", alt: "4,7 von 5 Sternen im App Store und drei Nutzerbewertungen" },
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
          Zehn Screens aus der App.
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
