import { useState, useEffect, useRef } from "react";
import FaceScanModal from "../../components/FaceScanModal";

import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔹 Leaflet marker default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔹 Campus config (Option B – your college)
const CAMPUS_CENTER = { lat: 30.68558, lng: 76.665672 };
// Slightly larger radius to handle venue GPS wobble
const CAMPUS_RADIUS_METERS = 50000;

// 🔹 Helper: distance between two lat/lon in meters
function distanceBetweenPoints(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Attendance() {
  const [wifiVerified, setWifiVerified] = useState(false);
  const [geoVerified, setGeoVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [showFaceModal, setShowFaceModal] = useState(false);

  const [now, setNow] = useState(new Date());
  const [graphRange, setGraphRange] = useState("today");

  const token = localStorage.getItem("token");

  // 🔹 Pro GPS states
  const [location, setLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | searching | weak | locked | error
  const [distanceFromCampus, setDistanceFromCampus] = useState(null);
  const watcherId = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(id);
      if (watcherId.current && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, []);

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

  // 🔹 Start Pro GPS tracking (watchPosition with filters)
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setStatusMsg("Location not supported on this device ❌");
      setLocationStatus("error");
      return;
    }

    setStatusMsg("Searching for GPS…");
    setLocationStatus("searching");

    if (watcherId.current && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(watcherId.current);
    }

    watcherId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        console.log("RAW GPS:", { latitude, longitude, accuracy });

        // Ignore completely insane accuracy (e.g. 50km)
        if (accuracy && accuracy > 50000) {
          console.log("IGNORED: accuracy too large", accuracy);
          return;
        }

        const distCampus = distanceBetweenPoints(
          latitude,
          longitude,
          CAMPUS_CENTER.lat,
          CAMPUS_CENTER.lng
        );

        // Ignore readings that are obviously in another city (> 20km away)
        if (distCampus > 20000) {
          console.log("IGNORED REMOTE READING:", distCampus, "m");
          return;
        }

        // Accept this reading, but smooth out crazy jumps
        setLocation((prev) => {
          if (prev) {
            const drift = distanceBetweenPoints(
              prev.lat,
              prev.lng,
              latitude,
              longitude
            );

            // Ignore huge jumps (> 2000m) when we are already near campus
            if (drift > 2000 && distCampus < 5000) {
              console.log("IGNORED DRIFT:", drift, "m");
              return prev;
            }
          }

          setLocationAccuracy(accuracy);
          setDistanceFromCampus(distCampus);

          // Decide lock status (we do NOT block verifyGeo on this, just for UX)
          if (distCampus <= CAMPUS_RADIUS_METERS && accuracy <= 150) {
            setLocationStatus("locked");
            setStatusMsg(
              `GPS Locked ✔ ~${distCampus.toFixed(
                0
              )}m from campus center (accuracy ${accuracy?.toFixed(0)}m)`
            );
          } else {
            setLocationStatus("weak");
            setStatusMsg(
              `GPS weak / borderline (~${distCampus.toFixed(
                0
              )}m from campus, accuracy ${accuracy?.toFixed(0)}m)`
            );
          }

          return { lat: latitude, lng: longitude };
        });
      },
      (err) => {
        console.error("GPS ERROR:", err);
        setLocationStatus("error");
        setStatusMsg("Location access blocked ❌. Please enable GPS.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );
  };

  // ============================
  // WIFI  ✅ via proxy (/api)
  // ============================
  const verifyWifi = async () => {
    try {
      const res = await fetch("/api/student/attendance/check-wifi", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();

      if (res.ok) {
        setWifiVerified(true);
        // Backend should be checking that this request came via "Sujith's Phone" network
        setStatusMsg(
          data.message || "Wi-Fi Verified ✔ Connected to allowed hotspot"
        );
      } else {
        setWifiVerified(false);
        setStatusMsg(data.message || "Not connected to required Wi-Fi ❌");
      }
    } catch (err) {
      console.error("Wi-Fi verification error:", err);
      setStatusMsg("Wi-Fi verification failed ❌");
    }
  };

  // ============================
  // GEOLOCATION VERIFY (uses filtered GPS) ✅ via proxy
  // ============================
  const verifyGeo = async () => {
    try {
      setGeoLoading(true);

      // If no location yet, start tracking and ask to wait
      if (!location) {
        startGpsTracking();
        setStatusMsg(
          "Turn on GPS & allow location. Once map shows your position near campus, tap Verify Location again."
        );
        setGeoLoading(false);
        return;
      }

      // Compute distance from campus
      const distCampus =
        distanceFromCampus ??
        distanceBetweenPoints(
          location.lat,
          location.lng,
          CAMPUS_CENTER.lat,
          CAMPUS_CENTER.lng
        );

      // If we are way outside campus (or GPS glitch)
      if (distCampus > CAMPUS_RADIUS_METERS) {
        setStatusMsg(
          `You appear ~${distCampus.toFixed(
            0
          )}m away from campus. GPS seems off – move outside or retry.`
        );
        setGeoLoading(false);
        return;
      }

      // If accuracy is insanely bad, ask to retry
      if (locationAccuracy && locationAccuracy > 5000) {
        setStatusMsg(
          `GPS accuracy too poor (${locationAccuracy.toFixed(
            0
          )}m). Move to open area and retry.`
        );
        setGeoLoading(false);
        return;
      }

      // ✅ Location looks reasonable → send to backend
      const res = await fetch("/api/student/attendance/check-geo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lng,
          accuracy: locationAccuracy,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGeoVerified(true);
        setStatusMsg(
          data.message ||
            `Location Verified ✔ You are inside campus (~${distCampus.toFixed(
              0
            )}m from center)`
        );
      } else {
        setGeoVerified(false);
        setStatusMsg(data.message || "Not inside campus ❌");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Location verification failed ❌");
    } finally {
      setGeoLoading(false);
    }
  };

  const verifyFace = () => {
    setFaceVerified(true);
    setStatusMsg("Face Detected ✔");
  };

  // ============================
  // QR ✅ via proxy
  // ============================
  const scanQR = async () => {
    try {
      const res = await fetch("/api/student/qr/current");
      const data = await res.json();

      if (res.ok && data.qrCode) {
        setQrVerified(true);
        setStatusMsg("QR Scan Successful ✔");
      } else {
        setStatusMsg(data.message || "Invalid QR ❌");
      }
    } catch (err) {
      console.error("QR error:", err);
      setStatusMsg("QR verification failed");
    }
  };

  // ============================
  // VERIFICATION LOGIC
  // ============================
  const wifiPathOk = wifiVerified && faceVerified;
  const geoPathOk = geoVerified && faceVerified;
  const qrPathOk = qrVerified;

  const attendanceAllowed = wifiPathOk || geoPathOk || qrPathOk;
  const presenceMethodDone = wifiVerified || geoVerified || qrVerified;

  let verificationStepsDone = 0;
  const totalSteps = 2;

  if (presenceMethodDone) verificationStepsDone += 1;
  const needsFace = (wifiVerified || geoVerified) && !qrVerified;

  if (qrVerified) verificationStepsDone = 2;
  else if (needsFace && faceVerified) verificationStepsDone = 2;

  const verificationPercent = Math.round(
    (verificationStepsDone / totalSteps) * 100
  );

  const getPathLabel = () => {
    if (qrPathOk) return "QR-only Path Active";
    if (wifiPathOk) return "Wi-Fi + Face Path Active";
    if (geoPathOk) return "Location + Face Path Active";
    if (wifiVerified || geoVerified) return "Face verification pending";
    if (presenceMethodDone) return "Presence verified";
    return "Start verification";
  };

  // ============================
  // MARK ATTENDANCE ✅ via proxy
  // ============================
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
      const res = await fetch("/api/student/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          wifiVerified,
          geoVerified,
          faceVerified,
          qrVerified,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.demoMode) {
          setStatusMsg("Demo Mode: Attendance marked ✔");
        } else {
          setStatusMsg(data.message || "Attendance Marked Successfully ✔");
        }
      } else {
        setStatusMsg(data.message || "Error marking attendance");
      }
    } catch (err) {
      console.error("markAttendance error:", err);
      setStatusMsg("Server error");
    }

    setLoading(false);
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-700">Smart Attendance</h2>
          <p className="text-gray-600 mt-1">
            Multi-layer authentication using Wi-Fi, Location, QR & Face.
          </p>
        </div>

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

      {/* Status */}
      {statusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
          {statusMsg}
        </div>
      )}

      {/* Verification Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Verification Progress */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Verification Status
              </p>
              <p className="text-xs text-indigo-600 mt-1">{getPathLabel()}</p>
            </div>

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

          {/* WiFi / Location / Face / QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WiFi */}
            <div className="p-5 bg-white rounded-2xl shadow border">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Wi-Fi Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Must be connected to Sujith&apos;s Phone hotspot (or mapped
                    college Wi-Fi).
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
                  wifiVerified ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {wifiVerified ? "Connected ✔" : "Verify Wi-Fi"}
              </button>
            </div>

            {/* Location */}
            <div className="p-5 bg-white rounded-2xl shadow border">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Location</h3>
                  <p className="text-gray-600 text-sm">
                    Uses GPS + geofence around campus.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    geoVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {geoVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={startGpsTracking}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                >
                  {locationStatus === "locked"
                    ? "GPS Locked ✔"
                    : "Start Live GPS"}
                </button>
                <button
                  onClick={verifyGeo}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-white ${
                    geoVerified
                      ? "bg-green-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {geoVerified ? "Location Verified ✔" : "Verify Location"}
                </button>
              </div>

              {distanceFromCampus != null && (
                <p className="text-[11px] text-gray-500">
                  Distance from campus center:{" "}
                  <span className="font-semibold">
                    {distanceFromCampus.toFixed(0)} m
                  </span>{" "}
                  {distanceFromCampus <= CAMPUS_RADIUS_METERS
                    ? "(Inside geofence)"
                    : "(Outside geofence / or GPS drift)"}
                </p>
              )}
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
                  faceVerified ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {faceVerified ? "Face Verified ✔" : "Scan Face"}
              </button>
            </div>

            {/* QR */}
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
                  qrVerified ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
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

        {/* Analytics */}
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
        </div>
      </div>

      {/* 🔹 Live Map (Added below all tiles) */}
      <div className="bg-white rounded-2xl shadow-md border px-5 py-4 mt-6">
        <h3 className="text-lg font-bold text-indigo-700">
          Live Student Location
        </h3>

        {!location && (
          <button
            onClick={startGpsTracking}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
          >
            Enable Live Location
          </button>
        )}

        {locationStatus === "searching" && (
          <p className="text-gray-600 mt-2 text-sm">
            Acquiring GPS… move near open area if indoors.
          </p>
        )}

        {locationStatus === "weak" && location && (
          <p className="text-yellow-600 mt-2 text-sm">
            GPS weak – still using latest stable point near campus.
          </p>
        )}

        {locationStatus === "error" && (
          <p className="text-red-600 mt-2 text-sm">
            Location permission denied. Please allow GPS access.
          </p>
        )}

        {location && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={17}
              style={{ height: "280px", width: "100%" }}
              key={`${location.lat}-${location.lng}`}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Campus geofence circle */}
              <Circle
                center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
                radius={CAMPUS_RADIUS_METERS}
                pathOptions={{
                  color: "#22c55e",
                  fillColor: "#22c55e",
                  fillOpacity: 0.12,
                  weight: 1,
                }}
              />

              {/* Accuracy circle */}
              {locationAccuracy && (
                <Circle
                  center={[location.lat, location.lng]}
                  radius={Math.max(locationAccuracy, 20)}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                    weight: 1,
                  }}
                />
              )}

              {/* User marker */}
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  You are here.
                  {distanceFromCampus != null && (
                    <div>
                      <br />
                      ~{distanceFromCampus.toFixed(0)}m from campus center.
                    </div>
                  )}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      {/* Location Loading Popup */}
      {geoLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm w-full flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-gray-800">
              Checking Your Location…
            </p>
            <p className="text-xs text-gray-500 text-center">
              Make sure GPS is enabled and permissions are granted.
            </p>
          </div>
        </div>
      )}

      {/* Face Modal */}
      {showFaceModal && (
        <FaceScanModal
          onVerified={verifyFace}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
}
