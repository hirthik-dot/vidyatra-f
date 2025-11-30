// backend/controllers/AiSuggestionController.js
import ollama from "ollama";
import ClassTimetable from "../models/ClassTimetable.js";
import StudentStats from "../models/StudentStats.js";
import User from "../models/User.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// If it's Saturday/Sunday, treat it as Monday for timetable
function getTodayName() {
  let d = DAYS[new Date().getDay()];
  if (d === "Saturday" || d === "Sunday") d = "Monday";
  return d;
}

// "09:00" -> minutes
function timeStringToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Return the period happening *right now*
function findCurrentPeriod(periods) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return periods.find((p) => {
    const startMin = timeStringToMinutes(p.start);
    const endMin = timeStringToMinutes(p.end);
    return nowMin >= startMin && nowMin <= endMin;
  });
}

// Safely get student's interests as a readable string
function formatInterests(interests = []) {
  if (!interests.length) return "No specific interests provided.";
  if (interests.length === 1) return interests[0];
  return interests.join(", ");
}

// Build a super strict prompt so Ollama returns what we want
function buildPrompt({ user, interests, stats, period }) {
  const interestsText = formatInterests(interests);

  return `
You are an AI assistant helping a college student use their FREE period productively.

Student profile:
- Name: ${user.name}
- Class: ${user.className || "N/A"}
- Interests: ${interestsText}
- Attendance: ${stats.attendancePercent}% 
- Pending assignments: ${stats.assignmentsPending}
- Upcoming exams: ${stats.upcomingExams}

Current period details:
- Period number: ${period.period}
- Period label: ${period.subject}
- Time: ${period.start} - ${period.end}
- This period is FREE (student can use this time flexibly).

TASK:
1. Suggest exactly ONE activity based on the student's PERSONAL INTERESTS.
2. Suggest exactly ONE activity focused on ACADEMICS / STUDIES (based on attendance, assignments, exams etc.).

RULES:
- Activities must be realistic and doable in this single free period (${period.start} - ${period.end}).
- Study suggestion can target weakest/important areas (low attendance, pending assignments, upcoming exams).
- Interest suggestion should be aligned with the interests list.

OUTPUT FORMAT (VERY IMPORTANT):
Return ONLY a valid JSON object, with NO extra text, in this shape:

{
  "interest": {
    "period": ${period.period},
    "start": "${period.start}",
    "end": "${period.end}",
    "label": "Personal Interest",
    "suggestion": "..."
  },
  "academic": {
    "period": ${period.period},
    "start": "${period.start}",
    "end": "${period.end}",
    "label": "Academic / Studies",
    "suggestion": "..."
  }
}

Do NOT include explanations, markdown, or any text outside this JSON.
`;
}

// ------------------ MAIN CONTROLLER ------------------

export const getAISuggestions = async (req, res) => {
  try {
    // 1) Load student
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found", suggestions: [] });
    }

    if (!user.className) {
      return res.json({
        message: "No class assigned to student yet.",
        suggestions: [],
      });
    }

    const todayName = getTodayName();

    // 2) Load today's timetable for this class
    const timetable = await ClassTimetable.findOne({
      className: user.className,
      day: todayName,
    });

    if (!timetable || !timetable.periods || timetable.periods.length === 0) {
      return res.json({
        message: `No timetable found for ${todayName}.`,
        suggestions: [],
      });
    }

    // 3) Find the current period
    const current = findCurrentPeriod(timetable.periods);

    if (!current) {
      return res.json({
        message: "No active period right now (outside timetable time).",
        suggestions: [],
      });
    }

    // 4) Check if the current period is actually FREE
    const isFree =
      current.isFreePeriod === true ||
      (current.subject && current.subject.toLowerCase().includes("free"));

    if (!isFree) {
      return res.json({
        message: `Current period (${current.subject}) is not a free period.`,
        suggestions: [],
      });
    }

    // 5) Load stats (attendance, assignments, exams)
    const statsDoc = await StudentStats.findOne({ user: user._id });

    const stats = {
      attendancePercent: statsDoc?.attendancePercent ?? 0,
      assignmentsPending: statsDoc?.assignmentsPending ?? 0,
      upcomingExams: statsDoc?.upcomingExams ?? 0,
    };

    const interests = user.interests || [];

    // 6) Build prompt for Ollama
    const prompt = buildPrompt({
      user,
      interests,
      stats,
      period: current,
    });

    // 7) Call Ollama
    const modelName = process.env.OLLAMA_MODEL || "llama3.2:1b";

    const response = await ollama.generate({
      model: modelName,
      prompt,
    });

    console.log("AI RAW:", response);

    const aiText = response.response || "";

    // 8) Parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      console.error("AI JSON parse error, raw text:", aiText);
      // Fallback simple suggestions if model messes up JSON
      const fallbackSuggestions = [
        {
          type: "interest",
          period: current.period,
          start: current.start,
          end: current.end,
          suggestion:
            interests.length > 0
              ? `Use this free period to work on your interest in "${interests[0]}". For example, watch a tutorial or practice something practical for 30–40 minutes.`
              : "Use this free period to explore any topic you personally like. Read an article, watch a short tutorial, or practice a skill you enjoy.",
        },
        {
          type: "academic",
          period: current.period,
          start: current.start,
          end: current.end,
          suggestion:
            stats.attendancePercent < 75
              ? "Your attendance is below 75%. Use this free period to revise topics from the subjects where you missed classes."
              : "Use this free period to revise notes, complete pending assignments, or solve previous year question papers for upcoming exams.",
        },
      ];

      return res.json({
        message: "Fallback suggestions (AI JSON was invalid).",
        suggestions: fallbackSuggestions,
      });
    }

    // 9) Normalized suggestions array for frontend
    const suggestions = [];

    if (parsed.interest) {
      suggestions.push({
        type: "interest",
        period: parsed.interest.period,
        start: parsed.interest.start,
        end: parsed.interest.end,
        label: parsed.interest.label || "Personal Interest",
        suggestion: parsed.interest.suggestion,
      });
    }

    if (parsed.academic) {
      suggestions.push({
        type: "academic",
        period: parsed.academic.period,
        start: parsed.academic.start,
        end: parsed.academic.end,
        label: parsed.academic.label || "Academic / Studies",
        suggestion: parsed.academic.suggestion,
      });
    }

    return res.json({
      message: "Suggestions generated for current free period.",
      period: {
        number: current.period,
        subject: current.subject,
        start: current.start,
        end: current.end,
      },
      suggestions,
    });
  } catch (err) {
    console.error("AI Suggestion Error:", err);
    return res.status(500).json({
      message: "AI suggestion engine error",
      suggestions: [],
    });
  }
};
