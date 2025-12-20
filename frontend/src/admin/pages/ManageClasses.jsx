import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/classes`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setClasses(data.classes || []);
        } else {
          console.error("Failed to load classes:", data);
        }
      } catch (err) {
        console.error("Class load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [token]);

  const toggleExpand = (className) => {
    setExpanded((prev) => (prev === className ? null : className));
  };

  const filtered = classes.filter((c) =>
    c.className?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-500" />
            Class Overview
          </h2>
          <p className="text-gray-600 text-sm">
            Live view of all classes, student strength & composition.
          </p>
        </div>
      </div>

      {/* SEARCH & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 bg-white p-3 rounded-xl border shadow-sm max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search class (e.g., CSE-A)"
              className="flex-1 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase">Total Classes</p>
            <p className="text-2xl font-bold text-blue-700">
              {classes.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Total Students</p>
            <p className="text-2xl font-bold text-indigo-600">
              {classes.reduce((acc, c) => acc + (c.strength || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* CLASS LIST */}
      <div className="bg-white p-4 rounded-2xl shadow border">
        {loading ? (
          <p className="text-center py-6 text-gray-500">
            Loading classes…
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            No classes found.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="border rounded-2xl p-3 hover:bg-slate-50 transition"
              >
                {/* Header */}
                <button
                  onClick={() => toggleExpand(c.className)}
                  className="w-full flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        {c.className}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.strength} student
                        {c.strength !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      View students
                    </span>
                    {expanded === c.className ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Expanded */}
                {expanded === c.className && (
                  <div className="mt-3 border-t pt-3 max-h-64 overflow-y-auto">
                    {c.students?.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No students in this class yet.
                      </p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50 text-left">
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Dept</th>
                            <th className="p-2">Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.students?.map((s) => (
                            <tr
                              key={s._id}
                              className="border-b last:border-0 hover:bg-white"
                            >
                              <td className="p-2">{s.name}</td>
                              <td className="p-2 text-gray-600">
                                {s.email}
                              </td>
                              <td className="p-2 text-gray-600">
                                {s.department || "-"}
                              </td>
                              <td className="p-2 text-gray-600">
                                {s.year || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
