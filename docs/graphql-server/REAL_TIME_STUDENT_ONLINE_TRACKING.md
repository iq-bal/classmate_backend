# Real-Time Student Online Tracking Documentation

This document explains how to implement and use the real-time student online tracking system for attendance sessions. This feature allows teachers to see which students are currently online and participating in their attendance sessions in real-time.

## Overview

The system provides real-time visibility into student online status during attendance sessions through Socket.IO events. Teachers can:
- See when students join sessions (come online)
- Get notified when students disconnect (go offline)
- Query the current list of online students
- Track real-time student count changes

## Socket.IO Events

### 1. Student Joins Session

**Event:** `studentJoinedAttendance`
**Direction:** Server → Teacher
**Triggered:** When a student successfully joins an attendance session

**Data Structure:**
```javascript
{
  session_id: "64a1b2c3d4e5f6789012345",
  student_id: "64a1b2c3d4e5f6789012348",
  student_name: "John Doe",
  roll: "CS2021001",
  profile_picture: "https://example.com/profiles/john_doe.jpg",
  joined_at: "2024-01-15T10:05:00.000Z"
}
```

**Usage Example:**
```javascript
socket.on('studentJoinedAttendance', (data) => {
  console.log(`${data.student_name} is now ONLINE`);
  // Update UI to show student as online
  updateStudentStatus(data.student_id, 'online');
  showNotification(`${data.student_name} joined the session`);
});
```

### 2. Student Goes Offline

**Event:** `studentLeftAttendance`
**Direction:** Server → Teacher
**Triggered:** When a student disconnects from the session

**Data Structure:**
```javascript
{
  session_id: "64a1b2c3d4e5f6789012345",
  student_id: "64a1b2c3d4e5f6789012348",
  student_name: "John Doe",
  roll: "CS2021001",
  profile_picture: "https://example.com/profiles/john_doe.jpg",
  disconnected_at: "2024-01-15T10:15:00.000Z",
  remaining_online_count: 24
}
```

**Usage Example:**
```javascript
socket.on('studentLeftAttendance', (data) => {
  console.log(`${data.student_name} went OFFLINE`);
  // Update UI to show student as offline
  updateStudentStatus(data.student_id, 'offline');
  updateOnlineCount(data.remaining_online_count);
  showNotification(`${data.student_name} left the session`);
});
```

### 3. Get Online Students List

**Request Event:** `getOnlineStudents`
**Direction:** Teacher → Server
**Response Event:** `onlineStudentsData`
**Direction:** Server → Teacher

**Request Data:**
```javascript
{
  session_id: "64a1b2c3d4e5f6789012345"
}
```

**Response Data Structure:**
```javascript
{
  session_id: "64a1b2c3d4e5f6789012345",
  total_joined: 30,
  online_count: 25,
  online_students: [
    {
      student_id: "64a1b2c3d4e5f6789012348",
      student_name: "John Doe",
      roll: "CS2021001",
      profile_picture: "https://example.com/profiles/john_doe.jpg",
      socket_id: "abc123def456",
      joined_at: "2024-01-15T10:05:00.000Z"
    },
    {
      student_id: "64a1b2c3d4e5f6789012349",
      student_name: "Jane Smith",
      roll: "CS2021002",
      profile_picture: "https://example.com/profiles/jane_smith.jpg",
      socket_id: "def456ghi789",
      joined_at: "2024-01-15T10:07:00.000Z"
    }
  ],
  retrieved_at: "2024-01-15T10:20:00.000Z"
}
```

**Usage Example:**
```javascript
// Request online students
socket.emit('getOnlineStudents', { session_id: sessionId });

// Handle response
socket.on('onlineStudentsData', (data) => {
  console.log(`${data.online_count} students are currently online`);
  
  // Update UI with online students list
  updateOnlineStudentsList(data.online_students);
  updateStatistics({
    totalJoined: data.total_joined,
    onlineCount: data.online_count,
    offlineCount: data.total_joined - data.online_count
  });
});
```

### 4. Real-time Course Updates

**Event:** `activeSessionsData`
**Direction:** Server → All Course Subscribers
**Triggered:** When student count changes (join/leave)

