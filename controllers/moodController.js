const db = require("../utils/firebaseConfig");
const Mood = require("../models/moodModel");

// Get User Mood API
const getUserMood = async (req, res) => {
    try {
        const { userId } = req.params;

        const snapshot = await db.ref("mood").orderByChild("user_id").equalTo(userId).once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "Mood not found for this user" });
        }

        const moods = snapshot.val();
        const moodData = Object.values(moods)[0]; // Assuming one mood entry per user

        res.status(200).json({ message: "Mood retrieved successfully", mood: moodData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create or Update Mood API
const updateMood = async (req, res) => {
    try {
        const { userId, mood } = req.body;

        if (!userId || !mood || !Array.isArray(mood)) {
            return res.status(400).json({ message: "Invalid request body. userId and mood (array) are required." });
        }

        const snapshot = await db.ref("mood").orderByChild("user_id").equalTo(userId).once("value");

        if (snapshot.exists()) {
            // Update the existing mood log
            const moodKey = Object.keys(snapshot.val())[0];
            const updatedAt = new Date().toISOString();

            await db.ref(`mood/${moodKey}`).update({ mood, updated_at: updatedAt });

            res.status(200).json({ message: "Mood updated successfully" });
        } else {
            // Create a new mood entry
            const moodId = db.ref("mood").push().key;
            const newMood = {
                mood_id: moodId,
                user_id: userId,
                mood: mood,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            await db.ref(`mood/${moodId}`).set(newMood);

            res.status(201).json({ message: "Mood created successfully", mood: newMood });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUserMood, updateMood };
