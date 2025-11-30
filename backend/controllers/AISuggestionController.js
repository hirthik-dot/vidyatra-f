// backend/controllers/AISuggestionController.js
import ClassTimetable from "../models/ClassTimetable.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getAISuggestions = async (req, res) => {
  try {
    const className = req.user.className;
    const todayName = DAYS[new Date().getDay()];

    const timetable = await ClassTimetable.findOne({
      className,
      day: todayName,
    });

    if (!timetable) {
      return res.json({ suggestions: [] });
    }

    const freePeriods = timetable.periods.filter((p) => p.isFreePeriod);

    const suggestions = freePeriods.map((p) => ({
      period: p.period,
      start: p.start,
      end: p.end,
      suggestion:
        "Use this free period to revise difficult topics, complete pending assignments, or explore career-related resources.",
    }));

    return res.json({ suggestions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "AI suggestion error" });
  }
};
