const reviewTypeDefs = `#graphql
  type Review {
    id: ID!
    course_id: Course!
    student_id: Student!
    rating: Int!
    comment: String!
    createdAt: String!
    updatedAt: String!
    commented_by: User!
  }

  input ReviewInput {
    course_id: ID!
    rating: Int!
    comment: String!
  }

  type Query {
    reviews: [Review!]!
    reviewsByCourse(course_id: ID!): [Review!]!
    reviewsByStudent(student_id: ID!): [Review!]!
  }

  type Mutation {
    createReview(reviewInput: ReviewInput!): Review!
    updateReview(id: ID!, reviewInput: ReviewInput!): Review!
    deleteReview(id: ID!): Review!
  }
`;

export const typeDefs = reviewTypeDefs;