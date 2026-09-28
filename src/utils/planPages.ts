// Landing pages for sample meal and training plans (/ernaehrungsplan/<slug>/,
// /trainingsplan/<slug>/). Three sources are merged per page:
// - data/plans/registry.json: which pages exist, sample profile, generator preset
// - data/plans/content/<section>-<slug>.json: the page text
// - data/plans/samples/<section>-<slug>.json: the generated 7-day plan
// A page is only published when all three exist.
import registry from "../data/plans/registry.json";
import { PLAN_SECTIONS, type PlanSection } from "./planSections";
import type { MealDay, MealPlanSummary } from "@modules/essensplan/_components/MealPlanResult";
import type { TrainingDay, TrainingPlanSummary } from "@modules/essensplan/_components/TrainingPlanResult";


export type { PlanSection };

export interface PlanContent {
  section: PlanSection;
  slug: string;
  name: string;
  seo: { title: string; description: string };
  h1: string;
  intro: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  faq: { question: string; answer: string }[];
}

export interface PlanSample {
  profile: Record<string, any>;
  generatedAt: string;
  macros: { tdee: number; calories: number; protein: number; carbs: number; fat: number } | null;
  mealSummary: MealPlanSummary | null;
  mealDays: MealDay[];
  trainingSummary: TrainingPlanSummary | null;
  trainingDays: TrainingDay[];
}

export interface PlanPage extends PlanContent {
  url: string;
  generatorUrl: string;
  profileLabel: string;
  sample: PlanSample;
}

export interface PlanLink {
  name: string;
  h1: string;
  description: string;
  url: string;
}

const contentFiles = import.meta.glob("../data/plans/content/*.json", { eager: true });
const sampleFiles = import.meta.glob("../data/plans/samples/*.json", { eager: true });
const byFile = (files: Record<string, any>) =>
  Object.fromEntries(Object.entries(files).map(([path, mod]) => [path.split("/").pop()!.replace(".json", ""), mod.default || mod]));
const contents: Record<string, PlanContent> = byFile(contentFiles);
const samples: Record<string, PlanSample> = byFile(sampleFiles);

const ACTIVITY_LABELS: Record<string, string> = {
  "1.2": "kaum aktiv",
  "1.375": "leicht aktiv",
  "1.55": "moderat aktiv",
  "1.725": "sehr aktiv",
  "1.9": "extrem aktiv",
};
const LEVEL_LABELS: Record<string, string> = { beginner: "Anfänger", intermediate: "Fortgeschritten", advanced: "Profi" };
const EQUIPMENT_LABELS: Record<string, string> = { gym: "Fitnessstudio", home: "Zuhause mit Hanteln", bodyweight: "ohne Geräte", outdoor: "draußen" };

function profileLabel(section: PlanSection, p: Record<string, any>, sample: PlanSample) {
  const person = `${p.gender === "female" ? "Frau" : "Mann"}, ${p.age} Jahre, ${p.height} cm, ${p.weight} kg`;
  if (section === "ernaehrungsplan") {
    const kcal = sample.macros ? `, Ziel ${sample.macros.calories.toLocaleString("de-DE")} kcal am Tag` : "";
    return `${person}, ${ACTIVITY_LABELS[String(p.activityLevel)] ?? "aktiv"}${kcal}, ${p.mealsPerDay} Mahlzeiten`;
  }
  return `${person}, ${LEVEL_LABELS[p.experienceLevel] ?? ""}, ${EQUIPMENT_LABELS[p.equipment] ?? ""}, ${p.daysPerWeek} Trainingstage à ${p.sessionTime} min`;
}

function generatorUrl(section: PlanSection, preset: Record<string, string | number>) {
  const query = new URLSearchParams(Object.entries(preset).map(([k, v]) => [k, String(v)])).toString();
  return `${PLAN_SECTIONS[section].generatorPath}${query ? `?${query}` : ""}`;
}

export function getPlanPages(section?: PlanSection): PlanPage[] {
  return (registry.pages as any[])
    .filter((entry) => !section || entry.section === section)
    .map((entry) => {
      const id = `${entry.section}-${entry.slug}`;
      const content = contents[id];
      const sample = samples[id];
      if (!content || !sample) return null;
      return {
        ...content,
        url: `/${entry.section}/${entry.slug}/`,
        generatorUrl: generatorUrl(entry.section, entry.preset),
        profileLabel: profileLabel(entry.section, sample.profile, sample),
        sample,
      } as PlanPage;
    })
    .filter((page): page is PlanPage => page !== null);
}

export function getPlanHub(section: PlanSection): PlanContent | undefined {
  return contents[`hub-${section}`];
}

export function toPlanLink(page: PlanPage): PlanLink {
  return { name: page.name, h1: page.h1, description: page.seo.description, url: page.url };
}
