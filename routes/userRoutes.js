const express = require("express");
const { createOrAuthenticateUser, getUserById, updateUserDetails } = require("../controllers/userController");

const router = express.Router();

router.post("/", createOrAuthenticateUser);
router.get("/:userId", getUserById);
router.post("/update", updateUserDetails);

module.exports = router;
