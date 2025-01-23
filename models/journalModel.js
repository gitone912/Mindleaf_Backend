class Journal {
  constructor(journalId, userId, type, content, originalContent, moodEmoji, moodKeywords, summary, actions, createdAt, updatedAt) {
      this.journal_id = journalId;
      this.user_id = userId;
      this.type = type;
      this.original_content = originalContent;
      this.content = content;
      this.mood_emoji = moodEmoji;
      this.mood_keywords = moodKeywords || [];
      this.summary = summary;
      this.actions = actions || []; // List of strings
      this.created_at = createdAt || new Date().toISOString();
      this.updated_at = updatedAt || new Date().toISOString();
  }
}

module.exports = Journal;
