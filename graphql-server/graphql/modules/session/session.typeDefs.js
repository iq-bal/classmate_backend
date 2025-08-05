export const typeDefs = `#graphql
  type Session {
    id: ID!
    title: String!
    description: String
    date: String!
    start_time: String!
    end_time: String!
    status: String!
    meeting_link: String
    createdAt: String
    updatedAt: String
    attendances: [Attendance!]
    attendance: Attendance
  }

  input SessionInput {
    course_id: ID!
    title: String!
    description: String
    date: String!
    start_time: String!
    end_time: String!
    meeting_link: String
  }

  type Query {
    sessions: [Session!]!
    session(id: ID!): Session
    sessionsByCourse(course_id: ID!): [Session!]
  }

  type Mutation {
    createSession(sessionInput: SessionInput!): Session
    updateSession(id: ID!, sessionInput: SessionInput!): Session
    deleteSession(id: ID!): Session
    updateSessionStatus(id: ID!, status: String!): Session
  }
`;
