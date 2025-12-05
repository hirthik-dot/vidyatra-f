// backend/routes/facultyProfile.js
import express from "express";
import FacultyProfile from "../models/FacultyProfile.js";

const router = express.Router();

// SAVE OR UPDATE PROFILE
router.post("/save", async (req, res) => {
  try {
    const { facultyId, data } = req.body;

    const existing = await FacultyProfile.findOne({ facultyId });

    if (existing) {
      const updated = await FacultyProfile.findOneAndUpdate(
        { facultyId },
        { $set: data },
        { new: true }
      );
      return res.json(updated);
    }

    const created = await FacultyProfile.create({
      facultyId,
      ...data
    });

    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// GET PROFILE BY FACULTY ID
router.get("/:facultyId", async (req, res) => {
  try {
    const profile = await FacultyProfile.findOne({
      facultyId: req.params.facultyId
    });

    res.json(profile || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// VERY IMPORTANT!!!
export default router;
