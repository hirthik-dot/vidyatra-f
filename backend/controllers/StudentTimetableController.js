import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

export const getTodayTimetable = async (req, res) => {
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

    const today = days[new Date().getDay()];

    // 1) Load timetable
    const periods = await Timetable.find({
      day: today,
      department: "CSE",
      year: 1
    })
      .sort({ period: 1 })
      .lean();

    // 2) Attach teacher details including subject
    for (let p of periods) {
      if (p.teacherId) {
        const teacher = await User.findById(p.teacherId).lean();
        p.teacherName = teacher?.name || "Unknown";
        p.subject = teacher?.subject || "Unknown";
      }

      // If teacher is absent → auto mark free
      if (p.teacherAbsent) {
        p.subject = "FREE PERIOD";
      }
    }

    return res.json({ day: today, periods });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading timetable" });
  }
};
