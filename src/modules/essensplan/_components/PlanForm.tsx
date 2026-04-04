import { useState } from "react";

// ── Types ──
export interface UserData {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  goal: "lose" | "maintain" | "gain";
  activityLevel: number;
  // Meal-specific
  diet: "omnivore" | "vegetarian" | "vegan";
  allergies: string[];
  mealsPerDay: number;
  cookingTime: number;
  budget: "cheap" | "medium" | "any";
  // Training-specific
  daysPerWeek: number;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  equipment: "gym" | "home" | "bodyweight" | "outdoor";
  sessionTime: number;
  focus: string[];
  // Honeypot
  _hp?: string;
}

export type PlanType = "meal" | "training" | "both";

interface PlanFormProps {
  defaultPlanType: "meal" | "training";
  onSubmit: (data: UserData, planType: PlanType) => void;
  isLoading: boolean;
}

const ACTIVITY_LEVELS = [
  { value: 1.2, label: "Kaum aktiv (sitzend, kein Sport)" },
  { value: 1.375, label: "Leicht aktiv (1-2x Sport/Woche)" },
  { value: 1.55, label: "Moderat aktiv (3-5x Sport/Woche)" },
  { value: 1.725, label: "Sehr aktiv (6-7x Sport/Woche)" },
  { value: 1.9, label: "Extrem aktiv (Leistungssport)" },
];

const GOALS = [
  { value: "lose" as const, label: "Abnehmen", desc: "Kaloriendefizit, hoher Proteinanteil" },
  { value: "maintain" as const, label: "Gewicht halten", desc: "Ausgewogene Makroverteilung" },
  { value: "gain" as const, label: "Muskelaufbau", desc: "Kalorienüberschuss, viele Kohlenhydrate" },
];

const DIETS = [
  { value: "omnivore" as const, label: "Omnivor", desc: "Alles erlaubt" },
  { value: "vegetarian" as const, label: "Vegetarisch", desc: "Kein Fleisch oder Fisch" },
  { value: "vegan" as const, label: "Vegan", desc: "Keine tierischen Produkte" },
];

const ALLERGY_OPTIONS = ["Laktose", "Gluten", "Nüsse", "Soja", "Ei", "Fructose"];

const EXPERIENCE_LEVELS = [
  { value: "beginner" as const, label: "Anfänger", desc: "Weniger als 6 Monate Training" },
  { value: "intermediate" as const, label: "Fortgeschritten", desc: "6 Monate bis 2 Jahre" },
  { value: "advanced" as const, label: "Profi", desc: "Über 2 Jahre regelmäßiges Training" },
];

const EQUIPMENT_OPTIONS = [
  { value: "gym" as const, label: "Fitnessstudio", desc: "Volle Ausstattung" },
  { value: "home" as const, label: "Home (Hanteln)", desc: "Kurz- & Langhanteln" },
  { value: "bodyweight" as const, label: "Bodyweight", desc: "Kein Equipment nötig" },
  { value: "outdoor" as const, label: "Outdoor", desc: "Park, Laufen, Calisthenics" },
];

const FOCUS_OPTIONS = ["Ganzkörper", "Oberkörper", "Unterkörper", "Core", "Ausdauer"];

