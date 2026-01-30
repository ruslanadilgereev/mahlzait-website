
import React, { useState, useEffect } from 'react';

const WeightLossDateCalculator = () => {
  const [currentWeight, setCurrentWeight] = useState<number>(90);
  const [goalWeight, setGoalWeight] = useState<number>(80);
  const [dailyDeficit, setDailyDeficit] = useState<number>(500);
  const [resultDate, setResultDate] = useState<string | null>(null);
  const [daysToGoal, setDaysToGoal] = useState<number>(0);

  useEffect(() => {
    calculateDate();
  }, [currentWeight, goalWeight, dailyDeficit]);

  const calculateDate = () => {
    if (goalWeight >= currentWeight) {
      setResultDate(null);
      return;
    }

    const weightDiff = currentWeight - goalWeight;
    const totalCaloriesToBurn = weightDiff * 7700; // 1kg fat approx 7700 kcal
    const days = Math.ceil(totalCaloriesToBurn / dailyDeficit);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    setDaysToGoal(days);
    setResultDate(targetDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }));
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 p-6 max-w-2xl mx-auto">
      <div className="card-body p-0">
        <h2 className="card-title text-2xl mb-6 justify-center">📅 Wann erreiche ich mein Ziel?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Aktuelles Gewicht (kg)</span>
            </label>
            <input 
              type="number" 
              value={currentWeight} 
              onChange={(e) => setCurrentWeight(Number(e.target.value))}
              className="input input-bordered w-full" 
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Zielgewicht (kg)</span>
            </label>
            <input 
              type="number" 
              value={goalWeight} 
              onChange={(e) => setGoalWeight(Number(e.target.value))}
              className="input input-bordered w-full" 
            />
          </div>

          <div className="form-control w-full md:col-span-2">
            <label className="label">
              <span className="label-text">Tägliches Kaloriendefizit</span>
              <span className="label-text-alt text-gray-500">Empfohlen: 300-500 kcal</span>
            </label>
            <input 
              type="range" 
              min="100" 
              max="1500" 
              step="50" 
              value={dailyDeficit} 
              onChange={(e) => setDailyDeficit(Number(e.target.value))} 
              className="range range-primary" 
            />
            <div className="w-full flex justify-between text-xs px-2 mt-2">
              <span>Langsam (200)</span>
              <span className="font-bold text-primary">{dailyDeficit} kcal/Tag</span>
              <span>Aggressiv (1000)</span>
            </div>
          </div>
        </div>

        {/* Result */}
        {resultDate && (
          <div className="mt-8 text-center bg-base-200 rounded-xl p-6 animate-fade-in">
            <p className="text-gray-500 mb-2">Wenn du heute startest, bist du am Ziel am:</p>
            <div className="text-4xl md:text-5xl font-black text-primary mb-4">
              {resultDate}
            </div>
            <div className="badge badge-outline p-4">
              {daysToGoal} Tage Disziplin
            </div>
            
            <div className="divider my-6"></div>
            
            <p className="text-sm mb-4">Um das Datum zu halten, musst du tracken.</p>
            <a href="https://apps.apple.com/de/app/mahlzait-ki-kalorienz%C3%A4hler/id6747400456" className="btn btn-primary w-full">
              🚀 Jetzt starten & Datum sichern
            </a>
          </div>
        )}
        
        {goalWeight >= currentWeight && (
          <div className="mt-8 text-center text-gray-400">
            Das Ziel muss niedriger als das aktuelle Gewicht sein.
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightLossDateCalculator;
