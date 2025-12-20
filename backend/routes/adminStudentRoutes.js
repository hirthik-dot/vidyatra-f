import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/adminStudentController.js";

const router = express.Router();

// GET all students
router.get("/students", protect, requireRole("admin"), getStudents);

// CREATE student
router.post("/students", protect, requireRole("admin"), createStudent);

// UPDATE student
router.put("/students/:id", protect, requireRole("admin"), updateStudent);

// DELETE student
router.delete("/students/:id", protect, requireRole("admin"), deleteStudent);

export default router;
