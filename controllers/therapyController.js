const db = require("../utils/firebaseConfig");
const Therapy = require("../models/therapyModel");

const createTherapySession = async (req, res) => {
  try {
    const { userId, therapistId, pointsUsed, feedback } = req.body;
    const therapyId = db.ref("therapy").push().key;

    const newTherapy = new Therapy(therapyId, userId, therapistId, null, pointsUsed, feedback);

    await db.ref(`therapy/${therapyId}`).set(newTherapy);
    res.status(201).json({ message: "Therapy session recorded successfully", therapy: newTherapy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTherapySessionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.ref("therapy").orderByChild("user_id").equalTo(userId).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No therapy sessions found for this user" });
    }

    res.status(200).json(snapshot.val());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTherapySession, getTherapySessionsByUser };
