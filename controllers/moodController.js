const db = require("../utils/firebaseConfig");
const Mood = require("../models/moodModel");

const logMood = async (req, res) => {
  try {
    const { userId, mood } = req.body;
    const moodId = db.ref("mood").push().key;

    const newMood = new Mood(moodId, userId, null, mood);

    await db.ref(`mood/${moodId}`).set(newMood);
    res.status(201).json({ message: "Mood logged successfully", mood: newMood });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMoodLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.ref("mood").orderByChild("user_id").equalTo(userId).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No mood logs found for this user" });
    }

    res.status(200).json(snapshot.val());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { logMood, getMoodLogsByUser };
