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

    // Debug: what frontend sent
    console.log("Frontend sent:", email, password);

    // 1) Check user exists
    const user = await User.findOne({ email });

    // Debug: is user found?
    console.log("User found:", user);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password (user not found)" });
    }

    // Debug: show DB password
    console.log("DB password:", user.password);

    // 2) Plain text password check (NO hashing)
    if (password !== user.password) {
      return res
        .status(401)
        .json({ message: "Invalid email or password (wrong password)" });
    }

    // 3) Generate token
    const token = generateToken(user);

    // 4) Send user + token
    res.json({
      token,
      user: {
        id: user._id,
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
