import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, AlertTriangle } from "lucide-react";

export default function FacultyTimetable() {
  const [classesToday, setClassesToday] = useState([]);
  const [freePeriods, setFreePeriods] = useState([]);
  const [fullWeekData, setFullWeekData] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState("");

  const token = localStorage.getItem("token");

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

  // Detect today's weekday name
  const todayIndex = new Date().getDay() - 1;
  const todayName = DAYS[todayIndex];

  // ==== LIVE CLOCK ====
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const options = { weekday: "long", hour: "2-digit", minute: "2-digit", second: "2-digit" };
      setClock(now.toLocaleTimeString("en-US", options));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==== FETCH WEEKLY TIMETABLE ====
  const fetchData = () => {
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }

    fetch("http://localhost:5000/api/faculty/timetable/weekly", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        const weekly = data.weekly || {};
        setFullWeekData(weekly);

        const todayData = weekly[todayName] || [];
        setClassesToday(todayData.filter(x => x !== null));
      })
      .catch(() => setError("Failed to load timetable"));

    fetch("http://localhost:5000/api/faculty/free-periods", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setFreePeriods(data.freePeriods || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==== CURRENT PERIOD DETECTOR ====
  const getCurrentPeriod = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;

    return PERIOD_TIMES.findIndex(p => time >= p.start && time <= p.end);
  };

  const currentPeriodIndex = getCurrentPeriod();

  const markAbsent = (period) => {
    fetch("http://localhost:5000/api/faculty/timetable/mark-absent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ period }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || "Marked absent");
        fetchData();
      });
  };

  const attendFreePeriod = (period) => {
    fetch("http://localhost:5000/api/faculty/timetable/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ period }),
    })
      .then(res => res.json())
      .then((data) => {
        setMessage(data.message || "You claimed this free period");
        fetchData();
      });
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-100 via-white to-blue-100">

      {/* HEADER WITH CLOCK */}
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
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

      {/* TIMETABLE TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-xl rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl">

          {/* HEADER */}
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3 text-left">Day</th>
              {PERIOD_TIMES.map((p, i) => (
                <th key={i} className="p-3 text-center border-l border-white/40">
                  <div className="font-semibold">Period {i + 1}</div>
                  <div className="text-xs opacity-90">{p.start}–{p.end}</div>
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {DAYS.map(day => {
              const isToday = day === todayName;

              return (
                <tr key={day} className={`border-b border-gray-300 ${isToday ? "bg-indigo-50 shadow-inner" : "bg-white"}`}>
                  <td className={`p-3 font-semibold ${isToday ? "text-indigo-700" : "text-gray-700"}`}>
                    {day}
                  </td>

                  {fullWeekData[day]?.map((p, i) => {
                    const freeInfo = freePeriods.find(fp => fp.period === i + 1);
                    const isFreeToday = isToday && !p && freeInfo;

                    const isCurrentPeriod = isToday && i === currentPeriodIndex;

                    return (
                      <td
                        key={i}
                        className={`p-2 text-center border-l relative transition-all
                          ${isCurrentPeriod ? "bg-blue-100 shadow-lg scale-[1.03]" : ""}
                          ${isFreeToday ? "bg-yellow-50 text-yellow-800 shadow-inner rounded-lg scale-[1.02]" : ""}
                          hover:scale-[1.02] hover:shadow-md`}
                      >

                        {/* FREE PERIOD (INSIDE TABLE) */}
                        {isFreeToday ? (
                          <div>
                            <div className="font-bold">FREE</div>
                            <div className="text-xs text-gray-700">{freeInfo.subject}</div>
                            <div className="text-xs text-gray-500">{freeInfo.start} - {freeInfo.end}</div>

                            <button
                              onClick={() => attendFreePeriod(freeInfo.period)}
                              className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
                            >
                              Take
                            </button>
                          </div>
                        ) : p ? (
                          /* CLASS PERIOD */
                          <div className="flex flex-col items-center">
                            <div className="font-semibold text-indigo-700">{p.subject}</div>
                            <div className="text-xs text-gray-600">{p.start} - {p.end}</div>

                            {p.isSubstitution && (
                              <span className="mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Substitute
                              </span>
                            )}

                            {!p.teacherAbsent && (
                              <button
                                onClick={() => markAbsent(p.period)}
                                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                              >
                                Absent
                              </button>
                            )}

                            {p.teacherAbsent && (
                              <div className="mt-2 flex items-center gap-1 text-red-600 text-xs font-semibold">
                                <AlertTriangle size={14} /> Absent
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs italic">—</div>
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

      {/* FREE PERIODS BELOW */}
      <div className="mt-10 bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Available Free Periods</h2>

        {freePeriods.length === 0 ? (
          <p className="text-gray-600">No free periods available right now.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {freePeriods.map((p, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-xl shadow">
                <p className="font-semibold text-yellow-900">Period {p.period} — {p.subject}</p>
                <p className="text-sm text-gray-700">{p.start} - {p.end}</p>

                <button onClick={() => attendFreePeriod(p.period)}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  Take This Period
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
