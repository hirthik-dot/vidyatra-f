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
import { API_BASE_URL } from "../../config/api";

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

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/* ======================= MAIN COMPONENT ======================= */

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

  /* Auto-scroll */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sending]);

  /* Free period check */
  useEffect(() => {
    const checkFreePeriod = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/student/ai-suggestions`,
          { headers: { Authorization: "Bearer " + token } }
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

  /* Send chat */
  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg = { role: "user", content: input.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/student/chatbot`,
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
      <div>
        <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
          <Brain className="w-8 h-8 text-indigo-500" />
          AI Learning Hub
        </h2>
        <p className="text-gray-600 text-sm">
          Gamified Learning + XP + AI Mentor
        </p>
      </div>

      <div className="inline-flex rounded-full bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`px-4 py-2 text-sm font-semibold rounded-full ${
            activeTab === "suggestions"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600"
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          Play Games
        </button>

        <button
          onClick={() => setActiveTab("mentor")}
          className={`px-4 py-2 text-sm font-semibold rounded-full ${
            activeTab === "mentor"
              ? "bg-white shadow text-blue-700"
              : "text-gray-600"
          }`}
        >
          <Bot className="w-4 h-4 inline mr-1" />
          Ask AI Mentor
        </button>
      </div>

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

/* ======================= GAMES VIEW ======================= */

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
      .get(`${API_BASE_URL}/api/student/xp`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setXp(res.data.totalXP || 0);
        setCompleted(res.data.completedGames || []);
      });
  }, []);

  const handleSelectGame = async (game) => {
    if (!isFreePeriod) return;

    setActiveGame(game);
    setLoadingQuestion(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/games/generate-question`,
        { gameId: game.id },
        { headers: { Authorization: "Bearer " + token } }
      );
      setQuestionData(res.data);
    } catch {
      setQuestionData({ error: true });
    }
    setLoadingQuestion(false);
  };

  const awardXpIfNeeded = async () => {
    if (!activeGame) return;
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API_BASE_URL}/api/student/gain-xp`,
      { gameId: activeGame.id },
      { headers: { Authorization: "Bearer " + token } }
    );

    setXp(res.data.newTotalXP);
    setCompleted(res.data.completedGames || []);
  };

  if (freeLoading)
    return (
      <div className="bg-white p-6 rounded-xl flex gap-2">
        <Loader2 className="animate-spin" /> Checking free periods…
      </div>
    );

  if (!isFreePeriod)
    return (
      <div className="bg-white p-6 rounded-xl text-center">
        Games unlock automatically during free periods.
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-xl">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => handleSelectGame(g)}
            className="w-full p-3 text-left border rounded-xl mt-2"
          >
            {g.name}
            {completed.includes(g.id) && (
              <CheckCircle2 className="inline w-4 h-4 text-green-500 ml-2" />
            )}
          </button>
        ))}
      </div>

      <div className="lg:col-span-2 bg-white p-5 rounded-xl">
        {loadingQuestion && <Loader2 className="animate-spin" />}
        {questionData && !questionData.error && (
          <LearningPathPlayer
            path={questionData}
            onComplete={awardXpIfNeeded}
          />
        )}
      </div>
    </div>
  );
}

/* ======================= CHAT VIEW ======================= */

function AiMentorChatView({
  chatMessages,
  input,
  setInput,
  sendMessage,
  sending,
  chatEndRef,
}) {
  return (
    <div className="bg-white rounded-xl shadow flex flex-col h-[60vh]">
      <div className="flex-1 p-4 overflow-y-auto">
        {chatMessages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className="inline-block bg-gray-100 p-2 rounded-xl">
              {m.content}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <textarea
          className="flex-1 border rounded-xl p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          className="bg-blue-600 text-white px-4 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