export default function PlanForm({ defaultPlanType, onSubmit, isLoading }: PlanFormProps) {
  const [step, setStep] = useState(1);

  // Step 1: Basisdaten + Was generieren?
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("lose");
  const [activityLevel, setActivityLevel] = useState(1.55);
  const [includeMeal, setIncludeMeal] = useState(defaultPlanType === "meal");
  const [includeTraining, setIncludeTraining] = useState(defaultPlanType === "training");

  // Step 2: Präferenzen (nur was relevant ist)
  const [diet, setDiet] = useState<"omnivore" | "vegetarian" | "vegan">("omnivore");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [cookingTime, setCookingTime] = useState(30);
  const [budget, setBudget] = useState<"cheap" | "medium" | "any">("medium");

  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [equipment, setEquipment] = useState<"gym" | "home" | "bodyweight" | "outdoor">("gym");
  const [sessionTime, setSessionTime] = useState(60);
  const [focus, setFocus] = useState<string[]>(["Ganzkörper"]);

  // Honeypot
  const [hp, setHp] = useState("");

  const totalSteps = 3;

  const toggleAllergy = (a: string) => {
    setAllergies((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const toggleFocus = (f: string) => {
    setFocus((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const handleSubmit = () => {
    let planType: PlanType = "both";
    if (includeMeal && !includeTraining) planType = "meal";
    if (!includeMeal && includeTraining) planType = "training";

    onSubmit(
      {
        gender, age, height, weight, goal, activityLevel,
        diet, allergies, mealsPerDay, cookingTime, budget,
        daysPerWeek, experienceLevel, equipment, sessionTime, focus,
        _hp: hp || undefined,
      },
      planType,
    );
  };

  const canProceedStep1 = (includeMeal || includeTraining) && age >= 14 && age <= 100 && height >= 120 && weight >= 30;

  return (
    <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
      <div className="card-body">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s === step
                    ? "bg-primary text-primary-content"
                    : s < step
                      ? "bg-primary/20 text-primary"
                      : "bg-base-200 text-base-content/40"
                }`}
              >
                {s < step ? "\u2713" : s}
              </div>
              {s < totalSteps && (
                <div className={`w-8 h-0.5 ${s < step ? "bg-primary" : "bg-base-200"}`} />
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm opacity-60 mb-6">
          {step === 1 && "Schritt 1: Deine Daten & was du brauchst"}
          {step === 2 && "Schritt 2: Deine Präferenzen"}
          {step === 3 && "Schritt 3: Zusammenfassung & generieren"}
        </p>

        {/* ══════════════════════════════════════════════════════════════════
            Step 1: Basisdaten + Was generieren?
           ══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Was generieren? */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Was möchtest du generieren?</span></label>
              <div className="grid gap-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    includeMeal ? "border-primary bg-primary/5" : "border-base-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={includeMeal}
                    onChange={() => setIncludeMeal(!includeMeal)}
                  />
                  <div>
                    <span className="font-medium">Essensplan</span>
                    <p className="text-xs opacity-70">7-Tage-Ernährungsplan mit Rezepten und Makros</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    includeTraining ? "border-primary bg-primary/5" : "border-base-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={includeTraining}
                    onChange={() => setIncludeTraining(!includeTraining)}
                  />
                  <div>
                    <span className="font-medium">Trainingsplan</span>
                    <p className="text-xs opacity-70">Wochenplan mit Übungen, Sätzen und Pausen</p>
                  </div>
                </label>
              </div>
              {!includeMeal && !includeTraining && (
                <p className="text-xs text-error mt-1">Wähle mindestens eine Option</p>
              )}
            </div>

            {/* Ziel */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Dein Ziel</span></label>
              <div className="grid gap-2">
                {GOALS.map((g) => (
                  <label
                    key={g.value}
                    className={`label cursor-pointer p-3 rounded-lg border transition-colors ${
                      goal === g.value ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="goal"
                        className="radio radio-primary"
                        checked={goal === g.value}
                        onChange={() => setGoal(g.value)}
                      />
                      <div>
                        <span className="font-medium">{g.label}</span>
                        <p className="text-xs opacity-70">{g.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Geschlecht */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Geschlecht</span></label>
              <div className="flex gap-4">
                {(["male", "female"] as const).map((g) => (
                  <label key={g} className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="gender"
                      className="radio radio-primary"
                      checked={gender === g}
                      onChange={() => setGender(g)}
                    />
                    <span className="label-text">{g === "male" ? "Männlich" : "Weiblich"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Alter, Größe, Gewicht */}
            <div className="grid grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Alter</span></label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={14} max={100}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Größe (cm)</span></label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={120} max={250}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Gewicht (kg)</span></label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min={30} max={300}
                />
              </div>
            </div>

            {/* Aktivitätslevel */}
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Aktivitätslevel</span></label>
              <select
                className="select select-bordered w-full"
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value))}
              >
                {ACTIVITY_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            Step 2: Präferenzen — nur was der User in Step 1 gewählt hat
           ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Essensplan Preferences */}
            {includeMeal && (
              <div>
                <h3 className="font-bold text-lg mb-3">Essensplan-Präferenzen</h3>
                <div className="space-y-4">
                  {/* Ernährungsform */}
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Ernährungsform</span></label>
                    <div className="grid gap-2">
                      {DIETS.map((d) => (
                        <label
                          key={d.value}
                          className={`label cursor-pointer p-3 rounded-lg border transition-colors ${
                            diet === d.value ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="diet"
                              className="radio radio-primary"
                              checked={diet === d.value}
                              onChange={() => setDiet(d.value)}
                            />
                            <div>
                              <span className="font-medium">{d.label}</span>
                              <p className="text-xs opacity-70">{d.desc}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Allergien */}
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Allergien / Unverträglichkeiten</span></label>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGY_OPTIONS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={`btn btn-sm ${allergies.includes(a) ? "btn-primary" : "btn-outline"}`}
                          onClick={() => toggleAllergy(a)}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mahlzeiten pro Tag */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Mahlzeiten pro Tag</span>
                      <span className="label-text-alt">{mealsPerDay}</span>
                    </label>
                    <div className="flex gap-3">
                      {[3, 4, 5].map((n) => (
                        <label
                          key={n}
                          className={`flex-1 text-center p-2 rounded-lg border cursor-pointer transition-colors ${
                            mealsPerDay === n ? "border-primary bg-primary/10 font-bold" : "border-base-300"
                          }`}
                        >
                          <input type="radio" name="mealsPerDay" className="hidden" checked={mealsPerDay === n} onChange={() => setMealsPerDay(n)} />
                          {n}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Kochzeit */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Max. Kochzeit pro Mahlzeit</span>
                      <span className="label-text-alt">{cookingTime} min</span>
                    </label>
                    <div className="flex gap-2">
                      {[15, 30, 45, 60].map((t) => (
                        <label
                          key={t}
                          className={`flex-1 text-center p-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                            cookingTime === t ? "border-primary bg-primary/10 font-bold" : "border-base-300"
                          }`}
                        >
                          <input type="radio" name="cookingTime" className="hidden" checked={cookingTime === t} onChange={() => setCookingTime(t)} />
                          {t === 60 ? "60+" : t} min
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Budget</span></label>
                    <div className="flex gap-2">
                      {([
                        { value: "cheap" as const, label: "Günstig" },
                        { value: "medium" as const, label: "Mittel" },
                        { value: "any" as const, label: "Egal" },
                      ]).map((b) => (
                        <label
                          key={b.value}
                          className={`flex-1 text-center p-2 rounded-lg border cursor-pointer transition-colors ${
                            budget === b.value ? "border-primary bg-primary/10 font-bold" : "border-base-300"
                          }`}
                        >
                          <input type="radio" name="budget" className="hidden" checked={budget === b.value} onChange={() => setBudget(b.value)} />
                          {b.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Divider if both */}
            {includeMeal && includeTraining && (
              <div className="divider">Trainingsplan</div>
            )}

            {/* Trainingsplan Preferences */}
            {includeTraining && (
              <div>
                <h3 className="font-bold text-lg mb-3">Trainingsplan-Präferenzen</h3>
                <div className="space-y-4">
                  {/* Erfahrungslevel */}
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Erfahrungslevel</span></label>
                    <div className="grid gap-2">
                      {EXPERIENCE_LEVELS.map((l) => (
                        <label
                          key={l.value}
                          className={`label cursor-pointer p-3 rounded-lg border transition-colors ${
                            experienceLevel === l.value ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="experienceLevel"
                              className="radio radio-primary"
                              checked={experienceLevel === l.value}
                              onChange={() => setExperienceLevel(l.value)}
                            />
                            <div>
                              <span className="font-medium">{l.label}</span>
                              <p className="text-xs opacity-70">{l.desc}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Equipment</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {EQUIPMENT_OPTIONS.map((e) => (
                        <label
                          key={e.value}
                          className={`label cursor-pointer p-3 rounded-lg border transition-colors ${
                            equipment === e.value ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="equipment"
                              className="radio radio-primary radio-sm"
                              checked={equipment === e.value}
                              onChange={() => setEquipment(e.value)}
                            />
                            <div>
                              <span className="font-medium text-sm">{e.label}</span>
                              <p className="text-xs opacity-70">{e.desc}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Trainingstage */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Trainingstage pro Woche</span>
                      <span className="label-text-alt font-bold text-primary">{daysPerWeek} Tage</span>
                    </label>
                    <input
                      type="range"
                      min={2} max={6}
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                      className="range range-primary"
                      step={1}
                    />
                    <div className="flex justify-between text-xs opacity-60 px-1 mt-1">
                      {[2, 3, 4, 5, 6].map((n) => <span key={n}>{n}</span>)}
                    </div>
                  </div>

                  {/* Session Time */}
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Zeit pro Session</span></label>
                    <div className="flex gap-2">
                      {[30, 45, 60, 90].map((t) => (
                        <label
                          key={t}
                          className={`flex-1 text-center p-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                            sessionTime === t ? "border-primary bg-primary/10 font-bold" : "border-base-300"
                          }`}
                        >
                          <input type="radio" name="sessionTime" className="hidden" checked={sessionTime === t} onChange={() => setSessionTime(t)} />
                          {t} min
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Fokus */}
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Fokus (optional)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {FOCUS_OPTIONS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`btn btn-sm ${focus.includes(f) ? "btn-primary" : "btn-outline"}`}
                          onClick={() => toggleFocus(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            Step 3: Zusammenfassung + Generieren
           ══════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-center">Alles korrekt?</h3>

            <div className="bg-base-200 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="opacity-60">Generieren</span>
                <span className="font-semibold">
                  {includeMeal && includeTraining ? "Essensplan + Trainingsplan" : includeMeal ? "Essensplan" : "Trainingsplan"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Ziel</span>
                <span className="font-semibold">{GOALS.find((g) => g.value === goal)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Profil</span>
                <span>{gender === "male" ? "Männlich" : "Weiblich"}, {age} J., {height} cm, {weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Aktivität</span>
                <span>{ACTIVITY_LEVELS.find((l) => l.value === activityLevel)?.label}</span>
              </div>

              {includeMeal && (
                <>
                  <div className="divider my-1 text-xs opacity-40">Essensplan</div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Ernährung</span>
                    <span>{DIETS.find((d) => d.value === diet)?.label}</span>
                  </div>
                  {allergies.length > 0 && (
                    <div className="flex justify-between">
                      <span className="opacity-60">Allergien</span>
                      <span>{allergies.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="opacity-60">Mahlzeiten / Kochzeit</span>
                    <span>{mealsPerDay}x / max. {cookingTime} min</span>
                  </div>
                </>
              )}

              {includeTraining && (
                <>
                  <div className="divider my-1 text-xs opacity-40">Trainingsplan</div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Level</span>
                    <span>{EXPERIENCE_LEVELS.find((l) => l.value === experienceLevel)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Equipment</span>
                    <span>{EQUIPMENT_OPTIONS.find((e) => e.value === equipment)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Frequenz / Session</span>
                    <span>{daysPerWeek}x/Woche, {sessionTime} min</span>
                  </div>
                </>
              )}
            </div>

            {/* Honeypot — hidden from humans */}
            <input
              type="text"
              name="website"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
            >
              Zurück
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !canProceedStep1}
            >
              Weiter
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg gap-2"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              )}
              Plan generieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
