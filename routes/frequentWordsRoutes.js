const express = require("express");
const { 
    getFrequentWords, 
    updateFrequentWords 
} = require("../controllers/frequentWordsController");

const router = express.Router();

router.get("/:userId", getFrequentWords);
router.patch("/update/:userId", updateFrequentWords);

module.exports = router;
