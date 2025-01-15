const db = require("../utils/firebaseConfig");
const Task = require("../models/taskModel");

const createTask = async (req, res) => {
  try {
    const { userId, taskName, pointsEarned } = req.body;
    const taskId = db.ref("tasks").push().key;

    const newTask = new Task(taskId, userId, taskName, false, null, pointsEarned);

    await db.ref(`tasks/${taskId}`).set(newTask);
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { isCompleted, pointsEarned } = req.body;

    const taskRef = db.ref(`tasks/${taskId}`);
    const snapshot = await taskRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Task not found" });
    }

    await taskRef.update({ is_completed: isCompleted, points_earned: pointsEarned });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTask, updateTaskCompletion };
