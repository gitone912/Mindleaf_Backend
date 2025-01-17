const express = require('express');
const { 
    getGreetings, 
    sendMessage, 
    compileJournal, 
    returnPrompt, 
    returnGratitude,
    journalSummary,
    getKeywords,
    getSatisfactionScore
} = require('../helperControllers/GPTResponses');

const router = express.Router();

// Route for getting greetings
router.post('/getgreetings', getGreetings);

// Route for sending a message
router.post('/sendmessage', sendMessage);

// Route for compiling a journal
router.post('/compilejournal', compileJournal);

// Route for getting a new prompt
router.post('/getprompt', returnPrompt);

// Route for getting a gratitude prompt
router.post('/getgratitude', returnGratitude);

// Route for getting journal summary
router.post('/journalsummary', journalSummary);

// Route for getting keywords
router.post('/getkeywords', getKeywords);

// Route for getting satisfaction score
router.post('/satisfactionscore', getSatisfactionScore);

module.exports = router;
