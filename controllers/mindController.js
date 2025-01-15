const db = require("../utils/firebaseConfig");
const Mind = require("../models/mindModel");

const createMindInsight = async (req, res) => {
  try {
    const { userId, insight,title } = req.body;
    const mindId = db.ref("mind").push().key;

    const newMind = new Mind(mindId, userId, insight,title);

    await db.ref(`mind/${mindId}`).set(newMind);
    res.status(201).json({ message: "Mind insight created successfully", mind: newMind });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMindInsightsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.ref("mind").orderByChild("user_id").equalTo(userId).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No mind insights found for this user" });
    }

    res.status(200).json(snapshot.val());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMindInsightByUserLatest = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db
      .ref("mind")
      .orderByChild("user_id")
      .equalTo(userId)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No mind insights found for this user" });
    }

    // Convert the insights to an array and find the latest one
    const insights = Object.values(snapshot.val());
    const latestInsight = insights.reduce((latest, current) =>
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    );

    res.status(200).json(latestInsight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = { createMindInsight, getMindInsightsByUser ,getMindInsightByUserLatest};
