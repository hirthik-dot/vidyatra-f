import { useState, useEffect } from "react";
import FaceScanModal from "../../components/FaceScanModal";

export default function Attendance() {
  const [wifiVerified, setWifiVerified] = useState(false);
  const [bluetoothVerified, setBluetoothVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [now, setNow] = useState(new Date());
  const [graphRange, setGraphRange] = useState("today"); // today | week | month | overall

  const token = localStorage.getItem("token");

  // Live clock for UI
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Simple current period label (no random subject)
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

  // --- Face Scan (via modal) ---
  const verifyFace = () => {
    setFaceVerified(true);
    setStatusMsg("Face Detected ✔ (Identity validated)");
  };

  // --- Simulated QR Scan (route unchanged) ---
  const scanQR = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/student/qr/current");
      const data = await res.json();

      const scanned = data.qrCode; // demo: matching QR

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

  // ✅ Your infra rule: (Wi-Fi & Face) OR (BT & Face) OR QR
  const wifiPathOk = wifiVerified && faceVerified;
  const btPathOk = bluetoothVerified && faceVerified;
  const qrPathOk = qrVerified;

  const attendanceAllowed = wifiPathOk || btPathOk || qrPathOk;

  // Progress meter for this rule:
  // Step 1: Presence method (WiFi OR BT OR QR)
  // Step 2: Face (only required for WiFi or BT path)
  const presenceMethodDone = wifiVerified || bluetoothVerified || qrVerified;
  let verificationStepsDone = 0;
  const totalSteps = 2;

  if (presenceMethodDone) verificationStepsDone += 1;

  // Face is needed only if using WiFi/BT and not QR
  const needsFaceForPath =
    (wifiVerified || bluetoothVerified) && !qrVerified;

  if (qrVerified) {
    // QR alone completes full path
    verificationStepsDone = 2;
  } else if (needsFaceForPath && faceVerified) {
    verificationStepsDone = 2;
  }

  const verificationPercent = Math.round(
    (verificationStepsDone / totalSteps) * 100
  );

  const getPathLabel = () => {
    if (qrPathOk) return "QR-only Path Active";
    if (wifiPathOk) return "Wi-Fi + Face Path Active";
    if (btPathOk) return "Bluetooth + Face Path Active";
    if (wifiVerified || bluetoothVerified)
      return "Face verification pending for this path";
    if (presenceMethodDone) return "Presence verified – select a valid path";
    return "No verification started yet";
  };

  // --- Send Attendance to Backend (route unchanged) ---
  const markAttendance = async () => {
    if (!attendanceAllowed) {
      setStatusMsg("Cannot mark attendance. Complete a valid verification path first.");
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/student/attendance/mark",
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
          setStatusMsg("Demo Mode: Attendance marked for current period ✔");
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

  // Fake attendance stats (UI only – can be wired to backend later)
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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-700">
            Smart Attendance
          </h2>
          <p className="text-gray-600 mt-1">
            Multi-layer, tamper-resistant attendance using Wi-Fi, Bluetooth, Face and QR.
          </p>
        </div>

        {/* Current Period + Faculty */}
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 px-4 py-3 flex flex-col md:min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-gray-500">
              Current Period
            </span>
            <span className="text-xs text-gray-400">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="mt-1">
            <p className="font-semibold text-blue-700">
              {currentPeriodLabel}
            </p>
            <p className="text-sm text-gray-600">
              Class: CSE-A
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Faculty:&nbsp;
              <span className="font-medium">
                Dr. Arjun Kumar
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* STATUS MESSAGE */}
      {statusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
          {statusMsg}
        </div>
      )}

      {/* DEMO MODE BANNER */}
      {statusMsg.includes("Demo Mode") && (
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 text-sm">
          ⚠️ <strong>DEMO MODE:</strong> No live class right now.
          Attendance was marked for the current period for demonstration.
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: VERIFICATION PANEL */}
        <div className="xl:col-span-2 space-y-4">
          {/* Verification summary + progress */}
          <div className="bg-white rounded-2xl shadow-md border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Verification Path Status
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Valid paths:&nbsp;
                <span className="font-medium text-gray-700">
                  (Wi-Fi + Face) OR (Bluetooth + Face) OR QR
                </span>
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                {getPathLabel()}
              </p>
            </div>
            <div className="w-full md:w-60">
              <div className="flex items-center justify-between mb-1 text-xs text-gray-500">
                <span>{verificationStepsDone} / {totalSteps} steps complete</span>
                <span>{verificationPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all"
                  style={{ width: `${verificationPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Verification methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WIFI */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">Wi-Fi Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Confirm you are on the secure campus Wi-Fi network.
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    wifiVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {wifiVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <button
                onClick={verifyWifi}
                className={`w-full px-4 py-2 text-sm font-semibold rounded-lg ${
                  wifiVerified
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition`}
              >
                {wifiVerified ? "Wi-Fi Verified ✔" : "Verify via Wi-Fi"}
              </button>
            </div>

            {/* BLUETOOTH */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">Bluetooth Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Prove you are physically near the classroom beacon.
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    bluetoothVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {bluetoothVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <button
                onClick={verifyBluetooth}
                className={`w-full px-4 py-2 text-sm font-semibold rounded-lg ${
                  bluetoothVerified
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition`}
              >
                {bluetoothVerified ? "Bluetooth Verified ✔" : "Verify via Bluetooth"}
              </button>
            </div>

            {/* FACE SCAN */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">Face Scan</h3>
                  <p className="text-gray-600 text-sm">
                    Use camera-based identity verification mapped to student data.
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    faceVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {faceVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <button
                onClick={() => setShowFaceModal(true)}
                className={`w-full px-4 py-2 text-sm font-semibold rounded-lg ${
                  faceVerified
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition`}
              >
                {faceVerified ? "Face Verified ✔" : "Scan Face"}
              </button>
            </div>

            {/* QR CODE */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">QR Scan (Backup)</h3>
                  <p className="text-gray-600 text-sm">
                    Scan the session-specific QR displayed in the classroom.
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    qrVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {qrVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <button
                onClick={scanQR}
                className={`w-full px-4 py-2 text-sm font-semibold rounded-lg ${
                  qrVerified
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition`}
              >
                {qrVerified ? "QR Verified ✔" : "Scan QR"}
              </button>
            </div>
          </div>

          {/* MARK ATTENDANCE BUTTON */}
          <div className="text-center mt-4">
            <button
              onClick={markAttendance}
              disabled={!attendanceAllowed || loading}
              className={`px-8 py-3 rounded-2xl text-white text-base font-semibold shadow-md ${
                attendanceAllowed
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              } transition`}
            >
              {loading ? "Marking..." : "Mark Attendance for Current Period"}
            </button>
            {!attendanceAllowed && (
              <p className="mt-1 text-xs text-gray-500">
                Complete a valid verification path to enable this button.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: ATTENDANCE INSIGHTS / GRAPH */}
        <div className="bg-white rounded-2xl shadow-md border p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Attendance Insights
              </p>
              <p className="text-xs text-gray-500">
                Visual snapshot of your consistency across periods.
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Analytics
            </span>
          </div>

          {/* RANGE TABS */}
          <div className="flex gap-2 mt-1">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "Last 7 Days" },
              { key: "month", label: "Last 30 Days" },
              { key: "overall", label: "All Time" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setGraphRange(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  graphRange === tab.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* BIG PERCENT + STATS */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-4xl font-bold text-blue-700">
                {currentPercent}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentStats.attended} / {currentStats.total} periods attended
              </p>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600 transition-all"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Higher percentage indicates better consistency for the selected range.
              </p>
            </div>
          </div>

          {/* MINI DAY-WISE BARS (demo data) */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-600 mb-1">
              Day-wise trend (sample)
            </p>
            <div className="flex items-end gap-1 h-24">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                const heights = [90, 70, 80, 60, 95, 50, 40]; // demo heights
                return (
                  <div
                    key={day + idx}
                    className="flex flex-col items-center justify-end flex-1"
                  >
                    <div
                      className="w-3 rounded-t-lg bg-blue-500/80"
                      style={{ height: `${heights[idx]}%` }}
                    />
                    <span className="mt-1 text-[10px] text-gray-500">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FACE SCAN MODAL */}
      {showFaceModal && (
        <FaceScanModal
          onVerified={() => {
            verifyFace();
            setShowFaceModal(false);
          }}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
}
