const express = require("express");
const { createJournal, getJournalsByUser } = require("../controllers/journalController");

const router = express.Router();

router.post("/", createJournal);
router.get("/:userId", getJournalsByUser);

module.exports = router;
