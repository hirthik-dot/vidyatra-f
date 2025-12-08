// src/faculty/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Award,
  ChevronDown,
} from "lucide-react";
import {
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart as RLineChart,
  Line,
  CartesianGrid,
} from "recharts";

// ⬇️ Your axios instance
import api from "../../utils/axios";

const GENDER_COLORS = ["#38bdf8", "#ec4899", "#a855f7"];
const CLASS_COLORS = ["#0ea5e9", "#22c55e", "#f97316"];

export default function FacultyDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/faculty/dashboard");
        console.log("DASHBOARD DATA:", res.data);
        setDashboard(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // 🔐 Loading & error states
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-11 w-11 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-slate-600 text-sm tracking-wide">
            Preparing your faculty analytics…
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
          <p className="text-sm text-red-700">
            {error || "Unable to load dashboard."}
          </p>
        </div>
      </div>
    );
  }

  // 🧠 Safe destructuring with defaults
  const {
    facultyName = "Demo Faculty",
    subjectName = "Demo Subject",

    totalStudents = 0,

    // mark-wise stats for THIS faculty's subject
    avgSubjectMark = 0, // average mark in this subject across selected classes
    avgCgpa = 0,

    genderCounts = { male: 0, female: 0, other: 0 },

    // class info from backend
    classes = [], // e.g. ["CSE A", "CSE B", "CSE C"]
    departments = [],

    // stats grouped by class
    classStats = [], // [{ className, avgCgpa, avgSubjectMark, studentCount }, ...]

    // marks for this subject by class
    marksOverview = [], // [{ className, highest, lowest, average }, ...]

    trendsByClass = [], // [{ className, avgCgpa }, ...]
    resultsByClass = [], // [{ className, passPercentage }, ...]
  } = dashboard || {};

  // ⬇️ Apply class filter on class-based arrays
  const filterByClass = (arr) =>
    selectedClass === "All"
      ? arr
      : arr.filter((item) => item.className === selectedClass);

  const filteredClassStats = filterByClass(classStats);
  const filteredMarksOverview = filterByClass(marksOverview);
  const filteredTrends = filterByClass(trendsByClass);
  const filteredResults = filterByClass(resultsByClass);

  // ───────── GENDER PIE ─────────
  const totalGender =
    (genderCounts.male || 0) +
    (genderCounts.female || 0) +
    (genderCounts.other || 0);

  const genderChartData =
    totalGender > 0
      ? [
          { name: "Male", value: genderCounts.male || 0 },
          { name: "Female", value: genderCounts.female || 0 },
          ...(genderCounts.other
            ? [{ name: "Other", value: genderCounts.other }]
            : []),
        ]
      : [
          { name: "Male", value: 13 },
          { name: "Female", value: 7 },
        ];

  // ───────── AVG CGPA BY CLASS ─────────
  const classChartData =
    filteredClassStats && filteredClassStats.length
      ? filteredClassStats.map((c) => ({
          className: c.className,
          avgCgpa: c.avgCgpa,
        }))
      : [
          { className: "CSE A", avgCgpa: 8.4 },
          { className: "CSE B", avgCgpa: 8.1 },
          { className: "CSE C", avgCgpa: 7.9 },
        ];

  // ───────── MARKS OVERVIEW (HIGHEST / LOWEST / AVG) ─────────
  const marksOverviewData =
    filteredMarksOverview && filteredMarksOverview.length
      ? filteredMarksOverview
      : [
          { className: "CSE A", highest: 95, lowest: 40, average: 78 },
          { className: "CSE B", highest: 92, lowest: 45, average: 75 },
          { className: "CSE C", highest: 90, lowest: 42, average: 73 },
        ];

  const overallAvg =
    marksOverviewData.length > 0
      ? (
          marksOverviewData.reduce((sum, c) => sum + (c.average || 0), 0) /
          marksOverviewData.length
        ).toFixed(2)
      : "0.00";

  // ───────── TRENDS BY CLASS ─────────
  const trendsData =
    filteredTrends && filteredTrends.length
      ? filteredTrends
      : classChartData.map((c, idx) => ({
          className: c.className,
          avgCgpa: c.avgCgpa,
          index: idx + 1,
        }));

  // ───────── RESULTS BY CLASS ─────────
  const resultsData =
    filteredResults && filteredResults.length
      ? filteredResults
      : classChartData.map((c) => ({
          className: c.className,
          passPercentage: Math.round(c.avgCgpa * 10),
        }));

  const classOptions = ["All", ...(classes || [])];
  const departmentOptions = ["All", ...(departments || [])];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Faculty Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Live snapshot of your classes – subject-wise marks, CGPA trends and
              results for{" "}
              <span className="font-semibold text-slate-900">
                {facultyName}
              </span>{" "}
              handling{" "}
              <span className="font-semibold text-slate-900">
                {subjectName}
              </span>.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap gap-3">
              <FilterDropdown
                label="Class"
                value={selectedClass}
                onChange={setSelectedClass}
                options={classOptions}
              />
              <FilterDropdown
                label="Department"
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={departmentOptions}
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing data for{" "}
              <span className="font-medium">
                {selectedClass === "All" ? "all assigned classes" : selectedClass}
              </span>
            </div>
          </div>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Students"
            value={totalStudents}
            chip="Across selected classes"
          />
          <StatCard
            icon={GraduationCap}
            label="Avg. Subject Mark"
            value={Number(avgSubjectMark || overallAvg || 0).toFixed(2)}
            chip={`In ${subjectName}`}
          />
          <StatCard
            icon={Award}
            label="Avg. CGPA"
            value={Number(avgCgpa || 0).toFixed(2)}
            chip="Overall CGPA"
          />
        </div>

        {/* MIDDLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* GENDER PIE */}
          <Card title="Gender Distribution (Static for Demo)">
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={genderChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {genderChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AVG CGPA BY CLASS */}
          <Card title="Average CGPA by Class">
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={classChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Bar dataKey="avgCgpa" radius={[8, 8, 0, 0]}>
                    {classChartData.map((entry, index) => (
                      <Cell
                        key={entry.className}
                        fill={CLASS_COLORS[index % CLASS_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* SUBJECT MARKS – H/L/AVG */}
          <Card title="Subject Marks by Class (Highest / Lowest / Average)">
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={marksOverviewData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="className" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="highest"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Highest"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Average"
                  />
                  <Line
                    type="monotone"
                    dataKey="lowest"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Lowest"
                  />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* TRENDS BY CLASS */}
          <Card title="CGPA Trends by Class">
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgCgpa"
                    stroke="#38bdf8"
                    strokeWidth={2.1}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Avg CGPA"
                  />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* RESULTS BY CLASS */}
          <Card title="Results by Class">
            <div className="flex h-80">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie
                      data={resultsData}
                      dataKey="passPercentage"
                      nameKey="className"
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {resultsData.map((entry, index) => (
                        <Cell
                          key={entry.className}
                          fill={CLASS_COLORS[index % CLASS_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                      itemStyle={{ color: "#e5e7eb" }}
                    />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-3">
                {resultsData.map((r, i) => (
                  <div
                    key={r.className}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            CLASS_COLORS[i % CLASS_COLORS.length],
                        }}
                      />
                      <span className="text-slate-800">{r.className}</span>
                    </div>
                    <span className="text-slate-500">
                      {Number(r.passPercentage || 0).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────  SMALL COMPONENTS  ───────────────────────── */

function StatCard({ icon: Icon, label, value, chip }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-sky-200/40 blur-2xl" />
      <div className="p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-[11px] text-slate-500">{chip}</p>
        </div>
        <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Icon className="h-5 w-5 text-sky-500" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-4 pt-3 pb-2 border-b border-slate-200 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-xs font-medium tracking-[0.14em] uppercase text-slate-700">
          {title}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FilterDropdown({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5 shadow-sm">
      <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          className="bg-transparent text-xs text-slate-800 pr-5 outline-none appearance-none cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-white text-slate-800"
            >
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1 h-3 w-3 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
