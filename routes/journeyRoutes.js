const express = require("express");
const { createOrUpdateJourney, getUserStreak } = require("../controllers/journeyController");

const router = express.Router();

router.post("/update", createOrUpdateJourney);
router.get("/streak/:userId", getUserStreak);

module.exports = router;
