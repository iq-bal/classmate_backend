export const typeDefs = `#graphql
type Course {
  id: ID!
  title: String!
  course_code: String!
  description: String!
}

type Assignment{
    id:ID!
    title: String!
    description: String!
    deadline: Date!
}

type Submission{
    id: ID!
    file_url: String!
    plagiarism_score: Number
    ai_generated: Number
    teacher_comments: String
    grade:String
}

type Query {
  courses: [Course]
  course(id:ID!): Course
  assignments: [Assignment]
  assignment(id:ID!): Assignment
  submissions: [Submission]
  submission(id:ID!): Submission
}
`;