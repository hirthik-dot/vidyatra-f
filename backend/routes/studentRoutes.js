// backend/routes/studentRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getStudentDashboard } from "../controllers/StudentController.js";
import { getTodayTimetable } from "../controllers/StudentTimetableController.js";
import { getAISuggestions } from "../controllers/AISuggestionController.js";

const router = express.Router();

// AI Suggestions
router.get(
  "/ai-suggestions",
  authMiddleware,
  requireRole("student"),
  getAISuggestions
);

// Student Timetable (Today)
router.get(
  "/timetable",
  authMiddleware,
  requireRole("student"),
  getTodayTimetable
);

// Student Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("student"),
  getStudentDashboard
);

export default router;
