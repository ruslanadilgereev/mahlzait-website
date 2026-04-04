import { useState } from "react";

// ── Types ──
export interface MealItem {
  type: string;
  name: string;
  ingredients: string[];
  prepTimeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealDay {
  day: string;
  meals: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlanSummary {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  goal: string;
  diet: string;
  tips?: string[];
  disclaimer?: string;
}

interface MealPlanResultProps {
  summary: MealPlanSummary | null;
  days: MealDay[];
}

export default function MealPlanResult({ summary, days }: MealPlanResultProps) {
  const [expandedDay, setExpandedDay] = useState(0);

  if (!summary && days.length === 0) return null;

  const proteinPct = summary && summary.dailyCalories ? Math.round((summary.proteinGrams * 4 / summary.dailyCalories) * 100) : 0;
  const carbsPct = summary && summary.dailyCalories ? Math.round((summary.carbsGrams * 4 / summary.dailyCalories) * 100) : 0;
  const fatPct = summary && summary.dailyCalories ? Math.round((summary.fatGrams * 9 / summary.dailyCalories) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Screen: Summary Card ── */}
      {summary && (
        <div className="card bg-base-100 shadow-xl border border-primary/20 print:!hidden">
          <div className="card-body">
            <h3 className="card-title text-xl">Dein Essensplan</h3>
            <div className="text-center my-2">
              <p className="text-sm opacity-70">Tägliches Kalorienziel</p>
              <p className="text-4xl font-bold text-primary">{summary.dailyCalories} kcal</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{summary.proteinGrams}g</p>
                <p className="text-xs opacity-70">Protein ({proteinPct}%)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-info">{summary.carbsGrams}g</p>
                <p className="text-xs opacity-70">Carbs ({carbsPct}%)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{summary.fatGrams}g</p>
                <p className="text-xs opacity-70">Fett ({fatPct}%)</p>
              </div>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex mt-3">
              <div className="bg-success h-full" style={{ width: `${proteinPct}%` }} />
              <div className="bg-info h-full" style={{ width: `${carbsPct}%` }} />
              <div className="bg-warning h-full" style={{ width: `${fatPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Screen: Day Cards (Accordion) ── */}
      {days.map((day, i) => (
        <div key={i} className="card bg-base-100 shadow-sm border border-base-300 transition-all print:!hidden">
          <button
            type="button"
            className="card-body py-4 px-5 cursor-pointer flex-row justify-between items-center"
            onClick={() => setExpandedDay(expandedDay === i ? -1 : i)}
          >
            <div>
              <h4 className="font-bold text-lg">{day.day}</h4>
              <p className="text-sm opacity-60">
                {day.totalCalories} kcal | P: {day.totalProtein}g | K: {day.totalCarbs}g | F: {day.totalFat}g
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${expandedDay === i ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {expandedDay === i && (
            <div className="px-5 pb-5 space-y-3">
              {day.meals.map((meal, j) => (
                <div key={j} className="bg-base-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="badge badge-sm badge-primary">{meal.type}</span>
                      <h5 className="font-semibold mt-1">{meal.name}</h5>
                    </div>
                    <span className="text-sm font-bold text-primary">{meal.calories} kcal</span>
                  </div>
                  <div className="text-sm opacity-80 mb-2">
                    <p className="font-medium text-xs uppercase opacity-50 mb-1">Zutaten</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {meal.ingredients.map((ing, k) => <li key={k}>{ing}</li>)}
                    </ul>
                  </div>
                  <div className="flex gap-4 text-xs opacity-60 mt-2 pt-2 border-t border-base-300">
                    <span>P: {meal.protein}g</span>
                    <span>K: {meal.carbs}g</span>
                    <span>F: {meal.fat}g</span>
                    <span className="ml-auto">~{meal.prepTimeMinutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Tips */}
      {summary?.tips && summary.tips.length > 0 && (
        <div className="alert alert-info print:!hidden">
          <div>
            <p className="font-semibold mb-1">Tipps</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {summary.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        </div>
      )}

      {summary?.disclaimer && (
        <p className="text-xs text-center opacity-50 px-4">{summary.disclaimer}</p>
      )}
    </div>
  );
}
