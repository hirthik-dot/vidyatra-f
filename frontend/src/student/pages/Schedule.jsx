import { useEffect, useState } from "react";

export default function Schedule() {
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/student/timetable", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setPeriods(data.periods || []));
  }, []);
  console.log("PERIODS = ", periods);


  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-700 mb-4">
        Today’s Timetable
      </h2>

      <div className="space-y-4">
        {periods.map((p, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl shadow border 
              ${
                p.isFreePeriod
                  ? "bg-yellow-50 border-yellow-300"
                  : p.substituteFaculty
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-200"
              }
            `}
          >
            {/* TIME */}
            <p className="font-bold text-gray-800">
              {p.start} – {p.end}
            </p>

            {/* SUBJECT */}
            <p className="text-lg font-semibold text-blue-700 mt-1">
              {p.subject}
            </p>

            {/* STATUS HANDLING */}
            {p.isFreePeriod ? (
              <p className="text-red-600 font-medium text-sm mt-1">
                🔴 FREE PERIOD (Teacher Absent)
              </p>
            ) : p.substituteFaculty ? (
              <p className="text-blue-700 font-medium text-sm mt-1">
                🔵 Substitute Faculty: {p.facultyName}
              </p>
            ) : (
              <p className="text-green-700 font-medium text-sm mt-1">
                🟢 Faculty: {p.facultyName}
              </p>
            )}

            {/* AI Suggestions for free period */}
            {p.isFreePeriod && (
              <p className="text-green-700 mt-3 text-sm">
                💡 Suggestion: Use this free period to revise important topics,
                complete assignments, or explore career resources.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
