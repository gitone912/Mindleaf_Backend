class Mind {
    constructor(mindId, userId, insight,title, createdAt) {
      this.mind_id = mindId;
      this.user_id = userId;
      this.insight = insight;
      this.title = title;
      this.created_at = createdAt || new Date().toISOString();
    }
  }
  module.exports = Mind;
  