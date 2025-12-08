// backend/controllers/AiSuggestionController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import ClassTimetable from "../models/ClassTimetable.js";
import StudentStats from "../models/StudentStats.js";
import User from "../models/User.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

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

function formatInterests(interests = []) {
  if (!interests.length) return "No specific interests provided.";
  if (interests.length === 1) return interests[0];
  return interests.join(", ");
}

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
- This period is FREE.

TASK:
1. Suggest exactly ONE activity based on the student's PERSONAL INTERESTS.
2. Suggest exactly ONE activity focused on STUDIES.

OUTPUT FORMAT:
Return ONLY this JSON:

{
  "interest": {
    "period": ${period.period},
    "start": "${period.start}",
    "end": "${period.end}",
    "label": "Personal Interest",
    "suggestion": ""
  },
  "academic": {
    "period": ${period.period},
    "start": "${period.start}",
    "end": "${period.end}",
    "label": "Academic / Studies",
    "suggestion": ""
  }
}

No markdown. No extra text. Only valid JSON.
`;
}

// ------------------ MAIN CONTROLLER ------------------

export const getAISuggestions = async (req, res) => {
  try {
    // ---------------- USER ----------------
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

    // ---------------- TIMETABLE ----------------
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

    const current = findCurrentPeriod(timetable.periods);

    if (!current) {
      return res.json({
        message: "No active period right now.",
        suggestions: [],
      });
    }

    // Free period check
    const isFree =
      current.isFreePeriod === true ||
      (current.subject && current.subject.toLowerCase().includes("free"));

    if (!isFree) {
      return res.json({
        message: `Current period (${current.subject}) is not a free period.`,
        suggestions: [],
      });
    }

    // ---------------- STATS ----------------
    const statsDoc = await StudentStats.findOne({ user: user._id });

    const stats = {
      attendancePercent: statsDoc?.attendancePercent ?? 0,
      assignmentsPending: statsDoc?.assignmentsPending ?? 0,
      upcomingExams: statsDoc?.upcomingExams ?? 0,
    };

    const interests = user.interests || [];

    // ---------------- PROMPT ----------------
    const prompt = buildPrompt({
      user,
      interests,
      stats,
      period: current,
    });

    // ---------------- GEMINI CALL ----------------
    let aiText = "";

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(prompt);
      aiText = result.response.text();

      console.log("AI RAW (Gemini):", aiText);
    } catch (err) {
      console.error("Gemini API Error:", err);
      aiText = "";
    }

    // ---------------- JSON PARSE ----------------
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      console.error("AI JSON parse error, raw text:", aiText);

      // Fallback simple suggestions
      const fallback = [
        {
          type: "interest",
          period: current.period,
          start: current.start,
          end: current.end,
          suggestion:
            interests.length > 0
              ? `Use this free period to work on your interest in "${interests[0]}".`
              : "Use this free period to explore any topic you like.",
        },
        {
          type: "academic",
          period: current.period,
          start: current.start,
          end: current.end,
          suggestion:
            stats.attendancePercent < 75
              ? "Your attendance is low. Revise missed topics."
              : "Revise notes or complete pending assignments.",
        },
      ];

      return res.json({
        message: "Fallback suggestions (AI JSON invalid).",
        suggestions: fallback,
      });
    }

    // ---------------- NORMALIZE ----------------
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

    // ---------------- RESPONSE ----------------
    return res.json({
      message: "Suggestions generated.",
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
      message: "AI engine error",
      suggestions: [],
    });
  }
};
