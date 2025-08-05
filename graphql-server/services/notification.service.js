import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import User from '../graphql/modules/user/user.model.js';

// Initialize Firebase Admin with the complete service account info
const serviceAccount = {
    "type": "service_account",
    "project_id": "classmate-4904f",
    "private_key_id": "939a2ca64ed2cbb697bde63cfdb1caade25ad44c",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+8Z6OE+IR5Us9\ncxsmBMD7Zt7Mgun16iaSTlrUsFCjw2pMGGAstWO4e1AZlpowE5nk/sl4CiKMuxgv\njd7e6F3cZvYSe4MR6XT86NDRDMYIu+icf+AKYNubg1B0JDMcm98Ac64geTkAFx2F\nqJVeL7q+cJE7KFrZwAZ08mpiNkMFHEGDcSzFgCIjnwQi9Fm76iXVQqHms4iojfsy\nRx35ijLsHhw2KBAkAy9nI3Sw444O4qGcYoGp5Xp7GCPgd0QyTAGaykoox010ZwLt\nlRrfyrHIj7p24zrmxI0udVcUFFHJrp7sZGjuZxqkkQ8elgk8h71hIzke/Y3nn/qy\nscv+2m7rAgMBAAECggEAD0Py6Kn3R3X882856uqzYQYC5vfKa6IqLkU8Zsen0sfj\nPi0utzRTQiL9ruYG8rQGeDPUeJfa1kR49QhTGqAaLO5AWw7r1ilDdJrKYwQx6u3W\n9XgVuc6vj/nKG1bvjSh7Bia5c5gtce/nKNHnCy4msGYAfmnGBaWf/oaI8cwjxIsv\nzvr0LLe92LU6jUN827Q5aIMt2FCfsvr27Xa4xe0zwu1iC1r7qlYHfiu3oZGsadUV\n4zBiOLKhUtKdgPbn+0mcHP7ZyrzzFSGzk0JVNObCgV5oUYVUhLnMUzR/nhm95mI8\n5o6TAR5moV1qz5/kE5x+D3qOl0zYULh7lnVAVjMzFQKBgQDutG3FiUmKXliBkLu8\n016VKaWBhx8qccPlfQngwWxzVLNK4+IzLIpqsaP2Rgvd64rhixQuePnpPspBP55j\ndhLGixZGZjawfw6OoqY0bUjViaiFMMNizlFTAedHHMP2X7IpFf903jcpn3sWn9hQ\nOmStWMnoHSmSAqoM/ITGGkq4VQKBgQDMx04aIFfKMjqNGc3+yg2Adjr5dPtKRjJU\n0EzWlRKl6M9yCJEbH/3FzG1mqFeHtNjHHUmpynHCXcBrszkJR35StEngpmjyp3lN\nYMDmiJfszYdWHHCbbv1NU6z5iN+jTggftT6L9VfyAi0lXt/wY//Z0wNLsDxRa4Fo\nYGkhYPTKPwKBgG+eNPo6gQXPqgkj2XWpTL/pEngn693YBqcnude7+m9PeusY9ivB\ntxO+7xF4nZHu0yk19IDqlsmHT+IE0pZlns/yN79Bim8ram4uBhPbykP3s7JcI/Du\n0r5C1Je/Dq8E/nUR0TsfsaGn7lGc+vRA6dTZAMil4kthLY0XAyrzHl9lAoGAVbCQ\n3h3qnpGmLqU9rgCe5cKTqw9omAwHw7XmcWSwCP0C0ZUEI3Wfm8WPggWvmvnyPF/l\nE0fDkrHocyjsFRX1pmYLBBaek+vAtsBl+BHwgQcAOuhrtp8bH+CD4WeFLbDZdWtC\nYQ6pXnvKqHiq/MzboyrJlkKI+wkhfavaUj1gMcECgYBzaFng1/WuHrW+ZeqjD3iR\nxMAncTZ8hB3Cn2INzoWZ93RcvJk+O74wQJeItuyg/DhRGLra+/X9sLg4GL7jUEl9\nML8kaKjiT4zxyBxKCuzP2b280MgizZdZiwgNvphJ68msIPOE6n0oOAN3QVvdjpof\nxfaZpp3vyAlTnUnL1LRb7Q==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@classmate-4904f.iam.gserviceaccount.com",
    "client_id": "102874340708890702061",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40classmate-4904f.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully');
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}

export const sendTaskNotification = async (task, participants) => {
    try {
        // Get all participant users
        const users = await User.find({ '_id': { $in: participants } });
        // Filter out users without FCM tokens
        const tokens = users
            .filter(user => user.fcm_token)
            .map(user => user.fcm_token);
        if (tokens.length === 0) {
            console.log('No FCM tokens found for participants');
            return;
        }
        const message = {
            notification: {
                title: 'New Task Invitation',
                body: `You have been invited to task: ${task.title}`
            },
            data: {
                taskId: task.id.toString(),
                category: task.category,
                date: task.date.toString(),
                click_action: 'TASK_INVITATION',
                type: 'task_invitation'
            },
            android: {
                notification: {
                    clickAction: 'TASK_INVITATION',
                    color: '#4CAF50',
                    priority: 'high',
                    defaultSound: true,
                    channelId: 'task_invitations'
                }
            },
            apns: {
                payload: {
                    aps: {
                        category: 'TASK_INVITATION',
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };
        // Send to each token individually using messaging().send()
        const sendPromises = tokens.map(token => {
            const messageWithToken = {
                ...message,
                token: token // Use single token instead of tokens array
            };
            return admin.messaging().send(messageWithToken);
        });
        const responses = await Promise.all(sendPromises);
        return responses;
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

        if (tokens.length === 0) {
            console.log('No FCM tokens found for participants');
            return;
        }

        const message = {
            notification: {
                title: 'Task Updated',
                body: `Task "${task.title}" has been updated`
            },
            data: {
                taskId: task.id.toString(),
                category: task.category,
                date: task.date.toString(),
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                type: 'task_update'
            }
        };

        console.log('Sending update notification to tokens:', tokens);
        
        // Send to each token individually using messaging().send()
        const sendPromises = tokens.map(token => {
            const messageWithToken = {
                ...message,
                token: token // Use single token instead of tokens array
            };
            return admin.messaging().send(messageWithToken);
        });

        const responses = await Promise.all(sendPromises);
        console.log('Successfully sent update notifications:', responses);
        return responses;
    } catch (error) {
        console.error('Error sending update notification:', error);
        throw error;
    }
}; 