import { GoogleGenAI } from '@google/genai';

// ── Rate limiting (in-memory, resets on cold start) ──
const ipCounts = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    ipCounts.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ── TDEE Calculation (Mifflin-St Jeor) ──
function calculateTDEE(gender, age, height, weight, activityLevel) {
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr * activityLevel);
}

function calculateMacros(tdee, goal, weight) {
  let calories, proteinPct, carbsPct, fatPct;
  switch (goal) {
    case 'lose':
      calories = Math.round(tdee - 500);
      proteinPct = 30; carbsPct = 40; fatPct = 30;
      break;
    case 'recomp': {
      // Recomp lives on protein, so it is set per kg body weight (2.2 g/kg)
      // instead of as a share of calories; fat 25 %, carbs take the rest.
      calories = Math.round(tdee - 300);
      const protein = Math.round(weight * 2.2);
      const fat = Math.round((calories * 0.25) / 9);
      return { calories, protein, fat, carbs: Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4)) };
    }
    case 'gain':
      calories = Math.round(tdee + 300);
      proteinPct = 25; carbsPct = 50; fatPct = 25;
      break;
    case 'performance':
      calories = tdee;
      proteinPct = 20; carbsPct = 55; fatPct = 25;
      break;
    case 'health':
      calories = tdee;
      proteinPct = 20; carbsPct = 50; fatPct = 30;
      break;
    default:
      calories = tdee;
      proteinPct = 25; carbsPct = 45; fatPct = 30;
  }
  return {
    calories,
    protein: Math.round((calories * proteinPct / 100) / 4),
    carbs: Math.round((calories * carbsPct / 100) / 4),
    fat: Math.round((calories * fatPct / 100) / 9),
  };
}

// ── Input validation (messages are shown to the user) ──
function validateInput(body) {
  if (!body || typeof body !== 'object') return 'Ungültige Anfrage.';
  const { type, userData } = body;
  if (!['meal', 'training', 'both'].includes(type)) return 'Ungültiger Plan-Typ.';
  if (!userData || typeof userData !== 'object') return 'Es fehlen Angaben.';
  if (userData._hp) return 'Anfrage abgelehnt.';

  const { gender, age, height, weight, goal, activityLevel } = userData;
  if (!['male', 'female'].includes(gender)) return 'Bitte wähle ein Geschlecht.';
  if (!age || age < 14 || age > 100) return 'Bitte gib ein Alter zwischen 14 und 100 an.';
  if (!height || height < 120 || height > 250) return 'Bitte gib eine Größe zwischen 120 und 250 cm an.';
  if (!weight || weight < 30 || weight > 300) return 'Bitte gib ein Gewicht zwischen 30 und 300 kg an.';
  if (!Object.hasOwn(GOAL_LABELS, goal)) return 'Bitte wähle ein Ziel.';
  if (!activityLevel || activityLevel < 1.0 || activityLevel > 2.5) return 'Bitte wähle ein Aktivitätslevel.';

  if (type === 'meal' || type === 'both') {
    const { diet, mealsPerDay } = userData;
    if (!['omnivore', 'vegetarian', 'vegan'].includes(diet)) return 'Bitte wähle eine Ernährungsform.';
    if (!mealsPerDay || mealsPerDay < 2 || mealsPerDay > 6) return 'Bitte wähle 2 bis 6 Mahlzeiten pro Tag.';
  }
  if (type === 'training' || type === 'both') {
    const { daysPerWeek, experienceLevel, equipment } = userData;
    if (!daysPerWeek || daysPerWeek < 2 || daysPerWeek > 7) return 'Bitte wähle 2 bis 7 Trainingstage.';
    if (!['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) return 'Bitte wähle dein Erfahrungslevel.';
    if (!['gym', 'home', 'bodyweight', 'outdoor'].includes(equipment)) return 'Bitte wähle dein Equipment.';
  }
  return null;
}

// ── JSON Schemas for Gemini responseSchema ──

// No summary here: the daily target comes from calculateMacros(), not from the
// model, and leaving it out lets the first day start streaming sooner.
const mealJsonSchema = {
  type: 'object',
  required: ['days', 'tips', 'disclaimer'],
  properties: {
    days: {
      type: 'array',
      description: '7 Tage Montag bis Sonntag',
      items: {
        type: 'object',
        required: ['day', 'meals', 'totalCalories', 'totalProtein', 'totalCarbs', 'totalFat'],
        properties: {
          day: { type: 'string', description: 'Wochentag' },
          meals: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type', 'name', 'ingredients', 'prepTimeMinutes', 'calories', 'protein', 'carbs', 'fat'],
              properties: {
                type: { type: 'string', description: 'Frühstück, Mittagessen, Abendessen oder Snack' },
                name: { type: 'string', description: 'Gerichtname' },
                ingredients: { type: 'array', items: { type: 'string' }, description: 'Zutaten mit Menge' },
                prepTimeMinutes: { type: 'number' },
                calories: { type: 'number' },
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' },
              },
            },
          },
          totalCalories: { type: 'number' },
          totalProtein: { type: 'number' },
          totalCarbs: { type: 'number' },
          totalFat: { type: 'number' },
        },
      },
    },
    tips: { type: 'array', items: { type: 'string' }, description: '3 praktische Tipps' },
    disclaimer: { type: 'string' },
  },
};

