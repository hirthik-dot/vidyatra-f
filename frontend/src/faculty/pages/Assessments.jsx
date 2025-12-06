import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "paragraph", label: "Paragraph" },
  { value: "short", label: "Short Answer" },
];

// -------------------------------------------------
// QUESTION CARD COMPONENT
// -------------------------------------------------
function QuestionCard({ q, index, updateQ, removeQ }) {
  const handleUpdate = (field, value) => {
    updateQ(q.id, { ...q, [field]: value });
  };

  const addOption = () => {
    handleUpdate("options", [...q.options, ""]);
  };

  const updateOption = (i, val) => {
    const arr = [...q.options];
    arr[i] = val;
    handleUpdate("options", arr);
  };

  return (
    <div className="p-5 bg-white shadow-xl rounded-2xl border mb-5 transition hover:shadow-2xl">
      <h4 className="text-sm text-gray-500 mb-1">Question {index + 1}</h4>

      {/* TEXT */}
      <input
        className="w-full border rounded-lg px-3 py-2.5 mb-3 focus:ring-2 focus:ring-indigo-400"
        placeholder="Enter Question"
        value={q.text}
        onChange={(e) => handleUpdate("text", e.target.value)}
      />

      {/* TYPE */}
      <select
        className="border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-400"
        value={q.type}
        onChange={(e) => handleUpdate("type", e.target.value)}
      >
        {QUESTION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* MARKS */}
      <input
        type="number"
        min={1}
        className="border rounded-lg px-3 py-2 mb-3 w-28 focus:ring-2 focus:ring-indigo-400"
        value={q.marks}
        onChange={(e) => handleUpdate("marks", Number(e.target.value) || 1)}
        placeholder="Marks"
      />

      {/* MCQ OPTIONS */}
      {q.type === "mcq" && (
        <div>
          <p className="font-semibold mb-1">Options</p>

          {q.options.map((opt, i) => (
            <div key={i} className="flex gap-3 items-center mb-2">
              <input
                className="border px-2 py-1 rounded-lg w-full"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
              />

              <input
                type="radio"
                name={`correct-${q.id}`}
                checked={q.correctOptionIndex === i}
                onChange={() => handleUpdate("correctOptionIndex", i)}
              />
            </div>
          ))}

          <button
            onClick={addOption}
            className="text-indigo-600 text-sm mt-2 hover:underline"
          >
            + Add Option
          </button>
        </div>
      )}

      {/* REMOVE */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => removeQ(q.id)}
          className="text-red-500 text-sm hover:underline"
        >
          Remove Question
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------
export default function Assessments() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("CSE-A");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [past, setPast] = useState([]);

  const token = localStorage.getItem("token");
  const facultyId = localStorage.getItem("facultyId");

  useEffect(() => {
    fetchPast();
  }, []);

  async function fetchPast() {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/faculty/assessments/all/${facultyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPast(res.data.assessments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        type: "mcq",
        marks: 1,
        options: [""],
        correctOptionIndex: null,
      },
    ]);
  };

  const updateQ = (id, updated) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const removeQ = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const save = async () => {
    if (!title || !className || !dueDate || questions.length === 0) {
      alert("Fill all fields and add at least one question");
      return;
    }

    const payload = {
      facultyId,
      title,
      className,
      dueDate,
      instructions,
      questions,
    };

    await axios.post(
      `http://localhost:5000/api/faculty/assessments/create`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Assessment created successfully ✔");
    fetchPast();

    setTitle("");
    setDueDate("");
    setInstructions("");
    setQuestions([]);
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-transparent bg-clip-text mb-6">
        Create Assessment
      </h1>

      {/* CREATE FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border mb-8 space-y-3">
        <input
          className="w-full border rounded-lg px-3 py-2.5"
          placeholder="Assessment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg px-3 py-2.5"
          placeholder="Instructions (optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />

        <div className="flex gap-4">
          <select
            className="border rounded-lg px-3 py-2"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            <option value="CSE-A">CSE-A</option>
            <option value="CSE-B">CSE-B</option>
            <option value="ECE-A">ECE-A</option>
            <option value="ECE-B">ECE-B</option>
          </select>

          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* QUESTIONS UI */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold">Questions</h3>

        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg"
        >
          + Add Question
        </button>
      </div>

      {questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={idx}
          updateQ={updateQ}
          removeQ={removeQ}
        />
      ))}

      {/* SAVE BTN */}
      <button
        onClick={save}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl"
      >
        Save Assessment
      </button>

      {/* -------------------- PAST ASSESSMENTS -------------------- */}
      <h2 className="text-2xl font-bold mt-10 mb-3">Previous Assessments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : past.length === 0 ? (
        <p className="text-gray-500">No assessments yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {past.map((a) => (
            <div
              key={a._id}
              className="p-5 bg-white rounded-2xl border shadow hover:shadow-2xl transition"
            >
              <h3 className="font-bold text-lg">{a.title}</h3>
              <p className="text-gray-600 text-sm">{a.className}</p>
              <p className="text-xs mt-1 text-gray-500">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </p>

              {/* VIEW SUBMISSIONS BUTTON */}
              <button
                onClick={() =>
                  navigate(`/faculty/assessments/${a._id}/submissions`)
                }
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                View Submissions
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
