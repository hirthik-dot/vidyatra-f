// backend/routes/adminRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { markFacultyAbsent } from "../controllers/AdminTimetableController.js";
import User from "../models/User.js";
import { seedWeeklyTimetable } from "../controllers/seedTimetableController.js";
import { protectAdmin } from "../middleware/AuthMiddleware.js";
import { getAllStudents } from "../controllers/AdminController.js";





const router = express.Router();


router.get("/faculty-list", authMiddleware, requireRole("admin"), async (req, res) => {
  const faculty = await User.find({ role: "faculty" });
  res.json({ faculty });
});

router.get("/students", protectAdmin, getAllStudents);

router.post("/faculty/absent", authMiddleware, requireRole("admin"), markFacultyAbsent);
router.get("/seed-timetable", seedWeeklyTimetable);
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    res.json({
      message: "Admin dashboard data",
      user: req.user,
    });
  }
);

// Example: admin can list all users later
// router.get("/users", protect, requireRole("admin"), ...)

export default router;
