import User from "../models/User.js";

export const getFacultyDashboard = async (req, res) => {
  try {
    const students = await User.find(
      { role: "student" },
      "gender department cgpa schoolMark"
    );

    const totalStudents = students.length;

    const genderCounts = {
      male: students.filter((s) => s.gender?.toUpperCase() === "M").length,
      female: students.filter((s) => s.gender?.toUpperCase() === "F").length,
    };

    const deptCount = {};
    students.forEach((s) => {
      if (s.department) {
        deptCount[s.department] = (deptCount[s.department] || 0) + 1;
      }
    });

    const departments = Object.keys(deptCount);

    const avgCgpa = totalStudents
      ? (
          students.reduce((sum, s) => sum + (s.cgpa || 0), 0) / totalStudents
        ).toFixed(2)
      : "0.00";

    const avgSchoolMarks = totalStudents
      ? (
          students.reduce((sum, s) => sum + (s.schoolMark || 0), 0) /
          totalStudents
        ).toFixed(2)
      : "0.00";

    res.json({
      totalStudents,
      avgSchoolMarks,
      avgCgpa,
      genderCounts,
      departments,
      departmentCounts: deptCount,
      facultyCgpa: [
        { faculty: "MALAR", avg: 8.3 },
        { faculty: "SUDHARSAN", avg: 7.9 },
        { faculty: "SAHADEVAN", avg: 8.1 },
      ],
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
