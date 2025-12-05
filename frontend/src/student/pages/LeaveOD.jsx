import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentLeaveRequestModalPage() {
  const studentId = localStorage.getItem("studentId");

  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    type: "Leave",
    startDate: "",
    endDate: "",
    odDate: "",
    eventName: "",
    organizer: "",
    reason: "",
    notes: "",
    file: null,
  });

  /* -------------------------------------
      FETCH STUDENT REQUEST HISTORY
  ------------------------------------- */
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leave/student/${studentId}`
      );
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* -------------------------------------
      FORM INPUT HANDLER
  ------------------------------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  /* -------------------------------------
      SUBMIT REQUEST TO BACKEND
  ------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("studentId", studentId);

    // type
    const typeMapped =
      formData.type === "Leave"
        ? "leave"
        : formData.type === "OD"
        ? "od"
        : "permission";

    fd.append("type", typeMapped);

    // leave fields
    if (typeMapped === "leave") {
      fd.append("fromDate", formData.startDate);
      fd.append("toDate", formData.endDate);
    }

    // OD fields
    if (typeMapped === "od") {
      fd.append("date", formData.odDate);
      fd.append("eventName", formData.eventName);
      fd.append("organizer", formData.organizer);
    }

    // common
    fd.append("reason", formData.reason);
    fd.append("notes", formData.notes || "");

    if (formData.file) fd.append("attachment", formData.file);

    try {
      await axios.post("http://localhost:5000/api/leave/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Request submitted!");
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    }
  };

  const statusColor = (status) => {
    if (status === "pending") return "bg-yellow-200 text-yellow-800";
    if (status === "approved") return "bg-green-200 text-green-800";
    if (status === "rejected") return "bg-red-200 text-red-800";
    return "bg-gray-200 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">
        Leave / OD / Permission Requests
      </h2>

      {/* Open Modal Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
      >
        New Request
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Submit a Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option>Leave</option>
                <option>OD</option>
                <option>Permission</option>
              </select>

              {/* Leave DATE fields */}
              {formData.type === "Leave" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-1/2 p-3 border rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-1/2 p-3 border rounded-lg"
                    required
                  />
                </div>
              )}

              {/* OD fields */}
              {formData.type === "OD" && (
                <>
                  <input
                    type="date"
                    name="odDate"
                    value={formData.odDate}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    placeholder="Event Name"
                    className="w-full p-3 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleChange}
                    placeholder="Organizer"
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </>
              )}

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Reason / Purpose"
                className="w-full p-3 border rounded-lg"
                required
              />

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional Notes (optional)"
                className="w-full p-3 border rounded-lg"
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
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Your Requests
        </h3>

        {requests.length === 0 ? (
          <p className="text-gray-500">No requests submitted yet.</p>
        ) : (
          <div className="space-y-3 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Dates</th>
                  <th className="p-2 text-left">Reason</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Attachment</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((req, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">{req.type}</td>

                    <td className="p-2">
                      {req.type === "leave"
                        ? `${req.fromDate?.slice(0, 10)} → ${req.toDate?.slice(
                            0,
                            10
                          )}`
                        : req.type === "od"
                        ? req.date?.slice(0, 10)
                        : "-"}
                    </td>

                    <td className="p-2">{req.reason}</td>

                    <td
                      className={`p-2 font-semibold rounded-full text-center ${statusColor(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </td>

                    <td className="p-2">
                      {req.attachmentUrl ? (
                        <a
                          href={`http://localhost:5000${req.attachmentUrl}`}
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
