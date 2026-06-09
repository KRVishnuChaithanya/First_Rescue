const admin = require('firebase-admin');

exports.sendFCMNotification = async (token, payload) => {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      token: token,
    };
    
    // In a real app, use admin.messaging().send(message)
    console.log("Mock sending FCM to", token, message);
    return true;
  } catch (error) {
    console.error("FCM Error:", error);
    return false;
  }
};
