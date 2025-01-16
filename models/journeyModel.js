class Journey {
  constructor(journeyId, userId, streak, lastSessionDate, UTC) {
    this.journey_id = journeyId;
    this.user_id = userId;
    this.streak = streak || 0;
    this.last_session_date = lastSessionDate || null;
    this.UTC = UTC;
  }
}
module.exports = Journey;