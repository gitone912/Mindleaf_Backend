const { db, admin, googleClient } = require("../utils/firebaseConfig");
const Settings = require("../models/settingsModel");

const createOrUpdateSettings = async (req, res) => {
    try {
        const { userId, voiceType, language, therapyType } = req.body;

        const settingsRef = db.ref(`settings/${userId}`);
        const snapshot = await settingsRef.once("value");

        if (snapshot.exists()) {
            const updatedSettings = {
                voice_type: voiceType,
                language,
                therapy_type: therapyType,
                updated_at: new Date().toISOString()
            };
            await settingsRef.update(updatedSettings);
            return res.status(200).json({ message: "Settings updated successfully", settings: updatedSettings });
        }

        const newSettings = new Settings(userId, userId, voiceType, language, therapyType);
        await settingsRef.set(newSettings);
        res.status(201).json({ message: "Settings created successfully", settings: newSettings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrUpdateSettings };
