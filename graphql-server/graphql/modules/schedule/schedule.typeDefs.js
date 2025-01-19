export const typeDefs = `#graphql
  type Schedule {
    id: ID!
    day: String!
    section: String!
    start_time: String!
    end_time: String!
    room_number: String!
    createdAt: String
    updatedAt: String
  }

  input ScheduleInput {
    course_id: ID!
    day: String!
    start_time: String!
    end_time: String!
    room_number: String!
  }

  type Query {
    schedules: [Schedule!]!
    schedule(id: ID!): Schedule
    schedulesByCourse(course_id: ID!): [Schedule!]!
    schedulesByTeacher(teacher_id: ID!): [Schedule!]!
  }

  type Mutation {
    createSchedule(scheduleInput: ScheduleInput!): Schedule
    updateSchedule(id: ID!, scheduleInput: ScheduleInput!): Schedule
    deleteSchedule(id: ID!): Schedule
  }
`; 