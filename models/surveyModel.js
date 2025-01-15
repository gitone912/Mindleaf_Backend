class Survey {
    constructor(surveyId, userId, question1, question2, question3, question4, question5, createdAt) {
      this.survey_id = surveyId;
      this.user_id = userId;
      this.question_1 = question1;
      this.question_2 = question2;
      this.question_3 = question3;
      this.question_4 = question4;
      this.question_5 = question5;
      this.created_at = createdAt || new Date().toISOString();
    }
  }
  module.exports = Survey;
  