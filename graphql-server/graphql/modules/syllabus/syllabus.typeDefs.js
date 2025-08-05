export const typeDefs = `#graphql
scalar JSON
type Syllabus{
    id: ID!
    syllabus: JSON
    course_id: ID!
    createdAt: String
    updatedAt: String
}

type Query {
  syllabuses: [Syllabus!]
  syllabus(id:ID!): Syllabus
}

type Mutation {
  updateSyllabus(course_id: ID!, syllabus: JSON!): Syllabus
}
`;