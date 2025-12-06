// backend/routes/studentAssessmentRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import Assessment from "../models/Assessment.js";
import AssessmentSubmission from "../models/AssessmentSubmission.js";

const router = express.Router();

/* =======================================================
   1️⃣ GET ALL ASSESSMENTS FOR STUDENT
   This route returns assessments + submitted flag
========================================================= */
router.get("/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Student class from token
    const studentClass = req.user.className;

    // Fetch all assessments for that class
    const assessments = await Assessment.find({ className: studentClass })
      .sort({ createdAt: -1 });

    // Fetch all submissions of this student
    const submissions = await AssessmentSubmission.find({ studentId });

    /* 🔍 DEBUG LOGS — to verify exact IDs being compared */
    console.log("Assessments IDs:", assessments.map(a => a._id.toString()));
    console.log("Submitted IDs:", submissions.map(s => s.assessmentId.toString()));

    /* FINAL & 100% RELIABLE MATCHING SYSTEM */
    const finalData = assessments.map((a) => ({
      ...a._doc,
      submitted: submissions.some(
        (s) => s.assessmentId.toString() === a._id.toString()
      ),
    }));

    return res.json(finalData);

  } catch (err) {
    console.error("Assessment fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   2️⃣ GET SINGLE ASSESSMENT TO ATTEMPT
========================================================= */
router.get("/view/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    return res.json(assessment);

  } catch (err) {
    console.error("View assessment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
