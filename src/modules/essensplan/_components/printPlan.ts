import type { MealDay, MealPlanSummary } from "./MealPlanResult";
import type { TrainingDay, TrainingPlanSummary } from "./TrainingPlanResult";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mealCell(m: { name: string; ingredients: string[]; calories: number; protein: number; carbs: number; fat: number }) {
  const ings = m.ingredients.map((i) => esc(i)).join("<br>");
  return `<td><div class="cell"><div class="n">${esc(m.name)}</div><div class="i">${ings}</div><div class="m">${m.calories} kcal · ${m.protein}g P · ${m.carbs}g K · ${m.fat}g F</div></div></td>`;
}

function trainingCell(d: TrainingDay) {
  if (d.isRestDay) return `<td class="rs">Ruhetag</td>`;
  let html = `<div class="xt">${esc(d.focus)}</div>`;
  if (d.exercises?.length) {
    html += d.exercises
      .map((ex) => `<div class="xe"><b>${esc(ex.name)}</b> <span>${ex.sets}×${ex.reps} · ${ex.restSeconds}s</span></div>`)
      .join("");
  }
  if (d.estimatedMinutes) html += `<div class="xd">~${d.estimatedMinutes} min</div>`;
  return `<td>${html}</td>`;
}

export function openPrintWindow(
  mealSummary: MealPlanSummary | null,
  mealDays: MealDay[],
  trainingSummary: TrainingPlanSummary | null,
  trainingDays: TrainingDay[],
) {
  const hasMeals = mealSummary && mealDays.length > 0;
  const hasTraining = trainingSummary && trainingDays.length > 0;
  if (!hasMeals && !hasTraining) return;

  // Use meal days or training days for the 7-day columns
  const days = hasMeals ? mealDays : trainingDays!;
  const dayNames = days.map((d) => d.day);

  // Build meta line
  const metaParts: string[] = [];
  if (mealSummary) {
    metaParts.push(
      mealSummary.goal,
      mealSummary.diet,
      `~${mealSummary.dailyCalories} kcal/Tag`,
      `Protein ${mealSummary.proteinGrams}g`,
      `Kohlenhydrate ${mealSummary.carbsGrams}g`,
      `Fett ${mealSummary.fatGrams}g`,
    );
  }
  if (trainingSummary) {
    metaParts.push(trainingSummary.splitType, trainingSummary.level);
  }

  // Build meal rows
  let mealRowsHtml = "";
  if (hasMeals) {
    const maxMeals = Math.max(...mealDays.map((d) => d.meals.length));
    const mealLabels = ["Frühstück", "Mittagessen", "Abendessen", "Snack", "Snack 2"];

    for (let mi = 0; mi < maxMeals; mi++) {
      const label = mealDays[0]?.meals[mi]?.type || mealLabels[mi] || `Mahlzeit ${mi + 1}`;
      const cells = mealDays.map((d) => {
        const m = d.meals[mi];
        if (!m) return "<td></td>";
        return mealCell(m);
      }).join("");
      mealRowsHtml += `<tr><td class="rl">${esc(label)}</td>${cells}</tr>`;
    }
  }

  // Build training row
  let trainingRowHtml = "";
  if (hasTraining) {
    const cells = trainingDays!.map((d) => trainingCell(d)).join("");
    trainingRowHtml = `<tr class="xr"><td class="rl">Training</td>${cells}</tr>`;
  }

  // Build total row (from meal data if available)
  let totalRowHtml = "";
  if (hasMeals) {
    const cells = mealDays.map((d) =>
      `<td><div class="tv">${d.totalCalories} kcal</div><div class="ts">${d.totalProtein}g P · ${d.totalCarbs}g K · ${d.totalFat}g F</div></td>`
    ).join("");
    totalRowHtml = `<tr class="tl"><td class="rl">Total</td>${cells}</tr>`;
  }

  // Progression footer
  const progression = trainingSummary?.progressionPlan
    ? `<div class="pg"><b>Progression:</b> ${esc(trainingSummary.progressionPlan)}</div>`
    : "";

  const colWidth = `${(100 - 3) / dayNames.length}%`;
  const date = new Date().toLocaleDateString("de-DE");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Wochenplan — Mahlzait</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 297mm; height: 210mm; padding: 4mm 5mm 3mm; margin: 0 auto; position: relative; overflow: hidden; display: flex; flex-direction: column; }

  .hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm; padding-bottom: 1mm; border-bottom: 2.5px solid #009688; }
  .hd h1 { font-size: 14pt; font-weight: 800; letter-spacing: -0.5px; }
  .hd h1 span { color: #009688; }
  .hd .mt { font-size: 7pt; color: #777; }
  .hd .br { text-align: right; }
  .hd .br strong { display: block; font-size: 8pt; color: #009688; font-weight: 800; }
  .hd .br .dt { font-size: 5.5pt; color: #bbb; }

  table { width: 100%; border-collapse: collapse; table-layout: fixed; flex: 1; }
  col.lb { width: 22px; }
  thead th { background: #009688; color: #fff; font-weight: 700; text-align: center; font-size: 8.5pt; padding: 3.5px 2px; border: 1px solid #00897b; text-transform: uppercase; letter-spacing: 0.4px; }
  thead th:first-child { background: #00796b; font-size: 0; }

  .rl { background: #f0f8f7; font-weight: 800; font-size: 7pt; color: #009688; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; vertical-align: middle; border: 1px solid #dde8e6; padding: 0; writing-mode: vertical-lr; transform: rotate(180deg); }

  td { padding: 3px 4px 0; vertical-align: top; border: 1px solid #eee; overflow: hidden; height: 1px; }
  .cell { display: flex; flex-direction: column; height: 100%; }
  .n { font-weight: 800; font-size: 10.5pt; color: #111; line-height: 1.15; }
  .i { font-size: 8pt; color: #555; line-height: 1.4; margin-top: 1px; flex: 1; }
  .m { font-size: 7pt; color: #009688; font-weight: 700; padding: 2px 0; border-top: 1px solid #e0eeec; margin-top: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .xr td:not(.rl) { background: #f3f6f5; border-top: 1.5px solid #cdddd9; }
  .xr .rl { background: #e0f0e8; color: #2e7d32; border-top: 1.5px solid #cdddd9; }
  .xt { font-weight: 800; font-size: 9pt; color: #1a1a1a; margin-bottom: 1px; }
  .xe { font-size: 8pt; color: #444; line-height: 1.35; }
  .xe b { font-weight: 700; }
  .xe span { color: #333; font-size: 7pt; }
  .xd { font-size: 7pt; color: #009688; font-weight: 700; margin-top: 1px; }
  .rs { color: #ccc; font-style: italic; font-size: 9pt; text-align: center; vertical-align: middle; }

  .tl td { background: #e5f2f0 !important; border-top: 2px solid #009688; padding: 3px 4px; vertical-align: middle; }
  .tl .rl { background: #009688 !important; color: #fff; border-top: 2px solid #009688; }
  .tv { font-weight: 800; font-size: 10pt; color: #009688; }
  .ts { font-size: 7.5pt; color: #555; font-weight: 600; }

  .ft { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1mm; font-size: 5.5pt; color: #ccc; }
  .ft .pg { color: #888; font-size: 5.5pt; max-width: 70%; }
  .ft .pg b { color: #009688; }
</style>
</head>
<body>
<div class="page">
  <div class="hd">
    <div>
      <h1>Mein <span>Wochenplan</span></h1>
      <div class="mt">${esc(metaParts.join(" · "))}</div>
    </div>
    <div class="br"><strong>mahlzait.de</strong><span class="dt">${date}</span></div>
  </div>

  <table>
    <colgroup><col class="lb">${dayNames.map(() => `<col style="width:${colWidth}">`).join("")}</colgroup>
    <thead><tr><th></th>${dayNames.map((d) => `<th>${esc(d)}</th>`).join("")}</tr></thead>
    <tbody>
      ${mealRowsHtml}
      ${trainingRowHtml}
      ${totalRowHtml}
    </tbody>
  </table>

  <div class="ft">
    ${progression}
    <div>mahlzait.de · ${date}</div>
  </div>
</div>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
