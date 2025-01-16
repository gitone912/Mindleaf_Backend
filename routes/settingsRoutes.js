const express = require("express");
const { createOrUpdateSettings } = require("../controllers/settingsController");

const router = express.Router();

router.post("/update", createOrUpdateSettings);

module.exports = router;
