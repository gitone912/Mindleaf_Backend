const db = require("../utils/firebaseConfig");
const User = require("../models/userModel");

const createOrAuthenticateUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if a user with the provided email exists
    const usersSnapshot = await db.ref("users").orderByChild("email").equalTo(email).once("value");

    if (!usersSnapshot.exists()) {
      // No user found with the provided email, create a new user
      const userId = db.ref("users").push().key;

      const newUser = new User(
        userId,
        email,
        password,
        name,
        false, // Default values for new user
        null,
        [],
        1,
        0,
        new Date().toISOString(),
        new Date().toISOString()
      );

      await db.ref(`users/${userId}`).set(newUser);
      return res.status(201).json({ message: "User created successfully", user: newUser });
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
    const { userId, isOnboarded, notificationTime, notificationDays, coverChoice ,points} = req.body;

    // Check if the user exists
    const snapshot = await db.ref(`users/${userId}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    const updates = {
      is_onboarded: isOnboarded,
      notification_time: notificationTime,
      notification_days: notificationDays,
      cover_choice: coverChoice,
      points: points,
      updated_at: new Date().toISOString()
    };

    await db.ref(`users/${userId}`).update(updates);
    res.status(200).json({ message: "User details updated successfully", updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrAuthenticateUser, getUserById, updateUserDetails };
