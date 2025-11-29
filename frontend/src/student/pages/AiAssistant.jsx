import { useEffect, useState } from "react";

export default function AiAssistant() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/student/ai-suggestions", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);

        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        } else {
          setMessage(data.message || "No suggestions available.");
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setMessage("Unable to load suggestions.");
      });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">AI Assistant</h2>

      {loading && <p className="text-gray-700">Loading suggestions...</p>}

      {!loading && message && (
        <p className="text-red-600 text-lg">{message}</p>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((s, i) => (
            <div key={i} className="p-4 bg-white shadow rounded-xl">
              <p className="text-lg font-bold text-blue-700">
                Free Period {s.period}
              </p>
              <p className="text-gray-700">
                {s.start} - {s.end}
              </p>
              <p className="text-green-700 mt-2 font-semibold">
                Suggestion: {s.suggestion}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
