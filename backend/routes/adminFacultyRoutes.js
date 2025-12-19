import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "../controllers/AdminFacultyController.js";

const router = express.Router();

// GET all faculty
router.get(
  "/faculty",
  protect,
  requireRole("admin"),
  getFaculty
);

// CREATE faculty
router.post(
  "/faculty",
  protect,
  requireRole("admin"),
  createFaculty
);

// UPDATE faculty
router.put(
  "/faculty/:id",
  protect,
  requireRole("admin"),
  updateFaculty
);

// DELETE faculty
router.delete(
  "/faculty/:id",
  protect,
  requireRole("admin"),
  deleteFaculty
);

export default router;
