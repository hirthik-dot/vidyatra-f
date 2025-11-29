// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// Middleware
import authMiddleware from "./middleware/AuthMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentAiRoutes from "./routes/studentAi.routes.js";
import studentTimetableRoutes from "./routes/studentTimetable.routes.js";
import weeklyTimetableRoutes from "./routes/weeklyTimetableRoutes.js";

dotenv.config();
const app = express();

// Connect DB
connectDB();

// Global middleware
app.use(cors());
app.use(express.json());

// 🔵 AUTH ROUTES (PUBLIC)
app.use("/api/auth", authRoutes);

// 🟢 STUDENT ROUTES (PROTECTED)
app.use("/api/student", authMiddleware, studentRoutes);
app.use("/api/student", authMiddleware, studentAiRoutes);
app.use("/api/student", authMiddleware, studentTimetableRoutes);

// 🟣 FACULTY ROUTES (PROTECTED)
app.use("/api/faculty", authMiddleware, facultyRoutes);

// 🟠 ADMIN ROUTES (PROTECTED)
app.use("/api/admin", authMiddleware, adminRoutes);

// 🟡 GENERATE / GET TIMETABLE ROUTES
app.use("/api/timetable", weeklyTimetableRoutes);

// Root
app.get("/", (req, res) => {
  res.send("VIDYATRA backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
