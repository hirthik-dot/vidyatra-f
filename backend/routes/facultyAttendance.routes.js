import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getFacultyAttendanceForDay
} from "../controllers/FacultyAttendance.controller.js";

const router = express.Router();

// This pattern is correct 👍
const protectFaculty = [protect, requireRole("faculty")];

router.get("/day", protectFaculty, getFacultyAttendanceForDay);

export default router;
