# ClassMate Backend - Database Schema & Architecture Overview

A comprehensive documentation of the ClassMate educational platform's backend architecture, database schema, and system design.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [GraphQL API Structure](#graphql-api-structure)
6. [Real-time Communication](#real-time-communication)
7. [Authentication & Authorization](#authentication--authorization)
8. [File Structure](#file-structure)
9. [Deployment Architecture](#deployment-architecture)

---

## Project Overview

ClassMate is a comprehensive educational platform backend built with modern technologies to support:

- **Real-time Chat System** with multimedia support
- **Attendance Management** with live tracking
- **Course Management** with assignments and submissions
- **Forum System** for academic discussions
- **File Sharing** and drive functionality
- **Task Management** and scheduling
- **Review System** for courses

---

## Technology Stack

### Backend Technologies
```
🖥️  BACKEND STACK
├── Node.js + Express.js (Server Runtime)
├── GraphQL + Apollo Server (API Layer)
├── Socket.IO (Real-time Communication)
├── MongoDB + Mongoose (Database)
├── JWT (Authentication)
└── Firebase (Push Notifications)
```

### Dependencies
```json
{
  "@apollo/server": "^4.11.2",
  "express": "^4.21.2",
  "mongoose": "^8.9.2",
  "socket.io": "^4.8.1",
  "jsonwebtoken": "^9.0.2",
  "graphql": "^16.10.0",
  "firebase-admin": "^13.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7"
}
```

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                      │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐   
│  │   TEACHER APP   │  │   STUDENT APP   │  
│  │                 │  │                 │   
│  │ • Course Mgmt   │  │ • Enrollment    │   
│  │ • Attendance    │  │ • Assignments   │  
│  │ • Assignments   │  │ • Chat          │  
│  │ • Grading       │  │ • Forum         │   
│  └─────────────────┘  └─────────────────┘   │
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
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │       MONGODB DATABASE       │
                    │                             │
                    │ • Users & Authentication    │
                    │ • Courses & Enrollments     │
                    │ • Messages & Chat           │
                    │ • Attendance Records        │
                    │ • Assignments & Submissions │
                    │ • Forum Posts & Comments    │
                    │ • Files & Drive             │
                    └─────────────────────────────┘
```

### Server Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DUAL SERVER SETUP                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐    ┌─────────────────────────────┐
│      GRAPHQL SERVER         │    │      CHAT SERVER            │
│      (Port: 4001)           │    │      (Port: 4002)           │
│                             │    │                             │
│ • Apollo Server             │    │ • Socket.IO Server          │
│ • Express.js                │    │ • Real-time Events          │
│ • File Uploads              │    │ • Chat Rooms                │
│ • Static File Serving       │    │ • Attendance Sessions       │
│ • JWT Authentication        │    │ • Live Notifications        │
│ • CORS Configuration        │    │ • User Presence             │
└─────────────────────────────┘    └─────────────────────────────┘
```

---

## Database Schema

### Core Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE RELATIONSHIPS                                │
└─────────────────────────────────────────────────────────────────────────────────┘

    User (Base Entity)
     │
     ├── Student (1:1)
     │    │
     │    ├── Enrollment (1:N) ──► Course (N:1)
     │    ├── AttendanceRecord (1:N)
     │    ├── Submission (1:N)
     │    ├── Review (1:N)
     │    └── Task (1:N)
     │
     ├── Teacher (1:1)
     │    │
     │    ├── Course (1:N)
     │    ├── Schedule (1:N)
     │    └── DriveFile (1:N)
     │
     └── Message (1:N) [sender/receiver]
          │
          ├── Reactions (1:N)
          └── Replies (1:N)

    Course
     │
     ├── ClassSession (1:N)
     │    └── AttendanceRecord (1:N)
     ├── Assignment (1:N)
     │    └── Submission (1:N)
     ├── ForumPost (1:N)
     │    └── ForumComment (1:N)
     ├── DriveFile (1:N)
     ├── ClassTest (1:N)
     └── Syllabus (1:1)
```

### Detailed Schema Definitions

#### 1. User Management

**User Model**
```javascript
{
  _id: ObjectId,              // Primary key
  uid: String,                // Firebase UID (unique)
  name: String,               // Full name
  email: String,              // Email address (unique)
  password: String,           // Hashed password
  role: String,               // 'student', 'teacher', 'admin'
  cover_picture: String,      // Cover image URL
  profile_picture: String,    // Profile image URL
  fcm_token: String,          // Firebase messaging token
  createdAt: Date,
  updatedAt: Date
}
```

**Student Model**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Reference to User
  roll: String,               // Student roll number
  section: String,            // Class section
  about: String,              // Bio/description
  department: String,         // Academic department
  semester: String,           // Current semester
  cgpa: Number,               // Current CGPA
  createdAt: Date,
  updatedAt: Date
}
```

**Teacher Model**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Reference to User
  about: String,              // Bio/description
  department: String,         // Teaching department
  designation: String,        // Job title
  joining_date: Date,         // Date of joining
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Course Management

**Course Model**
```javascript
{
  _id: ObjectId,
  teacher_id: ObjectId,       // Reference to Teacher
  title: String,              // Course title
  course_code: String,        // Course code (e.g., CSE101)
  credit: Number,             // Credit hours
  excerpt: String,            // Short description
  description: String,        // Detailed description
  image: String,              // Course image URL
  created_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Enrollment Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  student_id: ObjectId,       // Reference to Student
  status: String,             // 'pending', 'approved', 'rejected'
  enrolled_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Attendance System

**ClassSession Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  date: Date,                 // Session date
  start_time: String,         // Start time (HH:MM)
  end_time: String,           // End time (HH:MM)
  topic: String,              // Session topic
  description: String,        // Session description
  status: String,             // 'scheduled', 'active', 'completed', 'cancelled'
  meeting_link: String,       // Virtual meeting link
  teacher_id: ObjectId,       // Reference to Teacher
  createdAt: Date,
  updatedAt: Date
}
```

**AttendanceRecord Model**
```javascript
{
  _id: ObjectId,
  session_id: ObjectId,       // Reference to ClassSession
  student_id: ObjectId,       // Reference to Student
  status: String,             // 'present', 'absent', 'late', 'excused'
  remarks: String,            // Optional notes
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Assignment System

**Assignment Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  teacher_id: ObjectId,       // Reference to Teacher
  title: String,              // Assignment title
  description: String,        // Assignment description
  deadline: Date,             // Submission deadline
  created_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Submission Model**
```javascript
{
  _id: ObjectId,
  assignment_id: ObjectId,    // Reference to Assignment
  student_id: ObjectId,       // Reference to Student
  file_url: String,           // Submitted file URL
  plagiarism_score: Number,   // Plagiarism detection score
  ai_generated: Boolean,      // AI detection flag
  teacher_comments: String,   // Teacher feedback
  grade: Number,              // Assigned grade
  submitted_at: Date,
  evaluated_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. Communication System

**Message Model**
```javascript
{
  _id: ObjectId,
  sender_id: ObjectId,        // Reference to User
  receiver_id: ObjectId,      // Reference to User
  content: String,            // Message content
  message_type: String,       // 'text', 'image', 'video', 'audio', 'file'
  file_url: String,           // File URL (if applicable)
  file_name: String,          // Original file name
  file_size: Number,          // File size in bytes
  file_type: String,          // MIME type
  duration: Number,           // Audio/video duration
  thumbnail_url: String,      // Video thumbnail
  reactions: [{
    user_id: ObjectId,        // Reference to User
    reaction: String,         // Emoji reaction
    created_at: Date
  }],
  reply_to: ObjectId,         // Reference to Message (for replies)
  forwarded: Boolean,         // Forward flag
  forwarded_from: ObjectId,   // Original message reference
  read: Boolean,              // Read status
  read_at: Date,
  delivered: Boolean,         // Delivery status
  delivered_at: Date,
  deleted_for: [ObjectId],    // Users who deleted the message
  edited: Boolean,            // Edit flag
  edited_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. Forum System

**ForumPost Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  author_id: ObjectId,        // Reference to User
  title: String,              // Post title
  content: String,            // Post content
  tags: [String],             // Post tags
  is_pinned: Boolean,         // Pinned status
  is_resolved: Boolean,       // Resolution status
  upvotes: [ObjectId],        // User references who upvoted
  downvotes: [ObjectId],      // User references who downvoted
  views: Number,              // View count
  createdAt: Date,
  updatedAt: Date
}
```

**ForumComment Model**
```javascript
{
  _id: ObjectId,
  post_id: ObjectId,          // Reference to ForumPost
  author_id: ObjectId,        // Reference to User
  content: String,            // Comment content
  parent_comment_id: ObjectId, // Reference to ForumComment (for nested comments)
  upvotes: [ObjectId],        // User references who upvoted
  downvotes: [ObjectId],      // User references who downvoted
  is_answer: Boolean,         // Marked as answer flag
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. Additional Models

**DriveFile Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  teacher_id: ObjectId,       // Reference to Teacher
  file_name: String,          // File name
  file_url: String,           // File URL
  file_size: Number,          // File size in bytes
  file_type: String,          // MIME type
  description: String,        // File description
  uploaded_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Task Model**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Reference to User
  title: String,              // Task title
  category: String,           // Task category
  date: Date,                 // Task date
  start_time: String,         // Start time
  end_time: String,           // End time
  participants: [{
    user: ObjectId,           // Reference to User
    status: String            // 'pending', 'accepted', 'declined'
  }],
  status: String,             // 'pending', 'in_progress', 'completed'
  createdAt: Date,
  updatedAt: Date
}
```

**Review Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  student_id: ObjectId,       // Reference to Student
  rating: Number,             // Rating (1-5)
  comment: String,            // Review comment
  createdAt: Date,
  updatedAt: Date
}
```

**Schedule Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  teacher_id: ObjectId,       // Reference to Teacher
  day: String,                // Day of week
  section: String,            // Class section
  start_time: String,         // Start time
  end_time: String,           // End time
  room_number: String,        // Room number
  createdAt: Date,
  updatedAt: Date
}
```

**ClassTest Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  title: String,              // Test title
  description: String,        // Test description
  date: Date,                 // Test date
  duration: Number,           // Duration in minutes
  total_marks: Number,        // Total marks
  createdAt: Date,
  updatedAt: Date
}
```

**Syllabus Model**
```javascript
{
  _id: ObjectId,
  course_id: ObjectId,        // Reference to Course
  syllabus: Map,              // Map of string arrays (topics by week/module)
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

```javascript
// Performance Optimization Indexes

// User indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "uid": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

// Student/Teacher indexes
db.students.createIndex({ "user_id": 1 }, { unique: true })
db.teachers.createIndex({ "user_id": 1 }, { unique: true })

// Course and Enrollment indexes
db.courses.createIndex({ "teacher_id": 1 })
db.courses.createIndex({ "course_code": 1 })
db.enrollments.createIndex({ "course_id": 1, "student_id": 1 }, { unique: true })
db.enrollments.createIndex({ "student_id": 1 })
db.enrollments.createIndex({ "status": 1 })

// Attendance indexes
db.attendancerecords.createIndex({ "session_id": 1, "student_id": 1 }, { unique: true })
db.attendancerecords.createIndex({ "session_id": 1 })
db.attendancerecords.createIndex({ "student_id": 1 })
db.classsessions.createIndex({ "course_id": 1 })
db.classsessions.createIndex({ "date": -1 })
db.classsessions.createIndex({ "status": 1 })

// Message indexes
db.messages.createIndex({ "sender_id": 1, "receiver_id": 1 })
db.messages.createIndex({ "createdAt": -1 })
db.messages.createIndex({ "read": 1 })

// Assignment indexes
db.assignments.createIndex({ "course_id": 1 })
db.assignments.createIndex({ "deadline": 1 })
db.submissions.createIndex({ "assignment_id": 1, "student_id": 1 }, { unique: true })
db.submissions.createIndex({ "assignment_id": 1 })
db.submissions.createIndex({ "student_id": 1 })

// Forum indexes
db.forumposts.createIndex({ "course_id": 1 })
db.forumposts.createIndex({ "author_id": 1 })
db.forumposts.createIndex({ "title": "text", "content": "text" })
db.forumcomments.createIndex({ "post_id": 1 })
db.forumcomments.createIndex({ "author_id": 1 })
```

---

## GraphQL API Structure

### Modular Organization

```
graphql/
├── modules/
│   ├── user/
│   │   ├── user.model.js      # Mongoose schema
│   │   ├── user.typeDefs.js   # GraphQL type definitions
│   │   ├── user.resolvers.js  # GraphQL resolvers
│   │   └── user.service.js    # Business logic
│   ├── student/
│   ├── teacher/
│   ├── course/
│   ├── enrollment/
│   ├── session/
│   ├── attendance/
│   ├── assignment/
│   ├── submission/
│   ├── message/
│   ├── forum/
│   ├── drive/
│   ├── task/
│   ├── reviews/
│   ├── schedule/
│   ├── classtest/
│   ├── syllabus/
│   └── dashboard/
├── loaders/
│   ├── databaseLoader.js      # Database connection
│   └── dataLoader.js          # Batch loading and caching
└── utils/
    ├── check_roles.js         # Role-based authorization
    ├── errorHandler.js        # Error handling
    └── validators.js          # Input validation
```

### Core GraphQL Types

```graphql
# User Management
type User {
  id: ID!
  uid: String!
  name: String!
  email: String!
  role: String!
  cover_picture: String
  profile_picture: String
  createdAt: String!
  updatedAt: String!
}

type Student {
  id: ID!
  user_id: User!
  roll: String
  section: String
  about: String
  department: String
  semester: String
  cgpa: Float
}

type Teacher {
  id: ID!
  user_id: User!
  about: String
  department: String
  designation: String
  joining_date: String
}

# Course Management
type Course {
  id: ID!
  teacher_id: Teacher!
  title: String!
  course_code: String!
  credit: Int!
  excerpt: String
  description: String
  image: String
  created_at: String!
}

type Enrollment {
  id: ID!
  course_id: Course!
  student_id: Student!
  status: String!
  enrolled_at: String!
}

# Attendance System
type ClassSession {
  id: ID!
  course_id: Course!
  date: String!
  start_time: String!
  end_time: String!
  topic: String!
  description: String
  status: String!
  meeting_link: String
  teacher_id: Teacher!
}

type AttendanceRecord {
  id: ID!
  session_id: ClassSession!
  student_id: Student!
  status: String!
  remarks: String
}

# Assignment System
type Assignment {
  id: ID!
  course_id: Course!
  teacher_id: Teacher!
  title: String!
  description: String!
  deadline: String!
  created_at: String!
}

type Submission {
  id: ID!
  assignment_id: Assignment!
  student_id: Student!
  file_url: String
  plagiarism_score: Float
  ai_generated: Boolean
  teacher_comments: String
  grade: Float
  submitted_at: String
  evaluated_at: String
}

# Communication System
type Message {
  id: ID!
  sender_id: User!
  receiver_id: User!
  content: String!
  message_type: String!
  file_url: String
  file_name: String
  file_size: Int
  file_type: String
  duration: Int
  thumbnail_url: String
  reactions: [MessageReaction!]!
  reply_to: Message
  forwarded: Boolean!
  read: Boolean!
  delivered: Boolean!
  edited: Boolean!
  createdAt: String!
}

type MessageReaction {
  id: ID!
  user_id: User!
  reaction: String!
  created_at: String!
}

# Forum System
type ForumPost {
  id: ID!
  course_id: Course!
  author_id: User!
  title: String!
  content: String!
  tags: [String!]!
  is_pinned: Boolean!
  is_resolved: Boolean!
  upvote_count: Int!
  downvote_count: Int!
  comment_count: Int!
  views: Int!
  createdAt: String!
}

type ForumComment {
  id: ID!
  post_id: ForumPost!
  author_id: User!
  content: String!
  parent_comment_id: ForumComment
  upvote_count: Int!
  downvote_count: Int!
  is_answer: Boolean!
  createdAt: String!
}
```

### Query Operations

```graphql
type Query {
  # User Management
  users: [User!]!
  user(id: ID): User
  searchUsers(query: String!): [User!]!
  
  # Course Management
  courses: [Course!]!
  course(id: ID!): Course
  coursesByTeacher(teacher_id: ID!): [Course!]!
  
  # Enrollment
  enrollments: [Enrollment!]!
  enrollmentsByCourse(course_id: ID!): [Enrollment!]!
  enrollmentsByStudent(student_id: ID!): [Enrollment!]!
  
  # Attendance
  attendances: [AttendanceRecord!]!
  attendanceBySession(session_id: ID!): [AttendanceRecord!]!
  attendanceByStudent(student_id: ID!): [AttendanceRecord!]!
  attendanceSessionData(session_id: ID!): AttendanceSessionData!
  
  # Sessions
  sessions: [ClassSession!]!
  session(id: ID!): ClassSession
  sessionsByCourse(course_id: ID!): [ClassSession!]!
  
  # Assignments
  assignments: [Assignment!]!
  assignment(id: ID!): Assignment
  assignmentsByCourse(course_id: ID!): [Assignment!]!
  
  # Submissions
  submissions: [Submission!]!
  submissionsByAssignment(assignment_id: ID!): [Submission!]!
  submissionsByStudent(student_id: ID!): [Submission!]!
  
  # Messages
  messages: [Message!]!
  messagesBetweenUsers(user1_id: ID!, user2_id: ID!): [Message!]!
  conversationsList: [Conversation!]!
  
  # Forum
  forumPostsByCourse(course_id: ID!): [ForumPost!]!
  forumPost(id: ID!): ForumPost
  forumCommentsByPost(post_id: ID!): [ForumComment!]!
  
  # Drive
  driveFilesByCourse(course_id: ID!): [DriveFile!]!
  
  # Tasks
  tasksByUser(user_id: ID!): [Task!]!
  
  # Reviews
  reviewsByCourse(course_id: ID!): [Review!]!
  
  # Schedule
  schedulesByTeacher(teacher_id: ID!): [Schedule!]!
  schedulesByCourse(course_id: ID!): [Schedule!]!
}
```

### Mutation Operations

```graphql
type Mutation {
  # User Management
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  
  # Course Management
  createCourse(input: CreateCourseInput!): Course!
  updateCourse(id: ID!, input: UpdateCourseInput!): Course!
  deleteCourse(id: ID!): Boolean!
  
  # Enrollment
  enrollStudent(course_id: ID!, student_id: ID!): Enrollment!
  updateEnrollmentStatus(id: ID!, status: String!): Enrollment!
  
  # Attendance
  startAttendanceSession(session_id: ID!): AttendanceSessionResult!
  endAttendanceSession(session_id: ID!): AttendanceSessionResult!
  markAttendance(input: AttendanceInput!): AttendanceRecord!
  updateAttendance(id: ID!, input: AttendanceUpdateInput!): AttendanceRecord!
  bulkMarkAttendance(session_id: ID!, attendances: [AttendanceInput!]!): [AttendanceRecord!]!
  
  # Sessions
  createSession(input: CreateSessionInput!): ClassSession!
  updateSession(id: ID!, input: UpdateSessionInput!): ClassSession!
  updateSessionStatus(id: ID!, status: String!): ClassSession!
  deleteSession(id: ID!): Boolean!
  
  # Assignments
  createAssignment(input: CreateAssignmentInput!): Assignment!
  updateAssignment(id: ID!, input: UpdateAssignmentInput!): Assignment!
  deleteAssignment(id: ID!): Boolean!
  
  # Submissions
  createSubmission(input: CreateSubmissionInput!): Submission!
  updateSubmission(id: ID!, input: UpdateSubmissionInput!): Submission!
  gradeSubmission(id: ID!, grade: Float!, comments: String): Submission!
  
  # Messages
  sendMessage(input: SendMessageInput!): Message!
  editMessage(id: ID!, content: String!): Message!
  deleteMessage(message_id: ID!, for_everyone: Boolean): Boolean!
  reactToMessage(reactionInput: MessageReactionInput!): Message!
  removeReaction(message_id: ID!): Message!
  markMessageAsRead(message_id: ID!): Message!
  deleteConversation(with_user_id: ID!): Boolean!
  
  # Forum
  createForumPost(input: CreateForumPostInput!): ForumPost!
  updateForumPost(id: ID!, input: UpdateForumPostInput!): ForumPost!
  deleteForumPost(id: ID!): Boolean!
  createForumComment(input: CreateForumCommentInput!): ForumComment!
  updateForumComment(id: ID!, input: UpdateForumCommentInput!): ForumComment!
  deleteForumComment(id: ID!): Boolean!
  voteForumPost(post_id: ID!, vote_type: String!): ForumPost!
  voteForumComment(comment_id: ID!, vote_type: String!): ForumComment!
  
  # Drive
  uploadDriveFile(input: UploadDriveFileInput!): DriveFile!
  deleteDriveFile(id: ID!): Boolean!
  
  # Tasks
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
  
  # Reviews
  createReview(input: CreateReviewInput!): Review!
  updateReview(id: ID!, input: UpdateReviewInput!): Review!
  
  # Schedule
  createSchedule(input: CreateScheduleInput!): Schedule!
  updateSchedule(id: ID!, input: UpdateScheduleInput!): Schedule!
  deleteSchedule(id: ID!): Boolean!
}
```

---

## Real-time Communication

### Socket.IO Events

#### Chat Events
```javascript
// Client to Server Events
'join_chat'              // Join a chat room
'leave_chat'             // Leave a chat room
'send_message'           // Send a new message
'typing_start'           // Start typing indicator
'typing_stop'            // Stop typing indicator
'message_read'           // Mark message as read
'user_online'            // User comes online
'user_offline'           // User goes offline

// Server to Client Events
'new_message'            // Receive new message
'message_updated'        // Message was edited
'message_deleted'        // Message was deleted
'user_typing'            // Someone is typing
'user_stopped_typing'    // Someone stopped typing
'message_delivered'      // Message delivery confirmation
'message_read'           // Message read confirmation
'user_status_changed'    // User online/offline status
'error'                  // Error notifications
```

#### Attendance Events
```javascript
// Client to Server Events
'startAttendance'        // Teacher starts attendance session
'joinAttendance'         // Student joins attendance session
'markPresent'            // Mark student as present
'markAbsent'             // Mark student as absent
'markLate'               // Mark student as late
'markExcused'            // Mark student as excused
'endAttendance'          // Teacher ends attendance session

// Server to Client Events
'attendanceStarted'      // Attendance session started
'studentJoined'          // Student joined session
'attendanceMarked'       // Attendance status updated
'sessionData'            // Current session statistics
'sessionEnded'           // Session ended notification
'attendanceUpdate'       // Real-time attendance updates
'error'                  // Error notifications
```

### Real-time Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME COMMUNICATION FLOW                 │
└─────────────────────────────────────────────────────────────────┘

1. CONNECTION ESTABLISHMENT
┌─────────────┐    Socket Connect       ┌─────────────┐    Auth Check     ┌─────────────┐
│   CLIENT    │ ──────────────────────► │   SERVER    │ ─────────────────► │  DATABASE   │
│             │                        │             │                    │             │
│ • Web App   │                        │ • Socket.IO │                    │ • User      │
│ • Mobile    │                        │ • JWT Auth  │                    │   Validation│
│ • Desktop   │                        │ • Room Mgmt │                    │ • Session   │
└─────────────┘                        └─────────────┘                    └─────────────┘

2. ROOM MANAGEMENT
┌─────────────┐    Join Room            ┌─────────────┐    Update State   ┌─────────────┐
│   CLIENT    │ ──────────────────────► │   SERVER    │ ─────────────────► │   MEMORY    │
│             │                        │             │                    │             │
│ • Chat Room │                        │ • Validate  │                    │ • Active    │
│ • Course    │                        │ • Add User  │                    │   Users     │
│ • Session   │                        │ • Broadcast │                    │ • Room      │
└─────────────┘                        └─────────────┘                    └─────────────┘

3. MESSAGE BROADCASTING
┌─────────────┐    Send Message         ┌─────────────┐    Broadcast      ┌─────────────┐
│   SENDER    │ ──────────────────────► │   SERVER    │ ─────────────────► │ RECIPIENTS  │
│             │                        │             │                    │             │
│ • Compose   │                        │ • Validate  │                    │ • Receive   │
│ • Send      │                        │ • Store     │                    │ • Display   │
│             │                        │ • Emit      │                    │ • Notify    │
└─────────────┘                        └─────────────┘                    └─────────────┘
```

---

## Authentication & Authorization

### JWT-based Authentication

```javascript
// Authentication Flow
1. User Login → Validate Credentials → Generate JWT Token
2. Client Stores Token → Include in Headers → Server Validates
3. Role-based Access Control → Permission Checks → Resource Access

// JWT Token Structure
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "role": "teacher",
  "iat": 1640995200,
  "exp": 1641081600
}

// Role-based Permissions
ROLES = {
  'student': {
    'read': ['own_profile', 'enrolled_courses', 'messages', 'forum'],
    'write': ['own_profile', 'messages', 'forum_posts', 'submissions']
  },
  'teacher': {
    'read': ['all_students', 'own_courses', 'messages', 'forum', 'attendance'],
    'write': ['own_courses', 'messages', 'forum_posts', 'attendance', 'grades']
  },
  'admin': {
    'read': ['all_users', 'all_courses', 'system_stats'],
    'write': ['all_users', 'all_courses', 'system_config']
  }
}
```

### Middleware Implementation

```javascript
// Authentication Middleware
const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    throw new Error('Access token required');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Role-based Authorization
const checkRole = (requiredRoles) => {
  return (user) => {
    if (!user || !user.role) {
      throw new Error('Authentication required');
    }
    
    if (!requiredRoles.includes(user.role)) {
      throw new Error('Insufficient permissions');
    }
    
    return true;
  };
};
```

---

## File Structure

### Project Directory Structure

```
graphql-server/
├── config/
│   ├── database.js              # MongoDB connection configuration
│   ├── firebase.config.js       # Firebase admin configuration
│   └── environment.js           # Environment-specific configs
├── database/
│   └── connection.js            # Database connection setup
├── graphql/
│   ├── modules/                 # Feature-based modules
│   │   ├── assignment/
│   │   │   ├── assignment.model.js
│   │   │   ├── assignment.typeDefs.js
│   │   │   ├── assignment.resolvers.js
│   │   │   └── assignment.service.js
│   │   ├── attendance/
│   │   ├── classtest/
│   │   ├── course/
│   │   ├── dashboard/
│   │   ├── drive/
│   │   ├── enrollment/
│   │   ├── forum/
│   │   ├── message/
│   │   ├── reviews/
│   │   ├── schedule/
│   │   ├── session/
│   │   ├── student/
│   │   ├── submission/
│   │   ├── syllabus/
│   │   ├── task/
│   │   ├── teacher/
│   │   └── user/
│   ├── loaders/
│   │   ├── databaseLoader.js    # Database connection loader
│   │   └── dataLoader.js        # DataLoader for batch operations
│   └── utils/
│       ├── check_roles.js       # Role-based authorization utilities
│       ├── errorHandler.js      # Error handling utilities
│       └── validators.js        # Input validation utilities
├── middleware/
│   ├── auth.js                  # Authentication middleware
│   └── static.js                # Static file serving middleware
├── services/
│   ├── local.storage.js         # Local file storage service
│   ├── notification.service.js  # Push notification service
│   └── socket.service.js        # Socket.IO service
├── uploads/                     # File upload directory
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── chat-server.js               # Socket.IO server (Port: 4002)
├── package.json                 # Project dependencies
├── schema.js                    # GraphQL schema merger
└── server.js                    # Main GraphQL server (Port: 4001)
```

### Key Files Description

**server.js** - Main GraphQL API server
- Apollo Server setup with Express
- Authentication middleware integration
- File upload handling
- CORS configuration
- Static file serving

**chat-server.js** - Real-time communication server
- Socket.IO server setup
- Real-time chat functionality
- Attendance session management
- User presence tracking
- Event broadcasting

**schema.js** - GraphQL schema composition
- Merges all module type definitions
- Combines all resolvers
- Creates unified GraphQL schema

---

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LOAD BALANCER │    │   APPLICATION   │    │    DATABASE     │
│                 │    │     SERVERS     │    │                 │
│ • Nginx/HAProxy │    │                 │    │ • MongoDB Atlas │
│ • SSL/TLS       │◄──►│ • Node.js Apps  │◄──►│ • Redis Cache   │
│ • Rate Limiting │    │ • Docker        │    │ • File Storage  │
│ • Health Checks │    │ • Auto-scaling  │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/STATIC    │    │   MONITORING    │    │   EXTERNAL      │
│                 │    │                 │    │   SERVICES      │
│ • Static Files  │    │ • Logs          │    │                 │
│ • Images        │    │ • Metrics       │    │ • Firebase      │
│ • Documents     │    │ • Alerts        │    │ • Email Service │
│ • Caching       │    │ • Performance   │    │ • SMS Service   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership and switch user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 4001 4002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  graphql-server:
    build: .
    ports:
      - "4001:4001"  # GraphQL API
      - "4002:4002"  # Socket.IO
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/classmate
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - graphql-server
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:

networks:
  default:
    driver: bridge
```

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=4001
SOCKET_PORT=4002

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classmate
REDIS_URL=redis://redis-cluster:6379

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=24h

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
SOCKET_CORS_ORIGIN=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=/app/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-new-relic-key
```

---

## Performance Considerations

### Database Optimization
- **Indexing Strategy**: Compound indexes for frequently queried fields
- **Connection Pooling**: Mongoose connection pool configuration
- **Query Optimization**: Efficient aggregation pipelines
- **Data Pagination**: Cursor-based pagination for large datasets

### Caching Strategy
- **Redis Caching**: Session data and frequently accessed content
- **DataLoader**: Batch loading and caching for GraphQL resolvers
- **CDN Integration**: Static file delivery optimization

### Real-time Optimization
- **Room Management**: Efficient Socket.IO room organization
- **Event Throttling**: Rate limiting for real-time events
- **Connection Scaling**: Horizontal scaling with Redis adapter

### Security Measures
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API and Socket.IO rate limiting
- **CORS Configuration**: Strict origin policies
- **File Upload Security**: Type validation and size limits
- **JWT Security**: Secure token generation and validation

---

## API Endpoints Summary

- **GraphQL Server**: `http://localhost:4001/graphql`
- **Socket.IO Server**: `http://localhost:4002`
- **File Uploads**: `http://localhost:4001/uploads/`
- **Health Check**: `http://localhost:4001/health`

---

## Conclusion

This ClassMate backend architecture provides a robust, scalable, and feature-rich foundation for an educational platform. The modular design, comprehensive database schema, and real-time capabilities make it suitable for handling complex educational workflows while maintaining performance and security standards.

### Key Strengths

✅ **Modular Architecture**: Clean separation of concerns with feature-based modules
✅ **Comprehensive Schema**: Well-designed database relationships and indexes
✅ **Real-time Capabilities**: Socket.IO integration for live features
✅ **Security First**: JWT authentication and role-based authorization
✅ **Scalable Design**: Docker support and production-ready configuration
✅ **Developer Friendly**: Well-documented GraphQL API and clear file structure
✅ **Performance Optimized**: Efficient database queries and caching strategies

The system is designed to handle the complex requirements of modern educational platforms while providing flexibility for future enhancements and scaling.