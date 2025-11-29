// backend/routes/facultyRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getFacultyTodayTimetable } from "../controllers/FacultyTimetableController.js";




const router = express.Router();

router.get("/timetable", authMiddleware, requireRole("faculty"), getFacultyTodayTimetable);

router.get(
  "/dashboard",
  authMiddleware,
  requireRole("faculty"),
  async (req, res) => {
    res.json({
      message: "Faculty dashboard data",
      user: req.user,
    });
  }
);

export default router;