const trainingJsonSchema = {
  type: 'object',
  required: ['summary', 'days', 'progressionPlan', 'tips', 'disclaimer'],
  properties: {
    summary: {
      type: 'object',
      required: ['goal', 'level', 'daysPerWeek', 'splitType'],
      properties: {
        goal: { type: 'string' },
        level: { type: 'string' },
        daysPerWeek: { type: 'number' },
        splitType: { type: 'string', description: 'z.B. Push/Pull/Legs, Ganzkörper' },
      },
    },
    days: {
      type: 'array',
      description: '7 Tage Montag bis Sonntag',
      items: {
        type: 'object',
        required: ['day', 'focus', 'isRestDay', 'warmup', 'exercises', 'cooldown', 'estimatedMinutes'],
        properties: {
          day: { type: 'string' },
          focus: { type: 'string', description: 'z.B. Push – Brust, Schulter. Bei Ruhetag: Regeneration' },
          isRestDay: { type: 'boolean' },
          warmup: { type: 'array', items: { type: 'string' } },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'muscleGroup', 'sets', 'reps', 'restSeconds', 'notes'],
              properties: {
                name: { type: 'string' },
                muscleGroup: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'string', description: 'z.B. 8-12 oder 30s' },
                restSeconds: { type: 'number' },
                notes: { type: 'string', description: 'Progressionshinweis' },
              },
            },
          },
          cooldown: { type: 'array', items: { type: 'string' } },
          estimatedMinutes: { type: 'number', description: '0 bei Ruhetag' },
        },
      },
    },
    progressionPlan: { type: 'string' },
    tips: { type: 'array', items: { type: 'string' } },
    disclaimer: { type: 'string' },
  },
};

