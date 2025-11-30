import { useState } from "react";

export default function FacultyTasks() {
  // Tabs: "Assignments" or "Assessments"
  const [activeTab, setActiveTab] = useState("Assignments");

  // Assignments State
  const [assignments, setAssignments] = useState([
    { 
      title: "Data Structures Assignment 1", 
      course: "Data Structures", 
      due: "2025-12-01",
      description: "Solve all exercises in Chapter 5",
      note: "Submit as PDF",
      file: null,
      completedStudents: ["Alice", "Bob"],
      pendingStudents: ["Charlie", "David"]
    },
    { 
      title: "Database Project Report", 
      course: "Database Systems", 
      due: "2025-12-05",
      description: "Create ER diagram and normalize tables",
      note: "",
      file: null,
      completedStudents: ["Eve"],
      pendingStudents: ["Frank", "Grace"]
    }
  ]);

  // Assessments State
  const [assessments, setAssessments] = useState([
    { title: "Math Unit Test", course: "Mathematics", date: "2025-12-05" },
    { title: "Physics Quiz", course: "Physics", date: "2025-12-07" }
  ]);

  // Modals & Search
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // New assignment template
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    course: "",
    due: "",
    description: "",
    note: "",
    file: null,
    completedStudents: [],
    pendingStudents: ["Student1","Student2"]
  });

  // Assignment Handlers
  const handleCreateAssignment = () => {
    setAssignments(prev => [...prev, newAssignment]);
    setNewAssignment({
      title: "",
      course: "",
      due: "",
      description: "",
      note: "",
      file: null,
      completedStudents: [],
      pendingStudents: ["Student1","Student2"]
    });
    setShowCreateModal(false);
  };

  const handleSendReminder = (student) => {
    alert(`Reminder sent to ${student}`);
  };

  const handleExport = (assignment) => {
    const csvContent = [
      ["Student Name", "Status"],
      ...assignment.completedStudents.map(s => [s, "Completed"]),
      ...assignment.pendingStudents.map(s => [s, "Pending"])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${assignment.title}_report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold text-blue-700">Faculty Tasks</h2>

      {/* Tabs */}
      <div className="flex gap-4 border-b-2 pb-2">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "Assignments" ? "border-b-2 border-blue-700 text-blue-700" : "text-gray-600"}`}
          onClick={() => setActiveTab("Assignments")}
        >
          Assignments
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === "Assessments" ? "border-b-2 border-blue-700 text-blue-700" : "text-gray-600"}`}
          onClick={() => setActiveTab("Assessments")}
        >
          Assessments
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "Assignments" && (
        <div>
          {/* Search + Create */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by title or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border rounded-lg flex-1"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Create Assignment
            </button>
          </div>

          {/* Assignment List */}
          <div className="bg-white p-6 rounded-xl shadow space-y-3">
            {filteredAssignments.length === 0 ? (
              <p className="text-gray-500">No assignments found.</p>
            ) : (
              filteredAssignments.map((a, i) => (
                <div key={i} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="cursor-pointer" onClick={() => setShowDetailModal(i)}>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-gray-600">{a.course} • Due {a.due}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(i)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "Assessments" && (
        <div>
          {/* Create Assessment */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4 mb-4">
            <h3 className="text-xl font-semibold">Create New Assessment</h3>
            <input type="text" placeholder="Test Title" className="p-3 border rounded-lg w-full" />
            <input type="text" placeholder="Course / Section" className="p-3 border rounded-lg w-full" />
            <input type="date" className="p-3 border rounded-lg w-full" />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold">
              Create Assessment
            </button>
          </div>

          {/* Assessment List */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">Upcoming Tests</h3>
            <div className="space-y-3">
              {assessments.map((t, i) => (
                <div key={i} className="p-4 border rounded-lg flex justify-between">
                  <div>
                    <p className="font-bold">{t.title}</p>
                    <p className="text-sm text-gray-600">{t.course} • {t.date}</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Upload Marks
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modals */}
      {showCreateModal && activeTab === "Assignments" && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Assignment</h3>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowCreateModal(false)}>✕</button>

            <input type="text" placeholder="Assignment Title" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment,title:e.target.value})} className="w-full p-3 border rounded-lg mb-2"/>
            <input type="text" placeholder="Course / Section" value={newAssignment.course} onChange={e => setNewAssignment({...newAssignment,course:e.target.value})} className="w-full p-3 border rounded-lg mb-2"/>
            <input type="date" value={newAssignment.due} onChange={e => setNewAssignment({...newAssignment,due:e.target.value})} className="w-full p-3 border rounded-lg mb-2"/>
            <textarea placeholder="Description" value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment,description:e.target.value})} className="w-full p-3 border rounded-lg mb-2"/>
            <textarea placeholder="Note" value={newAssignment.note} onChange={e => setNewAssignment({...newAssignment,note:e.target.value})} className="w-full p-3 border rounded-lg mb-2"/>
            <input type="file" onChange={e => setNewAssignment({...newAssignment,file:e.target.files[0]})} className="w-full p-3 border rounded-lg mb-4"/>

            <button onClick={handleCreateAssignment} className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold">Submit Assignment</button>
          </div>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {showDetailModal !== null && activeTab === "Assignments" && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowDetailModal(null)}>✕</button>
            <h3 className="text-xl font-semibold mb-2">{assignments[showDetailModal].title}</h3>
            <p className="text-gray-500 mb-2">Course: {assignments[showDetailModal].course}</p>
            <p className="text-gray-500 mb-2">Due: {assignments[showDetailModal].due}</p>
            <p className="mb-2"><span className="font-semibold">Description:</span> {assignments[showDetailModal].description || "N/A"}</p>
            <p className="mb-2"><span className="font-semibold">Note:</span> {assignments[showDetailModal].note || "N/A"}</p>

            <p className="mt-2 font-semibold">Completed Students: {assignments[showDetailModal].completedStudents.length}</p>
            <p className="font-semibold">Pending Students: {assignments[showDetailModal].pendingStudents.length}</p>

            <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {assignments[showDetailModal].pendingStudents.map((s, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 border rounded-lg">
                  <span>{s}</span>
                  <button onClick={() => handleSendReminder(s)} className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Send Reminder</button>
                </li>
              ))}
            </ul>

            <button onClick={() => handleExport(assignments[showDetailModal])} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold">Export Report</button>
          </div>
        </div>
      )}

    </div>
  );
}
