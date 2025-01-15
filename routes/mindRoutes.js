const express = require("express");
const { createMindInsight, getMindInsightsByUser , getMindInsightByUserLatest} = require("../controllers/mindController");

const router = express.Router();

router.post("/create", createMindInsight);
router.get("/all/:userId", getMindInsightsByUser);
router.get("/latest/:userId", getMindInsightByUserLatest);

module.exports = router;
