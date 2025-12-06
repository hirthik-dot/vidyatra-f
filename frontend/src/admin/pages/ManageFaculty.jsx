import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, RefreshCw, Search } from "lucide-react";

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [classes, setClasses] = useState([]); // Advisor class dropdown
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
  const subjects = [
    "DSA",
    "Operating Systems",
    "DBMS",
    "Computer Networks",
    "AI",
    "Machine Learning",
    "Cybersecurity",
    "Software Engineering",
    "Maths",
    "Physics",
    "English"
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    className: "",
    subject: "",
  });

  const loadFaculty = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/faculty", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();
      if (res.ok) setFaculty(data.faculty);
    } catch (err) {
      console.error("Load faculty error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/classes", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) setClasses(data.classes);
    } catch {
      console.log("Class load error");
    }
  };

  useEffect(() => {
    loadFaculty();
    loadClasses();
  }, []);

  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      name: "",
      email: "",
      password: "",
      department: "",
      className: "",
      subject: "",     // ✅ FIXED — earlier missing
    });
    setShowModal(true);
  };

  const openEditModal = (f) => {
    setIsEdit(true);
    setForm({
      id: f._id,
      name: f.name,
      email: f.email,
      password: "",
      department: f.department,
      className: f.className || "",
      subject: f.subject || "",
    });
    setShowModal(true);
  };

  const autoPassword = () => {
    const generated = Math.random().toString(36).slice(-8);
    setForm((f) => ({ ...f, password: generated }));
  };

  const saveFaculty = async () => {
    if (!form.name || !form.email || (!isEdit && !form.password)) {
      alert("Name, email and password are required.");
      return;
    }

    if (!form.department || !form.subject) {
      alert("Department and subject are required.");
      return;
    }

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://localhost:5000/api/admin/faculty/${form.id}`
      : "http://localhost:5000/api/admin/faculty";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        loadFaculty();
      } else console.log("Save failed");
    } catch (err) {
      console.error("Save faculty error:", err);
    }
  };

  const deleteFaculty = async (id) => {
    if (!window.confirm("Delete this faculty?")) return;

    try {
      await fetch(`http://localhost:5000/api/admin/faculty/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      loadFaculty();
    } catch (err) {
      console.error("Delete faculty error:", err);
    }
  };

  const filtered = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-700">
          Faculty Maintenance
        </h2>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Faculty
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search faculty..."
          className="flex-1 outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FACULTY TABLE */}
      <div className="bg-white shadow border rounded-2xl p-4">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No faculty found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Department</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Class Advisor</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((f) => (
                  <tr key={f._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{f.name}</td>
                    <td className="p-2">{f.email}</td>
                    <td className="p-2">{f.department}</td>
                    <td className="p-2">{f.subject}</td>
                    <td className="p-2">{f.className || "-"}</td>

                    <td className="p-2 flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openEditModal(f)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteFaculty(f._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-lg rounded-2xl shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEdit ? "Edit Faculty" : "Add Faculty"}
            </h3>

            {/* FORM */}
            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />

              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  type="password"
                  placeholder={isEdit ? "New password (optional)" : "Password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                {!isEdit && (
                  <button
                    onClick={autoPassword}
                    className="bg-gray-200 hover:bg-gray-300 rounded-lg px-3 text-xs flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Auto
                  </button>
                )}
              </div>

              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={form.className}
                onChange={(e) =>
                  setForm((f) => ({ ...f, className: e.target.value }))
                }
              >
                <option value="">Advisor of (optional)</option>
                {classes.map((c) => (
                  <option key={c._id} value={c.className}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={saveFaculty}
              className="w-full bg-blue-600 text-white py-2 rounded-xl mt-4 hover:bg-blue-700"
            >
              {isEdit ? "Update Faculty" : "Add Faculty"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
