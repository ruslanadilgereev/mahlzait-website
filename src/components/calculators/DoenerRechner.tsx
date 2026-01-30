
import React, { useState, useEffect } from 'react';

const activities = [
  { name: "Joggen", kcalPerMin: 10, emoji: "🏃" },
  { name: "Gehen", kcalPerMin: 4, emoji: "🚶" },
  { name: "Radfahren", kcalPerMin: 8, emoji: "🚴" },
  { name: "Schwimmen", kcalPerMin: 9, emoji: "🏊" },
  { name: "Seilspringen", kcalPerMin: 12, emoji: "⏱️" },
  { name: "Treppen steigen", kcalPerMin: 7, emoji: "🪜" },
];

const foods = [
  { name: "Döner", kcal: 650, emoji: "🥙" },
  { name: "Big Mac", kcal: 503, emoji: "🍔" },
  { name: "Pizza Margherita", kcal: 800, emoji: "🍕" },
  { name: "Schnitzel mit Pommes", kcal: 950, emoji: "🍖" },
  { name: "Currywurst mit Pommes", kcal: 780, emoji: "🌭" },
  { name: "Tiramisu", kcal: 450, emoji: "🍰" },
  { name: "Bier (0.5L)", kcal: 215, emoji: "🍺" },
  { name: "Glas Wein", kcal: 125, emoji: "🍷" },
  { name: "Cola (0.5L)", kcal: 210, emoji: "🥤" },
  { name: "Croissant", kcal: 270, emoji: "🥐" },
];

const DoenerRechner = () => {
  const [selectedFood, setSelectedFood] = useState(foods[0]);
  const [selectedActivity, setSelectedActivity] = useState(activities[0]);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const mins = Math.ceil(selectedFood.kcal / selectedActivity.kcalPerMin);
    setMinutes(mins);
  }, [selectedFood, selectedActivity]);

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 p-6 max-w-2xl mx-auto">
      <div className="card-body p-0">
        <h2 className="card-title text-2xl mb-6 justify-center">
          {selectedActivity.emoji} Wie lange musst du trainieren?
        </h2>

        {/* Food Selection */}
        <div className="form-control w-full mb-6">
          <label className="label">
            <span className="label-text font-bold">Was hast du gegessen?</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {foods.map((food) => (
              <button
                key={food.name}
                onClick={() => setSelectedFood(food)}
                className={`btn btn-sm ${selectedFood.name === food.name ? 'btn-primary' : 'btn-outline'}`}
              >
                {food.emoji} {food.name.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className="text-center mt-4 text-lg">
            <span className="text-4xl">{selectedFood.emoji}</span>
            <p className="font-bold">{selectedFood.name}</p>
            <p className="text-primary text-2xl font-black">{selectedFood.kcal} kcal</p>
          </div>
        </div>

        <div className="divider">verbrennen mit</div>

        {/* Activity Selection */}
        <div className="form-control w-full mb-6">
          <label className="label">
            <span className="label-text font-bold">Wie willst du es verbrennen?</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activities.map((activity) => (
              <button
                key={activity.name}
                onClick={() => setSelectedActivity(activity)}
                className={`btn ${selectedActivity.name === activity.name ? 'btn-secondary' : 'btn-outline'}`}
              >
                {activity.emoji} {activity.name}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="bg-base-200 rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">Um {selectedFood.name} zu verbrennen, musst du</p>
          <div className="text-5xl md:text-6xl font-black text-primary mb-2">
            {minutes} Minuten
          </div>
          <p className="text-xl">{selectedActivity.emoji} {selectedActivity.name}</p>
          
          <div className="mt-4 text-sm opacity-70">
            ({selectedActivity.kcalPerMin} kcal/min × {minutes} min ≈ {selectedFood.kcal} kcal)
          </div>

          <div className="divider my-6"></div>

          <p className="text-sm mb-4">Lieber vorher wissen, was du isst?</p>
          <a 
            href="https://apps.apple.com/de/app/mahlzait-ki-kalorienz%C3%A4hler/id6747400456" 
            className="btn btn-primary"
          >
            🚀 Kalorien tracken mit Mahlzait
          </a>
        </div>
      </div>
    </div>
  );
};

export default DoenerRechner;
