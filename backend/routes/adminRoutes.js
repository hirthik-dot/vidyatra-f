// backend/routes/adminRoutes.js
import express from "express";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import User from "../models/User.js";
import { seedWeeklyTimetable } from "../controllers/seedTimetableController.js";
import { getAllStudents } from "../controllers/adminController.js";
import { getClassStats } from "../controllers/adminClassController.js";

import {
  getTimetableMeta,
  getClassTimetable,
  saveClassTimetable,
  duplicateTimetable,
} from "../controllers/adminTimetableController.js";

import { getDashboardStats } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/faculty-list", protect, requireRole("admin"), async (req, res) => {
  const faculty = await User.find({ role: "faculty" });
  res.json({ faculty });
});

router.get("/students", protectAdmin, getAllStudents);

router.get("/seed-timetable", seedWeeklyTimetable);

router.get("/classes", protect, requireRole("admin"), getClassStats);

// TIMETABLE META (faculty + subjects)
router.get("/timetable/meta", protect, requireRole("admin"), getTimetableMeta);

// GET weekly timetable of a class
router.get(
  "/timetable/:className",
  protect,
  requireRole("admin"),
  getClassTimetable
);

// SAVE weekly timetable of a class
router.post(
  "/timetable/save",
  protect,
  requireRole("admin"),
  saveClassTimetable
);

// DUPLICATE timetable from one class to another
router.post(
  "/timetable/duplicate",
  protect,
  requireRole("admin"),
  duplicateTimetable
);

// ✅ SINGLE dashboard route (fixed)
router.get("/dashboard", protect, requireRole("admin"), getDashboardStats);

export default router;
