import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileQuestion } from "lucide-react";

import { API_BASE_URL } from "../../config/api";

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/student-assessments/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sort: pending first → completed later
      const sorted = res.data.sort(
        (a, b) => Number(a.submitted) - Number(b.submitted)
      );

      setAssessments(sorted);
    } catch (err) {
      console.error("Student assessments load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading assessments...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-100 to-indigo-200">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 drop-shadow-lg">
          Your Assessments
        </h1>
        <p className="text-gray-700 mt-1">
          Track and complete your assessments on time.
        </p>
      </div>

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {assessments.map((a, index) => (
          <motion.div
            key={a._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-2xl shadow-xl p-6 border backdrop-blur-lg transition hover:shadow-2xl cursor-pointer
              ${
                a.submitted
                  ? "bg-white/70 border-green-200"
                  : "bg-white/90 border-indigo-200"
              }`}
          >
            {/* Title */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">
              {a.title}
            </h3>

            <p className="text-sm text-gray-600">{a.className}</p>

            {/* Due date */}
            <div className="mt-3 flex items-center gap-2 text-gray-700">
              <Clock size={18} />
              <span className="text-sm font-medium">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </span>
            </div>

            {/* Status */}
            <div className="mt-4">
              {a.submitted ? (
                <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Completed
                </span>
              ) : (
                <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Pending
                </span>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-end">
              {a.submitted ? (
                <button
                  onClick={() =>
                    navigate(`/student/assessment/view/${a._id}`)
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  View Submission
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/student/assessment/${a._id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 flex items-center gap-2"
                >
                  <FileQuestion size={18} />
                  Attempt Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