// ── Prompt builders ──
const GOAL_LABELS = {
  lose: 'Abnehmen',
  recomp: 'Body Recomposition',
  maintain: 'Gewicht halten',
  gain: 'Muskelaufbau',
  performance: 'Ausdauer & Leistung',
  health: 'Gesünder essen',
};
// What each goal means for the food and the training, so the plans differ
// beyond the calorie number.
const GOAL_MEAL_FOCUS = {
  lose: 'Sättigende, volumenreiche Gerichte mit viel Gemüse und Protein, wenig flüssige Kalorien',
  recomp: 'Protein gleichmäßig auf alle Mahlzeiten verteilen (möglichst mind. 30 g pro Hauptmahlzeit), Kohlenhydrate bevorzugt rund ums Training',
  maintain: 'Ausgewogene, abwechslungsreiche Mischkost',
  gain: 'Energiedichte, proteinreiche Mahlzeiten, die sich auch in größeren Mengen gut essen lassen',
  performance: 'Kohlenhydratreiche Mahlzeiten als Energie für Ausdauertraining, leicht verdauliche Snacks vor und Regeneration nach dem Training',
  health: 'Möglichst unverarbeitete Lebensmittel, viel Gemüse, Hülsenfrüchte und Vollkorn (mind. 30 g Ballaststoffe am Tag), wenig Zucker und Fertigprodukte',
};
const GOAL_TRAINING_FOCUS = {
  lose: 'Krafttraining zum Muskelerhalt, ergänzt durch moderates Cardio',
  recomp: 'Krafttraining mit konsequenter progressiver Überlastung im Hypertrophie-Bereich (6-12 Wdh.), nur wenig zusätzliches Cardio',
  maintain: 'Ausgewogene Mischung aus Kraft und Ausdauer',
  gain: 'Hypertrophie-Training mit ausreichend Volumen pro Muskelgruppe',
  performance: 'Ausdauereinheiten (z.B. Laufen, Radfahren, Intervalle) als Schwerpunkt, dazu ergänzendes Krafttraining für Stabilität und Verletzungsprophylaxe. Ausdauereinheiten als Übung mit Dauer/Distanz in reps angeben',
  health: 'Ausgewogene Mischung aus Kraft, Ausdauer und Beweglichkeit, gelenkschonend und alltagstauglich',
};
const DIET_LABELS = { omnivore: 'Omnivor (alles)', vegetarian: 'Vegetarisch', vegan: 'Vegan' };
const LEVEL_LABELS = { beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Profi' };
const EQUIPMENT_LABELS = { gym: 'Fitnessstudio', home: 'Home (Hanteln)', bodyweight: 'Bodyweight', outdoor: 'Outdoor' };

function buildMealPrompt(userData, macros) {
  const allergies = (userData.allergies || []).length > 0
    ? userData.allergies.join(', ')
    : 'Keine';
  return `Du bist ein erfahrener Ernährungsberater. Erstelle einen abwechslungsreichen 7-Tage-Essensplan auf Deutsch.

STRENGE VORGABEN (nicht abweichen):
- Tägliche Kalorien: ${macros.calories} kcal
- Protein: ${macros.protein}g | Kohlenhydrate: ${macros.carbs}g | Fett: ${macros.fat}g
- Ernährungsform: ${DIET_LABELS[userData.diet]}
- Allergien/Unverträglichkeiten: ${allergies}
- Mahlzeiten pro Tag: ${userData.mealsPerDay}
- Max. Zubereitungszeit pro Mahlzeit: ${userData.cookingTime || 30} Minuten
- Budget-Tendenz: ${userData.budget === 'cheap' ? 'Günstig' : userData.budget === 'medium' ? 'Mittel' : 'Egal'}
- Ziel: ${GOAL_LABELS[userData.goal]}
- Schwerpunkt für dieses Ziel: ${GOAL_MEAL_FOCUS[userData.goal]}

REGELN:
- Realistische, alltagstaugliche Gerichte mit gängigen Zutaten aus dem deutschen Supermarkt
- WICHTIG: Berechne die Makros jeder einzelnen Mahlzeit realistisch basierend auf den tatsächlichen Zutatenmengen. Die Tagessummen ergeben sich aus der Addition der Einzelmahlzeiten und dürfen zwischen Tagen leicht variieren (±100 kcal Toleranz zum Zielwert ist ok)
- Jeder Tag MUSS unterschiedliche totalCalories/totalProtein/totalCarbs/totalFat haben — NICHT identische Werte kopieren
- Abwechslung: Keine Mahlzeit darf sich innerhalb der 7 Tage wiederholen
- Alle Texte auf Deutsch`;
}

function buildTrainingPrompt(userData, macros) {
  const focus = (userData.focus || []).length > 0
    ? userData.focus.join(', ')
    : 'Ganzkörper';
  return `Du bist ein erfahrener Fitness-Trainer. Erstelle einen strukturierten Wochentrainingsplan auf Deutsch.

VORGABEN:
- Ziel: ${GOAL_LABELS[userData.goal]}
- Schwerpunkt für dieses Ziel: ${GOAL_TRAINING_FOCUS[userData.goal]}
- Erfahrungslevel: ${LEVEL_LABELS[userData.experienceLevel]}
- Trainingstage pro Woche: ${userData.daysPerWeek}
- Equipment: ${EQUIPMENT_LABELS[userData.equipment]}
- Zeit pro Session: ${userData.sessionTime || 60} Minuten
- Fokus: ${focus}
- Tägliche Kalorien: ${macros.calories} kcal (für Kontext)

REGELN:
- 7 Tage (Trainingstage + Ruhetage)
- Ruhetage: isRestDay=true, leere exercises/warmup/cooldown Arrays, estimatedMinutes=0
- Trainingstage: Warm-Up, Hauptübungen, Cool-Down
- Progressive Overload Hinweise in notes
- Zum Level passende Übungen (keine Olympischen Lifts für Anfänger)
- Alle Texte auf Deutsch`;
}

// ── Streaming ──
// Feeds the model's JSON text in as it arrives and reports every object that
// is complete, as soon as its closing brace is in: array items directly under
// the root (the days) as 'item', objects directly under the root (the
// training summary) as 'object'. Strings are tracked so braces inside
// dish names or notes don't count.
function createJsonObjectExtractor(onObject) {
  let text = '';
  let pos = 0;
  let inString = false;
  let escaped = false;
  let start = -1;
  const stack = [];
  return (chunk) => {
    text += chunk;
    for (; pos < text.length; pos++) {
      const ch = text[pos];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') {
        inString = true;
      } else if (ch === '{' || ch === '[') {
        if (ch === '{' && (stack.length === 1 || (stack.length === 2 && stack[1] === '['))) start = pos;
        stack.push(ch);
      } else if (ch === '}' || ch === ']') {
        stack.pop();
        if (ch === '}' && start >= 0 && (stack.length === 1 || (stack.length === 2 && stack[1] === '['))) {
          onObject(stack.length === 1 ? 'object' : 'item', JSON.parse(text.slice(start, pos + 1)));
          start = -1;
        }
      }
    }
  };
}

