export const typeDefs = `#graphql
  type Task {
    id: ID!
    user_id: User!
    title: String!
    category: String!
    date: String!
    start_time: String!
    end_time: String!
    participants: [User!]
    status: String!
    createdAt: String
    updatedAt: String
  }

  input TaskInput {
    title: String!
    category: String!
    date: String!
    start_time: String!
    end_time: String!
    participants: [ID!]
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
    tasksByUser: [Task!]!
    tasksByParticipant(participant_id: ID!): [Task!]!
    tasksByCategory(category: String!): [Task!]!
  }

  type Mutation {
    createTask(taskInput: TaskInput!): Task
    updateTask(id: ID!, taskInput: TaskInput!): Task
    updateTaskStatus(id: ID!, status: String!): Task
    addParticipant(id: ID!, participant_id: ID!): Task
    removeParticipant(id: ID!, participant_id: ID!): Task
    deleteTask(id: ID!): Task
  }
`; 