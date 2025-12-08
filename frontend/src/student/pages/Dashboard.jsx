// src/student/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceRegistrationModal from "../../components/FaceRegistrationModal";

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

  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);

  // Face registration popup
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const token = localStorage.getItem("token");

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
        alert("Failed to save interests");
        return;
      }

      setUser((prev) =>
        prev ? { ...prev, interests: selectedInterests } : prev
      );
      setShowInterestForm(false);
    } catch (err) {
      alert("Something went wrong while saving interests");
    } finally {
      setSavingInterests(false);
    }
  };

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

          // 🔥 Auto-open Face Registration Modal
          if (dashData.user && dashData.user.role === "student") {
            if (!dashData.user.faceRegistered) {
              setShowRegisterModal(true);
            }
          }

          setStats(dashData.stats);

          if (
            dashData.user &&
            (!dashData.user.interests || dashData.user.interests.length === 0)
          ) {
            setShowInterestForm(true);
          } else {
            setSelectedInterests(dashData.user?.interests || []);
          }
        }

        if (aiRes.ok && aiData.suggestions) {
          setSuggestions(aiData.suggestions);
        }

        setLoading(false);
      } catch (err) {
        setError("Something went wrong loading dashboard");
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const attendance = stats?.attendancePercent ?? 0;
  const assignmentsPending = stats?.assignmentsPending ?? 0;
  const assessmentCount = stats?.assessmentCount ?? 0;

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
            <p className="font-semibold text-gray-800">Loading your dashboard…</p>
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

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-4xl font-extrabold">
          Welcome back, {user?.name || "Student"} 👋
        </h2>
        <p className="text-sm text-blue-100 mt-1">
          Dashboard summary of your classes, tasks & personalized suggestions.
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* 1️⃣ ATTENDANCE RING TILE */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Activity className="w-4 h-4 text-blue-500" />
            Attendance
          </p>

          <div className="flex justify-between mt-2 items-center">
            <div>
              <p className="text-3xl font-bold">{attendance}%</p>
              <p className="text-xs text-gray-500">{attendanceStatus}</p>
            </div>

            {/* Ring */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2 A 16 16 0 1 1 17.99 2"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                />
                <path
                  d="M18 2 A 16 16 0 1 1 17.99 2"
                  fill="none"
                  stroke={attendance >= 75 ? "#16A34A" : "#DC2626"}
                  strokeWidth="4"
                  strokeDasharray={`${attendance}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 2️⃣ ASSIGNMENTS TILE */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <ListTodo className="w-4 h-4 text-violet-600" />
            Assignments Pending
          </p>

          <p className="text-3xl font-bold text-violet-700">
            {assignmentsPending}
          </p>

          <button
            onClick={() => navigate("/student/assignments")}
            className="text-xs text-violet-700 underline"
          >
            View Assignments
          </button>
        </div>

        {/* 3️⃣ NEW ASSESSMENT TILE */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-orange-600" />
            Assessments
          </p>

          <p className="text-3xl font-bold text-orange-600">
            {assessmentCount}
          </p>

          <button
            onClick={() => navigate("/student/assessments")}
            className="text-xs text-orange-700 underline"
          >
            View Assessments
          </button>
        </div>

      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Suggestions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Smart Suggestions for You
              </h3>
              <p className="text-xs text-gray-500">
                Based on timetable, free periods & tasks.
              </p>
            </div>

            <button
              onClick={() => navigate("/student/ai")}
              className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold"
            >
              <Brain className="w-3 h-3" />
              Open AI Assistant
            </button>
          </div>

          {!suggestions || suggestions.length === 0 ? (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-green-500 inline mr-1" />
              No special suggestions right now.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {suggestions.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-sm text-gray-800 flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-cyan-700" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      Period {s.period} • {s.start} – {s.end}
                    </p>
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {s.suggestion}
                    </p>
                  </div>

                  <div className="px-2 py-1 bg-white border border-cyan-200 rounded-full text-[10px] text-cyan-700">
                    <Target className="w-3 h-3 inline -mt-0.5 mr-1" />
                    Focus
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ⭐ GAME XP PROGRESS TILE */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Gamified Learning Progress
              </h3>
              <p className="text-xs text-gray-500">
                Earn XP by playing mini games during free periods.
              </p>
            </div>

            <button
              onClick={() => navigate("/student/ai")}
              className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition"
            >
              Play Now
            </button>
          </div>

          <XPProgress />
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-500" />
            Important Announcements
          </h3>

          {!stats?.announcements || stats?.announcements.length === 0 ? (
            <p className="text-xs text-gray-500 mt-2">
              No new announcements.
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto mt-3">
              {stats.announcements.map((a, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs"
                >
                  • {a}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            <BookOpen className="w-4 h-4 text-indigo-500 inline mr-1" />
            Quick Navigation
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigate("/student/schedule")}
              className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100"
            >
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <p className="font-semibold text-indigo-700">Timetable</p>
            </button>

            <button
              onClick={() => navigate("/student/assignments")}
              className="p-3 rounded-xl bg-violet-50 hover:bg-violet-100"
            >
              <ListTodo className="w-4 h-4 text-violet-600" />
              <p className="font-semibold text-violet-700">Assignments</p>
            </button>

            <button
              onClick={() => navigate("/student/attendance")}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100"
            >
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <p className="font-semibold text-emerald-700">Attendance</p>
            </button>

            <button
              onClick={() => navigate("/student/leave")}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="font-semibold text-amber-700">Leave / OD</p>
            </button>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="w-4 h-4 text-sky-500" />
              Your Interests
            </h3>
            <button
              onClick={() => setShowInterestForm(true)}
              className="text-[10px] text-blue-600 underline"
            >
              Edit
            </button>
          </div>

          {!user?.interests?.length ? (
            <p className="text-xs text-gray-500">
              No interests selected yet.
            </p>
          ) : (
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
          )}
        </div>

        {/* Nudges */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            Smart Nudges
          </h3>

          <ul className="text-xs space-y-2 text-gray-700">
            <li>• Use free periods wisely — check Smart Suggestions.</li>
            <li>• Maintain attendance ≥ 75% to avoid exam issues.</li>
            <li>• Use AI Mentor when stuck on assignments.</li>
          </ul>
        </div>

      </div>

      {/* Interest Modal */}
      {showInterestForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <button
              onClick={() => setShowInterestForm(false)}
              className="absolute right-3 top-3"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>

            <h2 className="text-xl font-bold text-blue-700">Select Interests</h2>
            <p className="text-xs text-gray-500">
              Used to personalize your AI suggestions.
            </p>

            <div className="flex flex-wrap gap-2 mt-4 max-h-52 overflow-y-auto p-2 border rounded-xl">
              {ALL_INTERESTS.map((int) => {
                const selected = selectedInterests.includes(int);
                return (
                  <button
                    key={int}
                    onClick={() =>
                      setSelectedInterests((prev) =>
                        prev.includes(int)
                          ? prev.filter((x) => x !== int)
                          : [...prev, int]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs border ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {selected && (
                      <Star className="w-3 h-3 inline fill-yellow-300 text-yellow-300 mr-1" />
                    )}
                    {int}
                  </button>
                );
              })}
            </div>

            <button
              onClick={saveInterests}
              className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-xl"
            >
              Save Interests
            </button>
          </div>
        </div>
      )}

      {/* Face Registration Modal */}
      {showRegisterModal && (
        <FaceRegistrationModal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

    </div>
  );
}

/* ----------------------------------------------------------
   ⭐ XP PROGRESS COMPONENT (ADDED BY GPT, DO NOT REMOVE)
----------------------------------------------------------- */

function XPProgress() {
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  const rewardLadder = [
    { xp: 100, label: "Bronze Badge" },
    { xp: 200, label: "Silver Badge" },
    { xp: 300, label: "Gold Badge" },
    { xp: 500, label: "Internship Opportunity" },
  ];

  const getRewardProgress = () => {
    const next = rewardLadder.find((r) => xp < r.xp);
    if (!next) {
      return {
        text: "🎉 All rewards unlocked including Internship!",
        percent: 100,
        nextLabel: "All Rewards Unlocked",
      };
    }
    return {
      percent: Math.min(100, (xp / next.xp) * 100),
      text: `You need ${next.xp - xp} XP more to unlock ${next.label}`,
      nextLabel: next.label,
    };
  };

  const reward = getRewardProgress();

  useEffect(() => {
    const fetchXP = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/student/xp", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setXp(data.totalXP || 0);
      } catch (e) {
        console.error("XP Load Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchXP();
  }, []);

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-3 text-gray-500">
        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent animate-spin rounded-full"></div>
        Loading XP…
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Total XP */}
      <p className="text-2xl font-bold text-purple-700">{xp} XP</p>
      <p className="text-[11px] text-gray-500 mb-3">
        Total XP earned through AI mini-games.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-purple-200 h-3 rounded-full overflow-hidden mb-1">
        <div
          className="h-full bg-purple-600 transition-all duration-500"
          style={{ width: `${reward.percent}%` }}
        ></div>
      </div>

      <p className="text-[11px] text-purple-700">{reward.text}</p>
    </div>
  );
}
