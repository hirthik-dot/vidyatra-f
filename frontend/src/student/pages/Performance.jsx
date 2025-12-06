import { useState } from "react";
import {
  TrendingUp,
  BarChart2,
  Award,
  Activity,
  PieChart,
  Brain,
  FileDown,
} from "lucide-react";

export default function StudentPerformancePage() {
  const [selectedSubject, setSelectedSubject] = useState(null);

  // STATIC DEMO DATA (replace later with backend)
  const student = {
    name: "John Doe",
    roll: "CS101",
    class: "4A",
    subjects: [
      {
        course: "Data Structures",
        marks: { assignment: 85, test: 90, final: 88 },
        attendance: 92,
      },
      {
        course: "Database Systems",
        marks: { assignment: 78, test: 82, final: 80 },
        attendance: 88,
      },
      {
        course: "Mathematics III",
        marks: { assignment: 65, test: 70, final: 68 },
        attendance: 75,
      },
    ],
  };

  const getAverage = (m) => Math.round((m.assignment + m.test + m.final) / 3);
  const avgAttendance = Math.round(
    student.subjects.reduce((s, x) => s + x.attendance, 0) /
      student.subjects.length
  );
  const avgMarks = Math.round(
    student.subjects.reduce((s, x) => s + getAverage(x.marks), 0) /
      student.subjects.length
  );

  const overallStatus = avgMarks >= 60 ? "Pass" : "At Risk";
  const statusColor = (s) =>
    s === "Pass"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const barColor = (v) =>
    v >= 85 ? "bg-green-500" : v >= 60 ? "bg-yellow-400" : "bg-red-500";

  const getBarWidth = (v) => `${Math.min(v, 100)}%`;

  // Radar chart values (normalised)
  const radarData = [
    { label: "Assignments", value: avgMarks },
    { label: "Tests", value: avgMarks - 5 },
    { label: "Finals", value: avgMarks - 2 },
    { label: "Attendance", value: avgAttendance },
    { label: "Consistency", value: avgMarks - 3 },
  ];

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <h2 className="text-3xl font-extrabold text-blue-800">
        📊 Performance Dashboard <span className="text-sm ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Beta</span>
      </h2>
      <p className="text-gray-600 mt-1">
        Smart AI-powered academic insights & progress tracking.
      </p>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">

        {/* TOTAL SUBJECTS */}
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transition border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Subjects</p>
          <h3 className="text-4xl font-extrabold text-blue-700">
            {student.subjects.length}
          </h3>
          <Award className="mt-3 text-blue-500" />
        </div>

        {/* AVG MARKS */}
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transition border-t-4 border-green-500">
          <p className="text-gray-500 text-sm">Average Marks</p>
          <h3 className="text-4xl font-extrabold text-green-600">
            {avgMarks}
          </h3>
          <TrendingUp className="mt-3 text-green-500" />
        </div>

        {/* ATTENDANCE */}
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transition border-t-4 border-orange-500">
          <p className="text-gray-500 text-sm">Attendance</p>
          <h3 className="text-4xl font-extrabold text-orange-600">
            {avgAttendance}%
          </h3>
          <Activity className="mt-3 text-orange-500" />
        </div>

        {/* STATUS */}
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-xl transition border-t-4 border-purple-500">
          <p className="text-gray-500 text-sm">Overall Status</p>
          <span
            className={`mt-2 inline-block px-4 py-1 text-2xl font-bold rounded-full ${statusColor(
              overallStatus
            )}`}
          >
            {overallStatus}
          </span>
        </div>
      </div>

      {/* SKILL RADAR CHART (SVG) */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="text-purple-600" /> Skill Radar Analysis
        </h3>

        <div className="relative w-64 h-64 mx-auto">
          <svg width="100%" height="100%" viewBox="0 0 200 200">
            {/* Radar Axes */}
            {radarData.map((d, i) => {
              const angle = (Math.PI * 2 * i) / radarData.length;
              const x = 100 + 80 * Math.cos(angle);
              const y = 100 + 80 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="#d1d5db"
                />
              );
            })}

            {/* Radar Fill */}
            <polygon
              fill="rgba(124, 58, 237, 0.2)"
              stroke="#7c3aed"
              strokeWidth="2"
              points={radarData
                .map((d, i) => {
                  const angle = (Math.PI * 2 * i) / radarData.length;
                  const radius = (d.value / 100) * 80;
                  const x = 100 + radius * Math.cos(angle);
                  const y = 100 + radius * Math.sin(angle);
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>

          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-700">
            Finals
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-700">
            Attendance
          </div>
        </div>
      </div>

      {/* SUBJECT TABLE */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="text-blue-600" /> Subject-wise Breakdown
        </h3>

        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Subject</th>
              <th className="p-3">Avg Marks</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects.map((s, i) => {
              const avg = getAverage(s.marks);
              const status = avg >= 60 ? "Pass" : "At Risk";

              return (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{s.course}</td>
                  <td className="p-3">{avg}</td>
                  <td className="p-3">{s.attendance}%</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-3">
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

      {/* SUBJECT DETAIL MODAL */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl relative">

            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold">
              {selectedSubject.course} – Detailed Report
            </h3>

            <div className="mt-4 space-y-5">
              {/* Mark Bars */}
              {Object.entries(selectedSubject.marks).map(([k, v]) => (
                <div key={k}>
                  <p className="font-semibold capitalize">
                    {k} Marks: {v}
                  </p>
                  <div className="w-full h-4 bg-gray-200 rounded-full">
                    <div
                      className={`h-4 rounded-full transition-all ${barColor(
                        v
                      )}`}
                      style={{ width: getBarWidth(v) }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Attendance */}
              <div>
                <p className="font-semibold">
                  Attendance: {selectedSubject.attendance}%
                </p>
                <div className="w-full h-4 bg-gray-200 rounded-full">
                  <div
                    className={`h-4 rounded-full ${barColor(
                      selectedSubject.attendance
                    )}`}
                    style={{
                      width: getBarWidth(selectedSubject.attendance),
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <button className="mt-5 w-full bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800">
              <FileDown size={18} /> Export Report (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
