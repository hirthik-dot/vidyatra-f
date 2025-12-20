import { useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save auth details
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
    <div className="min-h-screen flex items-center justify-center bg-cyan-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1">
          <img
            src="/PUNJAB.jpg"
            alt="Government of Punjab Logo"
            className="w-20 h-20 object-contain mx-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/80x80/f97316/ffffff?text=LOGO";
            }}
          />
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-wider pt-2">
            VIDYATRA
          </h1>
          <p className="text-lg font-medium text-gray-600">
            Smart Education Management System
          </p>
          <p className="text-base font-bold text-orange-600 pb-4">
            GOVERNMENT OF PUNJAB
          </p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="grid grid-cols-3 gap-3">
          {["student", "faculty", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`p-2 rounded-lg font-semibold capitalize transition ${
                role === r
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Email ID
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-inner"
              placeholder={`Enter your ${role} email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-inner"
              placeholder="Enter your password"
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
            className="w-full flex justify-center items-center px-4 py-3 rounded-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg disabled:opacity-60"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {loading
              ? "Logging in..."
              : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
