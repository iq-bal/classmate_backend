# Attendance System - GraphQL Queries & Mutations

This document provides a comprehensive list of all available GraphQL queries and mutations for the attendance system.

## Table of Contents
- [Types & Enums](#types--enums)
- [Input Types](#input-types)
- [Queries](#queries)
- [Mutations](#mutations)
- [Usage Examples](#usage-examples)
- [Authentication & Authorization](#authentication--authorization)

## Types & Enums

### Attendance Type
```graphql
type Attendance {
  id: ID!
  session_id: Session!
  student_id: Student!
  status: String!
  remarks: String
  timestamp: String!
  createdAt: String!
  updatedAt: String!
}
```

### AttendanceSessionData Type
```graphql
type AttendanceSessionData {
  session: Session!
  attendanceRecords: [Attendance!]!
  statistics: AttendanceStatistics!
}
```

### AttendanceStatistics Type
```graphql
type AttendanceStatistics {
  totalStudents: Int!
  presentCount: Int!
  absentCount: Int!
  lateCount: Int!
  excusedCount: Int!
  attendanceRate: Float!
}
```

### AttendanceSessionResult Type
```graphql
type AttendanceSessionResult {
  session: Session!
  attendanceRecords: [Attendance!]!
  totalStudents: Int!
}
```

### AttendanceStatus Enum
```graphql
enum AttendanceStatus {
  present
  absent
  late
  excused
}
```

## Input Types

### AttendanceInput
```graphql
input AttendanceInput {
  session_id: ID!
  student_id: ID!
  status: String!
  remarks: String
}
```

### AttendanceUpdateInput
```graphql
input AttendanceUpdateInput {
  student_id: ID!
  status: String!
  remarks: String
}
```

## Queries

### 1. Get All Attendances
```graphql
attendances: [Attendance!]!
```
**Description:** Retrieves all attendance records in the system.
**Authorization:** Teacher role required
**Returns:** Array of all attendance records

### 2. Get Single Attendance
```graphql
attendance(id: ID!): Attendance
```
**Description:** Retrieves a specific attendance record by ID.
**Parameters:**
- `id`: The unique identifier of the attendance record
**Authorization:** Teacher role required
**Returns:** Single attendance record or null

### 3. Get Attendance by Session
```graphql
attendanceBySession(session_id: ID!): [Attendance!]!
```
**Description:** Retrieves all attendance records for a specific session.
**Parameters:**
- `session_id`: The unique identifier of the session
**Authorization:** Teacher role required
**Returns:** Array of attendance records for the session

### 4. Get Attendance by Student
```graphql
attendanceByStudent(student_id: ID!): [Attendance!]!
```
**Description:** Retrieves all attendance records for a specific student.
**Parameters:**
- `student_id`: The unique identifier of the student
**Authorization:** Teacher role required
**Returns:** Array of attendance records for the student

### 5. Get Attendance Session Data
```graphql
attendanceSessionData(session_id: ID!): AttendanceSessionData!
```
**Description:** Retrieves comprehensive attendance data for a session including statistics.
**Parameters:**
- `session_id`: The unique identifier of the session
**Authorization:** Teacher role required
**Returns:** Complete session data with statistics

## Mutations

### 1. Mark Attendance
```graphql
markAttendance(attendanceInput: AttendanceInput!): Attendance
```
**Description:** Marks attendance for a student in a session.
**Parameters:**
- `attendanceInput`: Input object containing session_id, student_id, status, and optional remarks
**Authorization:** Teacher role required
**Returns:** Created attendance record

### 2. Update Attendance
```graphql
updateAttendance(id: ID!, status: String!): Attendance
```
**Description:** Updates the status of an existing attendance record.
**Parameters:**
- `id`: The unique identifier of the attendance record
- `status`: New attendance status (present, absent, late, excused)
**Authorization:** Teacher role required
**Returns:** Updated attendance record

### 3. Delete Attendance
```graphql
deleteAttendance(id: ID!): Attendance
```
**Description:** Deletes an attendance record.
**Parameters:**
- `id`: The unique identifier of the attendance record to delete
**Authorization:** Teacher role required
**Returns:** Deleted attendance record

### 4. Start Attendance Session
```graphql
startAttendanceSession(session_id: ID!): AttendanceSessionResult!
```
**Description:** Initiates an attendance session for a class.
**Parameters:**
- `session_id`: The unique identifier of the session
**Authorization:** Teacher role required
**Returns:** Session result with initial data

### 5. Mark Student Present
```graphql
markStudentPresent(session_id: ID!, student_id: ID!): Attendance!
```
**Description:** Quickly marks a student as present in a session.
**Parameters:**
- `session_id`: The unique identifier of the session
- `student_id`: The unique identifier of the student
**Authorization:** Teacher role required
**Returns:** Created/updated attendance record

### 6. Mark Student Absent
```graphql
markStudentAbsent(session_id: ID!, student_id: ID!): Attendance!
```
**Description:** Quickly marks a student as absent in a session.
**Parameters:**
- `session_id`: The unique identifier of the session
- `student_id`: The unique identifier of the student
**Authorization:** Teacher role required
**Returns:** Created/updated attendance record

### 7. Bulk Update Attendance
```graphql
bulkUpdateAttendance(session_id: ID!, attendanceUpdates: [AttendanceUpdateInput!]!): [Attendance!]!
```
**Description:** Updates attendance for multiple students in a single operation.
**Parameters:**
- `session_id`: The unique identifier of the session
- `attendanceUpdates`: Array of attendance updates for multiple students
**Authorization:** Teacher role required
**Returns:** Array of updated attendance records

## Usage Examples

### Example 1: Start an Attendance Session
```graphql
mutation StartAttendanceSession {
  startAttendanceSession(session_id: "64a1b2c3d4e5f6789012345") {
    session {
      _id
      topic
      date
      start_time
      end_time
    }
    attendanceRecords {
      id
      student_id {
        _id
        name
        email
      }
      status
      timestamp
    }
    totalStudents
  }
}
```

### Example 2: Get Session Attendance Data with Statistics
```graphql
query GetAttendanceSessionData {
  attendanceSessionData(session_id: "64a1b2c3d4e5f6789012345") {
    session {
      _id
      topic
      date
      course_id {
        title
        code
      }
    }
    statistics {
      totalStudents
      presentCount
      absentCount
      lateCount
      attendanceRate
    }
    attendanceRecords {
      id
      student_id {
        _id
        name
        email
        department
      }
      status
      remarks
      timestamp
    }
  }
}
```

### Example 3: Bulk Update Multiple Students
```graphql
mutation BulkUpdateAttendance {
  bulkUpdateAttendance(
    session_id: "64a1b2c3d4e5f6789012345"
    attendanceUpdates: [
      {
        student_id: "64a1b2c3d4e5f6789012346"
        status: "present"
      }
      {
        student_id: "64a1b2c3d4e5f6789012347"
        status: "absent"
        remarks: "Sick leave"
      }
      {
        student_id: "64a1b2c3d4e5f6789012348"
        status: "late"
        remarks: "Arrived 10 minutes late"
      }
    ]
  ) {
    id
    student_id {
      _id
      name
    }
    status
    remarks
    timestamp
  }
}
```

### Example 4: Get Student's Attendance History
```graphql
query GetStudentAttendanceHistory {
  attendanceByStudent(student_id: "64a1b2c3d4e5f6789012346") {
    id
    session_id {
      _id
      topic
      date
      course_id {
        title
        code
      }
    }
    status
    remarks
    timestamp
    createdAt
  }
}
```

### Example 5: Get All Attendance for a Session
```graphql
query GetSessionAttendance {
  attendanceBySession(session_id: "64a1b2c3d4e5f6789012345") {
    id
    student_id {
      _id
      name
      email
      department
      semester
    }
    status
    remarks
    timestamp
    marked_by {
      _id
      name
    }
  }
}
```

### Example 6: Mark Individual Student Present
```graphql
mutation MarkStudentPresent {
  markStudentPresent(
    session_id: "64a1b2c3d4e5f6789012345"
    student_id: "64a1b2c3d4e5f6789012346"
  ) {
    id
    student_id {
      _id
      name
    }
    status
    timestamp
  }
}
```

### Example 7: Update Existing Attendance Record
```graphql
mutation UpdateAttendanceStatus {
  updateAttendance(
    id: "64a1b2c3d4e5f6789012349"
    status: "excused"
  ) {
    id
    student_id {
      _id
      name
    }
    status
    remarks
    timestamp
    updatedAt
  }
}
```

## Authentication & Authorization

### Required Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Role Requirements
- **All Queries:** Teacher role required
- **All Mutations:** Teacher role required
- **Teacher Verification:** System verifies that the authenticated user has a valid teacher profile

### Error Responses
```graphql
# Authentication Error
{
  "errors": [
    {
      "message": "Authentication failed",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}

# Authorization Error
{
  "errors": [
    {
      "message": "Access denied. Teacher role required.",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}

# Teacher Profile Not Found
{
  "errors": [
    {
      "message": "Teacher profile not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

## Status Values

The following status values are supported for attendance:
- `"present"` - Student is present
- `"absent"` - Student is absent
- `"late"` - Student arrived late
- `"excused"` - Student has an excused absence

## Notes

1. **Real-time Updates:** The attendance system also supports Socket.IO for real-time updates. GraphQL mutations will trigger Socket.IO events to notify connected clients.

2. **Session Validation:** All operations validate that the session exists and the teacher has permission to manage attendance for that session.

3. **Student Enrollment:** The system verifies that students are enrolled in the course before allowing attendance operations.

4. **Timestamps:** All timestamps are stored in ISO 8601 format and returned as strings.

5. **Statistics Calculation:** Attendance rates and statistics are calculated in real-time based on current attendance data.

6. **Bulk Operations:** Use bulk update mutations for better performance when updating multiple students simultaneously.

7. **Error Handling:** All operations include comprehensive error handling with descriptive error messages.

This comprehensive list covers all available GraphQL operations for the attendance system. For real-time functionality, refer to the Socket.IO documentation in the main attendance system documentation.