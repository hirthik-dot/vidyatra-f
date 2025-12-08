import User from "../models/User.js";

export const getFacultyDashboard = async (req, res) => {
  try {
    // Fetch all students
    const students = await User.find({ role: "student" });

    // Total students
    const totalStudents = students.length;

    // Gender counts
    const genderCounts = {
      male: students.filter((s) => s.gender === "M").length,
      female: students.filter((s) => s.gender === "F").length,
    };

    // Department counts object
    const deptCount = {};
    students.forEach((s) => {
      if (s.department) {
        if (!deptCount[s.department]) deptCount[s.department] = 0;
        deptCount[s.department]++;
      }
    });

    // Convert OBJECT → ARRAY
    const departments = Object.keys(deptCount);  // ✅ FIXED

    // Average CGPA
    const avgCgpa = students.length
      ? (
          students.reduce((sum, s) => sum + (s.cgpa || 0), 0) / students.length
        ).toFixed(2)
      : "0.00";

    // Average schooling marks
    const avgSchoolMarks = students.length
      ? (
          students.reduce((sum, s) => sum + (s.schoolMark || 0), 0) /
          students.length
        ).toFixed(2)
      : "0.00";

    // Dummy faculty CGPA data (can be real later)
    const facultyCgpa = [
      { faculty: "MALAR", avg: 8.3 },
      { faculty: "SUDHARSAN", avg: 7.9 },
      { faculty: "SAHADEVAN", avg: 8.1 },
    ];

    res.json({
      totalStudents,
      avgSchoolMarks,
      avgCgpa,
      genderCounts,
      departments,            // ✅ ARRAY
      departmentCounts: deptCount, // keep counts too
      facultyCgpa,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
