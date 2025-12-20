import express from "express";
import { generateWeeklyTimetable } from "../controllers/weeklyTimetableController.js";

const router = express.Router();

router.get("/generate-weekly", generateWeeklyTimetable);

export default router;
