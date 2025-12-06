import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  FileText,
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

  // Fetch history
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

  // Handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Submit
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
      await axios.post("http://localhost:5000/api/leave/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-blue-700 drop-shadow-sm">
          Leave / OD / Permission Requests
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow"
        >
          <PlusCircle size={20} />
          New Request
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative animate-scaleIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-5">
              Submit Request
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
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
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type === "OD" && (
                <>
                  <label className="text-sm font-medium">OD Date</label>
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
                    placeholder="Event Name"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />

                  <input
                    type="text"
                    name="organizer"
                    placeholder="Organizer"
                    value={formData.organizer}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </>
              )}

              <textarea
                name="reason"
                placeholder="Reason / Purpose"
                value={formData.reason}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />

              <textarea
                name="notes"
                placeholder="Additional Notes (optional)"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />

              <div className="flex items-center gap-3">
                <Upload size={18} className="text-gray-600" />
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request List */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          Request History
        </h3>

        {requests.length === 0 ? (
          <p className="text-gray-500">No requests submitted yet.</p>
        ) : (
          <div className="space-y-5">
            {requests.map((req, i) => (
              <div
                key={i}
                className="p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm border ${typeColor[
                      req.type
                    ]}`}
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

                {/* Details */}
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} />
                    {req.type === "leave"
                      ? `${req.fromDate?.slice(0, 10)} → ${req.toDate?.slice(
                          0,
                          10
                        )}`
                      : req.type === "od"
                      ? req.date?.slice(0, 10)
                      : "Permission Request"}
                  </p>

                  <p className="text-gray-800 font-medium">
                    Reason: {req.reason}
                  </p>

                  {/* Attachment */}
                  {req.attachmentUrl && (
                    <a
                      href={`http://localhost:5000${req.attachmentUrl}`}
                      className="text-blue-600 text-sm underline"
                      target="_blank"
                    >
                      View Attachment
                    </a>
                  )}

                  {/* 🔥 Rejection Reason Shown BEAUTIFULLY */}
                  {req.status === "rejected" && req.rejectReason && (
                    <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex gap-3">
                      <AlertOctagon className="text-red-600 w-5 h-5 mt-1" />
                      <div>
                        <p className="text-red-700 font-semibold">
                          Rejected by Faculty
                        </p>
                        <p className="text-red-600 text-sm mt-1">
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
