// backend/controllers/gameController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import GameHistory from "../models/GameHistory.js"; 
import User from "../models/User.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const gameCache = new Map();

// ---------- HELPERS ----------
function safeParseJSON(str) {
  try {
    const cleaned = str.substring(str.indexOf("{"), str.lastIndexOf("}") + 1);
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function detectGameType(gameId) {
  const id = gameId.toLowerCase();

  if (id.includes("sql") || id.includes("query")) return "debugging";
  if (id.includes("security") || id.includes("cyber")) return "security";
  if (id.includes("order") || id.includes("sort")) return "ordering";

  return "mcq";
}

function xpForDifficulty(d) {
  if (d === "easy") return 10;
  if (d === "medium") return 20;
  return 40;
}

// ---------- ADAPTIVE DIFFICULTY ----------
async function getAdaptiveDifficulty(userId, gameId) {
  const history = await GameHistory.find({ userId, gameId })
    .sort({ createdAt: -1 })
    .limit(5);

  if (history.length < 2) return "easy";

  const recentScores = history.map((h) => h.correct ? 1 : 0);
  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (avg >= 0.8) return "hard";     // consistently right → hard mode
  if (avg >= 0.4) return "medium";   // mixed accuracy → medium
  return "easy";                     // struggling → easy
}

// ---------- MAIN GAME GENERATION ----------
export const generateGameQuestion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameId } = req.body;

    if (!gameId)
      return res.status(400).json({ message: "gameId is required" });

    const autoType = detectGameType(gameId);

    // --- Get adaptive difficulty ---
    const adaptiveDifficulty = await getAdaptiveDifficulty(userId, gameId);
    console.log("🎯 Adaptive difficulty:", adaptiveDifficulty);

    // --- PROMPT WITH STRICT TEMPLATES ---
    const prompt = `
You are an expert educational game generator.
You must output STRICT JSON ONLY.

GAME TYPE: "${autoType}"
GOAL DIFFICULTY: "${adaptiveDifficulty}"

JSON TEMPLATE (USE EXACTLY THIS, NO EXTRA FIELDS):

{
  "gameId": "${gameId}",
  "title": "string",
  "description": "string",
  "type": "${autoType}",
  "difficulty": "${adaptiveDifficulty}",
  "xp": number,
  "question": {
    "prompt": "string",
    "items": [],
    "correctOrder": [],
    "options": [],
    "correct": "",
    "explanation": "",
    "code": "",
    "correctExplanation": ""
  }
}

RULES:
- OUTPUT JSON ONLY, NO MARKDOWN.
- difficulty MUST be "${adaptiveDifficulty}"
- xp MUST match difficulty: easy=10, medium=20, hard=40
- The game MUST be solvable by a student.
- The JSON MUST BE CLEAN.
- Follow template EXACTLY.

Now create a UNIQUE question for "${gameId}".
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let output = null;

    for (let i = 1; i <= 3; i++) {
      console.log(`⚡ Gemini attempt ${i}`);

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text);

      if (!parsed) continue;

      // XP auto-apply
      parsed.xp = xpForDifficulty(parsed.difficulty);

      // Avoid duplicates
      const cached = gameCache.get(gameId);
      if (cached && cached.question.prompt === parsed.question.prompt)
        continue;

      output = parsed;
      break;
    }

    if (!output) {
      return res
        .status(500)
        .json({ message: "Gemini failed to produce valid JSON after retries." });
    }

    // Cache new question
    gameCache.set(gameId, output);

    // Store in Database (Analytics)
    await GameHistory.create({
      userId,
      gameId,
      question: output.question.prompt,
      difficulty: output.difficulty,
      xp: output.xp,
      correct: null, // not answered yet
    });

    return res.json(output);
  } catch (err) {
    console.error("❌ PRO MAX ENGINE ERROR:", err);
    res.status(500).json({
      message: "Game engine error",
    });
  }
};
