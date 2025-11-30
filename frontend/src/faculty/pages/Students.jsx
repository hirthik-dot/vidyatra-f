import React, { useState, useMemo } from "react";

export default function CollegeStudents() {
  const students = [
    {
      name: "Aarav Sharma",
      regNo: "CSE101",
      dept: "CSE",
      section: "A",
      year: "3rd Year",
      dob: "2001-03-15",
      email: "aarav.sharma@college.edu",
      contact: "9876543210",
      cgpa: 8.9,
      performance: { "Data Structures": 88, "Java": 92, "Mathematics": 85 }
    },
    {
      name: "Kavya Singh",
      regNo: "ECE102",
      dept: "ECE",
      section: "B",
      year: "2nd Year",
      dob: "2002-06-22",
      email: "kavya.singh@college.edu",
      contact: "9876501234",
      cgpa: 9.1,
      performance: { "Digital Electronics": 78, "Signals & Systems": 80, "Mathematics": 90 }
    },
    {
      name: "Rohit Mehta",
      regNo: "CSE103",
      dept: "CSE",
      section: "A",
      year: "1st Year",
      dob: "2003-01-10",
      email: "rohit.mehta@college.edu",
      contact: "9876512345",
      cgpa: 8.5,
      performance: { "Programming Basics": 95, "Maths": 89, "Physics": 84 }
    }
  ];

  const departments = ["CSE", "ECE", "ME", "EEE", "MBA"];
  const sections = ["A", "B", "C"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sortOptions = ["Name", "Reg No.", "CGPA"];

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const displayedStudents = useMemo(() => {
    let filtered = students.filter((s) => {
      const matchesDept = !selectedDept || s.dept === selectedDept;
      const matchesSection = !selectedSection || s.section === selectedSection;
      const matchesYear = !selectedYear || s.year === selectedYear;
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDept && matchesSection && matchesYear && matchesSearch;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "Name") return a.name.localeCompare(b.name);
        if (sortBy === "Reg No.") return a.regNo.localeCompare(b.regNo);
        if (sortBy === "CGPA") return b.cgpa - a.cgpa;
        return 0;
      });
    }

    return filtered;
  }, [students, selectedDept, selectedSection, selectedYear, searchTerm, sortBy]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">College Students</h2>

      {/* Filters + Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or Reg No."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border rounded-lg shadow-sm w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="p-3 border rounded-lg shadow-sm w-full md:w-1/6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="p-3 border rounded-lg shadow-sm w-full md:w-1/6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select Section</option>
          {sections.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-3 border rounded-lg shadow-sm w-full md:w-1/6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-3 border rounded-lg shadow-sm w-full md:w-1/6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Sort By</option>
          {sortOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Reg No.</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Section</th>
              <th className="p-3">Year</th>
              <th className="p-3">CGPA</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.map((s, i) => (
              <tr
                key={i}
                className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedStudent(s)}
              >
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.regNo}</td>
                <td className="p-3">{s.dept}</td>
                <td className="p-3">{s.section}</td>
                <td className="p-3">{s.year}</td>
                <td className="p-3">{s.cgpa}</td>
              </tr>
            ))}
            {displayedStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              &times;
            </button>

            <div className="flex flex-col items-center text-center">
         {/* Profile picture */}
<img
  src="/mnt/data/b07c5afa-ea74-49fc-992d-4f7274666e22.png" // default avatar image
  alt="profile"
  className="w-24 h-24 rounded-full mb-4"
/>

              <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
              <p className="text-gray-500">{selectedStudent.regNo} • {selectedStudent.dept} • {selectedStudent.section}</p>
              <p className="text-gray-500">{selectedStudent.year}</p>
            </div>

            <div className="mt-4 space-y-2 text-left">
              <p><strong>DOB:</strong> {selectedStudent.dob}</p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5">
                  {/* Email icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12h2m0 0h-2m2 0V8m0 4v4m-4-8h4m0 0h-4m0 0V4m0 4v4m-8 0h2m0 0H6m2 0V8m0 4v4m-4-8h4m0 0H4m0 0V4m0 4v4" />
                  </svg>
                </span>
                {selectedStudent.email}
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5">
                  {/* Phone icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l3.6 7.59a1 1 0 01-.36 1.41l-1.74.87c1.8 2.87 4.77 5.84 7.64 7.64l.87-1.74a1 1 0 011.41-.36L19 19v2a2 2 0 01-2 2C8.477 21 3 15.523 3 8a2 2 0 012-2z" />
                  </svg>
                </span>
                {selectedStudent.contact}
              </p>
              <p><strong>CGPA:</strong> {selectedStudent.cgpa}</p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Performance:</h4>
              <ul className="list-disc list-inside">
                {Object.entries(selectedStudent.performance).map(([sub, score]) => (
                  <li key={sub}>{sub}: {score}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
