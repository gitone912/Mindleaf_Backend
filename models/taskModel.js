class Task {
    constructor(taskId, userId, taskName, isCompleted, date, completion_points) {
      this.task_id = taskId;
      this.user_id = userId;
      this.task_name = taskName;
      this.is_completed = isCompleted || false;
      this.date = date || new Date().toISOString().split("T")[0];
      this.completion_points = completion_points || 0;
    }
  }
  module.exports = Task;
  