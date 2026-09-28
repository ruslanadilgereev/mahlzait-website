// Kept apart from planPages.ts so client islands can import it without pulling
// every plan's content and sample JSON into the browser bundle.
export type PlanSection = "ernaehrungsplan" | "trainingsplan";

export const PLAN_SECTIONS: Record<PlanSection, { label: string; generatorPath: string; generatorLabel: string }> = {
  ernaehrungsplan: { label: "Ernährungspläne", generatorPath: "/essensplan-erstellen/", generatorLabel: "Essensplan-Generator" },
  trainingsplan: { label: "Trainingspläne", generatorPath: "/trainingsplan-erstellen/", generatorLabel: "Trainingsplan-Generator" },
};
