// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resumeRouter from "./routes/resume.js";
import facultyProfileRoutes from "./routes/facultyProfile.js";
import studentProfileRoutes from "./routes/studentProfile.js";
import communicationRoutes from "./routes/communication.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import studentChatbotRoutes from "./routes/studentChatbotRoutes.js";
import adminStudentRoutes from "./routes/adminStudentRoutes.js";
import adminFacultyRoutes from "./routes/adminFacultyRoutes.js";

import studentAssessmentRoutes from "./routes/studentAssessmentRoutes.js";
import studentAssessmentSubmitRoutes from "./routes/studentAssessmentSubmitRoutes.js";
import facultyAssessmentRoutes from "./routes/facultyAssessmentRoutes.js";
import xpRoutes from "./routes/xpRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";



dotenv.config();
const app = express();
app.set("trust proxy", true);


connectDB();

app.use(cors());
app.use(express.json());

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   🔥 FINAL ROUTE ORDER — DO NOT CHANGE ANYTHING BELOW
========================================================= */

// 1️⃣ AUTH
app.use("/api/auth", authRoutes);

// 2️⃣ ASSIGNMENTS (contains /student/assessments → must come early)
app.use("/api", assignmentRoutes);

// 3️⃣ ASSESSMENTS (our routes) — give them THEIR OWN PREFIX
app.use("/api/student-assessments", studentAssessmentRoutes); // GET assessments
app.use("/api/student/assessment", studentAssessmentSubmitRoutes); // SUBMIT
app.use("/api/faculty/assessments", facultyAssessmentRoutes); // FACULTY

// 4️⃣ STUDENT ROUTES
app.use("/api/student", studentRoutes);
app.use("/api/student/profile", studentProfileRoutes);
app.use("/api/student", studentChatbotRoutes);

// 5️⃣ FACULTY
app.use("/api/faculty", facultyRoutes);
app.use("/api/faculty/profile", facultyProfileRoutes);

// 6️⃣ ADMIN
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminStudentRoutes);
app.use("/api/admin", adminFacultyRoutes);

// 7️⃣ OTHER ROUTES
app.use("/api/communication", communicationRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/resume", resumeRouter);
app.use("/api/student", xpRoutes); // ⭐ ADD THIS LINE
app.use("/api/games", gameRoutes);



// Default root route
app.get("/", (req, res) => {
  res.send("VIDYATRA backend is running 🚀");
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
