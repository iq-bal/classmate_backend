# Course-Level Active Attendance Session Tracking

This document describes the newly implemented features for real-time tracking of active attendance sessions at the course level.

## Overview

The system now supports:
1. **GraphQL Queries** to check for active sessions by course ID
2. **Real-time Socket.IO Events** for course-level session tracking
3. **Enhanced Service Functions** for active session management

## GraphQL API

### New Queries

#### 1. Get Active Session for a Course
```graphql
activeSession(course_id: ID!): ActiveSessionResult
```

**Description:** Retrieves active attendance session for a specific course
**Authorization:** Teachers and enrolled students can access
**Parameters:**
- `course_id`: The unique identifier of the course

**Response Type:**
```graphql
type ActiveSessionResult {
  hasActiveSession: Boolean!
  session: AttendanceSessionData
  message: String
}
```

**Example Query:**
```graphql
query GetActiveCourseSession {
  activeSession(course_id: "64a1b2c3d4e5f6789012346") {
    hasActiveSession
    session {
      session {
        _id
        topic
        date
        start_time
        end_time
      }
      statistics {
        totalStudents
        presentCount
        absentCount
        attendanceRate
      }
    }
    message
  }
}
```

#### 2. Get All Active Sessions (Admin/Teacher)
```graphql
allActiveSessions: [ActiveSessionSummary!]!
```

**Description:** Retrieves all currently active attendance sessions
**Authorization:** Teachers and admins only
**Parameters:** None

**Response Type:**
```graphql
type ActiveSessionSummary {
  session_id: ID!
  course_id: ID!
  course_title: String!
  teacher_name: String!
  topic: String!
  total_students: Int!
  present_count: Int!
  started_at: String!
}
```

**Example Query:**
```graphql
query GetAllActiveSessions {
  allActiveSessions {
    session_id
    course_id
    course_title
    teacher_name
    topic
    total_students
    present_count
    started_at
  }
}
```

## Socket.IO Events

### New Events

#### 1. Course Session Started
**Event:** `courseSessionStarted`
**Trigger:** When a teacher starts an attendance session
**Payload:**
```javascript
{
  course_id: "64a1b2c3d4e5f6789012346",
  session_id: "64a1b2c3d4e5f6789012345",
  teacher_id: "64a1b2c3d4e5f6789012347",
  teacher_name: "Dr. Jane Smith",
  session_topic: "Introduction to Algorithms",
  total_students: 45,
  started_at: "2024-01-15T10:00:00Z"
}
```

#### 2. Course Session Ended
**Event:** `courseSessionEnded`
**Trigger:** When a teacher ends an attendance session
**Payload:**
```javascript
{
  course_id: "64a1b2c3d4e5f6789012346",
  session_id: "64a1b2c3d4e5f6789012345",
  teacher_id: "64a1b2c3d4e5f6789012347",
  teacher_name: "Dr. Jane Smith",
  final_statistics: {
    totalStudents: 45,
    presentCount: 42,
    absentCount: 3,
    attendanceRate: 93.33
  },
  ended_by: "Dr. Jane Smith",
  ended_at: "2024-01-15T11:30:00Z"
}
```

#### 3. Check Active Sessions
**Event:** `checkActiveSessions` (Client → Server)
**Purpose:** Request active sessions for a specific course
**Payload:**
```javascript
{
  course_id: "64a1b2c3d4e5f6789012346"
}
```

**Response Event:** `activeSessionsData`
**Payload:**
```javascript
{
  course_id: "64a1b2c3d4e5f6789012346",
  activeSessions: [
    {
      sessionId: "64a1b2c3d4e5f6789012345",
      teacherId: "64a1b2c3d4e5f6789012347",
      studentCount: 3,
      startedAt: "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Error Event:** `activeSessionsError`
**Payload:**
```javascript
{
  message: "Course ID is required"
}
```

## Frontend Integration Examples

### React Hook for Active Session Tracking
```javascript
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { io } from 'socket.io-client';
import { GET_ACTIVE_SESSION } from './queries';

