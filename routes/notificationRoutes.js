const express = require("express");
const { getAccessToken, sendNotification, saveFCMToken, getFCMToken } = require("../controllers/notificationController");

const router = express.Router();

// API to Get Access Token
router.get("/get-access-token", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    res.json({ success: true, accessToken });
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API to Send Notification
router.post("/send-notification", async (req, res) => {
  try {
    const { token, title, body } = req.body;
    
    // Optional: Get access token inside send-notification if needed
    const accessToken = await getAccessToken();
    console.log("FCM Access Token:", accessToken);

    const result = await sendNotification(token, title, body, accessToken);
    
    res.json({
      success: true,
      message: "Notification sent successfully",
      result,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save FCM Token
router.post("/save-token", async (req, res) => {
  try {
    const { userId, fcmToken, name } = req.body;  // Added name parameter
    await saveFCMToken(userId, fcmToken, name);
    res.json({ success: true, message: "FCM token saved successfully" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get FCM Token by userId
router.get("/get-token/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const token = await getFCMToken(userId);
    if (!token) {
      return res.status(404).json({ success: false, message: "Token not found" });
    }
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
