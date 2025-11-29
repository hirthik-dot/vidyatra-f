// backend/controllers/StudentController.js
import StudentStats from "../models/StudentStats.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const stats = await StudentStats.findOne({ user: req.user._id });

    if (!stats) {
      return res.json({
        user: req.user,
        stats: {
          attendancePercent: 0,
          assignmentsPending: 0,
          upcomingExams: 0,
          announcements: [],
        },
      });
    }

    res.json({
      user: req.user,
      stats: {
        attendancePercent: stats.attendancePercent,
        assignmentsPending: stats.assignmentsPending,
        upcomingExams: stats.upcomingExams,
        announcements: stats.announcements,
      },
    });
  } catch (err) {
    console.error("getStudentDashboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
