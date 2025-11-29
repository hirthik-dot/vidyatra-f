import { useEffect, useState } from "react";

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);

  // Fetch faculty from backend
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/admin/faculty-list", {
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => res.json())
      .then((data) => setFaculty(data.faculty || []));
  }, []);

  // Mark faculty absent
  const markAbsent = async (facultyId) => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/api/admin/faculty/absent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        facultyId,
        date: new Date().toISOString().split("T")[0],
        reason: "Absent"
      })
    });

    alert("Faculty marked absent!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Manage Faculty</h2>

      {/* ADD FACULTY */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-xl font-semibold">Add Faculty</h3>

        <input
          type="text"
          placeholder="Teacher Name"
          className="p-3 border rounded-lg w-full"
        />
        <input
          type="text"
          placeholder="Subject"
          className="p-3 border rounded-lg w-full"
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Add Teacher
        </button>
      </div>

      {/* FACULTY LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        {faculty.map((t) => (
          <div
            key={t._id}
            className="p-4 border rounded-lg flex justify-between items-center mb-3"
          >
            <div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-gray-600">{t.subject || "Subject Not Assigned"}</p>
            </div>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={() => markAbsent(t._id)}
              >
                Mark Absent
              </button>

              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
