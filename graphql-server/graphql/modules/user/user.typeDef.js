export const typeDefs = `#graphql
scalar Upload

type User{
    id: ID!
    uid: String!
    name: String!
    email: String!
    role: String!
    profile_picture: String
    cover_picture: String
    fcm_token: String
    createdAt: String
    updatedAt: String
    teacher: Teacher
    courses: [Course!] 
}
type Query {
  users: [User!]
  user(id:ID): User
  searchUsers(query: String!): [User!]!
}

type Mutation {
    updateFCMToken(fcm_token: String!): User
    updateProfilePicture(image: Upload!): User
    updateCoverPicture(image: Upload!): User
}
`;