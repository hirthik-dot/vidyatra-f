export const checkWifiAuth = (req, res) => {
  console.log("RAW IP logs:");
  console.log("req.ip =>", req.ip);
  console.log("connection.remoteAddress =>", req.connection.remoteAddress);
  console.log("headers['x-forwarded-for'] =>", req.headers['x-forwarded-for']);

  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.ip;

  const cleanIP = ip.replace("::ffff:", "");

  console.log("CLEAN IP =>", cleanIP);

  const allowedRanges = ["10.217.193."];

  const isValid = allowedRanges.some(prefix =>
    cleanIP.startsWith(prefix)
  );

  if (!isValid) {
    return res.status(403).json({
      success: false,
      message: "Not connected to authorized hotspot ❌",
      ip: cleanIP,       // 👈 Return what backend sees
    });
  }

  return res.json({
    success: true,
    message: "Connected to Authorized Hotspot ✔",
    ip: cleanIP,        // 👈 Return what backend sees
  });
};
