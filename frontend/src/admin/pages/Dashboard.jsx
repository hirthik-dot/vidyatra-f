import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  School,
  Activity,
  UserPlus,
  Trash2,
  RefreshCcwDot,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    classes: 0,
  });

  const [activities, setActivities] = useState([]);

  const token = localStorage.getItem("token");

  // ===================== LOAD DASHBOARD DATA =====================
  const loadDashboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();
      if (res.ok) {
        setStats(data.stats || { students: 0, faculty: 0, classes: 0 });
setActivities(data.activities || []);

      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <div>
        <h1 className="text-4xl font-extrabold text-blue-700">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Overview of institute activities, users, and system events.
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* STUDENTS */}
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-600" />}
          title="Total Students"
          value={stats.students}
          color="from-blue-50 to-blue-100"
        />

        {/* FACULTY */}
        <StatCard
          icon={<GraduationCap className="w-8 h-8 text-purple-600" />}
          title="Total Faculty"
          value={stats.faculty}
          color="from-purple-50 to-purple-100"
        />

        {/* CLASSES */}
        <StatCard
          icon={<School className="w-8 h-8 text-green-600" />}
          title="Total Classes"
          value={stats.classes}
          color="from-green-50 to-green-100"
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Recent System Activity
        </h2>

        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm mt-3">No recent activity.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {activities.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{a.message}</p>
                  <p className="text-xs text-gray-500">{a.time}</p>
                </div>

                {a.action === "ADD" && (
                  <UserPlus className="w-5 h-5 text-green-600" />
                )}

                {a.action === "DELETE" && (
                  <Trash2 className="w-5 h-5 text-red-600" />
                )}

                {a.action === "UPDATE" && (
                  <RefreshCcwDot className="w-5 h-5 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== STAT CARD COMPONENT ===================== */
function StatCard({ icon, title, value, color }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow hover:shadow-lg transition`}
    >
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-3xl font-extrabold text-gray-800">{value}</span>
      </div>
      <p className="text-gray-600 text-sm mt-3 font-semibold">{title}</p>
    </div>
  );
}
