// backend/controllers/gameController.js
import ollama from "ollama";

// In-memory cache to prevent regenerating same game
const gameCache = new Map();

// Utility: clean broken JSON safely
function safeJsonParse(str) {
  try {
    // Remove any non-JSON junk before/after bracket
    const cleaned = str.substring(str.indexOf("{"), str.lastIndexOf("}") + 1);
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// MAIN FUNCTION
export const generateGameQuestion = async (req, res) => {
  try {
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    // If already generated once → return cached
    if (gameCache.has(gameId)) {
      return res.json(gameCache.get(gameId));
    }

    const prompt = `
You are an expert educational content generator.
Your job is to output PERFECT JSON for interactive learning games.

Follow this EXACT structure:

{
  "gameId": "string",
  "title": "string",
  "description": "string",
  "type": "mcq | ordering | debugging | security",
  "difficulty": "easy | medium | hard",
  "xp": number,
  "question": {
    "prompt": "string",

    // For ordering games
    "items": [],
    "correctOrder": [],

    // For MCQs
    "options": [],
    "correct": "",
    "explanation": "",

    // For debugging/security
    "code": "",
    "correctExplanation": ""
  }
}

Rules:
- Only output JSON.
- No text before or after JSON.
- Be clear, high-quality, and professional.
- Difficulty should match real academic content.

You are an educational AI. 
Your output is ONLY clean JSON.

STRICT RULES:
- Do NOT add any advice like "discuss with mentor" or "validate in demo".
- Do NOT mention teachers, judges, mentors, demos, or external validation.
- The student MUST be able to complete the task independently.
- The answer MUST be verifiable and clear.
- No surrounding text, only JSON.

Follow this EXACT structure:

{ ... JSON STRUCTURE HERE ... }


Now generate a high quality game question for: "${gameId}"
`;

    const models = ["qwen2.5:7b", "qwen2.5-coder:7b", "llama3.1:8b"];

    let finalJson = null;

    // Try each model with retries
    for (const model of models) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🧠 Generating with ${model}, attempt ${attempt}`);

          const response = await ollama.generate({
            model,
            prompt,
            format: "json"
          });

          // Try parsing JSON safely
          const parsed = safeJsonParse(response.response);

          if (parsed && parsed.gameId) {
            console.log(`✅ Success with ${model}`);

            // Cache result so repeated loads are instant
            gameCache.set(gameId, parsed);

            return res.json(parsed);
          } else {
            console.log(`⚠️ Invalid JSON from ${model}:`, response.response);
          }
        } catch (err) {
          console.log(`❌ Error with ${model}, attempt ${attempt}:`, err);
        }
      }
    }

    // If all retries fail
    return res
      .status(500)
      .json({ message: "All AI models failed to generate valid JSON." });
  } catch (error) {
    console.error("❌ Fatal AI Error:", error);
    res.status(500).json({ message: "Backend AI error" });
  }
};
