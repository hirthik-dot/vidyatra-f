// src/admin/pages/ManageStudents.jsx
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, RefreshCw, Search } from "lucide-react";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];
  const years = [1, 2, 3, 4];
  const classOptions = [
    "CSE-A",
    "CSE-B",
    "CSE-C",
    "ECE-A",
    "EEE-A",
    "MECH-A",
  ]; // you can customize

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    year: "",
    className: "",
  });

  const loadStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/students", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) setStudents(data.students || []);
    } catch (err) {
      console.error("Load students error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      name: "",
      email: "",
      password: "",
      department: "",
      year: "",
      className: "",
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setIsEdit(true);
    setForm({
      id: s._id,
      name: s.name,
      email: s.email,
      password: "",
      department: s.department || "",
      year: s.year || "",
      className: s.className || "",
    });
    setShowModal(true);
  };

  const autoPassword = () => {
    const generated = Math.random().toString(36).slice(-8);
    setForm((f) => ({ ...f, password: generated }));
  };

  const saveStudent = async () => {
    if (!form.name || !form.email || (!isEdit && !form.password)) {
      alert("Name, email and password are required.");
      return;
    }

    if (!form.department || !form.year || !form.className) {
      alert("Department, year and class are required.");
      return;
    }

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://localhost:5000/api/admin/students/${form.id}`
      : "http://localhost:5000/api/admin/students";

    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        loadStudents();
      } else {
        console.log("Save student failed");
      }
    } catch (err) {
      console.error("Save student error:", err);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await fetch(`http://localhost:5000/api/admin/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      loadStudents();
    } catch (err) {
      console.error("Delete student error:", err);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.className || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-700">
          Students Maintenance
        </h2>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email or class…"
          className="flex-1 outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white shadow border rounded-2xl p-4">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Department</th>
                  <th className="p-2">Year</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.department || "-"}</td>
                    <td className="p-2">{s.year || "-"}</td>
                    <td className="p-2">{s.className || "-"}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openEditModal(s)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteStudent(s._id)}
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
          <div className="bg-white p-6 w-full max-w-lg rounded-2xl shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="text-xl font-bold mb-4 text-blue-700">
              {isEdit ? "Edit Student" : "Add Student"}
            </h3>

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

              {/* PASSWORD + AUTO */}
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

              {/* DEPARTMENT */}
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

              {/* YEAR */}
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
              >
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>

              {/* CLASS NAME */}
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={form.className}
                onChange={(e) =>
                  setForm((f) => ({ ...f, className: e.target.value }))
                }
              >
                <option value="">Select Class</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={saveStudent}
              className="w-full bg-blue-600 text-white py-2 rounded-xl mt-4 hover:bg-blue-700"
            >
              {isEdit ? "Update Student" : "Add Student"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
