import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  User,
  Sparkles,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function Schedule() {
  const [periods, setPeriods] = useState([]);
  const navigate = useNavigate();

  // ICONS based on subject
  const subjectIcons = {
    Maths: <GraduationCap className="w-6 h-6 text-blue-600" />,
    Physics: <Lightbulb className="w-6 h-6 text-yellow-600" />,
    Chemistry: <Sparkles className="w-6 h-6 text-purple-600" />,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/student/timetable`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setPeriods(data.periods || []))
      .catch((err) => console.error("Timetable load error:", err));
  }, []);

  const getCurrentPeriod = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return periods.findIndex((p) => {
      const [sH, sM] = p.start.split(":").map(Number);
      const [eH, eM] = p.end.split(":").map(Number);
      const startMinutes = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;

      return currentTime >= startMinutes && currentTime <= endMinutes;
    });
  };

  const currentPeriodIndex = getCurrentPeriod();

  return (
    <div className="space-y-10">
      {/* HEADING */}
      <div>
        <h2 className="text-4xl font-extrabold text-blue-700">
          Today's Timetable
        </h2>
        <p className="text-gray-600 mt-1">
          Track your classes and stay prepared.
        </p>
      </div>

      {/* MAIN TIMETABLE CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-200">
        <div className="grid grid-cols-12 font-bold text-gray-700 pb-3 border-b">
          <p className="col-span-2 text-center">Time</p>
          <p className="col-span-3">Subject</p>
          <p className="col-span-3">Faculty</p>
          <p className="col-span-2 text-center">Status</p>
          <p className="col-span-2 text-center">Actions</p>
        </div>

        {/* PERIOD ROWS */}
        {periods.map((p, idx) => {
          const isCurrent = idx === currentPeriodIndex;

          return (
            <div
              key={idx}
              className={`grid grid-cols-12 p-4 rounded-xl my-3 transition-all cursor-pointer
                ${
                  p.isFreePeriod
                    ? "bg-yellow-50 border border-yellow-300"
                    : p.substituteFaculty
                    ? "bg-blue-50 border border-blue-300"
                    : "bg-green-50 border border-green-300"
                }
                ${
                  isCurrent
                    ? "scale-[1.03] shadow-lg border-blue-500"
                    : "shadow-sm"
                }
                hover:shadow-xl hover:scale-[1.02]
              `}
            >
              {/* TIME */}
              <div className="col-span-2 text-center">
                <p className="font-bold">
                  {p.start} – {p.end}
                </p>
                <p className="text-xs text-gray-500">Period {idx + 1}</p>
              </div>

              {/* SUBJECT */}
              <div className="col-span-3 flex items-center gap-2">
                {subjectIcons[p.subject] || (
                  <BookOpen className="w-6 h-6 text-gray-600" />
                )}
                <p className="text-lg font-semibold text-blue-800">
                  {p.subject}
                </p>
              </div>

              {/* FACULTY */}
              <div className="col-span-3 relative group">
                {p.isFreePeriod ? (
                  <p className="text-gray-500 italic">No faculty</p>
                ) : p.substituteFaculty ? (
                  <p className="text-blue-700 font-medium">
                    Substitute: {p.facultyName}
                  </p>
                ) : (
                  <p className="text-green-700 font-semibold">
                    {p.facultyName}
                  </p>
                )}

                {/* Hover Card */}
                {!p.isFreePeriod && (
                  <div className="absolute hidden group-hover:block left-0 top-8 bg-white p-3 shadow-xl rounded-lg border w-48 z-10">
                    <p className="font-bold text-blue-700">{p.facultyName}</p>
                    <p className="text-xs text-gray-500">
                      Faculty of {p.subject}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.start} – {p.end}
                    </p>
                  </div>
                )}
              </div>

              {/* STATUS */}
              <div className="col-span-2 flex justify-center">
                {p.isFreePeriod ? (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                    Free Period
                  </span>
                ) : p.substituteFaculty ? (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                    Substitute
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                    Active
                  </span>
                )}
              </div>

              {/* ACTION */}
              <div className="col-span-2 flex justify-center">
                {p.isFreePeriod ? (
                  <button
                    onClick={() => navigate("/student/ai")}
                    className="text-blue-700 underline flex items-center gap-1 text-sm"
                  >
                    <Sparkles className="w-4 h-4" /> AI Suggestion
                  </button>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMELINE VIEW */}
      <div>
        <h3 className="text-2xl font-bold text-blue-700 mb-4">Timeline View</h3>

        <div className="relative border-l-4 border-blue-300 pl-6">
          {periods.map((p, idx) => (
            <div key={idx} className="mb-10 relative">
              <span className="absolute -left-3 top-1 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow"></span>

              <div className="bg-white shadow-md border rounded-xl p-4">
                <p className="text-xs text-gray-500">Period {idx + 1}</p>
                <p className="font-semibold">{p.start} – {p.end}</p>

                <p className="text-lg font-bold text-blue-700 flex gap-2 mt-1">
                  {subjectIcons[p.subject]} {p.subject}
                </p>

                {p.isFreePeriod ? (
                  <p className="text-red-600 mt-1">🔴 Free Period</p>
                ) : p.substituteFaculty ? (
                  <p className="text-blue-700 mt-1">
                    🔵 Substitute: {p.facultyName}
                  </p>
                ) : (
                  <p className="text-green-700 mt-1">
                    🟢 Faculty: {p.facultyName}
                  </p>
                )}

                {p.isFreePeriod && (
                  <button
                    onClick={() => navigate("/student/ai")}
                    className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
                  >
                    <Sparkles className="w-4 h-4" /> Get AI Suggestion
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
