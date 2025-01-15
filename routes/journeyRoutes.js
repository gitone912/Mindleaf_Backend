const express = require("express");
const { createOrUpdateJourney } = require("../controllers/journeyController");

const router = express.Router();

router.post("/", createOrUpdateJourney);

module.exports = router;
