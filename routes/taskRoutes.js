const express = require("express");
const { createTask, updateTaskCompletion } = require("../controllers/taskController");

const router = express.Router();

router.post("/create", createTask);
router.patch("/complete/:taskId", updateTaskCompletion);

module.exports = router;
