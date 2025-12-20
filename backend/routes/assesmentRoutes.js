import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getFacultyAssessments,
  getAssessmentById,
  submitAssessment,
  getAssessmentSubmissions,
} from "../controllers/AssessmentController.js";

const router = express.Router();

// Faculty
router.get(
  "/faculty/all",
  protect,
  requireRole("faculty"),
  getFacultyAssessments
);

// Student view
router.get("/:id", protect, requireRole("student"), getAssessmentById);

// Student submit
router.post("/submit", protect, requireRole("student"), submitAssessment);

// Faculty – get submissions
router.get(
  "/submissions/:assessmentId",
  protect,
  requireRole("faculty"),
  getAssessmentSubmissions
);

export default router;
