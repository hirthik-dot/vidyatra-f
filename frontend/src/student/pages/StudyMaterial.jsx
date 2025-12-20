import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import QuizModal from "../components/QuizModal";
import { API_BASE_URL } from "../../config/api";

export default function StudyMaterial() {
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMaterial = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/student/personal-material`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      const data = await res.json();

      setMaterial(data.material || "");
      setQuiz(Array.isArray(data.quiz) ? data.quiz : []);
    } catch (err) {
      console.error("Study material load error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-700" />
        <div>
          <h2 className="text-3xl font-bold text-blue-700">
            Personalized Study Material
          </h2>
          <p className="text-sm text-gray-600">
            Auto-generated based on your personal interests.
          </p>
        </div>
      </div>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
              <div className="h-4 w-3/5 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* MATERIAL + ACTIONS */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow border p-6 space-y-4">
          {material ? (
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
              {material}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">
              No material generated. Try again later.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowQuiz(true)}
              disabled={!quiz || quiz.length === 0}
              className={`px-5 py-2 rounded-xl font-semibold ${
                quiz && quiz.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Take Quiz
            </button>

            <button
              onClick={loadMaterial}
              className="px-5 py-2 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Regenerate Material
            </button>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuiz && (
        <QuizModal quiz={quiz} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}
