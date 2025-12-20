import { useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import punjabLogo from "./../assets/punjab-logo.png";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const [role, setRole] = useState("faculty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save auth info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      const realId = data.user._id || data.user.id;

      // Redirect by role
      if (data.user.role === "student") {
        localStorage.setItem("studentId", realId);
        navigate("/student/dashboard");
      } else if (data.user.role === "faculty") {
        localStorage.setItem("facultyId", realId);
        navigate("/faculty/dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        setError("Unknown user role");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-50 via-indigo-100 to-cyan-50 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -top-20 -left-32 animate-pulse" />
      <div className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" />

      <div className="relative w-full max-w-md backdrop-blur-2xl bg-white/80 border border-white/40 rounded-3xl shadow-2xl p-10 space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400 via-yellow-300 to-transparent blur-md animate-pulse"></div>
            <img
              src={punjabLogo}
              alt="Punjab Govt Logo"
              className="relative w-24 h-24 object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold text-center text-blue-800">
          VIDYATRA
        </h1>

        <p className="text-center text-gray-700 text-sm -mt-2">
          Smart Education Management System
        </p>

        <p className="text-center text-orange-600 font-semibold text-sm">
          Government of Punjab
        </p>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {["faculty", "student", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 rounded-lg font-semibold capitalize transition-all ${
                role === r
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              {role === "faculty"
                ? "Faculty Email"
                : role === "student"
                ? "Student Email"
                : "Admin Email"}
            </label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow-md disabled:opacity-60"
          >
            <LogIn className="inline-block w-5 h-5 mr-2" />
            {loading ? "Logging in..." : `Login as ${role}`}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          © 2025 Govt. of Punjab | Crafted by Honesters
        </p>
      </div>
    </div>
  );
}
