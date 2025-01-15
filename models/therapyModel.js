class Therapy {
    constructor(therapyId, userId, therapyName, sessionTime, pointsUsed) {
      this.therapy_id = therapyId;
      this.user_id = userId;
      this.therapy_name = therapyName;
      this.session_time = sessionTime || new Date().toISOString();
      this.points_used = pointsUsed || 0;
    }
  }
  module.exports = Therapy;
  