import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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

// ── Zod Schemas (Gemini responseSchema) ──

const mealSchema = z.object({
  summary: z.object({
    dailyCalories: z.number().describe('Tägliche Gesamtkalorien'),
    proteinGrams: z.number().describe('Tägliche Protein in Gramm'),
    carbsGrams: z.number().describe('Tägliche Kohlenhydrate in Gramm'),
    fatGrams: z.number().describe('Tägliches Fett in Gramm'),
    goal: z.string().describe('Ziel des Plans, z.B. Abnehmen'),
    diet: z.string().describe('Ernährungsform, z.B. Vegetarisch'),
  }),
  days: z.array(z.object({
    day: z.string().describe('Wochentag, z.B. Montag'),
    meals: z.array(z.object({
      type: z.string().describe('Mahlzeitentyp: Frühstück, Mittagessen, Abendessen, Snack'),
      name: z.string().describe('Name des Gerichts'),
      ingredients: z.array(z.string()).describe('Zutaten mit Mengenangabe'),
      prepTimeMinutes: z.number().describe('Zubereitungszeit in Minuten'),
      calories: z.number().describe('Kalorien der Mahlzeit'),
      protein: z.number().describe('Protein in Gramm'),
      carbs: z.number().describe('Kohlenhydrate in Gramm'),
      fat: z.number().describe('Fett in Gramm'),
    })),
    totalCalories: z.number().describe('Gesamtkalorien des Tages'),
    totalProtein: z.number().describe('Gesamtprotein des Tages in Gramm'),
    totalCarbs: z.number().describe('Gesamtkohlenhydrate des Tages in Gramm'),
    totalFat: z.number().describe('Gesamtfett des Tages in Gramm'),
  })).describe('7 Tage von Montag bis Sonntag'),
  tips: z.array(z.string()).describe('3 praktische Tipps zur Umsetzung'),
  disclaimer: z.string().describe('Haftungsausschluss'),
});

const trainingSchema = z.object({
  summary: z.object({
    goal: z.string().describe('Trainingsziel'),
    level: z.string().describe('Erfahrungslevel'),
    daysPerWeek: z.number().describe('Trainingstage pro Woche'),
    splitType: z.string().describe('Split-Typ, z.B. Push/Pull/Legs, Ganzkörper, Upper/Lower'),
  }),
  days: z.array(z.object({
    day: z.string().describe('Wochentag'),
    focus: z.string().describe('Fokus des Tages, z.B. Push – Brust, Schulter, Trizeps. Bei Ruhetag: Regeneration'),
    isRestDay: z.boolean().describe('true wenn Ruhetag'),
    warmup: z.array(z.string()).describe('Aufwärmübungen. Leer bei Ruhetag.'),
    exercises: z.array(z.object({
      name: z.string().describe('Name der Übung'),
      muscleGroup: z.string().describe('Beanspruchte Muskelgruppe'),
      sets: z.number().describe('Anzahl Sätze'),
      reps: z.string().describe('Wiederholungen, z.B. 8-12 oder 30s'),
      restSeconds: z.number().describe('Pause zwischen Sätzen in Sekunden'),
      notes: z.string().describe('Progressionshinweis oder Technik-Tipp'),
    })).describe('Übungen des Tages. Leer bei Ruhetag.'),
    cooldown: z.array(z.string()).describe('Cool-Down Übungen. Leer bei Ruhetag.'),
    estimatedMinutes: z.number().describe('Geschätzte Dauer in Minuten. 0 bei Ruhetag.'),
  })).describe('7 Tage von Montag bis Sonntag'),
  progressionPlan: z.string().describe('Progressionsstrategie über 4-6 Wochen'),
  tips: z.array(z.string()).describe('3 praktische Trainingstipps'),
  disclaimer: z.string().describe('Haftungsausschluss'),
});

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

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const validationError = validateInput(body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { type, userData } = body;
  const tdee = calculateTDEE(userData.gender, userData.age, userData.height, userData.weight, userData.activityLevel);
  const macros = calculateMacros(tdee, userData.goal);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'https://www.mahlzait.de');

  // Send macros first so client can display summary immediately
  res.write(`data: ${JSON.stringify({ event: 'macros', data: { tdee, ...macros } })}\n\n`);

  try {
    const tasks = [];

    if (type === 'meal' || type === 'both') {
      tasks.push({
        key: 'meal',
        prompt: buildMealPrompt(userData, macros),
        schema: mealSchema,
      });
    }
    if (type === 'training' || type === 'both') {
      tasks.push({
        key: 'training',
        prompt: buildTrainingPrompt(userData, macros),
        schema: trainingSchema,
      });
    }

    for (const task of tasks) {
      res.write(`data: ${JSON.stringify({ event: 'start', planType: task.key })}\n\n`);

      const result = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: task.prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: zodToJsonSchema(task.schema),
          maxOutputTokens: 8192,
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
    res.write(`data: ${JSON.stringify({ event: 'error', message: String(e.message) })}\n\n`);
    res.end();
  }
}
