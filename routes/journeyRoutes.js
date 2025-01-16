const express = require("express");
const { createOrUpdateJourney } = require("../controllers/journeyController");

const router = express.Router();

router.post("/update", createOrUpdateJourney);

module.exports = router;
