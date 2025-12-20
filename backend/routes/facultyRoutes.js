import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

/* DASHBOARD */
import {
  getFacultyDashboard,
} from "../controllers/facultyDashboardController.js";

/* ATTENDANCE */
import {
  getMyClassStudents,
  getPresentStudentsForFaculty,
  getFacultyAttendanceForDay,
} from "../controllers/facultyAttendanceController.js";

/* TIMETABLE */
import {
  getFacultyTodayTimetable,
  markFacultyPeriodAbsent,
  getTodayFreePeriods,
  claimFreePeriod,
  getFacultyWeeklyTimetable,
} from "../controllers/facultyTimetableController.js";

const router = express.Router();
const protectFaculty = [protect, requireRole("faculty")];

/* ---------------- DASHBOARD ---------------- */
router.get("/dashboard", protectFaculty, getFacultyDashboard);

/* ---------------- TIMETABLE ---------------- */
router.get("/timetable", protectFaculty, getFacultyTodayTimetable);
router.post("/timetable/mark-absent", protectFaculty, markFacultyPeriodAbsent);
router.get("/free-periods", protectFaculty, getTodayFreePeriods);
router.post("/timetable/claim", protectFaculty, claimFreePeriod);
router.get("/timetable/weekly", protectFaculty, getFacultyWeeklyTimetable);

/* ---------------- ATTENDANCE ---------------- */
router.get("/students", protectFaculty, getMyClassStudents);
router.get("/attendance/current", protectFaculty, getPresentStudentsForFaculty);
router.get("/attendance/day", protectFaculty, getFacultyAttendanceForDay);

export default router;
