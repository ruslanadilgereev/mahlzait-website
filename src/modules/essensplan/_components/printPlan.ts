import type { MealDay, MealItem, MealPlanSummary } from "./MealPlanResult";
import type { TrainingDay, TrainingPlanSummary } from "./TrainingPlanResult";

// The print document is multi-page on purpose: a landscape week overview that
// only carries dish names (so it always fits, whatever the plan size), then
// the full recipes and workouts flowing over as many portrait pages as they
// need, a summed-up shopping list and the tips. Nothing is clipped.

function esc(s: string | number | undefined | null) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

// ── Shopping list ──

// unit → [base unit, factor, plural]. Count units ("Dose", "Scheibe") stay
// as they are; only weights and volumes are converted.
const UNITS: Record<string, [string, number, string]> = {
  g: ["g", 1, "g"], kg: ["g", 1000, "g"], ml: ["ml", 1, "ml"], l: ["ml", 1000, "ml"],
  el: ["EL", 1, "EL"], tl: ["TL", 1, "TL"],
  dose: ["Dose", 1, "Dosen"], dosen: ["Dose", 1, "Dosen"],
  scheibe: ["Scheibe", 1, "Scheiben"], scheiben: ["Scheibe", 1, "Scheiben"],
  stück: ["x", 1, "x"], stk: ["x", 1, "x"],
  packung: ["Packung", 1, "Packungen"], packungen: ["Packung", 1, "Packungen"], pck: ["Packung", 1, "Packungen"],
  bund: ["Bund", 1, "Bund"], zehe: ["Zehe", 1, "Zehen"], zehen: ["Zehe", 1, "Zehen"],
  becher: ["Becher", 1, "Becher"], glas: ["Glas", 1, "Gläser"], gläser: ["Glas", 1, "Gläser"],
  handvoll: ["Handvoll", 1, "Handvoll"], prise: ["Prise", 1, "Prisen"], prisen: ["Prise", 1, "Prisen"],
};
const UNIT_PATTERN = Object.keys(UNITS).sort((a, b) => b.length - a.length).join("|");

