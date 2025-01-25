const { db, admin, googleClient } = require("../utils/firebaseConfig");
const Task = require("../models/taskModel");

const createTask = async (req, res) => {
  try {
    const { userId, taskName, completion_points } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check existing tasks for today
    const tasksRef = db.ref("tasks");
    const snapshot = await tasksRef
      .orderByChild("user_id")
      .equalTo(userId)
      .once("value");

    // Count today's tasks
    let todayTasksCount = 0;
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const task = childSnapshot.val();
        if (task.created_at && task.created_at.split('T')[0] === today) {
          todayTasksCount++;
        }
      });
    }

    // Check if limit exceeded
    if (todayTasksCount >= 6) {
      return res.status(400).json({ 
        error: "Daily task limit reached. You can only create 6 tasks per day." 
      });
    }

    // Create new task
    const taskId = db.ref("tasks").push().key;
    const newTask = new Task(
      taskId, 
      userId, 
      taskName, 
      false, 
      null, 
      completion_points
    );
    newTask.created_at = new Date().toISOString(); // Add creation timestamp

    await db.ref(`tasks/${taskId}`).set(newTask);
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { isCompleted } = req.body;

    // Fetch the task details
    const taskRef = db.ref(`tasks/${taskId}`);
    const taskSnapshot = await taskRef.once("value");

    if (!taskSnapshot.exists()) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskSnapshot.val();

    // If task is already completed, no need to update
    if (task.is_completed) {
      return res.status(400).json({ message: "Task is already marked as completed" });
    }

    if (isCompleted) {
      // Mark the task as completed and update the user's points
      const userRef = db.ref(`users/${task.user_id}`);
      const userSnapshot = await userRef.once("value");

      if (!userSnapshot.exists()) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = userSnapshot.val();

      // Update user's points
      const updatedPoints = (user.points || 0) + task.completion_points;
      await userRef.update({ points: updatedPoints, updated_at: new Date().toISOString() });

      // Mark the task as completed
      await taskRef.update({ is_completed: true, completed_at: new Date().toISOString() });

      return res.status(200).json({
        message: "Task marked as completed and points updated",
        updatedPoints,
      });
    } else {
      // If the task is not completed, just return a message
      return res.status(400).json({ message: "Task not marked as completed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTodaysTasks = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const tasksRef = db.ref("tasks");
    const snapshot = await tasksRef
      .orderByChild("user_id")
      .equalTo(userId)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(200).json({ tasks: [] });
    }

    const allTasks = [];
    snapshot.forEach((childSnapshot) => {
      const task = childSnapshot.val();
      if (task.date === today) {
        allTasks.push(task);
      }
    });

    res.status(200).json({ tasks: allTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTask, updateTaskCompletion, getTodaysTasks };
