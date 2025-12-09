import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // ⚠️ PLAIN EMAIL — legacy only (NOT required anymore)
    email: { type: String, required: false, unique: false },

    // 🔐 NEW: Encrypted email
    emailEnc: { type: String, required: false },

    // 🔑 NEW: Hash for fast lookup (sha256(email))
    emailHash: { type: String, required: false, unique: true, sparse: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },

    // FACULTY ONLY
    subject: {
      type: String,
      required: function () {
        return this.role === "faculty";
      },
    },

    // STUDENT ONLY
    department: { type: String, default: null },
    year: { type: Number, default: null },
    className: { type: String, default: null },
    interests: { type: [String], default: [] },

    // ⭐ XP SYSTEM
    totalXP: {
      type: Number,
      default: 0,
    },
    completedGames: {
      type: [String],
      default: [],
    },

    faceEmbedding: {
      type: [Number],
      default: null,
    },
    faceRegistered: {
      type: Boolean,
      default: false,
    },

    // CLASS ADVISOR FOR STUDENTS
    classAdvisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Add index to avoid duplicate hash errors on empty/null
userSchema.index({ emailHash: 1 }, { unique: true, sparse: true });

const User = mongoose.model("User", userSchema);
export default User;
