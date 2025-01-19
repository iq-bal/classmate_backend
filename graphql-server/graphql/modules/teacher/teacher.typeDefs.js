export const typeDefs = `#graphql
  type Teacher {
    id: ID!
    user_id: User!
    name: String!
    department: String!
    designation: String!
    joining_date: String
    createdAt: String
    updatedAt: String
  }

  input TeacherInput {
    user_id: ID!
    department: String!
    designation: String!
    joining_date: String
  }

  type Query {
    teachers: [Teacher!]!
    teacher(id: ID!): Teacher
  }

  type Mutation {
    createTeacher(teacherInput: TeacherInput!): Teacher
    updateTeacher(id: ID!, teacherInput: TeacherInput!): Teacher
    deleteTeacher(id: ID!): Teacher
  }
`; 