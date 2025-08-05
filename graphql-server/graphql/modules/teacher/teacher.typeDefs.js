export const typeDefs = `#graphql
  type Teacher {
    id: ID!
    user_id: User!
    name: String
    about: String!
    department: String!
    designation: String!
    joining_date: String
    createdAt: String
    updatedAt: String
    profile_picture: String
    courses: [Course!]!
  }

  input TeacherInput {
    about: String
    department: String
    designation: String
    joining_date: String
  }

  type Query {
    teachers: [Teacher!]!
    teacher(id: ID!): Teacher
  }

  type Mutation {
    createTeacher(teacherInput: TeacherInput!): Teacher
    updateTeacher(teacherInput: TeacherInput!): Teacher
    deleteTeacher(id: ID!): Teacher
  }
`;