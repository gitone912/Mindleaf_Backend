class Mood {
    constructor(moodId, userId, date, mood, createdAt) {
      this.mood_id = moodId;
      this.user_id = userId;
      this.date = date || new Date().toISOString().split("T")[0];
      this.mood = mood;
      this.created_at = createdAt || new Date().toISOString();
    }
  }
  module.exports = Mood;
  