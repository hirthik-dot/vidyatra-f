// backend/routes/studentRoutes.js

import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getTodayTimetable } from "../controllers/StudentTimetableController.js";
import { getAISuggestions } from "../controllers/AiSuggestionController.js";
import { getStudentDashboard } from "../controllers/StudentController.js";
import { saveInterests } from "../controllers/studentInterestController.js";
import { markStudentAttendance } from "../controllers/AttendanceController.js";
import { getCurrentQR } from "../controllers/QrController.js";
import { getLiveQR } from "../controllers/AttendanceController.js";
import { generatePersonalMaterial } from "../controllers/StudyMaterialController.js";



import User from "../models/User.js";   // <-- IMPORTANT IMPORT ADDED HERE


const router = express.Router();

/* ==============================
   STUDENT INTERESTS
============================== */
router.post("/save-interests", authMiddleware, saveInterests);


/* ==============================
   STUDENT DASHBOARD
============================== */
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("student"),
  getStudentDashboard
);


/* ==============================
   STUDENT TIMETABLE
============================== */
router.get(
  "/timetable",
  authMiddleware,
  requireRole("student"),
  getTodayTimetable
);


/* ==============================
   AI SUGGESTIONS
============================== */
router.get(
  "/ai-suggestions",
  authMiddleware,
  requireRole("student"),
  getAISuggestions
);


/* ==============================
   MARK ATTENDANCE
============================== */
router.post(
  "/attendance/mark",
  authMiddleware,
  markStudentAttendance
);


/* ==============================
   LIVE QR
============================== */
router.get("/qr/current", getCurrentQR);
router.get("/qr/live", getLiveQR);


/* ==============================
   GET ALL STUDENTS (COMMUNICATION)
============================== */
router.get("/", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id name email department className");

    res.status(200).json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Error fetching students" });
  }
});

router.get(
  "/personal-material",
  authMiddleware,
  requireRole("student"),
  generatePersonalMaterial
);


/* ==============================
   FULL STUDENT LIST FOR UI PAGE
============================== */
router.get("/all/full", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name regNo dept section year dob email contact cgpa performance avatar"
    );

    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching full students:", err);
    res.status(500).json({ message: "Error fetching student data" });
  }
});


export default router;
