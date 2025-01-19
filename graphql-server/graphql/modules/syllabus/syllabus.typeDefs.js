export const typeDefs = `#graphql
scalar JSON
type Syllabus{
    id: ID!
    syllabus: JSON
}
type Query {
  syllabuses: [Syllabus!]
  syllabus(id:ID!): Syllabus
}
`;