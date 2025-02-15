class FrequentWords {
    constructor(userId, frequentWords = []) {
        this.user_id = userId;
        this.frequent_words = frequentWords; // Array of [word, journalId] pairs
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
    }
}

module.exports = FrequentWords;
