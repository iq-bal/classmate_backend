import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Message from './graphql/modules/message/message.model.js';
import Student from './graphql/modules/student/student.model.js';
import jwt from 'jsonwebtoken';
import { getUserByUID } from './graphql/modules/user/user.service.js';
import { getTeacherByUserId } from './graphql/modules/teacher/teacher.service.js';
import { 
    startAttendanceSession, 
    markStudentPresent, 
    markStudentAbsent, 
    getAttendanceSessionData,
    bulkUpdateAttendance,
    getActiveSession,
    getAllActiveSessions 
} from './graphql/modules/attendance/attendance.service.js';
import dotenv from 'dotenv';
import connectDB from './database/connection.js';
import { uploadToLocal, deleteFromLocal } from './services/local.storage.js';

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

// Store active users and their call status
const activeUsers = new Map();
const userSockets = new Map();
const activeCallSessions = new Map();
// Store active attendance sessions
const activeAttendanceSessions = new Map(); // session_id -> { teacher_id, students: Set() }

// Authentication middleware
io.use(async (socket, next) => {
    console.log('🔐 Authentication attempt for socket:', socket.id);
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log('❌ No token provided for socket:', socket.id);
            return next(new Error('Authentication error'));
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await getUserByUID(decoded.uid);
        if (!user) {
            console.log('❌ User not found for UID:', decoded.uid);
            return next(new Error('User not found'));
        }
        socket.user = { ...decoded, _id: user._id };
        console.log('✅ Authentication successful for user:', user.name, '(ID:', user._id, ')');
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', async (socket) => {
    console.log('🔌 New connection established:', socket.id);
    
    try {
        if (socket.user) {
            console.log('👤 User connected:', socket.user.name, '(ID:', socket.user._id, ')');
            activeUsers.set(socket.user._id.toString(), socket.id);
            userSockets.set(socket.id, socket.user._id.toString());
            
            console.log('📊 Active users count:', activeUsers.size);
            console.log('📋 Current active users:', Array.from(activeUsers.keys()));
            
            // Mark user as online and notify others
            io.emit('userOnline', {
                userId: socket.user._id.toString(),
                onlineUsers: Array.from(activeUsers.keys())
            });
            console.log('📢 Broadcasted user online status for:', socket.user.name);

            // Mark messages as delivered
            const deliveredCount = await Message.updateMany(
                { 
                    receiver_id: socket.user._id,
                    delivered: false 
                },
                { 
                    delivered: true,
                    delivered_at: new Date()
                }
            );
            console.log('📬 Marked', deliveredCount.modifiedCount, 'messages as delivered for:', socket.user.name);
        }
    } catch (error) {
        console.error('❌ Error in connection handler:', error);
        socket.disconnect();
    }

    // Subscribe to course updates for real-time active session tracking
    socket.on('subscribeToCourse', ({ course_id }) => {
        console.log('📡 [COURSE SUBSCRIPTION] User', socket.user?.name, 'subscribing to course:', course_id);
        socket.join(`course_${course_id}`);
        
        // Send current active sessions for this course immediately
        const activeSessions = [];
        for (const [sessionId, sessionData] of activeAttendanceSessions) {
            if (sessionData.course_id === course_id) {
                activeSessions.push({
                    sessionId,
                    teacherId: sessionData.teacher_id,
                    studentCount: sessionData.students.size,
                    startedAt: sessionData.started_at
                });
            }
        }
        
        socket.emit('activeSessionsData', {
            course_id,
            activeSessions
        });
        
        console.log('📤 [COURSE SUBSCRIPTION] Sent', activeSessions.length, 'active sessions for course:', course_id);
    });

    // Unsubscribe from course updates
    socket.on('unsubscribeFromCourse', ({ course_id }) => {
        console.log('📡 [COURSE SUBSCRIPTION] User', socket.user?.name, 'unsubscribing from course:', course_id);
        socket.leave(`course_${course_id}`);
    });

    // Get conversation history
    socket.on('getConversation', async ({ with_user_id, page = 1, limit = 20 }) => {
        console.log('📜 Conversation history requested by:', socket.user.name, 'with user:', with_user_id, 'page:', page);
        try {
            const messages = await Message.find({
                $or: [
                    { sender_id: socket.user._id, receiver_id: with_user_id },
                    { sender_id: with_user_id, receiver_id: socket.user._id }
                ]
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender_id', 'name email profile_picture')
            .populate('receiver_id', 'name email profile_picture')
            .populate('reply_to')
            .populate('forwarded_from', 'name email');

            console.log('📜 Found', messages.length, 'messages for conversation');
            socket.emit('conversationHistory', {
                with: with_user_id,
                messages: messages.reverse(),
                page,
                limit
            });
        } catch (error) {
            console.error('❌ Error fetching conversation history:', error);
            socket.emit('error', { message: 'Failed to fetch conversation history' });
        }
    });

    // Handle messages (text, file, voice, etc.)
    socket.on('message', async ({ to, content, type = 'text', file = null, replyTo = null, forward = false, forwardFrom = null }) => {
        console.log('💬 New message received from:', socket.user.name, 'to:', to, 'type:', type, 'content:', content?.substring(0, 50) + (content?.length > 50 ? '...' : ''));
        try {
            let fileUrl = null;
            let fileName = null;
            let fileSize = null;
            let fileType = null;
            let thumbnailUrl = null;
            let duration = null;

            // Handle file upload if present
            if (file) {
                console.log('📎 File upload detected:', file.name, 'size:', file.size, 'type:', file.type);
                const uploadResult = await uploadToLocal({
                    stream: file.stream,
                    buffer: file.buffer || file.data, // Handle buffer/data from Socket.IO
                    data: file.data, // Fallback for data property
                    name: file.name,
                    mimetype: file.type
                });
                fileUrl = uploadResult.url;
                fileName = file.name;
                fileSize = file.size;
                fileType = file.type;
                console.log('✅ File uploaded successfully:', fileUrl);
                
                // Generate thumbnail for images and videos (TODO: Implement generateThumbnail function)
                if (type === 'image' || type === 'video') {
                    // thumbnailUrl = await generateThumbnail(fileUrl);
                    thumbnailUrl = null; // Temporarily disabled until generateThumbnail is implemented
                }
                
                // Get duration for voice/video messages
                if (type === 'voice' || type === 'video') {
                    duration = file.duration;
                }
            }

            const newMessage = await Message.create({
                sender_id: socket.user._id,
                receiver_id: to,
                content: content || (file ? `Shared ${type === 'image' ? 'an image' : type === 'video' ? 'a video' : type === 'voice' ? 'a voice message' : 'a file'}` : 'Message'), 
                message_type: type,
                file_url: fileUrl,
                file_name: fileName,
                file_size: fileSize,
                file_type: fileType,
                thumbnail_url: thumbnailUrl,
                duration,
                reply_to: replyTo,
                forwarded: forward,
                forwarded_from: forwardFrom,
                delivered: activeUsers.has(to),
                delivered_at: activeUsers.has(to) ? new Date() : null
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender_id', 'name email profile_picture')
                .populate('receiver_id', 'name email profile_picture')
                .populate('reply_to')
                .populate('forwarded_from', 'name email');

            console.log('💾 Message saved to database with ID:', newMessage._id);

            // Send to recipient if online
            const recipientSocket = activeUsers.get(to);
            if (recipientSocket) {
                console.log('📤 Sending message to online recipient:', to);
                io.to(recipientSocket).emit('message', populatedMessage);
            } else {
                console.log('📴 Recipient is offline, message will be delivered when they come online');
            }

            console.log('✅ Message sent confirmation to sender');
            socket.emit('messageSent', populatedMessage);
        } catch (error) {
            console.error('❌ Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle message reactions
    socket.on('react', async ({ messageId, reaction }) => {
        console.log('😀 Reaction received from:', socket.user.name, 'messageId:', messageId, 'reaction:', reaction);
        try {
            const message = await Message.findById(messageId);
            if (!message) throw new Error('Message not found');

            // Remove existing reaction from this user
            message.reactions = message.reactions.filter(r => !r.user_id.equals(socket.user._id));
            
            // Add new reaction
            message.reactions.push({
                user_id: socket.user._id,
                reaction,
                created_at: new Date()
            });

            await message.save();

            // Notify both sender and receiver
            const recipientSocket = activeUsers.get(message.receiver_id.toString());
            const senderSocket = activeUsers.get(message.sender_id.toString());
            
            if (recipientSocket) {
                io.to(recipientSocket).emit('messageReacted', { messageId, reaction, userId: socket.user._id });
            }
            if (senderSocket) {
                io.to(senderSocket).emit('messageReacted', { messageId, reaction, userId: socket.user._id });
            } 
        } catch (error) {
            socket.emit('error', { message: 'Failed to react to message' });
        }
    });  

    // Handle message deletion
    socket.on('deleteMessage', async ({ messageId, forEveryone = false }) => {
        console.log('🚫 Message deletion request from:', socket.user.name, 'messageId:', messageId, 'forEveryone:', forEveryone);
        try {
            const message = await Message.findById(messageId);
            if (!message) throw new Error('Message not found');

            if (forEveryone && message.sender_id.equals(socket.user._id)) {
                // Delete file from storage if exists
                if (message.file_url) {
                    await deleteFromLocal(message.file_url);
                }
                await message.deleteOne();
                
                const recipientSocket = activeUsers.get(message.receiver_id.toString());
                if (recipientSocket) {
                    io.to(recipientSocket).emit('messageDeleted', { messageId, forEveryone });
                }
            } else {
                message.deleted_for.push({
                    user_id: socket.user._id,
                    deleted_at: new Date()
                });
                await message.save();
            }

            socket.emit('messageDeleted', { messageId, forEveryone });
        } catch (error) {
            socket.emit('error', { message: 'Failed to delete message' });
        }
    });

    // Handle message editing
    socket.on('editMessage', async ({ messageId, newContent }) => {
        console.log('✏️ Message edit request from:', socket.user.name, 'messageId:', messageId, 'newContent:', newContent);
        try {
            const message = await Message.findById(messageId);
            if (!message) throw new Error('Message not found');
            
            if (!message.sender_id.equals(socket.user._id)) {
                throw new Error('Cannot edit message from another user');
            }

            message.content = newContent;
            message.edited = true;
            message.edited_at = new Date();
            await message.save();

            const recipientSocket = activeUsers.get(message.receiver_id.toString());
            if (recipientSocket) {
                io.to(recipientSocket).emit('messageEdited', { messageId, newContent });
            }

            socket.emit('messageEdited', { messageId, newContent });
        } catch (error) {
            socket.emit('error', { message: 'Failed to edit message' });
        }
    });

    // Handle voice/video call signaling
    socket.on('callUser', async ({ to, signalData, callType }) => {
        const recipientSocket = activeUsers.get(to);
        if (!recipientSocket) {
            return socket.emit('error', { message: 'User is offline' });
        }

        const callSession = {
            caller: socket.user._id.toString(),
            receiver: to,
            type: callType,
            startTime: new Date()
        };
        activeCallSessions.set(socket.user._id.toString(), callSession);

        io.to(recipientSocket).emit('incomingCall', {
            from: socket.user._id,
            signalData,
            callType
        });
    });

    socket.on('answerCall', ({ to, signalData }) => {
        const callerSocket = activeUsers.get(to);
        if (callerSocket) {
            io.to(callerSocket).emit('callAccepted', signalData);
        }
    });

    socket.on('rejectCall', ({ to }) => {
        const callerSocket = activeUsers.get(to);
        if (callerSocket) {
            io.to(callerSocket).emit('callRejected');
        }
        activeCallSessions.delete(to);
    });

    socket.on('endCall', ({ to }) => {
        const recipientSocket = activeUsers.get(to);
        if (recipientSocket) {
            io.to(recipientSocket).emit('callEnded');
        }
        activeCallSessions.delete(socket.user._id.toString());
    });

    // Handle typing indicators
    socket.on('typing', ({ to }) => {
        console.log('⌨️ User typing:', socket.user.name, 'to:', to);
        const recipientSocket = activeUsers.get(to);
        if (recipientSocket) {
            io.to(recipientSocket).emit('userTyping', { userId: socket.user._id });
        }
    });

    socket.on('stopTyping', ({ to }) => {
        console.log('⌨️ User stopped typing:', socket.user.name, 'to:', to);
        const recipientSocket = activeUsers.get(to);
        if (recipientSocket) {
            io.to(recipientSocket).emit('userStoppedTyping', { userId: socket.user._id });
        }
    });

    // Handle conversation deletion
    socket.on('deleteConversation', async ({ with_user_id }) => {
        console.log('🗑️ Delete conversation requested by:', socket.user.name, 'with user:', with_user_id);
        try {
            // Delete all messages between current user and with_user_id
            const deleteResult = await Message.deleteMany({
                $or: [
                    { sender_id: socket.user._id, receiver_id: with_user_id },
                    { sender_id: with_user_id, receiver_id: socket.user._id }
                ]
            });

            console.log('🗑️ Deleted', deleteResult.deletedCount, 'messages from conversation');

            // Emit confirmation back to client
            socket.emit('conversationDeleted', {
                with_user_id,
                deletedCount: deleteResult.deletedCount,
                success: true
            });

            // Notify the other user if they're online
            const recipientSocket = activeUsers.get(with_user_id);
            if (recipientSocket) {
                io.to(recipientSocket).emit('conversationDeleted', {
                    with_user_id: socket.user._id.toString(),
                    deletedCount: deleteResult.deletedCount,
                    success: true
                });
            }

        } catch (error) {
            console.error('❌ Error deleting conversation:', error);
            socket.emit('error', { 
                message: 'Failed to delete conversation',
                error: error.message 
            });
        }
    });

    // ==================== ATTENDANCE MANAGEMENT ====================
    
    // Start attendance session
    socket.on('startAttendanceSession', async ({ session_id }) => {
        console.log('🎯 [SOCKET DEBUG] startAttendanceSession event received');
        console.log('📝 [SOCKET DEBUG] Session ID:', session_id);
        console.log('👤 [SOCKET DEBUG] Teacher:', socket.user.name, '(ID:', socket.user._id, ')');
        console.log('🔌 [SOCKET DEBUG] Socket ID:', socket.id);
        
        try {
            const userDetails = await getUserByUID(socket.user.uid);
            console.log('👤 [SOCKET DEBUG] User details retrieved:', userDetails.name);
            
            const teacher = await getTeacherByUserId(userDetails._id);
            
            if (!teacher) {
                console.error('❌ [SOCKET DEBUG] Teacher profile not found for user:', socket.user.name);
                return socket.emit('attendanceError', { 
                    message: 'Teacher profile not found' 
                });
            }

            console.log('👨‍🏫 [SOCKET DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
            const result = await startAttendanceSession(session_id, teacher._id);
            console.log('📊 [SOCKET DEBUG] Attendance session result:', {
                totalStudents: result.totalStudents,
                attendanceRecordsCount: result.attendanceRecords?.length || 0
            });
            
            // Store active attendance session with course_id
            activeAttendanceSessions.set(session_id, {
                teacher_id: teacher._id.toString(),
                teacher_socket: socket.id,
                students: new Set(),
                started_at: new Date(),
                course_id: result.session.course_id._id.toString()
            });
            console.log('💾 [SOCKET DEBUG] Active attendance session stored for:', session_id);

            // Notify teacher that session started
            const responseData = {
                session_id,
                session: result.session,
                totalStudents: result.totalStudents,
                attendanceRecords: result.attendanceRecords
            };
            socket.emit('attendanceSessionStarted', responseData);
            
            // Emit course-level event for real-time tracking to subscribed clients
            const courseId = result.session.course_id._id.toString();
            const sessionStartedData = {
                course_id: courseId,
                session_id,
                teacher_id: teacher._id.toString(),
                teacher_name: teacher.name,
                session_topic: result.session.topic,
                total_students: result.totalStudents,
                started_at: new Date()
            };
            
            // Broadcast to course-specific room
            io.to(`course_${courseId}`).emit('courseSessionStarted', sessionStartedData);
            
            // Also broadcast active sessions update to course subscribers
            const activeSessions = [];
            for (const [sessionId, sessionData] of activeAttendanceSessions) {
                if (sessionData.course_id === courseId) {
                    activeSessions.push({
                        sessionId,
                        teacherId: sessionData.teacher_id,
                        studentCount: sessionData.students.size,
                        startedAt: sessionData.started_at
                    });
                }
            }
            
            io.to(`course_${courseId}`).emit('activeSessionsData', {
                course_id: courseId,
                activeSessions
            });
            
            console.log('📤 [SOCKET DEBUG] attendanceSessionStarted event emitted to teacher');
            console.log('📡 [SOCKET DEBUG] courseSessionStarted event emitted for course:', courseId);
            console.log('✅ [SOCKET DEBUG] Attendance session started successfully for session:', session_id);
        } catch (error) {
            console.error('❌ [SOCKET DEBUG] Error starting attendance session:', error.message);
            console.error('❌ [SOCKET DEBUG] Error stack:', error.stack);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // Join attendance session (for students)
    socket.on('joinAttendanceSession', async ({ session_id }) => {
        console.log('🎯 [SOCKET DEBUG] joinAttendanceSession event received');
        console.log('📝 [SOCKET DEBUG] Session ID:', session_id);
        console.log('👤 [SOCKET DEBUG] Student:', socket.user.name, '(ID:', socket.user._id, ')');
        console.log('🔌 [SOCKET DEBUG] Socket ID:', socket.id);
        
        try {
            const attendanceSession = activeAttendanceSessions.get(session_id);
            console.log('📊 [SOCKET DEBUG] Active attendance session found:', !!attendanceSession);
            
            if (!attendanceSession) {
                console.error('❌ [SOCKET DEBUG] Attendance session not active for session:', session_id);
                console.log('📋 [SOCKET DEBUG] Available active sessions:', Array.from(activeAttendanceSessions.keys()));
                return socket.emit('attendanceError', { 
                    message: 'Attendance session not active' 
                });
            }

            console.log('👨‍🏫 [SOCKET DEBUG] Session teacher ID:', attendanceSession.teacher_id);
            console.log('👥 [SOCKET DEBUG] Current students in session:', attendanceSession.students.size);
            
            // Add student to the session
            attendanceSession.students.add(socket.user._id.toString());
            socket.join(`attendance_${session_id}`);
            console.log('✅ [SOCKET DEBUG] Student added to session and joined room: attendance_' + session_id);
            console.log('👥 [SOCKET DEBUG] Total students now in session:', attendanceSession.students.size);

            // Notify teacher about student joining
            const teacherSocket = attendanceSession.teacher_socket;
            console.log('🔌 [SOCKET DEBUG] Teacher socket ID:', teacherSocket);
            
            if (teacherSocket) {
                try {
                    // Get student data with roll and profile picture
                    const studentData = await Student.findOne({ user_id: socket.user._id })
                        .populate('user_id', 'name profile_picture');
                    
                    const studentJoinedData = {
                        session_id,
                        student_id: socket.user._id,
                        student_name: studentData?.user_id?.name || socket.user.name,
                        roll: studentData?.roll || null,
                        profile_picture: studentData?.user_id?.profile_picture || null,
                        joined_at: new Date()
                    };
                    io.to(teacherSocket).emit('studentJoinedAttendance', studentJoinedData);
                    console.log('📤 [SOCKET DEBUG] studentJoinedAttendance event emitted to teacher');
                    console.log('📝 [SOCKET DEBUG] Student join data:', JSON.stringify(studentJoinedData, null, 2));
                } catch (error) {
                    console.error('❌ [SOCKET DEBUG] Error fetching student data for join notification:', error);
                    // Fallback to basic data if student lookup fails
                    const studentJoinedData = {
                        session_id,
                        student_id: socket.user._id,
                        student_name: socket.user.name,
                        roll: null,
                        profile_picture: null,
                        joined_at: new Date()
                    };
                    io.to(teacherSocket).emit('studentJoinedAttendance', studentJoinedData);
                    console.log('📤 [SOCKET DEBUG] studentJoinedAttendance event emitted to teacher (fallback)');
                }
            } else {
                console.warn('⚠️ [SOCKET DEBUG] Teacher socket not found, cannot notify teacher');
            }

            // Update course-level active sessions data for subscribed clients
            const courseId = attendanceSession.course_id;
            if (courseId) {
                const activeSessions = [];
                for (const [sid, sdata] of activeAttendanceSessions) {
                    if (sdata.course_id === courseId) {
                        activeSessions.push({
                            sessionId: sid,
                            teacherId: sdata.teacher_id,
                            studentCount: sdata.students.size,
                            startedAt: sdata.started_at
                        });
                    }
                }
                
                io.to(`course_${courseId}`).emit('activeSessionsData', {
                    course_id: courseId,
                    activeSessions
                });
                console.log('📊 [SOCKET DEBUG] Updated active sessions data for course:', courseId);
            }

            const joinResponseData = {
                session_id,
                message: 'Successfully joined attendance session'
            };
            socket.emit('attendanceSessionJoined', joinResponseData);
            console.log('📤 [SOCKET DEBUG] attendanceSessionJoined event emitted to student');
            console.log('✅ [SOCKET DEBUG] Student joined attendance session successfully:', socket.user.name);
        } catch (error) {
            console.error('❌ [SOCKET DEBUG] Error joining attendance session:', error.message);
            console.error('❌ [SOCKET DEBUG] Error stack:', error.stack);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // Mark student present
    socket.on('markStudentPresent', async ({ session_id, student_id }) => {
        console.log('🎯 [SOCKET DEBUG] markStudentPresent event received');
        console.log('📝 [SOCKET DEBUG] Session ID:', session_id, 'Student ID:', student_id);
        console.log('👤 [SOCKET DEBUG] Teacher:', socket.user.name, '(ID:', socket.user._id, ')');
        console.log('🔌 [SOCKET DEBUG] Socket ID:', socket.id);
        
        try {
            const userDetails = await getUserByUID(socket.user.uid);
            console.log('👤 [SOCKET DEBUG] User details retrieved:', userDetails.name);
            
            const teacher = await getTeacherByUserId(userDetails._id);
            
            if (!teacher) {
                console.error('❌ [SOCKET DEBUG] Teacher profile not found for user:', socket.user.name);
                return socket.emit('attendanceError', { 
                    message: 'Teacher profile not found' 
                });
            }

            console.log('👨‍🏫 [SOCKET DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
            const attendanceRecord = await markStudentPresent(session_id, student_id, teacher._id);
            console.log('📝 [SOCKET DEBUG] Attendance record created/updated:', JSON.stringify(attendanceRecord, null, 2));
            
            // Notify all participants in the attendance session
            const attendanceUpdateData = {
                session_id,
                student_id,
                status: 'present',
                attendanceRecord,
                updated_by: socket.user.name,
                updated_at: new Date()
            };
            io.to(`attendance_${session_id}`).emit('attendanceUpdated', attendanceUpdateData);
            console.log('📤 [SOCKET DEBUG] attendanceUpdated event emitted to room: attendance_' + session_id);
            console.log('📝 [SOCKET DEBUG] Attendance update data:', JSON.stringify(attendanceUpdateData, null, 2));

            // Notify the teacher
            const teacherNotificationData = {
                session_id,
                student_id,
                attendanceRecord
            };
            socket.emit('studentMarkedPresent', teacherNotificationData);
            console.log('📤 [SOCKET DEBUG] studentMarkedPresent event emitted to teacher');
            console.log('✅ [SOCKET DEBUG] Student marked present successfully');
        } catch (error) {
            console.error('❌ [SOCKET DEBUG] Error marking student present:', error.message);
            console.error('❌ [SOCKET DEBUG] Error stack:', error.stack);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // Mark student absent
    socket.on('markStudentAbsent', async ({ session_id, student_id }) => {
        console.log('🎯 [SOCKET DEBUG] markStudentAbsent event received');
        console.log('📝 [SOCKET DEBUG] Session ID:', session_id, 'Student ID:', student_id);
        console.log('👤 [SOCKET DEBUG] Teacher:', socket.user.name, '(ID:', socket.user._id, ')');
        console.log('🔌 [SOCKET DEBUG] Socket ID:', socket.id);
        
        try {
            const userDetails = await getUserByUID(socket.user.uid);
            console.log('👤 [SOCKET DEBUG] User details retrieved:', userDetails.name);
            
            const teacher = await getTeacherByUserId(userDetails._id);
            
            if (!teacher) {
                console.error('❌ [SOCKET DEBUG] Teacher profile not found for user:', socket.user.name);
                return socket.emit('attendanceError', { 
                    message: 'Teacher profile not found' 
                });
            }

            console.log('👨‍🏫 [SOCKET DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
            const attendanceRecord = await markStudentAbsent(session_id, student_id, teacher._id);
            console.log('📝 [SOCKET DEBUG] Attendance record created/updated:', JSON.stringify(attendanceRecord, null, 2));
            
            // Notify all participants in the attendance session
            const attendanceUpdateData = {
                session_id,
                student_id,
                status: 'absent',
                attendanceRecord,
                updated_by: socket.user.name,
                updated_at: new Date()
            };
            io.to(`attendance_${session_id}`).emit('attendanceUpdated', attendanceUpdateData);
            console.log('📤 [SOCKET DEBUG] attendanceUpdated event emitted to room: attendance_' + session_id);
            console.log('📝 [SOCKET DEBUG] Attendance update data:', JSON.stringify(attendanceUpdateData, null, 2));

            // Notify the teacher
            const teacherNotificationData = {
                session_id,
                student_id,
                attendanceRecord
            };
            socket.emit('studentMarkedAbsent', teacherNotificationData);
            console.log('📤 [SOCKET DEBUG] studentMarkedAbsent event emitted to teacher');
            console.log('✅ [SOCKET DEBUG] Student marked absent successfully');
        } catch (error) {
            console.error('❌ [SOCKET DEBUG] Error marking student absent:', error.message);
            console.error('❌ [SOCKET DEBUG] Error stack:', error.stack);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // Get attendance session data
    socket.on('getAttendanceSessionData', async ({ session_id }) => {
        console.log('🎯 [SOCKET DEBUG] getAttendanceSessionData event received');
        console.log('📝 [SOCKET DEBUG] Session ID:', session_id);
        console.log('👤 [SOCKET DEBUG] Teacher:', socket.user.name, '(ID:', socket.user._id, ')');
        console.log('🔌 [SOCKET DEBUG] Socket ID:', socket.id);
        
        try {
            const userDetails = await getUserByUID(socket.user.uid);
            console.log('👤 [SOCKET DEBUG] User details retrieved:', userDetails.name);
            
            const teacher = await getTeacherByUserId(userDetails._id);
            
            if (!teacher) {
                console.error('❌ [SOCKET DEBUG] Teacher profile not found for user:', socket.user.name);
                return socket.emit('attendanceError', { 
                    message: 'Teacher profile not found' 
                });
            }

            console.log('👨‍🏫 [SOCKET DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
            const sessionData = await getAttendanceSessionData(session_id, teacher._id);
            console.log('📊 [SOCKET DEBUG] Session data retrieved:', {
                attendanceRecordsCount: sessionData.attendanceRecords?.length || 0,
                totalStudents: sessionData.statistics?.totalStudents || 0,
                attendanceRate: sessionData.statistics?.attendanceRate || 0
            });
            
            const responseData = {
                session_id,
                ...sessionData
            };
            socket.emit('attendanceSessionData', responseData);
            console.log('📤 [SOCKET DEBUG] attendanceSessionData event emitted to teacher');
            console.log('✅ [SOCKET DEBUG] Attendance session data sent successfully');
        } catch (error) {
            console.error('❌ [SOCKET DEBUG] Error getting attendance session data:', error.message);
            console.error('❌ [SOCKET DEBUG] Error stack:', error.stack);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // Bulk update attendance
    socket.on('bulkUpdateAttendance', async ({ session_id, attendanceUpdates }) => {
        console.log('🎯 [SOCKET DEBUG] bulkUpdateAttendance event received');
        console.log('📝 [SOCKET DEBUG] Session ID:', session_id);
        console.log('📊 [SOCKET DEBUG] Attendance updates count:', attendanceUpdates?.length || 0);
        console.log('👤 [SOCKET DEBUG] Teacher:', socket.user.name, '(ID:', socket.user._id, ')');
        console.log('🔌 [SOCKET DEBUG] Socket ID:', socket.id);
        console.log('📋 [SOCKET DEBUG] Attendance updates:', JSON.stringify(attendanceUpdates, null, 2));
        
        try {
            const userDetails = await getUserByUID(socket.user.uid);
            console.log('👤 [SOCKET DEBUG] User details retrieved:', userDetails.name);
            
            const teacher = await getTeacherByUserId(userDetails._id);
            
            if (!teacher) {
                console.error('❌ [SOCKET DEBUG] Teacher profile not found for user:', socket.user.name);
                return socket.emit('attendanceError', { 
                    message: 'Teacher profile not found' 
                });
            }

            console.log('👨‍🏫 [SOCKET DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
            const updatedRecords = await bulkUpdateAttendance(session_id, attendanceUpdates, teacher._id);
            console.log('📊 [SOCKET DEBUG] Bulk update completed, records updated:', updatedRecords.length);
            
            // Notify all participants in the attendance session
            const bulkUpdateData = {
                session_id,
                updatedRecords,
                updated_by: socket.user.name,
                updated_at: new Date()
            };
            io.to(`attendance_${session_id}`).emit('attendanceBulkUpdated', bulkUpdateData);
            console.log('📤 [SOCKET DEBUG] attendanceBulkUpdated event emitted to room attendance_' + session_id);

            // Notify the teacher
            const completeData = {
                session_id,
                updatedRecords,
                totalUpdated: updatedRecords.length
            };
            socket.emit('attendanceBulkUpdateComplete', completeData);
            console.log('📤 [SOCKET DEBUG] attendanceBulkUpdateComplete event emitted to teacher');
            console.log('✅ [SOCKET DEBUG] Bulk attendance update completed successfully');
        } catch (error) {
            console.error('❌ [SOCKET DEBUG] Error bulk updating attendance:', error.message);
            console.error('❌ [SOCKET DEBUG] Error stack:', error.stack);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // End attendance session
    socket.on('endAttendanceSession', async ({ session_id }) => {
        console.log('🔚 Ending attendance session:', session_id);
        try {
            const attendanceSession = activeAttendanceSessions.get(session_id);
            if (!attendanceSession) {
                return socket.emit('attendanceError', { 
                    message: 'Attendance session not found' 
                });
            }

            // Verify teacher authorization
            const userDetails = await getUserByUID(socket.user.uid);
            const teacher = await getTeacherByUserId(userDetails._id);
            
            if (!teacher || teacher._id.toString() !== attendanceSession.teacher_id) {
                return socket.emit('attendanceError', { 
                    message: 'Only the session teacher can end attendance' 
                });
            }

            // Get final attendance data
            const finalData = await getAttendanceSessionData(session_id, teacher._id);

            // Notify all participants that session ended
            io.to(`attendance_${session_id}`).emit('attendanceSessionEnded', {
                session_id,
                finalData,
                ended_by: socket.user.name,
                ended_at: new Date()
            });

            // Emit course-level event for real-time tracking to subscribed clients
            const courseId = attendanceSession.course_id;
            const sessionEndedData = {
                course_id: courseId,
                session_id,
                teacher_id: teacher._id.toString(),
                teacher_name: teacher.name,
                final_statistics: finalData.statistics,
                ended_by: socket.user.name,
                ended_at: new Date()
            };
            
            // Broadcast to course-specific room
            io.to(`course_${courseId}`).emit('courseSessionEnded', sessionEndedData);

            // Remove active session
            activeAttendanceSessions.delete(session_id);
            
            // Send updated active sessions list to course subscribers
            const activeSessions = [];
            for (const [sessionId, sessionData] of activeAttendanceSessions) {
                if (sessionData.course_id === courseId) {
                    activeSessions.push({
                        sessionId,
                        teacherId: sessionData.teacher_id,
                        studentCount: sessionData.students.size,
                        startedAt: sessionData.started_at
                    });
                }
            }
            
            io.to(`course_${courseId}`).emit('activeSessionsData', {
                course_id: courseId,
                activeSessions
            });

            socket.emit('attendanceSessionEndedConfirm', {
                session_id,
                finalData
            });

            console.log('🔚 Attendance session ended successfully');
            console.log('📡 Course session ended event emitted for course:', courseId);
        } catch (error) {
            console.error('❌ Error ending attendance session:', error);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // ==================== END ATTENDANCE MANAGEMENT ====================

    // ==================== COURSE-LEVEL ACTIVE SESSION TRACKING ====================
    
    // Check for active sessions in a specific course
    socket.on('checkActiveSessions', async (data) => {
        try {
            const { course_id } = data;
            
            if (!course_id) {
                socket.emit('activeSessionsError', { 
                    message: 'Course ID is required' 
                });
                return;
            }

            // Find active sessions for this course
            const activeSessions = [];
            for (const [sessionId, sessionData] of activeAttendanceSessions) {
                // Filter sessions by course_id
                if (sessionData.course_id === course_id) {
                    activeSessions.push({
                        sessionId,
                        teacherId: sessionData.teacher_id,
                        studentCount: sessionData.students.size,
                        startedAt: sessionData.started_at
                    });
                }
            }

            socket.emit('activeSessionsData', {
                course_id,
                activeSessions
            });

            console.log('📊 Active sessions checked for course:', course_id);
        } catch (error) {
            console.error('❌ Error checking active sessions:', error);
            socket.emit('activeSessionsError', { 
                message: error.message 
            });
        }
    });

    // Get online students in attendance session (for teachers)
    socket.on('getOnlineStudents', async ({ session_id }) => {
        console.log('🎯 [SOCKET DEBUG] getOnlineStudents event received');
        console.log('📝 [SOCKET DEBUG] Session ID:', session_id);
        console.log('👤 [SOCKET DEBUG] Requester:', socket.user.name, '(ID:', socket.user._id, ')');
        
        try {
            const attendanceSession = activeAttendanceSessions.get(session_id);
            
            if (!attendanceSession) {
                console.error('❌ [SOCKET DEBUG] Attendance session not found:', session_id);
                return socket.emit('attendanceError', { 
                    message: 'Attendance session not found' 
                });
            }

            // Check if requester is the teacher of this session
            const userDetails = await getUserByUID(socket.user.uid);
            const teacher = await getTeacherByUserId(userDetails._id);
            
            if (!teacher || teacher._id.toString() !== attendanceSession.teacher_id) {
                console.error('❌ [SOCKET DEBUG] Unauthorized access to session data');
                return socket.emit('attendanceError', { 
                    message: 'Unauthorized access' 
                });
            }

            // Get online students list with their details
            const onlineStudents = [];
            for (const studentId of attendanceSession.students) {
                const studentSocketId = activeUsers.get(studentId);
                if (studentSocketId) {
                    // Student is currently online
                    const studentSocket = io.sockets.sockets.get(studentSocketId);
                    if (studentSocket && studentSocket.user) {
                        try {
                            // Get student data with roll and profile picture
                            const studentData = await Student.findOne({ user_id: studentId })
                                .populate('user_id', 'name profile_picture');
                            
                            onlineStudents.push({
                                student_id: studentId,
                                student_name: studentData?.user_id?.name || studentSocket.user.name,
                                roll: studentData?.roll || null,
                                profile_picture: studentData?.user_id?.profile_picture || null,
                                socket_id: studentSocketId,
                                joined_at: new Date() // You might want to track actual join time
                            });
                        } catch (error) {
                            console.error('❌ [SOCKET DEBUG] Error fetching student data for:', studentId, error);
                            // Fallback to basic data if student lookup fails
                            onlineStudents.push({
                                student_id: studentId,
                                student_name: studentSocket.user.name,
                                roll: null,
                                profile_picture: null,
                                socket_id: studentSocketId,
                                joined_at: new Date()
                            });
                        }
                    }
                }
            }

            const onlineStudentsData = {
                session_id,
                total_joined: attendanceSession.students.size,
                online_count: onlineStudents.length,
                online_students: onlineStudents,
                retrieved_at: new Date()
            };

            socket.emit('onlineStudentsData', onlineStudentsData);
            console.log('📤 [SOCKET DEBUG] onlineStudentsData event emitted');
            console.log('📊 [SOCKET DEBUG] Online students count:', onlineStudents.length);
            
        } catch (error) {
            console.error('❌ [SOCKET DEBUG] Error getting online students:', error.message);
            socket.emit('attendanceError', { 
                message: error.message 
            });
        }
    });

    // ==================== END COURSE-LEVEL ACTIVE SESSION TRACKING ====================

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log('🔌 User disconnected:', socket.id);
        const userId = userSockets.get(socket.id);
        if (userId) {
            console.log('👋 User going offline:', userId);
            activeUsers.delete(userId);
            userSockets.delete(socket.id);
            
            // Remove student from any active attendance sessions
            for (const [sessionId, sessionData] of activeAttendanceSessions) {
                if (sessionData.students.has(userId.toString())) {
                    console.log('📚 [ATTENDANCE] Removing student from session:', sessionId);
                    sessionData.students.delete(userId.toString());
                    
                    // Notify teacher about student going offline
                    const teacherSocket = sessionData.teacher_socket;
                    if (teacherSocket) {
                        try {
                            // Get student data with roll and profile picture
                            const studentData = await Student.findOne({ user_id: userId })
                                .populate('user_id', 'name profile_picture');
                            
                            const studentOfflineData = {
                                session_id: sessionId,
                                student_id: userId,
                                student_name: studentData?.user_id?.name || socket.user?.name || 'Unknown Student',
                                roll: studentData?.roll || null,
                                profile_picture: studentData?.user_id?.profile_picture || null,
                                disconnected_at: new Date(),
                                remaining_online_count: sessionData.students.size
                            };
                            io.to(teacherSocket).emit('studentLeftAttendance', studentOfflineData);
                            console.log('📤 [ATTENDANCE] studentLeftAttendance event emitted to teacher');
                            console.log('📝 [ATTENDANCE] Student offline data:', JSON.stringify(studentOfflineData, null, 2));
                        } catch (error) {
                            console.error('❌ [ATTENDANCE] Error fetching student data for disconnect notification:', error);
                            // Fallback to basic data if student lookup fails
                            const studentOfflineData = {
                                session_id: sessionId,
                                student_id: userId,
                                student_name: socket.user?.name || 'Unknown Student',
                                roll: null,
                                profile_picture: null,
                                disconnected_at: new Date(),
                                remaining_online_count: sessionData.students.size
                            };
                            io.to(teacherSocket).emit('studentLeftAttendance', studentOfflineData);
                            console.log('📤 [ATTENDANCE] studentLeftAttendance event emitted to teacher (fallback)');
                        }
                    }
                    
                    // Update course-level active sessions data for subscribed clients
                    const courseId = sessionData.course_id;
                    if (courseId) {
                        const activeSessions = [];
                        for (const [sid, sdata] of activeAttendanceSessions) {
                            if (sdata.course_id === courseId) {
                                activeSessions.push({
                                    sessionId: sid,
                                    teacherId: sdata.teacher_id,
                                    studentCount: sdata.students.size,
                                    startedAt: sdata.started_at
                                });
                            }
                        }
                        
                        io.to(`course_${courseId}`).emit('activeSessionsData', {
                            course_id: courseId,
                            activeSessions
                        });
                        console.log('📊 [ATTENDANCE] Updated active sessions data for course:', courseId);
                    }
                }
            }
            
            // End any active calls
            const callSession = activeCallSessions.get(userId);
            if (callSession) {
                console.log('📞 Ending active call session for user:', userId);
                const otherParty = callSession.caller === userId ? callSession.receiver : callSession.caller;
                const otherPartySocket = activeUsers.get(otherParty);
                if (otherPartySocket) {
                    io.to(otherPartySocket).emit('callEnded');
                }
                activeCallSessions.delete(userId);
            }

            console.log('📢 Broadcasting user offline status');
            console.log('📊 Remaining active users:', activeUsers.size);
            io.emit('userOffline', {
                userId,
                onlineUsers: Array.from(activeUsers.keys())
            });
        }
    });
});

const PORT = process.env.CHAT_PORT || 4002;
server.listen(PORT, () => {
    console.log('🚀 Chat server running on port', PORT);
    console.log('📡 Socket.IO server ready for connections');
    console.log('🔗 WebSocket endpoint: ws://localhost:' + PORT);
    console.log('📊 Server started at:', new Date().toISOString());
});
