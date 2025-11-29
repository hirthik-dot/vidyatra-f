// backend/controllers/AdminTimetableController.js
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import Faculty from "../models/User.js";

// ---------------------------------------
// Mark a faculty absent for today
// ---------------------------------------
export const markFacultyAbsent = async (req, res) => {
  try {
    const { facultyId, date, reason } = req.body;

    // Validate
    if (!facultyId || !date) {
      return res.status(400).json({ message: "Faculty ID and date are required" });
    }

    // 1. Mark faculty as absent
    await User.findByIdAndUpdate(facultyId, { isAbsent: true });

    // 2. Update all timetable periods taught by this teacher
    await Timetable.updateMany(
      { teacherId: facultyId, date },
      { $set: { isFreePeriod: true, teacherAbsent: true, reason } }
    );

    return res.json({
      message: "Faculty marked absent and timetable updated",
    });
  } catch (err) {
    console.error("MarkAbsent Error:", err);
    return res.status(500).json({ message: "Server error marking absence" });
  }
};
