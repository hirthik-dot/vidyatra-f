import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        // Fetch dashboard data + AI suggestions in parallel
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

  if (loading) {
    return <p className="text-gray-600">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-blue-700">
          Welcome back, {user?.name || "Student"}
        </h2>
        <p className="text-gray-600 mt-1">
          Here’s a quick overview of your day and smart suggestions for you.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Attendance</p>
          <h3 className="text-3xl font-bold text-blue-700">
            {stats?.attendancePercent ?? 0}%
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Target: 75% minimum
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Assignments Pending</p>
          <h3 className="text-3xl font-bold text-blue-700">
            {stats?.assignmentsPending ?? 0}
          </h3>
        </div>

        <div className="p-6 bg-white rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Upcoming Exams</p>
          <h3 className="text-3xl font-bold text-blue-700">
            {stats?.upcomingExams ?? 0}
          </h3>
        </div>
      </div>

      {/* AI Suggestions + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Suggestions */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            AI Suggestions for You
          </h3>
          {(!suggestions || suggestions.length === 0) && (
            <p className="text-gray-500 text-sm">
              No special suggestions right now. Keep up the good work!
            </p>
          )}

          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="p-3 rounded-lg bg-cyan-50 border border-cyan-100 text-sm text-gray-800"
              >
                • {s}
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-400 mt-4">
            These suggestions are based on your attendance, assignments, exams
            and today&apos;s free periods.
          </p>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            Important Announcements
          </h3>

          {stats?.announcements && stats.announcements.length > 0 ? (
            <ul className="space-y-3">
              {stats.announcements.map((a, i) => (
                <li
                  key={i}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                >
                  • {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">
              No announcements at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
