export const typeDefs = `#graphql
scalar Date

type Teacher {
    id: ID!
    name: String!
    profile_picture: String
}

type Assignment {
    id: ID!
    title: String!
    description: String!
    deadline: Date!
    course: Course!
    teacher: Teacher
    submissions: [Submission!]
    submission: Submission
    submissionCount: Int!
    created_at: String!
}

input AssignmentInput {
    course_id: ID!
    title: String!
    description: String!
    deadline: Date!
}

type Query {
    assignments: [Assignment]
    assignment(id: ID!): Assignment
    assignmentsByCourse(course_id: ID!): [Assignment]
}

type Mutation {
    createAssignment(assignmentInput: AssignmentInput!): Assignment
    updateAssignment(
        id: ID!
        title: String
        description: String
        deadline: Date
    ): Assignment
    deleteAssignment(id: ID!): Boolean
}
`;