const sum = (items, key) => Math.round(items.reduce((acc, item) => acc + (Number(item[key]) || 0), 0));

async function streamPlan(ai, prompt, schema, onObject) {
  const stream = await ai.models.generateContentStream({
    model: 'gemini-3.7-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: schema,
      maxOutputTokens: 65536,
      temperature: 0.7,
      // Default thinking delays the first token by ~6s; LOW cuts that to ~2s
      // with the same plan quality (compared on identical input, 2026-09-28).
      thinkingConfig: { thinkingLevel: 'LOW' },
    },
  });
  const extract = createJsonObjectExtractor(onObject);
  let full = '';
  for await (const chunk of stream) {
    const text = chunk.text || '';
    full += text;
    extract(text);
  }
  return JSON.parse(full);
}

async function generateMealPlan(ai, userData, macros, send) {
  send({ event: 'start', planType: 'meal' });
  const summary = {
    dailyCalories: macros.calories,
    proteinGrams: macros.protein,
    carbsGrams: macros.carbs,
    fatGrams: macros.fat,
    goal: GOAL_LABELS[userData.goal],
    diet: DIET_LABELS[userData.diet],
  };
  send({ event: 'summary', planType: 'meal', data: { summary } });

  let index = 0;
  const parsed = await streamPlan(ai, buildMealPrompt(userData, macros), mealJsonSchema, (kind, day) => {
    if (kind !== 'item' || !Array.isArray(day.meals)) return;
    // Day totals are summed here so they always match the meals shown.
    send({
      event: 'day',
      planType: 'meal',
      index: index++,
      data: {
        ...day,
        totalCalories: sum(day.meals, 'calories'),
        totalProtein: sum(day.meals, 'protein'),
        totalCarbs: sum(day.meals, 'carbs'),
        totalFat: sum(day.meals, 'fat'),
      },
    });
  });

  send({ event: 'summary', planType: 'meal', data: { summary, tips: parsed.tips, disclaimer: parsed.disclaimer } });
}

async function generateTrainingPlan(ai, userData, macros, send) {
  send({ event: 'start', planType: 'training' });
  let index = 0;
  const parsed = await streamPlan(ai, buildTrainingPrompt(userData, macros), trainingJsonSchema, (kind, obj) => {
    if (kind === 'object' && obj.splitType) send({ event: 'summary', planType: 'training', data: { summary: obj } });
    if (kind === 'item' && obj.day) send({ event: 'day', planType: 'training', index: index++, data: obj });
  });

  send({
    event: 'summary',
    planType: 'training',
    data: { summary: parsed.summary, tips: parsed.tips, disclaimer: parsed.disclaimer, progressionPlan: parsed.progressionPlan },
  });
}

// ── Main handler ──
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Du hast das Limit von ${RATE_LIMIT} Plänen pro Stunde erreicht. Bitte versuche es später erneut.`,
      });
    }

    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const validationError = validateInput(body);
    if (validationError) {
      return res.status(400).json({ error: validationError, message: validationError });
    }

    const { type, userData } = body;
    const tdee = calculateTDEE(userData.gender, userData.age, userData.height, userData.weight, userData.activityLevel);
    const macros = calculateMacros(tdee, userData.goal, userData.weight);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured', message: 'GEMINI_API_KEY ist nicht gesetzt.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const send = (msg) => res.write(`data: ${JSON.stringify(msg)}\n\n`);

    // Send macros first so client can display summary immediately
    send({ event: 'macros', data: { tdee, ...macros } });

    try {
      // Both plans run at the same time. Each reports its own failure, so a
      // broken meal plan does not end the response mid-way through training.
      const failed = (planType) => () => send({ event: 'error', planType, message: 'Der Plan konnte nicht erstellt werden. Bitte versuche es erneut.' });
      const plans = [];
      if (type === 'meal' || type === 'both') plans.push(generateMealPlan(ai, userData, macros, send).catch(failed('meal')));
      if (type === 'training' || type === 'both') plans.push(generateTrainingPlan(ai, userData, macros, send).catch(failed('training')));
      await Promise.all(plans);

      send({ event: 'done' });
      res.end();
    } catch (e) {
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ event: 'error', message: String(e.message) })}\n\n`);
        res.end();
      } else {
        return res.status(500).json({ error: String(e.message), message: `Fehler: ${e.message}` });
      }
    }
  } catch (outerError) {
    if (!res.headersSent) {
      return res.status(500).json({ error: String(outerError.message), message: `Fehler: ${outerError.message}` });
    }
    res.end();
  }
}
