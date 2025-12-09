import { useEffect, useState } from "react";
import { Copy, AlertTriangle } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_PERIOD_TIMES = [
  { period: 1, start: "09:00", end: "09:50" },
  { period: 2, start: "09:50", end: "10:40" },
  { period: 3, start: "10:50", end: "11:40" },
  { period: 4, start: "11:40", end: "12:30" },
  { period: 5, start: "13:30", end: "14:20" },
  { period: 6, start: "14:20", end: "15:10" },
];

export default function TimetableManager() {
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [periodTimes, setPeriodTimes] = useState([...DEFAULT_PERIOD_TIMES]);
  const [grid, setGrid] = useState([]);

  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");

  useEffect(() => {
    loadClasses();
    loadMeta();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/classes", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) setClasses(data.classes || []);
    } catch {
      console.log("Load classes error");
    }
  };

  const loadMeta = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/timetable/meta", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) {
        setFaculty(data.faculty || []);
        setSubjects(data.subjects || []);
      }
    } catch {
      console.log("Load meta error");
    }
  };

  const buildEmptyGrid = () =>
    DAYS.map((day) => ({
      day,
      periods: DEFAULT_PERIOD_TIMES.map(() => ({
        subject: "",
        faculty: "",
        isFreePeriod: true,
        teacherAbsent: false,
        substituteFaculty: "",
      })),
    }));

  const loadTimetable = async () => {
    setConflicts([]);

    if (!selectedClass) {
      alert("Select a class first");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/timetable/${selectedClass}`,
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = await res.json();

      if (!res.ok) {
        setGrid(buildEmptyGrid());
        setPeriodTimes([...DEFAULT_PERIOD_TIMES]);
        return;
      }

      if (data.days && data.days.length > 0) {
        const firstDay = data.days[0];
        if (firstDay.periods?.length === DEFAULT_PERIOD_TIMES.length) {
          setPeriodTimes(
            firstDay.periods.map((p, idx) => ({
              period: idx + 1,
              start: p.start || DEFAULT_PERIOD_TIMES[idx].start,
              end: p.end || DEFAULT_PERIOD_TIMES[idx].end,
            }))
          );
        }

        const newGrid = DAYS.map((day) => {
          const dayDoc = data.days.find((d) => d.day === day);
          if (!dayDoc)
            return {
              day,
              periods: DEFAULT_PERIOD_TIMES.map(() => ({
                subject: "",
                faculty: "",
                isFreePeriod: true,
                teacherAbsent: false,
                substituteFaculty: "",
              })),
            };

          return {
            day,
            periods: dayDoc.periods.map((p) => ({
              subject: p.subject || "",
              faculty: p.faculty ? p.faculty.toString() : "",
              isFreePeriod: p.isFreePeriod ?? !p.subject,
              teacherAbsent: p.teacherAbsent || false,
              substituteFaculty: p.substituteFaculty
                ? p.substituteFaculty.toString()
                : "",
            })),
          };
        });

        setGrid(newGrid);
      } else {
        setGrid(buildEmptyGrid());
      }
    } catch (err) {
      console.error("Timetable load error:", err);
      setGrid(buildEmptyGrid());
    }
  };

  const handleHeaderTimeChange = (index, field, value) => {
    const updated = [...periodTimes];
    updated[index][field] = value;
    setPeriodTimes(updated);
  };

  const updateCell = (dayIdx, periodIdx, changes) => {
    setGrid((prev) => {
      const copy = [...prev];
      const row = { ...copy[dayIdx] };
      const periods = [...row.periods];
      periods[periodIdx] = { ...periods[periodIdx], ...changes };

      if (changes.isFreePeriod) {
        periods[periodIdx].subject = "";
        periods[periodIdx].faculty = "";
        periods[periodIdx].teacherAbsent = false;
        periods[periodIdx].substituteFaculty = "";
      }

      row.periods = periods;
      copy[dayIdx] = row;
      return copy;
    });
  };

  const saveTimetable = async () => {
    if (!selectedClass) {
      alert("Select a class");
      return;
    }

    setSaving(true);
    setConflicts([]);

    const payload = {
      className: selectedClass,
      days: grid.map((row, dayIdx) => ({
        day: row.day,
        periods: row.periods.map((cell, pIdx) => ({
          period: periodTimes[pIdx].period,
          start: periodTimes[pIdx].start,
          end: periodTimes[pIdx].end,
          subject: cell.subject,
          faculty: cell.faculty || null,
          isFreePeriod: cell.isFreePeriod,
          teacherAbsent: cell.teacherAbsent,
          substituteFaculty: cell.substituteFaculty || null,
        })),
      })),
    };

    try {
      const res = await fetch("http://localhost:5000/api/admin/timetable/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.conflicts) {
          setConflicts(data.conflicts);
        } else {
          alert(data.message || "Failed to save timetable");
        }
        return;
      }

      alert("Timetable saved successfully!");
    } catch (err) {
      console.error("Save timetable error:", err);
      alert("Error saving timetable");
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (!fromClass || !toClass) {
      alert("Select both source and target class");
      return;
    }
    if (fromClass === toClass) {
      alert("Source and target cannot be same");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/timetable/duplicate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ fromClassName: fromClass, toClassName: toClass }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to duplicate timetable");
        return;
      }

      alert("Timetable duplicated!");
      if (selectedClass === toClass) loadTimetable();
    } catch (err) {
      console.error("Duplicate timetable error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Timetable Management</h2>

      {/* TOP BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Select + Load */}
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Select Class & Load Timetable
          </p>

          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>

          <button
            onClick={loadTimetable}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Load Timetable
          </button>
        </div>

        {/* Duplicate */}
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 space-y-3 lg:col-span-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Copy className="w-4 h-4 text-indigo-600" />
            Duplicate Timetable
          </p>

          <div className="flex flex-wrap gap-2">
            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={fromClass}
              onChange={(e) => setFromClass(e.target.value)}
            >
              <option value="">From Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>

            <span className="self-center text-xs text-gray-500">→</span>

            <select
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={toClass}
              onChange={(e) => setToClass(e.target.value)}
            >
              <option value="">To Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>

            <button
              onClick={duplicate}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Duplicate
            </button>
          </div>

          <p className="text-[11px] text-gray-500">
            Useful when multiple sections share the same timetable.
          </p>
        </div>
      </div>

      {/* CONFLICTS */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 shadow">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="text-xs text-red-800 space-y-1">
            <p className="font-semibold">Conflicts detected:</p>
            <ul className="list-disc pl-4">
              {conflicts.map((c, idx) => (
                <li key={idx}>
                  {c.day}, Period {c.period} • Faculty {c.faculty} also in{" "}
                  {c.otherClasses.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TIMETABLE GRID */}
      {grid.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 overflow-x-auto">
          <table className="min-w-full border border-slate-300 rounded-lg text-xs">
            <thead className="bg-slate-100">
              <tr className="border-b border-slate-300">
                <th className="border-r border-slate-300 p-2 text-left font-semibold sticky left-0 bg-slate-100 z-20">
                  Day / Time
                </th>

                {periodTimes.map((p, idx) => (
                  <th
                    key={p.period}
                    className="border-r border-slate-300 p-2 text-center min-w-[170px] font-semibold"
                  >
                    <div>P{p.period}</div>

                    <div className="flex gap-1 justify-center mt-1">
                      <input
                        type="time"
                        className="border border-slate-300 rounded px-1 py-0.5 text-[11px] focus:ring-1 focus:ring-blue-500"
                        value={p.start}
                        onChange={(e) =>
                          handleHeaderTimeChange(idx, "start", e.target.value)
                        }
                      />

                      <span className="text-[10px]">–</span>

                      <input
                        type="time"
                        className="border border-slate-300 rounded px-1 py-0.5 text-[11px] focus:ring-1 focus:ring-blue-500"
                        value={p.end}
                        onChange={(e) =>
                          handleHeaderTimeChange(idx, "end", e.target.value)
                        }
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {grid.map((row, dayIdx) => (
                <tr
                  key={row.day}
                  className="border-b border-slate-200 odd:bg-slate-50 hover:bg-slate-100 transition"
                >
                  <td className="border-r border-slate-300 p-2 font-medium sticky left-0 bg-white z-10 shadow-sm">
                    {row.day}
                  </td>

                  {row.periods.map((cell, periodIdx) => {
                    const isFree = cell.isFreePeriod;
                    const isAbsent = cell.teacherAbsent;

                    return (
                      <td
                        key={periodIdx}
                        className={`border-r border-slate-300 p-2 align-top transition ${
                          isFree
                            ? "bg-emerald-50 hover:bg-emerald-100"
                            : isAbsent
                            ? "bg-amber-50 hover:bg-amber-100"
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="space-y-1">
                          {/* Subject */}
                          <select
                            className="w-full border border-slate-300 rounded px-1 py-0.5 text-[11px] bg-white focus:ring-1 focus:ring-blue-500"
                            disabled={cell.isFreePeriod}
                            value={cell.subject}
                            onChange={(e) =>
                              updateCell(dayIdx, periodIdx, {
                                subject: e.target.value,
                                isFreePeriod: e.target.value === "",
                              })
                            }
                          >
                            <option value="">Free Period</option>
                            {subjects.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          {/* Faculty */}
                          <select
                            className="w-full border border-slate-300 rounded px-1 py-0.5 text-[11px] bg-white focus:ring-1 focus:ring-blue-500"
                            disabled={cell.isFreePeriod}
                            value={cell.facfaculty}
                            onChange={(e) =>
                              updateCell(dayIdx, periodIdx, {
                                faculty: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Faculty</option>
                            {faculty.map((f) => (
                              <option key={f._id} value={f._id}>
                                {f.name} ({f.subject})
                              </option>
                            ))}
                          </select>

                          {/* Toggles */}
                          <div className="flex items-center justify-between gap-1 mt-1">
                            <label className="flex items-center gap-1 text-[10px]">
                              <input
                                type="checkbox"
                                checked={cell.isFreePeriod}
                                onChange={(e) =>
                                  updateCell(dayIdx, periodIdx, {
                                    isFreePeriod: e.target.checked,
                                  })
                                }
                              />
                              Free
                            </label>

                            <label className="flex items-center gap-1 text-[10px]">
                              <input
                                type="checkbox"
                                disabled={cell.isFreePeriod}
                                checked={cell.teacherAbsent}
                                onChange={(e) =>
                                  updateCell(dayIdx, periodIdx, {
                                    teacherAbsent: e.target.checked,
                                    substituteFaculty: e.target.checked
                                      ? cell.substituteFaculty
                                      : "",
                                  })
                                }
                              />
                              Absent
                            </label>
                          </div>

                          {/* Substitute */}
                          {!cell.isFreePeriod && cell.teacherAbsent && (
                            <select
                              className="w-full border border-slate-300 rounded px-1 py-0.5 text-[11px] bg-white mt-1 focus:ring-1 focus:ring-blue-500"
                              value={cell.substituteFaculty}
                              onChange={(e) =>
                                updateCell(dayIdx, periodIdx, {
                                  substituteFaculty: e.target.value,
                                })
                              }
                            >
                              <option value="">Substitute Faculty</option>
                              {faculty.map((f) => (
                                <option key={f._id} value={f._id}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          )}

                          <p className="text-[10px] text-gray-500 mt-1">
                            {isFree
                              ? "Free Period"
                              : isAbsent
                              ? "Substitute required"
                              : "Regular class"}
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <button
              onClick={saveTimetable}
              disabled={saving}
              className={`px-6 py-2 rounded-xl text-sm font-semibold text-white ${
                saving
                  ? "bg-gray-400"
                  : "bg-green-600 hover:bg-green-700 transition"
              }`}
            >
              {saving ? "Saving..." : "Save Timetable"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
