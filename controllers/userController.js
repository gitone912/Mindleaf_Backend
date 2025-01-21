const { db, admin, googleClient } = require("../utils/firebaseConfig");
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

// Signup function to generate and send OTP
const signupUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if a user with the provided email already exists
    const usersSnapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");

    if (usersSnapshot.exists()) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in a temporary database (e.g., under `otps` node)
    const otpEntry = {
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // OTP expires in 5 minutes
    };
    await db.ref(`otps/${email.replace(/\./g, "_")}`).set(otpEntry);

    // Send the OTP to the user's email
    await transporter.sendMail({
      from: "hi@demomailtrap.com", // Replace with your email
      to: email,
      subject: "Your Signup OTP",
      text: `Your OTP for signup is: ${otp}`,
    });

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify OTP and create user
const verifyOtpAndCreateUser = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Fetch the OTP entry from the database
    const otpSnapshot = await db.ref(`otps/${email.replace(/\./g, "_")}`).once("value");

    if (!otpSnapshot.exists()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const otpEntry = otpSnapshot.val();

    // Check if OTP is valid and not expired
    if (otpEntry.otp !== otp || Date.now() > otpEntry.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid; proceed with user creation
    const userId = db.ref("users").push().key;

    const newUser = new User(
      userId,
      email,
      password,
      "Mindleaf User",
      false, // Default values for new user
      null,
      [],
      1,
      0,
      "freeTier",
      new Date().toISOString(),
      new Date().toISOString()
    );

    await db.ref(`users/${userId}`).set(newUser);

    // Remove the OTP entry after successful verification
    await db.ref(`otps/${email.replace(/\./g, "_")}`).remove();

    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if a user with the provided email exists
    const usersSnapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");

    if (!usersSnapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    // User exists, validate the password
    const userId = Object.keys(usersSnapshot.val())[0];
    const user = usersSnapshot.val()[userId];

    if (user.password === password) {
      // Password is correct, return full user information
      delete user.password;
      return res.status(200).json({ message: "Login successful", user });
    } else {
      // Password is incorrect
      return res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.ref(`users/${userId}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = snapshot.val();
    delete user.password; // Remove password from the user object
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { userId, name, isOnboarded, notificationTime, notificationDays, coverChoice, points, subscription } = req.body;

    // Check if the user exists
    const snapshot = await db.ref(`users/${userId}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    const updates = {
      name: name,
      is_onboarded: isOnboarded,
      notification_time: notificationTime,
      notification_days: notificationDays,
      cover_choice: coverChoice,
      points: points,
      subscription: subscription,
      updated_at: new Date().toISOString()
    };

    await db.ref(`users/${userId}`).update(updates);
    res.status(200).json({ message: "User details updated successfully", updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body; // Change from token to credential

    if (!idToken) {
      return res.status(400).json({ 
        error: "No credential provided" 
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    if (!ticket) {
      return res.status(401).json({ 
        error: "Invalid token" 
      });
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    const usersSnapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");

    if (usersSnapshot.exists()) {
      // User exists - Handle Sign In
      const userId = Object.keys(usersSnapshot.val())[0];
      const existingUser = usersSnapshot.val()[userId];
      return res.status(200).json({
        message: "Login successful",
        user: existingUser,
        isNewUser: false
      });
    }

    // User doesn't exist - Handle Sign Up
    const userId = db.ref("users").push().key;
    
    const newUser = new User(
      userId,
      email,
      null,
      name || "Mindleaf User",
      false,
      null,
      [],
      1,
      0,
      "freeTier",
      new Date().toISOString(),
      new Date().toISOString()
    );

    await db.ref(`users/${userId}`).set(newUser);

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
      isNewUser: true
    });

  } catch (error) {
    console.error('Error in Google authentication:', error);
    return res.status(500).json({ 
      error: "Authentication failed", 
      details: error.message 
    });
  }
};

module.exports = { 
    signupUser, 
    verifyOtpAndCreateUser, 
    signinUser, 
    getUserById, 
    updateUserDetails,
    googleAuth 
};
