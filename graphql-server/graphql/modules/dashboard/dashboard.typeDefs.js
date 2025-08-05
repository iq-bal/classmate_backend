export const typeDefs = `#graphql
  type DashboardClass {
    id: ID!
    title: String!
    course: Course!
    teacher: Teacher!
  }
  type DashboardAssignment {
    id: ID!
    title: String!
    deadline: String!
    course: Course!
  }

  type DashboardClassTest {
    id: ID!
    title: String!
    date: String!
    course: Course!
  }

  type DashboardData {
    classes: [DashboardClass!]!
    upcomingAssignments: [DashboardAssignment!]!
    upcomingClassTests: [DashboardClassTest!]!
  }

  extend type Query {
    studentDashboard(date: String!): DashboardData!
  }
`;