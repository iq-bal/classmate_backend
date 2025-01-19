export const typeDefs = `#graphql
  type Attendance {
    id: ID!
    status: String!
    remarks: String
    timestamp: String!
  }

  input AttendanceInput {
    session_id: ID!
    student_id: ID!
    status: String!
    remarks: String
  }

  type Query {
    attendances: [Attendance!]!
    attendance(id: ID!): Attendance
    attendanceBySession(session_id: ID!): [Attendance!]!
    attendanceByStudent(student_id: ID!): [Attendance!]!
  }

  type Mutation {
    markAttendance(attendanceInput: AttendanceInput!): Attendance
    updateAttendance(id: ID!, attendanceInput: AttendanceInput!): Attendance
    deleteAttendance(id: ID!): Attendance
  }
`;
