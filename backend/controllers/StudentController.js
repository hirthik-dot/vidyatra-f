// backend/controllers/StudentController.js
import Attendance from "../models/Attendance.js";
import Assignment from "../models/Assignment.js";
import Assessment from "../models/Assessment.js";
import LeaveRequest from "../models/LeaveRequest.js";
import BroadcastMessage from "../models/BroadcastMessage.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const studentId = user._id;
    const className = user.className || null;

    // -----------------------------------------
    // REAL-TIME ATTENDANCE
    // -----------------------------------------
    const attendanceRecords = await Attendance.find({ student: studentId });

    const totalSessions = attendanceRecords.length;
    const presentSessions = attendanceRecords.filter(
      (r) => r.status === "present"
    ).length;

    const attendancePercent = totalSessions
      ? Math.round((presentSessions / totalSessions) * 100)
      : 0;

    // -----------------------------------------
    // REAL-TIME ASSIGNMENTS PENDING
    // -----------------------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let assignmentsPending = 0;

    if (className) {
      const allAssignments = await Assignment.find({ className });

      assignmentsPending = allAssignments.filter((a) => {
        if (!a.dueDate) return false;
        const due = new Date(a.dueDate);
        return due >= today;
      }).length;
    }

    // -----------------------------------------
    // REAL-TIME ASSESSMENTS (replace exam tile)
    // -----------------------------------------
    let assessmentCount = 0;

    if (className) {
      const assessments = await Assessment.find({ className });
      assessmentCount = assessments.length;
    }

    // -----------------------------------------
    // REAL-TIME LEAVE SUMMARY
    // -----------------------------------------
    const leaveRequests = await LeaveRequest.find({ studentId });

    const pendingLeave = leaveRequests.filter(
      (r) => r.status === "pending"
    ).length;
    const approvedLeave = leaveRequests.filter(
      (r) => r.status === "approved"
    ).length;

    // -----------------------------------------
    // RECENT ANNOUNCEMENTS
    // -----------------------------------------
    const recentBroadcasts = await BroadcastMessage.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("faculty", "name");

    const announcements = recentBroadcasts.map((b) => {
      const from = b.faculty?.name || "Faculty";
      return `${b.title} — ${from}`;
    });

    // =====================================
    // FINAL RESPONSE (NOW includes assessmentCount)
    // =====================================
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        className: user.className,
        department: user.department,
        interests: user.interests || [],
      },
      stats: {
        attendancePercent,
        assignmentsPending,
        assessmentCount,
        pendingLeave,
        approvedLeave,
        announcements,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ message: "Server error loading dashboard" });
  }
};
