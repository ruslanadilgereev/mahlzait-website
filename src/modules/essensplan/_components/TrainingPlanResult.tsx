import { useState } from "react";

// ── Types ──
export interface Exercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface TrainingDay {
  day: string;
  focus: string;
  isRestDay: boolean;
  warmup?: string[];
  exercises?: Exercise[];
  cooldown?: string[];
  estimatedMinutes?: number;
}

export interface TrainingPlanSummary {
  goal: string;
  level: string;
  daysPerWeek: number;
  splitType: string;
  progressionPlan?: string;
  tips?: string[];
  disclaimer?: string;
}

interface TrainingPlanResultProps {
  summary: TrainingPlanSummary | null;
  days: TrainingDay[];
}

export default function TrainingPlanResult({ summary, days }: TrainingPlanResultProps) {
  const [expandedDay, setExpandedDay] = useState(0);

  if (!summary && days.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {summary && (
        <div className="card bg-base-100 shadow-xl border border-primary/20">
          <div className="card-body">
            <h3 className="card-title text-xl">Dein Trainingsplan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <div className="bg-base-200 rounded-lg p-3 text-center">
                <p className="text-xs opacity-60">Split</p>
                <p className="font-bold text-sm">{summary.splitType}</p>
              </div>
              <div className="bg-base-200 rounded-lg p-3 text-center">
                <p className="text-xs opacity-60">Level</p>
                <p className="font-bold text-sm">{summary.level}</p>
              </div>
              <div className="bg-base-200 rounded-lg p-3 text-center">
                <p className="text-xs opacity-60">Tage/Woche</p>
                <p className="font-bold text-sm text-primary">{summary.daysPerWeek}x</p>
              </div>
              <div className="bg-base-200 rounded-lg p-3 text-center">
                <p className="text-xs opacity-60">Ziel</p>
                <p className="font-bold text-sm">{summary.goal}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Cards */}
      {days.map((day, i) => (
        <div
          key={i}
          className={`card shadow-sm border transition-all ${
            day.isRestDay
              ? "bg-base-200/50 border-base-300"
              : "bg-base-100 border-base-300"
          }`}
        >
          {/* Day Header */}
          <button
            type="button"
            className="card-body py-4 px-5 cursor-pointer flex-row justify-between items-center"
            onClick={() => !day.isRestDay && setExpandedDay(expandedDay === i ? -1 : i)}
          >
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                {day.day}
                {day.isRestDay && <span className="badge badge-ghost badge-sm">Ruhetag</span>}
              </h4>
              <p className="text-sm opacity-60">
                {day.isRestDay
                  ? "Regeneration und Erholung"
                  : `${day.focus} — ~${day.estimatedMinutes || "?"} min`}
              </p>
            </div>
            {!day.isRestDay && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-5 h-5 transition-transform ${expandedDay === i ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            )}
          </button>

          {/* Exercises */}
          {!day.isRestDay && expandedDay === i && (
            <div className="px-5 pb-5 space-y-4">
              {/* Warmup */}
              {day.warmup && day.warmup.length > 0 && (
                <div className="bg-success/10 rounded-lg p-3">
                  <p className="font-semibold text-sm text-success mb-1">Warm-Up</p>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {day.warmup.map((w, j) => <li key={j}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Exercise Table */}
              {day.exercises && day.exercises.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Übung</th>
                        <th>Muskelgruppe</th>
                        <th className="text-center">Sätze</th>
                        <th className="text-center">Wdh.</th>
                        <th className="text-center">Pause</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.exercises.map((ex, j) => (
                        <tr key={j}>
                          <td>
                            <p className="font-medium">{ex.name}</p>
                            {ex.notes && <p className="text-xs opacity-50">{ex.notes}</p>}
                          </td>
                          <td className="text-sm opacity-70">{ex.muscleGroup}</td>
                          <td className="text-center font-bold">{ex.sets}</td>
                          <td className="text-center">{ex.reps}</td>
                          <td className="text-center text-sm opacity-70">{ex.restSeconds}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cooldown */}
              {day.cooldown && day.cooldown.length > 0 && (
                <div className="bg-info/10 rounded-lg p-3">
                  <p className="font-semibold text-sm text-info mb-1">Cool-Down</p>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {day.cooldown.map((c, j) => <li key={j}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Progression Plan */}
      {summary?.progressionPlan && (
        <div className="alert alert-success">
          <div>
            <p className="font-semibold mb-1">Progressionsplan</p>
            <p className="text-sm">{summary.progressionPlan}</p>
          </div>
        </div>
      )}

      {/* Tips */}
      {summary?.tips && summary.tips.length > 0 && (
        <div className="alert alert-info">
          <div>
            <p className="font-semibold mb-1">Tipps</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {summary.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {summary?.disclaimer && (
        <p className="text-xs text-center opacity-50 px-4 print:!hidden">{summary.disclaimer}</p>
      )}

      {/* ══════ PRINT-ONLY: Training calendar ══════ */}
      {days.length > 0 && (
        <div id="training-print" className="hidden print:!block print:!fixed print:!inset-0 print:!z-[9999] print:!bg-white print:!p-[6mm]" style={{ colorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
            <div>
              <div style={{ fontSize: "13pt", fontWeight: 800, fontFamily: "system-ui, sans-serif" }}>
                Trainingsplan — {summary?.goal}
              </div>
              <div style={{ fontSize: "8pt", color: "#666" }}>
                {summary?.splitType} | {summary?.level} | {summary?.daysPerWeek}x/Woche
              </div>
            </div>
            <div style={{ fontSize: "7pt", color: "#999", textAlign: "right" }}>
              mahlzait.de<br />
              {new Date().toLocaleDateString("de-DE")}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "7pt", lineHeight: 1.2, fontFamily: "system-ui, sans-serif" }}>
            <colgroup>
              {days.map((_, i) => <col key={i} style={{ width: `${100 / days.length}%` }} />)}
            </colgroup>
            <thead>
              <tr>
                {days.map((d) => (
                  <th key={d.day} style={{ border: "1px solid #ccc", padding: "4px 3px", background: "#009688", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: "8pt" }}>
                    {d.day} {d.isRestDay ? "(Ruhe)" : `— ${d.focus}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map((d) => (
                  <td key={d.day} style={{ border: "1px solid #ddd", padding: "3px 4px", verticalAlign: "top", background: d.isRestDay ? "#f9f9f9" : "#fff" }}>
                    {d.isRestDay ? (
                      <div style={{ textAlign: "center", color: "#999", fontStyle: "italic", padding: "8px 0" }}>Regeneration</div>
                    ) : (
                      <div>
                        {d.warmup && d.warmup.length > 0 && (
                          <div style={{ marginBottom: "3px" }}>
                            <div style={{ fontWeight: 700, fontSize: "6pt", color: "#009688", textTransform: "uppercase" }}>Warm-Up</div>
                            {d.warmup.map((w, i) => <div key={i} style={{ fontSize: "6.5pt", color: "#666" }}>{w}</div>)}
                          </div>
                        )}
                        {d.exercises && d.exercises.map((ex, i) => (
                          <div key={i} style={{ borderBottom: "0.5px solid #eee", padding: "1.5px 0" }}>
                            <div style={{ fontWeight: 600, fontSize: "7pt" }}>{ex.name}</div>
                            <div style={{ fontSize: "6.5pt", color: "#888" }}>{ex.sets}×{ex.reps} · {ex.restSeconds}s</div>
                          </div>
                        ))}
                        {d.estimatedMinutes ? (
                          <div style={{ fontSize: "6pt", color: "#999", marginTop: "2px", fontWeight: 600 }}>~{d.estimatedMinutes} min</div>
                        ) : null}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          {summary?.progressionPlan && (
            <div style={{ fontSize: "7pt", color: "#666", marginTop: "4px" }}>
              <strong>Progression:</strong> {summary.progressionPlan}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
