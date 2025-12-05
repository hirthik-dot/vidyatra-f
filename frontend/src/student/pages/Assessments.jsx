import axios from "axios";
import { useEffect, useState } from "react";

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/assessments/${studentId}`
        );
        setAssessments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) return <div className="p-4">Loading assessments...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-3">Assessments</h2>
      {assessments.length === 0 && <p>No assessments yet.</p>}

      <div className="space-y-3">
        {assessments.map((t) => (
          <div key={t._id} className="border rounded-xl p-3 bg-white">
            <div className="flex justify-between">
              <h3 className="font-semibold">{t.title}</h3>
              <span className="text-sm text-gray-500">
                Date: {new Date(t.dueDate).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Class: {t.className}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
