const { db, admin, googleClient } = require("../utils/firebaseConfig");
const Journey = require("../models/journeyModel");

const createOrUpdateJourney = async (req, res) => {
  try {
    const { userId, utcOffset } = req.body;

    if (!userId || utcOffset === undefined) {
      return res.status(400).json({ error: "User ID and UTC offset are required" });
    }

    const journeyRef = db.ref(`journey/${userId}`);
    const snapshot = await journeyRef.once("value");
    const currentUTCDate = new Date().toISOString(); // Current UTC time

    if (snapshot.exists()) {
      const existingJourney = snapshot.val();

      const { streak, last_session_date } = existingJourney;

      // Convert the last session date to the user's local time
      const lastSessionDate = last_session_date
        ? new Date(last_session_date)
        : null;

      const userLocalDate = new Date(
        new Date(currentUTCDate).getTime() + utcOffset * 60 * 60 * 1000
      ).toISOString().split("T")[0]; // Local date as YYYY-MM-DD

      const lastSessionLocalDate = lastSessionDate
        ? new Date(
            new Date(lastSessionDate).getTime() + utcOffset * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0]
        : null;

      // Check if it's a new day for the user
      if (!lastSessionLocalDate || userLocalDate > lastSessionLocalDate) {
        console.log("New day session", userLocalDate, lastSessionLocalDate);
        const updatedStreak = streak + 1;

        // Update the journey in the database
        await journeyRef.update({
          streak: updatedStreak,
          last_session_date: currentUTCDate,
        });

        return res.status(200).json({
          message: "Journey updated successfully",
          streak: updatedStreak,
        });
      }

      return res
        .status(200)
        .json({ message: "Streak not updated. Same day session." });
    }

    // If no journey exists, create a new one
    const newJourney = new Journey(
      userId,
      userId,
      1, // Initial streak count
      currentUTCDate, // Set the current UTC date
      utcOffset // Store the user's UTC offset
    );
    await journeyRef.set(newJourney);

    res.status(201).json({
      message: "Journey created successfully",
      journey: newJourney,
    });
  } catch (error) {
    console.error("Error in createOrUpdateJourney:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getUserStreak = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const journeyRef = db.ref(`journey/${userId}`);
    const snapshot = await journeyRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Journey not found for this user" });
    }

    const journey = snapshot.val();
    return res.status(200).json({ streak: journey.streak });
  } catch (error) {
    console.error("Error in getUserStreak:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrUpdateJourney, getUserStreak };