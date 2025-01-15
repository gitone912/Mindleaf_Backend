const db = require("../utils/firebaseConfig");
const Therapy = require("../models/therapyModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

// Setup nodemailer for email sending
const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: "ad25ea12494dcf4d5c87cf8d1e575f9f"
  }
});

const createTherapySession = async (req, res) => {
  try {
    const { userId, therapyName, pointsUsed } = req.body;

    // Fetch the user data from the database
    const userSnapshot = await db.ref(`users/${userId}`).once("value");

    if (!userSnapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userSnapshot.val();

    // Check if the user has enough points
    if (user.points < pointsUsed) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    // Deduct points and update user data
    user.points -= pointsUsed;
    await db.ref(`users/${userId}`).update({ points: user.points });

    // Create a new therapy session
    const therapyId = db.ref("therapy").push().key;
    const newTherapy = new Therapy(therapyId, userId, therapyName, null, pointsUsed);

    await db.ref(`therapy/${therapyId}`).set(newTherapy);

    // Send email notification to the user
    await transporter.sendMail({
      from: "hi@demomailtrap.com", // Replace with your email
      to: user.email,
      subject: "Therapy Booking Confirmation",
      text: `Hello ${user.name},\n\nYour therapy session "${therapyName}" has been booked successfully. You will receive your schedule and Zoom link soon.\n\nThank you for choosing our service!\n\nBest regards,\nYour Therapy Team`
    });

    res.status(201).json({ message: "Therapy session booked successfully", therapy: newTherapy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getTherapySessionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.ref("therapy").orderByChild("user_id").equalTo(userId).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No therapy sessions found for this user" });
    }

    res.status(200).json(snapshot.val());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTherapySession, getTherapySessionsByUser };
