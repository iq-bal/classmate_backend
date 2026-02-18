# Real-Time Active Session Tracking

This document explains how to implement real-time active session tracking in your frontend application using Socket.IO. This allows users to know instantly when attendance sessions start or end in their courses without needing to reload the page.

## Overview

The system provides real-time notifications about attendance session status changes at the course level. Users can subscribe to specific courses and receive instant updates about:
- When new attendance sessions start
- When attendance sessions end
- Current list of active sessions in a course

## Socket.IO Events

### Client-Side Events (Emit to Server)

#### 1. Subscribe to Course Updates
```javascript
socket.emit('subscribeToCourse', {
    course_id: 'your_course_id_here'
});
```

#### 2. Unsubscribe from Course Updates
```javascript
socket.emit('unsubscribeFromCourse', {
    course_id: 'your_course_id_here'
});
```

#### 3. Check Active Sessions (One-time Query)
```javascript
socket.emit('checkActiveSessions', {
    course_id: 'your_course_id_here'
});
```

### Server-Side Events (Listen from Server)

#### 1. Course Session Started
Received when a new attendance session starts in a subscribed course:
```javascript
socket.on('courseSessionStarted', (data) => {
    console.log('New session started:', data);
    // data structure:
    // {
    //     course_id: 'course_id',
    //     session_id: 'session_id',
    //     teacher_id: 'teacher_id',
    //     teacher_name: 'Teacher Name',
    //     started_by: 'Teacher Name',
    //     started_at: '2024-01-15T10:30:00.000Z'
    // }
});
```

#### 2. Course Session Ended
Received when an attendance session ends in a subscribed course:
```javascript
socket.on('courseSessionEnded', (data) => {
    console.log('Session ended:', data);
    // data structure:
    // {
    //     course_id: 'course_id',
    //     session_id: 'session_id',
    //     teacher_id: 'teacher_id',
    //     teacher_name: 'Teacher Name',
    //     final_statistics: { present: 15, absent: 3, total: 18 },
    //     ended_by: 'Teacher Name',
    //     ended_at: '2024-01-15T11:30:00.000Z'
    // }
});
```

#### 3. Active Sessions Data
Received with current list of active sessions (sent immediately upon subscription and after session changes):
```javascript
socket.on('activeSessionsData', (data) => {
    console.log('Active sessions updated:', data);
    // data structure:
    // {
    //     course_id: 'course_id',
    //     activeSessions: [
    //         {
    //             sessionId: 'session_id_1',
    //             teacherId: 'teacher_id',
    //             studentCount: 25,
    //             startedAt: '2024-01-15T10:30:00.000Z'
    //         },
    //         // ... more sessions
    //     ]
    // }
});
```

#### 4. Active Sessions Response (One-time)
Received in response to `checkActiveSessions` query:
```javascript
socket.on('activeSessionsResponse', (data) => {
    console.log('Current active sessions:', data);
    // Same structure as activeSessionsData
});
```

#### 5. Error Handling
```javascript
socket.on('activeSessionsError', (error) => {
    console.error('Active sessions error:', error.message);
});
```

## Frontend Implementation Example

### React Hook for Course Session Tracking

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useCourseSessionTracking = (courseId, authToken) => {
    const [socket, setSocket] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!courseId || !authToken) return;

        // Initialize socket connection
        const newSocket = io('http://localhost:4002', {
            auth: {
                token: authToken
            }
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            // Subscribe to course updates
            newSocket.emit('subscribeToCourse', {
                course_id: courseId
            });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Listen for session events
        newSocket.on('courseSessionStarted', (data) => {
            console.log('Session started:', data);
            // Handle session start (e.g., show notification)
        });

        newSocket.on('courseSessionEnded', (data) => {
            console.log('Session ended:', data);
            // Handle session end (e.g., show notification)
        });

        newSocket.on('activeSessionsData', (data) => {
            if (data.course_id === courseId) {
                setActiveSessions(data.activeSessions);
            }
        });

        newSocket.on('activeSessionsError', (error) => {
            console.error('Error:', error.message);
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
            if (newSocket) {
                newSocket.emit('unsubscribeFromCourse', {
                    course_id: courseId
                });
                newSocket.disconnect();
            }
        };
    }, [courseId, authToken]);

    return {
        socket,
        activeSessions,
        isConnected,
        hasActiveSessions: activeSessions.length > 0
    };
};

export default useCourseSessionTracking;
```

### Usage in Component

```javascript
import React from 'react';
import useCourseSessionTracking from './hooks/useCourseSessionTracking';

const CourseComponent = ({ courseId, authToken }) => {
    const { activeSessions, isConnected, hasActiveSessions } = useCourseSessionTracking(courseId, authToken);

    return (
        <div>
            <h2>Course Dashboard</h2>
            
            {/* Connection Status */}
            <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>

            {/* Active Sessions Indicator */}
            {hasActiveSessions ? (
                <div className="active-sessions">
                    <h3>🔴 Live Attendance Sessions ({activeSessions.length})</h3>
                    {activeSessions.map(session => (
                        <div key={session.sessionId} className="session-card">
                            <p>Session ID: {session.sessionId}</p>
                            <p>Students: {session.studentCount}</p>
                            <p>Started: {new Date(session.startedAt).toLocaleTimeString()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-sessions">
                    <p>No active attendance sessions</p>
                </div>
            )}
        </div>
    );
};

export default CourseComponent;
```

## Key Features

1. **Real-time Updates**: No page refresh needed - updates are pushed instantly
2. **Course-specific**: Only receive updates for courses you're subscribed to
3. **Automatic Subscription**: Get current active sessions immediately upon subscription
4. **Connection Management**: Proper cleanup when component unmounts
5. **Error Handling**: Graceful error handling for network issues

## Best Practices

1. **Subscribe on Mount**: Subscribe to course updates when component mounts
2. **Unsubscribe on Unmount**: Always unsubscribe to prevent memory leaks
3. **Handle Reconnection**: Implement reconnection logic for network interruptions
4. **Show Connection Status**: Display connection status to users
5. **Cache Active Sessions**: Store active sessions in component state for immediate access

## Authentication

Make sure to include the JWT token in the socket connection:
```javascript
const socket = io('http://localhost:4002', {
    auth: {
        token: 'your_jwt_token_here'
    }
});
```

The server will authenticate the user and associate the socket with their user account for proper authorization.