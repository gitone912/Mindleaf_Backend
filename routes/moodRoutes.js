const express = require("express");
const { logMood, getMoodLogsByUser } = require("../controllers/moodController");

const router = express.Router();

router.post("/", logMood);
router.get("/:userId", getMoodLogsByUser);

module.exports = router;
