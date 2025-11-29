import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ sidebarItems, title }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Just the last part after /student/, /faculty/, /admin/
  const pathParts = location.pathname.split("/");
  const current = pathParts[pathParts.length - 1] || "dashboard";

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-cyan-50">
      {/* SIDEBAR */}
      <div
        className={`fixed z-20 inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 
            ${open ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 md:static`}
      >
        <div className="p-4 border-b">
          <h2 className="text-2xl font-extrabold text-blue-700">
            {title}
          </h2>
        </div>

        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-semibold 
                transition rounded-lg mx-2 my-1
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-100"
                }`
              }
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="flex items-center justify-between bg-white shadow-md p-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-blue-700"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>

            <h1 className="text-xl font-bold text-blue-700 capitalize">
              {current.replace("-", " ")}
            </h1>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
