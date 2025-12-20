import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getFacultyAttendanceForDay
} from "../controllers/facultyAttendanceController.js";

const router = express.Router();

// Reusable middleware chain
const protectFaculty = [protect, requireRole("faculty")];

// GET faculty attendance for a specific day
router.get("/day", protectFaculty, getFacultyAttendanceForDay);

export default router;
