class Journal {
    constructor(journalId, userId, type, content, createdAt, updatedAt) {
      this.journal_id = journalId;
      this.user_id = userId;
      this.type = type;
      this.content = content;
      this.created_at = createdAt || new Date().toISOString();
      this.updated_at = updatedAt || new Date().toISOString();
    }
  }
  module.exports = Journal;
  