const express = require("express");
const { createTask, updateTaskCompletion } = require("../controllers/taskController");

const router = express.Router();

router.post("/", createTask);
router.patch("/:taskId", updateTaskCompletion);

module.exports = router;