// "120g Haferflocken" / "300 ml Milch (1,5%)" / "2 Scheiben Brot" / "1 große Banane".
// Anything without a leading amount ("Salz & Pfeffer") goes to the extras.
const INGREDIENT_RE = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(?:(${UNIT_PATTERN})\\.?\\s+)?(.+)$`, "i");
const SIZE_WORDS = /^(?:(?:sehr\s+)?(?:groß|klein|mittelgroß|mittler|reif|frisch|ganz|gekocht|hartgekocht|mager)(?:e|er|es|en)?\s+)+/i;
const TRAILING_WORDS = /\s+(?:mager|natur|light)$/i;

interface ShoppingItem {
  name: string;
  unit: string;
  amount: number;
}

// Matching key that folds spelling variants: "Eier"/"Ei", "Chia-Samen"/"Chiasamen",
// "Tomaten"/"Tomate", "Äpfel"/"Apfel".
function itemKey(name: string) {
  return name
    .toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/[^a-zß]/g, "")
    .replace(/(en|er|n|e|s)$/, "");
}

// Supermarket sections, checked in order. The first list catches items that
// would otherwise land in the wrong aisle (Kokosmilch, Erdnussbutter, canned tomatoes).
const SECTIONS: [string, RegExp][] = [
  ["Kühlregal: Milchprodukte, Eier & Tofu", /hafermilch|mandelmilch|sojamilch|haferdrink|quark|joghurt|skyr/i],
  ["Obst & Gemüse", /zuckerschote/i],
  ["Vorrat & Konserven", /kokosmilch|nussbutter|mandelbutter|pulver|whey|öl\b|öl$|sirup|honig|sauce|soße|paste|brühe|passiert|stückig|gehackte tomaten|dose|konserv|kichererbsen|kidney|linsen|mais|nüsse|nuss|mandel|samen|kerne|essig|senf|ketchup|schokolade|kakao|\bzucker\b|salz|gewürz/i],
  ["Fleisch & Fisch", /hähnchen|huhn|hühner|pute|rind|hackfleisch|schwein|lachs|fisch|forelle|kabeljau|seelachs|garnele|shrimp|schinken|speck|steak|wurst|salami|geschnetzelt/i],
  ["Kühlregal: Milchprodukte, Eier & Tofu", /milch|quark|joghurt|skyr|käse|feta|mozzarella|parmesan|butter|sahne|schmand|kefir|\beier?\b|eiklar|tofu|tempeh/i],
  ["Brot, Getreide & Nudeln", /brot|toast|brötchen|baguette|wrap|tortilla|reis|nudel|pasta|penne|spaghetti|fusilli|spätzle|quinoa|couscous|bulgur|hafer|oats|müsli|granola|mehl|gnocchi|cornflakes/i],
  ["Obst & Gemüse", /apfel|äpfel|banane|beere|orange|zitrone|limette|kiwi|mango|ananas|birne|pfirsich|traube|avocado|tomate|gurke|paprika|zucchini|brokkoli|spinat|salat|karotte|möhre|zwiebel|knoblauch|kartoffel|pilz|champignon|aubergine|kohl|lauch|sellerie|spargel|erbse|bohne|zuckerschote|rucola|petersilie|basilikum|schnittlauch|koriander|ingwer|kürbis|bete|radieschen|obst|gemüse|kräuter/i],
];
const OTHER_SECTION = "Sonstiges";

export function buildShoppingList(mealDays: MealDay[]) {
  const items = new Map<string, ShoppingItem>();
  const extras = new Map<string, string>();

  for (const day of mealDays) {
    for (const meal of day.meals) {
      for (const raw of meal.ingredients ?? []) {
        const text = raw.trim();
        const match = text.match(INGREDIENT_RE);
        if (!match) {
          const key = itemKey(text);
          if (!extras.has(key)) extras.set(key, text);
          continue;
        }
        const [base, factor] = match[2] ? UNITS[match[2].toLowerCase()] : ["x", 1];
        const amount = parseFloat(match[1].replace(",", ".")) * factor;
        const name = match[3]
          .replace(/\s*\([^)]*\)/g, "")
          .replace(/,.*$/, "")
          .replace(/\s+(?:zum|zur|für)\s.+$/i, "")
          .replace(SIZE_WORDS, "")
          .replace(TRAILING_WORDS, "")
          .trim()
          // Flavours and spellings of protein powder are one tub.
          .replace(/^.*(?:whey|proteinpulver).*$/i, "Whey-Proteinpulver");
        const key = `${itemKey(name)}|${base}`;
        const existing = items.get(key);
        if (!existing) {
          items.set(key, { name, unit: base, amount });
          continue;
        }
        existing.amount += amount;
        // Counted items read better in the plural ("7 Eier"), which is usually the longer spelling.
        if (base === "x" && name.length > existing.name.length) existing.name = name;
      }
    }
  }

  const groups = new Map<string, ShoppingItem[]>();
  for (const item of items.values()) {
    const section = SECTIONS.find(([, re]) => re.test(item.name))?.[0] ?? OTHER_SECTION;
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section)!.push(item);
  }
  // Fresh food first, the way people walk through a supermarket.
  const walkOrder = ["Obst & Gemüse", "Fleisch & Fisch", "Kühlregal: Milchprodukte, Eier & Tofu", "Brot, Getreide & Nudeln", "Vorrat & Konserven", OTHER_SECTION];
  return {
    groups: walkOrder
      .filter((title) => groups.has(title))
      .map((title) => ({ title, items: groups.get(title)!.sort((a, b) => a.name.localeCompare(b.name, "de")) })),
    extras: [...extras.values()].sort((a, b) => a.localeCompare(b, "de")),
  };
}

function formatAmount(item: ShoppingItem) {
  const num = (n: number, digits = 1) => n.toLocaleString("de-DE", { maximumFractionDigits: digits });
  if (item.unit === "g") return item.amount >= 1000 ? `${num(item.amount / 1000, 2)} kg` : `${num(item.amount, 0)} g`;
  if (item.unit === "ml") return item.amount >= 1000 ? `${num(item.amount / 1000, 2)} l` : `${num(item.amount, 0)} ml`;
  if (item.unit === "x") return `${num(item.amount)}×`;
  const unit = Object.values(UNITS).find(([base]) => base === item.unit);
  return `${num(item.amount)} ${item.amount > 1 && unit ? unit[2] : item.unit}`;
}

// ── Building blocks ──

function macroLine(m: { calories: number; protein: number; carbs: number; fat: number }) {
  return `<span class="kc">${fmt(m.calories)} kcal</span><span class="p">${fmt(m.protein)} g P</span><span class="c">${fmt(m.carbs)} g K</span><span class="f">${fmt(m.fat)} g F</span>`;
}

function overviewMealCell(meal: MealItem | undefined, rowLabel: string) {
  if (!meal) return `<td class="empty"></td>`;
  const tag = meal.type && meal.type !== rowLabel ? `<div class="ot">${esc(meal.type)}</div>` : "";
  return `<td>${tag}<div class="on">${esc(meal.name)}</div><div class="om"><b>${fmt(meal.calories)}</b> kcal · ${fmt(meal.protein)} g P</div></td>`;
}

function overviewTrainingCell(day: TrainingDay | undefined, withExercises: boolean) {
  if (!day) return `<td class="empty"></td>`;
  if (day.isRestDay) return `<td class="rest">Ruhetag</td>`;
  const exercises = day.exercises ?? [];
  let list = "";
  if (withExercises && exercises.length) {
    const shown = exercises.slice(0, 8).map((ex) => `<li>${esc(ex.name)}</li>`).join("");
    const more = exercises.length > 8 ? `<li class="more">+ ${exercises.length - 8} weitere</li>` : "";
    list = `<ul class="ol">${shown}${more}</ul>`;
  }
  const meta = [exercises.length ? `${exercises.length} Übungen` : "", day.estimatedMinutes ? `~${day.estimatedMinutes} min` : ""].filter(Boolean).join(" · ");
  return `<td><div class="on">${esc(day.focus)}</div>${list}<div class="om">${meta}</div></td>`;
}

function mealBlock(meal: MealItem) {
  const ingredients = (meal.ingredients ?? []).map((i) => `<li>${esc(i)}</li>`).join("");
  const prep = meal.prepTimeMinutes ? `<span class="prep">⏱ ${fmt(meal.prepTimeMinutes)} min</span>` : "";
  return `<div class="meal">
    <div class="mh"><span class="tag">${esc(meal.type)}</span><h4>${esc(meal.name)}</h4>${prep}</div>
    <div class="macros">${macroLine(meal)}</div>
    <ul class="ing">${ingredients}</ul>
  </div>`;
}

function trainingBlock(day: TrainingDay) {
  if (day.isRestDay) {
    return `<div class="workout rest-block"><span class="tag tr">Training</span> Ruhetag · ${esc(day.focus || "Regeneration")}</div>`;
  }
  const warmup = day.warmup?.length ? `<p class="wu"><b>Aufwärmen:</b> ${day.warmup.map(esc).join(" · ")}</p>` : "";
  const cooldown = day.cooldown?.length ? `<p class="wu"><b>Cool-down:</b> ${day.cooldown.map(esc).join(" · ")}</p>` : "";
  const rows = (day.exercises ?? []).map((ex) => `<tr>
      <td class="ex"><b>${esc(ex.name)}</b><span>${esc(ex.muscleGroup)}</span></td>
      <td class="num">${esc(ex.sets)} × ${esc(ex.reps)}</td>
      <td class="num">${esc(ex.restSeconds)} s</td>
      <td class="note">${esc(ex.notes)}</td>
    </tr>`).join("");
  const duration = day.estimatedMinutes ? `<span class="prep">⏱ ~${fmt(day.estimatedMinutes)} min</span>` : "";
  return `<div class="workout">
    <div class="mh"><span class="tag tr">Training</span><h4>${esc(day.focus)}</h4>${duration}</div>
    ${warmup}
    <table class="xt">
      <thead><tr><th>Übung</th><th>Sätze × Wdh.</th><th>Pause</th><th>Hinweis</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${cooldown}
  </div>`;
}

// ── Document ──

export function buildPrintHtml(
  mealSummary: MealPlanSummary | null,
  mealDays: MealDay[],
  trainingSummary: TrainingPlanSummary | null,
  trainingDays: TrainingDay[],
  date = new Date(),
) {
  const hasMeals = mealDays.length > 0;
  const hasTraining = trainingDays.length > 0;
  const days = hasMeals ? mealDays : trainingDays;
  const dateLabel = date.toLocaleDateString("de-DE");

  // Training days are matched by weekday name, falling back to position.
  const trainingFor = (dayName: string, index: number) =>
    trainingDays.find((t) => t.day === dayName) ?? trainingDays[index];

  // Header chips
  const chips: string[] = [];
  if (mealSummary) {
    chips.push(esc(mealSummary.goal), esc(mealSummary.diet));
    chips.push(`<b>${fmt(mealSummary.dailyCalories)} kcal</b>/Tag`);
    chips.push(`<span class="p">${fmt(mealSummary.proteinGrams)} g Protein</span>`);
    chips.push(`<span class="c">${fmt(mealSummary.carbsGrams)} g Kohlenhydrate</span>`);
    chips.push(`<span class="f">${fmt(mealSummary.fatGrams)} g Fett</span>`);
  }
  if (trainingSummary) {
    if (!mealSummary) chips.push(esc(trainingSummary.goal));
    chips.push(esc(trainingSummary.splitType), esc(trainingSummary.level));
    if (trainingSummary.daysPerWeek) chips.push(`${esc(trainingSummary.daysPerWeek)}× Training/Woche`);
  }
  const chipHtml = chips.filter(Boolean).map((c) => `<span class="chip">${c}</span>`).join("");
  const title = hasMeals && hasTraining ? "Ernährungs- & Trainingsplan" : hasMeals ? "Essensplan" : "Trainingsplan";

  // ── Page 1: week overview ──
  let overviewRows = "";
  if (hasMeals) {
    const maxMeals = Math.max(...mealDays.map((d) => d.meals.length));
    for (let mi = 0; mi < maxMeals; mi++) {
      const label = mealDays.find((d) => d.meals[mi])?.meals[mi]?.type || `Mahlzeit ${mi + 1}`;
      const cells = mealDays.map((d) => overviewMealCell(d.meals[mi], label)).join("");
      overviewRows += `<tr><th class="rl">${esc(label)}</th>${cells}</tr>`;
    }
  }
  if (hasTraining) {
    const cells = days.map((d, i) => overviewTrainingCell(trainingFor(d.day, i), !hasMeals)).join("");
    overviewRows += `<tr class="trow"><th class="rl">Training</th>${cells}</tr>`;
  }
  if (hasMeals) {
    const cells = mealDays.map((d) =>
      `<td><div class="tv">${fmt(d.totalCalories)} kcal</div><div class="ts"><span class="p">${fmt(d.totalProtein)} P</span> · <span class="c">${fmt(d.totalCarbs)} K</span> · <span class="f">${fmt(d.totalFat)} F</span></div></td>`,
    ).join("");
    overviewRows += `<tr class="total"><th class="rl">Summe</th>${cells}</tr>`;
  }

  const hintParts = [
    hasMeals && "Alle Rezepte mit Zutaten",
    hasTraining && (hasMeals ? "die Trainingseinheiten" : "Alle Trainingseinheiten mit Sätzen, Wiederholungen und Pausen"),
    hasMeals && "die Einkaufsliste",
  ].filter(Boolean) as string[];
  const hint = hintParts.length > 1 ? `${hintParts.slice(0, -1).join(", ")} und ${hintParts[hintParts.length - 1]}` : hintParts[0];
  // With few rows there is room for full dish names instead of 3 clamped lines.
  const rowCount = (hasMeals ? Math.max(...mealDays.map((d) => d.meals.length)) : 0) + (hasTraining ? 1 : 0);

  const overview = `<section class="overview">
    <header class="hd">
      <div>
        <div class="brand">mahlzait<span>.de</span></div>
        <h1>Mein ${title}</h1>
      </div>
      <div class="date">Erstellt am ${dateLabel}</div>
    </header>
    <div class="chips">${chipHtml}</div>
    <table class="grid${rowCount <= 3 ? " roomy" : ""}">
      <thead><tr><th class="rl"></th>${days.map((d) => `<th>${esc(d.day)}</th>`).join("")}</tr></thead>
      <tbody>${overviewRows}</tbody>
    </table>
    <p class="hint">${hint} findest du auf den folgenden Seiten.</p>
  </section>`;

  // ── Day pages ──
  const daySections = days.map((d, i) => {
    const mealDay = hasMeals ? mealDays[i] : undefined;
    const trainingDay = hasTraining ? trainingFor(d.day, i) : undefined;
    const totals = mealDay
      ? `<div class="dt">${macroLine({ calories: mealDay.totalCalories, protein: mealDay.totalProtein, carbs: mealDay.totalCarbs, fat: mealDay.totalFat })}</div>`
      : "";
    const meals = mealDay ? mealDay.meals.map(mealBlock).join("") : "";
    const workout = trainingDay ? trainingBlock(trainingDay) : "";
    return `<section class="day"><div class="dh"><h3>${esc(d.day)}</h3>${totals}</div>${meals}${workout}</section>`;
  }).join("");

  // ── Shopping list ──
  let shopping = "";
  if (hasMeals) {
    const { groups, extras } = buildShoppingList(mealDays);
    const groupHtml = groups.map((g) => `<div class="sg"><h4 class="sx">${esc(g.title)}</h4><ul class="shop">${g.items
      .map((it) => `<li><span class="box"></span><span class="amt">${esc(formatAmount(it))}</span><span>${esc(it.name)}</span></li>`)
      .join("")}</ul></div>`).join("");
    const extraRows = extras.length
      ? `<div class="sg"><h4 class="sx">Außerdem nach Bedarf</h4><ul class="shop">${extras.map((e) => `<li><span class="box"></span><span>${esc(e)}</span></li>`).join("")}</ul></div>`
      : "";
    shopping = `<section class="shopping">
      <h2>Einkaufsliste</h2>
      <p class="sub">Für 7 Tage, zusammengerechnet aus allen Rezepten und sortiert nach Supermarkt-Bereichen. Mengen sind Richtwerte, schau vorher in deinen Vorrat.</p>
      <div class="shopcols">${groupHtml}${extraRows}</div>
    </section>`;
  }

  // ── Tips & notes ──
  const tips = [...(mealSummary?.tips ?? []), ...(trainingSummary?.tips ?? [])];
  const notes: string[] = [];
  if (tips.length) notes.push(`<h3>Tipps für deine Woche</h3><ul class="tips">${tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`);
  if (trainingSummary?.progressionPlan) notes.push(`<h3>Progression</h3><p>${esc(trainingSummary.progressionPlan)}</p>`);
  const disclaimers = [mealSummary?.disclaimer, trainingSummary?.disclaimer].filter(Boolean) as string[];
  if (disclaimers.length) notes.push(`<p class="disc">${disclaimers.map(esc).join(" ")}</p>`);
  notes.push(`<div class="cta"><b>Tipp:</b> Mit der kostenlosen Mahlzait App trackst du deinen Plan per Foto, Barcode oder Text und siehst sofort, ob du im Ziel liegst. <b>mahlzait.de</b></div>`);
  const notesSection = `<section class="notes">${notes.join("")}</section>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mahlzait ${title} ${dateLabel}</title>
<style>
  @page { size: A4 portrait; margin: 12mm 13mm 14mm;
    @bottom-left { content: "mahlzait.de"; font: 600 7pt system-ui, sans-serif; color: #009688; }
    @bottom-right { content: "Seite " counter(page) " von " counter(pages); font: 7pt system-ui, sans-serif; color: #999; } }
  @page overview { size: A4 landscape; margin: 9mm 10mm 11mm; }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #1c1c1c; background: #fff; font-size: 9.5pt; line-height: 1.4; }
  .p { color: #0285FF; } .c { color: #E02E2A; } .f { color: #E25507; } .kc { color: #008635; font-weight: 700; }

  /* Toolbar (screen only) */
  .bar { position: sticky; top: 0; z-index: 5; display: flex; gap: 10px; align-items: center; justify-content: center; padding: 10px; background: #00796b; color: #fff; font-size: 10pt; }
  .bar button { font: inherit; font-weight: 700; padding: 8px 16px; border: 0; border-radius: 8px; background: #fff; color: #00796b; cursor: pointer; }
  @media print { .bar { display: none; } }
  @media screen { body { background: #eef2f1; } section { background: #fff; max-width: 210mm; margin: 12px auto; padding: 12mm; box-shadow: 0 1px 4px rgba(0,0,0,.12); } section.overview { max-width: 297mm; } }

  /* Overview */
  .overview { page: overview; }
  .hd { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #009688; padding-bottom: 2mm; }
  .brand { font-weight: 800; font-size: 9pt; color: #009688; letter-spacing: .2px; }
  .brand span { color: #9bb; }
  h1 { font-size: 18pt; font-weight: 800; letter-spacing: -.4px; line-height: 1.15; }
  .date { font-size: 8pt; color: #888; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; margin: 2.5mm 0 3mm; }
  .chip { font-size: 8pt; padding: 2px 8px; border-radius: 99px; background: #eef7f6; border: 1px solid #d3e9e6; color: #333; }

  table.grid { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .grid th, .grid td { border: 1px solid #e3e9e8; padding: 4px 5px; vertical-align: top; }
  .grid thead th { background: #009688; color: #fff; font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; text-align: center; border-color: #00897b; }
  .grid thead th.rl { background: #00796b; }
  .grid th.rl { width: 22mm; background: #f2f8f7; color: #00796b; font-size: 7.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; text-align: left; vertical-align: middle; }
  .grid tbody tr { break-inside: avoid; }
  .on { font-weight: 700; font-size: 8.5pt; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .roomy .on { -webkit-line-clamp: 7; font-size: 9pt; }
  .ot { font-size: 6.5pt; text-transform: uppercase; letter-spacing: .4px; color: #00796b; font-weight: 700; }
  .om { font-size: 7pt; color: #666; margin-top: 2px; }
  .om b { color: #008635; }
  .ol { list-style: none; font-size: 7.5pt; color: #444; margin-top: 2px; line-height: 1.3; }
  .ol li::before { content: "· "; color: #009688; font-weight: 700; }
  .ol .more { color: #888; font-style: italic; }
  .trow td, .trow th.rl { background: #f4f8f6; }
  .rest { color: #aaa; font-style: italic; text-align: center; vertical-align: middle !important; }
  .empty { background: #fafafa; }
  .total td, .total th.rl { background: #e6f3f1; border-top: 2px solid #009688; vertical-align: middle; }
  .tv { font-weight: 800; color: #008635; font-size: 9pt; }
  .ts { font-size: 7pt; font-weight: 600; }
  .hint { margin-top: 2.5mm; font-size: 7.5pt; color: #888; }

  /* Day pages */
  .day { break-before: page; }
  .day + .day { break-before: auto; margin-top: 6mm; }
  .dh { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #009688; padding-bottom: 1.5mm; margin-bottom: 3mm; break-after: avoid; }
  .dh h3 { font-size: 15pt; font-weight: 800; color: #00796b; }
  .dt, .macros { display: flex; gap: 10px; font-size: 8pt; font-weight: 600; }
  .meal, .workout { border: 1px solid #e3e9e8; border-radius: 6px; padding: 2.2mm 3mm; margin-bottom: 2mm; }
  .meal { break-inside: avoid; }
  .mh { display: flex; align-items: baseline; gap: 6px; break-after: avoid; }
  .mh h4 { font-size: 10.5pt; font-weight: 700; flex: 1; line-height: 1.25; }
  .tag { font-size: 6.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: #fff; background: #009688; padding: 1px 6px; border-radius: 3px; white-space: nowrap; }
  .tag.tr { background: #2e7d32; }
  .prep { font-size: 7.5pt; color: #777; white-space: nowrap; }
  .ing { columns: 3; column-gap: 6mm; list-style: none; font-size: 8.5pt; color: #333; }
  .ing li { break-inside: avoid; padding-left: 9px; position: relative; }
  .ing li::before { content: "•"; position: absolute; left: 0; color: #009688; }
  .macros { margin: .5mm 0 1.2mm; font-size: 7.5pt; }
  .rest-block { color: #777; font-style: italic; background: #f7faf9; }
  .rest-block .tag { font-style: normal; }
  .wu { font-size: 8pt; color: #444; margin: 1mm 0; }
  table.xt { width: 100%; border-collapse: collapse; margin: 1.5mm 0; font-size: 8pt; }
  .xt th { text-align: left; font-size: 7pt; text-transform: uppercase; letter-spacing: .4px; color: #2e7d32; border-bottom: 1.5px solid #cfe3d3; padding: 2px 4px; }
  .xt td { border-bottom: 1px solid #edf1f0; padding: 3px 4px; vertical-align: top; }
  .xt tr { break-inside: avoid; }
  .xt .ex { width: 32%; } .xt .ex span { display: block; font-size: 7pt; color: #888; }
  .xt .num { white-space: nowrap; width: 1%; font-weight: 600; }
  .xt .note { color: #555; font-size: 7.5pt; }

  /* Shopping list */
  .shopping { break-before: page; }
  h2 { font-size: 15pt; font-weight: 800; color: #00796b; border-bottom: 2px solid #009688; padding-bottom: 1.5mm; }
  .sub { font-size: 8pt; color: #777; margin: 1.5mm 0 3mm; }
  .shopcols { columns: 2; column-gap: 10mm; }
  .sg { margin-bottom: 3mm; }
  .shop { list-style: none; font-size: 8.5pt; }
  .shop li { break-inside: avoid; display: flex; align-items: baseline; gap: 5px; padding: 1.5px 0; border-bottom: 1px solid #f0f3f2; }
  .box { flex: none; width: 3mm; height: 3mm; border: 1.3px solid #009688; border-radius: 2px; transform: translateY(.4mm); }
  .amt { flex: none; font-weight: 700; min-width: 15mm; white-space: nowrap; }
  .sx { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .4px; margin: 0 0 1mm; color: #00796b; break-after: avoid; }

  /* Notes */
  .notes { margin-top: 8mm; }
  .notes h3 { font-size: 11pt; color: #00796b; margin: 4mm 0 1.5mm; break-after: avoid; }
  .tips { padding-left: 5mm; font-size: 9pt; }
  .tips li { margin-bottom: 1mm; }
  .notes p { font-size: 9pt; }
  .disc { margin-top: 4mm; font-size: 7.5pt !important; color: #888; }
  .cta { margin-top: 5mm; padding: 3mm 4mm; border-radius: 6px; background: #e6f3f1; font-size: 8.5pt; break-inside: avoid; }
  .cta b { color: #00796b; }
</style>
</head>
<body>
<div class="bar">Dein Plan ist fertig. <button onclick="window.print()">Drucken / als PDF speichern</button></div>
${overview}
${daySections}
${shopping}
${notesSection}
<script>window.onload=function(){setTimeout(function(){window.print();},300);}<\/script>
</body>
</html>`;
}

export function openPrintWindow(
  mealSummary: MealPlanSummary | null,
  mealDays: MealDay[],
  trainingSummary: TrainingPlanSummary | null,
  trainingDays: TrainingDay[],
) {
  if (mealDays.length === 0 && trainingDays.length === 0) return;
  const html = buildPrintHtml(mealSummary, mealDays, trainingSummary, trainingDays);

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    return;
  }

  // Popup blocked: print from a hidden iframe instead.
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
  frame.srcdoc = html;
  document.body.appendChild(frame);
  setTimeout(() => frame.remove(), 60_000);
}
