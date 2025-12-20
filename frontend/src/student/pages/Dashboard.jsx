// src/student/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceRegistrationModal from "../../components/FaceRegistrationModal";
import { API_BASE_URL } from "../../config/api";

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

import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart as RLineChart,
  Line,
  PieChart as RPieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  /* ================= SAVE INTERESTS ================= */
  const saveInterests = async () => {
    if (!selectedInterests.length) {
      alert("Select at least one interest");
      return;
    }

    try {
      setSavingInterests(true);

      await fetch(`${API_BASE_URL}/api/student/save-interests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ interests: selectedInterests }),
      });

      setUser((p) => ({ ...p, interests: selectedInterests }));
      setShowInterestForm(false);
    } catch {
      alert("Failed to save interests");
    } finally {
      setSavingInterests(false);
    }
  };

  /* ================= LOAD DASHBOARD ================= */
  useEffect(() => {
    if (!token) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [dashRes, aiRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/student/dashboard`, {
            headers: { Authorization: "Bearer " + token },
          }),
          fetch(`${API_BASE_URL}/api/student/ai-suggestions`, {
            headers: { Authorization: "Bearer " + token },
          }),
        ]);

        const dash = await dashRes.json();
        const ai = await aiRes.json();

        setUser(dash.user);
        setStats(dash.stats);
        setSuggestions(ai.suggestions || []);

        if (!dash.user.faceRegistered) setShowRegisterModal(true);
        if (!dash.user.interests?.length) setShowInterestForm(true);
        else setSelectedInterests(dash.user.interests);

        setLoading(false);
      } catch {
        setError("Failed to load dashboard");
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= DERIVED ================= */
  const attendance = stats?.attendancePercent ?? 0;
  const avgMark = stats?.avgMark ?? 0;
  const avgCgpa = stats?.avgCgpa ?? 0;

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 mt-10">{error}</p>;
  }

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white p-5 rounded-2xl shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || "Student"}
          </h1>
          <p className="text-sm text-gray-500">
            {user?.department} • {user?.className}
          </p>
        </div>

        <button
          onClick={() => navigate("/student/ai")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
        >
          <Brain size={18} /> AI Mentor
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Attendance" value={`${attendance}%`} icon={Activity} />
        <StatCard label="Average Marks" value={avgMark} icon={BookOpen} />
        <StatCard label="CGPA" value={avgCgpa} icon={CheckCircle2} />
      </div>

      {/* QUICK NAV */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickNav icon={CalendarDays} label="Timetable" onClick={() => navigate("/student/schedule")} />
        <QuickNav icon={ListTodo} label="Assignments" onClick={() => navigate("/student/assignments")} />
        <QuickNav icon={BarChart2} label="Attendance" onClick={() => navigate("/student/attendance")} />
        <QuickNav icon={Clock} label="Leave / OD" onClick={() => navigate("/student/leave")} />
      </div>

      {/* SMART SUGGESTIONS */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="font-bold mb-2">Smart Suggestions</h2>
        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-sm">You are doing great 👍</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {suggestions.slice(0, 3).map((s, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-gray-500">
                  Period {s.period} ({s.start}-{s.end})
                </p>
                <p className="font-semibold">{s.label}</p>
                <p className="text-sm text-green-700">{s.suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INTEREST MODAL */}
      {showInterestForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg relative">
            <button onClick={() => setShowInterestForm(false)} className="absolute right-4 top-4">
              <X />
            </button>

            <h2 className="text-xl font-bold mb-3">Select Interests</h2>

            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((i) => (
                <button
                  key={i}
                  onClick={() =>
                    setSelectedInterests((p) =>
                      p.includes(i) ? p.filter((x) => x !== i) : [...p, i]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedInterests.includes(i)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>

            <button
              onClick={saveInterests}
              disabled={savingInterests}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              {savingInterests ? "Saving..." : "Save Interests"}
            </button>
          </div>
        </div>
      )}

      {/* FACE REGISTRATION */}
      {showRegisterModal && (
        <FaceRegistrationModal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <Icon className="text-blue-600" />
    </div>
  );
}

function QuickNav({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow flex flex-col items-center hover:bg-blue-50"
    >
      <Icon className="text-blue-600 mb-1" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
