import { useState } from "react";
import AppBanner from "@components/appBanner";
import Footer from "@components/footer";
import Navbar from "@components/navbar";
import { ConfigContext } from "utils/configContext";
import type { TemplateConfig } from "utils/configType";

interface Props {
  config: TemplateConfig;
}

interface ProteinResult {
  minimum: number;
  optimal: number;
  maximum: number;
  perMeal: number;
  mealsPerDay: number;
  perKg: number;
}

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";
type Goal = "maintain" | "muscle" | "weightloss" | "endurance";
type Gender = "male" | "female";
type LifeStage = "normal" | "pregnant_early" | "pregnant_late" | "breastfeeding";
type Diet = "mixed" | "vegetarian" | "vegan";

function ProteinBedarfRechnerPage({ config }: Props) {
  const [weight, setWeight] = useState(75);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>("male");
  const [lifeStage, setLifeStage] = useState<LifeStage>("normal");
  const [diet, setDiet] = useState<Diet>("mixed");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [result, setResult] = useState<ProteinResult | null>(null);

  const activityMultipliers: Record<ActivityLevel, { min: number; max: number; label: string; desc: string }> = {
    sedentary: { min: 0.8, max: 1.0, label: "Wenig aktiv", desc: "Bürojob, kaum Sport" },
    light: { min: 1.0, max: 1.2, label: "Leicht aktiv", desc: "1-2x Sport pro Woche" },
    moderate: { min: 1.2, max: 1.4, label: "Mässig aktiv", desc: "3-4x Sport pro Woche" },
    active: { min: 1.4, max: 1.8, label: "Sehr aktiv", desc: "5-6x Sport pro Woche" },
    athlete: { min: 1.8, max: 2.2, label: "Athlet", desc: "Tägliches intensives Training" },
  };

  const goalMultipliers: Record<Goal, { factor: number; label: string; desc: string }> = {
    maintain: { factor: 1.0, label: "Gewicht halten", desc: "Allgemeine Gesundheit" },
    muscle: { factor: 1.15, label: "Muskelaufbau", desc: "Mehr Muskeln aufbauen" },
    weightloss: { factor: 1.1, label: "Abnehmen", desc: "Muskeln erhalten beim Abnehmen" },
    endurance: { factor: 1.05, label: "Ausdauer", desc: "Ausdauersport (Laufen, Radfahren)" },
  };

  const calculateProtein = () => {
    let activity = activityMultipliers[activityLevel];
    let goalFactor = goalMultipliers[goal].factor;
    
    // Age adjustments - seniors need more protein (DGE recommendation)
    let ageFactor = 1.0;
    if (age >= 65) {
      ageFactor = 1.2; // 20% more for seniors
    } else if (age >= 55) {
      ageFactor = 1.1;
    }
    
    // Life stage adjustments (pregnancy/breastfeeding)
    let lifeStageFactor = 1.0;
    if (lifeStage === "pregnant_early") {
      lifeStageFactor = 1.1; // +10g/day approx
    } else if (lifeStage === "pregnant_late") {
      lifeStageFactor = 1.3; // Higher in 3rd trimester
    } else if (lifeStage === "breastfeeding") {
      lifeStageFactor = 1.4; // Highest during breastfeeding
    }
    
    // Diet adjustments - plant proteins are less bioavailable
    let dietFactor = 1.0;
    if (diet === "vegetarian") {
      dietFactor = 1.05;
    } else if (diet === "vegan") {
      dietFactor = 1.1; // 10% more for vegans
    }

    const minimum = Math.round(weight * activity.min * ageFactor * lifeStageFactor * dietFactor);
    const maximum = Math.round(weight * activity.max * goalFactor * ageFactor * lifeStageFactor * dietFactor);
    const optimal = Math.round((minimum + maximum) / 2);

    // Optimal protein per meal: 25-40g, assuming 3-4 meals
    const mealsPerDay = optimal > 120 ? 4 : 3;
    const perMeal = Math.round(optimal / mealsPerDay);
    const perKg = Math.round((optimal / weight) * 10) / 10;

    setResult({
      minimum,
      optimal,
      maximum,
      perMeal,
      mealsPerDay,
      perKg,
    });
  };

  const proteinSources = [
    // Fleisch & Geflügel
    { name: "Hähnchenbrust (gekocht)", protein: 31, kcal: 165, serving: "100g", type: "tierisch" },
    { name: "Putenbrust", protein: 29, kcal: 135, serving: "100g", type: "tierisch" },
    { name: "Rinderfilet (mager)", protein: 28, kcal: 175, serving: "100g", type: "tierisch" },
    { name: "Schweinefilet", protein: 27, kcal: 145, serving: "100g", type: "tierisch" },
    { name: "Hackfleisch (mager)", protein: 21, kcal: 175, serving: "100g", type: "tierisch" },
    // Fisch & Meeresfrüchte
    { name: "Lachs", protein: 25, kcal: 208, serving: "100g", type: "tierisch" },
    { name: "Thunfisch (Dose, in Wasser)", protein: 26, kcal: 116, serving: "100g", type: "tierisch" },
    { name: "Garnelen", protein: 24, kcal: 99, serving: "100g", type: "tierisch" },
    { name: "Forelle", protein: 23, kcal: 119, serving: "100g", type: "tierisch" },
    // Milchprodukte
    { name: "Magerquark", protein: 12, kcal: 67, serving: "100g", type: "tierisch" },
    { name: "Skyr", protein: 11, kcal: 63, serving: "100g", type: "tierisch" },
    { name: "Griechischer Joghurt", protein: 10, kcal: 97, serving: "100g", type: "tierisch" },
    { name: "Hüttenkäse", protein: 11, kcal: 72, serving: "100g", type: "tierisch" },
    { name: "Harzer Käse", protein: 30, kcal: 125, serving: "100g", type: "tierisch" },
    { name: "Parmesan", protein: 35, kcal: 392, serving: "100g", type: "tierisch" },
    { name: "Eier", protein: 13, kcal: 155, serving: "2 Stück", type: "tierisch" },
    // Pflanzliche Quellen
    { name: "Seitan", protein: 75, kcal: 370, serving: "100g", type: "pflanzlich" },
    { name: "Tofu", protein: 15, kcal: 144, serving: "100g", type: "pflanzlich" },
    { name: "Tempeh", protein: 19, kcal: 192, serving: "100g", type: "pflanzlich" },
    { name: "Edamame", protein: 11, kcal: 122, serving: "100g", type: "pflanzlich" },
    { name: "Linsen (gekocht)", protein: 9, kcal: 116, serving: "100g", type: "pflanzlich" },
    { name: "Kichererbsen (gekocht)", protein: 8, kcal: 164, serving: "100g", type: "pflanzlich" },
    { name: "Schwarze Bohnen (gekocht)", protein: 9, kcal: 132, serving: "100g", type: "pflanzlich" },
    { name: "Kürbiskerne", protein: 30, kcal: 559, serving: "100g", type: "pflanzlich" },
    { name: "Hanfsamen", protein: 31, kcal: 553, serving: "100g", type: "pflanzlich" },
    { name: "Erdnüsse", protein: 26, kcal: 567, serving: "100g", type: "pflanzlich" },
    { name: "Mandeln", protein: 21, kcal: 579, serving: "100g", type: "pflanzlich" },
    { name: "Haferflocken", protein: 13, kcal: 379, serving: "100g", type: "pflanzlich" },
  ];
  
  // Top Proteinquellen nach Protein pro 100 kcal (für Featured Snippets)
  const proteinPerCalorie = proteinSources
    .map(s => ({ ...s, proteinPer100kcal: Math.round((s.protein / s.kcal) * 100 * 10) / 10 }))
    .sort((a, b) => b.proteinPer100kcal - a.proteinPer100kcal)
    .slice(0, 10);

  const exampleMealPlan = [
    { meal: "Frühstück", foods: "150g Magerquark + 30g Haferflocken + Beeren", protein: 22 },
    { meal: "Snack", foods: "2 gekochte Eier", protein: 13 },
    { meal: "Mittagessen", foods: "150g Hähnchenbrust + Reis + Gemüse", protein: 46 },
    { meal: "Nachmittag", foods: "200g Griechischer Joghurt", protein: 20 },
    { meal: "Abendessen", foods: "150g Lachs + Kartoffeln + Salat", protein: 38 },
  ];

  const totalMealPlanProtein = exampleMealPlan.reduce((acc, meal) => acc + meal.protein, 0);

  // Verschiedene Beispiel-Tage für unterschiedliche Zielgruppen
  const mealPlanExamples = {
    muskelaufbau: {
      title: "Muskelaufbau (180g Protein)",
      icon: "💪",
      weight: "80kg Sportler",
      meals: [
        { meal: "Frühstück", foods: "4 Eier Rührei + 2 Scheiben Vollkornbrot + Käse", protein: 35 },
        { meal: "Post-Workout", foods: "Protein-Shake (30g Whey) + Banane", protein: 30 },
        { meal: "Mittagessen", foods: "200g Hähnchenbrust + 200g Reis + Brokkoli", protein: 62 },
        { meal: "Snack", foods: "250g Magerquark + Früchte", protein: 30 },
        { meal: "Abendessen", foods: "200g Rinderfilet + Süsskartoffel + Salat", protein: 56 },
      ],
    },
    abnehmen: {
      title: "Abnehmen (120g Protein)",
      icon: "⚖️",
      weight: "70kg, Kaloriendefizit",
      meals: [
        { meal: "Frühstück", foods: "200g Skyr + 30g Haferflocken + Beeren", protein: 25 },
        { meal: "Mittagessen", foods: "150g Putenbrust + grosser Salat + Olivenöl", protein: 44 },
        { meal: "Snack", foods: "100g Harzer Käse + Gurke", protein: 30 },
        { meal: "Abendessen", foods: "150g Garnelen + Zucchini-Nudeln + Tomaten", protein: 36 },
      ],
    },
    vegan: {
      title: "Vegan (110g Protein)",
      icon: "🌱",
      weight: "65kg Veganer",
      meals: [
        { meal: "Frühstück", foods: "Tofu-Scramble (150g) + Vollkornbrot + Hummus", protein: 26 },
        { meal: "Mittagessen", foods: "150g Tempeh + Quinoa + Edamame", protein: 38 },
        { meal: "Snack", foods: "Handvoll Kürbiskerne + Sojajoghurt", protein: 18 },
        { meal: "Abendessen", foods: "Linsen-Curry (200g Linsen) + Reis", protein: 24 },
      ],
    },
  };

  return (
    <ConfigContext.Provider value={config}>
      <main>
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-screen-lg mx-auto py-8 px-4 md:py-16">
          <header className="text-center mb-12">
            <span className="badge badge-primary badge-lg mb-4">Kostenloser Rechner</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Proteinbedarf berechnen: So viel Eiweiss brauchst du wirklich
            </h1>
            <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              Berechne deinen optimalen täglichen Proteinbedarf – individuell angepasst an Alter, Aktivität, Ziele und Ernährungsweise. Wissenschaftlich fundiert nach aktuellen Empfehlungen.
            </p>
          </header>

          {/* Quick Summary Box */}
          <div className="bg-primary/10 rounded-2xl p-6 max-w-2xl mx-auto mb-12">
            <h2 className="text-lg font-bold mb-4">⚡ Das Wichtigste in Kürze</h2>
            <ul className="space-y-2 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Minimum:</strong> 0,8g Protein pro kg Körpergewicht (DGE-Empfehlung)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Sportler:</strong> 1,6-2,2g pro kg für Muskelaufbau & Regeneration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Verteilung:</strong> 25-40g pro Mahlzeit optimal für Muskelproteinsynthese</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Senioren (65+):</strong> Erhöhter Bedarf von 1,0-1,2g/kg empfohlen</span>
              </li>
            </ul>
          </div>

          {/* Quick Reference Table - Featured Snippet Target */}
          <div className="overflow-x-auto max-w-3xl mx-auto mb-12">
            <h2 className="text-xl font-bold text-center mb-4">📊 Wie viel Protein am Tag? Schnellübersicht</h2>
            <table className="table bg-base-100 shadow-xl text-center">
              <thead>
                <tr className="bg-primary/10">
                  <th>Körpergewicht</th>
                  <th>Minimum (0,8g/kg)</th>
                  <th>Muskelaufbau (1,8g/kg)</th>
                  <th>Abnehmen (2,0g/kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">50 kg</td>
                  <td>40g</td>
                  <td className="text-success font-medium">90g</td>
                  <td className="text-warning font-medium">100g</td>
                </tr>
                <tr>
                  <td className="font-semibold">60 kg</td>
                  <td>48g</td>
                  <td className="text-success font-medium">108g</td>
                  <td className="text-warning font-medium">120g</td>
                </tr>
                <tr>
                  <td className="font-semibold">70 kg</td>
                  <td>56g</td>
                  <td className="text-success font-medium">126g</td>
                  <td className="text-warning font-medium">140g</td>
                </tr>
                <tr>
                  <td className="font-semibold">80 kg</td>
                  <td>64g</td>
                  <td className="text-success font-medium">144g</td>
                  <td className="text-warning font-medium">160g</td>
                </tr>
                <tr>
                  <td className="font-semibold">90 kg</td>
                  <td>72g</td>
                  <td className="text-success font-medium">162g</td>
                  <td className="text-warning font-medium">180g</td>
                </tr>
                <tr>
                  <td className="font-semibold">100 kg</td>
                  <td>80g</td>
                  <td className="text-success font-medium">180g</td>
                  <td className="text-warning font-medium">200g</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-center opacity-70 mt-3">
              Für eine individuelle Berechnung mit allen Faktoren nutze unseren <a href="#rechner" className="link link-primary">Protein-Rechner oben</a>.
            </p>
          </div>

          {/* Calculator */}
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto" id="rechner">
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-2xl mb-8">🧮 Proteinbedarf Rechner</h2>

              {/* Basic Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Gender */}
                <div>
                  <span className="text-lg font-semibold block mb-3">Geschlecht</span>
                  <div className="flex gap-2">
                    <button
                      className={`btn flex-1 ${gender === "male" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => { setGender("male"); setLifeStage("normal"); }}
                    >
                      👨 Männlich
                    </button>
                    <button
                      className={`btn flex-1 ${gender === "female" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setGender("female")}
                    >
                      👩 Weiblich
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold">Alter</span>
                    <span className="text-2xl font-bold text-primary">{age} Jahre</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="range range-primary"
                  />
                  <div className="flex justify-between text-xs px-1 mt-1 opacity-50">
                    <span>16</span>
                    <span>30</span>
                    <span>50</span>
                    <span>65</span>
                    <span>90</span>
                  </div>
                  {age >= 65 && (
                    <p className="text-sm text-info mt-2">
                      💡 Ab 65 Jahren empfiehlt die DGE einen erhöhten Proteinbedarf
                    </p>
                  )}
                </div>
              </div>

              {/* Life Stage (Women only) */}
              {gender === "female" && (
                <div className="mb-8">
                  <span className="text-lg font-semibold block mb-3">Lebensphase</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { key: "normal", label: "Normal", icon: "👩" },
                      { key: "pregnant_early", label: "Schwanger (1.-2. Trim.)", icon: "🤰" },
                      { key: "pregnant_late", label: "Schwanger (3. Trim.)", icon: "🤱" },
                      { key: "breastfeeding", label: "Stillend", icon: "🍼" },
                    ].map((stage) => (
                      <button
                        key={stage.key}
                        className={`btn btn-sm h-auto py-3 ${lifeStage === stage.key ? "btn-primary" : "btn-outline"}`}
                        onClick={() => setLifeStage(stage.key as LifeStage)}
                      >
                        <span className="text-lg">{stage.icon}</span>
                        <span className="text-xs">{stage.label}</span>
                      </button>
                    ))}
                  </div>
                  {lifeStage !== "normal" && (
                    <p className="text-sm text-info mt-2">
                      💡 In Schwangerschaft und Stillzeit ist der Proteinbedarf deutlich erhöht
                    </p>
                  )}
                </div>
              )}

              {/* Weight - Prominent Display */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">Körpergewicht</span>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="40"
                      max="180"
                      value={weight}
                      onChange={(e) => setWeight(Math.min(180, Math.max(40, Number(e.target.value))))}
                      className="input input-bordered input-lg w-24 text-center text-3xl font-bold text-primary"
                    />
                    <span className="text-xl font-medium opacity-70">kg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="range range-primary range-lg"
                />
                <div className="flex justify-between text-sm px-1 mt-2 opacity-50">
                  <span>40</span>
                  <span>80</span>
                  <span>120</span>
                  <span>160</span>
                  <span>180</span>
                </div>
              </div>

              {/* Diet */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-3">Ernährungsweise</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "mixed", label: "Mischkost", icon: "🥩🥗", desc: "Tierisch & pflanzlich" },
                    { key: "vegetarian", label: "Vegetarisch", icon: "🥚🧀", desc: "Mit Eiern & Milch" },
                    { key: "vegan", label: "Vegan", icon: "🌱", desc: "Rein pflanzlich" },
                  ].map((d) => (
                    <label
                      key={d.key}
                      className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                        diet === d.key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="diet"
                        className="radio radio-primary mb-2"
                        checked={diet === d.key}
                        onChange={() => setDiet(d.key as Diet)}
                      />
                      <span className="text-2xl">{d.icon}</span>
                      <span className="font-medium text-sm mt-1">{d.label}</span>
                      <span className="text-xs opacity-60">{d.desc}</span>
                    </label>
                  ))}
                </div>
                {diet === "vegan" && (
                  <p className="text-sm text-info mt-2">
                    💡 Bei veganer Ernährung wird +10% empfohlen, da pflanzliches Protein weniger bioverfügbar ist
                  </p>
                )}
              </div>

              {/* Activity Level */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Aktivitätslevel</span>
                <div className="grid gap-2">
                  {Object.entries(activityMultipliers).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        activityLevel === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="activity"
                        className="radio radio-primary"
                        checked={activityLevel === key}
                        onChange={() => setActivityLevel(key as ActivityLevel)}
                      />
                      <div className="flex-1">
                        <span className="font-medium">{value.label}</span>
                        <span className="text-sm opacity-70 ml-2">({value.desc})</span>
                      </div>
                      <span className="badge badge-outline">{value.min}-{value.max}g/kg</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div className="mb-8">
                <span className="text-lg font-semibold block mb-4">Dein Ziel</span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(goalMultipliers).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all text-center ${
                        goal === key
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-base-200 border-2 border-transparent hover:border-base-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        className="radio radio-primary mb-2"
                        checked={goal === key}
                        onChange={() => setGoal(key as Goal)}
                      />
                      <span className="font-medium">{value.label}</span>
                      <span className="text-xs opacity-70">{value.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full text-lg" onClick={calculateProtein}>
                🎯 Proteinbedarf berechnen
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 space-y-4">
                  <div className="divider">Dein persönliches Ergebnis</div>

                  <div className="text-center py-6">
                    <div className="text-6xl font-bold text-primary">
                      {result.optimal}g
                    </div>
                    <div className="text-xl font-semibold mt-2 opacity-80">
                      optimaler Proteinbedarf pro Tag
                    </div>
                    <div className="text-lg mt-2">
                      = <strong className="text-secondary">{result.perKg}g</strong> pro kg Körpergewicht
                    </div>
                  </div>

                  {/* Protein Range Visualization */}
                  <div className="relative h-12 rounded-full overflow-hidden bg-base-200">
                    <div 
                      className="absolute top-0 bottom-0 bg-primary/30"
                      style={{ 
                        left: `${(result.minimum / (result.maximum * 1.2)) * 100}%`,
                        right: `${100 - (result.maximum / (result.maximum * 1.2)) * 100}%`
                      }}
                    ></div>
                    <div 
                      className="absolute top-0 bottom-0 w-2 bg-primary rounded-full"
                      style={{ 
                        left: `${(result.optimal / (result.maximum * 1.2)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Min: <strong>{result.minimum}g</strong></span>
                    <span>Optimal: <strong className="text-primary">{result.optimal}g</strong></span>
                    <span>Max: <strong>{result.maximum}g</strong></span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Pro Mahlzeit</h3>
                        <p className="text-2xl font-bold text-primary">{result.perMeal}g</p>
                        <p className="text-xs opacity-60">bei {result.mealsPerDay} Mahlzeiten</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Pro kg Körpergewicht</h3>
                        <p className="text-2xl font-bold text-secondary">{result.perKg}g</p>
                        <p className="text-xs opacity-60">Protein pro kg</p>
                      </div>
                    </div>
                    <div className="card bg-base-200">
                      <div className="card-body py-4 text-center">
                        <h3 className="text-sm opacity-70">Kalorien aus Protein</h3>
                        <p className="text-2xl font-bold">{result.optimal * 4}</p>
                        <p className="text-xs opacity-60">kcal (4 kcal pro g)</p>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-success mt-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold">Tracke dein Protein mit Mahlzait!</p>
                      <p className="text-sm">
                        Fotografiere deine Mahlzeiten und sieh sofort den Proteingehalt. Erreiche deine {result.optimal}g täglich – einfacher geht's nicht.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* What is Protein Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Was ist Protein und warum ist es so wichtig?
            </h2>
            
            <div className="prose prose-lg max-w-3xl mx-auto">
              <p>
                <strong>Proteine (Eiweisse)</strong> sind neben Kohlenhydraten und Fetten einer der drei <a href="/makros-berechnen" className="link link-primary">Makronährstoffe</a>, die dein Körper in grossen Mengen benötigt. Sie bestehen aus Aminosäuren – den Bausteinen des Lebens – und sind an nahezu jedem Prozess in deinem Körper beteiligt.
              </p>
              
              <p>
                Protein hat auch einen hohen <strong>thermischen Effekt</strong>: Dein Körper verbraucht etwa 20-30% der Protein-Kalorien allein für die Verdauung – weit mehr als bei Kohlenhydraten (5-10%) oder Fett (0-3%). Das macht Protein besonders wertvoll beim <a href="/kaloriendefizit-berechnen" className="link link-primary">Abnehmen mit Kaloriendefizit</a>.
              </p>
              
              <p>
                Dein Körper nutzt Protein für:
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8 max-w-5xl mx-auto">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center">
                  <span className="text-4xl mb-2">💪</span>
                  <h3 className="font-bold">Muskeln</h3>
                  <p className="text-sm opacity-80">Aufbau, Reparatur und Erhalt von Muskelgewebe</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center">
                  <span className="text-4xl mb-2">🧬</span>
                  <h3 className="font-bold">Zellen</h3>
                  <p className="text-sm opacity-80">Bestandteil jeder einzelnen Körperzelle</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center">
                  <span className="text-4xl mb-2">🛡️</span>
                  <h3 className="font-bold">Immunsystem</h3>
                  <p className="text-sm opacity-80">Antikörper zur Abwehr von Krankheiten</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center">
                  <span className="text-4xl mb-2">⚡</span>
                  <h3 className="font-bold">Enzyme & Hormone</h3>
                  <p className="text-sm opacity-80">Steuerung von Stoffwechselprozessen</p>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-3xl mx-auto mt-8">
              <h3>Die 9 essentiellen Aminosäuren</h3>
              <p>
                Von den 21 Aminosäuren, die Proteine bilden, sind 9 <strong>essentiell</strong> – dein Körper kann sie nicht selbst herstellen und muss sie über die Nahrung aufnehmen:
              </p>
              <ul className="grid grid-cols-3 gap-2 list-none p-0">
                {["Leucin", "Isoleucin", "Valin", "Lysin", "Methionin", "Phenylalanin", "Threonin", "Tryptophan", "Histidin"].map((aa) => (
                  <li key={aa} className="badge badge-outline badge-lg">{aa}</li>
                ))}
              </ul>
              <p className="mt-4">
                <strong>Leucin</strong> ist besonders wichtig für den Muskelaufbau – es aktiviert die Muskelproteinsynthese (mTOR-Signalweg). Etwa 2-3g Leucin pro Mahlzeit gelten als optimal.
              </p>
            </div>
          </div>
        </section>

        {/* How Calculation Works */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Wie wird der Proteinbedarf berechnet?
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <div className="overflow-x-auto mb-8">
                <table className="table bg-base-100 shadow-xl">
                  <thead>
                    <tr>
                      <th>Personengruppe</th>
                      <th>Empfehlung (g/kg/Tag)</th>
                      <th>Quelle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Erwachsene (19-64 Jahre)</td>
                      <td><span className="badge badge-primary">0,8g</span></td>
                      <td>DGE 2024</td>
                    </tr>
                    <tr>
                      <td>Senioren (65+ Jahre)</td>
                      <td><span className="badge badge-secondary">1,0-1,2g</span></td>
                      <td>DGE 2024</td>
                    </tr>
                    <tr>
                      <td>Schwangere (ab 4. Monat)</td>
                      <td><span className="badge badge-accent">1,1g</span> + 10-30g extra</td>
                      <td>DACH Referenzwerte</td>
                    </tr>
                    <tr>
                      <td>Stillende</td>
                      <td><span className="badge badge-accent">1,3g</span></td>
                      <td>DACH Referenzwerte</td>
                    </tr>
                    <tr>
                      <td>Freizeitsportler</td>
                      <td><span className="badge badge-info">1,2-1,4g</span></td>
                      <td>ISSN Position Stand</td>
                    </tr>
                    <tr>
                      <td>Kraftsportler/Muskelaufbau</td>
                      <td><span className="badge badge-success">1,6-2,2g</span></td>
                      <td>Meta-Analyse Morton 2018</td>
                    </tr>
                    <tr>
                      <td>Abnehmen (Kaloriendefizit)</td>
                      <td><span className="badge badge-warning">1,6-2,4g</span></td>
                      <td>Helms et al. 2014</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h4 className="font-bold">Die 0,8g-Empfehlung ist ein Minimum!</h4>
                  <p className="text-sm">
                    Die DGE-Empfehlung von 0,8g/kg deckt den <em>Mindestbedarf</em> zur Vermeidung von Mangelerscheinungen. 
                    Für optimale Gesundheit, Muskelerhalt und besonders bei Sport empfehlen aktuelle Studien deutlich höhere Mengen.
                    Berechne auch deinen <a href="/kalorienbedarf-berechnen" className="link link-primary">Kalorienbedarf</a> und <a href="/grundumsatz-rechner" className="link link-primary">Grundumsatz</a>, um deine Ernährung optimal zu planen.
                  </p>
                </div>
              </div>

              <div className="prose prose-lg mt-8">
                <h3>Die Berechnung in unserem Rechner</h3>
                <p>
                  Unser Protein-Rechner verwendet folgende Formel:
                </p>
                <div className="bg-base-200 p-4 rounded-lg font-mono text-center">
                  Proteinbedarf = Gewicht (kg) × Basis-Faktor × Alters-Faktor × Ziel-Faktor × Ernährungs-Faktor
                </div>
                <p className="mt-4">
                  Der <strong>Basis-Faktor</strong> richtet sich nach deinem Aktivitätslevel (0,8 - 2,2 g/kg). 
                  Der <strong>Alters-Faktor</strong> erhöht den Bedarf ab 55 Jahren schrittweise, da ältere Menschen mehr Protein für den Muskelerhalt benötigen.
                  Bei <strong>veganer Ernährung</strong> wird +10% aufgeschlagen, um die geringere Bioverfügbarkeit pflanzlicher Proteine auszugleichen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Protein per Calorie - Featured Snippet Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              🏆 Top 10: Meistes Protein pro 100 Kalorien
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">
              Wenn du abnehmen willst, zählt nicht nur die Proteinmenge – sondern wie viel Protein du pro Kalorie bekommst. 
              Diese Lebensmittel liefern am meisten Protein für die wenigsten Kalorien:
            </p>
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="table bg-base-100 shadow-xl">
                <thead>
                  <tr className="bg-primary text-primary-content">
                    <th>Rang</th>
                    <th>Lebensmittel</th>
                    <th>Protein pro 100 kcal</th>
                    <th>Protein/100g</th>
                  </tr>
                </thead>
                <tbody>
                  {proteinPerCalorie.map((source, i) => (
                    <tr key={i} className={i < 3 ? "font-bold" : ""}>
                      <td>
                        {i === 0 && "🥇"}
                        {i === 1 && "🥈"}
                        {i === 2 && "🥉"}
                        {i > 2 && `${i + 1}.`}
                      </td>
                      <td>{source.name}</td>
                      <td>
                        <span className="badge badge-success badge-lg">{source.proteinPer100kcal}g</span>
                      </td>
                      <td>{source.protein}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm opacity-70 mt-4">
              <strong>Tipp:</strong> Beim <a href="/kaloriendefizit-berechnen" className="link link-primary">Abnehmen im Kaloriendefizit</a> sind 
              proteinreiche, kalorienarme Lebensmittel Gold wert – sie halten satt und schützen deine Muskeln.
            </p>
          </div>
        </section>

        {/* Protein Sources Table - Expanded */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Komplette Protein-Tabelle: 28 Top-Quellen
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Tierische Quellen */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🥩</span> Tierische Proteinquellen
                </h3>
                <div className="overflow-x-auto">
                  <table className="table bg-base-100 shadow-lg table-sm">
                    <thead>
                      <tr>
                        <th>Lebensmittel</th>
                        <th>Protein</th>
                        <th>kcal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proteinSources.filter(s => s.type === "tierisch").map((source, i) => (
                        <tr key={i}>
                          <td className="font-medium">{source.name}</td>
                          <td><span className="badge badge-primary badge-sm">{source.protein}g</span></td>
                          <td className="opacity-70">{source.kcal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pflanzliche Quellen */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🌱</span> Pflanzliche Proteinquellen
                </h3>
                <div className="overflow-x-auto">
                  <table className="table bg-base-100 shadow-lg table-sm">
                    <thead>
                      <tr>
                        <th>Lebensmittel</th>
                        <th>Protein</th>
                        <th>kcal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proteinSources.filter(s => s.type === "pflanzlich").map((source, i) => (
                        <tr key={i}>
                          <td className="font-medium">{source.name}</td>
                          <td><span className="badge badge-accent badge-sm">{source.protein}g</span></td>
                          <td className="opacity-70">{source.kcal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm opacity-70 mt-4">
                  <strong>Veganer-Tipp:</strong> Kombiniere Hülsenfrüchte mit Getreide (z.B. Reis + Bohnen) für ein vollständiges Aminosäureprofil. 
                  Mehr dazu im <a href="/wissen/high-protein-diet-abnehmen-mechanismen-uebersicht" className="link link-primary">High-Protein Wissen-Artikel</a> oder 
                  im <a href="/wissen/protein-ballaststoffe-training-gewichtsmanagement-review" className="link link-primary">Review zu Protein & Ballaststoffen</a>.
                </p>
              </div>
            </div>
            
            <p className="text-center text-sm opacity-70 mt-8">
              Alle Angaben pro 100g (ausser Eier: 2 Stück). Werte können je nach Produkt variieren.
            </p>
          </div>
        </section>

        {/* Example Meal Plans for Different Goals */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Beispiel-Ernährungspläne: Protein für jedes Ziel
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">
              Drei komplette Tagespläne für unterschiedliche Ziele. Alle Pläne kannst du mit <a href="/#live-demo" className="link link-primary">Mahlzait tracken</a> – einfach Foto machen und fertig.
            </p>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {Object.entries(mealPlanExamples).map(([key, plan]) => {
                const total = plan.meals.reduce((acc, m) => acc + m.protein, 0);
                return (
                  <div key={key} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title text-lg">
                        <span className="text-2xl">{plan.icon}</span>
                        {plan.title}
                      </h3>
                      <p className="text-sm opacity-70 mb-4">{plan.weight}</p>
                      
                      <div className="space-y-3">
                        {plan.meals.map((meal, i) => (
                          <div key={i} className="flex justify-between items-start gap-2 text-sm">
                            <div>
                              <span className="font-semibold">{meal.meal}:</span>
                              <span className="opacity-80 ml-1">{meal.foods}</span>
                            </div>
                            <span className="badge badge-primary badge-sm whitespace-nowrap">{meal.protein}g</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="divider my-2"></div>
                      <div className="flex justify-between items-center font-bold">
                        <span>Gesamt</span>
                        <span className="text-xl text-primary">{total}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <p className="opacity-80 mb-4">
                Mit Mahlzait trackst du jede Mahlzeit in Sekunden – per Foto, Text oder Barcode.
              </p>
              <a href="/#live-demo" className="btn btn-primary">
                Live Demo ausprobieren →
              </a>
            </div>
          </div>
        </section>

        {/* Original Simple Meal Plan (for schema.org content) */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Standard-Tagesplan: {totalMealPlanProtein}g Protein
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">
              Ein ausgewogener Tagesplan für eine Person mit ca. 70-75kg und moderater Aktivität. 
              Kombiniere diesen Plan mit dem <a href="/kalorienbedarf-berechnen" className="link link-primary">Kalorienbedarf-Rechner</a>, 
              um auch deine Gesamtkalorien zu optimieren.
            </p>
            
            <div className="max-w-2xl mx-auto space-y-4">
              {exampleMealPlan.map((meal, i) => (
                <div key={i} className="card bg-base-100 shadow-lg">
                  <div className="card-body py-4 flex-row items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{meal.meal}</h3>
                      <p className="opacity-80">{meal.foods}</p>
                    </div>
                    <span className="badge badge-primary badge-lg">{meal.protein}g</span>
                  </div>
                </div>
              ))}
              <div className="card bg-primary text-primary-content">
                <div className="card-body py-4 flex-row items-center justify-between">
                  <span className="font-bold text-lg">Gesamt</span>
                  <span className="text-2xl font-bold">{totalMealPlanProtein}g Protein</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Groups Section */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Proteinbedarf für besondere Gruppen
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">👴 Senioren (65+)</h3>
                  <p className="opacity-80">
                    Mit dem Alter nimmt die Fähigkeit ab, Muskeln aufzubauen (anabole Resistenz). Die DGE empfiehlt daher <strong>1,0-1,2g/kg</strong> – also 20-50% mehr als für jüngere Erwachsene.
                  </p>
                  <div className="mt-4">
                    <span className="badge badge-lg badge-secondary">1,0-1,2g pro kg</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🤰 Schwangere</h3>
                  <p className="opacity-80">
                    Während der Schwangerschaft steigt der Proteinbedarf, besonders im 3. Trimester. Die zusätzlichen Aminosäuren werden für die Entwicklung des Babys benötigt.
                  </p>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>1. Trimester: +6g/Tag</li>
                    <li>2. Trimester: +15g/Tag</li>
                    <li>3. Trimester: +21g/Tag</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🍼 Stillende</h3>
                  <p className="opacity-80">
                    Die Produktion von Muttermilch ist sehr proteinintensiv. Stillende Mütter sollten etwa <strong>+25g Protein pro Tag</strong> mehr aufnehmen.
                  </p>
                  <div className="mt-4">
                    <span className="badge badge-lg badge-accent">≈1,3g pro kg</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🌱 Veganer</h3>
                  <p className="opacity-80">
                    Pflanzliche Proteine haben oft ein unvollständiges Aminosäureprofil und werden schlechter resorbiert. Daher empfehlen Experten <strong>+10% mehr Protein</strong> bei veganer Ernährung.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Tipp:</strong> Kombiniere Hülsenfrüchte + Getreide für ein vollständiges Aminosäureprofil.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🏋️ Kraftsportler</h3>
                  <p className="opacity-80">
                    Für maximalen Muskelaufbau empfiehlt die Forschung <strong>1,6-2,2g/kg</strong>. Mehr als 2,2g bringt laut Meta-Analysen keine zusätzlichen Vorteile.
                  </p>
                  <div className="mt-4">
                    <span className="badge badge-lg badge-success">1,6-2,2g pro kg</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">⚖️ Beim Abnehmen</h3>
                  <p className="opacity-80">
                    Im Kaloriendefizit ist mehr Protein wichtig, um Muskelmasse zu erhalten. Studien empfehlen <strong>1,6-2,4g/kg</strong> – je grösser das Defizit, desto mehr Protein.
                  </p>
                  <div className="mt-4">
                    <span className="badge badge-lg badge-warning">1,6-2,4g pro kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protein Myths Section */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              ❌ 5 Protein-Mythen aufgeklärt
            </h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-error">❌ "Zu viel Protein schadet den Nieren"</h3>
                  <p className="text-success font-medium mt-2">✅ Realität:</p>
                  <p className="opacity-80">
                    Bei gesunden Menschen gibt es <strong>keine Hinweise</strong> auf Nierenschäden durch hohen Proteinkonsum. 
                    Mehrere Langzeitstudien mit über 2g/kg haben keine negativen Effekte gezeigt. 
                    Wer bereits Nierenprobleme hat, sollte aber ärztlichen Rat einholen.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-error">❌ "Der Körper kann nur 30g Protein pro Mahlzeit aufnehmen"</h3>
                  <p className="text-success font-medium mt-2">✅ Realität:</p>
                  <p className="opacity-80">
                    Der Körper kann deutlich mehr Protein verwerten – die Verdauung dauert nur länger. 
                    Studien zeigen, dass auch 50-70g pro Mahlzeit effektiv genutzt werden. 
                    Die "25-40g Empfehlung" bezieht sich auf die <em>optimale Stimulation der Muskelproteinsynthese</em> pro Mahlzeit.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-error">❌ "Protein direkt nach dem Training ist essentiell"</h3>
                  <p className="text-success font-medium mt-2">✅ Realität:</p>
                  <p className="opacity-80">
                    Das "anabole Fenster" ist grösser als gedacht – mindestens 4-6 Stunden. 
                    Wichtiger als das Timing ist die <strong>Gesamtmenge</strong> über den Tag und eine gleichmässige Verteilung. 
                    Wenn du 2-3 Stunden vor dem Training gegessen hast, ist ein sofortiger Shake nicht nötig.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-error">❌ "Pflanzliches Protein ist minderwertig"</h3>
                  <p className="text-success font-medium mt-2">✅ Realität:</p>
                  <p className="opacity-80">
                    Einzelne pflanzliche Quellen haben oft ein unvollständiges Aminosäureprofil – aber durch <strong>Kombination verschiedener Quellen</strong> (z.B. Reis + Bohnen) erhältst du alle essentiellen Aminosäuren. 
                    Die biologische Wertigkeit ist etwas geringer, daher +10% mehr Gesamtprotein empfohlen.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-error">❌ "Ohne Proteinpulver kann ich meinen Bedarf nicht decken"</h3>
                  <p className="text-success font-medium mt-2">✅ Realität:</p>
                  <p className="opacity-80">
                    Die meisten Menschen können ihren Proteinbedarf problemlos über normale Lebensmittel decken. 
                    Proteinpulver ist <strong>praktisch</strong> für unterwegs oder wenn es schnell gehen muss – aber kein Muss. 
                    Echte Lebensmittel liefern zusätzlich wichtige Mikronährstoffe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Signs of Deficiency */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              ⚠️ Anzeichen für Proteinmangel
            </h2>
            <p className="text-center opacity-80 max-w-2xl mx-auto mb-8">
              In Deutschland ist echter Proteinmangel selten. Diese Symptome können aber auf eine zu geringe Zufuhr hindeuten:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {[
                { icon: "💪", text: "Muskelschwund trotz Training" },
                { icon: "🦴", text: "Brüchige Nägel" },
                { icon: "💇", text: "Haarausfall / dünnes Haar" },
                { icon: "😴", text: "Ständige Müdigkeit" },
                { icon: "🤕", text: "Langsame Wundheilung" },
                { icon: "🦠", text: "Häufige Infekte" },
                { icon: "🍫", text: "Starker Heisshunger auf Süsses" },
                { icon: "😤", text: "Stimmungsschwankungen" },
                { icon: "🏃", text: "Schlechte Regeneration nach Sport" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-base-100 rounded-lg shadow">
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            
            <div className="alert alert-warning max-w-2xl mx-auto mt-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>Bei anhaltenden Symptomen bitte einen Arzt aufsuchen – sie können auch andere Ursachen haben.</span>
            </div>
          </div>
        </section>

        {/* Explanation Section (Previous cards, updated) */}
        <section className="py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Protein für deine Ziele optimal nutzen
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🏋️ Muskelaufbau & -erhalt</h3>
                  <p className="opacity-80">
                    Protein ist der Baustein für Muskeln. Ohne ausreichend Protein kann dein Körper keine neuen Muskelfasern aufbauen – egal wie hart du trainierst.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Fördert Muskelproteinsynthese (MPS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Verhindert Muskelabbau im Defizit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Beschleunigt Regeneration nach Training</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🔥 Sättigung & Abnehmen</h3>
                  <p className="opacity-80">
                    <strong>Wie viel Protein am Tag zum Abnehmen?</strong> Studien empfehlen 1,6-2,4g/kg – mehr als beim Muskelaufbau! Protein hält dich länger satt und schützt deine Muskelmasse im Kaloriendefizit.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Höchste Sättigungswirkung aller Makros</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Thermischer Effekt: 20-30% der Kalorien</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Reduziert Heisshunger & Snacking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span className="text-sm">Erhält Muskelmasse beim Abnehmen</span>
                    </li>
                  </ul>
                  <p className="text-sm mt-3">
                    <a href="/wissen/protein-abnehmen-muskelmasse-aeltere-meta-analyse" className="link link-primary">→ Meta-Analyse: Protein beim Abnehmen</a>
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">⏰ Timing & Verteilung</h3>
                  <p className="opacity-80">
                    Verteile dein Protein gleichmässig über den Tag. Der Körper kann pro Mahlzeit etwa 25-40g optimal für die Muskelproteinsynthese nutzen.
                  </p>
                  <div className="mt-4 p-4 bg-base-200 rounded-lg">
                    <p className="font-mono text-center">
                      <strong>Optimal: 3-4 Mahlzeiten</strong>
                    </p>
                    <p className="text-sm opacity-70 text-center mt-2">
                      Mit je 25-40g Protein pro Mahlzeit (inkl. ~3g Leucin)
                    </p>
                  </div>
                  <p className="text-sm mt-3">
                    <a href="/wissen/protein-timing-vor-nach-training-studie" className="link link-primary">→ Studie: Protein vor oder nach dem Training?</a>
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">🥗 Tierisch vs. Pflanzlich</h3>
                  <p className="opacity-80">
                    Tierische Proteine haben ein vollständiges Aminosäureprofil. Bei pflanzlichen Proteinen solltest du verschiedene Quellen kombinieren.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-info">🥩</span>
                      <span className="text-sm">Tierisch: Fleisch, Fisch, Eier, Milchprodukte</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info">🌱</span>
                      <span className="text-sm">Pflanzlich: Hülsenfrüchte, Tofu, Tempeh, Seitan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warning">💡</span>
                      <span className="text-sm">Kombination: Reis + Bohnen = vollständig</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Expanded */}
        <section className="bg-base-200 py-16">
          <div className="max-w-screen-lg mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Häufig gestellte Fragen zum Proteinbedarf
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  q: "Wie viel Protein brauche ich am Tag?",
                  a: "Der Mindestbedarf liegt bei 0,8g pro kg Körpergewicht (DGE-Empfehlung). Für Sportler und beim Muskelaufbau empfehlen Studien 1,6-2,2g pro kg. Unser Rechner berücksichtigt dein Aktivitätslevel, Alter und Ziel für eine individuelle Empfehlung.",
                },
                {
                  q: "Wie berechne ich meinen Proteinbedarf für Muskelaufbau?",
                  a: "Für optimalen Muskelaufbau empfiehlt die Forschung 1,6-2,2g Protein pro kg Körpergewicht. Bei 80kg wären das 128-176g pro Tag. Kombiniere diese Menge mit Krafttraining und ausreichend Kalorien für beste Ergebnisse.",
                },
                {
                  q: "Kann ich zu viel Protein essen?",
                  a: "Bei gesunden Menschen ist ein Proteinkonsum von bis zu 2,5g pro kg unbedenklich. Mehr ist selten nötig und bringt keine zusätzlichen Vorteile für den Muskelaufbau. Bei bestehenden Nierenproblemen solltest du mit einem Arzt sprechen.",
                },
                {
                  q: "Wann sollte ich Protein essen – vor oder nach dem Training?",
                  a: "Das 'anabole Fenster' ist grösser als gedacht: Du hast mindestens 4-6 Stunden Zeit. Wichtiger als das exakte Timing ist die Gesamtmenge über den Tag und eine gleichmässige Verteilung auf 3-4 Mahlzeiten.",
                },
                {
                  q: "Brauche ich Proteinpulver für Muskelaufbau?",
                  a: "Nein, du kannst deinen Bedarf komplett über normale Lebensmittel decken. Proteinpulver ist praktisch für unterwegs oder wenn du Schwierigkeiten hast, genug Protein über Mahlzeiten zu essen – aber kein Muss.",
                },
                {
                  q: "Ist zu viel Protein schädlich für die Nieren?",
                  a: "Bei gesunden Menschen gibt es keine wissenschaftlichen Hinweise darauf, dass hoher Proteinkonsum die Nieren schädigt. Mehrere Langzeitstudien mit über 2g/kg zeigten keine negativen Effekte. Wer bereits Nierenprobleme hat, sollte ärztlichen Rat einholen.",
                },
                {
                  q: "Wie viel Protein brauchen Senioren?",
                  a: "Menschen über 65 Jahren benötigen mehr Protein (1,0-1,2g/kg statt 0,8g/kg), da die Fähigkeit zum Muskelaufbau abnimmt (anabole Resistenz). Die DGE empfiehlt diese erhöhte Zufuhr offiziell.",
                },
                {
                  q: "Brauchen Veganer mehr Protein?",
                  a: "Ja, etwa 10% mehr. Pflanzliche Proteine haben oft ein unvollständiges Aminosäureprofil und werden etwas schlechter resorbiert. Durch Kombination verschiedener Quellen (z.B. Hülsenfrüchte + Getreide) und leicht erhöhte Gesamtmenge ist eine optimale Versorgung möglich.",
                },
                {
                  q: "Wie verteile ich mein Protein über den Tag?",
                  a: "Optimal sind 3-4 Mahlzeiten mit je 25-40g Protein. Diese Menge stimuliert die Muskelproteinsynthese maximal. Vermeide es, das gesamte Protein in einer einzigen Mahlzeit zu essen.",
                },
                {
                  q: "Wie tracke ich mein Protein am einfachsten?",
                  a: "Mit Mahlzait kannst du Mahlzeiten per Foto, Text oder Barcode loggen. Die KI erkennt dein Essen und berechnet Protein und alle Makros automatisch – in Sekunden statt Minuten.",
                },
              ].map((faq, i) => (
                <div key={i} className="collapse collapse-plus bg-base-100 shadow">
                  <input type="radio" name="faq-accordion" defaultChecked={i === 0} />
                  <div className="collapse-title text-lg font-medium">{faq.q}</div>
                  <div className="collapse-content">
                    <p className="opacity-80">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scientific References */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">📚 Wissenschaftliche Quellen</h3>
            <div className="text-sm opacity-70 max-w-3xl mx-auto space-y-2">
              <p>• Deutsche Gesellschaft für Ernährung (DGE): Referenzwerte für die Nährstoffzufuhr, 2024</p>
              <p>• Morton RW et al. (2018): A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass. British Journal of Sports Medicine</p>
              <p>• Phillips SM, Van Loon LJ (2011): Dietary protein for athletes: from requirements to optimum adaptation. Journal of Sports Sciences</p>
              <p>• Helms ER et al. (2014): A systematic review of dietary protein during caloric restriction in resistance trained lean athletes. Int J Sport Nutr Exerc Metab</p>
              <p>• Bauer J et al. (2013): Evidence-based recommendations for optimal dietary protein intake in older people. JAMDA</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-content py-16">
          <div className="max-w-screen-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tracke dein Protein mit Mahlzait
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Du kennst jetzt deinen Proteinbedarf. Mit Mahlzait trackst du jede Mahlzeit in Sekunden – per Foto, Text oder Barcode. So erreichst du deine Ziele garantiert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={config.appStoreLink} className="btn btn-lg bg-white text-primary hover:bg-white/90">
                iOS App laden
              </a>
              <a
                href={config.googlePlayLink}
                className="btn btn-lg bg-white text-primary hover:bg-white/90"
              >
                Android App laden
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-screen-lg mx-auto px-4">
            <h3 className="text-lg font-bold mb-6 text-center">Weitere Rechner & Informationen</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/kalorienbedarf-berechnen" className="btn btn-outline">
                Kalorienbedarf berechnen
              </a>
              <a href="/makros-berechnen" className="btn btn-outline">
                Makros berechnen
              </a>
              <a href="/kaloriendefizit-berechnen" className="btn btn-outline">
                Kaloriendefizit berechnen
              </a>
              <a href="/grundumsatz-rechner" className="btn btn-outline">
                Grundumsatz Rechner
              </a>
              <a href="/bmi-rechner" className="btn btn-outline">
                BMI Rechner
              </a>
              <a href="/idealgewicht-rechner" className="btn btn-outline">
                Idealgewicht Rechner
              </a>
              <a href="/wissen/high-protein-diet-abnehmen-mechanismen-uebersicht" className="btn btn-outline">
                High-Protein-Diät Wissen
              </a>
              <a href="/wissen/protein-timing-vor-nach-training-studie" className="btn btn-outline">
                Protein-Timing Studie
              </a>
              <a href="/wissen/protein-abnehmen-muskelmasse-aeltere-meta-analyse" className="btn btn-outline">
                Protein beim Abnehmen
              </a>
              <a href="/rechner" className="btn btn-outline">
                Alle Rechner
              </a>
            </div>
          </div>
        </section>

        <AppBanner />
        <Footer />
      </main>
    </ConfigContext.Provider>
  );
}

export default ProteinBedarfRechnerPage;
