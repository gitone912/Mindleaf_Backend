const express = require('express');
const router = express.Router();
const { addLeaves, verifySubscription } = require('../controllers/IAPController');

router.post('/add-leaves', addLeaves);
router.post('/verify-subscription', verifySubscription);

module.exports = router;
