import axios from "axios";
import { useState } from "react";

/* ---------------- MODAL COMPONENT ---------------- */
function CreateAssignmentModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("CSE-A");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Assignment created!");
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
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold mb-2">Create New Assignment</h2>

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="w-full border rounded-lg p-2"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        >
          <option value="CSE-A">CSE-A</option>
        </select>

        <input
          type="date"
          className="w-full border rounded-lg p-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg p-2"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded-lg mt-2"
        >
          {submitting ? "Submitting..." : "Submit Assignment"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- MAIN ASSIGNMENTS PAGE ---------------- */
function Assignments() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Assignments</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Assignment
        </button>
      </div>

      {/* Modal */}
      <CreateAssignmentModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}

export default Assignments;
