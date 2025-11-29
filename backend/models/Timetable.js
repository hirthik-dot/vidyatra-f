import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true }, // Monday – Saturday

  period: Number,
  start: String,
  end: String,
  subject: String,

  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  department: String,
  year: Number,

  // free period flags
  isFreePeriod: { type: Boolean, default: false },
  teacherAbsent: { type: Boolean, default: false },
  reason: String
});

export default mongoose.model("Timetable", timetableSchema);
