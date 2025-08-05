# Complete Attendance System Documentation

A comprehensive guide to the real-time attendance management system built with GraphQL, Socket.IO, and MongoDB.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Design](#architecture--design)
3. [Database Schema](#database-schema)
4. [GraphQL API Reference](#graphql-api-reference)
5. [Socket.IO Real-time Events](#socketio-real-time-events)
6. [Authentication & Authorization](#authentication--authorization)
7. [Implementation Guide](#implementation-guide)
8. [Usage Examples](#usage-examples)
9. [Error Handling](#error-handling)
10. [Performance Optimization](#performance-optimization)
11. [Security Considerations](#security-considerations)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)
15. [Future Enhancements](#future-enhancements)

---

## System Overview

### What is the Attendance System?

The Attendance System is a modern, real-time solution for managing student attendance in educational institutions. It combines the power of GraphQL for flexible data querying, Socket.IO for real-time updates, and MongoDB for scalable data storage.

### Key Features

🎯 **Core Functionality**
- Real-time attendance tracking with live updates
- Teacher-controlled session management
- Bulk attendance operations for efficiency
- Comprehensive statistics and analytics
- Multi-device support (web, mobile, desktop)

🔐 **Security Features**
- JWT-based authentication
- Role-based access control (Teacher/Student/Admin)
- Session validation and enrollment verification
- Secure data transmission

📊 **Analytics & Reporting**
- Real-time attendance statistics
- Historical attendance tracking
- Attendance rate calculations
- Export capabilities (CSV, PDF)

🔔 **Real-time Features**
- Live session updates via Socket.IO
- Instant notifications for all participants
- Real-time student count and status updates
- Live attendance rate monitoring

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                         │
└─────────────────────────────────────────────────────────────────┘

🖥️  BACKEND
├── Node.js + Express.js (Server Runtime)
├── GraphQL + Apollo Server (API Layer)
├── Socket.IO (Real-time Communication)
├── MongoDB + Mongoose (Database)
├── JWT (Authentication)
└── Firebase (Push Notifications)

📱 FRONTEND
├── React.js / React Native (UI Framework)
├── Apollo Client (GraphQL Client)
├── Socket.IO Client (Real-time Client)
├── Material-UI / Native Base (UI Components)
└── Chart.js (Data Visualization)

☁️  INFRASTRUCTURE
├── MongoDB Atlas (Cloud Database)
├── Firebase Cloud Messaging (Notifications)
├── AWS S3 (File Storage)
└── Docker (Containerization)
```

---

## Architecture & Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ATTENDANCE SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TEACHER APP   │    │   STUDENT APP   │    │   ADMIN PANEL   │
│                 │    │                 │    │                 │
│ • Start Session │    │ • Join Session  │    │ • View Reports  │
│ • Mark Present  │    │ • View Status   │    │ • Analytics     │
│ • Mark Absent   │    │ • Get Updates   │    │ • Export Data   │
│ • Bulk Update   │    │                 │    │                 │
│ • End Session   │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GRAPHQL + SOCKET.IO SERVER                   │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   GraphQL API   │  │   Socket.IO     │  │  Authentication │ │
│  │                 │  │                 │  │                 │ │
│  │ • Queries       │  │ • Real-time     │  │ • JWT Tokens    │ │
│  │ • Mutations     │  │ • Events        │  │ • Role Check    │ │
│  │ • Subscriptions │  │ • Rooms         │  │ • Permissions   │ │
│  │ • Resolvers     │  │ • Broadcasting  │  │ • Validation    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Data Layer    │  │   Business      │  │   Notification  │ │
│  │                 │  │   Logic         │  │   Service       │ │
│  │ • Models        │  │ • Services      │  │ • Push Alerts   │ │
│  │ • Schemas       │  │ • Validation    │  │ • Email Reports │ │
│  │ • Relationships │  │ • Processing    │  │ • SMS Reminders │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │       MONGODB DATABASE       │
                    │                             │
                    │ • AttendanceRecord          │
                    │ • ClassSession              │
                    │ • Student                   │
                    │ • Teacher                   │
                    │ • Course                    │
                    │ • Enrollment                │
                    └─────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ATTENDANCE FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

1. SESSION INITIALIZATION
┌─────────────┐    GraphQL Mutation     ┌─────────────┐    Socket Event    ┌─────────────┐
│   TEACHER   │ ────startAttendance───► │   SERVER    │ ──sessionStarted──► │  STUDENTS   │
│             │                        │             │                    │             │
│ • Selects   │                        │ • Validates │                    │ • Get Alert │
│   Session   │                        │ • Creates   │                    │ • Join Room │
│ • Clicks    │                        │   Room      │                    │             │
│   Start     │                        │ • Notifies  │                    │             │
└─────────────┘                        └─────────────┘                    └─────────────┘

2. STUDENT PARTICIPATION
┌─────────────┐    Socket Event         ┌─────────────┐    Database        ┌─────────────┐
│  STUDENTS   │ ──joinAttendance──────► │   SERVER    │ ──saveRecord──────► │  DATABASE   │
│             │                        │             │                    │             │
│ • Opens App │                        │ • Validates │                    │ • Store     │
│ • Joins     │                        │ • Adds to   │                    │   Student   │
│   Session   │                        │   Room      │                    │ • Link to   │
│             │                        │ • Updates   │                    │   Session   │
└─────────────┘                        └─────────────┘                    └─────────────┘

3. ATTENDANCE MARKING
┌─────────────┐    Socket Event         ┌─────────────┐    Real-time       ┌─────────────┐
│   TEACHER   │ ──markPresent/Absent──► │   SERVER    │ ──statusUpdate────► │ ALL CLIENTS │
│             │                        │             │                    │             │
│ • Views     │                        │ • Updates   │                    │ • Live      │
│   Student   │                        │   Database  │                    │   Updates   │
│   List      │                        │ • Broadcasts│                    │ • Statistics│
│ • Marks     │                        │   Changes   │                    │ • Progress  │
│   Status    │                        │             │                    │             │
└─────────────┘                        └─────────────┘                    └─────────────┘

4. SESSION COMPLETION
┌─────────────┐    Socket Event         ┌─────────────┐    Final Report    ┌─────────────┐
│   TEACHER   │ ──endAttendance───────► │   SERVER    │ ──generateReport──► │ ALL CLIENTS │
│             │                        │             │                    │             │
│ • Reviews   │                        │ • Finalizes │                    │ • Final     │
│   Results   │                        │   Session   │                    │   Summary   │
│ • Ends      │                        │ • Generates │                    │ • Statistics│
│   Session   │                        │   Report    │                    │ • Export    │
└─────────────┘                        └─────────────┘                    └─────────────┘
```

---

## Database Schema

### Core Models

#### AttendanceRecord Model
```javascript
{
  _id: ObjectId,            // Unique identifier
  session_id: ObjectId,     // Reference to ClassSession
  student_id: ObjectId,     // Reference to User (student)
  status: String,           // 'present', 'absent', 'late', 'excused'
  remarks: String,          // Optional notes/comments
  timestamp: Date,          // When attendance was recorded
  marked_at: Date,          // When attendance was marked
  marked_by: ObjectId,      // Reference to User (teacher)
  createdAt: Date,          // Record creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

#### ClassSession Model
```javascript
{
  _id: ObjectId,            // Unique identifier
  course_id: ObjectId,      // Reference to Course
  date: Date,               // Session date
  start_time: String,       // Session start time (HH:MM)
  end_time: String,         // Session end time (HH:MM)
  topic: String,            // Session topic/subject
  description: String,      // Optional session description
  location: String,         // Physical/virtual location
  status: String,           // 'scheduled', 'active', 'completed', 'cancelled'
  created_by: ObjectId,     // Reference to Teacher
  createdAt: Date,          // Record creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

#### Student Model
```javascript
{
  _id: ObjectId,            // Unique identifier
  user_id: ObjectId,        // Reference to User
  student_id: String,       // Student ID number
  department: String,       // Academic department
  semester: String,         // Current semester
  cgpa: Number,             // Current CGPA
  enrollment_year: Number,  // Year of enrollment
  status: String,           // 'active', 'inactive', 'graduated'
  createdAt: Date,          // Record creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

#### Teacher Model
```javascript
{
  _id: ObjectId,            // Unique identifier
  user_id: ObjectId,        // Reference to User
  employee_id: String,      // Employee ID number
  department: String,       // Teaching department
  designation: String,      // Job title/position
  specialization: String,   // Area of expertise
  experience_years: Number, // Years of experience
  status: String,           // 'active', 'inactive', 'retired'
  createdAt: Date,          // Record creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

#### Course Model
```javascript
{
  _id: ObjectId,            // Unique identifier
  title: String,            // Course title
  code: String,             // Course code (e.g., CSE101)
  description: String,      // Course description
  credits: Number,          // Credit hours
  semester: String,         // Semester offered
  department: String,       // Department offering course
  teacher_id: ObjectId,     // Reference to Teacher
  max_students: Number,     // Maximum enrollment
  status: String,           // 'active', 'inactive', 'archived'
  createdAt: Date,          // Record creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

#### Enrollment Model
```javascript
{
  _id: ObjectId,            // Unique identifier
  student_id: ObjectId,     // Reference to Student
  course_id: ObjectId,      // Reference to Course
  enrollment_date: Date,    // Date of enrollment
  status: String,           // 'enrolled', 'dropped', 'completed'
  grade: String,            // Final grade (if completed)
  createdAt: Date,          // Record creation timestamp
  updatedAt: Date           // Last update timestamp
}
```

### Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────────┘

    User
     │
     ├── Student (1:1)
     │    │
     │    └── Enrollment (1:N)
     │         │
     │         └── Course (N:1)
     │              │
     │              └── ClassSession (1:N)
     │                   │
     │                   └── AttendanceRecord (1:N)
     │                        │
     │                        └── Student (N:1)
     │
     └── Teacher (1:1)
          │
          ├── Course (1:N)
          │    │
          │    └── ClassSession (1:N)
          │
          └── AttendanceRecord (1:N) [marked_by]
```

### Indexes for Performance

```javascript
// AttendanceRecord Indexes
db.attendancerecords.createIndex({ "session_id": 1 })
db.attendancerecords.createIndex({ "student_id": 1 })
db.attendancerecords.createIndex({ "session_id": 1, "student_id": 1 }, { unique: true })
db.attendancerecords.createIndex({ "marked_at": -1 })
db.attendancerecords.createIndex({ "status": 1 })

// ClassSession Indexes
db.classsessions.createIndex({ "course_id": 1 })
db.classsessions.createIndex({ "date": -1 })
db.classsessions.createIndex({ "status": 1 })
db.classsessions.createIndex({ "course_id": 1, "date": -1 })

// Enrollment Indexes
db.enrollments.createIndex({ "student_id": 1 })
db.enrollments.createIndex({ "course_id": 1 })
db.enrollments.createIndex({ "student_id": 1, "course_id": 1 }, { unique: true })
db.enrollments.createIndex({ "status": 1 })
```

---

## GraphQL API Reference

### Type Definitions

#### Core Types

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

type AttendanceSessionData {
  session: Session!
  attendanceRecords: [Attendance!]!
  statistics: AttendanceStatistics!
}

type AttendanceStatistics {
  totalStudents: Int!
  presentCount: Int!
  absentCount: Int!
  lateCount: Int!
  excusedCount: Int!
  attendanceRate: Float!
}

type AttendanceSessionResult {
  session: Session!
  attendanceRecords: [Attendance!]!
  totalStudents: Int!
}

enum AttendanceStatus {
  present
  absent
  late
  excused
}
```

#### Input Types

```graphql
input AttendanceInput {
  session_id: ID!
  student_id: ID!
  status: String!
  remarks: String
}

input AttendanceUpdateInput {
  student_id: ID!
  status: String!
  remarks: String
}

input AttendanceFilterInput {
  session_id: ID
  student_id: ID
  status: AttendanceStatus
  date_from: String
  date_to: String
}
```

### Queries

#### 1. Get All Attendances
```graphql
attendances(filter: AttendanceFilterInput): [Attendance!]!
```
**Description:** Retrieves attendance records with optional filtering
**Authorization:** Teacher role required
**Parameters:**
- `filter` (optional): Filter criteria for attendance records

#### 2. Get Single Attendance
```graphql
attendance(id: ID!): Attendance
```
**Description:** Retrieves a specific attendance record by ID
**Authorization:** Teacher role required
**Parameters:**
- `id`: Unique identifier of the attendance record

#### 3. Get Attendance by Session
```graphql
attendanceBySession(session_id: ID!): [Attendance!]!
```
**Description:** Retrieves all attendance records for a specific session
**Authorization:** Teacher role required
**Parameters:**
- `session_id`: Unique identifier of the session

#### 4. Get Attendance by Student
```graphql
attendanceByStudent(student_id: ID!): [Attendance!]!
```
**Description:** Retrieves all attendance records for a specific student
**Authorization:** Teacher role required
**Parameters:**
- `student_id`: Unique identifier of the student

#### 5. Get Attendance Session Data
```graphql
attendanceSessionData(session_id: ID!): AttendanceSessionData!
```
**Description:** Retrieves comprehensive attendance data with statistics
**Authorization:** Teacher role required
**Parameters:**
- `session_id`: Unique identifier of the session

### Mutations

#### 1. Mark Attendance
```graphql
markAttendance(attendanceInput: AttendanceInput!): Attendance
```
**Description:** Records attendance for a student in a session
**Authorization:** Teacher role required
**Parameters:**
- `attendanceInput`: Attendance data including session, student, and status

#### 2. Update Attendance
```graphql
updateAttendance(id: ID!, status: String!): Attendance
```
**Description:** Updates the status of an existing attendance record
**Authorization:** Teacher role required
**Parameters:**
- `id`: Unique identifier of the attendance record
- `status`: New attendance status

#### 3. Delete Attendance
```graphql
deleteAttendance(id: ID!): Attendance
```
**Description:** Removes an attendance record
**Authorization:** Teacher role required
**Parameters:**
- `id`: Unique identifier of the attendance record

#### 4. Start Attendance Session
```graphql
startAttendanceSession(session_id: ID!): AttendanceSessionResult!
```
**Description:** Initiates an attendance session for a class
**Authorization:** Teacher role required
**Parameters:**
- `session_id`: Unique identifier of the session

#### 5. Mark Student Present
```graphql
markStudentPresent(session_id: ID!, student_id: ID!): Attendance!
```
**Description:** Quickly marks a student as present
**Authorization:** Teacher role required
**Parameters:**
- `session_id`: Unique identifier of the session
- `student_id`: Unique identifier of the student

#### 6. Mark Student Absent
```graphql
markStudentAbsent(session_id: ID!, student_id: ID!): Attendance!
```
**Description:** Quickly marks a student as absent
**Authorization:** Teacher role required
**Parameters:**
- `session_id`: Unique identifier of the session
- `student_id`: Unique identifier of the student

#### 7. Bulk Update Attendance
```graphql
bulkUpdateAttendance(session_id: ID!, attendanceUpdates: [AttendanceUpdateInput!]!): [Attendance!]!
```
**Description:** Updates attendance for multiple students simultaneously
**Authorization:** Teacher role required
**Parameters:**
- `session_id`: Unique identifier of the session
- `attendanceUpdates`: Array of attendance updates

---

## Socket.IO Real-time Events

### Event Categories

#### 1. Session Management Events

**`attendance:session:start`**
```javascript
// Emitted when a teacher starts an attendance session
{
  session_id: "64a1b2c3d4e5f6789012345",
  course_id: "64a1b2c3d4e5f6789012346",
  teacher_id: "64a1b2c3d4e5f6789012347",
  session_data: {
    topic: "Introduction to Algorithms",
    date: "2024-01-15",
    start_time: "10:00",
    end_time: "11:30"
  },
  total_students: 45,
  timestamp: "2024-01-15T10:00:00Z"
}
```

**`attendance:session:end`**
```javascript
// Emitted when a teacher ends an attendance session
{
  session_id: "64a1b2c3d4e5f6789012345",
  final_statistics: {
    total_students: 45,
    present_count: 42,
    absent_count: 3,
    late_count: 2,
    attendance_rate: 93.33
  },
  duration: "01:30:00",
  timestamp: "2024-01-15T11:30:00Z"
}
```

#### 2. Attendance Tracking Events

**`attendance:student:join`**
```javascript
// Emitted when a student joins an attendance session
{
  session_id: "64a1b2c3d4e5f6789012345",
  student_id: "64a1b2c3d4e5f6789012348",
  student_info: {
    name: "John Doe",
    student_id: "CSE2021001",
    department: "Computer Science"
  },
  join_time: "2024-01-15T10:05:00Z",
  status: "present"
}
```

**`attendance:student:mark`**
```javascript
// Emitted when a teacher marks student attendance
{
  session_id: "64a1b2c3d4e5f6789012345",
  student_id: "64a1b2c3d4e5f6789012348",
  status: "present", // or "absent", "late", "excused"
  remarks: "Arrived on time",
  marked_by: "64a1b2c3d4e5f6789012347",
  marked_at: "2024-01-15T10:05:00Z"
}
```

**`attendance:bulk:update`**
```javascript
// Emitted when bulk attendance updates are made
{
  session_id: "64a1b2c3d4e5f6789012345",
  updates: [
    {
      student_id: "64a1b2c3d4e5f6789012348",
      status: "present",
      remarks: null
    },
    {
      student_id: "64a1b2c3d4e5f6789012349",
      status: "absent",
      remarks: "Sick leave"
    }
  ],
  updated_by: "64a1b2c3d4e5f6789012347",
  timestamp: "2024-01-15T10:10:00Z"
}
```

#### 3. Statistics Events

**`attendance:statistics:update`**
```javascript
// Emitted when attendance statistics change
{
  session_id: "64a1b2c3d4e5f6789012345",
  statistics: {
    total_students: 45,
    present_count: 40,
    absent_count: 3,
    late_count: 2,
    excused_count: 0,
    attendance_rate: 88.89,
    last_updated: "2024-01-15T10:15:00Z"
  }
}
```

### Socket.IO Room Management

#### Room Structure
```javascript
// Session-based rooms
const sessionRoom = `session:${session_id}`;

// Course-based rooms
const courseRoom = `course:${course_id}`;

// Teacher-specific rooms
const teacherRoom = `teacher:${teacher_id}`;

// Student-specific rooms
const studentRoom = `student:${student_id}`;
```

#### Client Connection Example
```javascript
// Client-side Socket.IO connection
import io from 'socket.io-client';

const socket = io('http://localhost:4001', {
  auth: {
    token: localStorage.getItem('jwt_token')
  }
});

// Join session room
socket.emit('join:session', {
  session_id: '64a1b2c3d4e5f6789012345',
  user_type: 'teacher' // or 'student'
});

// Listen for attendance events
socket.on('attendance:session:start', (data) => {
  console.log('Session started:', data);
  // Update UI to show active session
});

socket.on('attendance:student:mark', (data) => {
  console.log('Student marked:', data);
  // Update attendance list in real-time
});

socket.on('attendance:statistics:update', (data) => {
  console.log('Statistics updated:', data);
  // Update statistics display
});
```

---

## Authentication & Authorization

### JWT Token Structure

```javascript
// JWT Payload
{
  "uid": "firebase_user_id",
  "email": "teacher@university.edu",
  "role": "teacher",
  "user_id": "64a1b2c3d4e5f6789012347",
  "teacher_id": "64a1b2c3d4e5f6789012348",
  "permissions": [
    "attendance:read",
    "attendance:write",
    "session:manage"
  ],
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Role-Based Access Control

#### Teacher Permissions
```javascript
const teacherPermissions = [
  'attendance:read',      // View attendance records
  'attendance:write',     // Mark/update attendance
  'attendance:delete',    // Delete attendance records
  'session:create',       // Create new sessions
  'session:manage',       // Start/end sessions
  'session:read',         // View session data
  'statistics:read',      // View attendance statistics
  'bulk:update',          // Perform bulk operations
  'reports:generate'      // Generate reports
];
```

#### Student Permissions
```javascript
const studentPermissions = [
  'attendance:read:own',  // View own attendance
  'session:join',         // Join attendance sessions
  'statistics:read:own'   // View own statistics
];
```

#### Admin Permissions
```javascript
const adminPermissions = [
  'attendance:read:all',  // View all attendance records
  'attendance:write:all', // Modify any attendance
  'attendance:delete:all',// Delete any attendance
  'session:read:all',     // View all sessions
  'session:manage:all',   // Manage any session
  'statistics:read:all',  // View all statistics
  'reports:generate:all', // Generate any reports
  'users:manage',         // Manage user accounts
  'system:configure'      // System configuration
];
```

### Authentication Middleware

```javascript
// GraphQL Context Authentication
export const createContext = async ({ req }) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details
    const user = await getUserByUID(decodedToken.uid);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: decodedToken,
      userDetails: user,
      isAuthenticated: true
    };
  } catch (error) {
    return {
      user: null,
      userDetails: null,
      isAuthenticated: false,
      error: error.message
    };
  }
};
```

### Socket.IO Authentication

```javascript
// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserByUID(decodedToken.uid);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = decodedToken;
    socket.userDetails = user;
    next();
  } catch (error) {
    next(new Error(`Authentication error: ${error.message}`));
  }
});
```

---

## Implementation Guide

### Backend Setup

#### 1. Project Structure
```
graphql-server/
├── config/
│   ├── database.js
│   ├── firebase.config.js
│   └── environment.js
├── graphql/
│   ├── modules/
│   │   ├── attendance/
│   │   │   ├── attendance.model.js
│   │   │   ├── attendance.typeDefs.js
│   │   │   ├── attendance.resolver.js
│   │   │   └── attendance.service.js
│   │   ├── session/
│   │   ├── student/
│   │   └── teacher/
│   └── utils/
│       ├── check_roles.js
│       └── validators.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── services/
│   ├── socketService.js
│   ├── notificationService.js
│   └── reportService.js
├── models/
│   ├── Attendance.js
│   ├── Session.js
│   ├── Student.js
│   └── Teacher.js
├── server.js
└── package.json
```

#### 2. Environment Configuration
```bash
# .env file
NODE_ENV=development
PORT=4001
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
CORS_ORIGIN=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

#### 3. Dependencies Installation
```bash
npm install apollo-server-express express mongoose socket.io
npm install jsonwebtoken firebase-admin bcryptjs
npm install cors helmet morgan compression
npm install graphql graphql-tools
npm install --save-dev nodemon jest supertest
```

#### 4. Server Setup
```javascript
// server.js
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

import { typeDefs, resolvers } from './graphql/index.js';
import { createContext } from './middleware/auth.js';
import { setupSocketIO } from './services/socketService.js';

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// GraphQL Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production'
});

// Socket.IO Server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Setup Socket.IO handlers
setupSocketIO(io);

// Start server
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  
  const PORT = process.env.PORT || 4001;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🔌 Socket.IO ready at http://localhost:${PORT}`);
  });
};

startServer();
```

### Frontend Integration

#### 1. Apollo Client Setup
```javascript
// apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4001/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('jwt_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
});

export default client;
```

#### 2. Socket.IO Client Setup
```javascript
// socketClient.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    this.socket = io('http://localhost:4001', {
      auth: { token },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  joinSession(sessionId, userType) {
    if (this.socket) {
      this.socket.emit('join:session', {
        session_id: sessionId,
        user_type: userType
      });
    }
  }

  leaveSession(sessionId) {
    if (this.socket) {
      this.socket.emit('leave:session', {
        session_id: sessionId
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default new SocketService();
```

#### 3. React Component Example
```jsx
// AttendanceSession.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import socketService from '../services/socketService';
import {
  GET_ATTENDANCE_SESSION_DATA,
  START_ATTENDANCE_SESSION,
  MARK_STUDENT_PRESENT,
  MARK_STUDENT_ABSENT
} from '../graphql/queries';

const AttendanceSession = ({ sessionId }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_ATTENDANCE_SESSION_DATA, {
    variables: { session_id: sessionId },
    skip: !sessionId
  });

  const [startSession] = useMutation(START_ATTENDANCE_SESSION);
  const [markPresent] = useMutation(MARK_STUDENT_PRESENT);
  const [markAbsent] = useMutation(MARK_STUDENT_ABSENT);

  // Socket.IO event handlers
  useEffect(() => {
    if (sessionId) {
      socketService.joinSession(sessionId, 'teacher');

      // Listen for real-time updates
      socketService.socket?.on('attendance:session:start', (data) => {
        setIsSessionActive(true);
        refetch();
      });

      socketService.socket?.on('attendance:student:mark', (data) => {
        refetch();
      });

      socketService.socket?.on('attendance:statistics:update', (data) => {
        setAttendanceData(prev => ({
          ...prev,
          statistics: data.statistics
        }));
      });

      return () => {
        socketService.leaveSession(sessionId);
      };
    }
  }, [sessionId, refetch]);

  // Update local state when GraphQL data changes
  useEffect(() => {
    if (data?.attendanceSessionData) {
      setAttendanceData(data.attendanceSessionData);
    }
  }, [data]);

  const handleStartSession = async () => {
    try {
      await startSession({
        variables: { session_id: sessionId }
      });
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleMarkPresent = async (studentId) => {
    try {
      await markPresent({
        variables: {
          session_id: sessionId,
          student_id: studentId
        }
      });
    } catch (error) {
      console.error('Error marking present:', error);
    }
  };

  const handleMarkAbsent = async (studentId) => {
    try {
      await markAbsent({
        variables: {
          session_id: sessionId,
          student_id: studentId
        }
      });
    } catch (error) {
      console.error('Error marking absent:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="attendance-session">
      <div className="session-header">
        <h2>{attendanceData?.session?.topic}</h2>
        <div className="session-stats">
          <span>Total: {attendanceData?.statistics?.totalStudents}</span>
          <span>Present: {attendanceData?.statistics?.presentCount}</span>
          <span>Absent: {attendanceData?.statistics?.absentCount}</span>
          <span>Rate: {attendanceData?.statistics?.attendanceRate?.toFixed(1)}%</span>
        </div>
        {!isSessionActive && (
          <button onClick={handleStartSession}>
            Start Attendance
          </button>
        )}
      </div>

      <div className="student-list">
        {attendanceData?.attendanceRecords?.map((record) => (
          <div key={record.id} className="student-item">
            <div className="student-info">
              <span>{record.student_id.name}</span>
              <span>{record.student_id.student_id}</span>
            </div>
            <div className="attendance-controls">
              <button
                className={`btn ${record.status === 'present' ? 'active' : ''}`}
                onClick={() => handleMarkPresent(record.student_id.id)}
              >
                Present
              </button>
              <button
                className={`btn ${record.status === 'absent' ? 'active' : ''}`}
                onClick={() => handleMarkAbsent(record.student_id.id)}
              >
                Absent
              </button>
            </div>
            <div className="status">
              Status: {record.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSession;
```

---

## Usage Examples

### Complete Workflow Examples

#### 1. Teacher Starting an Attendance Session

**Step 1: Start Session (GraphQL)**
```graphql
mutation StartAttendanceSession {
  startAttendanceSession(session_id: "64a1b2c3d4e5f6789012345") {
    session {
      _id
      topic
      date
      start_time
      end_time
      course_id {
        title
        code
      }
    }
    attendanceRecords {
      id
      student_id {
        _id
        name
        student_id
        department
      }
      status
      timestamp
    }
    totalStudents
  }
}
```

**Step 2: Real-time Notification (Socket.IO)**
```javascript
// All connected clients receive this event
socket.on('attendance:session:start', {
  session_id: "64a1b2c3d4e5f6789012345",
  course_id: "64a1b2c3d4e5f6789012346",
  teacher_id: "64a1b2c3d4e5f6789012347",
  session_data: {
    topic: "Data Structures and Algorithms",
    date: "2024-01-15",
    start_time: "10:00",
    end_time: "11:30"
  },
  total_students: 45,
  timestamp: "2024-01-15T10:00:00Z"
});
```

#### 2. Bulk Attendance Update

**GraphQL Mutation:**
```graphql
mutation BulkUpdateAttendance {
  bulkUpdateAttendance(
    session_id: "64a1b2c3d4e5f6789012345"
    attendanceUpdates: [
      {
        student_id: "64a1b2c3d4e5f6789012348"
        status: "present"
      }
      {
        student_id: "64a1b2c3d4e5f6789012349"
        status: "absent"
        remarks: "Medical leave"
      }
      {
        student_id: "64a1b2c3d4e5f6789012350"
        status: "late"
        remarks: "Arrived 15 minutes late"
      }
      {
        student_id: "64a1b2c3d4e5f6789012351"
        status: "excused"
        remarks: "University event participation"
      }
    ]
  ) {
    id
    student_id {
      _id
      name
      student_id
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

**Real-time Update (Socket.IO):**
```javascript
socket.on('attendance:bulk:update', {
  session_id: "64a1b2c3d4e5f6789012345",
  updates: [
    {
      student_id: "64a1b2c3d4e5f6789012348",
      status: "present",
      remarks: null
    },
    {
      student_id: "64a1b2c3d4e5f6789012349",
      status: "absent",
      remarks: "Medical leave"
    }
  ],
  updated_by: "64a1b2c3d4e5f6789012347",
  timestamp: "2024-01-15T10:10:00Z"
});
```

#### 3. Student Attendance History

**GraphQL Query:**
```graphql
query GetStudentAttendanceHistory {
  attendanceByStudent(student_id: "64a1b2c3d4e5f6789012348") {
    id
    session_id {
      _id
      topic
      date
      start_time
      end_time
      course_id {
        title
        code
        teacher_id {
          name
        }
      }
    }
    status
    remarks
    timestamp
    marked_at
    marked_by {
      _id
      name
    }
    createdAt
    updatedAt
  }
}
```

**Response Example:**
```json
{
  "data": {
    "attendanceByStudent": [
      {
        "id": "64a1b2c3d4e5f6789012352",
        "session_id": {
          "_id": "64a1b2c3d4e5f6789012345",
          "topic": "Introduction to Algorithms",
          "date": "2024-01-15",
          "start_time": "10:00",
          "end_time": "11:30",
          "course_id": {
            "title": "Data Structures and Algorithms",
            "code": "CSE201",
            "teacher_id": {
              "name": "Dr. Jane Smith"
            }
          }
        },
        "status": "present",
        "remarks": null,
        "timestamp": "2024-01-15T10:05:00Z",
        "marked_at": "2024-01-15T10:05:00Z",
        "marked_by": {
          "_id": "64a1b2c3d4e5f6789012347",
          "name": "Dr. Jane Smith"
        },
        "createdAt": "2024-01-15T10:05:00Z",
        "updatedAt": "2024-01-15T10:05:00Z"
      }
    ]
  }
}
```

#### 4. Session Statistics with Real-time Updates

**GraphQL Query:**
```graphql
query GetAttendanceSessionData {
  attendanceSessionData(session_id: "64a1b2c3d4e5f6789012345") {
    session {
      _id
      topic
      date
      start_time
      end_time
      course_id {
        title
        code
        department
      }
    }
    statistics {
      totalStudents
      presentCount
      absentCount
      lateCount
      excusedCount
      attendanceRate
    }
    attendanceRecords {
      id
      student_id {
        _id
        name
        student_id
        department
        semester
      }
      status
      remarks
      timestamp
      marked_at
    }
  }
}
```

**Real-time Statistics Update (Socket.IO):**
```javascript
socket.on('attendance:statistics:update', {
  session_id: "64a1b2c3d4e5f6789012345",
  statistics: {
    total_students: 45,
    present_count: 42,
    absent_count: 2,
    late_count: 1,
    excused_count: 0,
    attendance_rate: 93.33,
    last_updated: "2024-01-15T10:30:00Z"
  }
});
```

---

## Error Handling

### GraphQL Error Types

#### 1. Authentication Errors
```json
{
  "errors": [
    {
      "message": "Authentication failed",
      "extensions": {
        "code": "UNAUTHENTICATED",
        "details": "Invalid or expired token"
      }
    }
  ]
}
```

#### 2. Authorization Errors
```json
{
  "errors": [
    {
      "message": "Access denied. Teacher role required.",
      "extensions": {
        "code": "FORBIDDEN",
        "requiredRole": "teacher",
        "userRole": "student"
      }
    }
  ]
}
```

#### 3. Validation Errors
```json
{
  "errors": [
    {
      "message": "Validation failed",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "validationErrors": [
          {
            "field": "session_id",
            "message": "Session ID is required"
          },
          {
            "field": "status",
            "message": "Status must be one of: present, absent, late, excused"
          }
        ]
      }
    }
  ]
}
```

#### 4. Business Logic Errors
```json
{
  "errors": [
    {
      "message": "Student not enrolled in course",
      "extensions": {
        "code": "BUSINESS_LOGIC_ERROR",
        "details": {
          "student_id": "64a1b2c3d4e5f6789012348",
          "course_id": "64a1b2c3d4e5f6789012346",
          "reason": "Student is not enrolled in this course"
        }
      }
    }
  ]
}
```

### Socket.IO Error Handling

#### Connection Errors
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
  
  if (error.message.includes('Authentication')) {
    // Redirect to login
    window.location.href = '/login';
  }
});
```

#### Event Errors
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  
  // Show user-friendly error message
  showNotification({
    type: 'error',
    message: 'Connection error. Please refresh the page.',
    duration: 5000
  });
});
```

### Error Recovery Strategies

#### 1. Automatic Retry Logic
```javascript
class AttendanceService {
  async markAttendanceWithRetry(sessionId, studentId, status, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.markAttendance(sessionId, studentId, status);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

#### 2. Offline Support
```javascript
class OfflineAttendanceManager {
  constructor() {
    this.pendingOperations = [];
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOperations();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  async markAttendance(sessionId, studentId, status) {
    const operation = {
      type: 'MARK_ATTENDANCE',
      data: { sessionId, studentId, status },
      timestamp: new Date().toISOString()
    };
    
    if (this.isOnline) {
      try {
        return await this.executeOperation(operation);
      } catch (error) {
        this.pendingOperations.push(operation);
        throw error;
      }
    } else {
      this.pendingOperations.push(operation);
      this.saveToLocalStorage();
      return { success: true, offline: true };
    }
  }
  
  async syncPendingOperations() {
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        this.pendingOperations.push(operation);
      }
    }
    
    this.saveToLocalStorage();
  }
}
```

---

## Performance Optimization

### Database Optimization

#### 1. Indexing Strategy
```javascript
// Compound indexes for common queries
db.attendancerecords.createIndex({ 
  "session_id": 1, 
  "student_id": 1 
}, { unique: true });

db.attendancerecords.createIndex({ 
  "session_id": 1, 
  "status": 1 
});

db.attendancerecords.createIndex({ 
  "student_id": 1, 
  "marked_at": -1 
});

// Text index for search functionality
db.students.createIndex({
  "name": "text",
  "student_id": "text",
  "department": "text"
});
```

#### 2. Aggregation Pipeline Optimization
```javascript
// Optimized attendance statistics aggregation
const getAttendanceStatistics = async (sessionId) => {
  return await AttendanceRecord.aggregate([
    {
      $match: { session_id: new ObjectId(sessionId) }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: "$count" },
        statusCounts: {
          $push: {
            status: "$_id",
            count: "$count"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalStudents: 1,
        presentCount: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$statusCounts",
                    cond: { $eq: ["$$this.status", "absent"] }
                  }
                },
                0
              ]
            },
            { count: 0 }
          ]
        },
        attendanceRate: {
          $multiply: [
            {
              $divide: [
                "$presentCount.count",
                "$totalStudents"
              ]
            },
            100
          ]
        }
      }
    }
  ]);
};
```

#### 3. Connection Pooling
```javascript
// MongoDB connection with optimized pool settings
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,        // Maximum number of connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
});
```

### GraphQL Optimization

#### 1. DataLoader for N+1 Problem
```javascript
// studentLoader.js
import DataLoader from 'dataloader';
import Student from '../models/Student.js';

const batchStudents = async (studentIds) => {
  const students = await Student.find({
    _id: { $in: studentIds }
  });
  
  const studentMap = new Map();
  students.forEach(student => {
    studentMap.set(student._id.toString(), student);
  });
  
  return studentIds.map(id => studentMap.get(id.toString()) || null);
};

export const studentLoader = new DataLoader(batchStudents);
```

#### 2. Query Complexity Analysis
```javascript
// complexityAnalysis.js
import { createComplexityLimitRule } from 'graphql-query-complexity';

const complexityLimitRule = createComplexityLimitRule(1000, {
  maximumComplexity: 1000,
  variables: {},
  createError: (max, actual) => {
    return new Error(`Query complexity ${actual} exceeds maximum complexity ${max}`);
  },
  onComplete: (complexity) => {
    console.log('Query complexity:', complexity);
  }
});

export { complexityLimitRule };
```

### Socket.IO Optimization

#### 1. Room Management
```javascript
// Efficient room management
class RoomManager {
  constructor(io) {
    this.io = io;
    this.sessionRooms = new Map();
  }
  
  joinSession(socket, sessionId, userType) {
    const roomName = `session:${sessionId}`;
    socket.join(roomName);
    
    if (!this.sessionRooms.has(sessionId)) {
      this.sessionRooms.set(sessionId, {
        teachers: new Set(),
        students: new Set(),
        createdAt: new Date()
      });
    }
    
    const room = this.sessionRooms.get(sessionId);
    if (userType === 'teacher') {
      room.teachers.add(socket.id);
    } else {
      room.students.add(socket.id);
    }
  }
  
  leaveSession(socket, sessionId) {
    const roomName = `session:${sessionId}`;
    socket.leave(roomName);
    
    const room = this.sessionRooms.get(sessionId);
    if (room) {
      room.teachers.delete(socket.id);
      room.students.delete(socket.id);
      
      // Clean up empty rooms
      if (room.teachers.size === 0 && room.students.size === 0) {
        this.sessionRooms.delete(sessionId);
      }
    }
  }
}
```

#### 2. Event Throttling
```javascript
// Throttle frequent events
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Usage
const throttledStatisticsUpdate = throttle((sessionId, statistics) => {
  io.to(`session:${sessionId}`).emit('attendance:statistics:update', {
    session_id: sessionId,
    statistics
  });
}, 1000); // Throttle to once per second
```

---

## Security Considerations

### Input Validation

#### 1. GraphQL Input Validation
```javascript
// validators.js
import Joi from 'joi';

export const attendanceInputSchema = Joi.object({
  session_id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  student_id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  status: Joi.string().required().valid('present', 'absent', 'late', 'excused'),
  remarks: Joi.string().optional().max(500)
});

export const validateAttendanceInput = (input) => {
  const { error, value } = attendanceInputSchema.validate(input);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
};
```

#### 2. Rate Limiting
```javascript
// rateLimiter.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const attendanceRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many attendance requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Data Sanitization

#### 1. MongoDB Injection Prevention
```javascript
// sanitization.js
import mongoSanitize from 'express-mongo-sanitize';

// Middleware to sanitize user input
export const sanitizeInput = (req, res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);
  next();
};
```

#### 2. XSS Prevention
```javascript
// xssProtection.js
import xss from 'xss';

export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return xss(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
};

export const sanitizeAttendanceRemarks = (remarks) => {
  if (!remarks) return remarks;
  return sanitizeString(remarks).substring(0, 500); // Limit length
};
```

### Access Control

#### 1. Resource-Level Authorization
```javascript
// authorization.js
export const canAccessSession = async (user, sessionId) => {
  const session = await Session.findById(sessionId).populate('course_id');
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  // Teachers can access sessions they created
  if (user.role === 'teacher') {
    const course = await Course.findOne({
      _id: session.course_id,
      teacher_id: user.teacher_id
    });
    return !!course;
  }
  
  // Students can access sessions for courses they're enrolled in
  if (user.role === 'student') {
    const enrollment = await Enrollment.findOne({
      student_id: user.student_id,
      course_id: session.course_id,
      status: 'enrolled'
    });
    return !!enrollment;
  }
  
  return false;
};
```

#### 2. Field-Level Security
```javascript
// fieldSecurity.js
export const filterSensitiveFields = (user, data) => {
  if (user.role === 'student') {
    // Students can only see their own attendance
    return data.filter(record => 
      record.student_id.toString() === user.student_id.toString()
    );
  }
  
  // Teachers and admins can see all data
  return data;
};
```

---

## Testing

### Unit Tests

#### 1. GraphQL Resolver Tests
```javascript
// attendance.resolver.test.js
import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from '../graphql/index.js';
import { createMockContext } from './helpers/mockContext.js';

describe('Attendance Resolvers', () => {
  let server, query, mutate;
  
  beforeEach(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: createMockContext()
    });
    
    ({ query, mutate } = createTestClient(server));
  });
  
  describe('markAttendance', () => {
    it('should mark student as present', async () => {
      const MARK_ATTENDANCE = `
        mutation MarkAttendance($input: AttendanceInput!) {
          markAttendance(attendanceInput: $input) {
            id
            status
            student_id {
              name
            }
          }
        }
      `;
      
      const variables = {
        input: {
          session_id: '64a1b2c3d4e5f6789012345',
          student_id: '64a1b2c3d4e5f6789012348',
          status: 'present'
        }
      };
      
      const response = await mutate({
        mutation: MARK_ATTENDANCE,
        variables
      });
      
      expect(response.errors).toBeUndefined();
      expect(response.data.markAttendance.status).toBe('present');
    });
    
    it('should throw error for invalid status', async () => {
      const MARK_ATTENDANCE = `
        mutation MarkAttendance($input: AttendanceInput!) {
          markAttendance(attendanceInput: $input) {
            id
            status
          }
        }
      `;
      
      const variables = {
        input: {
          session_id: '64a1b2c3d4e5f6789012345',
          student_id: '64a1b2c3d4e5f6789012348',
          status: 'invalid_status'
        }
      };
      
      const response = await mutate({
        mutation: MARK_ATTENDANCE,
        variables
      });
      
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toContain('Validation');
    });
  });
});
```

#### 2. Service Layer Tests
```javascript
// attendance.service.test.js
import AttendanceService from '../services/AttendanceService.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import { createMockSession, createMockStudent } from './helpers/mockData.js';

jest.mock('../models/AttendanceRecord.js');

describe('AttendanceService', () => {
  let attendanceService;
  
  beforeEach(() => {
    attendanceService = new AttendanceService();
    jest.clearAllMocks();
  });
  
  describe('markAttendance', () => {
    it('should create new attendance record', async () => {
      const mockSession = createMockSession();
      const mockStudent = createMockStudent();
      const mockAttendance = {
        _id: '64a1b2c3d4e5f6789012352',
        session_id: mockSession._id,
        student_id: mockStudent._id,
        status: 'present'
      };
      
      AttendanceRecord.findOne.mockResolvedValue(null);
      AttendanceRecord.prototype.save.mockResolvedValue(mockAttendance);
      
      const result = await attendanceService.markAttendance(
        mockSession._id,
        mockStudent._id,
        'present'
      );
      
      expect(AttendanceRecord.findOne).toHaveBeenCalledWith({
        session_id: mockSession._id,
        student_id: mockStudent._id
      });
      expect(result.status).toBe('present');
    });
    
    it('should update existing attendance record', async () => {
      const mockAttendance = {
        _id: '64a1b2c3d4e5f6789012352',
        status: 'absent',
        save: jest.fn().mockResolvedValue({
          _id: '64a1b2c3d4e5f6789012352',
          status: 'present'
        })
      };
      
      AttendanceRecord.findOne.mockResolvedValue(mockAttendance);
      
      const result = await attendanceService.markAttendance(
        '64a1b2c3d4e5f6789012345',
        '64a1b2c3d4e5f6789012348',
        'present'
      );
      
      expect(mockAttendance.status).toBe('present');
      expect(mockAttendance.save).toHaveBeenCalled();
    });
  });
});
```

### Integration Tests

#### 1. End-to-End API Tests
```javascript
// attendance.integration.test.js
import request from 'supertest';
import app from '../server.js';
import { setupTestDatabase, cleanupTestDatabase } from './helpers/database.js';
import { createTestUser, getAuthToken } from './helpers/auth.js';

describe('Attendance API Integration', () => {
  let teacherToken, studentToken;
  let sessionId, studentId;
  
  beforeAll(async () => {
    await setupTestDatabase();
    
    const teacher = await createTestUser('teacher');
    const student = await createTestUser('student');
    
    teacherToken = await getAuthToken(teacher);
    studentToken = await getAuthToken(student);
    
    // Create test session and student
    sessionId = '64a1b2c3d4e5f6789012345';
    studentId = student.student_id;
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /graphql - markAttendance', () => {
    it('should allow teacher to mark attendance', async () => {
      const mutation = `
        mutation {
          markAttendance(attendanceInput: {
            session_id: "${sessionId}"
            student_id: "${studentId}"
            status: "present"
          }) {
            id
            status
          }
        }
      `;
      
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ query: mutation })
        .expect(200);
      
      expect(response.body.data.markAttendance.status).toBe('present');
    });
    
    it('should deny student from marking attendance', async () => {
      const mutation = `
        mutation {
          markAttendance(attendanceInput: {
            session_id: "${sessionId}"
            student_id: "${studentId}"
            status: "present"
          }) {
            id
            status
          }
        }
      `;
      
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ query: mutation })
        .expect(200);
      
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Teacher role required');
    });
  });
});
```

### Socket.IO Tests

#### 1. Real-time Event Tests
```javascript
// socket.integration.test.js
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Client from 'socket.io-client';
import { setupSocketIO } from '../services/socketService.js';

describe('Socket.IO Integration', () => {
  let httpServer, io, clientSocket;
  
  beforeAll((done) => {
    httpServer = createServer();
    io = new SocketIOServer(httpServer);
    setupSocketIO(io);
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = Client(`http://localhost:${port}`, {
        auth: {
          token: 'valid_jwt_token'
        }
      });
      
      clientSocket.on('connect', done);
    });
  });
  
  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });
  
  test('should join session room', (done) => {
    clientSocket.emit('join:session', {
      session_id: '64a1b2c3d4e5f6789012345',
      user_type: 'teacher'
    });
    
    clientSocket.on('session:joined', (data) => {
      expect(data.session_id).toBe('64a1b2c3d4e5f6789012345');
      done();
    });
  });
  
  test('should receive attendance updates', (done) => {
    clientSocket.on('attendance:student:mark', (data) => {
      expect(data.session_id).toBe('64a1b2c3d4e5f6789012345');
      expect(data.status).toBe('present');
      done();
    });
    
    // Simulate attendance marking
    io.to('session:64a1b2c3d4e5f6789012345').emit('attendance:student:mark', {
      session_id: '64a1b2c3d4e5f6789012345',
      student_id: '64a1b2c3d4e5f6789012348',
      status: 'present'
    });
  });
});
```

---

## Deployment

### Docker Configuration

#### 1. Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

#### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  attendance-api:
    build: .
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/attendance_system
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    networks:
      - attendance-network

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=attendance_system
    restart: unless-stopped
    networks:
      - attendance-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - attendance-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - attendance-api
    restart: unless-stopped
    networks:
      - attendance-network

volumes:
  mongo-data:
  redis-data:

networks:
  attendance-network:
    driver: bridge
```

### Kubernetes Deployment

#### 1. Deployment Configuration
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: attendance-api
  labels:
    app: attendance-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: attendance-api
  template:
    metadata:
      labels:
        app: attendance-api
    spec:
      containers:
      - name: attendance-api
        image: attendance-system:latest
        ports:
        - containerPort: 4001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: attendance-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: attendance-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: attendance-api-service
spec:
  selector:
    app: attendance-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 4001
  type: LoadBalancer
```

### Environment Configuration

#### 1. Production Environment
```bash
# .env.production
NODE_ENV=production
PORT=4001

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system
REDIS_URL=redis://redis-cluster:6379

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
SOCKET_CORS_ORIGIN=https://your-frontend-domain.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-new-relic-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/app/uploads

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Problem:** "Authentication failed" or "Token required" errors

**Solutions:**
```javascript
// Check token format
const token = req.headers.authorization;
if (!token || !token.startsWith('Bearer ')) {
  throw new Error('Invalid token format');
}

// Verify token expiration
const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
if (decodedToken.exp < Date.now() / 1000) {
  throw new Error('Token expired');
}

// Check user existence
const user = await User.findById(decodedToken.uid);
if (!user) {
  throw new Error('User not found');
}
```

#### 2. Socket.IO Connection Issues

**Problem:** Clients cannot connect to Socket.IO server

**Solutions:**
```javascript
// Check CORS configuration
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Verify authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }
    // ... authentication logic
    next();
  } catch (error) {
    next(new Error(`Authentication failed: ${error.message}`));
  }
});
```

#### 3. Database Connection Problems

**Problem:** MongoDB connection timeouts or failures

**Solutions:**
```javascript
// Add connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Implement retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }).catch(err => {
    console.error('MongoDB connection failed, retrying in 5 seconds...', err);
    setTimeout(connectWithRetry, 5000);
  });
};
```

#### 4. Performance Issues

**Problem:** Slow query responses or high memory usage

**Solutions:**
```javascript
// Add query monitoring
mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});

// Implement query optimization
const getAttendanceWithPagination = async (sessionId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  return await AttendanceRecord.find({ session_id: sessionId })
    .populate('student_id', 'name student_id department')
    .sort({ marked_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Use lean() for better performance
};

// Add memory monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB'
  });
}, 30000);
```

### Debugging Tools

#### 1. GraphQL Debugging
```javascript
// Enable GraphQL debugging
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  debug: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code,
      path: error.path,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    };
  },
  plugins: [
    {
      requestDidStart() {
        return {
          didResolveOperation(requestContext) {
            console.log('Operation:', requestContext.request.operationName);
          },
          didEncounterErrors(requestContext) {
            console.error('GraphQL errors:', requestContext.errors);
          }
        };
      }
    }
  ]
});
```

#### 2. Socket.IO Debugging
```javascript
// Enable Socket.IO debugging
const io = new SocketIOServer(httpServer, {
  // ... other options
});

if (process.env.NODE_ENV !== 'production') {
  io.engine.on('connection_error', (err) => {
    console.log('Socket.IO connection error:', err.req);
    console.log('Error code:', err.code);
    console.log('Error message:', err.message);
    console.log('Error context:', err.context);
  });
}
```

---

## Future Enhancements

### Planned Features

#### 1. Advanced Analytics
- **Attendance Trends Analysis**
  - Weekly/monthly attendance patterns
  - Student performance correlation
  - Course-wise attendance comparison
  - Predictive analytics for at-risk students

- **Machine Learning Integration**
  - Attendance prediction models
  - Anomaly detection for unusual patterns
  - Personalized recommendations
  - Risk assessment algorithms

#### 2. Mobile Application
- **React Native App**
  - Cross-platform mobile support
  - Offline attendance marking
  - Push notifications
  - Biometric authentication
  - QR code scanning for quick attendance

#### 3. Integration Capabilities
- **LMS Integration**
  - Moodle, Canvas, Blackboard compatibility
  - Grade synchronization
  - Assignment correlation

- **University Systems**
  - Student Information System (SIS) integration
  - HR system connectivity
  - Academic calendar synchronization

#### 4. Advanced Features
- **Geofencing**
  - Location-based attendance verification
  - Campus boundary enforcement
  - Multiple location support

- **Facial Recognition**
  - AI-powered attendance marking
  - Anti-spoofing measures
  - Privacy-compliant implementation

- **Voice Commands**
  - Voice-activated attendance marking
  - Accessibility improvements
  - Multi-language support

### Technical Roadmap

#### Phase 1: Core Enhancements (Q1 2024)
- [ ] Advanced caching with Redis
- [ ] Microservices architecture
- [ ] API versioning
- [ ] Enhanced security measures
- [ ] Performance monitoring

#### Phase 2: Feature Expansion (Q2 2024)
- [ ] Mobile application development
- [ ] Offline support
- [ ] Advanced analytics dashboard
- [ ] Report generation system
- [ ] Email/SMS notifications

#### Phase 3: AI Integration (Q3 2024)
- [ ] Machine learning models
- [ ] Predictive analytics
- [ ] Facial recognition system
- [ ] Anomaly detection
- [ ] Intelligent recommendations

#### Phase 4: Enterprise Features (Q4 2024)
- [ ] Multi-tenant architecture
- [ ] Advanced integrations
- [ ] Custom branding
- [ ] Enterprise security
- [ ] Compliance features

---

## Conclusion

This comprehensive documentation provides a complete guide to the Attendance System, covering everything from basic setup to advanced deployment strategies. The system is designed to be scalable, secure, and user-friendly, with real-time capabilities that enhance the educational experience.

### Key Benefits

✅ **Real-time Updates**: Instant attendance tracking with Socket.IO
✅ **Scalable Architecture**: Built to handle thousands of concurrent users
✅ **Security First**: JWT authentication and role-based access control
✅ **Developer Friendly**: Well-documented GraphQL API
✅ **Performance Optimized**: Efficient database queries and caching
✅ **Production Ready**: Docker support and deployment guides

### Getting Started

1. **Development Setup**: Follow the Implementation Guide
2. **API Testing**: Use the GraphQL playground at `/graphql`
3. **Real-time Testing**: Connect Socket.IO clients
4. **Production Deployment**: Use Docker or Kubernetes configurations

### Support and Contribution

For questions, issues, or contributions:
- Review the troubleshooting section
- Check the GraphQL schema documentation
- Test with the provided examples
- Follow the security guidelines

This attendance system represents a modern approach to educational technology, combining reliability with innovation to create a seamless experience for both educators and students. $eq: ["$$this.status", "present"] }
                  }
                },
                0
              ]
            },
            { count: 0 }
          ]
        },
        absentCount: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$statusCounts",
                    cond: {