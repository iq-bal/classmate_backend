export const typeDefs = `#graphql
scalar Date

type Assignment {
    id: ID!
    title: String!
    description: String!
    deadline: Date!
    submissions: [Submission!]
    submission: Submission
}

type Query {
    assignments: [Assignment]
    assignment(id: ID!): Assignment
}
`;
