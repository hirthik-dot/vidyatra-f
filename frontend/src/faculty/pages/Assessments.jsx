import axios from "axios";
import { useState } from "react";

/* ---------------- CREATE ASSESSMENT FORM ---------------- */
function CreateAssessment() {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("CSE-A");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const facultyId = localStorage.getItem("facultyId");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/faculty/assessments/create",
        { facultyId, title, className, dueDate }
      );

      alert("Assessment created!");
      setTitle("");
      setDueDate("");
    } catch (err) {
      console.error(err);
      alert("Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-3">
      <input
        className="w-full border rounded-lg p-2"
        placeholder="Test Title"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? "Creating..." : "Create Assessment"}
      </button>
    </form>
  );
}

/* ---------------- ASSESSMENTS PAGE ---------------- */
function Assessments() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assessments</h1>

      {/* Form */}
      <CreateAssessment />
    </div>
  );
}

export default Assessments;
