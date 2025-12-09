import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Brain,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import LearningPathPlayer from "../../components/games/LearningPathPlayer";

/* ======================= GAME DEFINITIONS ======================= */

const ALL_GAMES = [
  { id: "sdlc", name: "SDLC Order Game", level: 1, xp: 20, concept: "Software Development Life Cycle" },
  { id: "usecase", name: "Use-Case Match", level: 1, xp: 20, concept: "Use Cases & Actors" },
  { id: "mcq_quiz", name: "Quick MCQ Quiz", level: 1, xp: 20, concept: "Basic Software Engineering" },

  { id: "bug", name: "Bug Hunter", level: 2, xp: 30, concept: "Debugging / Testing" },
  { id: "logic_flow", name: "Logic Flowchart Game", level: 2, xp: 30, concept: "Control Flow & Logic" },
  { id: "network_fix", name: "Network Fix", level: 2, xp: 30, concept: "Basic Networks" },

  { id: "api_debug", name: "API Debug", level: 3, xp: 40, concept: "REST API & HTTP" },
  { id: "db_query", name: "Database Query Fix", level: 3, xp: 40, concept: "Database / MongoDB" },
  { id: "cyber_spot", name: "Cybersecurity Flaw Spot", level: 3, xp: 40, concept: "Security & Best Practices" },
];

/* ======================= HELPERS ======================= */

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ======================= MAIN FILE ======================= */

