// backend/controllers/AttendanceController.js

import Attendance from "../models/Attendance.js";
import ClassTimetable from "../models/ClassTimetable.js";
import User from "../models/User.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Convert "09:30" → minutes
function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Today 00:00 → 23:59
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export const markStudentAttendance = async (req, res) => {
  try {
    // 🔥 ADDED: geoVerified beside existing Bluetooth variable
    const { wifiVerified, bluetoothVerified, geoVerified, faceVerified, qrVerified } =
      req.body;

    // -------------------------------------------
    // 1️⃣ VERIFY AUTH PATH (Modified for Geo instead of Bluetooth)
    // -------------------------------------------
    const ok =
      (wifiVerified && faceVerified) ||
      (geoVerified && faceVerified) ||     // 🔥 NEW
      qrVerified;

    if (!ok) {
      return res.status(400).json({
        message:
          "Verification failed. Use Wi-Fi+Face, Location+Face, or valid QR.",
      });
    }

    const user = req.user;
    const className = user.className;

    // -------------------------------------------
    // 2️⃣ GET TODAY'S TIMETABLE
    // -------------------------------------------
    let todayName = DAYS[new Date().getDay()];

    // Optional weekend fallback
    if (todayName === "Saturday" || todayName === "Sunday") {
      todayName = "Monday";
    }

    const timetable = await ClassTimetable.findOne({
      className,
      day: todayName,
    });

    if (!timetable) {
      return res.json({
        message: "Demo Mode: Attendance marked (no timetable found).",
        demoMode: true,
      });
    }

    // -------------------------------------------
    // 3️⃣ DETECT CURRENT PERIOD
    // -------------------------------------------
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let currentPeriod = null;
    let demoMode = false;

    for (const p of timetable.periods) {
      const startMins = timeStringToMinutes(p.start);
      const endMins = timeStringToMinutes(p.end);

      if (nowMinutes >= startMins && nowMinutes <= endMins) {
        currentPeriod = p;
        break;
      }
    }

    if (!currentPeriod) {
      currentPeriod = timetable.periods[0];
      demoMode = true;
    }

    // -------------------------------------------
    // 4️⃣ CHECK IF ALREADY MARKED TODAY
    // -------------------------------------------
    const { start, end } = getTodayRange();

    const existing = await Attendance.findOne({
      student: user._id,
      period: currentPeriod.period,
      date: { $gte: start, $lte: end },
    });

    if (existing) {
      return res.status(400).json({
        message: `Attendance already marked for period ${currentPeriod.period}.`,
      });
    }

    // -------------------------------------------
    // 5️⃣ SAVE ATTENDANCE  (Modified: Added location)
    // -------------------------------------------
    const attendance = await Attendance.create({
      student: user._id,
      className,
      date: now,
      day: todayName,
      period: currentPeriod.period,
      subject: currentPeriod.subject,
      methods: {
        wifi: !!wifiVerified,
        bluetooth: false,        // 🔥 force false (kept for schema compatibility)
        location: !!geoVerified, // 🔥 NEW FIELD
        face: !!faceVerified,
        qr: !!qrVerified,
      },
    });

    return res.json({
      message: `Attendance marked for period ${attendance.period} (${attendance.subject}).`,
      period: attendance.period,
      subject: attendance.subject,
      demoMode,
    });
  } catch (err) {
    console.error("Mark attendance error:", err);
    return res.status(500).json({ message: "Server error marking attendance" });
  }
};

// ---------------------------------------------------------------
// LIVE QR (already correct)
// ---------------------------------------------------------------
export const getLiveQR = (req, res) => {
  const timeLeft = Math.max(0, Math.floor((qrExpiry - Date.now()) / 1000));

  return res.json({
    qrCode: currentQR,
    expiresIn: timeLeft,
  });
};

// ---------------------------------------------------------------
// GET PRESENT STUDENTS FOR CURRENT PERIOD (works fine)
// ---------------------------------------------------------------
export const getPresentStudentsForCurrentPeriod = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const todayName = DAYS[new Date().getDay()];

    const timetables = await ClassTimetable.find({ day: todayName });

    let activeClass = null;
    let currentPeriod = null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const tt of timetables) {
      for (const p of tt.periods) {
        const start = timeStringToMinutes(p.start);
        const end = timeStringToMinutes(p.end);

        const teaches =
          p.faculty?.toString() === facultyId.toString() ||
          p.substituteFaculty?.toString() === facultyId.toString();

        if (teaches && nowMinutes >= start && nowMinutes <= end) {
          activeClass = tt.className;
          currentPeriod = p.period;
          break;
        }
      }
      if (activeClass) break;
    }

    if (!activeClass) {
      return res.status(400).json({
        message: "No active class to list attendance.",
      });
    }

    const { start, end } = getTodayRange();

    const records = await Attendance.find({
      className: activeClass,
      period: currentPeriod,
      date: { $gte: start, $lte: end },
    }).populate("student");

    const students = records.map((rec) => ({
      name: rec.student.name,
      roll: rec.student.roll || "",
      period: rec.period,
    }));

    return res.json({
      className: activeClass,
      period: currentPeriod,
      students,
    });
  } catch (err) {
    console.error("Present students error:", err);
    return res.status(500).json({ message: "Error loading attendance list" });
  }
};
