const express = require("express");
const { createTask, updateTaskCompletion, getTodaysTasks } = require("../controllers/taskController");

const router = express.Router();

router.post("/create", createTask);
router.patch("/complete/:taskId", updateTaskCompletion);
router.post("/today-tasks", getTodaysTasks);

module.exports = router;
