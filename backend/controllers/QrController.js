import crypto from "crypto";

export const getCurrentQR = (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const interval = Math.floor(now / 30); // rotates every 30 seconds

  const raw = `VIDYATRA-${interval}`;
  const secret = crypto.createHash("sha256").update(raw).digest("hex");

  return res.json({
    qrCode: secret,
    expiresIn: 30 - (now % 30),
  });
};
