import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function FacultyTimetable() {
  const [classesToday, setClassesToday] = useState([]);
  const [freePeriods, setFreePeriods] = useState([]);
  const [fullWeekData, setFullWeekData] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState("");

  const token = localStorage.getItem("token");

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const PERIOD_TIMES = [
    { start: "09:00", end: "09:50" },
    { start: "09:50", end: "10:40" },
    { start: "10:40", end: "11:30" },
    { start: "11:30", end: "12:20" },
    { start: "13:00", end: "13:50" },
    { start: "13:50", end: "14:40" },
    { start: "14:40", end: "15:30" },
    { start: "15:30", end: "16:20" },
  ];

  // ===== TODAY =====
  const todayIndex = new Date().getDay() - 1;
  const todayName = DAYS[todayIndex];

  /* ================= LIVE CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-US", {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/faculty/timetable/weekly`,
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = await res.json();
      const weekly = data.weekly || {};
      setFullWeekData(weekly);

      const todayData = weekly[todayName] || [];
      setClassesToday(todayData.filter(Boolean));
    } catch {
      setError("Failed to load timetable");
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/faculty/free-periods`,
        { headers: { Authorization: "Bearer " + token } }
      );
      const data = await res.json();
      setFreePeriods(data.freePeriods || []);
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= CURRENT PERIOD ================= */
  const getCurrentPeriod = () => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    return PERIOD_TIMES.findIndex(
      (p) => time >= p.start && time <= p.end
    );
  };

  const currentPeriodIndex = getCurrentPeriod();

  /* ================= ACTIONS ================= */
  const markAbsent = async (period) => {
    const res = await fetch(
      `${API_BASE_URL}/api/faculty/timetable/mark-absent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ period }),
      }
    );

    const data = await res.json();
    setMessage(data.message || "Marked absent");
    fetchData();
  };

  const attendFreePeriod = async (period) => {
    const res = await fetch(
      `${API_BASE_URL}/api/faculty/timetable/claim`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ period }),
      }
    );

    const data = await res.json();
    setMessage(data.message || "You claimed this free period");
    fetchData();
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <CalendarDays className="text-indigo-600" size={42} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-700 text-transparent bg-clip-text">
            Weekly Timetable
          </h1>
        </motion.div>

        <div className="text-right text-indigo-700 font-semibold text-lg p-3 bg-white/70 backdrop-blur-xl rounded-xl shadow">
          {clock}
        </div>
      </div>

      {message && <p className="text-green-600 mb-3">{message}</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-xl rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3 text-left">Day</th>
              {PERIOD_TIMES.map((p, i) => (
                <th key={i} className="p-3 text-center border-l">
                  <div>Period {i + 1}</div>
                  <div className="text-xs">
                    {p.start}–{p.end}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map((day) => {
              const isToday = day === todayName;

              return (
                <tr
                  key={day}
                  className={isToday ? "bg-indigo-50" : "bg-white"}
                >
                  <td className="p-3 font-semibold">{day}</td>

                  {fullWeekData[day]?.map((p, i) => {
                    const freeInfo = freePeriods.find(
                      (fp) => fp.period === i + 1
                    );

                    const isFreeToday = isToday && !p && freeInfo;
                    const isCurrent = isToday && i === currentPeriodIndex;

                    return (
                      <td
                        key={i}
                        className={`p-2 text-center border-l ${
                          isCurrent ? "bg-blue-100" : ""
                        }`}
                      >
                        {isFreeToday ? (
                          <div>
                            <b>FREE</b>
                            <p className="text-xs">{freeInfo.subject}</p>
                            <button
                              onClick={() =>
                                attendFreePeriod(freeInfo.period)
                              }
                              className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded"
                            >
                              Take
                            </button>
                          </div>
                        ) : p ? (
                          <div>
                            <div className="font-semibold text-indigo-700">
                              {p.subject}
                            </div>

                            {!p.teacherAbsent && (
                              <button
                                onClick={() => markAbsent(p.period)}
                                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded"
                              >
                                Absent
                              </button>
                            )}

                            {p.teacherAbsent && (
                              <div className="mt-2 text-red-600 text-xs font-semibold flex justify-center gap-1">
                                <AlertTriangle size={14} /> Absent
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
