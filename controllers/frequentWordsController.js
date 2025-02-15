const { db } = require("../utils/firebaseConfig");
const FrequentWords = require("../models/frequentWordsModel");

const getFrequentWords = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.ref("frequent_words")
            .orderByChild("user_id")
            .equalTo(userId)
            .once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({ 
                message: "No frequent words found for this user" 
            });
        }

        const frequentWordsData = Object.values(snapshot.val())[0];
        res.status(200).json(frequentWordsData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateFrequentWords = async (req, res) => {
    try {
        const { userId } = req.params;
        const { frequentWords } = req.body;

        // Validate input
        if (!Array.isArray(frequentWords) || frequentWords.length !== 3) {
            return res.status(400).json({ 
                message: "frequentWords must be an array of exactly 3 [word, journalId] pairs" 
            });
        }

        // Check if entry exists for user
        const snapshot = await db.ref("frequent_words")
            .orderByChild("user_id")
            .equalTo(userId)
            .once("value");

        const frequentWordsObj = new FrequentWords(
            userId,
            frequentWords
        );

        if (snapshot.exists()) {
            // Update existing entry
            const existingKey = Object.keys(snapshot.val())[0];
            await db.ref(`frequent_words/${existingKey}`).update({
                frequent_words: frequentWords,
                updated_at: new Date().toISOString()
            });
        } else {
            // Create new entry
            const newKey = db.ref("frequent_words").push().key;
            await db.ref(`frequent_words/${newKey}`).set(frequentWordsObj);
        }

        res.status(200).json({ 
            message: "Frequent words updated successfully", 
            data: frequentWordsObj 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getFrequentWords,
    updateFrequentWords
};
