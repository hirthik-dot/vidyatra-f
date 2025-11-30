import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import ClassTimetable from "../models/ClassTimetable.js";

const DAYS = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

function getTodayName() {
  let day = DAYS[new Date().getDay()];
  if (day === "Saturday" || day === "Sunday") day = "Monday";
  return day;
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  return { start, end };
}

/* --------------------------------------------
   1) Get all students of faculty’s class
--------------------------------------------- */
export const getMyClassStudents = async (req, res) => {
  try {
    const className = req.user.className;
    if (!className) return res.json({ totalStudents: 0, students: [] });

    const students = await User.find({ 
      role: "student",
      className
    }).select("name roll");

    return res.json({
      className,
      totalStudents: students.length,
      students
    });

  } catch (err) {
    console.error("getMyClassStudents:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* --------------------------------------------
   2) Get present students for current period
--------------------------------------------- */

export const getPresentStudentsForFaculty = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();
    const today = getTodayName();
    const { start, end } = getTodayRange();

    // 1) Find all timetables for today
    const timetables = await ClassTimetable.find({ day: today });

    let activeClass = null;
    let currentPeriodNo = null;

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    // 2) Detect which CLASS this faculty is teaching right now
    for (const tt of timetables) {
      for (const p of tt.periods) {
        if (!p.start || !p.end) continue;

        const [sh, sm] = p.start.split(":").map(Number);
        const [eh, em] = p.end.split(":").map(Number);
        const s = sh * 60 + sm;
        const e = eh * 60 + em;

        const isTeaching =
          (p.faculty && p.faculty.toString() === facultyId) ||
          (p.substituteFaculty &&
            p.substituteFaculty.toString() === facultyId);

        if (isTeaching && nowMin >= s && nowMin <= e) {
          activeClass = tt.className;
          currentPeriodNo = p.period;
          break;
        }
      }
      if (activeClass) break;
    }

    // 3) DEMO MODE: if no active class, use first timetable + period 1
    if (!activeClass && timetables.length > 0) {
      activeClass = timetables[0].className;
      currentPeriodNo = timetables[0].periods[0].period;
    }

    if (!activeClass) {
      return res.json({
        className: null,
        presentCount: 0,
        totalStudents: 0,
        students: [],
      });
    }

    // 4) Fetch present students for that class + period
    const records = await Attendance.find({
      className: activeClass,
      period: currentPeriodNo,
      date: { $gte: start, $lte: end },
    }).populate("student", "name roll");

    const presentStudents = records.map((r) => ({
      name: r.student.name,
      roll: r.student.roll || "",
    }));

    // 5) Count total students in that class
    const totalStudents = await User.countDocuments({
      role: "student",
      className: activeClass,
    });

    return res.json({
      className: activeClass,
      presentCount: presentStudents.length,
      totalStudents,
      students: presentStudents,
    });
  } catch (err) {
    console.error("getPresentStudentsForFaculty:", err);
    res.status(500).json({ message: "Server error" });
  }
};
