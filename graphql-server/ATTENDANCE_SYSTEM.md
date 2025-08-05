# Real-Time Attendance System Documentation

## Overview

The Real-Time Attendance System allows teachers to take attendance for their class sessions in real-time using both GraphQL API and Socket.IO for live updates. Teachers can start attendance sessions, mark students present/absent, and get real-time feedback on student participation.

## Features

### Core Functionality
- **Real-time attendance taking** with Socket.IO integration
- **Teacher authorization** - Only course teachers can manage attendance
- **Live student tracking** - See which students join the session
- **Bulk attendance updates** for efficient management
- **Session management** - Start, monitor, and end attendance sessions
- **Real-time notifications** for all participants

### Security Features
- JWT-based authentication for Socket.IO connections
- Teacher authorization checks for all attendance operations
- Session validation and access control
- Secure student enrollment verification

## Database Schema

### AttendanceRecord Model
```javascript
{
  session_id: ObjectId,     // Reference to ClassSession
  student_id: ObjectId,     // Reference to User (student)
  status: String,           // 'present', 'absent', 'late'
  remarks: String,          // Optional notes
  marked_at: Date,          // When attendance was marked
  marked_by: ObjectId       // Reference to User (teacher)
}
```

### ClassSession Model
```javascript
{
  course_id: ObjectId,      // Reference to Course
  date: Date,               // Session date
  start_time: String,       // Session start time
  end_time: String,         // Session end time
  topic: String             // Session topic
}
```

## GraphQL API

### Types

```graphql
type AttendanceRecord {
  _id: ID!
  session_id: ID!
  student_id: ID!
  status: AttendanceStatus!
  remarks: String
  marked_at: String!
  marked_by: ID!
}

type AttendanceSessionData {
  session: ClassSession!
  course: Course!
  totalStudents: Int!
  presentCount: Int!
  absentCount: Int!
  attendanceRecords: [AttendanceRecord!]!
  statistics: AttendanceStatistics!
}

type AttendanceStatistics {
  attendanceRate: Float!
  totalEnrolled: Int!
  totalPresent: Int!
  totalAbsent: Int!
}

type AttendanceSessionResult {
  success: Boolean!
  message: String!
  session: ClassSession
  totalStudents: Int
  attendanceRecords: [AttendanceRecord!]
}

enum AttendanceStatus {
  present
  absent
  late
}

input AttendanceUpdateInput {
  student_id: ID!
  status: AttendanceStatus!
  remarks: String
}
```

### Queries

```graphql
# Get attendance records for a session
attendanceBySession(session_id: ID!): [AttendanceRecord!]!

# Get attendance session data with statistics
attendanceSessionData(session_id: ID!): AttendanceSessionData!
```

### Mutations

```graphql
# Start an attendance session
startAttendanceSession(session_id: ID!): AttendanceSessionResult!

# Mark a student as present
markStudentPresent(session_id: ID!, student_id: ID!): AttendanceRecord!

# Mark a student as absent
markStudentAbsent(session_id: ID!, student_id: ID!): AttendanceRecord!

# Bulk update attendance records
bulkUpdateAttendance(
  session_id: ID!
  attendanceUpdates: [AttendanceUpdateInput!]!
): [AttendanceRecord!]!
```

## Socket.IO Events

### Client to Server Events

#### `startAttendanceSession`
Start a new attendance session (Teacher only)
```javascript
socket.emit('startAttendanceSession', {
  session_id: 'session_id_here'
});
```

#### `joinAttendanceSession`
Join an active attendance session (Students)
```javascript
socket.emit('joinAttendanceSession', {
  session_id: 'session_id_here'
});
```

#### `markStudentPresent`
Mark a student as present (Teacher only)
```javascript
socket.emit('markStudentPresent', {
  session_id: 'session_id_here',
  student_id: 'student_id_here'
});
```

#### `markStudentAbsent`
Mark a student as absent (Teacher only)
```javascript
socket.emit('markStudentAbsent', {
  session_id: 'session_id_here',
  student_id: 'student_id_here'
});
```

#### `getAttendanceSessionData`
Get current attendance session data (Teacher only)
```javascript
socket.emit('getAttendanceSessionData', {
  session_id: 'session_id_here'
});
```

#### `bulkUpdateAttendance`
Update multiple attendance records at once (Teacher only)
```javascript
socket.emit('bulkUpdateAttendance', {
  session_id: 'session_id_here',
  attendanceUpdates: [
    { student_id: 'student1_id', status: 'present' },
    { student_id: 'student2_id', status: 'absent', remarks: 'Sick' }
  ]
});
```

#### `endAttendanceSession`
End the attendance session (Teacher only)
```javascript
socket.emit('endAttendanceSession', {
  session_id: 'session_id_here'
});
```

### Server to Client Events

#### `attendanceSessionStarted`
Notifies teacher that attendance session has started
```javascript
socket.on('attendanceSessionStarted', (data) => {
  console.log('Session started:', data.session_id);
  console.log('Total students:', data.totalStudents);
  console.log('Initial records:', data.attendanceRecords);
});
```