export default function AiAssistant() {
  const [activeTab, setActiveTab] = useState("suggestions");

  const [isFreePeriod, setIsFreePeriod] = useState(false);
  const [freeLoading, setFreeLoading] = useState(true);

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey, I’m your VIDYATRA AI Mentor 👋. Ask me doubts about subjects, exams, projects, or career!",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  /* ======================= Auto-Scroll Chat ======================= */

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, sending]);

  /* ======================= FREE PERIOD CHECK ======================= */

  useEffect(() => {
    const checkFreePeriod = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/student/ai-suggestions",
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
        const data = await res.json();
        setIsFreePeriod(data.suggestions?.length > 0);
      } catch {
        setIsFreePeriod(false);
      } finally {
        setFreeLoading(false);
      }
    };
    checkFreePeriod();
  }, []);

  /* ======================= Chat Send ======================= */

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg = { role: "user", content: input.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/chatbot",
        { messages: [...chatMessages, userMsg] }
      );

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data?.answer || "Try again." },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection issue." },
      ]);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
            <Brain className="w-8 h-8 text-indigo-500" />
            AI Learning Hub
          </h2>
          <p className="text-gray-600 text-sm">
            Gamified Learning + XP + AI Mentor
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="inline-flex rounded-full bg-gray-100 p-1">
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full ${
            activeTab === "suggestions"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("suggestions")}
        >
          <Sparkles className="w-4 h-4" /> Play Games & Earn XP
        </button>

        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full ${
            activeTab === "mentor"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("mentor")}
        >
          <Bot className="w-4 h-4" /> Ask AI Mentor
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "suggestions" ? (
        <GamesView isFreePeriod={isFreePeriod} freeLoading={freeLoading} />
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

/* ================================================================
   🎮 GAMES VIEW — XP, GAME LIST, AI LEARNING PATH LOADER
================================================================ */

function GamesView({ isFreePeriod, freeLoading }) {
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [games, setGames] = useState([]);

  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [questionData, setQuestionData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setGames(shuffleArray(ALL_GAMES));

    axios
      .get("http://localhost:5000/api/student/xp", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setXp(res.data.totalXP || 0);
        setCompleted(res.data.completedGames || []);
      })
      .catch(() => {});
  }, []);

  const levels = [1, 2, 3];

  const rewardLadder = [
    { xp: 100, label: "Bronze Badge" },
    { xp: 200, label: "Silver Badge" },
    { xp: 300, label: "Gold Badge" },
    { xp: 500, label: "Internship Opportunity" },
  ];

  const reward = (() => {
    const next = rewardLadder.find((r) => xp < r.xp);
    if (!next) return { text: "🎉 All rewards unlocked!", percent: 100 };

    return {
      text: `⭐ ${next.xp - xp} XP left for ${next.label}`,
      percent: (xp / next.xp) * 100,
    };
  })();

  const handleSelectGame = async (game) => {
    if (!isFreePeriod) return;

    setActiveGame(game);
    setLoadingQuestion(true);
    setQuestionData(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/games/generate-question",
        { gameId: game.id },
        { headers: { Authorization: "Bearer " + token } }
      );

      setQuestionData(res.data);
    } catch {
      setQuestionData({
        error: true,
        fallback: true,
        description: "AI could not generate learning path.",
      });
    }

    setLoadingQuestion(false);
  };

  const awardXpIfNeeded = async () => {
    if (!activeGame) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/student/gain-xp",
        { gameId: activeGame.id },
        { headers: { Authorization: "Bearer " + token } }
      );

      if (!res.data.alreadyCompleted)
        alert(`🎉 Earned ${res.data.awardedXP} XP!`);

      setXp(res.data.newTotalXP);
      setCompleted(res.data.completedGames || []);
    } catch {
      // ignore
    }
  };

  /* ======================= FREE PERIOD LOCK ======================= */

  if (freeLoading)
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-3 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Checking free periods…</span>
      </div>
    );

  if (!isFreePeriod)
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center border border-dashed">
        <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Mini Games Locked
        </h2>
        <p className="text-sm text-gray-600">
          Games unlock automatically during free periods.
        </p>
      </div>
    );

  /* ======================= MAIN GAME UI ======================= */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel */}
      <div className="bg-white rounded-2xl shadow p-5 border space-y-4">
        <h3 className="font-bold text-gray-900">🎮 AI Learning Missions</h3>
        <p className="text-xs text-gray-500">
          AI generates interactive learning missions customized for your interests.
        </p>

        {levels.map((level) => (
          <div key={level}>
            <p className="mt-3 text-sm font-semibold">Level {level}</p>
            {games
              .filter((g) => g.level === level)
              .map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGame(g)}
                  className={`w-full text-left p-3 rounded-xl flex justify-between items-center text-sm border mt-2 ${
                    activeGame?.id === g.id
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-gray-50 hover:bg-white border-gray-200"
                  }`}
                >
                  <div>
                    <p className="font-medium">{g.name}</p>
                    <p className="text-[11px] opacity-70">{g.concept}</p>
                  </div>

                  {completed.includes(g.id) && (
                    <span className="text-green-500 flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  )}
                </button>
              ))}
          </div>
        ))}

        <div className="mt-4 p-3 bg-yellow-100 rounded-xl text-sm text-yellow-800">
          ⭐ Total XP: {xp}
        </div>

        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="font-bold text-purple-800 text-sm">🎯 Rewards</p>
          <div className="w-full bg-purple-200 h-2 rounded-full mt-1">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${reward.percent}%` }}
            />
          </div>
          <p className="text-xs text-purple-700 mt-1">{reward.text}</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5 border">
        {!activeGame && (
          <p className="text-gray-600 text-sm">
            Select a mission from the left to start your AI-generated learning path.
          </p>
        )}

        {activeGame && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">{activeGame.name}</h2>
              <p className="text-xs text-gray-500">
                Concept: {activeGame.concept}
              </p>
            </div>

            {loadingQuestion ? (
              <div className="flex gap-3 bg-gray-50 p-4 rounded-xl">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="text-sm">Generating learning mission…</span>
              </div>
            ) : questionData?.error ? (
              <div className="bg-yellow-50 p-4 rounded-xl border">
                <p className="text-yellow-800 text-sm">
                  AI could not generate mission.
                </p>
              </div>
            ) : questionData ? (
              <LearningPathPlayer
                path={questionData}
                onComplete={awardXpIfNeeded}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================= CHAT TAB ======================= */

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
      {/* Info card */}
      <div className="bg-white rounded-2xl shadow p-5 border space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">VIDYATRA AI Mentor</p>
            <p className="text-xs text-gray-500">
              Doubts • Exams • Projects • Career
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          • Smart explanations<br />
          • Friendly senior tone<br />
          • Quick answers
        </p>
        <div className="mt-2 p-2 rounded-xl bg-blue-50 text-[11px] text-blue-800 flex gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>Ask one clear question at a time for best results.</span>
        </div>
      </div>

      {/* Chat box */}
      <div className="bg-white rounded-2xl shadow border lg:col-span-2 flex flex-col h-[60vh]">
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50 to-white">
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-2xl bg-gray-100 text-xs flex items-center gap-2 shadow">
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150" />
                  <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-300" />
                </span>
                AI is thinking…
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
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
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
