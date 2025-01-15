const express = require("express");
const { createTherapySession, getTherapySessionsByUser } = require("../controllers/therapyController");

const router = express.Router();

router.post("/schedule", createTherapySession);
router.get("/:userId", getTherapySessionsByUser);

module.exports = router;
