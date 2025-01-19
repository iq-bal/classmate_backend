export const typeDefs = `#graphql
type Enrollment {
  id: ID!
  status: String
}

type Query {
  enrollments: [Enrollment!]
  enrollment(id: ID!): Enrollment
}

type Mutation{
    addEnrollment(course_id:ID!):Enrollment
    updateEnrollment(id:ID!,status:String!):Enrollment
    deleteEnrollment(id:ID!):Enrollment
}
`
