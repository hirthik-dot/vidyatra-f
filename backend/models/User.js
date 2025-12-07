import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true }, // plain text

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

     faceEmbedding: {
      type: [Number], // 512-length embedding
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

const User = mongoose.model("User", userSchema);
export default User;
