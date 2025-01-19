import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Message from './graphql/modules/message/message.model.js';
import jwt from 'jsonwebtoken';
import { getUserByUID } from './graphql/modules/user/user.service.js';
import dotenv from 'dotenv';
import connectDB from './database/connection.js';

dotenv.config();

const app = express();
const server = createServer(app); 

// Connect to MongoDB first
await connectDB();

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false
    }
});

// Store active users with their MongoDB _id
const activeUsers = new Map();
const userSockets = new Map();

// Authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Decoded token:', decoded);
        const user = await getUserByUID(decoded.uid);
        if (!user) {
            return next(new Error('User not found'));
        }
        socket.user = { ...decoded, _id: user._id };
        console.log('User authenticated:', socket.user);
        next();
    } catch (err) {
        console.error('Authentication error:', err.message);
        next(new Error('Invalid token'));
    }
});

io.on('connection', async (socket) => {
    console.log('😎😎😎 A new connection has been established:', socket.id);
    
    try {
        if (socket.user) {
            activeUsers.set(socket.user._id.toString(), socket.id);
            userSockets.set(socket.id, socket.user._id.toString());
            
            // Mark user as online
            io.emit('userOnline', {
                userId: socket.user._id.toString(),
                onlineUsers: Array.from(activeUsers.keys())
            });

            // Mark all received messages as delivered
            await Message.updateMany(
                { 
                    receiver_id: socket.user._id,
                    delivered: false 
                },
                { 
                    delivered: true,
                    delivered_at: new Date()
                }
            );
        }
    } catch (error) {
        console.error('Error in connection handler:', error);
        socket.disconnect();
    }

    // Get conversation history
    socket.on('getConversation', async ({ with_user_id, page = 1, limit = 20 }) => {
        console.log('🚀 getConversation event received:', {
            with_user_id,
            page,
            limit,
            current_user: socket.user._id
        });

        try {
            // Convert string IDs to ObjectIds if needed
            const currentUserId = mongoose.Types.ObjectId(socket.user._id);
            const otherUserId = mongoose.Types.ObjectId(with_user_id);

            const messages = await Message.find({
                $or: [
                    { sender_id: currentUserId, receiver_id: otherUserId },
                    { sender_id: otherUserId, receiver_id: currentUserId }
                ]
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender_id', 'name email')
            .populate('receiver_id', 'name email');

            console.log(`Found ${messages.length} messages`);

            socket.emit('conversationHistory', {
                with: with_user_id,
                messages: messages.reverse(),
                page,
                limit
            });
        } catch (error) {
            console.error('Error in getConversation:', error);
            socket.emit('messageError', { 
                error: 'Failed to fetch conversation history',
                details: error.message 
            });
        }
    });

    // Handle private messages
    socket.on('privateMessage', async ({ to, message, type = 'text' }) => {
        try {
            const newMessage = await Message.create({
                sender_id: socket.user._id,
                receiver_id: to,
                content: message,
                message_type: type,
                delivered: activeUsers.has(to), // Mark as delivered if recipient is online
                delivered_at: activeUsers.has(to) ? new Date() : null
            });


            const recipientSocket = activeUsers.get(to);
            if (recipientSocket) {
                io.to(recipientSocket).emit('privateMessage', {
                    messageId: newMessage._id,
                    from: socket.user._id,
                    content: message,
                    type: type,
                    timestamp: newMessage.createdAt
                });
            }

            socket.emit('messageSent', {
                messageId: newMessage._id,
                to,
                content: message,
                type: type,
                delivered: activeUsers.has(to),
                timestamp: newMessage.createdAt
            });            
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('messageError', { error: 'Failed to send message' });
        }
    });

    // Mark messages as read
    socket.on('markAsRead', async ({ messageIds }) => {
        try {
            await Message.updateMany(
                { 
                    _id: { $in: messageIds },
                    receiver_id: socket.user._id,
                    read: false
                },
                { 
                    read: true,
                    read_at: new Date()
                }
            );

            // Notify sender that messages were read
            const messages = await Message.find({ _id: { $in: messageIds } });
            messages.forEach(msg => {
                const senderSocket = activeUsers.get(msg.sender_id.toString());
                if (senderSocket) {
                    io.to(senderSocket).emit('messageRead', {
                        messageId: msg._id,
                        readAt: new Date()
                    });
                }
            });
        } catch (error) {
            socket.emit('messageError', { error: 'Failed to mark messages as read' });
        }
    });

    // Get unread messages count
    socket.on('getUnreadCount', async () => {
        try {
            const count = await Message.countDocuments({
                receiver_id: socket.user._id,
                read: false
            });
            socket.emit('unreadCount', { count });
        } catch (error) {
            socket.emit('messageError', { error: 'Failed to get unread count' });
        }
    });

    // Get recent conversations
    socket.on('getRecentConversations', async () => {
        try {
            const conversations = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { sender_id: socket.user._id },
                            { receiver_id: socket.user._id }
                        ]
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ['$sender_id', socket.user._id] },
                                '$receiver_id',
                                '$sender_id'
                            ]
                        },
                        lastMessage: { $first: '$$ROOT' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        user: {
                            _id: 1,
                            name: 1,
                            email: 1
                        },
                        lastMessage: 1,
                        unreadCount: 1
                    }
                }
            ]);

            socket.emit('recentConversations', { conversations });
        } catch (error) {
            socket.emit('messageError', { error: 'Failed to get recent conversations' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const userId = userSockets.get(socket.id);
        if (userId) {
            activeUsers.delete(userId);
            userSockets.delete(socket.id);

            io.emit('userOffline', {
                userId,
                onlineUsers: Array.from(activeUsers.keys())
            });

            console.log(`User disconnected: ${userId}`);
        }
    });
});

const PORT = process.env.CHAT_PORT || 4002;
server.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
});
