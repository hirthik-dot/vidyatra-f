import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Sparkles,
  Bot,
  User,
  BookOpen,
  Clock,
  AlertCircle,
  Brain,
  Target,
} from "lucide-react";

export default function AiAssistant() {
  const [activeTab, setActiveTab] = useState("suggestions");

  const [suggestions, setSuggestions] = useState([]);
  const [suggLoading, setSuggLoading] = useState(true);
  const [suggMessage, setSuggMessage] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey, I’m your VIDYATRA AI Mentor 👋. Ask me doubts about subjects, exams, projects, or career – I’ll keep answers short and clear.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, sending]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const loadSuggestions = async () => {
      try {
        setSuggLoading(true);
        const res = await fetch(
          "http://localhost:5000/api/student/ai-suggestions",
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
        const data = await res.json();

        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setSuggMessage("");
        } else {
          setSuggestions([]);
          setSuggMessage(
            data.message || "No smart suggestions available for now."
          );
        }
      } catch (err) {
        console.error(err);
        setSuggMessage("Unable to load suggestions.");
      } finally {
        setSuggLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/chatbot",
        { messages: newMessages }
      );

      const aiText =
        res.data?.answer || "I couldn’t generate a proper reply. Try again.";

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiText },
      ]);
    } catch (err) {
      console.error("AI mentor error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I’m facing a connection issue. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    setActiveTab("mentor");
  };

  const renderDifficultyBadge = (difficulty = "medium") => {
    const map = {
      easy: { text: "Easy Focus", class: "bg-green-100 text-green-700" },
      medium: { text: "Moderate", class: "bg-yellow-100 text-yellow-700" },
      hard: { text: "High Priority", class: "bg-red-100 text-red-700" },
    };
    const d = map[difficulty] || map.medium;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${d.class}`}
      >
        <Target className="w-3 h-3" />
        {d.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
            <Brain className="w-8 h-8 text-indigo-500" />
            AI Learning Hub
          </h2>
          <p className="text-gray-600 text-sm">
            Smart free-period planner + personal AI mentor in one place.
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-full bg-gray-100 p-1">
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 ${
            activeTab === "suggestions"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("suggestions")}
        >
          <Sparkles className="w-4 h-4" />
          Smart Suggestions
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 ${
            activeTab === "mentor"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("mentor")}
        >
          <Bot className="w-4 h-4" />
          Ask AI Mentor
        </button>
      </div>

      {activeTab === "suggestions" ? (
        <SmartSuggestionsView
          suggestions={suggestions}
          suggLoading={suggLoading}
          suggMessage={suggMessage}
          renderDifficultyBadge={renderDifficultyBadge}
          onAskAi={(text) =>
            handleQuickPrompt(`I have a free period. ${text} Please guide me.`)
          }
        />
      ) : (
        <AiMentorChatView
          chatMessages={chatMessages}
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          sending={sending}
          chatEndRef={chatEndRef}
        />
      )}
    </div>
  );
}

/* ======================= SMART SUGGESTIONS TAB ======================= */

function SmartSuggestionsView({
  suggestions,
  suggLoading,
  suggMessage,
  renderDifficultyBadge,
  onAskAi,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-5 shadow-xl">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Smart Free-Period Planner
          </h3>
          <p className="mt-2 text-sm text-blue-100">
            Based on your today’s timetable, we detect free periods and give you
            focused activities.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow border border-gray-100">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            How this works
          </h4>
          <p className="text-xs text-gray-600">
            When a teacher is absent or a period is free, our engine converts it
            into a productive slot.
          </p>
        </div>
      </div>

      <div className="lg:col-span-2">
        {suggLoading && (
          <div className="flex items-center gap-3 text-gray-600 bg-white rounded-2xl p-4 shadow">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-sm font-medium">
              Analysing today’s timetable…
            </span>
          </div>
        )}

        {!suggLoading && suggMessage && (
          <p className="text-gray-600 text-sm bg-white p-4 rounded-2xl shadow">
            {suggMessage}
          </p>
        )}

        {!suggLoading && suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow border border-gray-100 p-4 hover:shadow-lg transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Period {s.period} • {s.start} - {s.end}
                      </p>
                      <p className="font-semibold text-gray-900">{s.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderDifficultyBadge(s.difficulty)}
                  </div>
                </div>

                <p className="mt-3 text-sm text-green-700 font-medium">
                  {s.suggestion}
                </p>

                {/* BUTTON AREA */}
                <div className="mt-3 flex flex-wrap gap-2 justify-between">
                  <button
                    onClick={() =>
                      onAskAi(
                        `I have a free period (${s.start}-${s.end}). ${s.suggestion}`
                      )
                    }
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Bot className="w-3 h-3" />
                    Ask AI Mentor
                  </button>

                  {/* PERSONAL INTEREST BUTTON */}
                  {(() => {
                    const interests = [
                      "Web Development",
                      "Ethical Hacking",
                      "Cybersecurity",
                      "AI",
                      "Machine Learning",
                      "Data Science",
                      "App Development",
                      "Cloud",
                      "Networks",
                      "Software",
                      "Competitive Programming",
                    ];

                    const isPersonal = interests.some((int) =>
                      s.suggestion
                        ?.toLowerCase()
                        .includes(int.toLowerCase())
                    );

                    return (
                      isPersonal && (
                        <button
                          onClick={() =>
                            (window.location.href =
                              "/student/study-material")
                          }
                          className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <BookOpen className="w-3 h-3" />
                          Get Study Material
                        </button>
                      )
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================= AI MENTOR CHAT TAB ======================= */

function AiMentorChatView({
  chatMessages,
  input,
  setInput,
  sendMessage,
  sending,
  chatEndRef,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow p-5 border border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">VIDYATRA AI Mentor</p>
            <p className="text-xs text-gray-500">
              Subject doubts • Exam prep • Projects • Career
            </p>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <p>• Asks follow-up questions if needed</p>
          <p>• Explains like a friendly senior, not a textbook</p>
          <p>• Can generate plans, summaries, checklists</p>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-blue-50 text-xs text-blue-800 flex gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <p>
            Try to ask one clear question at a time for best answers.
          </p>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white rounded-2xl">
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-2xl text-xs flex items-center gap-2 shadow">
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150" />
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-300" />
                </span>
                <span>AI is thinking…</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="border-t p-3 flex items-center gap-2 bg-white rounded-b-2xl">
          <textarea
            rows={1}
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Ask your doubt here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 ${
              sending || !input.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <User className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
