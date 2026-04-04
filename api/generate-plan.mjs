import { GoogleGenAI } from '@google/genai';

// ── Rate limiting (in-memory, resets on cold start) ──
const ipCounts = new Map();
const RATE_LIMIT = 3;
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

function calculateMacros(tdee, goal) {
  let calories, proteinPct, carbsPct, fatPct;
  switch (goal) {
    case 'lose':
      calories = Math.round(tdee - 500);
      proteinPct = 30; carbsPct = 40; fatPct = 30;
      break;
    case 'gain':
      calories = Math.round(tdee + 300);
      proteinPct = 25; carbsPct = 50; fatPct = 25;
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

// ── Input validation ──
function validateInput(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body';
  const { type, userData } = body;
  if (!['meal', 'training', 'both'].includes(type)) return 'Invalid type';
  if (!userData || typeof userData !== 'object') return 'Missing userData';
  if (userData._hp) return 'Bot detected';

  const { gender, age, height, weight, goal, activityLevel } = userData;
  if (!['male', 'female'].includes(gender)) return 'Invalid gender';
  if (!age || age < 14 || age > 100) return 'Invalid age';
  if (!height || height < 120 || height > 250) return 'Invalid height';
  if (!weight || weight < 30 || weight > 300) return 'Invalid weight';
  if (!['lose', 'maintain', 'gain'].includes(goal)) return 'Invalid goal';
  if (!activityLevel || activityLevel < 1.0 || activityLevel > 2.5) return 'Invalid activity level';

  if (type === 'meal' || type === 'both') {
    const { diet, mealsPerDay } = userData;
    if (!['omnivore', 'vegetarian', 'vegan'].includes(diet)) return 'Invalid diet';
    if (!mealsPerDay || mealsPerDay < 2 || mealsPerDay > 6) return 'Invalid mealsPerDay';
  }
  if (type === 'training' || type === 'both') {
    const { daysPerWeek, experienceLevel, equipment } = userData;
    if (!daysPerWeek || daysPerWeek < 2 || daysPerWeek > 7) return 'Invalid daysPerWeek';
    if (!['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) return 'Invalid experienceLevel';
    if (!['gym', 'home', 'bodyweight', 'outdoor'].includes(equipment)) return 'Invalid equipment';
  }
  return null;
}

// ── JSON Schemas for Gemini responseSchema ──

const mealJsonSchema = {
  type: 'object',
  required: ['summary', 'days', 'tips', 'disclaimer'],
  properties: {
    summary: {
      type: 'object',
      required: ['dailyCalories', 'proteinGrams', 'carbsGrams', 'fatGrams', 'goal', 'diet'],
      properties: {
        dailyCalories: { type: 'number', description: 'Tägliche Gesamtkalorien' },
        proteinGrams: { type: 'number', description: 'Protein in Gramm' },
        carbsGrams: { type: 'number', description: 'Kohlenhydrate in Gramm' },
        fatGrams: { type: 'number', description: 'Fett in Gramm' },
        goal: { type: 'string', description: 'Ziel, z.B. Abnehmen' },
        diet: { type: 'string', description: 'Ernährungsform' },
      },
    },
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
const GOAL_LABELS = { lose: 'Abnehmen', maintain: 'Gewicht halten', gain: 'Muskelaufbau' };
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

REGELN:
- Realistische, alltagstaugliche Gerichte mit gängigen Zutaten aus dem deutschen Supermarkt
- Die Tagessumme muss den Vorgaben entsprechen (±50 kcal Toleranz)
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
        message: 'Du hast das Limit von 3 Generierungen pro Stunde erreicht. Bitte versuche es später erneut.',
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
      return res.status(400).json({ error: validationError });
    }

    const { type, userData } = body;
    const tdee = calculateTDEE(userData.gender, userData.age, userData.height, userData.weight, userData.activityLevel);
    const macros = calculateMacros(tdee, userData.goal);

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

    // Send macros first so client can display summary immediately
    res.write(`data: ${JSON.stringify({ event: 'macros', data: { tdee, ...macros } })}\n\n`);

    try {
      const tasks = [];

      if (type === 'meal' || type === 'both') {
        tasks.push({
          key: 'meal',
          prompt: buildMealPrompt(userData, macros),
          schema: mealJsonSchema,
        });
      }
      if (type === 'training' || type === 'both') {
        tasks.push({
          key: 'training',
          prompt: buildTrainingPrompt(userData, macros),
          schema: trainingJsonSchema,
        });
      }

      for (const task of tasks) {
        res.write(`data: ${JSON.stringify({ event: 'start', planType: task.key })}\n\n`);

        const result = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: task.prompt,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: task.schema,
            maxOutputTokens: 65536,
            temperature: 0.7,
          },
        });

        const parsed = JSON.parse(result.text);

        // Stream days one by one for progressive rendering
        if (parsed.days && Array.isArray(parsed.days)) {
          const summaryData = { ...parsed };
          delete summaryData.days;
          res.write(`data: ${JSON.stringify({ event: 'summary', planType: task.key, data: summaryData })}\n\n`);

          for (let i = 0; i < parsed.days.length; i++) {
            res.write(`data: ${JSON.stringify({ event: 'day', planType: task.key, index: i, data: parsed.days[i] })}\n\n`);
          }
        } else {
          res.write(`data: ${JSON.stringify({ event: 'complete', planType: task.key, data: parsed })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ event: 'done' })}\n\n`);
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
