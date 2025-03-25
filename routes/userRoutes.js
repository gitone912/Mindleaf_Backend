const express = require("express");
const { verifyOtpAndCreateUser, signinUser, signupUser, getUserById, updateUserDetails, googleAuth, updateUserName } = require("../controllers/userController");

const router = express.Router();

router.post("/sign-in", signinUser);
router.post("/verify-otp", verifyOtpAndCreateUser);
router.post("/sign-up", signupUser);
router.get("/:userId", getUserById);
router.post("/update", updateUserDetails);
router.post("/google-auth", googleAuth);
router.post("/update-name", updateUserName);

module.exports = router;
