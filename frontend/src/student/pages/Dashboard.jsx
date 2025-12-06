// src/student/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart2,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Sparkles,
  Star,
  Target,
  X,
} from "lucide-react";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  // Interest onboarding
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);

  const navigate = useNavigate();

  const ALL_INTERESTS = [
    "Web Development",
    "Ethical Hacking",
    "Cybersecurity",
    "AI & Machine Learning",
    "Data Science",
    "App Development",
    "Cloud Computing",
    "Computer Networks",
    "Software Engineering",
    "Competitive Programming",
  ];

  // SAVE INTERESTS
  const saveInterests = async () => {
    if (selectedInterests.length === 0) {
      alert("Please select at least one interest");
      return;
    }

    try {
      setSavingInterests(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/student/save-interests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ interests: selectedInterests }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Save interests error:", data);
        alert("Failed to save interests");
        return;
      }

      setUser((prev) =>
        prev ? { ...prev, interests: selectedInterests } : prev
      );
      setShowInterestForm(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving interests");
    } finally {
      setSavingInterests(false);
    }
  };

  // LOAD DASHBOARD + SUGGESTIONS
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [dashRes, aiRes] = await Promise.all([
          fetch("http://localhost:5000/api/student/dashboard", {
            headers: { Authorization: "Bearer " + token },
          }),
          fetch("http://localhost:5000/api/student/ai-suggestions", {
            headers: { Authorization: "Bearer " + token },
          }),
        ]);

        const dashData = await dashRes.json();
        const aiData = await aiRes.json();

        if (!dashRes.ok) {
          setError(dashData.message || "Failed to load dashboard");
        } else {
          setUser(dashData.user);
          setStats(dashData.stats);

          // Show interest modal only if first-time / no interests
          if (
            dashData.user &&
            (!dashData.user.interests || dashData.user.interests.length === 0)
          ) {
            setShowInterestForm(true);
          } else if (dashData.user?.interests?.length > 0) {
            setSelectedInterests(dashData.user.interests);
          }
        }

        if (aiRes.ok && aiData.suggestions) {
          setSuggestions(aiData.suggestions);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Something went wrong loading dashboard");
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const attendance = stats?.attendancePercent ?? 0;
  const assignmentsPending = stats?.assignmentsPending ?? 0;
  const upcomingExams = stats?.upcomingExams ?? 0;

  const attendanceStatus =
    attendance >= 90 ? "Excellent" : attendance >= 75 ? "Safe" : "At Risk";

  const attendanceColor =
    attendance >= 90
      ? "text-green-600"
      : attendance >= 75
      ? "text-amber-500"
      : "text-red-500";

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <div>
            <p className="font-semibold text-gray-800">Loading your space…</p>
            <p className="text-xs text-gray-500">
              Fetching attendance, assignments and smart suggestions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="font-semibold text-red-600 mb-1">
            Unable to load dashboard
          </p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===================== INTEREST MODAL ===================== */}
      {showInterestForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure? Interests help us personalize your recommendations."
                  )
                ) {
                  setShowInterestForm(false);
                }
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-blue-700 mb-1">
              Tell us what you like ✨
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              We’ll use this to customize your <strong>free period plans</strong>{" "}
              and <strong>AI suggestions</strong>.
            </p>

            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto border rounded-xl p-3">
              {ALL_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      setSelectedInterests((prev) =>
                        prev.includes(interest)
                          ? prev.filter((i) => i !== interest)
                          : [...prev, interest]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {isSelected && (
                      <Star className="inline-block w-3 h-3 mr-1 fill-yellow-300 text-yellow-300" />
                    )}
                    {interest}
                  </button>
                );
              })}
            </div>

            <button
              className="mt-5 w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60"
              onClick={saveInterests}
              disabled={savingInterests}
            >
              {savingInterests ? "Saving…" : "Save & Personalize Dashboard"}
            </button>
          </div>
        </div>
      )}

      {/* ===================== HEADER / HERO ===================== */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-100 mb-1">
            Student Control Center
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold flex items-center gap-2">
            Welcome back, {user?.name || "Student"} 👋
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            One glance summary of your{" "}
            <span className="font-semibold">attendance</span>,{" "}
            <span className="font-semibold">tasks</span>, and{" "}
            <span className="font-semibold">AI powered guidance</span>.
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {user?.className && (
              <span className="px-3 py-1 rounded-full bg-blue-500/40 border border-blue-200/60">
                Class: {user.className}
              </span>
            )}
            {user?.department && (
              <span className="px-3 py-1 rounded-full bg-blue-500/40 border border-blue-200/60">
                Dept: {user.department}
              </span>
            )}
            {user?.interests?.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-200/70 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {user.interests.length} interests set
              </span>
            )}
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20 w-full md:w-64">
          <p className="text-xs text-blue-50 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Today highlight
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100">Overall Attendance</p>
              <p className={`text-3xl font-extrabold ${attendanceColor}`}>
                {attendance}%
              </p>
              <p className="text-[11px] text-blue-100">
                Status: <span className="font-semibold">{attendanceStatus}</span>
              </p>
            </div>
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/20" />
              <div
                className="absolute inset-1 rounded-full border-4 border-white"
                style={{
                  borderColor: "rgba(255,255,255,0.85)",
                  maskImage:
                    "conic-gradient(from 0deg, #000 0deg, #000 " +
                    (attendance * 3.6) +
                    "deg, transparent " +
                    (attendance * 3.6) +
                    "deg)",
                  WebkitMaskImage:
                    "conic-gradient(from 0deg, #000 0deg, #000 " +
                    (attendance * 3.6) +
                    "deg, transparent " +
                    (attendance * 3.6) +
                    "deg)",
                }}
              />
              <div className="absolute inset-3 bg-blue-800/40 rounded-full flex items-center justify-center text-[10px] text-center leading-tight">
                {attendance >= 75 ? "On Track" : "Catch Up"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== TOP STATS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Attendance card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Activity className="w-4 h-4 text-blue-500" />
              Attendance
            </p>
            <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              Target ≥ 75%
            </span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <p className={`text-3xl font-bold ${attendanceColor}`}>
              {attendance}%
            </p>
            <p className="text-xs text-gray-500">
              {attendance >= 90
                ? "Excellent consistency"
                : attendance >= 75
                ? "Safe zone, maintain it"
                : "Risk of shortage"}
            </p>
          </div>
          <div className="mt-2 w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                attendance >= 75 ? "bg-green-500" : "bg-red-400"
              }`}
              style={{ width: `${Math.min(attendance, 100)}%` }}
            />
          </div>
        </div>

        {/* Assignments card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <ListTodo className="w-4 h-4 text-violet-500" />
              Assignments Pending
            </p>
            <span className="text-[10px] px-2 py-1 rounded-full bg-violet-50 text-violet-700">
              From faculty
            </span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <p className="text-3xl font-bold text-violet-700">
              {assignmentsPending}
            </p>
            <p className="text-xs text-gray-500">
              {assignmentsPending === 0
                ? "All caught up 🎉"
                : assignmentsPending <= 2
                ? "Light load"
                : assignmentsPending <= 5
                ? "Plan today"
                : "High workload – prioritize!"}
            </p>
          </div>
          <button
            onClick={() => navigate("/student/assignments")}
            className="mt-2 text-xs text-violet-700 font-semibold underline underline-offset-2"
          >
            View assignments
          </button>
        </div>

        {/* Exams card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              Upcoming Exams
            </p>
            <span className="text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-700">
              Exams / Tests
            </span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <p className="text-3xl font-bold text-amber-600">
              {upcomingExams}
            </p>
            <p className="text-xs text-gray-500">
              {upcomingExams === 0
                ? "No exams this week"
                : "Time to start revising"}
            </p>
          </div>
          <button
            onClick={() => navigate("/student/performance")}
            className="mt-2 text-xs text-amber-700 font-semibold underline underline-offset-2"
          >
            Check performance & exams
          </button>
        </div>
      </div>

      {/* ===================== MIDDLE SECTION ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Suggestions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Smart Suggestions for You
              </h3>
              <p className="text-xs text-gray-500">
                Based on today’s timetable, free periods & pending work.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/ai")}
              className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold flex items-center gap-1 hover:bg-blue-100"
            >
              <Brain className="w-3 h-3" />
              Open AI Assistant
            </button>
          </div>

          {(!suggestions || suggestions.length === 0) && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>
                No special suggestions right now. Attend classes regularly and
                keep clearing assignments!
              </span>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className="mt-3 space-y-3">
              {suggestions.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-sm text-gray-800 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mt-0.5">
                    <Clock className="w-4 h-4 text-cyan-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      Period {s.period} • {s.start} – {s.end}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {s.label || "Free period optimization"}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {s.suggestion}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white border border-cyan-200 text-cyan-700 mt-1 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Focus
                  </span>
                </div>
              ))}
              {suggestions.length > 3 && (
                <p className="text-[11px] text-gray-500 mt-1">
                  +{suggestions.length - 3} more suggestions inside AI
                  Assistant.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Announcements / Broadcasts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" />
              Important Announcements
            </h3>
          </div>

          {stats?.announcements && stats.announcements.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {stats.announcements.map((a, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-gray-800"
                >
                  • {a}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              No new announcements. Keep an eye here for exam schedules, event
              updates & notices.
            </p>
          )}
        </div>
      </div>

      {/* ===================== BOTTOM SECTION ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigate("/student/schedule")}
              className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 flex flex-col items-start gap-1"
            >
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-indigo-700">
                Today’s Timetable
              </span>
              <span className="text-[10px] text-gray-500">
                View all periods & teachers
              </span>
            </button>

            <button
              onClick={() => navigate("/student/assignments")}
              className="p-3 rounded-xl bg-violet-50 hover:bg-violet-100 flex flex-col items-start gap-1"
            >
              <ListTodo className="w-4 h-4 text-violet-600" />
              <span className="font-semibold text-violet-700">
                Assignments
              </span>
              <span className="text-[10px] text-gray-500">
                Pending & completed tasks
              </span>
            </button>

            <button
              onClick={() => navigate("/student/attendance")}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex flex-col items-start gap-1"
            >
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-700">
                Smart Attendance
              </span>
              <span className="text-[10px] text-gray-500">
                Mark via Wi-Fi / Face / QR
              </span>
            </button>

            <button
              onClick={() => navigate("/student/leave")}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 flex flex-col items-start gap-1"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-700">
                Leave / OD Request
              </span>
              <span className="text-[10px] text-gray-500">
                Apply & track approvals
              </span>
            </button>
          </div>
        </div>

        {/* Interests Showcase */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="w-4 h-4 text-sky-500" />
              Your Interests
            </h3>
            <button
              onClick={() => setShowInterestForm(true)}
              className="text-[10px] text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>

          {user?.interests && user.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((int) => (
                <span
                  key={int}
                  className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[11px] text-sky-700 flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                  {int}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Add interests so VIDYATRA can recommend{" "}
              <strong>skills, projects & tasks</strong> for your free time.
            </p>
          )}
        </div>

        {/* Status / Nudges */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            Smart Nudges
          </h3>

          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>
                Use <strong>free periods</strong> for weak subjects – check
                “Smart Suggestions”.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                Keep attendance above <strong>75%</strong> to avoid being
                blocked from exams.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>
                Ask <strong>AI Mentor</strong> before you get stuck for long on
                any topic or assignment.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
