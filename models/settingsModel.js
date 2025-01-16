class Settings {
    constructor(settingsId, userId, voiceType, language, therapyType) {
      this.settings_id = settingsId;
      this.user_id = userId;
      this.voice_type = voiceType || "Laura";
      this.language = language || "English";
      this.therapy_type = therapyType || "Cognitive-Behavioral";
    }
  }
  module.exports = Settings;
  