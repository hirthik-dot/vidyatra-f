import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

import {
  Calendar,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  PlusCircle,
} from "lucide-react";

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

  /* ================= FETCH REQUEST HISTORY ================= */
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/leave/student/${studentId}`
      );
      setRequests(res.data || []);
    } catch (err) {
      console.error("Fetch leave history error:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= FORM HANDLING ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  /* ================= SUBMIT REQUEST ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("studentId", studentId);

    const typeMapped =
      formData.type === "Leave"
        ? "leave"
        : formData.type === "OD"
        ? "od"
        : "permission";

    fd.append("type", typeMapped);

    if (typeMapped === "leave") {
      fd.append("fromDate", formData.startDate);
      fd.append("toDate", formData.endDate);
    }

    if (typeMapped === "od") {
      fd.append("date", formData.odDate);
      fd.append("eventName", formData.eventName);
      fd.append("organizer", formData.organizer);
    }

    fd.append("reason", formData.reason);
    fd.append("notes", formData.notes);

    if (formData.file) fd.append("attachment", formData.file);

    try {
      await axios.post(`${API_BASE_URL}/api/leave/create`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      fetchRequests();
    } catch (err) {
      console.error("Submit leave error:", err);
      alert("Failed to submit request");
    }
  };

  /* ================= UI HELPERS ================= */
  const typeColor = {
    leave: "bg-blue-100 text-blue-700 border-blue-300",
    od: "bg-purple-100 text-purple-700 border-purple-300",
    permission: "bg-teal-100 text-teal-700 border-teal-300",
  };

  const statusBadge = (status) => {
    if (status === "pending")
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (status === "approved")
      return "bg-green-100 text-green-700 border-green-300";
    if (status === "rejected")
      return "bg-red-100 text-red-700 border-red-300";
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

  const statusIcon = (status) => {
    if (status === "pending")
      return <Clock className="w-4 h-4 text-yellow-600" />;
    if (status === "approved")
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === "rejected")
      return <XCircle className="w-4 h-4 text-red-600" />;
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-700">
          Leave / OD / Permission
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          New Request
        </button>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold mb-4">Submit Request</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {formData.type === "Leave" && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="p-3 border rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="p-3 border rounded-lg"
                    required
                  />
                </div>
              )}

              {formData.type === "OD" && (
                <>
                  <input
                    type="date"
                    name="odDate"
                    value={formData.odDate}
                    onChange={handleChange}
                    className="p-3 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    name="eventName"
                    placeholder="Event Name"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="p-3 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    name="organizer"
                    placeholder="Organizer"
                    value={formData.organizer}
                    onChange={handleChange}
                    className="p-3 border rounded-lg"
                    required
                  />
                </>
              )}

              <textarea
                name="reason"
                placeholder="Reason"
                value={formData.reason}
                onChange={handleChange}
                className="p-3 border rounded-lg"
                required
              />

              <textarea
                name="notes"
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChange={handleChange}
                className="p-3 border rounded-lg"
              />

              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="p-2 border rounded-lg"
              />

              <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= HISTORY ================= */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-4">Request History</h3>

        {requests.length === 0 ? (
          <p className="text-gray-500">No requests submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-4 border rounded-xl bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm border ${typeColor[req.type]}`}
                  >
                    {req.type.toUpperCase()}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${statusBadge(
                      req.status
                    )}`}
                  >
                    {statusIcon(req.status)} {req.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} />
                    {req.type === "leave"
                      ? `${req.fromDate?.slice(0, 10)} → ${req.toDate?.slice(
                          0,
                          10
                        )}`
                      : req.type === "od"
                      ? req.date?.slice(0, 10)
                      : "Permission"}
                  </p>

                  <p className="font-medium">Reason: {req.reason}</p>

                  {req.attachmentUrl && (
                    <a
                      href={`${API_BASE_URL}${req.attachmentUrl}`}
                      target="_blank"
                      className="text-blue-600 underline text-sm"
                    >
                      View Attachment
                    </a>
                  )}

                  {req.status === "rejected" && req.rejectReason && (
                    <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex gap-3">
                      <AlertOctagon className="text-red-600 w-5 h-5 mt-1" />
                      <div>
                        <p className="font-semibold text-red-700">
                          Rejected by Faculty
                        </p>
                        <p className="text-sm text-red-600">
                          {req.rejectReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
