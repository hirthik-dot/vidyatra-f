import axios from "axios";
import { useEffect, useState } from "react";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/assignments/${studentId}`
        );
        setAssignments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) return <div className="p-4">Loading assignments...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-3">Assignments</h2>
      {assignments.length === 0 && <p>No assignments yet.</p>}

      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a._id} className="border rounded-xl p-3 bg-white">
            <div className="flex justify-between">
              <h3 className="font-semibold">{a.title}</h3>
              <span className="text-sm text-gray-500">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </span>
            </div>
            {a.description && (
              <p className="text-sm text-gray-700 mt-1">{a.description}</p>
            )}
            {a.note && (
              <p className="text-xs text-gray-500 mt-1">Note: {a.note}</p>
            )}
            {a.fileUrl && (
              <a
                href={`http://localhost:5000${a.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm mt-2 inline-block"
              >
                Download Attachment
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
