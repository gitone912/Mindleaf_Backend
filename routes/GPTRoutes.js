const express = require('express');
const { getGreetings, sendMessage, compileJournal } = require('../helperControllers/GPTResponses');

const router = express.Router();

// Route for getting greetings
router.post('/getgreetings', getGreetings);

// Route for sending a message
router.post('/sendmessage', sendMessage);

// Route for compiling a journal
router.post('/compilejournal', compileJournal);

module.exports = router;
