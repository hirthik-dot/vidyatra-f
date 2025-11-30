import { useState } from "react";

export default function StudentPerformancePage() {
  const [selectedSubject, setSelectedSubject] = useState(null);

  const student = {
    name: "John Doe",
    roll: "CS101",
    class: "4A",
    subjects: [
      { course: "Data Structures", marks: { assignment: 85, test: 90, final: 88 }, attendance: 92 },
      { course: "Database Systems", marks: { assignment: 78, test: 82, final: 80 }, attendance: 88 },
      { course: "Mathematics III", marks: { assignment: 65, test: 70, final: 68 }, attendance: 75 },
    ],
  };

  const getAverage = (marks) => Math.round((marks.assignment + marks.test + marks.final) / 3);

  const getOverallStatus = () => {
    const finalAvg = student.subjects.reduce((sum, s) => sum + s.marks.final, 0) / student.subjects.length;
    return finalAvg >= 60 ? "Pass" : "At Risk";
  };

  const statusColor = (status) => {
    if (status === "Pass") return "bg-green-200 text-green-800";
    if (status === "At Risk") return "bg-yellow-200 text-yellow-800";
    if (status === "Fail") return "bg-red-200 text-red-800";
    return "bg-gray-200 text-gray-800";
  };

  const getBarWidth = (value) => `${Math.min(value, 100)}%`;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">My Performance</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Subjects</p>
          <h3 className="text-3xl font-bold text-blue-700">{student.subjects.length}</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Average Marks</p>
          <h3 className="text-3xl font-bold text-blue-700">
            {Math.round(student.subjects.reduce((sum, s) => sum + getAverage(s.marks), 0) / student.subjects.length)}
          </h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Average Attendance</p>
          <h3 className="text-3xl font-bold text-blue-700">
            {Math.round(student.subjects.reduce((sum, s) => sum + s.attendance, 0) / student.subjects.length)}%
          </h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Overall Status</p>
          <h3 className={`text-3xl font-bold px-2 py-1 rounded-full ${statusColor(getOverallStatus())}`}>
            {getOverallStatus()}
          </h3>
        </div>
      </div>

      {/* Subject Table */}
      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-left">Assignment</th>
              <th className="p-2 text-left">Test</th>
              <th className="p-2 text-left">Final</th>
              <th className="p-2 text-left">Average</th>
              <th className="p-2 text-left">Attendance %</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects.map((s, i) => {
              const avg = getAverage(s.marks);
              const status = avg >= 60 ? "Pass" : "At Risk";
              return (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{s.course}</td>
                  <td className="p-2">{s.marks.assignment}</td>
                  <td className="p-2">{s.marks.test}</td>
                  <td className="p-2">{s.marks.final}</td>
                  <td className="p-2">{avg}</td>
                  <td className="p-2">{s.attendance}%</td>
                  <td className={`p-2 font-semibold ${statusColor(status)} rounded-full text-center`}>{status}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setSelectedSubject(s)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">{selectedSubject.course} Details</h3>

            {/* Marks Bars */}
            <div className="mt-4 space-y-3">
              {Object.entries(selectedSubject.marks).map(([key, value]) => (
                <div key={key}>
                  <p className="font-semibold capitalize">{key} Marks: {value}</p>
                  <div className="w-full bg-gray-200 h-4 rounded-full">
                    <div
                      className={`h-4 rounded-full ${
                        value >= 85 ? "bg-green-500" : value >= 60 ? "bg-yellow-400" : "bg-red-500"
                      }`}
                      style={{ width: getBarWidth(value) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Bar */}
            <div className="mt-4">
              <p className="font-semibold">Attendance: {selectedSubject.attendance}%</p>
              <div className="w-full bg-gray-200 h-4 rounded-full">
                <div
                  className={`h-4 rounded-full ${
                    selectedSubject.attendance >= 90
                      ? "bg-green-500"
                      : selectedSubject.attendance >= 75
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                  style={{ width: getBarWidth(selectedSubject.attendance) }}
                ></div>
              </div>
            </div>

            <p className="mt-2 font-semibold">
              Status: <span className={`${statusColor(getAverage(selectedSubject.marks) >= 60 ? "Pass" : "At Risk")} px-2 py-1 rounded-full`}>{getAverage(selectedSubject.marks) >= 60 ? "Pass" : "At Risk"}</span>
            </p>

            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold">
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
