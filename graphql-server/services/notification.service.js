import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import User from '../graphql/modules/user/user.model.js';

// Initialize Firebase Admin with your service account
// Make sure to have your service account key JSON file in the project
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

export const sendTaskNotification = async (task, participants) => {
  try {
    // Get all participant users
    const users = await User.find({ '_id': { $in: participants } });
    
    // Filter out users without FCM tokens
    const tokens = users
      .filter(user => user.fcm_token)
      .map(user => user.fcm_token);

    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: 'New Task Assignment',
        body: `You have been added to task: ${task.title}`
      },
      data: {
        taskId: task.id.toString(),
        category: task.category,
        date: task.date,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens: tokens
    };

    // Send the message
    const response = await getMessaging().sendMulticast(message);
    console.log('Successfully sent notifications:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export const sendTaskUpdateNotification = async (task, participants) => {
  try {
    const users = await User.find({ '_id': { $in: participants } });
    const tokens = users
      .filter(user => user.fcm_token)
      .map(user => user.fcm_token);

    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: 'Task Updated',
        body: `Task "${task.title}" has been updated`
      },
      data: {
        taskId: task.id.toString(),
        category: task.category,
        date: task.date,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens: tokens
    };

    const response = await getMessaging().sendMulticast(message);
    console.log('Successfully sent update notifications:', response);
    return response;
  } catch (error) {
    console.error('Error sending update notification:', error);
    throw error;
  }
}; 