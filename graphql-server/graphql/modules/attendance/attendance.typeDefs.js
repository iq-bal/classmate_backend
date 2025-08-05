export const typeDefs = `#graphql
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

  type ActiveSessionResult {
    session: Session
    attendance: [Attendance!]!
    isActive: Boolean!
    lastActivity: String
  }

  type ActiveSessionSummary {
    session: Session!
    lastActivity: String!
    attendanceCount: Int!
  }

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

  type Query {
    attendances: [Attendance!]!
    attendance(id: ID!): Attendance
    attendanceBySession(session_id: ID!): [Attendance!]!
    attendanceByStudent(student_id: ID!): [Attendance!]!
    attendanceSessionData(session_id: ID!): AttendanceSessionData!
    activeSession(course_id: ID!): ActiveSessionResult!
    allActiveSessions: [ActiveSessionSummary!]!
  }

  type Mutation {
    markAttendance(attendanceInput: AttendanceInput!): Attendance
    updateAttendance(id: ID!, status: String!): Attendance
    deleteAttendance(id: ID!): Attendance
    startAttendanceSession(session_id: ID!): AttendanceSessionResult!
    markStudentPresent(session_id: ID!, student_id: ID!): Attendance!
    markStudentAbsent(session_id: ID!, student_id: ID!): Attendance!
    bulkUpdateAttendance(session_id: ID!, attendanceUpdates: [AttendanceUpdateInput!]!): [Attendance!]!
  }
`;
