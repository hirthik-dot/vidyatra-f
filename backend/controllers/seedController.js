import bcrypt from "bcryptjs";
import User from "../models/User.js";
import StudentStats from "../models/StudentStats.js";
import Timetable from "../models/Timetable.js";

export const seedDatabase = async (req, res) => {
  try {
    // 1) CLEAR OLD DATA (only for dev/demo)
    await User.deleteMany({});
    await StudentStats.deleteMany({});
    await Timetable.deleteMany({});

    // 2) COMMON PASSWORD
    const passwordHash = await bcrypt.hash("password123", 10);

    // 3) CREATE ADMIN
    const admin = await User.create({
      name: "System Admin",
      email: "admin@test.com",
      password: passwordHash,
      role: "admin",
    });

    // 4) CREATE FACULTY (3 teachers)
    const facultyData = [
      { name: "Rahul Verma", email: "rahul@vidyatra.com", subject: "Maths" },
      { name: "Priya Nair", email: "priya@vidyatra.com", subject: "Physics" },
      { name: "Amit Kumar", email: "amit@vidyatra.com", subject: "English" },
    ];

    const facultyDocs = [];
    for (const f of facultyData) {
      const doc = await User.create({
        name: f.name,
        email: f.email,
        password: passwordHash,
        role: "faculty",
        department: "CSE",
      });
      facultyDocs.push({ ...f, _id: doc._id });
    }

    // Helper to find faculty ID by subject
    const getFacultyIdForSubject = (subject) => {
      const found = facultyDocs.find((f) => f.subject === subject);
      return found ? found._id : null;
    };

    // 5) CREATE STUDENTS (5)
    const studentNames = [
      "Student One",
      "Student Two",
      "Student Three",
      "Student Four",
      "Student Five",
    ];

    const studentDocs = [];

    for (let i = 0; i < studentNames.length; i++) {
      const s = await User.create({
        name: studentNames[i],
        email: `student${i + 1}@test.com`,
        password: passwordHash,
        role: "student",
        department: "CSE",
        year: 2,
      });
      studentDocs.push(s);

      // Student stats for each
      await StudentStats.create({
        user: s._id,
        attendancePercent: 75 + i, // just variation
        assignmentsPending: 2 + (i % 2),
        upcomingExams: 1 + (i % 3),
        announcements: [
          "Internal assessment next week",
          "Workshop on AI this Friday",
        ],
      });
    }

    // 6) CREATE TIMETABLE FOR EACH STUDENT (Mon–Fri, 6 periods)

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const basePeriods = [
      { start: "09:00", end: "10:00", subject: "Maths" },
      { start: "10:00", end: "11:00", subject: "Physics" },
      { start: "11:00", end: "12:00", subject: "English" },
      { start: "12:00", end: "13:00", subject: "Computer Lab" },
      { start: "14:00", end: "15:00", subject: "Free / Self Study" },
      { start: "15:00", end: "16:00", subject: "Maths Tutorial" },
    ];

    for (const student of studentDocs) {
      for (const day of days) {
        const periodsWithFaculty = basePeriods.map((p) => {
          let facultyId = null;

          if (p.subject === "Maths" || p.subject === "Maths Tutorial") {
            facultyId = getFacultyIdForSubject("Maths");
          } else if (p.subject === "Physics") {
            facultyId = getFacultyIdForSubject("Physics");
          } else if (p.subject === "English") {
            facultyId = getFacultyIdForSubject("English");
          } else {
            facultyId = null; // Computer Lab or Free period
          }

          return {
            start: p.start,
            end: p.end,
            subject: p.subject,
            faculty: facultyId,
          };
        });

        await Timetable.create({
          student: student._id,
          day,
          periods: periodsWithFaculty,
        });
      }
    }

    return res.json({
      message: "Database successfully seeded with users + stats + timetables!",
      admin: {
        email: "admin@test.com",
        password: "password123",
      },
      facultyLogins: facultyDocs.map((f) => ({
        name: f.name,
        email: f.email,
        subject: f.subject,
        password: "password123",
      })),
      studentLogins: studentDocs.map((s, idx) => ({
        name: s.name,
        email: `student${idx + 1}@test.com`,
        password: "password123",
      })),
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ message: "Seed failed" });
  }
};
