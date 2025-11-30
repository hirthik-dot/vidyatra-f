// backend/controllers/StudentTimetableController.js
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

export const getTodayTimetable = async (req, res) => {
  try {
    let todayName = DAYS[new Date().getDay()];

    // ⭐ FIX: If today is weekend, force Monday timetable
    if (todayName === "Saturday" || todayName === "Sunday") {
      todayName = "Monday";
    }

    const className = req.user.className; // "CSE-A"

    const timetable = await ClassTimetable.findOne({
      className,
      day: todayName,
    }).populate("periods.faculty periods.substituteFaculty");

    if (!timetable) {
      return res.json({ day: todayName, periods: [] });
    }

    const periods = timetable.periods.map((p) => ({
      period: p.period,
      subject: p.subject,
      start: p.start,
      end: p.end,
      isFreePeriod: p.isFreePeriod,
      teacherAbsent: p.teacherAbsent,
      facultyName: p.substituteFaculty
        ? p.substituteFaculty.name + " (Substitute)"
        : p.faculty
        ? p.faculty.name
        : "TBA",
    }));

    return res.json({
      day: timetable.day,
      periods,
    });
  } catch (err) {
    console.error("Student Timetable Error:", err);
    return res
      .status(500)
      .json({ message: "Error loading student timetable" });
  }
};
