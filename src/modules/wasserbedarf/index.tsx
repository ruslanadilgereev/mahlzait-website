import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

import AuthorByline from "@components/AuthorByline";
import { beispiele, beispielKg, faq, grundlage, hinweis, links, quellen, STAND } from "./faq";
import {
  ALTER_MAX,
  ALTER_MIN,
  ERWACHSEN_AB,
  flaschen,
  glaeser,
  HITZETAG,
  LEBENSLAGE_AB,
  type Lebenslage,
  liter,
  richtwert,
  richtwerte,
  spanne,
  SPORT_JE_STUNDE,
  type Tag,
  type Trinkmenge,
  trinkmenge,
  zahl,
} from "./rechnung";

interface Props {
  config: TemplateConfig;
}

const lebenslagen: { id: Lebenslage; label: string; emoji: string }[] = [
  { id: "keine", label: "Nein", emoji: "🙂" },
  { id: "schwanger", label: "Schwanger", emoji: "🤰" },
  { id: "stillend", label: "Stillend", emoji: "🤱" },
];

const tage: { id: Tag; label: string; desc: string; emoji: string }[] = [
  { id: "normal", label: "Normaler Tag", desc: "Ohne Sport und Hitze", emoji: "🌤️" },
  { id: "sport1", label: "1 Stunde Sport", desc: "oder anstrengende Arbeit", emoji: "🏃" },
  { id: "sport2", label: "2 Stunden Sport", desc: "oder anstrengende Arbeit", emoji: "🏋️" },
  { id: "hitze", label: "Hitzetag", desc: "Während einer Hitzewelle", emoji: "🔥" },
];

