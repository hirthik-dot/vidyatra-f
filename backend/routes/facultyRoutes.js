// backend/routes/facultyRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getFacultyTodayTimetable,
  markFacultyPeriodAbsent,
  getTodayFreePeriods,
  claimFreePeriod,
} from "../controllers/FacultyTimetableController.js";

import {
  getMyClassStudents,
  getPresentStudentsForFaculty,
} from "../controllers/FacultyAttendanceController.js";

const router = express.Router();

// Helper: protects faculty routes
const protectFaculty = [authMiddleware, requireRole("faculty")];

/* ---------------------------------------------------------
   FACULTY TIMETABLE ROUTES
---------------------------------------------------------- */
console.log("HIT /faculty/attendance/current");

// Get today's timetable
router.get("/timetable", protectFaculty, getFacultyTodayTimetable);

// Mark period absent
router.post("/timetable/mark-absent", protectFaculty, markFacultyPeriodAbsent);

// Get all free periods
router.get("/free-periods", protectFaculty, getTodayFreePeriods);

// Claim (attend) a free period
router.post("/timetable/claim", protectFaculty, claimFreePeriod);

/* ---------------------------------------------------------
   FACULTY ATTENDANCE ROUTES
---------------------------------------------------------- */

// ⭐ Get students of faculty’s class
router.get("/students", protectFaculty, getMyClassStudents);

// ⭐ Get students present in current period
router.get("/attendance/current", protectFaculty, getPresentStudentsForFaculty);

export default router;
