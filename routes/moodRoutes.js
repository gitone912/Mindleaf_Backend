const express = require("express");
const { getUserMood, updateMood } = require("../controllers/moodController");

const router = express.Router();

// Get User Mood by userId
router.get("/:userId", getUserMood);

// Update or Create Mood for a user
router.post("/update", updateMood);

module.exports = router;
