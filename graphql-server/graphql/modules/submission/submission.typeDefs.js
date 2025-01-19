export const typeDefs = `#graphql
type Submission{
    id: ID!
    file_url: String!
    plagiarism_score: Float
    ai_generated: Float
    teacher_comments: String
    grade:String
}
type Query {
  submissions: [Submission]
  submission(id:ID!): Submission
}
`;