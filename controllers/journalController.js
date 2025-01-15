const db = require("../utils/firebaseConfig");
const Journal = require("../models/journalModel");

const createJournal = async (req, res) => {
  try {
    const { userId, type, content } = req.body;
    const journalId = db.ref("journal").push().key;

    const newJournal = new Journal(journalId, userId, type, content);

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

module.exports = { createJournal, getJournalsByUser };
