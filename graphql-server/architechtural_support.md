# Real-Time Attendance System Architecture Requirements

## Overview
This document outlines the architectural requirements for implementing a real-time attendance system using GraphQL API and Socket.IO for live updates.

## Current System Analysis

### Existing Components
1. **GraphQL Mutations**: `startAttendanceSession`, `endAttendanceSession`, `markAttendance`
2. **Socket.IO Infrastructure**: Basic socket service exists in `socket_services.dart`
3. **Frontend Views**: 
   - Home view with join button
   - Attendance view for teachers
   - Class details view for students
4. **Notification System**: Already implemented for tasks

## Required Backend Architecture

### 1. GraphQL Server Enhancements

#### New/Updated Mutations
```graphql
# Start attendance session
mutation startAttendanceSession($courseId: ID!) {
  startAttendanceSession(courseId: $courseId) {
    success
    message
    session {
      _id
      courseId
      topic
      date
      isActive
      studentsPresent {
        studentId
        status
        markedAt
      }
    }
    totalStudents
  }
}

# Join attendance session (for students)
mutation joinAttendanceSession($sessionId: ID!) {
  joinAttendanceSession(sessionId: $sessionId) {
    success
    message
    studentStatus
  }
}

# Mark student attendance
mutation markStudentAttendance($sessionId: ID!, $studentId: ID!, $status: AttendanceStatus!) {
  markStudentAttendance(sessionId: $sessionId, studentId: $studentId, status: $status) {
    success
    message
    attendance {
      studentId
      status
      markedAt
    }
  }
}

# End attendance session
mutation endAttendanceSession($sessionId: ID!) {
  endAttendanceSession(sessionId: $sessionId) {
    success
    message
    finalAttendance {
      totalStudents
      presentCount
      absentCount
    }
  }
}
```

#### New Queries
```graphql
# Get active session for course
query getActiveSession($courseId: ID!) {
  getActiveSession(courseId: $courseId) {
    _id
    isActive
    topic
    date
    studentsOnline {
      studentId
      name
      isOnline
      joinedAt
    }
  }
}

# Get student attendance history
query getStudentAttendanceHistory($courseId: ID!, $studentId: ID!) {
  getStudentAttendanceHistory(courseId: $courseId, studentId: $studentId) {
    totalSessions
    attendedSessions
    attendancePercentage
    attendanceRecords {
      sessionId
      date
      status
      markedAt
    }
  }
}
```

#### Types
```graphql
enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

type AttendanceSession {
  _id: ID!
  courseId: ID!
  topic: String
  date: String!
  isActive: Boolean!
  createdBy: ID!
  studentsPresent: [StudentAttendance!]!
  studentsOnline: [OnlineStudent!]!
  createdAt: String!
  endedAt: String
}

type StudentAttendance {
  studentId: ID!
  status: AttendanceStatus!
  markedAt: String!
}

type OnlineStudent {
  studentId: ID!
  name: String!
  isOnline: Boolean!
  joinedAt: String!
}
```

### 2. Socket.IO Server Requirements

#### Server-Side Events to Implement

```javascript
// Namespace: /attendance
const attendanceNamespace = io.of('/attendance');

attendanceNamespace.on('connection', (socket) => {
  // Authentication
  socket.on('authenticate', (token) => {
    // Verify JWT token and set user context
  });

  // Teacher starts session
  socket.on('startAttendanceSession', async (data) => {
    const { courseId, topic } = data;
    // Create session in database
    // Emit to all students in course
    socket.to(`course_${courseId}`).emit('attendanceSessionStarted', {
      sessionId,
      courseId,
      topic,
      startTime: new Date()
    });
  });

  // Student joins session
  socket.on('joinAttendanceSession', async (data) => {
    const { sessionId, studentId } = data;
    // Join session room
    socket.join(`session_${sessionId}`);
    // Update online status
    // Emit to teacher
    socket.to(`session_${sessionId}_teacher`).emit('studentJoined', {
      studentId,
      name: student.name,
      joinedAt: new Date()
    });
  });

  // Teacher marks attendance
  socket.on('markStudentAttendance', async (data) => {
    const { sessionId, studentId, status } = data;
    // Update database
    // Emit to student
    socket.to(`student_${studentId}`).emit('attendanceMarked', {
      sessionId,
      status,
      markedAt: new Date()
    });
    // Emit to all teachers in session
    socket.to(`session_${sessionId}_teacher`).emit('attendanceUpdated', {
      studentId,
      status,
      markedAt: new Date()
    });
  });

  // Teacher ends session
  socket.on('endAttendanceSession', async (data) => {
    const { sessionId } = data;
    // Update database
    // Emit to all participants
    attendanceNamespace.to(`session_${sessionId}`).emit('attendanceSessionEnded', {
      sessionId,
      endTime: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Update online status
    // Notify teacher if student disconnects
  });
});
```

#### Client-Side Events to Handle

