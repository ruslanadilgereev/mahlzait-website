import { useState } from "react";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import Breadcrumbs from "@components/Breadcrumbs";
import RelatedWissen from "@components/RelatedWissen";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

import AuthorByline from "@components/AuthorByline";
import { getTrackedAppLink, trackAppStoreClick } from "utils/trackingLinks";
import {
  arten,
  auswahl,
  berechne,
  bigMac,
  bigMacKcal,
  extraKcal,
  extras,
  FDC_STAND,
  fuellung,
  fuellungen,
  kalbshackMager,
  lahmacunRezept,
  portion,
  salatMischung,
  sauceKcal,
  saucen,
  STANDARD,
  summe,
  tabelle,
  zahl,
  zutatKcal,
  zutaten,
} from "./rezepte";
import type { DoenerArt, Ergebnis, Zugabe } from "./rezepte";
import { faq } from "./faq";
import { stueckKcal } from "@modules/pizza/rechnung";

// ein Stück Pizza Margherita wie im Pizza-Rechner: 1/8 einer 30-cm-Pizza mit 350 g
const pizzaStueck = stueckKcal("margherita");

interface Props {
  config: TemplateConfig;
}

const rechnerArten = arten.filter((a) => a.imRechner);
const fleischSorten = fuellungen.filter((f) => f.imRechner);
const tabellenZeilen = tabelle.map((t) => ({
  name: t.name,
  ...portion(t.auswahl),
}));

// Zahlen für die Texte, alle aus der Rezeptrechnung
const standard = portion(STANDARD);
const haehnchen = portion(auswahl("classic", "haehnchen"));
const dueruem = portion(auswahl("dueruem", "kalb"));
const box = portion(auswahl("box", "kalb"));
const tellerReis = portion(auswahl("teller", "kalb"));
const tellerPommes = portion(auswahl("tellerPommes", "kalb"));
const salatteller = portion(auswahl("salatteller", "kalb"));
const lahmacun = portion(auswahl("lahmacun", "kalb"));
const xxl = portion(auswahl("classic", "kalb", ["joghurt"], [], 150));
const fleischKcal = (id: string) => Math.round(summe(fuellung(id).teile).kcal);
const brotKcal = zutatKcal("fladenbrot", 120);
const yufkaKcal = zutatKcal("yufka", 117);
const pommesKcal = zutatKcal("pommes", 154);
const salatJe100g = Math.round(summe(salatMischung).kcal);
const lahmacunKcal = Math.round(summe(lahmacunRezept).kcal);
const lahmacunMitSalatKcal = Math.round(
  summe([
    ...lahmacunRezept,
    ...salatMischung.map((b) => ({ zutat: b.zutat, gramm: b.gramm / 2 })),
  ]).kcal,
);
const kalbshackDifferenz = Math.round(
  ((zutaten.rinderhack.kcal - kalbshackMager.kcal) * 130) / 100,
);
const joggenMinuten = (kcal: number) => Math.round(kcal / 12);

const fdcLink = (id: number) =>
  `https://fdc.nal.usda.gov/food-details/${id}/nutrients`;
const mengen = (teile: { zutat: string; gramm: number }[]) =>
  teile.map((b) => `${zahl(b.gramm)} g ${zutaten[b.zutat].name}`).join(", ");
const artBeschreibung = (a: DoenerArt) => {
  const teile = a.basis.map((k) => `${zahl(k.gramm)} g ${k.label}`);
  const f = a.fuellung ? fuellung(a.fuellung) : null;
  teile.push(f ? `${zahl(f.gramm)} g ${f.name}` : "130 g Fleisch");
  return teile.join(", ");
};
const zugabeBeschreibung = (z: Zugabe) =>
  z.teile.length === 1
    ? `${zahl(z.gramm)} g ${zutaten[z.teile[0].zutat].name}`
    : `${zahl(z.gramm)} g: ${mengen(z.teile)}`;

