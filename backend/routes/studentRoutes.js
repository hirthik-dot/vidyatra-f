// backend/routes/studentRoutes.js

import express from "express";
import protect from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

// Controllers
import { getStudentDashboard } from "../controllers/StudentController.js";
import { getTodayTimetable } from "../controllers/StudentTimetableController.js";
import { getAISuggestions } from "../controllers/AiSuggestionController.js";
import { saveInterests } from "../controllers/studentInterestController.js";
import { markStudentAttendance } from "../controllers/AttendanceController.js";
import { getCurrentQR } from "../controllers/QrController.js";
import { getLiveQR } from "../controllers/AttendanceController.js";
import { generatePersonalMaterial } from "../controllers/StudyMaterialController.js";
import { verifyWifiConnection } from "../controllers/AttendanceController.js";

import { protect } from "../middleware/authMiddleware.js";


// 🔥 REPLACED BLUETOOTH CONTROLLER
// import { checkBluetoothAuth } from "../controllers/BluetoothController.js";
import { checkGeoAuth } from "../controllers/GeoController.js";

import User from "../models/User.js";

import multer from "multer";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();
const upload = multer();

/* ======================================================
   STUDENT INTERESTS
====================================================== */
router.post("/save-interests", authMiddleware, saveInterests);

/* ======================================================
   STUDENT DASHBOARD (AI + Interests + Face Check Trigger)
====================================================== */
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("student"),
  getStudentDashboard
);

/* ======================================================
   TIMETABLE
====================================================== */
router.get(
  "/timetable",
  authMiddleware,
  requireRole("student"),
  getTodayTimetable
);

/* ======================================================
   AI SUGGESTIONS
====================================================== */
router.get(
  "/ai-suggestions",
  authMiddleware,
  requireRole("student"),
  getAISuggestions
);

/* ======================================================
   ATTENDANCE SUBMISSION
====================================================== */
router.post(
  "/attendance/mark",
  authMiddleware,
  requireRole("student"),
  markStudentAttendance
);

/* ======================================================
   QR SYSTEM
====================================================== */
router.get("/qr/current", getCurrentQR);
router.get("/qr/live", getLiveQR);

/* ======================================================
   REAL WI-FI VERIFICATION
====================================================== */
router.get(
  "/attendance/check-wifi",
  authMiddleware,
  requireRole("student"),
  verifyWifiConnection
);


/* ======================================================
   ⭐ NEW — GEOLOCATION VERIFICATION (Replaces Bluetooth)
====================================================== */
router.post(
  "/attendance/check-geo",
  authMiddleware,
  requireRole("student"),
  checkGeoAuth
);

/* ======================================================
   GET STUDENT LIST
====================================================== */
router.get("/", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "_id name email department className"
    );
    return res.status(200).json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    return res.status(500).json({ message: "Error fetching students" });
  }
});

/* ======================================================
   Personalized Study Material
====================================================== */
router.get(
  "/personal-material",
  authMiddleware,
  requireRole("student"),
  generatePersonalMaterial
);

/* ======================================================
   FULL STUDENT LIST FOR ADMIN UI
====================================================== */
router.get("/all/full", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name regNo dept section year dob email contact cgpa performance avatar"
    );

    return res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching student data:", err);
    return res.status(500).json({ message: "Error fetching student data" });
  }
});

/* ======================================================
   FACE REGISTRATION — FIRST TIME ONLY
====================================================== */
router.post(
  "/face/register",
  authMiddleware,
  requireRole("student"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const form = new FormData();
      form.append("image", req.file.buffer, {
        filename: "face.jpg",
        contentType: "image/jpeg",
      });

      const pyRes = await axios.post("http://localhost:6000/register", form, {
        headers: form.getHeaders(),
      });

      if (!pyRes.data.success) {
        return res.status(400).json({
          message: pyRes.data.msg || "Face registration failed",
        });
      }

      await User.findByIdAndUpdate(req.user._id, {
        faceEmbedding: pyRes.data.embedding,
        faceRegistered: true,
      });

      return res.json({
        success: true,
        message: "Face registered successfully",
      });
    } catch (err) {
      console.error("Face register error:", err.response?.data || err.message);
      return res
        .status(500)
        .json({ message: "Server error in face register" });
    }
  }
);

/* ======================================================
   FACE ATTENDANCE → MATCH + AUTO MARK
====================================================== */
router.post(
  "/attendance/face-scan",
  authMiddleware,
  requireRole("student"),
  upload.single("image"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.faceEmbedding || !user.faceRegistered) {
        return res
          .status(400)
          .json({ message: "Face not registered. Please register first." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const form = new FormData();
      form.append("image", req.file.buffer, {
        filename: "face.jpg",
        contentType: "image/jpeg",
      });
      form.append("stored_embedding", JSON.stringify(user.faceEmbedding));

      const pyRes = await axios.post("http://localhost:6000/verify", form, {
        headers: form.getHeaders(),
      });

      if (!pyRes.data.match) {
        return res
          .status(401)
          .json({ message: "Face did not match. Try again." });
      }

      req.body = {
        wifiVerified: true,
        geoVerified: false,      // 🔥 set this if you want auto mark with geo
        faceVerified: true,
        qrVerified: false,
      };

      return markStudentAttendance(req, res);
    } catch (err) {
      console.error(
        "Face attendance error:",
        err.response?.data || err.message
      );
      return res
        .status(500)
        .json({ message: "Server error in face attendance" });
    }
  }
);

router.get("/current-free-period", protect, async (req, res) => {
  try {
    const studentId = req.user.id;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    // Use your existing timetable logic:
    const timetable = await StudentTimetable.findOne({ studentId });

    if (!timetable) {
      return res.json({ isFree: false });
    }

    const today = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const periods = timetable[today] || [];

    const freeNow = periods.find(
      (p) => p.start <= currentTime && p.end >= currentTime && p.isFree === true
    );

    return res.json({ isFree: !!freeNow });
  } catch (err) {
    console.error("FREE PERIOD CHECK ERROR:", err);
    res.status(500).json({ isFree: false });
  }
});


export default router;
