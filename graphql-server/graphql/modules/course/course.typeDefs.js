export const typeDefs = `#graphql
type Course {
  id: ID!
  title: String!
  course_code: String!
  description: String!
  syllabus: Syllabus
  teacher: Teacher
  enrollment: Enrollment
  sessions: [Session!]
  schedules: [Schedule!]
  schedule(day: String!, teacher_id: ID!): Schedule
  assignments: [Assignment!]
}

type Query {
  courses: [Course]
  course(id:ID!): Course
  searchCourses(keyword: String!): [Course]
}
`