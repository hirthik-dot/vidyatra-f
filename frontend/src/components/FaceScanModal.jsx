import { useEffect, useRef, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";

export default function FaceScanModal({ onVerified, onClose }) {
  const videoRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.6,
    });

    faceDetection.onResults((results) => {
      if (results.detections.length > 0) {
        setFaceDetected(true);
        setTimeout(() => {
          onVerified(); // Callback to parent
          onClose();
        }, 800);
      }
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceDetection.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-3">Scan Your Face</h2>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-xl shadow mb-3"
        />

        {faceDetected ? (
          <p className="text-green-600 font-semibold">Face Detected ✔</p>
        ) : (
          <p className="text-gray-600">Align your face inside the camera.</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