function DoenerKalorienRechnerPage({ config }: Props) {
  const [selectedDoener, setSelectedDoener] = useState<string>("classic");
  const [selectedMeat, setSelectedMeat] = useState<string>("kalb");
  const [selectedSauces, setSelectedSauces] = useState<string[]>(["joghurt"]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [portionSize, setPortionSize] = useState<number>(100);
  const [result, setResult] = useState<Ergebnis | null>(null);

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((e) => e !== extraId)
        : [...prev, extraId],
    );
  };

  const toggleSauce = (sauceId: string) => {
    if (sauceId === "ohne") {
      setSelectedSauces(["ohne"]);
      return;
    }
    setSelectedSauces((prev) => {
      const filtered = prev.filter((s) => s !== "ohne");
      if (filtered.includes(sauceId)) {
        const result = filtered.filter((s) => s !== sauceId);
        return result.length === 0 ? ["ohne"] : result;
      }
      return [...filtered, sauceId];
    });
  };

  const calculateCalories = () => {
    // Brot bzw. Beilage, Salat und Füllung wachsen mit der Portionsgröße,
    // Soßen und Extras sind feste Mengen.
    setResult(
      berechne({
        art: selectedDoener,
        fuellung: selectedMeat,
        saucen: selectedSauces,
        extras: selectedExtras,
        portion: portionSize,
      }),
    );
  };

  const getCalorieComparison = (calories: number) => {
    return [
      {
        name: "Big Macs",
        amount: Math.round((calories / bigMacKcal) * 10) / 10,
        emoji: "🍔",
      },
      {
        name: "Stücke Pizza",
        amount: Math.round((calories / pizzaStueck) * 10) / 10,
        emoji: "🍕",
      },
      {
        name: "Teller Pasta",
        amount: Math.round((calories / 400) * 10) / 10,
        emoji: "🍝",
      },
      { name: "Min. Joggen", amount: Math.round(calories / 10), emoji: "🏃" },
      { name: "Min. Radfahren", amount: Math.round(calories / 7), emoji: "🚴" },
    ];
  };

  const selectedDoenerData = rechnerArten.find((d) => d.id === selectedDoener);
  const isVegetarian = selectedDoener === "vegetarisch";
  const totalCalories = result ? Math.round(result.gesamt.kcal) : 0;

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs
          items={[
            { name: "Home", url: "/" },
            { name: "Rechner", url: "/rechner/" },
            {
              name: "Döner-Kalorien-Rechner",
              url: "/doener-kalorien-rechner/",
            },
          ]}
        />

        {/* Kopf: Antwort zuerst */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-14">
          <header className="max-w-2xl mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Wie viele Kalorien hat ein Döner? Alle Varianten im Vergleich
            </h1>
            <AuthorByline
              role="Gründer von Mahlzait"
              publishedAt="2025-12-09"
              updatedAt="2026-11-22"
            />
            <p className="text-lg md:text-xl opacity-80">
              Ein klassischer Döner Kebab mit Kalb- oder Rindfleisch wiegt in
              unserer Rechnung {standard.gramm} g und liefert{" "}
              <strong>{standard.kcal} kcal</strong>: 120 g Fladenbrot, 130 g
              Fleisch, 70 g Salat und 30 g Joghurtsoße. Mit Hähnchen sind es{" "}
              {haehnchen.kcal} kcal, ein Dürüm kommt auf {dueruem.kcal}, eine
              Döner-Box mit Pommes auf {box.kcal}. Dazu {standard.protein} g
              Eiweiß, {standard.kh} g Kohlenhydrate und {standard.fett} g Fett.
            </p>
          </header>

          <div className="prose prose-lg max-w-2xl mb-12">
            <p>
              Die Werte sind eine Rezeptrechnung aus Einzelzutaten der USDA
              FoodData Central, denn für Döner selbst gibt es dort keinen
              Eintrag. Drei Dinge bestimmen das Ergebnis: das Fleisch (130 g
              Hähnchen {fleischKcal("haehnchen")} kcal, Lamm{" "}
              {fleischKcal("lamm")} kcal), die Soße (Joghurt{" "}
              {sauceKcal("joghurt")} kcal, Knoblauch {sauceKcal("knoblauch")}{" "}
              kcal je 30 g) und die Portion. Die Tabelle unten zeigt die
              gängigen Varianten mit Portionsgewicht und Makros; der Rechner
              darunter setzt deinen Döner Stück für Stück zusammen. Welche
              Zutaten und Mengen wir annehmen, steht unter{" "}
              <a href="#so-rechnen-wir">So rechnen wir</a>.
            </p>
          </div>

          {/* Rechner */}
          <div className="card bg-base-200 max-w-2xl">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">
                Deinen Döner zusammenstellen
              </h2>

              {/* Döner Type Selection */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">
                  1. Döner-Art wählen
                </span>
                <div className="grid gap-3 md:grid-cols-2">
                  {rechnerArten.map((doener) => (
                    <button
                      key={doener.id}
                      onClick={() => setSelectedDoener(doener.id)}
                      className={`btn btn-lg justify-start gap-3 h-auto py-3 ${
                        selectedDoener === doener.id
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      <span className="text-2xl">{doener.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{doener.name}</div>
                        <div className="text-xs opacity-70 font-normal">
                          {doener.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meat Type Selection */}
              {!isVegetarian && (
                <div className="mb-8">
                  <span className="text-lg font-semibold block mb-4">
                    2. Fleisch wählen
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {fleischSorten.map((meat) => (
                      <button
                        key={meat.id}
                        onClick={() => setSelectedMeat(meat.id)}
                        className={`btn ${
                          selectedMeat === meat.id
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                      >
                        {meat.icon} {meat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sauce Selection (Multi-Select) */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">
                  {isVegetarian ? "2" : "3"}. Saucen wählen (mehrere möglich)
                </span>
                <div className="flex flex-wrap gap-2">
                  {saucen.map((sauce) => (
                    <button
                      key={sauce.id}
                      onClick={() => toggleSauce(sauce.id)}
                      className={`btn btn-sm ${
                        selectedSauces.includes(sauce.id)
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      {sauce.icon} {sauce.name} ({sauceKcal(sauce.id)} kcal)
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">
                  {isVegetarian ? "3" : "4"}. Extras (optional)
                </span>
                <div className="flex flex-wrap gap-2">
                  {extras.map((extra) => (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra.id)}
                      className={`btn btn-sm ${
                        selectedExtras.includes(extra.id)
                          ? "btn-secondary"
                          : "btn-outline"
                      }`}
                    >
                      {extra.icon} {extra.name} (+{extraKcal(extra.id)} kcal)
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion Size */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Portionsgröße</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      {portionSize}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="10"
                  value={portionSize}
                  onChange={(e) => setPortionSize(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>Klein (50%)</span>
                  <span>Normal (100%)</span>
                  <span>XXL (150%)</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg w-full text-lg"
                onClick={calculateCalories}
              >
                🥙 Kalorien berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">
                      {totalCalories} kcal
                    </div>
                    <div className="text-lg opacity-70 mt-2">
                      {selectedDoenerData?.name}
                      {!isVegetarian &&
                        ` mit ${fleischSorten.find((m) => m.id === selectedMeat)?.name}`}
                      {selectedSauces.filter((s) => s !== "ohne").length >
                        0 && (
                        <span className="block text-sm opacity-60 mt-1">
                          Saucen:{" "}
                          {selectedSauces
                            .filter((s) => s !== "ohne")
                            .map((s) => saucen.find((st) => st.id === s)?.name)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-emerald-500">
                          {Math.round(result.gesamt.protein)}g
                        </div>
                        <div className="text-sm opacity-70">Protein</div>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-amber-500">
                          {Math.round(result.gesamt.kh)}g
                        </div>
                        <div className="text-sm opacity-70">Kohlenhydrate</div>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <div className="text-3xl font-bold text-rose-500">
                          {Math.round(result.gesamt.fett)}g
                        </div>
                        <div className="text-sm opacity-70">Fett</div>
                      </div>
                    </div>
                  </div>

                  {/* Calorie Breakdown */}
                  <div className="card bg-base-200 mt-4">
                    <div className="card-body py-4">
                      <h3 className="font-semibold mb-3">
                        Kalorien-Aufteilung
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>
                            {selectedDoenerData?.basis
                              .map((k) => k.label)
                              .join(" & ")}
                            :
                          </span>
                          <span className="font-mono">
                            {Math.round(result.basis.kcal)} kcal
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{result.fuellungName}:</span>
                          <span className="font-mono">
                            {Math.round(result.fuellung.kcal)} kcal
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sauce:</span>
                          <span className="font-mono">
                            {Math.round(result.sauce.kcal)} kcal
                          </span>
                        </div>
                        {result.extras.kcal > 0 && (
                          <div className="flex justify-between">
                            <span>Extras:</span>
                            <span className="font-mono">
                              {Math.round(result.extras.kcal)} kcal
                            </span>
                          </div>
                        )}
                        <div className="divider my-1"></div>
                        <div className="flex justify-between font-bold">
                          <span>
                            Gesamt ({Math.round(result.gesamt.gramm)} g):
                          </span>
                          <span className="font-mono">
                            {totalCalories} kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="grid gap-3 md:grid-cols-5 mt-6">
                    {getCalorieComparison(totalCalories).map((item, i) => (
                      <div key={i} className="card bg-base-200">
                        <div className="card-body py-3 px-2 text-center">
                          <div className="text-2xl">{item.emoji}</div>
                          <p className="text-xl font-bold text-primary">
                            {item.amount}
                          </p>
                          <p className="text-xs opacity-70">{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tip based on calories */}
                  {totalCalories > 700 && (
                    <div className="alert alert-warning mt-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <p className="font-semibold">Kalorienreiche Wahl!</p>
                        <p className="text-sm">
                          Über 700 kcal entspricht etwa 35% des Tagesbedarfs.
                          Wähle Hähnchen statt Kalb und Joghurt-Sauce für eine
                          leichtere Alternative.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabelle */}
        <section className="max-w-screen-lg mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Döner-Kalorientabelle: alle Varianten
          </h2>
          <p className="opacity-80 max-w-2xl mb-6">
            Alle Werte mit 30 g Joghurtsoße, berechnet aus den Zutaten und
            Mengen, die unter{" "}
            <a href="#so-rechnen-wir" className="link">
              So rechnen wir
            </a>{" "}
            stehen. Imbisse portionieren unterschiedlich, vor allem bei Brot und
            Fleisch; dein Döner kann deshalb darüber oder darunter liegen.
          </p>
          <div className="overflow-x-auto max-w-4xl">
            <table className="table bg-base-200">
              <thead>
                <tr>
                  <th>Variante</th>
                  <th className="text-right">Portion</th>
                  <th className="text-right">kcal</th>
                  <th className="text-right">Eiweiß</th>
                  <th className="text-right">Kohlenhydrate</th>
                  <th className="text-right">Fett</th>
                </tr>
              </thead>
              <tbody>
                {tabellenZeilen.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td className="text-right">{item.gramm} g</td>
                    <td className="text-right font-semibold">
                      {zahl(item.kcal)}
                    </td>
                    <td className="text-right">{item.protein} g</td>
                    <td className="text-right">{item.kh} g</td>
                    <td className="text-right">{item.fett} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prose prose-lg max-w-2xl mt-12">
            <h2>Woher die Kalorien kommen</h2>
            <p>
              Ein Döner ist keine Kalorienbombe wegen des Gemüses, sondern wegen
              dreier Zutaten, die sich addieren. Das <strong>Fladenbrot</strong>{" "}
              (120 g) bringt {brotKcal} kcal, fast ausschließlich Kohlenhydrate.
              Das <strong>Fleisch</strong> liefert auf 130 g je nach Sorte{" "}
              {fleischKcal("haehnchen")} kcal (Hähnchen) bis{" "}
              {fleischKcal("lamm")} kcal (Lamm); Kalb- und Rindfleisch rechnen
              wir mit {fleischKcal("kalb")} kcal, weil Dönerfleisch vom Spieß
              wie Hackfleisch Fett enthält. Die <strong>Soße</strong> ist der
              Posten, den die meisten unterschätzen: Knoblauch- und Cocktailsoße
              enthalten Mayonnaise und liegen bei {sauceKcal("knoblauch")} und{" "}
              {sauceKcal("cocktail")} kcal pro 30 g, Joghurtsoße bei{" "}
              {sauceKcal("joghurt")}, scharfe Soße bei {sauceKcal("scharf")}.
            </p>
            <p>
              Alles, was danach kommt, ist Aufschlag: Käse plus{" "}
              {extraKcal("kaese")}, Halloumi plus {extraKcal("halloumi")}, eine
              kleine Portion Pommes plus {extraKcal("pommes")} kcal. So entsteht
              eine Spanne von {salatteller.kcal} kcal (Teller mit Salat) bis
              über 1.000 kcal (XXL-Portion) bei einem Gericht, das auf der Karte
              gleich heißt.
            </p>

            <h2>Döner, Dürüm, Teller, Box: was ist die leichteste Wahl?</h2>
            <p>
              <strong>Der Döner-Teller mit Salat</strong> ist mit{" "}
              {salatteller.kcal} kcal die leichteste Variante, weil das Brot
              wegfällt. Er hat trotzdem {salatteller.protein} g Eiweiß und
              sättigt entsprechend. Mit Reis sind es {tellerReis.kcal} kcal, mit
              Pommes {tellerPommes.kcal}.
            </p>
            <p>
              <strong>Der Dürüm</strong> liegt mit {dueruem.kcal} kcal knapp
              über dem Döner im Fladenbrot ({standard.kcal} kcal): Der
              Yufka-Fladen wiegt in unserer Rechnung 117 g und hat {yufkaKcal}{" "}
              kcal, das Fladenbrot 120 g und {brotKcal} kcal. Bei gleicher
              Füllung entscheidet also vor allem die Größe des Fladens.
            </p>
            <p>
              <strong>Die Döner-Box</strong> ist die schwerste Variante. 154 g
              Pommes ({pommesKcal} kcal), Fleisch und Soße ergeben {box.kcal}{" "}
              kcal mit {box.fett} g Fett.
            </p>
            <p>
              <strong>Lahmacun</strong> mit Dönerfleisch kommt auf{" "}
              {lahmacun.kcal} kcal. Ein Lahmacun allein (150 g Teig mit
              Hackfleischbelag) hat {lahmacunKcal} kcal, mit Salat und Zitrone{" "}
              {lahmacunMitSalatKcal} kcal.
            </p>

            <h2>Döner beim Abnehmen: so passt er ins Defizit</h2>
            <p>
              Ein Hähnchen-Döner mit Joghurtsoße hat {haehnchen.kcal} kcal und{" "}
              {haehnchen.protein} g Eiweiß. Das ist eine vollwertige Mahlzeit
              mit einem Eiweißanteil, den viele Fertiggerichte nicht erreichen.
              Bei einem
              <a href="/kalorienbedarf-berechnen/"> Tagesbedarf</a> von 2.200
              kcal bleibt damit Platz für zwei weitere Mahlzeiten.
            </p>
            <ul>
              <li>
                Hähnchen statt Kalb oder Rind: spart{" "}
                {standard.kcal - haehnchen.kcal} kcal bei fast gleichem Eiweiß.
              </li>
              <li>
                Joghurt statt Knoblauchsoße: spart{" "}
                {sauceKcal("knoblauch") - sauceKcal("joghurt")} kcal. Scharfe
                Soße statt Cocktail: spart{" "}
                {sauceKcal("cocktail") - sauceKcal("scharf")} kcal.
              </li>
              <li>
                Kein Käse, keine Extra-Pommes: spart {extraKcal("kaese")} bis{" "}
                {extraKcal("pommes")} kcal.
              </li>
              <li>
                Extra Salat kostet kaum etwas: 100 g Salat haben {salatJe100g}{" "}
                kcal.
              </li>
              <li>
                Normale Größe statt XXL: Mit Portionsgröße 150 % ({xxl.gramm} g)
                kommt ein Döner auf {zahl(xxl.kcal)} kcal.
              </li>
            </ul>
            <p>
              Wer den Döner als Abendessen einplant, isst mittags leicht. Wer
              ihn zusätzlich zu drei normalen Mahlzeiten isst, hat an dem Tag
              ein Plus von {standard.kcal} kcal, und das ist der eigentliche
              Grund, warum Döner in den Ruf geraten ist, dick zu machen.
            </p>

            <h2>Wie lange muss man dafür laufen?</h2>
            <p>
              Ein 75 kg schwerer Mensch verbrennt beim Joggen mit 9 km/h knapp
              12 kcal pro Minute. Für einen Kalb-Döner mit {standard.kcal} kcal
              sind das etwa {joggenMinuten(standard.kcal)} Minuten, für eine
              Döner-Box mit {box.kcal} kcal etwa {joggenMinuten(box.kcal)}{" "}
              Minuten. Der
              <a href="/kalorienverbrauch-joggen/">
                {" "}
                Kalorienverbrauch-Rechner fürs Joggen
              </a>{" "}
              rechnet das für dein Gewicht und Tempo aus. Die Rechnung zeigt vor
              allem, dass Sport ein Essen nicht ausgleicht, sondern die Bilanz
              über den Tag entscheidet.
            </p>
          </div>
        </section>

        {/* Datenquelle und Rezeptannahmen */}
        <section
          id="so-rechnen-wir"
          className="max-w-screen-lg mx-auto px-4 pb-14"
        >
          <div className="prose prose-lg max-w-2xl">
            <h2>So rechnen wir: Zutaten, Mengen und Quellen</h2>
            <p>
              Für Döner selbst führt die USDA FoodData Central (FDC), die
              Nährwertdatenbank des US-Landwirtschaftsministeriums, keinen
              Eintrag. Wir setzen deshalb jede Variante aus Einzelzutaten
              zusammen, deren Nährwerte je 100 g aus FDC stammen, abgerufen über
              die FDC-API am {FDC_STAND}. Die Grammangaben sind unsere Annahmen
              für eine übliche Imbissportion; wo FDC eine passende
              Portionsangabe hat, haben wir sie übernommen. Der Regler für die
              Portionsgröße ändert Brot, Beilage, Salat und Füllung, nicht die
              Soßen und Extras.
            </p>
            <h3>Standardportion je Variante</h3>
            <ul>
              {rechnerArten.map((a) => (
                <li key={a.id}>
                  <strong>{a.name}:</strong> {artBeschreibung(a)}
                </li>
              ))}
              <li>
                <strong>Salat</strong> je 100 g: {mengen(salatMischung)}
              </li>
              <li>
                <strong>Lahmacun</strong> (150 g): {mengen(lahmacunRezept)}; der
                Teig ist als Fladenbrot gerechnet.
              </li>
            </ul>
            <h3>Fleisch, Soßen und Extras</h3>
            <ul>
              {fleischSorten.map((f) => (
                <li key={f.id}>
                  <strong>{f.name}</strong> (130 g, gegart): {mengen(f.teile)},{" "}
                  {fleischKcal(f.id)} kcal
                </li>
              ))}
              <li>
                <strong>Falafel</strong>: 5 Stück à 17 g (FDC-Portionsangabe),
                also 85 g, {fleischKcal("falafel")} kcal
              </li>
              {saucen
                .filter((s) => s.teile.length > 0)
                .map((s) => (
                  <li key={s.id}>
                    <strong>{s.name}</strong>: {zugabeBeschreibung(s)},{" "}
                    {sauceKcal(s.id)} kcal
                  </li>
                ))}
              {extras.map((e) => (
                <li key={e.id}>
                  <strong>{e.name}</strong>: {zugabeBeschreibung(e)},{" "}
                  {extraKcal(e.id)} kcal
                </li>
              ))}
            </ul>
            <p>
              Kalb- und Rindfleisch vom Spieß rechnen wir mit Rinderhack (85 %
              mager, gegrillt), weil Dönerfleisch wie Hackfleisch Fett enthält.
              Mit magerem Kalbshack (
              <a
                href={fdcLink(kalbshackMager.fdcId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                FDC {kalbshackMager.fdcId}
              </a>
              , {kalbshackMager.kcal} kcal je 100 g) läge ein Döner um{" "}
              {kalbshackDifferenz} kcal niedriger. Jede Soße zählt mit 30 g, das
              sind 2 Esslöffel (FDC-Portionsangabe für Tzatziki: 1 Esslöffel =
              15 g). Für Halloumi hat FDC keinen allgemeinen Eintrag; wir nutzen
              einen Markeneintrag mit Herstellerangaben. Für Falafel nennt FDC
              keine Ballaststoffe. Der Big Mac im Vergleich ist{" "}
              <a
                href={fdcLink(bigMac.fdcId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                FDC {bigMac.fdcId}
              </a>{" "}
              ({bigMac.fdcName}, US-Rezeptur), 1 Stück = {bigMac.gramm} g, also{" "}
              {bigMacKcal} kcal.
            </p>
            <h3>Nährwerte der Zutaten je 100 g (USDA FoodData Central)</h3>
          </div>
          <div className="overflow-x-auto max-w-4xl mt-4">
            <table className="table table-sm bg-base-200">
              <thead>
                <tr>
                  <th>Zutat</th>
                  <th>FDC-Eintrag</th>
                  <th className="text-right">kcal</th>
                  <th className="text-right">Eiweiß</th>
                  <th className="text-right">Kohlenhydrate</th>
                  <th className="text-right">Fett</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(zutaten).map(([id, z]) => (
                  <tr key={id}>
                    <td>{z.name}</td>
                    <td>
                      <a
                        href={fdcLink(z.fdcId)}
                        className="link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        FDC {z.fdcId}
                      </a>{" "}
                      {z.fdcName} ({z.datentyp})
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {zahl(z.kcal)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {zahl(z.protein)} g
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {zahl(z.kh)} g
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {zahl(z.fett)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-screen-lg mx-auto px-4 pb-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Häufige Fragen
            </h2>
            <div className="space-y-3">
              {faq.map((item) => (
                <div
                  key={item.q}
                  className="collapse collapse-plus bg-base-200"
                >
                  <input type="radio" name="faq" aria-label={item.q} />
                  <div className="collapse-title text-lg font-medium">
                    {item.q}
                  </div>
                  <div className="collapse-content">
                    <p className="opacity-80">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="prose max-w-2xl mt-12">
              <h2>Weiterlesen</h2>
              <ul>
                <li>
                  <a href="/fastfood-kalorien/">
                    Fast-Food-Kalorien im Vergleich
                  </a>
                  : 100 Gerichte von McDonald's bis Subway
                </li>
                <li>
                  <a href="/kalorien/lahmacun/">Lahmacun</a> und{" "}
                  <a href="/kalorien/durum-kebab/">Dürüm</a> im Detail
                </li>
                <li>
                  <a href="/kaloriendefizit-berechnen/">
                    Kaloriendefizit berechnen
                  </a>
                  : wie viel Platz ein Döner im Tag hat
                </li>
              </ul>
              <p className="text-sm">
                Wer wissen will, was der Döner vom eigenen Imbiss hat: Die{" "}
                <a
                  href={getTrackedAppLink({
                    platform: "ios",
                    source: "calculator",
                  })}
                  onClick={() => trackAppStoreClick("ios", "calculator")}
                >
                  Mahlzait-App
                </a>{" "}
                schätzt Portionen per Foto. Die Tabelle oben reicht für die
                meisten Fälle.
              </p>
            </div>
          </div>
        </section>

        <RelatedWissen calculatorSlug="doener-kalorien-rechner" />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default DoenerKalorienRechnerPage;