**Data Structure:**
```javascript
{
  course_id: "64a1b2c3d4e5f6789012346",
  activeSessions: [
    {
      sessionId: "64a1b2c3d4e5f6789012345",
      teacherId: "64a1b2c3d4e5f6789012347",
      studentCount: 25, // Updated in real-time
      startedAt: "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Implementation Examples

### React Component for Teachers

```javascript
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const OnlineStudentTracker = ({ sessionId, authToken }) => {
  const [socket, setSocket] = useState(null);
  const [onlineStudents, setOnlineStudents] = useState([]);
  const [totalJoined, setTotalJoined] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:4002', {
      auth: { token: authToken }
    });

    // Listen for students joining
    newSocket.on('studentJoinedAttendance', (data) => {
      console.log(`${data.student_name} joined`);
      setOnlineStudents(prev => [
        ...prev.filter(s => s.student_id !== data.student_id),
        {
          student_id: data.student_id,
          student_name: data.student_name,
          roll: data.roll,
          profile_picture: data.profile_picture,
          joined_at: data.joined_at,
          status: 'online'
        }
      ]);
      setOnlineCount(prev => prev + 1);
    });

    // Listen for students leaving
    newSocket.on('studentLeftAttendance', (data) => {
      console.log(`${data.student_name} (${data.roll}) left`);
      setOnlineStudents(prev => 
        prev.map(s => 
          s.student_id === data.student_id 
            ? { ...s, status: 'offline' }
            : s
        )
      );
      setOnlineCount(data.remaining_online_count);
    });

    // Handle online students data
    newSocket.on('onlineStudentsData', (data) => {
      setOnlineStudents(data.online_students.map(s => ({
        ...s,
        status: 'online'
      })));
      setTotalJoined(data.total_joined);
      setOnlineCount(data.online_count);
    });

    // Handle errors
    newSocket.on('attendanceError', (error) => {
      console.error('Attendance error:', error.message);
    });

    setSocket(newSocket);

    // Get initial online students
    newSocket.emit('getOnlineStudents', { session_id: sessionId });

    return () => newSocket.close();
  }, [sessionId, authToken]);

  const refreshOnlineStudents = () => {
    if (socket) {
      socket.emit('getOnlineStudents', { session_id: sessionId });
    }
  };

  return (
    <div className="online-student-tracker">
      <div className="stats">
        <h3>Session Statistics</h3>
        <p>Total Joined: {totalJoined}</p>
        <p>Currently Online: {onlineCount}</p>
        <p>Offline: {totalJoined - onlineCount}</p>
        <button onClick={refreshOnlineStudents}>Refresh</button>
      </div>

      <div className="student-list">
        <h3>Students</h3>
        {onlineStudents.map(student => (
          <div 
            key={student.student_id} 
            className={`student-item ${student.status}`}
          >
            {student.profile_picture && (
              <img 
                src={student.profile_picture} 
                alt={student.student_name}
                className="profile-picture"
              />
            )}
            <span className="name">{student.student_name}</span>
            <span className="roll">({student.roll})</span>
            <span className={`status ${student.status}`}>
              {student.status === 'online' ? '🟢 Online' : '🔴 Offline'}
            </span>
            <span className="joined-time">
              Joined: {new Date(student.joined_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineStudentTracker;
```

### Flutter Implementation

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter/material.dart';

class OnlineStudentTracker {
  IO.Socket? socket;
  List<Map<String, dynamic>> onlineStudents = [];
  int totalJoined = 0;
  int onlineCount = 0;
  
  Function(List<Map<String, dynamic>>)? onStudentsUpdated;
  Function(Map<String, dynamic>)? onStudentJoined;
  Function(Map<String, dynamic>)? onStudentLeft;

  void initializeSocket(String sessionId, String authToken) {
    socket = IO.io('http://localhost:4002', <String, dynamic>{
      'transports': ['websocket'],
      'auth': {'token': authToken}
    });

    // Listen for students joining
    socket!.on('studentJoinedAttendance', (data) {
      print('Student joined: ${data['student_name']} (${data['roll']})');
      
      // Update local list
      onlineStudents.removeWhere((s) => s['student_id'] == data['student_id']);
      onlineStudents.add({
        'student_id': data['student_id'],
        'student_name': data['student_name'],
        'roll': data['roll'],
        'profile_picture': data['profile_picture'],
        'joined_at': data['joined_at'],
        'status': 'online'
      });
      
      onlineCount++;
      onStudentJoined?.call(data);
      onStudentsUpdated?.call(onlineStudents);
    });

    // Listen for students leaving
    socket!.on('studentLeftAttendance', (data) {
      print('Student left: ${data['student_name']} (${data['roll']})');
      
      // Update status to offline
      for (var student in onlineStudents) {
        if (student['student_id'] == data['student_id']) {
          student['status'] = 'offline';
          break;
        }
      }
      
      onlineCount = data['remaining_online_count'];
      onStudentLeft?.call(data);
      onStudentsUpdated?.call(onlineStudents);
    });

    // Handle online students data
    socket!.on('onlineStudentsData', (data) {
      onlineStudents = (data['online_students'] as List)
          .map((s) => {...s, 'status': 'online'})
          .cast<Map<String, dynamic>>()
          .toList();
      
      totalJoined = data['total_joined'];
      onlineCount = data['online_count'];
      onStudentsUpdated?.call(onlineStudents);
    });

    // Handle errors
    socket!.on('attendanceError', (error) {
      print('Attendance error: ${error['message']}');
    });

    socket!.connect();
    
    // Get initial online students
    socket!.emit('getOnlineStudents', {'session_id': sessionId});
  }

  void refreshOnlineStudents(String sessionId) {
    socket?.emit('getOnlineStudents', {'session_id': sessionId});
  }

  Widget buildStudentListItem(Map<String, dynamic> student) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: student['status'] == 'online' 
          ? Colors.green 
          : Colors.grey,
        backgroundImage: student['profile_picture'] != null
          ? NetworkImage(student['profile_picture'])
          : null,
        child: student['profile_picture'] == null
          ? Text(student['student_name'][0])
          : null,
      ),
      title: Text(student['student_name']),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (student['roll'] != null)
            Text('Roll: ${student['roll']}'),
          Text(
            'Joined: ${DateTime.parse(student['joined_at']).toLocal()}'
          ),
        ],
      ),
      trailing: Icon(
        student['status'] == 'online' 
          ? Icons.circle 
          : Icons.circle_outlined,
        color: student['status'] == 'online' 
          ? Colors.green 
          : Colors.grey,
      ),
    );
  }

  void dispose() {
    socket?.disconnect();
    socket?.dispose();
  }
}
```

## Security Features

### Authorization
- Only the teacher who started the session can query online students
- JWT token validation for all Socket.IO connections
- Session ownership verification before providing student data

### Data Privacy
- Student socket IDs are only shared with authorized teachers
- Real-time updates are scoped to specific sessions and courses
- Automatic cleanup when students disconnect

## Best Practices

### For Teachers
1. **Periodic Refresh**: Call `getOnlineStudents` periodically to ensure data accuracy
2. **Connection Handling**: Implement reconnection logic for network interruptions
3. **UI Updates**: Use real-time events for immediate UI updates, periodic queries for data validation
4. **Error Handling**: Always listen for `attendanceError` events

### For Students
1. **Stable Connection**: Maintain stable Socket.IO connection during sessions
2. **Reconnection**: Implement automatic reconnection with session rejoin
3. **Graceful Disconnect**: Properly disconnect when leaving sessions

## Troubleshooting

### Common Issues

**Students not appearing online:**
- Verify Socket.IO connection is established
- Check if student successfully joined the session
- Ensure teacher is listening to the correct events

**Delayed notifications:**
- Check network connectivity
- Verify Socket.IO server is running
- Monitor server logs for connection issues

**Incorrect student counts:**
- Call `getOnlineStudents` to get accurate current state
- Check for duplicate connections from same student
- Verify disconnect handling is working properly

### Debug Commands

```javascript
// Check socket connection status
console.log('Socket connected:', socket.connected);

// Get current online students
socket.emit('getOnlineStudents', { session_id: 'your_session_id' });

// Listen to all events for debugging
socket.onAny((eventName, ...args) => {
  console.log(`Event: ${eventName}`, args);
});
```

## Performance Considerations

- **Efficient Updates**: Real-time events minimize unnecessary API calls
- **Scoped Broadcasting**: Events are sent only to relevant participants
- **Memory Management**: Automatic cleanup prevents memory leaks
- **Connection Pooling**: Socket.IO handles connection optimization

## Integration with Existing Systems

This online tracking system integrates seamlessly with:
- Existing attendance marking system
- Course-level session tracking
- Real-time notifications
- Student engagement analytics

The system maintains separation between "joining a session" (online status) and "being marked present" (attendance status), providing teachers with complete visibility into student participation.