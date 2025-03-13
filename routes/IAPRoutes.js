const express = require('express');
const router = express.Router();
const { addLeaves } = require('../controllers/IAPController');

router.post('/add-leaves', addLeaves);

module.exports = router;
