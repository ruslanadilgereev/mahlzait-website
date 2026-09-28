import AppBanner from "@components/appBanner";
import AuthorByline from "@components/AuthorByline";
import Breadcrumbs from "@components/Breadcrumbs";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";
import type { MealDay } from "@modules/essensplan/_components/MealPlanResult";
import type { TrainingDay } from "@modules/essensplan/_components/TrainingPlanResult";
import { buildShoppingList, formatAmount, openPrintWindow } from "@modules/essensplan/_components/printPlan";
import type { PlanLink, PlanPage } from "utils/planPages";
import { PLAN_SECTIONS } from "utils/planSections";

interface Props {
  config: TemplateConfig;
  page: PlanPage;
  related: PlanLink[];
}

function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", name, params);
  }
}

const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

function MealDayCard({ day, open }: { day: MealDay; open: boolean }) {
  return (
    <details className="group rounded-xl border border-base-300 bg-base-100" open={open}>
      <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 list-none">
        <span className="text-lg font-bold">{day.day}</span>
        <span className="text-sm opacity-70">
          <b className="text-success">{fmt(day.totalCalories)} kcal</b> · {fmt(day.totalProtein)} g P · {fmt(day.totalCarbs)} g K · {fmt(day.totalFat)} g F
        </span>
      </summary>
      <div className="space-y-3 px-4 pb-4">
        {day.meals.map((meal, i) => (
          <div key={i} className="rounded-lg bg-base-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="badge badge-primary badge-sm">{meal.type}</span>
                <h4 className="mt-1 font-semibold">{meal.name}</h4>
              </div>
              <span className="whitespace-nowrap text-sm font-bold text-primary">{fmt(meal.calories)} kcal</span>
            </div>
            <ul className="mt-2 grid gap-x-6 text-sm opacity-80 sm:grid-cols-2">
              {meal.ingredients.map((ing, k) => <li key={k}>• {ing}</li>)}
            </ul>
            <p className="mt-2 text-xs opacity-60">
              {fmt(meal.protein)} g Protein · {fmt(meal.carbs)} g Kohlenhydrate · {fmt(meal.fat)} g Fett · ca. {fmt(meal.prepTimeMinutes)} min
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}

function TrainingDayCard({ day, open }: { day: TrainingDay; open: boolean }) {
  if (day.isRestDay) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-200/60 p-4">
        <span className="text-lg font-bold">{day.day}</span>
        <span className="text-sm italic opacity-60">Ruhetag · {day.focus || "Regeneration"}</span>
      </div>
    );
  }
  return (
    <details className="rounded-xl border border-base-300 bg-base-100" open={open}>
      <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 list-none">
        <span>
          <span className="text-lg font-bold">{day.day}</span>
          <span className="ml-2 text-sm opacity-70">{day.focus}</span>
        </span>
        {day.estimatedMinutes ? <span className="whitespace-nowrap text-sm opacity-60">ca. {day.estimatedMinutes} min</span> : null}
      </summary>
      <div className="space-y-3 px-4 pb-4 text-sm">
        {day.warmup?.length ? <p><b>Aufwärmen:</b> {day.warmup.join(" · ")}</p> : null}
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr><th>Übung</th><th>Sätze × Wdh.</th><th>Pause</th><th className="hidden sm:table-cell">Hinweis</th></tr>
            </thead>
            <tbody>
              {(day.exercises ?? []).map((ex, i) => (
                <tr key={i}>
                  <td><b>{ex.name}</b><div className="text-xs opacity-60">{ex.muscleGroup}</div></td>
                  <td className="whitespace-nowrap">{ex.sets} × {ex.reps}</td>
                  <td className="whitespace-nowrap">{ex.restSeconds} s</td>
                  <td className="hidden text-xs opacity-70 sm:table-cell">{ex.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {day.cooldown?.length ? <p><b>Cool-down:</b> {day.cooldown.join(" · ")}</p> : null}
      </div>
    </details>
  );
}

function PlanLandingPage({ config, page, related }: Props) {
  const section = PLAN_SECTIONS[page.section];
  const { sample } = page;
  const isMeal = page.section === "ernaehrungsplan";
  const shopping = isMeal ? buildShoppingList(sample.mealDays) : null;
  const tips = [...(sample.mealSummary?.tips ?? []), ...(sample.trainingSummary?.tips ?? [])];

  const downloadPdf = () => {
    trackEvent("plan_landing_pdf", { page: page.url });
    openPrintWindow(sample.mealSummary, sample.mealDays, sample.trainingSummary, sample.trainingDays);
  };
  const ctaClick = (position: string) => trackEvent("plan_landing_cta", { page: page.url, position });

  const cta = (position: string) => (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href={page.generatorUrl} className="btn btn-primary" onClick={() => ctaClick(position)}>
        {isMeal ? "Eigenen Ernährungsplan erstellen" : "Eigenen Trainingsplan erstellen"}
      </a>
      <button type="button" className="btn btn-outline" onClick={downloadPdf}>
        Beispielplan als PDF
      </button>
    </div>
  );

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: section.label, url: `/${page.section}/` },
          { name: page.name, url: page.url },
        ]} />

        <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
          <header>
            <span className="badge badge-primary badge-lg mb-4">{isMeal ? "7-Tage-Beispielplan" : "Beispiel-Trainingswoche"}</span>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{page.h1}</h1>
            <AuthorByline />
            <p className="mt-4 text-lg opacity-80">{page.intro}</p>
          </header>

          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm">
              <b>Dieses Beispiel ist für:</b> {page.profileLabel}.
              {isMeal && sample.macros ? (
                <> Makros: {fmt(sample.macros.protein)} g Protein, {fmt(sample.macros.carbs)} g Kohlenhydrate, {fmt(sample.macros.fat)} g Fett.</>
              ) : null}
              {!isMeal && sample.trainingSummary?.splitType ? <> Split: {sample.trainingSummary.splitType}.</> : null}
            </p>
            <p className="mt-2 text-sm opacity-70">
              Deine Werte sind anders? Der kostenlose {section.generatorLabel} rechnet mit deinen Daten und erstellt deinen Plan in wenigen Sekunden.
            </p>
            <div className="mt-4">{cta("top")}</div>
          </div>

          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">{isMeal ? "Der 7-Tage-Beispielplan" : "Die Beispiel-Trainingswoche"}</h2>
            <div className="space-y-3">
              {isMeal
                ? sample.mealDays.map((day, i) => <MealDayCard key={day.day} day={day} open={i === 0} />)
                : sample.trainingDays.map((day, i) => <TrainingDayCard key={day.day} day={day} open={i === sample.trainingDays.findIndex((d) => !d.isRestDay)} />)}
            </div>
            {sample.trainingSummary?.progressionPlan ? (
              <p className="mt-4 rounded-xl bg-base-200 p-4 text-sm"><b>Progression:</b> {sample.trainingSummary.progressionPlan}</p>
            ) : null}
          </section>

          {shopping && (
            <section className="mt-10">
              <h2 className="mb-2 text-2xl font-bold">Einkaufsliste für die Woche</h2>
              <p className="mb-4 text-sm opacity-70">Zusammengerechnet aus allen Rezepten des Beispielplans, sortiert nach Supermarkt-Bereichen.</p>
              <div className="grid gap-6 sm:grid-cols-2">
                {shopping.groups.map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">{group.title}</h3>
                    <ul className="text-sm">
                      {group.items.map((item) => (
                        <li key={`${item.name}-${item.unit}`} className="flex gap-2 border-b border-base-200 py-1">
                          <span className="w-20 shrink-0 font-semibold">{formatAmount(item)}</span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tips.length > 0 && (
            <section className="mt-10 rounded-2xl bg-base-200 p-5">
              <h2 className="mb-2 text-xl font-bold">Tipps zum Beispielplan</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </section>
          )}

          <div className="prose prose-lg mt-10 max-w-none">
            {page.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                {s.bullets?.length ? <ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul> : null}
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-primary p-6 text-primary-content">
            <h2 className="text-xl font-bold">{isMeal ? "Dein eigener Plan in Sekunden" : "Dein eigener Trainingsplan in Sekunden"}</h2>
            <p className="mt-1 opacity-90">
              {isMeal
                ? "Kostenlos, mit deinen Kalorien, Makros, Allergien und Vorlieben. Als PDF mit Einkaufsliste."
                : "Kostenlos, passend zu deinem Level, deinem Equipment und deiner Zeit. Als PDF zum Mitnehmen ins Training."}
            </p>
            <a href={page.generatorUrl} className="btn mt-4 bg-white text-primary hover:bg-white/90" onClick={() => ctaClick("bottom")}>
              Jetzt kostenlos erstellen
            </a>
          </div>

          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">Häufige Fragen</h2>
            <div className="space-y-3">
              {page.faq.map((item) => (
                <details key={item.question} className="rounded-xl border border-base-300 bg-base-100 p-4">
                  <summary className="cursor-pointer font-semibold">{item.question}</summary>
                  <p className="mt-2 text-sm opacity-80">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">Weitere {section.label}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((link) => (
                  <a key={link.url} href={link.url} className="rounded-xl border border-base-300 p-4 transition-colors hover:border-primary">
                    <span className="font-semibold">{link.h1}</span>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-sm">
                <a href={`/${page.section}/`} className="link link-primary">Alle {section.label} im Überblick</a>
                {" · "}
                <a href={isMeal ? "/trainingsplan/" : "/ernaehrungsplan/"} className="link link-primary">
                  {isMeal ? "Passende Trainingspläne" : "Passende Ernährungspläne"}
                </a>
              </p>
            </section>
          )}
        </article>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default PlanLandingPage;
