const { db, admin, googleClient } = require("../utils/firebaseConfig");
const Settings = require("../models/settingsModel");

const createOrUpdateSettings = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        const settingsRef = db.ref(`settings/${userId}`);
        const snapshot = await settingsRef.once("value");

        if (snapshot.exists()) {
            const updateFields = {};
            if (req.body.voiceType !== undefined) updateFields.voice_type = req.body.voiceType;
            if (req.body.language !== undefined) updateFields.language = req.body.language;
            if (req.body.therapyType !== undefined) updateFields.therapy_type = req.body.therapyType;
            updateFields.updated_at = new Date().toISOString();

            await settingsRef.update(updateFields);
            return res.status(200).json({ 
                message: "Settings updated successfully", 
                settings: { ...snapshot.val(), ...updateFields }
            });
        }

        // For new settings, use the model's default values
        const newSettings = new Settings(userId, userId, req.body.voiceType, req.body.language, req.body.therapyType);
        await settingsRef.set(newSettings);
        res.status(201).json({ message: "Settings created successfully", settings: newSettings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrUpdateSettings };
