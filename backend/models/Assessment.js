// backend/models/Assessment.js
import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true },
    title: { type: String, required: true },

    // e.g. "CSE-A"
    className: { type: String, required: true },

    // test date / deadline
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
