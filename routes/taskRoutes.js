const express = require("express");
const { createTask, reduceUpdateTaskCompletion, updateTaskCompletion, getTodaysTasks, deleteTask } = require("../controllers/taskController");

const router = express.Router();

router.post("/create", createTask);
router.patch("/complete/:taskId", updateTaskCompletion);
router.patch("/reduce/:taskId", reduceUpdateTaskCompletion);
router.post("/today-tasks", getTodaysTasks);
router.delete("/delete/:taskId", deleteTask); // Added delete route

module.exports = router;
