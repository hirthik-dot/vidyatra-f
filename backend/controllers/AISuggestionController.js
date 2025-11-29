// backend/controllers/AISuggestionController.js
import Timetable from "../models/Timetable.js";

export const getAISuggestions = async (req, res) => {
  try {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    const todayName = days[new Date().getDay()];

    // Load timetable for today
    const timetable = await Timetable.find({ day: todayName });

    // 🛑 If no timetable exists → return empty response (NO ERROR)
    if (!timetable || timetable.length === 0) {
      return res.json({
        message: "No timetable found for today",
        suggestions: [],
      });
    }

    // Identify free periods
    const freePeriods = timetable.filter((p) => p.teacherAbsent === true);

    // No free periods → no suggestions
    if (freePeriods.length === 0) {
      return res.json({
        message: "No free periods today",
        suggestions: [],
      });
    }

    // Simple AI suggestions (MVP)
    const suggestions = freePeriods.map((p) => ({
      period: p.period,
      start: p.start,
      end: p.end,
      suggestion: "Revise your weak subjects or complete pending assignments",
    }));

    return res.json({ suggestions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "AI suggestion error" });
  }
};
