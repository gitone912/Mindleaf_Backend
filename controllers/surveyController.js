const db = require("../utils/firebaseConfig");
const Survey = require("../models/surveyModel");

const createSurvey = async (req, res) => {
  try {
    const { userId, question1, question2, question3, question4, question5 } = req.body;

    // Check if a survey already exists for this user
    const existingSurveySnapshot = await db.ref("surveys").orderByChild("user_id").equalTo(userId).once("value");

    if (existingSurveySnapshot.exists()) {
      return res.status(400).json({ message: "A survey already exists for this user" });
    }

    const surveyId = db.ref("surveys").push().key;

    const newSurvey = new Survey(surveyId, userId, question1, question2, question3, question4, question5);

    await db.ref(`surveys/${surveyId}`).set(newSurvey);
    res.status(201).json({ message: "Survey created successfully", survey: newSurvey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSurveysByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.ref("surveys").orderByChild("user_id").equalTo(userId).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No surveys found for this user" });
    }

    res.status(200).json(snapshot.val());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createSurvey, getSurveysByUser };