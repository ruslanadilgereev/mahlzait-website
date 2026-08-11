import { useMemo, useState } from "react";
import AppBanner from "@components/appBanner";
import AuthorByline from "@components/AuthorByline";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

export interface FastFoodItem {
  brand: string;
  brandSlug: string;
  name: string;
  portion_g: number | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

interface Props {
  config: TemplateConfig;
  items: FastFoodItem[];
}

type SortKey = "calories" | "protein" | "proteinPerKcal" | "name";

const BUDGETS = [
  { label: "Alles zeigen", max: null },
  { label: "unter 300 kcal", max: 300 },
  { label: "unter 500 kcal", max: 500 },
  { label: "unter 700 kcal", max: 700 },
];

function FastfoodKalorienPage({ config, items }: Props) {
  const brands = useMemo(
    () => Array.from(new Set(items.map((i) => i.brand))).sort(),
    [items],
  );
  const [brand, setBrand] = useState<string>("");
  const [budget, setBudget] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("calories");

  const rows = useMemo(() => {
    const withRatio = items.map((i) => ({
      ...i,
      proteinPerKcal: i.protein && i.calories ? (i.protein / i.calories) * 100 : 0,
    }));
    const filtered = withRatio.filter(
      (i) => (!brand || i.brand === brand) && (budget === null || i.calories <= budget),
    );
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "de");
      if (sort === "protein") return (b.protein ?? 0) - (a.protein ?? 0);
      if (sort === "proteinPerKcal") return b.proteinPerKcal - a.proteinPerKcal;
      return a.calories - b.calories;
    });
    return sorted;
  }, [items, brand, budget, sort]);

  // Bewusst nicht rows[0]: Der Hinweis nennt immer den kalorienaermsten
  // Treffer, unabhaengig davon, wonach die Tabelle gerade sortiert ist.
  const lightest = useMemo(
    () => rows.reduce((min, r) => (min === null || r.calories < min.calories ? r : min), null as (typeof rows)[number] | null),
    [rows],
  );

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        <section className="max-w-screen-lg mx-auto px-4 py-8 md:py-14">
          <header>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Fast Food Kalorien: was in dein Budget passt
            </h1>
            <AuthorByline />
            <p className="mt-4 text-lg opacity-80 max-w-3xl">
              {items.length} Gerichte von {brands.length} Ketten, sortierbar nach
              Kalorien und Eiweiß. Statt einer einzelnen Zahl siehst du hier die
              ganze Karte auf einmal und kannst filtern, was in dein Tagesziel
              passt. Alle Werte sind Portionsangaben, nicht pro 100 Gramm.
            </p>
          </header>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-control">
              <label className="label pb-1" htmlFor="ff-brand">
                <span className="label-text font-medium">Kette</span>
              </label>
              <select
                id="ff-brand"
                className="select select-bordered"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Alle Ketten</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label pb-1" htmlFor="ff-budget">
                <span className="label-text font-medium">Kalorienbudget</span>
              </label>
              <select
                id="ff-budget"
                className="select select-bordered"
                value={budget === null ? "" : String(budget)}
                onChange={(e) =>
                  setBudget(e.target.value === "" ? null : Number(e.target.value))
                }
              >
                {BUDGETS.map((b) => (
                  <option key={b.label} value={b.max === null ? "" : String(b.max)}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label pb-1" htmlFor="ff-sort">
                <span className="label-text font-medium">Sortieren nach</span>
              </label>
              <select
                id="ff-sort"
                className="select select-bordered"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="calories">Kalorien, aufsteigend</option>
                <option value="protein">Eiweiß, absteigend</option>
                <option value="proteinPerKcal">Eiweiß je 100 kcal</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <p className="mt-4 opacity-80" aria-live="polite">
            {rows.length} von {items.length} Gerichten
            {lightest ? (
              <>
                {" "}
                &middot; am wenigsten Kalorien hat davon{" "}
                <strong>
                  {lightest.name} ({lightest.calories} kcal)
                </strong>
              </>
            ) : (
              " · keine Treffer, wähle ein höheres Budget"
            )}
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Gericht</th>
                  <th>Kette</th>
                  <th className="text-right">Portion</th>
                  <th className="text-right">kcal</th>
                  <th className="text-right">Eiweiß</th>
                  <th className="text-right">Eiweiß je 100 kcal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.brandSlug}-${r.name}`}>
                    <td className="font-medium">{r.name}</td>
                    <td className="opacity-70">{r.brand}</td>
                    <td className="text-right opacity-70">
                      {r.portion_g ? `${r.portion_g} g` : "-"}
                    </td>
                    <td className="text-right font-semibold">{r.calories}</td>
                    <td className="text-right">{r.protein != null ? `${r.protein} g` : "-"}</td>
                    <td className="text-right opacity-70">
                      {r.proteinPerKcal ? `${r.proteinPerKcal.toFixed(1)} g` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm opacity-60 mt-3">
            Angaben je Portion nach Herstellerangaben und gängigen Referenzwerten.
            Ketten ändern Rezepturen und Portionsgrößen, im Zweifel gilt die
            Nährwerttabelle der Kette vor Ort.
          </p>
        </section>

        <section className="max-w-screen-lg mx-auto px-4 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Warum Eiweiß je 100 kcal die nützlichere Spalte ist
          </h2>
          <p className="opacity-80 max-w-3xl">
            Die reine Kalorienzahl sagt nur, was etwas kostet, nicht was es bringt.
            Zwei Gerichte mit 500 Kalorien sättigen völlig unterschiedlich, je
            nachdem wie viel Eiweiß darin steckt. Wer im Defizit isst, fährt mit
            der Spalte ganz rechts besser: Sie zeigt, wie viel Eiweiß du pro 100
            aufgenommenen Kalorien bekommst. Gegrilltes Hähnchen und schlichte
            Burger schneiden dort regelmäßig besser ab als Pommes, Shakes oder
            panierte Beilagen, obwohl die Kalorienzahl ähnlich aussieht.
          </p>
          <p className="opacity-80 max-w-3xl mt-4">
            Der zweite Hebel ist die Portionsgröße. Bei den meisten Ketten ist
            nicht das Gericht das Problem, sondern die Menü-Kombination: Ein Burger
            allein bleibt oft unter 500 Kalorien, mit großen Pommes und Softdrink
            landet dieselbe Mahlzeit schnell beim Doppelten.
          </p>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default FastfoodKalorienPage;
