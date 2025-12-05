// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resumeRouter from "./routes/resume.js";
import facultyProfileRoutes from "./routes/facultyProfile.js";


dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resume", resumeRouter);
app.use("/api/faculty/profile", facultyProfileRoutes);


app.get("/", (req, res) => {
  res.send("VIDYATRA backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
