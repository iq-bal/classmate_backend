export const typeDefs = `#graphql
scalar Upload
type Course {
  id: ID!
  title: String!
  course_code: String!
  description: String!
  syllabus: Syllabus
  teacher: Teacher
  enrollment: Enrollment
  enrollments: [Enrollment!]
  enrolled_students(section: String): [Student!]
  sessions: [Session!]
  schedules: [Schedule!]
  schedule(section: String, day: String!, teacher_id: ID): Schedule
  assignments: [Assignment!]
  classTests: [ClassTest!]
  drive: [DriveFile!]
  forum: [ForumPost!]
  created_at: String!
  image: String
  credit: Int!
  excerpt: String
  enrolled: Int!
  reviews: [Review!]
  averageRating: Float 
} 

type Query {
  courses: [Course]
  course(id:ID!): Course
  searchCourses(keyword: String!): [Course]
}

type Mutation {
  updateCourseTeacher(course_id: ID!, teacher_id: ID!): Course
  createCourse(
    title: String!
    course_code: String!
    credit: Float!
    excerpt: String
    description: String!
    image: Upload
  ): Course
  deleteCourse(id: ID!): Course
}
`