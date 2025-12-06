// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";  // MUST COME FIRST
import studentRoutes from "./routes/studentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resumeRouter from "./routes/resume.js";
import facultyProfileRoutes from "./routes/facultyProfile.js";
import studentProfileRoutes from "./routes/studentProfile.js";
import communicationRoutes from "./routes/communication.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import studentChatbotRoutes from "./routes/studentChatbotRoutes.js";



dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve ALL uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ==================================================
// 🔥 ROUTES ORDER (VERY IMPORTANT)
// ==================================================

// 1️⃣ Assignments & Assessments (these include /student/** and /faculty/** endpoints)
app.use("/api", assignmentRoutes);

// 2️⃣ Authentication
app.use("/api/auth", authRoutes);

// 3️⃣ Student, Faculty, Admin
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);

// 4️⃣ Profiles
app.use("/api/faculty/profile", facultyProfileRoutes);
app.use("/api/student/profile", studentProfileRoutes);

// 5️⃣ Communication
app.use("/api/communication", communicationRoutes);

// 6️⃣ Leave / OD Requests
app.use("/api/leave", leaveRoutes);

// 7️⃣ Resume Builder
app.use("/api/resume", resumeRouter);

// Default root route
app.get("/", (req, res) => {
  res.send("VIDYATRA backend is running 🚀");
});

app.use("/api/student", studentChatbotRoutes);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
