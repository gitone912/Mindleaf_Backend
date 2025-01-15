const express = require("express");
const { createMindInsight, getMindInsightsByUser } = require("../controllers/mindController");

const router = express.Router();

router.post("/", createMindInsight);
router.get("/:userId", getMindInsightsByUser);

module.exports = router;
