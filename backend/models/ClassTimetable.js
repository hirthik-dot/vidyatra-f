import mongoose from "mongoose";

const periodSchema = new mongoose.Schema({
  period: { type: Number, required: true }, // 1–6
  start: { type: String, required: true },
  end: { type: String, required: true },
  subject: { type: String, required: true },

  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  isFreePeriod: { type: Boolean, default: false },
  teacherAbsent: { type: Boolean, default: false },

  substituteFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const classTimetableSchema = new mongoose.Schema({
  className: { type: String, required: true }, // e.g. "CSE-A"
  day: { type: String, required: true },       // Monday, Tuesday...
  periods: [periodSchema],
});

export default mongoose.model("ClassTimetable", classTimetableSchema);
