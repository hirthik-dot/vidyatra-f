import { useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("student"); 
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
      const res = await fetch("http://localhost:5000/api/auth/login", {
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

      // Save token + user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      // ⭐ REQUIRED FIX — STORE facultyId for Profile page ⭐
      if (data.user.role === "faculty") {
        localStorage.setItem("facultyId", data.user.id);
      }

      // Redirect based on REAL role from backend
      if (data.user.role === "student") navigate("/student/dashboard");
      else if (data.user.role === "faculty") navigate("/faculty/dashboard");
      else if (data.user.role === "admin") navigate("/admin/dashboard");
      else navigate("/login");

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <h1 className="text-4xl font-extrabold text-blue-700 text-center">
          VIDYATRA LOGIN
        </h1>

        <div className="grid grid-cols-3 gap-3">
          {["student", "faculty", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`p-2 rounded-lg font-semibold capitalize ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email ID"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-60"
          >
            <LogIn className="inline-block w-5 h-5 mr-2" />
            {loading ? "Logging in..." : `Login as ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
}
