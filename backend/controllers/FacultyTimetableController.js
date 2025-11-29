import Timetable from "../models/Timetable.js";

export const getFacultyTodayTimetable = async (req, res) => {
  try {
    const facultyId = req.user._id;

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const all = await Timetable.find({ day: today }).populate("student", "name");

    // Filter periods where this faculty teaches
    const result = [];

    all.forEach((row) => {
      row.periods.forEach((p) => {
        if (p.faculty?.toString() === facultyId.toString()) {
          result.push({
            studentName: row.student.name,
            start: p.start,
            end: p.end,
            subject: p.subject,
          });
        }
      });
    });

    res.json({ classes: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error loading faculty timetable" });
  }
};
