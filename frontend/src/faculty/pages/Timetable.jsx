import { useEffect, useState } from "react";

export default function FacultyTimetable() {
  const [classesToday, setClassesToday] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/faculty/timetable", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setClassesToday(data.classes || []));
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-700 mb-5">
        Today’s Teaching Schedule
      </h2>

      {classesToday.length === 0 && (
        <p className="text-gray-600">No classes today.</p>
      )}

      <div className="space-y-4">
        {classesToday.map((c, i) => (
          <div key={i} className="p-4 bg-white shadow rounded-xl border">
            <p className="font-bold text-lg">{c.subject}</p>
            <p className="text-gray-700">{c.studentName}</p>
            <p className="text-sm text-blue-700 mt-1">
              {c.start} - {c.end}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
