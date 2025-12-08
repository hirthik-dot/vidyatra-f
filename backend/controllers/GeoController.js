// backend/controllers/GeoController.js

export const checkGeoAuth = async (req, res) => {
  try {
    const { lat, lon, accuracy } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Location missing ❌" });
    }

    // ================================
    // ⭐ OFFICIAL CAMPUS CENTER POINT
    // Replace with YOUR campus center
    // ================================
    const CAMPUS_LAT = 30.681063;   // ⭐ your coords
    const CAMPUS_LON = 76.669967;   // ⭐ your coords

    // ================================
    // ⭐ ALLOW BIGGER CAMPUS RADIUS
    // Indoor WiFi → 80–200m error
    // ================================
    const MAX_RADIUS_METERS = 350;  // ⭐ works safely

    // ================================
    // Haversine distance formula
    // ================================
    const toRad = (x) => (x * Math.PI) / 180;

    const R = 6371000;
    const dLat = toRad(lat - CAMPUS_LAT);
    const dLon = toRad(lon - CAMPUS_LON);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(CAMPUS_LAT)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    console.log("USER LAT:", lat);
    console.log("USER LON:", lon);
    console.log("Distance from campus:", Math.round(distance), "meters");
    console.log("Accuracy:", accuracy);

    if (distance <= MAX_RADIUS_METERS) {
      return res.json({
        success: true,
        message: "Inside campus ✔",
        distance: Math.round(distance),
      });
    }

    return res.status(403).json({
      success: false,
      message: "You are outside campus zone ❌",
      distance: Math.round(distance),
    });
  } catch (err) {
    console.error("Geo Auth Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during geo verification",
    });
  }
};
