import { useEffect, useState } from "react";

export default function FacultyTimetable() {
  const [classesToday, setClassesToday] = useState([]);
  const [freePeriods, setFreePeriods] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = () => {
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }

    // Get today's classes
    fetch("http://localhost:5000/api/faculty/timetable", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setClassesToday(data.classes || []);
      })
      .catch(() => setError("Failed to load timetable"));

    // Get today's free periods
    fetch("http://localhost:5000/api/faculty/free-periods", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => setFreePeriods(data.freePeriods || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markAbsent = (period) => {
    setMessage("");
    fetch("http://localhost:5000/api/faculty/timetable/mark-absent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ period }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || "Marked absent");
        fetchData();
      })
      .catch(() => setError("Error marking absent"));
  };

  const attendFreePeriod = (period) => {
    setMessage("");
    fetch("http://localhost:5000/api/faculty/timetable/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ period }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || "You have taken this free period");
        fetchData();
      })
      .catch(() => setError("Error claiming free period"));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Today's Timetable</h2>
      <p className="text-gray-600 text-sm">
        Faculty: {localStorage.getItem("name")}
      </p>

      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      {/* ==== CLASS PERIODS ==== */}
      <div className="space-y-4">
        {classesToday.map((c, i) => (
          <div
            key={i}
            className="p-4 bg-white shadow rounded-xl border transition duration-200 hover:shadow-md"
          >
            <p className="font-bold text-lg flex items-center">
              Period {c.period}
              <span className="ml-2 inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">
                {c.subject}
              </span>
            </p>

            <p className="text-sm text-blue-700 mt-1">
              {c.start} - {c.end}
            </p>

            {c.isSubstitution && (
              <p className="text-xs text-green-700 mt-1 font-medium">
                ✔ Taking this as Substitute Faculty
              </p>
            )}

            {!c.teacherAbsent && !c.isSubstitution && (
              <button
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                onClick={() => markAbsent(c.period)}
              >
                Mark Absent for this Period
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ==== FREE PERIODS ==== */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-blue-700 mb-3">
          Free Periods (No Teacher Assigned)
        </h3>

        {freePeriods.length === 0 && (
          <p className="text-gray-600 text-sm">
            No free periods currently. All classes are assigned.
          </p>
        )}

        <div className="space-y-3">
          {freePeriods.map((p, idx) => (
            <div
              key={idx}
              className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-yellow-800">
                  Period {p.period} — {p.subject}
                </p>
                <p className="text-sm text-gray-700">
                  {p.start} - {p.end}
                </p>
              </div>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                onClick={() => attendFreePeriod(p.period)}
              >
                Attend
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
