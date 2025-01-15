const db = require("../utils/firebaseConfig");
const Journey = require("../models/journeyModel");

const createOrUpdateJourney = async (req, res) => {
  try {
    const { userId, streak, lastSessionDate, totalSessions } = req.body;

    const journeyRef = db.ref(`journey/${userId}`);
    const snapshot = await journeyRef.once("value");

    if (snapshot.exists()) {
      await journeyRef.update({ streak, last_session_date: lastSessionDate, total_sessions: totalSessions });
      return res.status(200).json({ message: "Journey updated successfully" });
    }

    const newJourney = new Journey(userId, userId, streak, lastSessionDate, totalSessions);
    await journeyRef.set(newJourney);
    res.status(201).json({ message: "Journey created successfully", journey: newJourney });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrUpdateJourney };
