export const typeDefs = `#graphql
type User{
    id: ID!
    uid: String!
    name: String!
    email: String!
    role: String!
    profile_picture: String
    fcm_token: String
}
type Query {
  users: [User!]
  user(id:ID!): User
}

type Mutation {
    updateFCMToken(fcm_token: String!): User
}
`;