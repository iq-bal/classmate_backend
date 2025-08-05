export const typeDefs = `#graphql
type ClassTest {
  id: ID!
  course_id: ID!
  title: String!
  description: String!
  date: String!
  duration: Int!
  total_marks: Int!
  created_at: String!
  course: Course
}

type Query {
  classTests: [ClassTest]
  classTest(id: ID!): ClassTest
  classTestsByCourse(course_id: ID!): [ClassTest]
}

type Mutation {
  createClassTest(
    course_id: ID!
    title: String!
    description: String!
    date: String!
    duration: Int!
    total_marks: Int!
  ): ClassTest

  updateClassTest(
    id: ID!
    title: String
    description: String
    date: String
    duration: Int
    total_marks: Int
  ): ClassTest

  deleteClassTest(id: ID!): Boolean
}
`