import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api/communication";

export default function Communication() {
  // ✔ Fetch correct faculty ID from localStorage
  const facultyId = localStorage.getItem("facultyId");

  // Broadcast States
  const [title, setTitle] = useState("");
  const [bMessage, setBMessage] = useState("");

  // Individual Message States
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [privateMessage, setPrivateMessage] = useState("");
  const [conversation, setConversation] = useState([]);

  // ====================== LOAD STUDENTS ======================
  useEffect(() => {
    fetch("http://localhost:5000/api/student")
      .then((res) => res.json())
      .then((data) => setStudents(data.students))
      .catch(() => console.log("Error fetching students"));
  }, []);

  // ====================== SEND BROADCAST ======================
  const sendBroadcast = async () => {
    await fetch(`${API_BASE}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId,
        title,
        body: bMessage,
      }),
    });

    alert("Broadcast Sent ✔️");
    setTitle("");
    setBMessage("");
  };

  // ====================== OPEN CONVERSATION ======================
  const openConversation = async (studentId) => {
    setSelectedStudent(studentId);

    const res = await fetch(
      `${API_BASE}/private/conversation?facultyId=${facultyId}&studentId=${studentId}`
    );
    const data = await res.json();
    setConversation(data);
  };

  // ====================== SEND PRIVATE MESSAGE ======================
  const sendPrivateMessage = async () => {
    if (!selectedStudent) return alert("Select a student first");

    await fetch(`${API_BASE}/private/faculty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId,
        studentId: selectedStudent,
        body: privateMessage,
      }),
    });

    openConversation(selectedStudent);
    setPrivateMessage("");
  };

  return (
    <div className="p-6 space-y-6">

      {/* ------------------ BROADCAST SECTION ------------------ */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Broadcast Message</h2>

        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 rounded w-full mb-3"
          rows="3"
          placeholder="Message to all students"
          value={bMessage}
          onChange={(e) => setBMessage(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={sendBroadcast}
        >
          Send Broadcast
        </button>
      </div>

      {/* ------------------ PRIVATE CHAT SECTION ------------------ */}
      <div className="grid grid-cols-3 gap-4">

        {/* STUDENT LIST */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Students</h2>

          {students.map((std) => (
            <div
              key={std._id}
              onClick={() => openConversation(std._id)}
              className={`cursor-pointer p-2 rounded mb-1 ${
                selectedStudent === std._id ? "bg-blue-200" : "bg-gray-100"
              }`}
            >
              {std.name}
            </div>
          ))}
        </div>

        {/* CONVERSATION */}
        <div className="col-span-2 bg-white p-4 rounded shadow flex flex-col">
          <h2 className="font-bold text-lg mb-2">Conversation</h2>

          <div className="flex-1 bg-gray-100 p-2 rounded overflow-y-auto mb-3">
            {conversation.map((msg) => (
              <div
                key={msg._id}
                className={`p-1 ${
                  msg.from?._id === facultyId ? "text-right" : "text-left"
                }`}
              >
                <span className="inline-block bg-white px-2 py-1 rounded shadow">
                  {msg.body}
                </span>
              </div>
            ))}
          </div>

          <input
            className="border p-2 rounded w-full"
            placeholder="Type private message"
            value={privateMessage}
            onChange={(e) => setPrivateMessage(e.target.value)}
          />

          <button
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            onClick={sendPrivateMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
