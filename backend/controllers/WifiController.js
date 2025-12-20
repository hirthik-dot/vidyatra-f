import fingerprints from "../data/wifiFingerprints.json";
import { toVector } from "../utils/wifiVector.js";
import { predictClassroom } from "../utils/knnWifi.js";

export const checkWifiAuth = (req, res) => {
  try {
    console.log("=== WIFI ML AUTH CHECK START ===");

    // For debugging only
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.ip;

    const cleanIP = (ip || "").replace("::ffff:", "");
    console.log("Client IP =", cleanIP);

    /**
     * Expected request body:
     * {
     *   wifiScan: [{ bssid, rssi }, ...],
     *   scheduledClassroom: "CLASSROOM_A"
     * }
     */
    const { wifiScan, scheduledClassroom } = req.body;

    if (!wifiScan || !Array.isArray(wifiScan) || !scheduledClassroom) {
      return res.status(400).json({
        success: false,
        message: "WiFi scan or classroom missing ❌",
      });
    }

    // Convert WiFi scan → fixed-length vector
    const inputVector = toVector(wifiScan);

    // ML prediction using KNN
    const predictedClassroom = predictClassroom(
      inputVector,
      fingerprints
    );

    console.log("Predicted Classroom =", predictedClassroom);
    console.log("Scheduled Classroom =", scheduledClassroom);

    if (predictedClassroom !== scheduledClassroom) {
      return res.json({
        success: false,
        message: "Not inside scheduled classroom ❌",
        ip: cleanIP,
      });
    }

    return res.json({
      success: true,
      message: "WiFi Verified ✔ Classroom matched",
      ip: cleanIP,
    });

  } catch (err) {
    console.error("WIFI ML CHECK ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "WiFi verification failed ❌",
    });
  }
};
