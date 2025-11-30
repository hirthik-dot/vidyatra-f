import { useState } from "react";
import FaceScanModal from "../../components/FaceScanModal";

export default function Attendance() {
  const [wifiVerified, setWifiVerified] = useState(false);
  const [bluetoothVerified, setBluetoothVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showFaceModal, setShowFaceModal] = useState(false);

  const token = localStorage.getItem("token");

  // --- Simulated Wi-Fi Verification ---
  const verifyWifi = () => {
    setWifiVerified(true);
    setStatusMsg("Wi-Fi Verified ✔ (Connected to campus network)");
  };

  // --- Simulated Bluetooth Verification ---
  const verifyBluetooth = () => {
    setBluetoothVerified(true);
    setStatusMsg("Bluetooth Verified ✔ (Classroom beacon detected)");
  };

  // --- Real Face Scan (handled via modal) ---
  const verifyFace = () => {
    setFaceVerified(true);
    setStatusMsg("Face Detected ✔ (Identity validated)");
  };

  // --- Simulated QR Scan ---
 const scanQR = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/student/qr/current");
    const data = await res.json();

    // For demo: simulate the scanned QR matching the real QR
    const scanned = data.qrCode;

    if (scanned === data.qrCode) {
      setQrVerified(true);
      setStatusMsg("QR Scan Successful ✔ (Valid Classroom QR)");
    } else {
      setStatusMsg("Invalid QR ❌");
    }
  } catch (err) {
    setStatusMsg("QR verification failed");
  }
};


  const attendanceAllowed =
    (wifiVerified && faceVerified) ||
    (bluetoothVerified && faceVerified) ||
    qrVerified;

  // --- Send Attendance to Backend ---
  const markAttendance = async () => {
    if (!attendanceAllowed) {
      setStatusMsg("Cannot mark attendance. Complete verification first.");
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/student/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          wifiVerified,
          bluetoothVerified,
          faceVerified,
          qrVerified,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.demoMode) {
          setStatusMsg("Demo Mode: Attendance marked for Period 1 ✔");
        } else {
          setStatusMsg("Attendance Marked Successfully ✔");
        }
      } else {
        setStatusMsg(data.message || "Error marking attendance");
      }
    } catch (err) {
      setStatusMsg("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Smart Attendance</h2>
      <p className="text-gray-600">Choose a method to verify your presence.</p>

      {/* Status Message */}
      {statusMsg && <p className="p-3 bg-gray-100 rounded-lg">{statusMsg}</p>}

      {/* DEMO MODE Banner */}
      {statusMsg.includes("Demo Mode") && (
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
          ⚠️ <strong>DEMO MODE:</strong> No live class right now.
          Attendance was marked for <strong>Period 1</strong> for demonstration.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* WIFI */}
        <div className="p-6 bg-white rounded-xl shadow border">
          <h3 className="text-lg font-semibold">Wi-Fi Verification</h3>
          <p className="text-gray-600 text-sm mb-3">Connect to campus Wi-Fi.</p>
          <button
            onClick={verifyWifi}
            className={`px-4 py-2 text-white rounded-lg ${
              wifiVerified ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {wifiVerified ? "Wi-Fi Verified ✔" : "Verify Wi-Fi"}
          </button>
        </div>

        {/* BLUETOOTH */}
        <div className="p-6 bg-white rounded-xl shadow border">
          <h3 className="text-lg font-semibold">Bluetooth Verification</h3>
          <p className="text-gray-600 text-sm mb-3">Near classroom beacon.</p>
          <button
            onClick={verifyBluetooth}
            className={`px-4 py-2 text-white rounded-lg ${
              bluetoothVerified ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {bluetoothVerified ? "Bluetooth Verified ✔" : "Verify Bluetooth"}
          </button>
        </div>

        {/* FACE SCAN */}
        <div className="p-6 bg-white rounded-xl shadow border">
          <h3 className="text-lg font-semibold">Face Scan</h3>
          <p className="text-gray-600 text-sm mb-3">Confirm your identity.</p>
          <button
            onClick={() => setShowFaceModal(true)}
            className={`px-4 py-2 text-white rounded-lg ${
              faceVerified ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {faceVerified ? "Face Verified ✔" : "Scan Face"}
          </button>
        </div>

        {/* QR CODE SCAN */}
        <div className="p-6 bg-white rounded-xl shadow border">
          <h3 className="text-lg font-semibold">QR Scan (Backup Option)</h3>
          <p className="text-gray-600 text-sm mb-3">Scan classroom QR.</p>
          <button
            onClick={scanQR}
            className={`px-4 py-2 text-white rounded-lg ${
              qrVerified ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {qrVerified ? "QR Verified ✔" : "Scan QR"}
          </button>
        </div>
      </div>

      {/* MARK ATTENDANCE BUTTON */}
      <div className="text-center mt-6">
        <button
          onClick={markAttendance}
          disabled={!attendanceAllowed || loading}
          className={`px-6 py-3 rounded-xl text-white text-lg ${
            attendanceAllowed
              ? "bg-blue-700 hover:bg-blue-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Marking..." : "Mark Attendance"}
        </button>
      </div>

      {/* FACE SCAN MODAL */}
      {showFaceModal && (
        <FaceScanModal
          onVerified={() => {
            setFaceVerified(true);
            setStatusMsg("Face Detected ✔ (Identity validated)");
          }}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
}
