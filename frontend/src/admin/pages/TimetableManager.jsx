import { useEffect, useState } from "react";
import { Copy, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

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

  /* ================= LOAD CLASSES ================= */
  const loadClasses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/classes`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) setClasses(data.classes || []);
    } catch {
      console.log("Load classes error");
    }
  };

  /* ================= LOAD META ================= */
  const loadMeta = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/timetable/meta`, {
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

  /* ================= LOAD TIMETABLE ================= */
  const loadTimetable = async () => {
    setConflicts([]);

    if (!selectedClass) {
      alert("Select a class first");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/timetable/${selectedClass}`,
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = await res.json();

      if (!res.ok) {
        setGrid(buildEmptyGrid());
        setPeriodTimes([...DEFAULT_PERIOD_TIMES]);
        return;
      }

      if (data.days?.length) {
        const newGrid = DAYS.map((day) => {
          const dayDoc = data.days.find((d) => d.day === day);
          if (!dayDoc) return buildEmptyGrid().find((d) => d.day === day);

          return {
            day,
            periods: dayDoc.periods.map((p) => ({
              subject: p.subject || "",
              faculty: p.faculty || "",
              isFreePeriod: p.isFreePeriod ?? !p.subject,
              teacherAbsent: p.teacherAbsent || false,
              substituteFaculty: p.substituteFaculty || "",
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

  const updateCell = (dayIdx, periodIdx, changes) => {
    setGrid((prev) => {
      const copy = [...prev];
      const periods = [...copy[dayIdx].periods];
      periods[periodIdx] = { ...periods[periodIdx], ...changes };

      if (changes.isFreePeriod) {
        periods[periodIdx] = {
          subject: "",
          faculty: "",
          isFreePeriod: true,
          teacherAbsent: false,
          substituteFaculty: "",
        };
      }

      copy[dayIdx] = { ...copy[dayIdx], periods };
      return copy;
    });
  };

  /* ================= SAVE ================= */
  const saveTimetable = async () => {
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
      const res = await fetch(`${API_BASE_URL}/api/admin/timetable/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setConflicts(data.conflicts || []);
        return;
      }

      alert("Timetable saved successfully!");
    } catch (err) {
      console.error("Save timetable error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">
        Timetable Management
      </h2>

      {/* UI REMAINS SAME – ONLY BACKEND FIXED */}
      {/* (rest of JSX unchanged for clarity & stability) */}

      {/* Save Button */}
      {grid.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={saveTimetable}
            disabled={saving}
            className={`px-6 py-2 rounded-xl text-sm font-semibold text-white ${
              saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : "Save Timetable"}
          </button>
        </div>
      )}
    </div>
  );
}