#### `attendanceSessionJoined`
Confirms student has joined the session
```javascript
socket.on('attendanceSessionJoined', (data) => {
  console.log('Joined session:', data.session_id);
  console.log('Message:', data.message);
});
```

#### `studentJoinedAttendance`
Notifies teacher when a student joins (Teacher only)
```javascript
socket.on('studentJoinedAttendance', (data) => {
  console.log('Student joined:', data.student_name);
  console.log('Student ID:', data.student_id);
  console.log('Joined at:', data.joined_at);
});
```

#### `attendanceUpdated`
Notifies all participants when attendance is updated
```javascript
socket.on('attendanceUpdated', (data) => {
  console.log('Attendance updated for student:', data.student_id);
  console.log('New status:', data.status);
  console.log('Updated by:', data.updated_by);
});
```

#### `studentMarkedPresent`
Confirms student was marked present (Teacher only)
```javascript
socket.on('studentMarkedPresent', (data) => {
  console.log('Student marked present:', data.student_id);
  console.log('Attendance record:', data.attendanceRecord);
});
```

#### `studentMarkedAbsent`
Confirms student was marked absent (Teacher only)
```javascript
socket.on('studentMarkedAbsent', (data) => {
  console.log('Student marked absent:', data.student_id);
  console.log('Attendance record:', data.attendanceRecord);
});
```

#### `attendanceSessionData`
Provides current session data (Teacher only)
```javascript
socket.on('attendanceSessionData', (data) => {
  console.log('Session data:', data.session);
  console.log('Statistics:', data.statistics);
  console.log('Attendance records:', data.attendanceRecords);
});
```

#### `attendanceBulkUpdated`
Notifies all participants of bulk updates
```javascript
socket.on('attendanceBulkUpdated', (data) => {
  console.log('Bulk update completed');
  console.log('Updated records:', data.updatedRecords);
  console.log('Updated by:', data.updated_by);
});
```

#### `attendanceSessionEnded`
Notifies all participants that session has ended
```javascript
socket.on('attendanceSessionEnded', (data) => {
  console.log('Session ended by:', data.ended_by);
  console.log('Final data:', data.finalData);
});
```

#### `attendanceError`
Notifies of any errors during attendance operations
```javascript
socket.on('attendanceError', (error) => {
  console.error('Attendance error:', error.message);
});
```

## Usage Examples

### Frontend Implementation (React)

```javascript
import io from 'socket.io-client';
import { useState, useEffect } from 'react';

const AttendanceManager = ({ sessionId, userRole, authToken }) => {
  const [socket, setSocket] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [students, setStudents] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      auth: { token: authToken }
    });

    // Set up event listeners
    newSocket.on('attendanceSessionStarted', (data) => {
      setAttendanceData(data);
      setIsSessionActive(true);
      console.log('Attendance session started');
    });

    newSocket.on('attendanceUpdated', (data) => {
      // Update local state with new attendance data
      setStudents(prev => prev.map(student => 
        student._id === data.student_id 
          ? { ...student, status: data.status }
          : student
      ));
    });

    newSocket.on('studentJoinedAttendance', (data) => {
      console.log(`${data.student_name} joined the session`);
    });

    newSocket.on('attendanceError', (error) => {
      alert(`Error: ${error.message}`);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [authToken]);

  const startAttendanceSession = () => {
    if (socket && userRole === 'teacher') {
      socket.emit('startAttendanceSession', { session_id: sessionId });
    }
  };

  const markStudentPresent = (studentId) => {
    if (socket && userRole === 'teacher') {
      socket.emit('markStudentPresent', {
        session_id: sessionId,
        student_id: studentId
      });
    }
  };

  const markStudentAbsent = (studentId) => {
    if (socket && userRole === 'teacher') {
      socket.emit('markStudentAbsent', {
        session_id: sessionId,
        student_id: studentId
      });
    }
  };

  const joinAttendanceSession = () => {
    if (socket && userRole === 'student') {
      socket.emit('joinAttendanceSession', { session_id: sessionId });
    }
  };

  return (
    <div className="attendance-manager">
      {userRole === 'teacher' && (
        <div>
          <button onClick={startAttendanceSession}>Start Attendance</button>
          {isSessionActive && (
            <div>
              <h3>Student List</h3>
              {students.map(student => (
                <div key={student._id} className="student-item">
                  <span>{student.name}</span>
                  <button onClick={() => markStudentPresent(student._id)}>
                    Mark Present
                  </button>
                  <button onClick={() => markStudentAbsent(student._id)}>
                    Mark Absent
                  </button>
                  <span className={`status ${student.status}`}>
                    {student.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {userRole === 'student' && (
        <div>
          <button onClick={joinAttendanceSession}>Join Attendance</button>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
```

### Mobile Implementation (React Native)