export const useActiveCourseSession = (courseId) => {
  const [activeSession, setActiveSession] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // GraphQL query for initial state
  const { data, refetch } = useQuery(GET_ACTIVE_SESSION, {
    variables: { course_id: courseId },
    skip: !courseId
  });
  
  useEffect(() => {
    if (!courseId) return;
    
    // Initialize socket connection
    const socketConnection = io('ws://localhost:4002');
    setSocket(socketConnection);
    
    // Listen for course-level events
    socketConnection.on('courseSessionStarted', (data) => {
      if (data.course_id === courseId) {
        setActiveSession(data);
        refetch(); // Refresh GraphQL data
      }
    });
    
    socketConnection.on('courseSessionEnded', (data) => {
      if (data.course_id === courseId) {
        setActiveSession(null);
        refetch(); // Refresh GraphQL data
      }
    });
    
    // Request current active sessions
    socketConnection.emit('checkActiveSessions', { course_id: courseId });
    
    socketConnection.on('activeSessionsData', (data) => {
      if (data.course_id === courseId && data.activeSessions.length > 0) {
        setActiveSession(data.activeSessions[0]);
      }
    });
    
    return () => {
      socketConnection.disconnect();
    };
  }, [courseId, refetch]);
  
  return {
    activeSession: data?.activeSession || activeSession,
    hasActiveSession: !!(data?.activeSession?.hasActiveSession || activeSession),
    socket
  };
};
```

### GraphQL Queries
```javascript
import { gql } from '@apollo/client';

export const GET_ACTIVE_SESSION = gql`
  query GetActiveSession($course_id: ID!) {
    activeSession(course_id: $course_id) {
      hasActiveSession
      session {
        session {
          _id
          topic
          date
          start_time
          end_time
        }
        statistics {
          totalStudents
          presentCount
          absentCount
          attendanceRate
        }
      }
      message
    }
  }
`;

export const GET_ALL_ACTIVE_SESSIONS = gql`
  query GetAllActiveSessions {
    allActiveSessions {
      session_id
      course_id
      course_title
      teacher_name
      topic
      total_students
      present_count
      started_at
    }
  }
`;
```

### Course Dashboard Component
```javascript
import React from 'react';
import { useActiveCourseSession } from './hooks/useActiveCourseSession';

const CourseDashboard = ({ courseId }) => {
  const { activeSession, hasActiveSession } = useActiveCourseSession(courseId);
  
  return (
    <div className="course-dashboard">
      <h2>Course Dashboard</h2>
      
      {hasActiveSession ? (
        <div className="active-session-alert">
          <h3>🟢 Active Attendance Session</h3>
          <p>Topic: {activeSession.session_topic}</p>
          <p>Students: {activeSession.total_students}</p>
          <p>Started: {new Date(activeSession.started_at).toLocaleTimeString()}</p>
          <button onClick={() => joinSession(activeSession.session_id)}>
            Join Session
          </button>
        </div>
      ) : (
        <div className="no-active-session">
          <p>No active attendance session</p>
        </div>
      )}
    </div>
  );
};
```

## Implementation Details

### Service Functions

#### `getActiveSession(course_id, user_id, user_type)`
- Checks for active attendance sessions in a specific course
- Verifies user permissions (teacher or enrolled student)
- Uses recent attendance records as proxy for active sessions
- Returns session data with statistics if active session found

#### `getAllActiveSessions(user_id)`
- Retrieves all active sessions across all courses
- Restricted to teachers and admins
- Groups attendance records by session
- Returns summary data for dashboard views

### Enhanced Socket.IO Integration

#### Active Sessions Map Enhancement
```javascript
// Enhanced structure with course_id
activeAttendanceSessions.set(session_id, {
  teacher_id: teacher._id.toString(),
  teacher_socket: socket.id,
  students: new Set(),
  started_at: new Date(),
  course_id: result.session.course_id._id.toString() // NEW
});
```

#### Real-time Event Broadcasting
- `courseSessionStarted`: Broadcast to all clients when session starts
- `courseSessionEnded`: Broadcast to all clients when session ends
- `checkActiveSessions`: On-demand checking for specific courses

## Benefits

1. **Real-time Awareness**: Students and teachers know immediately when attendance sessions are active
2. **Course-level Tracking**: Filter active sessions by specific courses
3. **Efficient Querying**: Both GraphQL and Socket.IO options for different use cases
4. **Permission-based Access**: Proper authorization for different user types
5. **Dashboard Integration**: Easy integration into admin and teacher dashboards

## Usage Scenarios

1. **Student App**: Show notification when attendance session starts for enrolled courses
2. **Teacher Dashboard**: Overview of all active sessions across courses
3. **Course Page**: Display active session status and join options
4. **Admin Panel**: Monitor all active attendance sessions system-wide
5. **Mobile Notifications**: Push notifications when sessions start/end

This implementation provides a comprehensive solution for real-time course-level attendance session tracking while maintaining proper security and performance considerations.