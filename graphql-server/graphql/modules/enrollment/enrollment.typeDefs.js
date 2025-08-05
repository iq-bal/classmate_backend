export const typeDefs = `#graphql
type Enrollment {
  id: ID!
  status: String
  courses: [Course!]
  enrolled_at: String
}

type EnrollmentWithStudent {
  id: ID!
  status: String!
  enrolled_at: String!
  student: Student!
}

type Query {
  enrollments: [Enrollment!]
  enrollment(id: ID!): Enrollment
  enrollmentStatus(course_id: ID!): Enrollment
  courseEnrollments(course_id: ID!): [EnrollmentWithStudent!]
  enrollmentsByDay(day: String!): [Enrollment!]
  currentClassForStudent(day: String!, current_time: String!): [Enrollment!]
}

type Mutation{
    addEnrollment(course_id:ID!):Enrollment
    updateEnrollment(id:ID!,status:String!):Enrollment
    updateEnrollmentStatusByTeacher(enrollment_id: ID!, status: String!): Enrollment
    deleteEnrollment(id:ID!):Enrollment
}
`
