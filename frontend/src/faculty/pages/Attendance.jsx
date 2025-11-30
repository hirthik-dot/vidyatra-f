import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function FacultyAttendance() {
  const [qrCode, setQrCode] = useState("");
  const [expiresIn, setExpiresIn] = useState(30);

  const [className, setClassName] = useState("");
  const [periods, setPeriods] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch QR every 1 second
  const fetchQR = async () => {
    const res = await fetch("http://localhost:5000/api/student/qr/current");
    const data = await res.json();
    setQrCode(data.qrCode);
    setExpiresIn(data.expiresIn);
  };

  // Fetch FULL DAY attendance
  const fetchAttendanceData = async () => {
    const res = await fetch(
      "http://localhost:5000/api/faculty/attendance/day",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await res.json();

    setClassName(data.className || "");
    setPeriods(data.periods || []);
  };

  useEffect(() => {
    fetchQR();
    fetchAttendanceData();

    const interval = setInterval(() => {
      fetchQR();
      fetchAttendanceData();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold text-blue-700">Classroom Attendance</h2>

      {/* Class Name */}
      <p className="text-gray-600 text-lg">
        Teaching Class: <strong>{className || "Loading..."}</strong>
      </p>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-xl shadow border flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-4">Live QR (Auto Refresh)</h3>
        <QRCodeCanvas value={qrCode || "loading"} size={200} />
        <p className="text-gray-600 mt-3">
          Refreshing in: <strong>{expiresIn}s</strong>
        </p>
      </div>

      {/* All Periods */}
      <div className="space-y-6">
        {periods.length === 0 ? (
          <p className="text-gray-600">No periods found today.</p>
        ) : (
          periods.map((p, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow border space-y-3"
            >
              {/* Period Title */}
              <h3 className="text-xl font-bold text-blue-700">
                Period {p.period}: {p.subject}
              </h3>
              <p className="text-gray-600">
                {p.start} - {p.end}
              </p>

              {/* Summary */}
              <div className="text-lg">
                <p>
                  Present:{" "}
                  <strong className="text-green-700">
                    {p.presentCount}
                  </strong>{" "}
                  /{" "}
                  <strong className="text-blue-700">
                    {p.totalStudents}
                  </strong>
                </p>
                <p>
                  Absent:{" "}
                  <strong className="text-red-600">{p.absentCount}</strong>
                </p>
              </div>

              {/* Present Students */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2">
                  Present Students:
                </h4>
                {p.presentStudents.length === 0 ? (
                  <p className="text-gray-500">No students marked present.</p>
                ) : (
                  <ul className="space-y-2">
                    {p.presentStudents.map((s, idx) => (
                      <li
                        key={idx}
                        className="p-3 bg-green-100 border border-green-300 rounded-lg"
                      >
                        <strong>{s.name}</strong>{" "}
                        {s.roll && <span>({s.roll})</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Absent Students */}
              <div>
                <h4 className="font-semibold text-red-700 mt-4 mb-2">
                  Absent Students:
                </h4>
                {p.absentStudents.length === 0 ? (
                  <p className="text-gray-500">No absent students.</p>
                ) : (
                  <ul className="space-y-2">
                    {p.absentStudents.map((s, idx) => (
                      <li
                        key={idx}
                        className="p-3 bg-red-100 border border-red-300 rounded-lg"
                      >
                        <strong>{s.name}</strong>{" "}
                        {s.roll && <span>({s.roll})</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
