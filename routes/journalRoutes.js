const express = require("express");
const { createJournal, getJournalsByUser, editJournal, deleteJournal } = require("../controllers/journalController");

const router = express.Router();

router.post("/create", createJournal);
router.get("/:userId", getJournalsByUser);
router.put("/edit/:journalId", editJournal);
router.delete("/delete/:journalId", deleteJournal);

module.exports = router;