// backend/middleware/AuthMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// MAIN AUTH MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

export default authMiddleware;
