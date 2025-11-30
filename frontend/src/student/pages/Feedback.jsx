import { useState } from "react";

export default function StudentFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    category: "General",
    title: "",
    rating: 5,
    notes: "",
    file: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedbacks((prev) => [...prev, { ...formData, status: "Pending" }]);
    setFormData({ category: "General", title: "", rating: 5, notes: "", file: null });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const statusColor = (status) => {
    if (status === "Pending") return "bg-yellow-200 text-yellow-800";
    if (status === "Reviewed") return "bg-green-200 text-green-800";
    return "bg-gray-200 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Feedback & Suggestions</h2>

      {/* Feedback Form Card */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">Submit Feedback / Suggestion</h3>
        {showSuccess && (
          <div className="p-2 bg-green-100 text-green-700 rounded-lg">
            Feedback submitted successfully!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option>General</option>
            <option>Academics</option>
            <option>Facilities</option>
            <option>Library</option>
            <option>Others</option>
          </select>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title / Subject"
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* Rating */}
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-700">Rating:</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num} Star{num > 1 && "s"}</option>
              ))}
            </select>
          </div>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Your Feedback / Suggestion"
            className="w-full p-3 border rounded-lg"
            rows={4}
          />

          <input
            type="file"
            name="file"
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Feedback List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Past Feedback</h3>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-3 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Rating</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Attachment</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">{f.category}</td>
                    <td className="p-2">{f.title}</td>
                    <td className="p-2">{f.rating} ⭐</td>
                    <td className={`p-2 font-semibold ${statusColor(f.status)} rounded-full text-center`}>
                      {f.status}
                    </td>
                    <td className="p-2">
                      {f.file ? (
                        <a
                          href={URL.createObjectURL(f.file)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
