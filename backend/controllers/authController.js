import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    let isMatch = false;

    // CASE 1 — Already hashed (bcrypt always starts with "$2")
    if (user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    // CASE 2 — Plain text password (old accounts)
    else {
      if (password === user.password) {
        isMatch = true;

        // Auto-upgrade: hash password NOW and save
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();
        console.log(`Upgraded password for ${email}`);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
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
