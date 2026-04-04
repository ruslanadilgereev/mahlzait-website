import { GoogleGenerativeAI } from '@google/generative-ai';

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
  // Honeypot check
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
- Jede Mahlzeit muss realistische, alltagstaugliche Gerichte enthalten
- Verwende gängige Zutaten die man in jedem deutschen Supermarkt bekommt
- Die Makros jeder Mahlzeit müssen angegeben werden
- Die Tagessumme muss den Vorgaben entsprechen (±50 kcal Toleranz)
- Abwechslung: Keine Mahlzeit darf sich innerhalb der 7 Tage wiederholen
- Alle Texte auf Deutsch

Antworte ausschließlich als valides JSON im folgenden Format:
{
  "summary": {
    "dailyCalories": number,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatGrams": number,
    "goal": "string",
    "diet": "string"
  },
  "days": [
    {
      "day": "Montag",
      "meals": [
        {
          "type": "Frühstück",
          "name": "Name des Gerichts",
          "ingredients": ["Zutat 1 (Menge)", "Zutat 2 (Menge)"],
          "prepTimeMinutes": number,
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      ],
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number
    }
  ],
  "tips": ["Tipp 1", "Tipp 2", "Tipp 3"],
  "disclaimer": "Dieser Plan dient der Orientierung und ersetzt keine professionelle Ernährungsberatung."
}`;
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
- Erstelle einen Plan für 7 Tage (Trainingstage + Ruhetage)
- Ruhetage klar markieren
- Für jede Übung: Name, Muskelgruppe, Sätze, Wiederholungen, Pause
- Warm-Up und Cool-Down für jeden Trainingstag
- Progressive Overload Hinweise geben
- Zum Level passende Übungen wählen (keine komplexen Olympischen Lifts für Anfänger)
- Alle Texte auf Deutsch

Antworte ausschließlich als valides JSON im folgenden Format:
{
  "summary": {
    "goal": "string",
    "level": "string",
    "daysPerWeek": number,
    "splitType": "string (z.B. Push/Pull/Legs, Ganzkörper, Upper/Lower)"
  },
  "days": [
    {
      "day": "Montag",
      "focus": "Push – Brust, Schulter, Trizeps",
      "isRestDay": false,
      "warmup": ["Übung 1 (Dauer/Wiederholungen)", "Übung 2"],
      "exercises": [
        {
          "name": "Bankdrücken",
          "muscleGroup": "Brust",
          "sets": 4,
          "reps": "8-12",
          "restSeconds": 90,
          "notes": "Gewicht jede Woche um 2.5kg steigern"
        }
      ],
      "cooldown": ["Dehnung 1", "Dehnung 2"],
      "estimatedMinutes": number
    }
  ],
  "progressionPlan": "Beschreibung der Progressionsstrategie über 4-6 Wochen",
  "tips": ["Tipp 1", "Tipp 2", "Tipp 3"],
  "disclaimer": "Dieser Plan dient der Orientierung und ersetzt keine professionelle Trainingsberatung. Konsultiere bei gesundheitlichen Einschränkungen einen Arzt."
}`;
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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-pro-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  });

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
      tasks.push({ key: 'meal', prompt: buildMealPrompt(userData, macros) });
    }
    if (type === 'training' || type === 'both') {
      tasks.push({ key: 'training', prompt: buildTrainingPrompt(userData, macros) });
    }

    for (const task of tasks) {
      res.write(`data: ${JSON.stringify({ event: 'start', planType: task.key })}\n\n`);

      const result = await model.generateContent(task.prompt);
      const text = result.response.text();

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        res.write(`data: ${JSON.stringify({ event: 'error', planType: task.key, message: 'Failed to parse AI response' })}\n\n`);
        continue;
      }

      // Stream days one by one for progressive rendering
      if (parsed.days && Array.isArray(parsed.days)) {
        // Send summary first
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
