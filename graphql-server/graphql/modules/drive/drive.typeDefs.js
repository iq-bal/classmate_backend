export const typeDefs = `#graphql
  scalar Upload

  type DriveFile {
    id: ID!
    course_id: ID!
    teacher_id: ID!
    file_name: String!
    file_url: String!
    file_size: Int!
    file_type: String!
    description: String
    uploaded_at: String!
    course: Course!
    teacher: Teacher!
  }

  input UploadDriveFileInput {
    course_id: ID!
    file: Upload!
    description: String
  }

  input UpdateDriveFileInput {
    description: String!
  }

  input RenameDriveFileInput {
    file_name: String!
  }

  type Query {
    driveFiles(course_id: ID!): [DriveFile!]
    driveFile(id: ID!): DriveFile
    myDriveFiles: [DriveFile!]
  }

  type Mutation {
    uploadDriveFile(input: UploadDriveFileInput!): DriveFile!
    deleteDriveFile(id: ID!): Boolean!
    updateDriveFileDescription(id: ID!, input: UpdateDriveFileInput!): DriveFile!
    renameDriveFile(id: ID!, input: RenameDriveFileInput!): DriveFile!
  }
`;