```javascript
import { io } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

const AttendanceScreen = ({ sessionId, userRole, authToken }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);

  useEffect(() => {
    const newSocket = io('http://your-server.com:3001', {
      auth: { token: authToken }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to attendance server');
    });

    newSocket.on('attendanceSessionJoined', (data) => {
      Alert.alert('Success', 'Joined attendance session');
    });

    newSocket.on('attendanceUpdated', (data) => {
      if (data.student_id === currentUserId) {
        setAttendanceStatus(data.status);
      }
    });

    newSocket.on('attendanceError', (error) => {
      Alert.alert('Error', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinSession = () => {
    if (socket && isConnected) {
      socket.emit('joinAttendanceSession', { session_id: sessionId });
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Attendance Session
      </Text>
      
      {userRole === 'student' && (
        <TouchableOpacity
          style={{
            backgroundColor: '#007bff',
            padding: 15,
            borderRadius: 5,
            alignItems: 'center'
          }}
          onPress={joinSession}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>
            Join Attendance
          </Text>
        </TouchableOpacity>
      )}
      
      {attendanceStatus && (
        <Text style={{ marginTop: 20, fontSize: 16 }}>
          Status: {attendanceStatus}
        </Text>
      )}
    </View>
  );
};

export default AttendanceScreen;
```

## GraphQL Usage Examples

### Start Attendance Session
```graphql
mutation StartAttendance {
  startAttendanceSession(session_id: "session_id_here") {
    success
    message
    session {
      _id
      topic
      date
    }
    totalStudents
  }
}
```

### Get Attendance Data
```graphql
query GetAttendanceData {
  attendanceSessionData(session_id: "session_id_here") {
    session {
      _id
      topic
      date
    }
    course {
      _id
      title
    }
    totalStudents
    presentCount
    absentCount
    statistics {
      attendanceRate
      totalEnrolled
    }
    attendanceRecords {
      _id
      student_id
      status
      marked_at
    }
  }
}
```

### Bulk Update Attendance
```graphql
mutation BulkUpdateAttendance {
  bulkUpdateAttendance(
    session_id: "session_id_here"
    attendanceUpdates: [
      { student_id: "student1_id", status: present }
      { student_id: "student2_id", status: absent, remarks: "Sick" }
    ]
  ) {
    _id
    student_id
    status
    remarks
    marked_at
  }
}
```

## Security Considerations

### Authentication
- All Socket.IO connections require valid JWT tokens
- GraphQL mutations require authentication
- Teacher authorization is verified for all attendance operations

### Authorization
- Only course teachers can start/manage attendance sessions
- Students can only join sessions for courses they're enrolled in
- Session data is filtered based on user permissions

### Data Validation
- All input parameters are validated
- Session existence and teacher ownership are verified
- Student enrollment is checked before allowing operations

## Best Practices

### For Teachers
1. **Start sessions early** - Begin attendance before class starts
2. **Monitor real-time** - Watch for students joining the session
3. **Use bulk updates** - Efficient for large classes
4. **End sessions properly** - Always end sessions when class is over

### For Students
1. **Join promptly** - Connect to attendance as soon as class begins
2. **Stay connected** - Maintain socket connection throughout class
3. **Check status** - Verify your attendance was recorded correctly

### For Developers
1. **Handle disconnections** - Implement reconnection logic
2. **Cache data locally** - Store attendance data for offline scenarios
3. **Error handling** - Provide clear error messages to users
4. **Performance** - Use pagination for large student lists

## Troubleshooting

### Common Issues

#### Socket Connection Failed
- Check server URL and port
- Verify JWT token is valid
- Ensure CORS is properly configured

#### Teacher Authorization Failed
- Verify user has teacher role
- Check if teacher is assigned to the course
- Ensure session belongs to teacher's course

#### Student Cannot Join Session
- Verify student is enrolled in the course
- Check if attendance session is active
- Ensure session_id is correct

### Error Codes
- `TEACHER_NOT_FOUND` - Teacher profile not found
- `SESSION_NOT_FOUND` - Class session doesn't exist
- `UNAUTHORIZED` - User not authorized for operation
- `SESSION_NOT_ACTIVE` - Attendance session not running
- `STUDENT_NOT_ENROLLED` - Student not enrolled in course

## Future Enhancements

### Planned Features
- **Geolocation verification** - Ensure students are physically present
- **QR code attendance** - Quick attendance marking via QR codes
- **Attendance analytics** - Detailed reports and trends
- **Auto-attendance** - Automatic marking based on session participation
- **Late arrival tracking** - Track and manage late arrivals
- **Attendance reminders** - Push notifications for attendance

### Integration Possibilities
- **Calendar integration** - Sync with Google Calendar/Outlook
- **LMS integration** - Connect with learning management systems
- **Biometric verification** - Fingerprint or face recognition
- **Video call integration** - Automatic attendance for online classes

This comprehensive attendance system provides a robust foundation for real-time attendance management with room for future enhancements and integrations.