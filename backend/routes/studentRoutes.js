// backend/routes/studentRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getTodayTimetable } from "../controllers/StudentTimetableController.js";
import { getAISuggestions } from "../controllers/AISuggestionController.js";
import { getStudentDashboard } from "../controllers/StudentController.js";
import { saveInterests } from "../controllers/studentInterestController.js";
import { markStudentAttendance } from "../controllers/AttendanceController.js";
import { getCurrentQR } from "../controllers/QrController.js";
import { getLiveQR } from "../controllers/AttendanceController.js";











const router = express.Router();

router.post("/save-interests", authMiddleware, saveInterests);

// Dashboard data
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("student"),
  getStudentDashboard
);

// Today's timetable
router.get(
  "/timetable",
  authMiddleware,
  requireRole("student"),
  getTodayTimetable
);

// AI suggestions (free period tasks)
router.get(
  "/ai-suggestions",
  authMiddleware,
  requireRole("student"),
  getAISuggestions
);

router.post(
  "/attendance/mark",
  authMiddleware,
  markStudentAttendance
);

router.get("/qr/current", getCurrentQR);

router.get("/qr/current", getLiveQR);


export default router;
