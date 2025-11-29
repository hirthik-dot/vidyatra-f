import { useEffect, useState } from "react";

export default function Schedule() {
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/student/timetable", {
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => res.json())
      .then((data) => setPeriods(data.periods || []));
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-700 mb-4">
        Today's Timetable
      </h2>

      <div className="space-y-3">
        {periods.map((p, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl shadow 
              ${p.subject ? "bg-white" : "bg-yellow-100"}`}
          >
            <p className="font-bold">
              {p.start} - {p.end}
            </p>
            <p className="text-gray-700">
              {p.subject || "FREE PERIOD"}
            </p>

            {!p.subject && (
              <p className="text-sm text-red-600">
                Reason: Faculty absent
              </p>
            )}

            {p.suggestion && (
              <p className="text-green-600 mt-2 text-sm">
                Suggestion: {p.suggestion}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
