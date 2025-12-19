import express from "express";
import protect from "../middleware/authMiddleware.js";
import { generateGameQuestion } from "../controllers/gameController.js";

const router = express.Router();

// Generate AI-powered game questions
router.post("/generate-question", protect, generateGameQuestion);

export default router;
