export const typeDefs = `#graphql
type Student {
    id: ID!
    user_id: User!
    roll: String!
    section: String
    name: String!
    email: String!
    profile_picture: String
    about: String!
    department: String!
    semester: String!
    cgpa: String!
    submissions: [Submission!]
    enrollments: [Enrollment!]
}

type Query {
  students: [Student]
  student(id:ID!): Student
  currentStudent: Student
}

input UpdateStudentInput {
  roll: String
  section: String
  department: String
  semester: String
  cgpa: String
}

type Mutation {
  updateStudentProfilePicture(image: Upload!): Student
  updateStudentCoverPicture(image: Upload!): Student
  updateStudentInfo(studentInput: UpdateStudentInput!): Student
  updateStudentAbout(about: String!): Student
}
`;