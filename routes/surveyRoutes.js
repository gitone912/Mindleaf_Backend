const express = require("express");
const { createSurvey, getSurveysByUser } = require("../controllers/surveyController");

const router = express.Router();

router.post("/", createSurvey);
router.get("/:userId", getSurveysByUser);

module.exports = router;
