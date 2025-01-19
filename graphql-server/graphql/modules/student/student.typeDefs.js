export const typeDefs = `#graphql
type Student{
    id: ID!
    roll: String!
    section: String!
    name: String!
    email: String!
    submissions: [Submission!]
}
type Query {
  students: [Student]
  student(id:ID!): Student
}
`;