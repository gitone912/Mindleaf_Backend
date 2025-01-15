class Settings {
    constructor(settingsId, userId, voiceType, language, therapyType) {
      this.settings_id = settingsId;
      this.user_id = userId;
      this.voice_type = voiceType || "Default";
      this.language = language || "English";
      this.therapy_type = therapyType || "Text";
    }
  }
  module.exports = Settings;
  