import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Sparkles } from "lucide-react";

/* ------------------------------------------
   RECOMMENDATION DATA
------------------------------------------ */
const recommendationsData = {
  "Web Development": [
    {
      role: "Frontend Developer",
      difficulty: 45,
      description: "Build beautiful UI using HTML, CSS, JavaScript & React.",
      tasks: ["Build a portfolio website", "Clone Instagram UI"],
      resources: ["MDN Docs", "React Docs", "Frontend Mentor"],
    },
    {
      role: "Fullstack Developer",
      difficulty: 70,
      description: "Work with frontend + backend + APIs + Database.",
      tasks: ["Build a MERN CRUD app", "Implement user auth"],
      resources: ["Node.js Docs", "MongoDB University"],
    },
  ],
  "Data Science": [
    {
      role: "Data Analyst",
      difficulty: 55,
      description: "Analyze structured data & generate insights.",
      tasks: ["Work with Pandas", "Build dashboards"],
      resources: ["Kaggle", "Tableau Tutorials"],
    },
    {
      role: "Data Scientist",
      difficulty: 85,
      description: "Train ML models & create predictions.",
      tasks: ["Build ML models", "Compete in Kaggle"],
      resources: ["Scikit Learn", "Coursera ML"],
    },
  ],
  "AI / ML": [
    {
      role: "Machine Learning Engineer",
      difficulty: 90,
      description: "Deep learning, neural networks & model deployment.",
      tasks: ["Train neural networks", "Deploy AI model"],
      resources: ["Tensorflow Docs", "PyTorch Docs"],
    },
  ],
  "Cybersecurity": [
    {
      role: "Security Analyst",
      difficulty: 75,
      description: "Protect systems & detect vulnerabilities.",
      tasks: ["TryHackMe Labs", "CTF Challenges"],
      resources: ["OWASP", "HackTheBox"],
    },
  ],
};

/* ------------------------------------------
   COMPONENT
------------------------------------------ */
export default function StudentRecommendations() {
  const [interest, setInterest] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [savedInterests, setSavedInterests] = useState([]);
  const [openSavedRec, setOpenSavedRec] = useState(null);
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  /* Load saved interests */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedInterests")) || [];
    setSavedInterests(saved);
  }, []);

  /* Save to localStorage */
  const saveInterest = (rec) => {
    const updated = [...savedInterests, rec];
    setSavedInterests(updated);
    localStorage.setItem("savedInterests", JSON.stringify(updated));
  };

  const handleRecommend = () => {
    setRecommendations(recommendationsData[interest] || []);
  };

  /* Difficulty color */
  const difficultyColor = (value) => {
    if (value < 50) return "bg-green-500";
    if (value < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  /* When clicking marked interest badge */
  const openSavedInterest = (rec) => {
    setOpenSavedRec(rec);
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <div className="p-6 space-y-8">

      {/* TITLE */}
      <h2 className="text-4xl font-extrabold text-blue-700">
        Career & Domain Recommendations 🚀
      </h2>

      {/* INTEREST SELECTOR */}
      <div className="flex gap-3 items-center flex-col sm:flex-row">
        <select
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className="p-3 border rounded-xl w-full sm:w-64 bg-white shadow"
        >
          <option value="">Select your interest</option>
          {Object.keys(recommendationsData).map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        <button
          onClick={handleRecommend}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-lg"
        >
          Show Recommendations
        </button>
      </div>

      {/* SAVED INTERESTS */}
      {savedInterests.length > 0 && (
        <div className="bg-blue-50 p-5 rounded-xl shadow">
          <h3 className="font-bold text-xl text-blue-700 mb-3">
            ⭐ Your Marked Interests
          </h3>

          <div className="flex gap-3 flex-wrap">
            {savedInterests.map((s, idx) => (
              <button
                key={idx}
                onClick={() => openSavedInterest(s)}
                className="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-full font-semibold shadow transition"
              >
                ⭐ {s.role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------
          SHOW SAVED INTEREST CARD
      ------------------------- */}
      {openSavedRec && (
        <div ref={scrollRef}>
          <h3 className="text-2xl font-bold text-purple-700 mb-2">
            ⭐ Your Saved Interest
          </h3>
          <RecommendationCard
            rec={openSavedRec}
            onSave={saveInterest}
            difficultyColor={difficultyColor}
            navigate={navigate}
          />
        </div>
      )}

      {/* MAIN RESULTS */}
      <div className="space-y-6">
        {recommendations.map((rec, idx) => (
          <RecommendationCard
            key={idx}
            rec={rec}
            onSave={saveInterest}
            difficultyColor={difficultyColor}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------
   COMPONENT FOR CARD (REUSED)
------------------------------------------ */
function RecommendationCard({ rec, onSave, difficultyColor, navigate }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border hover:shadow-2xl transition">

      {/* TITLE + STAR */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-purple-600" /> {rec.role}
        </h3>

        <button
          onClick={() => onSave(rec)}
          className="text-yellow-500 hover:text-yellow-600 transition"
        >
          <Star className="w-8 h-8" fill="gold" />
        </button>
      </div>

      <p className="text-gray-600 mt-2">{rec.description}</p>

      {/* DIFFICULTY */}
      <div className="mt-4">
        <p className="font-semibold text-gray-700">
          Difficulty Level: {rec.difficulty}%
        </p>

        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mt-1">
          <div
            className={`h-4 ${difficultyColor(rec.difficulty)} transition-all`}
            style={{ width: `${rec.difficulty}%` }}
          ></div>
        </div>
      </div>

      {/* TASKS */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700">Suggested Tasks:</h4>
        <ul className="list-disc list-inside text-gray-600">
          {rec.tasks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      {/* RESOURCES */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-700">Resources:</h4>
        <ul className="list-disc list-inside text-gray-600">
          {rec.resources.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* AI MENTOR BUTTON */}
      <button
        onClick={() => navigate("/student/ai")}
        className="mt-5 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow"
      >
        <Sparkles className="w-5 h-5" /> Ask AI Mentor
      </button>
    </div>
  );
}
