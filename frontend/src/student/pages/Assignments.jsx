import axios from "axios";
import { useEffect, useState } from "react";

// ICONS
import { CalendarDays, FileDown } from "lucide-react";

import { API_BASE_URL } from "../../config/api";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [facultyMap, setFacultyMap] = useState({});
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  // ------------------------------
  // Fetch assignments + faculty subjects
  // ------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/student/assignments/${studentId}`
        );

        const assignmentsData = res.data || [];
        setAssignments(assignmentsData);

        // Fetch faculty subject mapping
        const facultyIds = [
          ...new Set(assignmentsData.map((a) => a.facultyId).filter(Boolean)),
        ];

        const map = {};
        await Promise.all(
          facultyIds.map(async (fId) => {
            try {
              const fRes = await axios.get(
                `${API_BASE_URL}/api/faculty/profile/${fId}`
              );
              map[fId] = fRes.data?.subject || "General";
            } catch {
              map[fId] = "General";
            }
          })
        );

        setFacultyMap(map);
      } catch (err) {
        console.error("Student assignments load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-4 text-lg text-gray-600">
        Loading assignments...
      </div>
    );
  }

  // ------------------------------
  // Priority calculation
  // ------------------------------
  const getPriority = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = (due - now) / (1000 * 60 * 60 * 24);

    if (diff <= 2) return { level: "High", color: "red" };
    if (diff <= 6) return { level: "Medium", color: "orange" };
    return { level: "Low", color: "green" };
  };

  // ------------------------------
  // Progress calculation
  // ------------------------------
  const getProgress = (createdAt, dueDate) => {
    const start = new Date(createdAt);
    const end = new Date(dueDate);
    const now = new Date();

    const total = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h2 className="text-3xl font-bold text-blue-700">📘 Assignments</h2>
      <p className="text-gray-600 -mt-2">
        Track deadlines, priority, and download assignment instructions easily.
      </p>

      {assignments.length === 0 && (
        <p className="text-gray-500 text-lg">No assignments available.</p>
      )}

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((a) => {
          const priority = getPriority(a.dueDate);
          const progress = getProgress(a.createdAt, a.dueDate);
          const subject = facultyMap[a.facultyId] || "General";

          return (
            <div
              key={a._id}
              className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">{a.title}</h3>
                <span
                  className={`px-3 py-1 text-sm text-white rounded-full ${
                    priority.level === "High"
                      ? "bg-red-600"
                      : priority.level === "Medium"
                      ? "bg-orange-500"
                      : "bg-green-600"
                  }`}
                >
                  {priority.level} Priority
                </span>
              </div>

              {/* Subject */}
              <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {subject}
              </div>

              {/* Description */}
              {a.description && (
                <p className="mt-3 text-gray-700">{a.description}</p>
              )}

              {/* Note */}
              {a.note && (
                <p className="mt-1 text-gray-500 text-sm">
                  <b>Note:</b> {a.note}
                </p>
              )}

              {/* Due date */}
              <div className="flex items-center gap-2 mt-4 text-gray-700">
                <CalendarDays size={18} />
                <span className="font-medium">
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </span>
              </div>

              {/* Progress */}
              <div className="mt-4 flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={
                        priority.level === "High"
                          ? "#dc2626"
                          : priority.level === "Medium"
                          ? "#f59e0b"
                          : "#16a34a"
                      }
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={
                        2 * Math.PI * 28 * (1 - progress / 100)
                      }
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Time Progress</p>
                  <p className="font-semibold text-gray-800">
                    {progress < 100 ? "Keep going!" : "Due date reached"}
                  </p>
                </div>
              </div>

              {/* Download */}
              {a.fileUrl && (
                <a
                  href={`${API_BASE_URL}${a.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold"
                >
                  <FileDown size={18} />
                  Download Attachment
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
