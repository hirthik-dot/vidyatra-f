import { useState } from "react";

export default function FacultyApprovalPage() {
  const [requests, setRequests] = useState([
    {
      student: "John Doe",
      type: "Leave",
      start: "2025-12-01",
      end: "2025-12-03",
      reason: "Medical leave",
      status: "Pending",
      comments: "",
      file: null
    },
    {
      student: "Alice Smith",
      type: "OD",
      start: "2025-12-05",
      end: "2025-12-05",
      reason: "Industrial visit",
      status: "Approved",
      comments: "Approved by HOD",
      file: null
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApproval = (index, decision) => {
    if (decision === "Approved") {
      setRequests(prev => {
        const updated = [...prev];
        updated[index].status = decision;
        updated[index].comments = "Approved by faculty";
        return updated;
      });
    } else if (decision === "Rejected") {
      setShowRejectModal(index); // Open rejection reason modal
    }
  };

  const submitRejection = () => {
    setRequests(prev => {
      const updated = [...prev];
      updated[showRejectModal].status = "Rejected";
      updated[showRejectModal].comments = rejectReason || "No reason provided";
      return updated;
    });
    setRejectReason("");
    setShowRejectModal(null);
  };

  const filteredRequests = requests.filter(r => 
    (filterType === "All" || r.type === filterType) &&
    (filterStatus === "All" || r.status === filterStatus) &&
    r.student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status) => {
    if(status === "Pending") return "bg-yellow-200 text-yellow-800";
    if(status === "Approved") return "bg-green-200 text-green-800";
    if(status === "Rejected") return "bg-red-200 text-red-800";
    return "bg-gray-200 text-gray-800";
  };

  return (
    <div className="p-6 space-y-9">
      <h2 className="text-3xl font-bold text-blue-700">Student Requests Approval</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <input
          type="text"
          placeholder="Search by student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg flex-1"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 border rounded-lg">
          <option>All</option>
          <option>Leave</option>
          <option>OD</option>
          <option>Permission</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded-lg">
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Dates</th>
              <th className="p-2 text-left">Reason</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-gray-500 text-center">No requests found.</td></tr>
            ) : (
              filteredRequests.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2">{r.student}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">{r.start} to {r.end}</td>
                  <td className="p-2">{r.reason}</td>
                  <td className={`p-2 font-semibold ${statusColor(r.status)} rounded-full text-center`}>{r.status}</td>
                  <td className="p-2 flex gap-2">
                    {r.status === "Pending" && (
                      <>
                        <button onClick={() => handleApproval(i, "Approved")} className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Approve</button>
                        <button onClick={() => handleApproval(i, "Rejected")} className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Reject</button>
                      </>
                    )}
                    <button onClick={() => setShowDetailModal(i)} className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button onClick={() => setShowDetailModal(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h3 className="text-xl font-semibold mb-2">{requests[showDetailModal].student} - {requests[showDetailModal].type}</h3>
            <p><span className="font-semibold">Dates:</span> {requests[showDetailModal].start} to {requests[showDetailModal].end}</p>
            <p><span className="font-semibold">Reason:</span> {requests[showDetailModal].reason}</p>
            <p><span className="font-semibold">Status:</span> {requests[showDetailModal].status}</p>
            {requests[showDetailModal].comments && <p><span className="font-semibold">Comments:</span> {requests[showDetailModal].comments}</p>}
            {requests[showDetailModal].file && (
              <a href={URL.createObjectURL(requests[showDetailModal].file)} download className="text-blue-600 underline mt-2 block">Download File</a>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button onClick={() => setShowRejectModal(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h3 className="text-xl font-semibold mb-2 text-red-600">Reject Request</h3>
            <p className="mb-2">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
              placeholder="Reason for rejection..."
            />
            <button
              onClick={submitRejection}
              className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-semibold"
            >
              Submit Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
