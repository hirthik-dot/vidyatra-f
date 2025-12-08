import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Sparkles,
  Bot,
  User,
AlertCircle,
  Brain,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ======================= GAME DEFINITIONS (LEVEL + META) ======================= */

const ALL_GAMES = [
  // LEVEL 1 (20 XP)
  {
    id: "sdlc",
    name: "SDLC Order Game",
    level: 1,
    xp: 20,
    concept: "Software Development Life Cycle",
    defaultType: "ordering",
  },
  {
    id: "usecase",
    name: "Use-Case Match",
    level: 1,
    xp: 20,
    concept: "Use Cases & Actors",
    defaultType: "mcq",
  },
  {
    id: "mcq_quiz",
    name: "Quick MCQ Quiz",
    level: 1,
    xp: 20,
    concept: "Basic Software Engineering Concepts",
    defaultType: "mcq",
  },

  // LEVEL 2 (30 XP)
  {
    id: "bug",
    name: "Bug Hunter",
    level: 2,
    xp: 30,
    concept: "Debugging / Testing",
    defaultType: "debugging",
  },
  {
    id: "logic_flow",
    name: "Logic Flowchart Game",
    level: 2,
    xp: 30,
    concept: "Control Flow & Logic",
    defaultType: "ordering",
  },
  {
    id: "network_fix",
    name: "Network Diagram Fix",
    level: 2,
    xp: 30,
    concept: "Basic Networks for Web Apps",
    defaultType: "mcq",
  },

  // LEVEL 3 (40 XP)
  {
    id: "api_debug",
    name: "API Request Debug",
    level: 3,
    xp: 40,
    concept: "REST API & HTTP",
    defaultType: "debugging",
  },
  {
    id: "db_query",
    name: "Database Query Fix",
    level: 3,
    xp: 40,
    concept: "Database / MongoDB",
    defaultType: "debugging",
  },
  {
    id: "cyber_spot",
    name: "Cybersecurity – Spot the Flaw",
    level: 3,
    xp: 40,
    concept: "Security & Best Practices",
    defaultType: "security",
  },
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

function SortableItem({ id, text }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-3 py-2 rounded-lg border text-sm flex items-center justify-between mb-2 cursor-grab ${
        isDragging ? "bg-blue-100 border-blue-400 shadow-lg" : "bg-white"
      }`}
    >
      <span className="truncate">{text}</span>
      <span className="text-xs text-gray-400">⇅</span>
    </div>
  );
}

/* ======================= MAIN COMPONENT ======================= */

export default function AiAssistant() {
  const [activeTab, setActiveTab] = useState("suggestions");

  // FREE PERIOD STATE (from ai-suggestions)
  const [isFreePeriod, setIsFreePeriod] = useState(false);
  const [freeLoading, setFreeLoading] = useState(true);

  // CHATBOT STATES
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

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, sending]);

  // ✅ Check free-period using existing ai-suggestions API
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

        // If there are any suggestions, we assume there is a free period
        if (data.suggestions && data.suggestions.length > 0) {
          setIsFreePeriod(true);
        } else {
          setIsFreePeriod(false);
        }
      } catch (err) {
        console.error("Error checking free period:", err);
        setIsFreePeriod(false);
      } finally {
        setFreeLoading(false);
      }
    };

    checkFreePeriod();
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
            Gamified learning (levels, XP & rewards) + personal AI mentor.
          </p>
        </div>
      </div>

      {/* TABS */}
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
          Play Games & Earn XP
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

      {/* CONTENT */}
      {activeTab === "suggestions" ? (
        <GamesView
          isFreePeriod={isFreePeriod}
          freeLoading={freeLoading}
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

/* ======================= 🎮 GAMES TAB (LEVELS + XP + AI QUESTIONS) ======================= */

function GamesView({ isFreePeriod, freeLoading }) {
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [games, setGames] = useState([]);

  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [questionData, setQuestionData] = useState(null);

  // ordering state
  const [orderItems, setOrderItems] = useState([]);

  // mcq state
  const [selectedOption, setSelectedOption] = useState("");
  const [answerStatus, setAnswerStatus] = useState(null); // "correct" | "wrong" | null
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1️⃣ Shuffle games for WOW factor
    const shuffled = shuffleArray(ALL_GAMES);
    setGames(shuffled);

    // 2️⃣ Load XP + completed games from backend
    axios
      .get("http://localhost:5000/api/student/xp", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setXp(res.data.totalXP || 0);
        setCompleted(res.data.completedGames || []);
      })
      .catch((err) => {
        console.error("Error loading XP:", err);
      });
  }, []);

  const rewardLadder = [
    { xp: 100, label: "Bronze Badge" },
    { xp: 200, label: "Silver Badge" },
    { xp: 300, label: "Gold Badge" },
    { xp: 500, label: "Internship Opportunity" },
  ];

  const getRewardProgress = () => {
    const next = rewardLadder.find((r) => xp < r.xp);
    if (!next) {
      return {
        text: "🎉 You unlocked all rewards including Internship!",
        remaining: 0,
        percent: 100,
        label: "All Rewards Unlocked",
      };
    }
    const remaining = next.xp - xp;
    const percent = Math.min(100, (xp / next.xp) * 100);
    return {
      text: `⭐ You need ${remaining} XP more to unlock ${next.label}`,
      remaining,
      percent,
      label: next.label,
    };
  };

  const reward = getRewardProgress();

  const renderLevelBadge = (level) => {
    const map = {
      1: {
        label: "Level 1 • Foundation",
        className: "bg-green-100 text-green-700",
      },
      2: {
        label: "Level 2 • Intermediate",
        className: "bg-yellow-100 text-yellow-700",
      },
      3: {
        label: "Level 3 • Advanced",
        className: "bg-red-100 text-red-700",
      },
    };
    const d = map[level] || map[1];
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${d.className}`}
      >
        {d.label}
      </span>
    );
  };

  const levels = [1, 2, 3];

  const handleSelectGame = async (game) => {
    if (!isFreePeriod) return; // safety guard

    setActiveGame(game);
    setQuestionData(null);
    setAnswerStatus(null);
    setSelectedOption("");
    setOrderItems([]);
    setLoadingQuestion(true);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/games/generate-question",
        { gameId: game.id },
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = res.data || {};
      setQuestionData(data);

      if (data.type === "ordering" && data.question?.items) {
        setOrderItems(shuffleArray(data.question.items));
      }
    } catch (err) {
      console.error("Error loading AI game question:", err);
      setQuestionData({
        error: true,
        fallback: true,
        title: game.name,
        description:
          "Unable to load AI-generated question right now. Please try again in a few minutes.",
        type: "info",
      });
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderItems((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const awardXpIfNeeded = async () => {
    if (!activeGame) return;
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/gain-xp",
        { gameId: activeGame.id },
        { headers: { Authorization: "Bearer " + token } }
      );

      if (!res.data.alreadyCompleted && res.data.awardedXP > 0) {
        alert(`🎉 Correct! You earned ${res.data.awardedXP} XP.`);
      }

      setXp(res.data.newTotalXP);
      setCompleted(res.data.completedGames || []);
    } catch (err) {
      console.error("Error awarding XP:", err);
      alert("⚠️ XP update failed. Please try again later.");
    }
  };

  const handleCheckAnswer = async () => {
    if (!questionData || !activeGame) return;
    if (questionData.error && questionData.fallback) return;

    setChecking(true);
    setAnswerStatus(null);

    try {
      const type = questionData.type || activeGame.defaultType;

      let isCorrect = false;

      if (type === "ordering") {
        const correctOrder = questionData.question?.correctOrder || [];
        if (
          correctOrder.length === orderItems.length &&
          correctOrder.every((val, idx) => val === orderItems[idx])
        ) {
          isCorrect = true;
        }
      } else if (type === "mcq") {
        const correct = questionData.question?.correct;
        if (selectedOption && selectedOption === correct) {
          isCorrect = true;
        }
      } else {
        // For debugging / security / other: keep for future manual validation
        alert(
          "This game type currently requires manual validation. XP is not auto-awarded for this type."
        );
        setChecking(false);
        return;
      }

      if (isCorrect) {
        setAnswerStatus("correct");
        await awardXpIfNeeded();
      } else {
        setAnswerStatus("wrong");
      }
    } catch (err) {
      console.error("Check answer error:", err);
    } finally {
      setChecking(false);
    }
  };

  /* ========== FREE PERIOD LOCK UI ========== */

  if (freeLoading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-3 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">
          Checking your timetable and today&apos;s free periods…
        </span>
      </div>
    );
  }

  if (!isFreePeriod) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 border border-dashed border-gray-300 text-center space-y-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Mini Games Locked
        </h2>
        <p className="text-sm text-gray-600">
          Gamified learning is only available during{" "}
          <span className="font-semibold">free periods</span> detected from your
          timetable (teacher absence / free slot).
        </p>
        <p className="text-xs text-gray-400">
          When the system detects a free period, this section will automatically
          unlock and suggest skill-building games instead of wasting time.
        </p>
      </div>
    );
  }

  /* ========== NORMAL GAME UI WHEN FREE PERIOD ========== */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT PANEL: GAME LIST + XP + REWARD PROGRESS */}
      <div className="bg-white rounded-2xl shadow p-5 border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-900 mb-1">
          🎮 Mini Games (AI generated)
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Free period detected. These games are generated using AI and mapped to
          SDLC, APIs, debugging, networks and security. Finish them to earn XP.
        </p>

        {levels.map((level) => (
          <div key={level} className="space-y-2">
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm font-semibold text-gray-800">
                Level {level}
              </p>
              {renderLevelBadge(level)}
            </div>

            {games
              .filter((g) => g.level === level)
              .map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGame(g)}
                  className={`w-full text-left p-3 rounded-xl flex justify-between items-center text-sm transition border ${
                    activeGame?.id === g.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-gray-50 text-gray-800 hover:bg-white border-gray-200"
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{g.name}</p>
                    <p className="text-[11px] opacity-80">{g.concept}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span className="font-semibold">+{g.xp} XP</span>
                    {completed.includes(g.id) && (
                      <span className="text-green-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    )}
                  </div>
                </button>
              ))}
          </div>
        ))}

        {/* XP SUMMARY */}
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl text-sm text-yellow-800">
          <p className="font-semibold">⭐ Your Total XP: {xp}</p>
          <p className="text-[11px]">
            Higher level games give more XP and unlock bigger rewards including
            badges and internship.
          </p>
        </div>

        {/* REWARD PROGRESS */}
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <h4 className="font-bold text-purple-800 mb-1">🎯 Reward Progress</h4>

          <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden mb-1">
            <div
              className="bg-purple-600 h-full transition-all duration-500"
              style={{ width: `${reward.percent}%` }}
            ></div>
          </div>

          <p className="text-xs text-purple-700">{reward.text}</p>
        </div>
      </div>

      {/* RIGHT PANEL: ACTIVE GAME + QUESTION AREA */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5 border border-gray-100">
        {!activeGame && (
          <p className="text-gray-600 text-sm">
            Select any game from the left to generate a fresh task using AI and
            start earning XP for this free period.
          </p>
        )}

        {activeGame && (
          <div className="space-y-4">
            {/* Game Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeGame.name}
                </h2>
                <p className="text-xs text-gray-500">
                  Concept: {activeGame.concept}
                </p>
              </div>
              {renderLevelBadge(activeGame.level)}
            </div>

            {/* Question Area */}
            {loadingQuestion ? (
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 border rounded-2xl p-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">
                  Generating game question using AI…
                </span>
              </div>
            ) : questionData?.error && questionData?.fallback ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800 space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  AI Question Unavailable
                </p>
                <p>{questionData.description}</p>
              </div>
            ) : questionData ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    AI Generated Task
                  </p>
                  <h3 className="text-sm font-bold text-gray-800">
                    {questionData.title || activeGame.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {questionData.description}
                  </p>
                  <p className="text-sm text-gray-700">
                    {questionData.question?.prompt}
                  </p>
                </div>

                {/* TYPE-SPECIFIC UI */}
                {(() => {
                  const type =
                    questionData.type || activeGame.defaultType || "mcq";

                  if (type === "ordering" && orderItems.length > 0) {
                    return (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          Drag and drop to arrange in correct order:
                        </p>
                        <DndContext
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={orderItems}
                            strategy={verticalListSortingStrategy}
                          >
                            {orderItems.map((item) => (
                              <SortableItem key={item} id={item} text={item} />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    );
                  }

                  if (
                    type === "mcq" &&
                    questionData.question?.options &&
                    questionData.question.options.length > 0
                  ) {
                    return (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          Select the best answer:
                        </p>
                        <div className="grid gap-2">
                          {questionData.question.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedOption(opt)}
                              className={`px-3 py-2 rounded-xl border text-left text-sm transition ${
                                selectedOption === opt
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-gray-50 text-gray-800 hover:bg-white border-gray-200"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // DEBUGGING / SECURITY / OTHER TYPES -> Show code or info
                  return (
                    <div className="space-y-2">
                      {questionData.question?.code && (
                        <div className="bg-black text-green-200 text-xs font-mono rounded-lg p-3 overflow-auto">
                          <pre>{questionData.question.code}</pre>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        This question is designed to test your reasoning and
                        debugging skills. Explain your fix/solution to your
                        evaluator if needed.
                      </p>
                    </div>
                  );
                })()}

                {/* RESULT / ACTIONS */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCheckAnswer}
                    disabled={
                      checking ||
                      !questionData ||
                      (questionData.type === "mcq" &&
                        !selectedOption &&
                        questionData.type !== "ordering" &&
                        !orderItems.length)
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                      checking
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {checking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {checking ? "Checking..." : "Check Answer & Earn XP"}
                  </button>

                  {answerStatus === "correct" && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Correct! XP updated in your dashboard.
                    </span>
                  )}

                  {answerStatus === "wrong" && (
                    <span className="flex items-center gap-1 text-xs text-red-500">
                      <XCircle className="w-4 h-4" />
                      Not correct yet. Try rearranging / choosing a different
                      answer.
                    </span>
                  )}
                </div>

                {/* Explanation for MCQ if available */}
                {questionData.type === "mcq" &&
                  questionData.question?.explanation &&
                  answerStatus === "correct" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                      <p className="font-semibold mb-1 flex items-center gap-1">
                        <Brain className="w-4 h-4" />
                        Why this is correct:
                      </p>
                      <p>{questionData.question.explanation}</p>
                    </div>
                  )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================= 🤖 AI MENTOR CHAT TAB ======================= */

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
      {/* LEFT INFO CARD */}
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
          <p>Try to ask one clear question at a time for best answers.</p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white rounded-2xl">
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
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

        {/* INPUT */}
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
