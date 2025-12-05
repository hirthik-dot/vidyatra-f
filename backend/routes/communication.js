const express = require('express');
const router = express.Router();

const BroadcastMessage = require('../models/BroadcastMessage');
const PrivateMessage = require('../models/PrivateMessage');
const User = require('../models/User');


/* =========================
   1) BROADCAST MESSAGES
========================= */

router.post('/broadcast', async (req, res) => {
  try {
    const { facultyId, title, body } = req.body;

    const newBroadcast = await BroadcastMessage.create({
      title,
      body,
      faculty: facultyId,
    });

    res.status(201).json(newBroadcast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating broadcast' });
  }
});

router.get('/broadcast/student', async (req, res) => {
  try {
    const broadcasts = await BroadcastMessage.find()
      .sort({ createdAt: -1 })
      .populate('faculty', 'name');

    res.json(broadcasts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching broadcasts' });
  }
});


/* =========================
   2) STUDENT LIST
========================= */

router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('_id name email department className');

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching students' });
  }
});


/* =========================
   3) PRIVATE MESSAGES
========================= */

// FACULTY -> STUDENT
router.post('/private/faculty', async (req, res) => {
  try {
    const { facultyId, studentId, body } = req.body;

    const newMessage = new PrivateMessage({
      from: facultyId,
      to: studentId,
      body,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending private message:", err);
    res.status(500).json({ message: 'Error sending private message' });
  }
});


// STUDENT -> FACULTY
router.post('/private/student', async (req, res) => {
  try {
    const { studentId, facultyId, body } = req.body;

    const newMessage = new PrivateMessage({
      from: studentId,
      to: facultyId,
      body,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending reply:", err);
    res.status(500).json({ message: 'Error sending reply' });
  }
});


// GET ALL messages for student panel
router.get('/private/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const messages = await PrivateMessage.find({
      $or: [
        { from: studentId },
        { to: studentId },
      ],
    })
      .populate('from', 'name role')
      .populate('to', 'name role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching student messages:", err);
    res.status(500).json({ message: 'Error fetching student private messages' });
  }
});


// GET FULL CONVERSATION (needed to show messages on click)
router.get('/private/conversation', async (req, res) => {
  try {
    const { facultyId, studentId } = req.query;

    const messages = await PrivateMessage.find({
      $or: [
        { from: facultyId, to: studentId },
        { from: studentId, to: facultyId },
      ],
    })
      .populate('from', 'name role')
      .populate('to', 'name role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching full conversation:", err);
    res.status(500).json({ message: 'Error fetching full conversation' });
  }
});


module.exports = router;
