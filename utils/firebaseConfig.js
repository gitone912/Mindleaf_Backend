const admin = require("firebase-admin");
const serviceAccount = require("../mind-leaf-firebase-adminsdk-ak3ak-6a54a8d041.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mind-leaf-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
const db = admin.database();

module.exports = db;
