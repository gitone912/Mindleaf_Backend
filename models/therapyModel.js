class Therapy {
    constructor(therapyId, userId, therapistId, sessionTime, pointsUsed, feedback) {
      this.therapy_id = therapyId;
      this.user_id = userId;
      this.therapist_id = therapistId;
      this.session_time = sessionTime || new Date().toISOString();
      this.points_used = pointsUsed || 0;
      this.feedback = feedback || null;
    }
  }
  module.exports = Therapy;
  