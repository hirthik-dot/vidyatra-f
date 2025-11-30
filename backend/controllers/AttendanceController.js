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

function getTodayName() {
  let todayName = DAYS[new Date().getDay()];
  // Same weekend fix: use Monday timetable on Sat/Sun
  if (todayName === "Saturday" || todayName === "Sunday") {
    todayName = "Monday";
  }
  return todayName;
}

function getTodayDateRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function timeStringToMinutes(timeStr) {
  // expects "09:00" or "09:00 AM"/"09:00 PM" but we mostly use "HH:MM"
  const [hRaw, mRaw] = timeStr.split(":");
  const h = parseInt(hRaw, 10) || 0;
  const m = parseInt(mRaw, 10) || 0;
  return h * 60 + m;
}

// POST /api/student/attendance/mark
export const markStudentAttendance = async (req, res) => {
  try {
    const { wifiVerified, bluetoothVerified, faceVerified, qrVerified } =
      req.body;

    // 1) Validate according to your rules:
    const ok =
      (wifiVerified && faceVerified) ||
      (bluetoothVerified && faceVerified) ||
      qrVerified;

    if (!ok) {
      return res.status(400).json({
        message:
          "Verification failed. Use Wi-Fi+Face, Bluetooth+Face, or valid QR.",
      });
    }

    const user = req.user;
    console.log("STUDENT ID =", user._id, "NAME =", user.name);

    const className = user.className; // "CSE-A"
    const todayName = getTodayName();

    // 2) Find today's timetable for this class
    const timetable = await ClassTimetable.findOne({
      className,
      day: todayName,
    });

    if (!timetable) {
      return res
        .status(400)
        .json({ message: "No timetable found for your class today." });
    }

    // 3) Detect current period based on current time
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let currentPeriod = null;
    let demoMode = false; // ⭐ ADDED FOR DEMO MODE

    for (const p of timetable.periods) {
      if (!p.start || !p.end) continue;

      const startMins = timeStringToMinutes(p.start);
      const endMins = timeStringToMinutes(p.end);

      if (nowMinutes >= startMins && nowMinutes <= endMins) {
        currentPeriod = p;
        break;
      }
    }

    // ⭐ DEMO MODE FIX (ONLY new change)
    if (!currentPeriod) {
      currentPeriod = timetable.periods[0]; // Default to Period 1
      demoMode = true;
      console.log("DEMO MODE: No active class period. Assigned Period 1.");
    }

    // 4) Check if already marked for this period
    const { start, end } = getTodayDateRange();

    const existing = await Attendance.findOne({
      student: user._id,
      date: { $gte: start, $lte: end },
      period: currentPeriod.period,
    });

    if (existing) {
      return res.status(400).json({
        message: `Attendance already marked for period ${currentPeriod.period}.`,
      });
    }

    // 5) Save attendance
    const attendance = await Attendance.create({
      student: user._id,
      className,
      date: now,
      day: todayName,
      period: currentPeriod.period,
      subject: currentPeriod.subject,
      methods: {
        wifi: !!wifiVerified,
        bluetooth: !!bluetoothVerified,
        face: !!faceVerified,
        qr: !!qrVerified,
      },
    });

    return res.json({
      message: `Attendance marked for period ${attendance.period} (${attendance.subject}).`,
      period: attendance.period,
      subject: attendance.subject,
      demoMode, // ⭐ ADDED: Tell frontend demo is active
    });
  } catch (err) {
    console.error("Mark attendance error:", err);
    return res.status(500).json({ message: "Server error marking attendance" });
  }
};
//------------------------------------------------------
// ⭐ LIVE ROTATING QR FOR CLASSROOM ATTENDANCE
//------------------------------------------------------

let currentQR = null;
let qrExpiry = null;

// Generate a new QR every 30 seconds
function generateQR() {
  const random = Math.random().toString(36).substring(2, 10);
  currentQR = `QR-${Date.now()}-${random}`;
  qrExpiry = Date.now() + 30000; // 30 sec
}
generateQR();

// Auto-refresh every 30 seconds
setInterval(() => generateQR(), 30000);

// GET /api/student/qr/current
export const getLiveQR = (req, res) => {
  const timeLeft = Math.max(0, Math.floor((qrExpiry - Date.now()) / 1000));

  return res.json({
    qrCode: currentQR,
    expiresIn: timeLeft,
  });
};

//------------------------------------------------------
// ⭐ LIST OF STUDENTS PRESENT FOR CURRENT PERIOD
//------------------------------------------------------



export const getPresentStudentsForCurrentPeriod = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const todayName = getTodayName();

    // 1) Find all timetables for today
    const timetables = await ClassTimetable.find({ day: todayName });

    let activeClass = null;
    let currentPeriod = null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // 2) Detect which CLASS this faculty is teaching right now
    for (const tt of timetables) {
      for (const p of tt.periods) {
        const start = timeStringToMinutes(p.start);
        const end = timeStringToMinutes(p.end);

        const isTeaching =
          p.faculty?.toString() === facultyId.toString() ||
          p.substituteFaculty?.toString() === facultyId.toString();

        if (isTeaching && nowMinutes >= start && nowMinutes <= end) {
          activeClass = tt.className;
          currentPeriod = p.period;
          break;
        }
      }
    }

    // DEMO MODE: No active class → pick first timetable & period 1
    if (!activeClass) {
      activeClass = timetables[0].className;
      currentPeriod = timetables[0].periods[0].period;
    }

    // 3) Fetch attendance for THAT CLASS + THAT PERIOD
    const { start, end } = getTodayDateRange();

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
