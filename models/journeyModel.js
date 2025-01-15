class Journey {
    constructor(journeyId, userId, streak, lastSessionDate, totalSessions) {
      this.journey_id = journeyId;
      this.user_id = userId;
      this.streak = streak || 0;
      this.last_session_date = lastSessionDate || null;
      this.total_sessions = totalSessions || 0;
    }
  }
  module.exports = Journey;
  