import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api/communication";

export default function Communication() {
  // STUDENT TWO
 const user = JSON.parse(localStorage.getItem("user") || "{}");
const studentId = user._id || user.id || null;



  const [activeTab, setActiveTab] = useState("private");
  const [broadcasts, setBroadcasts] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [replyText, setReplyText] = useState("");

  // 1) Load broadcasts
  useEffect(() => {
    fetch(`${API_BASE}/broadcast/student`)
      .then((res) => res.json())
      .then((data) => setBroadcasts(data))
      .catch((err) => console.error("Broadcast error:", err));
  }, []);

  // 2) Load messages initially to build faculty list
  useEffect(() => {
    fetch(`${API_BASE}/private/student/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        const facMap = {};
        data.forEach((msg) => {
          const other = msg.from._id === studentId ? msg.to : msg.from;
          if (other.role === "faculty") facMap[other._id] = other;
        });
        setFacultyList(Object.values(facMap));
      })
      .catch((err) => console.error("Private list error:", err));
  }, [studentId]);

  // 3) When faculty clicked → load conversation
  const openConversation = async (facultyId) => {
    console.log("CLICKED FACULTY:", facultyId);
    setSelectedFaculty(facultyId);

    try {
      const res = await fetch(
        `${API_BASE}/private/conversation?facultyId=${facultyId}&studentId=${studentId}`
      );
      const data = await res.json();
      console.log("CONVERSATION RESPONSE:", data);
      setConversation(data);
    } catch (err) {
      console.error("Conversation error:", err);
    }
  };

  // 4) Sending reply
  const sendReply = async () => {
    if (!selectedFaculty) return;
    if (!replyText.trim()) return;

    try {
      await fetch(`${API_BASE}/private/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          facultyId: selectedFaculty,
          body: replyText,
        }),
      });

      setReplyText("");
      openConversation(selectedFaculty);
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-blue-700">Communication</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "broadcast"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("broadcast")}
        >
          Broadcast
        </button>

        <button
          className={`px-4 py-2 rounded ${
            activeTab === "private"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("private")}
        >
          Private
        </button>
      </div>

      {/* ----------------- BROADCAST VIEW ----------------- */}
      {activeTab === "broadcast" && (
        <div className="bg-white p-4 rounded shadow space-y-2">
          {broadcasts.length === 0 ? (
            <p>No broadcasts yet</p>
          ) : (
            broadcasts.map((b) => (
              <div key={b._id} className="border rounded p-3">
                <h3 className="font-bold">{b.title}</h3>
                <p>{b.body}</p>
                <small className="text-gray-500">
                  From: {b.faculty?.name ?? "Faculty"}
                </small>
              </div>
            ))
          )}
        </div>
      )}

      {/* ----------------- PRIVATE VIEW ----------------- */}
      {activeTab === "private" && (
        <div className="grid grid-cols-3 gap-4">
          {/* Faculty List */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Faculty</h3>

            {facultyList.length === 0 && (
              <p className="text-gray-500 text-sm">No messages yet</p>
            )}

            {facultyList.map((f) => (
              <button
                key={f._id}
                className={`w-full text-left p-2 rounded mb-1 ${
                  selectedFaculty === f._id
                    ? "bg-blue-200"
                    : "bg-gray-100"
                }`}
                onClick={() => openConversation(f._id)}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Conversation & Reply */}
          <div className="col-span-2 bg-white p-4 rounded shadow flex flex-col">
            <h3 className="font-semibold mb-2">Conversation</h3>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-2 rounded">
              {/* No faculty selected */}
              {!selectedFaculty && (
                <p className="text-sm text-gray-500">
                  Select a faculty to view messages
                </p>
              )}

              {/* Faculty selected but no messages */}
              {selectedFaculty && conversation.length === 0 && (
                <p className="text-sm text-gray-500">
                  No messages with this faculty yet
                </p>
              )}

              {/* Messages show */}
              {conversation.length > 0 &&
                conversation.map((msg) => (
                  <div
                    key={msg._id}
                    className={`mb-1 ${
                      msg.from._id === studentId
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    <span className="bg-white px-2 py-1 rounded shadow">
                      {msg.body}
                    </span>
                  </div>
                ))}
            </div>

            {/* Reply Input */}
            {selectedFaculty && (
              <div className="mt-2 flex">
                <input
                  className="flex-1 border p-2 rounded"
                  placeholder="Type reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
                  onClick={sendReply}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
