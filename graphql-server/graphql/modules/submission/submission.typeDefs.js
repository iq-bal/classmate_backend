export const typeDefs = `#graphql
type Submission {
    id: ID!
    assignment_id: ID!
    student_id: ID!
    student: Student!
    assignment: Assignment!
    file_url: String!
    plagiarism_score: Float
    ai_generated: Float
    teacher_comments: String
    grade: Float
    submitted_at: String
    evaluated_at: String  
}

input UpdateSubmissionInput {
    teacher_comments: String
    grade: Float
}

type Query {
    submissions: [Submission]
    submission(id: ID!): Submission
    submissionsByAssignment(assignment_id: ID!): [Submission]
    getSubmissionByAssignmentAndStudent(assignment_id: ID!, student_id: ID!): Submission
}

type Mutation {
    updateSubmission(id: ID!, submissionInput: UpdateSubmissionInput!): Submission
}
`;