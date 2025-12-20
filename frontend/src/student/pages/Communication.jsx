import { useEffect, useState } from "react";
import {
  UserCircle2,
  Search,
  Filter,
  ThumbsUp,
  Heart,
  Flame,
  Laugh,
  Send,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

import { API_BASE_URL } from "../../config/api";

const API_BASE = `${API_BASE_URL}/api/communication`;

export default function Communication() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user._id || user.id || null;
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("broadcast");

  /* ================= BROADCAST ================= */
  const [broadcasts, setBroadcasts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  /* ================= PRIVATE ================= */
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [replyText, setReplyText] = useState("");

  /* ================= UI REACTIONS ================= */
  const [reactions, setReactions] = useState({});

  /* ================= LOAD BROADCASTS ================= */
  useEffect(() => {
    fetch(`${API_BASE}/broadcast/student`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setBroadcasts(data || []))
      .catch((err) => console.error("Broadcast error:", err));
  }, [token]);

  /* ================= LOAD FACULTY LIST ================= */
  useEffect(() => {
    if (!studentId) return;

    fetch(`${API_BASE}/private/student/${studentId}`, {
      headers: { Authorization: "Bearer " + token },
    })
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
  }, [studentId, token]);

  /* ================= OPEN CONVERSATION ================= */
  const openConversation = async (facultyId) => {
    setSelectedFaculty(facultyId);

    try {
      const res = await fetch(
        `${API_BASE}/private/conversation?facultyId=${facultyId}&studentId=${studentId}`,
        { headers: { Authorization: "Bearer " + token } }
      );
      const data = await res.json();
      setConversation(data || []);
    } catch (err) {
      console.error("Conversation error:", err);
    }
  };

  /* ================= SEND REPLY ================= */
  const sendReply = async () => {
    if (!replyText.trim()) return;

    try {
      await fetch(`${API_BASE}/private/student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
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

  /* ================= UI REACTION (LOCAL) ================= */
  const addReaction = (id, emoji) => {
    setReactions((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [emoji]: (prev[id]?.[emoji] || 0) + 1,
      },
    }));
  };

  /* ================= FILTER ================= */
  const filteredBroadcasts = broadcasts.filter((b) => {
    const text =
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.body?.toLowerCase().includes(search.toLowerCase());

    if (selectedFilter === "all") return text;

    return b.faculty?.name
      ?.toLowerCase()
      .includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Communication</h2>

      {/* TABS */}
      <div className="flex gap-3">
        {["broadcast", "private"].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-full font-semibold ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "broadcast" ? "Announcements" : "Messages"}
          </button>
        ))}
      </div>

      {/* ================= BROADCAST ================= */}
      {activeTab === "broadcast" && (
        <div className="bg-white p-6 rounded-3xl shadow-xl space-y-6">
          {/* Search & Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-full sm:w-1/2">
              <Search className="mr-2" />
              <input
                placeholder="Search announcements..."
                className="bg-transparent w-full outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-full sm:w-1/3">
              <Filter className="mr-2" />
              <select
                className="bg-transparent w-full outline-none"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Faculty</option>
                {broadcasts.map((b) => (
                  <option key={b._id} value={b.faculty?.name}>
                    {b.faculty?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Broadcast Cards */}
          {filteredBroadcasts.map((b) => (
            <div
              key={b._id}
              className="p-6 border rounded-2xl bg-blue-50 shadow"
            >
              <div className="flex gap-4 mb-2">
                <UserCircle2 className="text-blue-600" size={36} />
                <div>
                  <p className="font-bold">{b.faculty?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(b.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-lg">{b.title}</h3>
              <p className="text-gray-700">{b.body}</p>

              <div className="flex gap-4 mt-3">
                {[ThumbsUp, Heart, Flame, Laugh].map((Icon, i) => (
                  <button
                    key={i}
                    onClick={() => addReaction(b._id, i)}
                    className="flex gap-1 text-gray-600"
                  >
                    <Icon size={18} />
                    {reactions[b._id]?.[i] || 0}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= PRIVATE CHAT ================= */}
      {activeTab === "private" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow">
            <h3 className="font-bold mb-3 flex gap-2">
              <MessageSquare /> Faculty
            </h3>

            {facultyList.map((f) => (
              <button
                key={f._id}
                onClick={() => openConversation(f._id)}
                className={`w-full p-3 rounded-xl mb-2 ${
                  selectedFaculty === f._id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className="col-span-2 bg-white p-4 rounded-2xl shadow flex flex-col">
            <div className="flex gap-2 items-center mb-2">
              {selectedFaculty && (
                <button onClick={() => setSelectedFaculty(null)}>
                  <ArrowLeft />
                </button>
              )}
              <h3 className="font-semibold text-lg">
                {facultyList.find((f) => f._id === selectedFaculty)?.name ||
                  "Select a faculty"}
              </h3>
            </div>

            <div className="flex-1 bg-gray-50 p-4 rounded-xl overflow-y-auto">
              {conversation.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-2 ${
                    msg.from._id === studentId ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-xl ${
                      msg.from._id === studentId
                        ? "bg-blue-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    {msg.body}
                  </span>
                </div>
              ))}
            </div>

            {selectedFaculty && (
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 border p-3 rounded-xl"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type message..."
                />
                <button
                  onClick={sendReply}
                  className="bg-blue-600 text-white px-4 rounded-xl flex gap-1"
                >
                  <Send size={16} /> Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
