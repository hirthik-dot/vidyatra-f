import { useState } from "react";
import Assignments from "./Assignments.jsx";
import Assessments from "./Assessments.jsx";

export default function AssignmentsAndAssessments() {
  const [activeTab, setActiveTab] = useState("assignments");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Assignments & Assessments</h1>

      {/* TOP TABS */}
      <div className="flex space-x-4 border-b pb-3 mb-6">

        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "assignments"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Assignments
        </button>

        <button
          onClick={() => setActiveTab("assessments")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "assessments"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Assessments
        </button>

      </div>

      {/* CONTENT BELOW TABS */}
      {activeTab === "assignments" ? <Assignments /> : <Assessments />}
    </div>
  );
}
