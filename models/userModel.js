class User {
    constructor(userId, email, password, name, isOnboarded, notificationTime, notificationDays, coverChoice, points, subscription, createdAt, updatedAt) {
      this.user_id = userId;
      this.email = email;
      this.password = password;
      this.name = name;
      this.is_onboarded = isOnboarded;
      this.notification_time = notificationTime;
      this.notification_days = notificationDays;
      this.cover_choice = coverChoice;
      this.points = points || 0;
      this.subscription= subscription || "freeTier";
      this.created_at = createdAt || new Date().toISOString();
      this.updated_at = updatedAt || new Date().toISOString();
    }
  }
  module.exports = User;
  