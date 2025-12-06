// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("FRONTEND SENT:", email, password);

    // Check user
    const user = await User.findOne({ email });

    console.log("FOUND USER:", user);

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (password !== user.password)
      return res.status(401).json({ message: "Invalid email or password" });

    // JWT
    const token = generateToken(user);

    // Send BOTH id and _id for safety
    res.json({
      token,
      user: {
        _id: user._id,     // ALWAYS EXISTS
        id: user._id,      // Fallback
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
