import { useEffect, useRef, useState } from "react";

export default function FaceScanModal({ onVerified, onClose }) {
  const videoRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setMessage("Cannot access camera");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleVerify = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        setLoading(true);
        setMessage("");

        try {
          const formData = new FormData();
          formData.append("image", blob, "face.jpg");

          const res = await fetch(
            "http://localhost:5000/api/student/attendance/face-scan",
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + token,
              },
              body: formData,
            }
          );

          const data = await res.json();

          if (res.ok) {
            setMessage("Face matched ✅");

            // STEP 1 — Mark face as verified in Attendance page
            await onVerified();

            // STEP 2 — Give React 150ms to update UI (progress bar)
            setTimeout(() => {
              setLoading(false);
              onClose();
            }, 150);
          } else {
            setMessage(data.message || "Face did not match ❌");
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
          setMessage("Error talking to server");
          setLoading(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl border border-gray-200">

        <h2 className="text-xl font-bold text-blue-700 mb-1">Face Verification</h2>
        <p className="text-xs text-gray-500 mb-3">
          Align your face in the frame and click <b>Verify</b>.
        </p>

        <div className="relative w-full h-64 mb-3 rounded-xl overflow-hidden border">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black"
          />
        </div>

        {message && (
          <p className="text-sm text-center font-medium text-indigo-600 mb-3">
            {message}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            {loading ? "Verifying..." : "Verify Face"}
          </button>
        </div>
      </div>
    </div>
  );
}
