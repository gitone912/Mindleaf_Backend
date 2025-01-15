class Mind {
    constructor(mindId, userId, insight, createdAt) {
      this.mind_id = mindId;
      this.user_id = userId;
      this.insight = insight;
      this.created_at = createdAt || new Date().toISOString();
    }
  }
  module.exports = Mind;
  