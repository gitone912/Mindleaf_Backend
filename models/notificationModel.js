const { db, admin } = require('../utils/firebaseConfig');

class NotificationModel {
  constructor() {
    this.fcmTokensRef = db.ref('fcmTokens');
  }

  async saveFCMToken(userId, fcmToken, name = null) {
    if (!userId || !fcmToken) {
      throw new Error("userId and fcmToken are required");
    }

    const tokenData = {
      token: fcmToken,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    };

    if (name) {
      tokenData.name = name;
    }

    await this.fcmTokensRef.child(userId).set(tokenData);
    return true;
  }

  async getFCMToken(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const snapshot = await this.fcmTokensRef.child(userId).once('value');
    const data = snapshot.val();
    return data ? data : null;
  }

  async sendNotification(token, title, body) {
    const message = {
      notification: {
        title,
        body,
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: "default",
            contentAvailable: true,
          },
        },
      },
      token,
    };

    return await admin.messaging().send(message);
  }
}

module.exports = new NotificationModel();