```javascript
// Events the Flutter app should listen to:

// For Students:
- 'attendanceSessionStarted' // Show join button
- 'attendanceMarked' // Show notification
- 'attendanceSessionEnded' // Hide join button, update records

// For Teachers:
- 'studentJoined' // Update online students list
- 'studentLeft' // Update online students list
- 'attendanceUpdated' // Real-time attendance updates
```

### 3. Database Schema Requirements

#### AttendanceSession Collection
```javascript
{
  _id: ObjectId,
  courseId: ObjectId,
  topic: String,
  date: Date,
  isActive: Boolean,
  createdBy: ObjectId, // Teacher ID
  studentsPresent: [{
    studentId: ObjectId,
    status: String, // 'present', 'absent', 'late'
    markedAt: Date
  }],
  studentsOnline: [{
    studentId: ObjectId,
    joinedAt: Date,
    leftAt: Date
  }],
  createdAt: Date,
  endedAt: Date
}
```

#### Enhanced Course Collection
```javascript
{
  // ... existing fields
  totalSessions: Number, // Auto-increment when session ends
  activeSessionId: ObjectId // Reference to current active session
}
```

## Frontend Implementation Requirements

### 1. Socket Service Enhancement

```dart
// lib/services/socket_services.dart
class SocketService {
  // Add attendance namespace
  IO.Socket? attendanceSocket;
  
  void initAttendanceSocket() {
    attendanceSocket = IO.io('${baseUrl}/attendance', {
      'transports': ['websocket'],
      'auth': {'token': token}
    });
  }
  
  // Student methods
  void joinAttendanceSession(String sessionId) {
    attendanceSocket?.emit('joinAttendanceSession', {
      'sessionId': sessionId,
      'studentId': currentUserId
    });
  }
  
  // Teacher methods
  void startAttendanceSession(String courseId, String topic) {
    attendanceSocket?.emit('startAttendanceSession', {
      'courseId': courseId,
      'topic': topic
    });
  }
  
  void markStudentAttendance(String sessionId, String studentId, String status) {
    attendanceSocket?.emit('markStudentAttendance', {
      'sessionId': sessionId,
      'studentId': studentId,
      'status': status
    });
  }
}
```

### 2. State Management

```dart
// lib/controllers/attendance/realtime_attendance_controller.dart
class RealtimeAttendanceController {
  final SocketService _socketService;
  
  // For students
  ValueNotifier<bool> isSessionActive = ValueNotifier(false);
  ValueNotifier<String?> activeSessionId = ValueNotifier(null);
  
  // For teachers
  ValueNotifier<List<OnlineStudent>> onlineStudents = ValueNotifier([]);
  ValueNotifier<Map<String, String>> attendanceStatus = ValueNotifier({});
  
  void listenToAttendanceEvents() {
    // Student events
    _socketService.attendanceSocket?.on('attendanceSessionStarted', (data) {
      isSessionActive.value = true;
      activeSessionId.value = data['sessionId'];
    });
    
    _socketService.attendanceSocket?.on('attendanceMarked', (data) {
      // Show notification
      _showAttendanceNotification(data['status']);
    });
    
    // Teacher events
    _socketService.attendanceSocket?.on('studentJoined', (data) {
      // Update online students list
    });
    
    _socketService.attendanceSocket?.on('attendanceUpdated', (data) {
      // Update attendance status in real-time
    });
  }
}
```

### 3. Notification Service Enhancement

```dart
// lib/services/notification_service.dart
class NotificationService {
  void showAttendanceNotification(String status) {
    final message = status == 'present' 
        ? 'You have been marked present! ✅'
        : 'You have been marked absent ❌';
    
    // Use existing notification system
    _showLocalNotification(
      title: 'Attendance Update',
      body: message,
      type: 'attendance'
    );
  }
}
```

## Implementation Flow

### Student Flow
1. Student opens home page
2. If active session exists for any enrolled course, show "Join Class" button
3. Student clicks join → Socket connects to session
4. Teacher sees student online
5. Teacher marks attendance → Student gets real-time notification
6. Session ends → Student's attendance record updates

### Teacher Flow
1. Teacher opens attendance view
2. Clicks "Start Session" → GraphQL mutation + Socket event
3. Students receive notification and can join
4. Teacher sees real-time list of online students
5. Teacher marks attendance → Real-time updates to all participants
6. Teacher ends session → Final attendance calculation

## Security Considerations

1. **Authentication**: All socket connections must be authenticated with JWT
2. **Authorization**: Students can only join sessions for enrolled courses
3. **Rate Limiting**: Prevent spam joining/leaving
4. **Data Validation**: Validate all socket event data

## Performance Considerations

1. **Room Management**: Use Socket.IO rooms for efficient broadcasting
2. **Connection Pooling**: Reuse socket connections
3. **Data Caching**: Cache active sessions and online students
4. **Cleanup**: Properly clean up disconnected sockets

## Testing Requirements

1. **Unit Tests**: Test socket event handlers
2. **Integration Tests**: Test GraphQL + Socket.IO flow
3. **Load Tests**: Test with multiple concurrent sessions
4. **Real-time Tests**: Verify real-time updates work correctly

This architecture ensures a robust, scalable, and real-time attendance system that meets all the specified requirements.