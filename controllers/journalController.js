const { db, admin, googleClient } = require("../utils/firebaseConfig");
const Journal = require("../models/journalModel");

const createJournal = async (req, res) => {
    try {
        const { userId, type, content,originalContent, moodEmoji, moodKeywords, summary, actions } = req.body;
        const journalId = db.ref("journal").push().key;

        const newJournal = new Journal(
            journalId,
            userId,
            type,
            content,
            originalContent,
            moodEmoji,
            moodKeywords,
            summary,
            actions
        );

        await db.ref(`journal/${journalId}`).set(newJournal);
        res.status(201).json({ message: "Journal entry created successfully", journal: newJournal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getJournalsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.ref("journal").orderByChild("user_id").equalTo(userId).once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "No journal entries found for this user" });
        }

        res.status(200).json(snapshot.val());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editJournal = async (req, res) => {
    try {
        const { journalId } = req.params;
        const updates = req.body;

        const journalRef = db.ref(`journal/${journalId}`);
        const snapshot = await journalRef.once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "Journal entry not found" });
        }

        updates.updated_at = new Date().toISOString();
        await journalRef.update(updates);

        res.status(200).json({ message: "Journal entry updated successfully", updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteJournal = async (req, res) => {
    try {
        const { journalId } = req.params;

        const journalRef = db.ref(`journal/${journalId}`);
        const snapshot = await journalRef.once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({ message: "Journal entry not found" });
        }

        await journalRef.remove();
        res.status(200).json({ message: "Journal entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createJournal,
    getJournalsByUser,
    editJournal,
    deleteJournal
};
