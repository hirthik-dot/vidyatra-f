import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },  // stored as plain text

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },
    subject: {
  type: String,
  required: function () {
    return this.role === "faculty";
  },
},

    department: { type: String, default: null },
    year: { type: Number, default: null },
    className: { type: String, default: null },
    interests: { type: [String], default: [] },


  },
  { timestamps: true }
);

// ❌ Completely remove bcrypt & matchPassword
// We don't hash passwords anymore
// So no methods or hooks needed

const User = mongoose.model("User", userSchema);
export default User;
