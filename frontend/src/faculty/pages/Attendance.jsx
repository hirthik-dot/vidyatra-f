import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function FacultyAttendance() {
  const [qrCode, setQrCode] = useState("");
  const [expiresIn, setExpiresIn] = useState(30);
  const [students, setStudents] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeClass, setActiveClass] = useState("");

  const token = localStorage.getItem("token");

  // Fetch QR
  const fetchQR = async () => {
    const res = await fetch("http://localhost:5000/api/student/qr/current");
    const data = await res.json();
    setQrCode(data.qrCode);
    setExpiresIn(data.expiresIn);
  };

  // Fetch present students + class name + total count
  const fetchAttendanceData = async () => {
    const res = await fetch("http://localhost:5000/api/faculty/attendance/current", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();

    setActiveClass(data.className || "");
    setStudents(data.students || []);
    setPresentCount(data.presentCount || 0);
    setTotalStudents(data.totalStudents || 0);
  };

  useEffect(() => {
    fetchQR();
    fetchAttendanceData();

    const interval = setInterval(() => {
      fetchQR();
      fetchAttendanceData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Classroom Attendance</h2>

      <p className="text-gray-600 text-lg">
        Teaching Class: <strong>{activeClass || "Loading..."}</strong>
      </p>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-xl shadow border flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-4">Live QR (Auto Refresh)</h3>
        <QRCodeCanvas value={qrCode || "loading"} size={220} />
        <p className="text-gray-600 mt-3">
          Refreshing in: <strong>{expiresIn}s</strong>
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded-xl shadow border text-center">
        <h3 className="text-xl font-semibold">Attendance Summary</h3>
        <p className="text-gray-700 mt-2 text-lg">
          Present:{" "}
          <strong className="text-green-700">{presentCount}</strong> /{" "}
          <strong className="text-blue-700">{totalStudents}</strong> Students
        </p>
      </div>

      {/* Students List */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-xl font-semibold mb-3">
          Students Present ({activeClass || "..."})
        </h3>

        {students.length === 0 ? (
          <p className="text-gray-600">No students marked present yet.</p>
        ) : (
          <ul className="space-y-2">
            {students.map((s, i) => (
              <li
                key={i}
                className="p-3 bg-green-100 border border-green-300 rounded-lg flex justify-between"
              >
                <span><strong>{s.name}</strong> {s.roll && `(${s.roll})`}</span>
                <span className="text-green-700 font-semibold">✔ Present</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
