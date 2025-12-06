import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, GraduationCap, ChevronRight } from "lucide-react";

export default function CollegeStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/student/all/full");
        setStudents(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to load students");
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const departments = ["CSE", "ECE", "ME", "EEE", "MBA"];
  const sections = ["A", "B", "C"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sortOptions = ["Name", "Reg No.", "CGPA"];

  const displayedStudents = useMemo(() => {
    let filtered = students.filter((s) => {
      const mDept = !selectedDept || s.dept === selectedDept;
      const mSection = !selectedSection || s.section === selectedSection;
      const mYear = !selectedYear || s.year === selectedYear;
      const mSearch =
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNo?.toLowerCase().includes(searchTerm.toLowerCase());
      return mDept && mSection && mYear && mSearch;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "Name") return a.name.localeCompare(b.name);
        if (sortBy === "Reg No.") return a.regNo.localeCompare(b.regNo);
        if (sortBy === "CGPA") return b.cgpa - a.cgpa;
      });
    }

    return filtered;
  }, [students, selectedDept, selectedSection, selectedYear, searchTerm, sortBy]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl text-blue-600">
        Loading Students...
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 text-center p-6 text-xl">{error}</div>
    );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-bl from-indigo-100 via-white to-blue-100">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <GraduationCap size={40} className="text-indigo-700" />
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Student Directory
        </h2>
      </motion.div>

      {/* FILTER PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-5 border border-white/50 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name or Reg No."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 rounded-xl border shadow-sm focus:ring focus:ring-indigo-300"
            />
          </div>

          {/* Dropdowns */}
          <select
            className="p-3 rounded-xl border shadow-sm"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            className="p-3 rounded-xl border shadow-sm"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Section</option>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            className="p-3 rounded-xl border shadow-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="mt-4">
          <select
            className="p-3 rounded-xl border shadow-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            {sortOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 overflow-x-auto"
      >
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Reg No.</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Section</th>
              <th className="p-3">Year</th>
              <th className="p-3">CGPA</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {displayedStudents.map((s) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedStudent(s)}
                  className="border-b hover:bg-indigo-50 cursor-pointer"
                >
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3">{s.regNo}</td>
                  <td className="p-3">{s.dept}</td>
                  <td className="p-3">{s.section}</td>
                  <td className="p-3">{s.year}</td>
                  <td className="p-3">{s.cgpa}</td>
                  <td className="p-3 text-right">
                    <ChevronRight className="inline text-indigo-600" />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* STUDENT MODAL */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <button
                className="text-gray-500 float-right text-xl"
                onClick={() => setSelectedStudent(null)}
              >
                ×
              </button>

              <div className="text-center mt-4">
                <img
                  src={selectedStudent.avatar || "https://ui-avatars.com/api/?name=" + selectedStudent.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg"
                />
                <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                <p className="text-gray-500">{selectedStudent.regNo}</p>
                <p className="text-gray-500">{selectedStudent.dept} • {selectedStudent.section}</p>
              </div>

              <div className="mt-6 space-y-2">
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Contact:</strong> {selectedStudent.contact}</p>
                <p><strong>DOB:</strong> {selectedStudent.dob}</p>
                <p><strong>CGPA:</strong> {selectedStudent.cgpa}</p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