function WasserbedarfsRechnerPage({ config }: Props) {
  const [age, setAge] = useState(40);
  const [lebenslage, setLebenslage] = useState<Lebenslage>("keine");
  const [tag, setTag] = useState<Tag>("normal");
  const [result, setResult] = useState<Trinkmenge | null>(null);

  const calculateWater = () => {
    setResult(trinkmenge(age, lebenslage, tag));
  };

  const waterSources = [
    { name: "Wasser", emoji: "💧", note: "Beste Wahl" },
    { name: "Kräuter- und Früchtetee", emoji: "🍵", note: "Ungesüßt, zählt voll" },
    { name: "Kaffee, schwarzer Tee", emoji: "☕", note: "Zählt mit, 3 bis 4 Tassen am Tag" },
    { name: "Mineralwasser", emoji: "🫧", note: "Beste Wahl" },
    { name: "Saftschorle", emoji: "🧃", note: "1 Teil Saft, 3 Teile Wasser" },
    { name: "Suppen & Brühen", emoji: "🍲", note: "Zählen zum Wasser im Essen" },
  ];

  const dehydrationSigns = [
    { sign: "Durst", emoji: "😐" },
    { sign: "Dunkler Urin", emoji: "🚽" },
    { sign: "Trockene Lippen", emoji: "👄" },
    { sign: "Kopfschmerzen", emoji: "🤕" },
    { sign: "Müdigkeit", emoji: "😴" },
    { sign: "Konzentrationsschwäche", emoji: "🧠" },
    { sign: "Schwindel", emoji: "💫" },
    { sign: "Verwirrtheit", emoji: "😵" },
  ];

  const note = result && hinweis(result);

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Rechner", url: "/rechner/" },
          { name: "Wasserbedarfs-Rechner", url: "/wasserbedarf-rechner/" },
        ]} />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Wasserbedarfs-Rechner 💧
            </h1>
            <AuthorByline updatedAt="2026-11-24" />
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Wie viel solltest du am Tag trinken? Der Rechner zeigt den Richtwert der Deutschen Gesellschaft für Ernährung (DGE) für dein Alter und was sich an Tagen mit Sport oder Hitze ändert.
            </p>
            <p className="mt-4 text-sm opacity-70 max-w-2xl mx-auto">
              Korrektur vom {STAND}: Bisher rechnete diese Seite mit 35 ml pro kg Körpergewicht als Trinkmenge. Laut DGE gilt dieser Wert für Getränke und Essen zusammen.
            </p>
          </header>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">💧 Wasserbedarf berechnen</h2>

              {/* Age - Prominent Display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Alter</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min={ALTER_MIN}
                      max={ALTER_MAX}
                      value={age}
                      aria-label="Alter in Jahren"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setAge(Math.min(ALTER_MAX, Math.max(ALTER_MIN, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">Jahre</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={ALTER_MIN}
                  max={ALTER_MAX}
                  value={age}
                  aria-label="Alter in Jahren"
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>

              {/* Pregnancy and breastfeeding */}
              {age >= LEBENSLAGE_AB && (
                <div className="mb-8">
                  <span className="text-lg font-semibold block mb-4">Schwanger oder stillend?</span>
                  <div className="grid grid-cols-3 gap-3">
                    {lebenslagen.map((item) => (
                      <label
                        key={item.id}
                        className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                          lebenslage === item.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-base-200 border-2 border-transparent hover:border-base-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="lebenslage"
                          className="radio radio-primary mb-2"
                          checked={lebenslage === item.id}
                          onChange={() => setLebenslage(item.id)}
                        />
                        <span className="text-3xl mb-1">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sport and heat */}
              {age >= ERWACHSEN_AB ? (
                <div className="mb-8">
                  <span className="text-lg font-semibold block mb-4">Wie sieht dein Tag aus?</span>
                  <div className="grid grid-cols-2 gap-3">
                    {tage.map((item) => (
                      <label
                        key={item.id}
                        className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                          tag === item.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-base-200 border-2 border-transparent hover:border-base-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tag"
                          className="radio radio-primary mb-2"
                          checked={tag === item.id}
                          onChange={() => setTag(item.id)}
                        />
                        <span className="text-3xl mb-1">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs opacity-70">{item.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mb-8 text-sm opacity-70">
                  Bei Sport und Hitze brauchen auch Kinder und Jugendliche mehr. Die Mengen dafür gelten für Erwachsene, deshalb rechnet der Rechner sie erst ab {ERWACHSEN_AB} Jahren dazu.
                </p>
              )}

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateWater}>
                💧 Wasserbedarf berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-4xl sm:text-6xl font-bold text-primary">
                      {spanne(result, liter)} l
                    </div>
                    <div className="text-xl font-semibold mt-2 opacity-80">
                      Getränke pro Tag
                    </div>
                    <div className="text-lg mt-1 opacity-60">
                      ({spanne(result)} ml)
                    </div>
                    <p className="text-sm mt-3 opacity-80 max-w-md mx-auto">{grundlage(result)}</p>
                  </div>

                  {/* Water Visual */}
                  <div className="flex flex-wrap justify-center gap-2 my-6 max-w-xs mx-auto">
                    {Array.from({ length: Math.min(glaeser(result.von), 8) }).map((_, i) => (
                      <div key={i} className="text-2xl">🥛</div>
                    ))}
                    {glaeser(result.von) > 8 && <span className="text-xl self-center">+{glaeser(result.von) - 8}</span>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Gläser (250 ml)</h3>
                        <p className="text-2xl font-bold text-primary">{spanne(result, (ml) => zahl(glaeser(ml)))}</p>
                        <p className="text-xs opacity-60">pro Tag</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Flaschen (500 ml)</h3>
                        <p className="text-2xl font-bold text-secondary">{spanne(result, flaschen)}</p>
                        <p className="text-xs opacity-60">pro Tag</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Gesamtwasser</h3>
                        <p className="text-2xl font-bold">{zahl(result.richtwert.gesamt)} ml</p>
                        <p className="text-xs opacity-60">mit Essen, normaler Tag</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between gap-x-4 text-sm mt-4 px-4">
                    <span>Getränke: <strong className="text-primary">{zahl(result.richtwert.getraenke)} ml</strong></span>
                    <span>Wasser im Essen: <strong>{zahl(result.richtwert.festeNahrung)} ml</strong></span>
                    <span>Oxidationswasser: <strong>{zahl(result.richtwert.oxidationswasser)} ml</strong></span>
                  </div>
                  <p className="text-xs opacity-60 px-4">
                    Zur Einordnung: So setzen sich laut DGE an einem normalen Tag {zahl(result.richtwert.gesamt)} ml Gesamtwasserzufuhr zusammen. Oxidationswasser entsteht im Stoffwechsel.
                  </p>
                  {note && <p className="text-sm opacity-80 px-4">{note}</p>}
                  <p className="text-xs opacity-60 px-4">
                    Der Richtwert gilt für gesunde Menschen bei durchschnittlichem Klima. Er ist nach unten begrenzt, es darf also mehr sein. Der Rechner ersetzt keine ärztliche Beratung.
                  </p>

                  <div className="alert alert-info mt-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold">Tipp: Tracke auch dein Wasser!</p>
                      <p className="text-sm">
                        Mit Mahlzait kannst du nicht nur Kalorien, sondern auch deine Flüssigkeitszufuhr tracken.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Calculation Section */}
        <section className="pb-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                So rechnet der Wasserbedarfs-Rechner
              </h2>
              <p className="opacity-80">
                Grundlage sind die{" "}
                <a href={links.richtwerte} target="_blank" rel="noopener noreferrer" className="link link-primary">
                  Richtwerte der DGE für die Wasserzufuhr
                </a>{" "}
                (Stand der Ableitung 2000, abgerufen am {STAND}). Die DGE leitet sie aus dem Energieumsatz ab, bei durchschnittlichem Klima in Deutschland: Gesamtwasserzufuhr minus Oxidationswasser minus Wasser aus dem Essen ergibt die Menge, die du trinken solltest. Dieser Wert hängt vom Alter ab, nicht vom Körpergewicht.
              </p>

              <div className="overflow-x-auto my-6">
                <table className="table table-sm bg-base-200">
                  <thead>
                    <tr>
                      <th>Gruppe</th>
                      <th className="text-right">Getränke</th>
                      <th className="text-right">Wasser im Essen</th>
                      <th className="text-right">Oxidationswasser</th>
                      <th className="text-right">Gesamt</th>
                      <th className="text-right">Getränke und Essen je kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {richtwerte.map((r) => (
                      <tr key={r.gruppe}>
                        <td>{r.gruppe}</td>
                        <td className="text-right whitespace-nowrap font-bold">{zahl(r.getraenke)} ml</td>
                        <td className="text-right whitespace-nowrap">{zahl(r.festeNahrung)} ml</td>
                        <td className="text-right whitespace-nowrap">{zahl(r.oxidationswasser)} ml</td>
                        <td className="text-right whitespace-nowrap">{zahl(r.gesamt)} ml</td>
                        <td className="text-right whitespace-nowrap">{r.jeKg} ml</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm opacity-70">
                Werte pro Tag. Für Säuglinge gelten eigene Richtwerte (Muttermilch und Säuglingsnahrung), sie fehlen hier deshalb. Der Rechner gibt den Richtwert für Getränke aus, die DGE{" "}
                <a href={links.fragenRichtwert} target="_blank" rel="noopener noreferrer" className="link">
                  begrenzt ihn nach unten
                </a>
                .
              </p>

              <h3 className="text-xl font-bold mt-8 mb-3">Und die 35 ml pro kg Körpergewicht?</h3>
              <p className="opacity-80">
                Die stehen auch in der Tabelle der DGE, gelten aber für Getränke und feste Nahrung zusammen, ab 51 Jahren sind es {richtwert(58).jeKg} ml. Bei {beispielKg} kg sind {richtwert(40).jeKg} ml pro kg {zahl(beispielKg * richtwert(40).jeKg)} ml, das entspricht den {zahl(richtwert(40).getraenke)} ml Getränken und {zahl(richtwert(40).festeNahrung)} ml Wasser im Essen der Gruppe {richtwert(40).gruppe}. Einen Wert für Getränke pro kg nennt die DGE nicht.
              </p>

              <h3 className="text-xl font-bold mt-8 mb-3">Sport und Hitze</h3>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>
                  <strong>Sport und körperlich anstrengende Arbeit:</strong> zusätzlich {liter(SPORT_JE_STUNDE.von)} bis {liter(SPORT_JE_STUNDE.bis)} Liter pro Stunde können laut{" "}
                  <a href={links.flyer} target="_blank" rel="noopener noreferrer" className="link link-primary">DGE</a>{" "}
                  nötig sein. Der Rechner zählt das für 1 und 2 Stunden dazu. Pauschale Trinkmengen im Sport hält die{" "}
                  <a href={links.sport} target="_blank" rel="noopener noreferrer" className="link link-primary">Arbeitsgruppe Sporternährung der DGE</a>{" "}
                  für wenig sinnvoll, sie rät zum Trinken nach Durst und für lange Belastungen zum Wiegen vorher und nachher.
                </li>
                <li>
                  <strong>Hitzewelle:</strong> etwa {HITZETAG.von / 1000} bis {HITZETAG.bis / 1000} Liter über den Tag verteilt empfiehlt das{" "}
                  <a href={links.hitze} target="_blank" rel="noopener noreferrer" className="link link-primary">Bundesinstitut für Öffentliche Gesundheit (BIÖG)</a>
                  . Faustregel der{" "}
                  <a href={links.hitzeBlog} target="_blank" rel="noopener noreferrer" className="link link-primary">DGE</a>
                  : tagsüber alle 1 bis 2 Stunden ein Glas Wasser (0,2 Liter). Für Sport an Hitzetagen nennen beide keine gemeinsame Menge, deshalb zählt der Rechner sie nicht zusammen.
                </li>
                <li>
                  <strong>Ohne Zahl:</strong> Mehr brauchst du laut DGE auch bei trockener kalter Luft, Fieber, Erbrechen und Durchfall, viel Salz oder viel Protein.
                </li>
              </ul>

              <h3 className="text-xl font-bold mt-8 mb-3">Beispiele</h3>
              <div className="overflow-x-auto">
                <table className="table table-sm bg-base-200">
                  <thead>
                    <tr>
                      <th>Person und Tag</th>
                      <th className="text-right">Getränke pro Tag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beispiele.map((b) => (
                      <tr key={b.person}>
                        <td>{b.person}</td>
                        <td className="text-right font-bold">{spanne(trinkmenge(b.alter, b.lebenslage, b.tag))} ml</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Water Sources Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was zählt zur Flüssigkeitszufuhr?
            </h2>
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
              {waterSources.map((source, i) => (
                <div key={i} className="card bg-base-100 shadow-xl">
                  <div className="card-body py-4 text-center">
                    <span className="text-4xl">{source.emoji}</span>
                    <h3 className="font-bold">{source.name}</h3>
                    <p className="text-sm opacity-70">{source.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm opacity-70 mt-6 max-w-3xl mx-auto">
              Angaben nach{" "}
              <a href={links.flyer} target="_blank" rel="noopener noreferrer" className="link">Flyer</a>{" "}
              und{" "}
              <a href={links.getraenke} target="_blank" rel="noopener noreferrer" className="link">Ernährungskreis der DGE</a>
              . ⚠️ Alkoholische Getränke zählen dort nicht zu den Getränken, Milch zählt zu den Lebensmitteln. Zuckergesüßte Getränke sind mit etwa 80 bis 100 g Zucker pro Liter als{" "}
              <a href={links.wasserTrinken} target="_blank" rel="noopener noreferrer" className="link">Durstlöscher ungeeignet</a>
              .
            </p>
          </div>
        </section>

        {/* Dehydration Signs */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Anzeichen von Dehydrierung
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              {dehydrationSigns.map((item, i) => (
                <div key={i} className="card shadow-xl bg-warning/20">
                  <div className="card-body py-4 text-center">
                    <span className="text-3xl">{item.emoji}</span>
                    <h3 className="font-bold">{item.sign}</h3>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm opacity-70 mt-6 max-w-3xl mx-auto">
              Erste Anzeichen nach{" "}
              <a href={links.fitImAlter} target="_blank" rel="noopener noreferrer" className="link">DGE, Fit im Alter</a>{" "}
              und dem{" "}
              <a href={links.flyer} target="_blank" rel="noopener noreferrer" className="link">Flyer der DGE</a>
              . Verwirrtheit trifft vor allem ältere Menschen. Schon nach wenigen Tagen kann ein Flüssigkeitsmangel durch Kreislauf- und Nierenversagen lebensbedrohlich werden.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Warum genug Wasser trinken so wichtig ist
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🧠 Konzentration</h3>
                  <p className="opacity-80">
                    Wer zu wenig trinkt, wird laut{" "}
                    <a href={links.flyer} target="_blank" rel="noopener noreferrer" className="link">DGE</a>{" "}
                    schnell müde und kann sich schlecht konzentrieren. Bei stärkerem Mangel nennt sie im{" "}
                    <a href={links.hitzeBlog} target="_blank" rel="noopener noreferrer" className="link">Blog</a>{" "}
                    auch Kopfschmerzen und eine verlängerte Reaktionszeit.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🏃 Körperliche Leistung</h3>
                  <p className="opacity-80">
                    Schon leichte Flüssigkeitsdefizite vermindern laut{" "}
                    <a href={links.hitzeBlog} target="_blank" rel="noopener noreferrer" className="link">DGE-Blog</a>{" "}
                    die körperliche Leistungsfähigkeit. Defizite von 2 bis 4 Prozent des Körpergewichts gehen laut{" "}
                    <a href={links.sport} target="_blank" rel="noopener noreferrer" className="link">Arbeitsgruppe Sporternährung</a>{" "}
                    mit Einbußen bei Ausdauer, Kraft und kognitiver Leistung einher.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">⚖️ Abnehmen</h3>
                  <p className="opacity-80">
                    Mehr Wasser allein macht nicht schlank: In einer{" "}
                    <a href={links.abnehmen} target="_blank" rel="noopener noreferrer" className="link">Meta-Analyse von acht Studien</a>{" "}
                    mit übergewichtigen Erwachsenen war der Unterschied beim Gewicht mit 0,33 kg nicht signifikant. Sinnvoll ist Wasser statt zuckergesüßter Getränke, mehr dazu im Artikel{" "}
                    <a href="/wissen/wasser-trinken-abnehmen-meta-analyse/" className="link">Hilft Wasser trinken beim Abnehmen?</a>
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🌡️ Transport und Temperatur</h3>
                  <p className="opacity-80">
                    Dein Körper besteht laut{" "}
                    <a href={links.wasserTrinken} target="_blank" rel="noopener noreferrer" className="link">DGE</a>{" "}
                    ungefähr zur Hälfte aus Wasser. Es ist Bestandteil von Zellen und Körperflüssigkeiten, transportiert Nährstoffe und reguliert die Körpertemperatur. Über Nieren, Darm, Haut und Lunge gibst du ständig Wasser ab, im Schnitt 2.650 ml am Tag (
                    <a href={links.richtwerte} target="_blank" rel="noopener noreferrer" className="link">DGE</a>
                    , 19 bis unter 51 Jahre).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              💡 Tipps um mehr zu trinken
            </h2>
            <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
              {[
                { tip: "Wasserflasche immer dabei haben", icon: "🫗" },
                { tip: "Vor jeder Mahlzeit ein Glas trinken", icon: "🍽️" },
                { tip: "Handy-Erinnerungen stellen", icon: "📱" },
                { tip: "Morgens direkt nach dem Aufstehen trinken", icon: "🌅" },
                { tip: "Mit Zitrone oder Minze aromatisieren", icon: "🍋" },
                { tip: "Nach jedem Toilettengang nachfüllen", icon: "🚽" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-medium">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum Wasserbedarf
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {faq.map((item, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion" />
                  <div className="collapse-title text-lg font-medium">{item.q}</div>
                  <div className="collapse-content">
                    <p className="opacity-80">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold mt-12 mb-3">Quellen</h2>
              <ul className="list-disc pl-6 space-y-2 text-sm opacity-80">
                {quellen.map((quelle) => (
                  <li key={quelle.url}>
                    <a href={quelle.url} className="link" target="_blank" rel="noopener noreferrer">
                      {quelle.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-sm opacity-60 mt-6">
                Alle Quellen gelesen am {STAND}. Der Rechner ersetzt keine ärztliche oder ernährungstherapeutische Beratung.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tracke deine Ernährung mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du weißt jetzt, wie viel du trinken solltest. Mit Mahlzait trackst du Kalorien, Makros und Flüssigkeit, einfach per Foto!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={config.appStoreLink} className="btn btn-lg bg-white text-primary">
                iOS App laden
              </a>
              <a
                href={config.googlePlayLink}
                className="btn btn-lg bg-white text-primary hover:bg-white/90"
              >
                Android App laden
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Rechner & Informationen</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf berechnen
              </a>
              <a href="/protein-bedarf-rechner" className="btn btn-outline">
                Protein-Bedarf Rechner
              </a>
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI Rechner
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
              </a>
              <a href="/rechner" className="btn btn-outline">
                Alle Rechner
              </a>
              <a href="/#live-demo" className="btn btn-primary">
                Live Demo
              </a>
            </div>
          </div>
        </section>

        <RelatedWissen calculatorSlug="wasserbedarf-rechner" />
        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default WasserbedarfsRechnerPage;
