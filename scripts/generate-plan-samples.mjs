// Generates the static 7-day sample plans shown on the /ernaehrungsplan/ and
// /trainingsplan/ landing pages, by running the real generator endpoint
// in-process with the profile from src/data/plans/registry.json.
//
// Usage: GEMINI_API_KEY=... node scripts/generate-plan-samples.mjs [--force] [section-slug ...]
// Existing samples are kept unless --force or their id is passed explicitly.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import handler from "../api/generate-plan.mjs";

const root = new URL("../src/data/plans/", import.meta.url);
const outDir = new URL("samples/", root);
mkdirSync(outDir, { recursive: true });

const { pages } = JSON.parse(readFileSync(new URL("registry.json", root), "utf8"));
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY fehlt.");
  process.exit(1);
}

function runGenerator(type, userData) {
  return new Promise((resolve) => {
    const plan = { mealSummary: null, mealDays: [], trainingSummary: null, trainingDays: [], macros: null, errors: [] };
    let buffer = "";
    const res = {
      headersSent: false,
      setHeader() { this.headersSent = true; },
      status(code) { this.code = code; return this; },
      json(body) { plan.errors.push(`HTTP ${this.code}: ${body.message || body.error}`); resolve(plan); return this; },
      write(chunk) {
        buffer += chunk;
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          const msg = JSON.parse(part.slice(6));
          if (msg.event === "macros") plan.macros = msg.data;
          if (msg.event === "summary" && msg.planType === "meal") plan.mealSummary = { ...msg.data.summary, tips: msg.data.tips, disclaimer: msg.data.disclaimer };
          if (msg.event === "summary" && msg.planType === "training") plan.trainingSummary = { ...(msg.data.summary || plan.trainingSummary), tips: msg.data.tips, disclaimer: msg.data.disclaimer, progressionPlan: msg.data.progressionPlan };
          if (msg.event === "day") (msg.planType === "meal" ? plan.mealDays : plan.trainingDays).push(msg.data);
          if (msg.event === "error") plan.errors.push(msg.message);
        }
      },
      end() { resolve(plan); },
    };
    handler({ method: "POST", headers: { "x-forwarded-for": `sample-${Math.random()}` }, body: { type, userData } }, res);
  });
}

// A sample only goes live if it is complete and on target.
function check(page, plan) {
  const problems = [...plan.errors];
  if (page.section === "ernaehrungsplan") {
    if (plan.mealDays.length !== 7) problems.push(`${plan.mealDays.length} statt 7 Tage`);
    for (const day of plan.mealDays) {
      if (day.meals.length !== page.profile.mealsPerDay) problems.push(`${day.day}: ${day.meals.length} statt ${page.profile.mealsPerDay} Mahlzeiten`);
      if (Math.abs(day.totalCalories - plan.macros.calories) > 250) problems.push(`${day.day}: ${day.totalCalories} kcal statt ~${plan.macros.calories}`);
      if (page.profile.diet === "keto" && day.totalCarbs > 50) problems.push(`${day.day}: ${day.totalCarbs} g Kohlenhydrate bei Keto`);
    }
  } else {
    if (plan.trainingDays.length !== 7) problems.push(`${plan.trainingDays.length} statt 7 Tage`);
    const trainingDays = plan.trainingDays.filter((d) => !d.isRestDay).length;
    if (trainingDays !== page.profile.daysPerWeek) problems.push(`${trainingDays} statt ${page.profile.daysPerWeek} Trainingstage`);
    if (!plan.trainingSummary?.splitType) problems.push("keine Zusammenfassung");
  }
  return problems;
}

const todo = pages.filter((p) => {
  const id = `${p.section}-${p.slug}`;
  if (only.length) return only.includes(id);
  return force || !existsSync(new URL(`${id}.json`, outDir));
});

let failed = 0;
const queue = [...todo];
async function worker() {
  while (queue.length) {
    const page = queue.shift();
    const id = `${page.section}-${page.slug}`;
    const type = page.section === "ernaehrungsplan" ? "meal" : "training";
    for (let attempt = 1; attempt <= 3; attempt++) {
      const plan = await runGenerator(type, page.profile);
      const problems = check(page, plan);
      if (!problems.length) {
        const { errors, ...sample } = plan;
        writeFileSync(new URL(`${id}.json`, outDir), JSON.stringify({ profile: page.profile, generatedAt: new Date().toISOString().slice(0, 10), ...sample }, null, 1) + "\n");
        console.log(`ok    ${id}`);
        break;
      }
      console.log(`retry ${id} (${attempt}/3): ${problems.slice(0, 3).join("; ")}`);
      if (attempt === 3) failed++;
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`${todo.length - failed}/${todo.length} Beispielpläne erzeugt.`);
process.exit(failed ? 1 : 0);
