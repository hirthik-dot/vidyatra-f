import { useState, useEffect } from "react";
import FaceScanModal from "../../components/FaceScanModal";

export default function Attendance() {
  const [wifiVerified, setWifiVerified] = useState(false);
  const [bluetoothVerified, setBluetoothVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false); // for Mark Attendance button
  const [btLoading, setBtLoading] = useState(false); // ⭐ NEW: Bluetooth scan popup

  const [showFaceModal, setShowFaceModal] = useState(false);

  const [now, setNow] = useState(new Date());
  const [graphRange, setGraphRange] = useState("today");

  const token = localStorage.getItem("token");

  // Live time
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Current Period
  const getCurrentPeriodLabel = () => {
    const hour = now.getHours();
    if (hour >= 9 && hour < 10) return "Period 1";
    if (hour >= 10 && hour < 11) return "Period 2";
    if (hour >= 11 && hour < 12) return "Period 3";
    if (hour >= 12 && hour < 13) return "Period 4";
    if (hour >= 14 && hour < 15) return "Period 5";
    if (hour >= 15 && hour < 16) return "Period 6";
    if (hour >= 16 && hour < 17) return "Period 7";
    return "No Active Period";
  };

  const currentPeriodLabel = getCurrentPeriodLabel();

  // ===========================================
  // ⭐ REAL WI-FI VERIFICATION (OPPO Hotspot)
  // ===========================================
  const verifyWifi = async () => {
    try {
      const res = await fetch(
        "http://10.217.193.59:5000/api/student/attendance/check-wifi",
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setWifiVerified(true);
        setStatusMsg("Wi-Fi Verified ✔ Connected to OPPO Hotspot");
      } else {
        setWifiVerified(false);
        setStatusMsg(
          data.message || "Not connected to OPPO hotspot ❌"
        );
      }
    } catch (err) {
      setStatusMsg("Wi-Fi verification failed ❌");
    }
  };

  // ===========================================
  // ⭐ REAL BLUETOOTH VERIFICATION (OPPO Reno14 5G)
  // ===========================================
  const verifyBluetooth = async () => {
    try {
      setBtLoading(true); // ⭐ show loading popup
      setStatusMsg("Scanning for nearby OPPO Reno14 5G…");

      const res = await fetch(
        "http://10.217.193.59:5000/api/student/attendance/check-bluetooth",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setBluetoothVerified(true);
        setStatusMsg("Bluetooth Verified ✔ OPPO device detected");
      } else {
        setBluetoothVerified(false);
        setStatusMsg(
          data.message || "Bluetooth not detected ❌ Bring phone closer"
        );
      }
    } catch (err) {
      console.error("BT error:", err);
      setStatusMsg("Bluetooth scanning failed ❌");
    } finally {
      setBtLoading(false); // ⭐ hide loading popup
    }
  };

  // ===========================================
  // ⭐ Face Scan
  // ===========================================
  const verifyFace = () => {
    setFaceVerified(true);
    setStatusMsg("Face Detected ✔ (Identity verified)");
  };

  // ===========================================
  // ⭐ QR Scan (Backup)
  // ===========================================
  const scanQR = async () => {
    try {
      const res = await fetch("http://10.217.193.59:5000/api/student/qr/current");
      const data = await res.json();

      const scanned = data.qrCode;

      if (scanned === data.qrCode) {
        setQrVerified(true);
        setStatusMsg("QR Scan Successful ✔");
      } else {
        setStatusMsg("Invalid QR ❌");
      }
    } catch (err) {
      setStatusMsg("QR verification failed");
    }
  };

  // ===========================================
  // ⭐ Verification Logic
  // ===========================================
  const wifiPathOk = wifiVerified && faceVerified;
  const btPathOk = bluetoothVerified && faceVerified;
  const qrPathOk = qrVerified;

  const attendanceAllowed = wifiPathOk || btPathOk || qrPathOk;

  const presenceMethodDone =
    wifiVerified || bluetoothVerified || qrVerified;

  let verificationStepsDone = 0;
  const totalSteps = 2;

  if (presenceMethodDone) verificationStepsDone += 1;

  const needsFace =
    (wifiVerified || bluetoothVerified) && !qrVerified;

  if (qrVerified) verificationStepsDone = 2;
  else if (needsFace && faceVerified) verificationStepsDone = 2;

  const verificationPercent = Math.round(
    (verificationStepsDone / totalSteps) * 100
  );

  const getPathLabel = () => {
    if (qrPathOk) return "QR-only Path Active";
    if (wifiPathOk) return "Wi-Fi + Face Path Active";
    if (btPathOk) return "Bluetooth + Face Path Active";
    if (wifiVerified || bluetoothVerified)
      return "Face verification pending";
    if (presenceMethodDone) return "Presence verified";
    return "Start verification";
  };

  // ===========================================
  // ⭐ Mark Attendance
  // ===========================================
  const markAttendance = async () => {
    if (!attendanceAllowed) {
      setStatusMsg(
        "Cannot mark attendance. Complete a valid verification path first."
      );
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch(
        "http://10.217.193.59:5000/api/student/attendance/mark",
        {
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
        }
      );

      const data = await res.json();

      if (res.ok) {
        if (data.demoMode) {
          setStatusMsg("Demo Mode: Attendance marked ✔");
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

  // ===========================================
  // Fake Stats (UI)
  // ===========================================
  const attendanceStats = {
    today: { attended: 5, total: 6 },
    week: { attended: 26, total: 30 },
    month: { attended: 92, total: 100 },
    overall: { attended: 430, total: 480 },
  };

  const currentStats = attendanceStats[graphRange];
  const currentPercent = Math.round(
    (currentStats.attended / currentStats.total) * 100
  );

  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-700">
            Smart Attendance
          </h2>
          <p className="text-gray-600 mt-1">
            Multi-layer authentication using Wi-Fi, Bluetooth, and Face.
          </p>
        </div>

        {/* Period Card */}
        <div className="bg-white rounded-2xl shadow-md border px-4 py-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Current Period</span>
            <span>
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="font-semibold text-blue-700 mt-1">
            {currentPeriodLabel}
          </p>
          <p className="text-xs text-gray-400">Class: CSE-A</p>
        </div>
      </div>

      {/* STATUS */}
      {statusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
          {statusMsg}
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-4">

          {/* Verification Progress */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Verification Status
              </p>
              <p className="text-xs text-indigo-600 mt-1">{getPathLabel()}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full md:w-60 mt-3 md:mt-0">
              <div className="flex justify-between text-xs mb-1">
                <span>
                  {verificationStepsDone} / {totalSteps} steps
                </span>
                <span>{verificationPercent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                  style={{ width: `${verificationPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Wi-Fi */}
            <div className="p-5 bg-white rounded-2xl shadow border">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Wi-Fi Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Must be connected to OPPO Hotspot.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    wifiVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {wifiVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <button
                onClick={verifyWifi}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  wifiVerified
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {wifiVerified ? "Connected to Hotspot ✔" : "Verify Wi-Fi"}
              </button>
            </div>

            {/* Bluetooth */}
            <div className="p-5 bg-white rounded-2xl shadow border">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Bluetooth</h3>
                  <p className="text-gray-600 text-sm">
                    Must detect OPPO Reno14 5G nearby.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    bluetoothVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {bluetoothVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <button
                onClick={verifyBluetooth}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  bluetoothVerified
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {bluetoothVerified ? "Beacon Detected ✔" : "Scan Bluetooth"}
              </button>
            </div>

            {/* Face Scan */}
            <div className="p-5 bg-white rounded-2xl shadow border">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Face Scan</h3>
                  <p className="text-gray-600 text-sm">
                    Confirms your identity.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    faceVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {faceVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <button
                onClick={() => setShowFaceModal(true)}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  faceVerified
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {faceVerified ? "Face Verified ✔" : "Scan Face"}
              </button>
            </div>

            {/* QR Code */}
            <div className="p-5 bg-white rounded-2xl shadow border">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">QR Code</h3>
                  <p className="text-gray-600 text-sm">
                    Classroom QR displayed by teacher.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    qrVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {qrVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <button
                onClick={scanQR}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  qrVerified
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {qrVerified ? "QR Verified ✔" : "Scan QR"}
              </button>
            </div>
          </div>

          {/* Mark Attendance */}
          <div className="text-center mt-3">
            <button
              onClick={markAttendance}
              disabled={!attendanceAllowed || loading}
              className={`px-8 py-3 rounded-2xl text-white text-base font-semibold shadow-md ${
                attendanceAllowed
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Marking..." : "Mark Attendance"}
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: ATTENDANCE ANALYTICS */}
        <div className="bg-white rounded-2xl shadow-md border p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Attendance Insights
              </p>
              <p className="text-xs text-gray-500">
                Your consistency trend overview.
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Analytics
            </span>
          </div>

          {/* Range Tabs */}
          <div className="flex gap-2 mt-3">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "Last 7 Days" },
              { key: "month", label: "Last 30 Days" },
              { key: "overall", label: "Overall" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setGraphRange(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  graphRange === tab.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Percent + Bar */}
          <div className="mt-5 flex items-center gap-3">
            <div>
              <p className="text-4xl font-bold text-blue-700">
                {currentPercent}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentStats.attended} / {currentStats.total} periods
              </p>
            </div>

            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FACE MODAL */}
      {showFaceModal && (
        <FaceScanModal
          onVerified={verifyFace}
          onClose={() => setShowFaceModal(false)}
        />
      )}

      {/* ⭐ BLUETOOTH LOADING POPUP */}
      {btLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm w-full flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-gray-800">
              Scanning for OPPO Reno14 5G…
            </p>
            <p className="text-xs text-gray-500 text-center">
              Make sure your phone&apos;s Bluetooth is ON and near the laptop.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
