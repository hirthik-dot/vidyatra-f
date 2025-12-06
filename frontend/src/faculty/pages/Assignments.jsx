import axios from "axios";
import { useState, useEffect } from "react";

/* ---------------- MODAL COMPONENT ---------------- */
function CreateAssignmentModal({ isOpen, onClose, refresh }) {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("CSE-A");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const facultyId = localStorage.getItem("facultyId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("facultyId", facultyId);
      formData.append("title", title);
      formData.append("className", className);
      formData.append("dueDate", dueDate);
      formData.append("description", description);
      formData.append("note", note);
      if (file) formData.append("file", file);

      await axios.post(
        "http://localhost:5000/api/faculty/assignments/create",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Assignment created!");
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-indigo-700">
          Create Assignment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Assignment Title"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs">Class</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="CSE-A">CSE-A</option>
                <option value="CSE-B">CSE-B</option>
                <option value="ECE-A">ECE-A</option>
                <option value="ECE-B">ECE-B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs">Due Date</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <textarea
            placeholder="Description (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <textarea
            placeholder="Note to students (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            {submitting ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */
export default function Assignments() {
  const [openModal, setOpenModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const token = localStorage.getItem("token");
  const facultyId = localStorage.getItem("facultyId");

  async function fetchAssignments() {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/faculty/assignments/all/${facultyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Assignments</h2>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-indigo-700"
        >
          + Create Assignment
        </button>
      </div>

      {/* ASSIGNMENT LIST */}
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <div key={a._id} className="p-4 bg-white rounded-xl border shadow">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm text-gray-500">{a.className}</p>
              <p className="text-xs mt-1">
                Due: <b>{new Date(a.dueDate).toLocaleDateString()}</b>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateAssignmentModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        refresh={fetchAssignments}
      />
    </div>
  );
}
