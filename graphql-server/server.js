import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { schema } from './schema.js'; 
import dotenv from "dotenv";
import connectDB from './database/connection.js';
import authenticateToken from './middleware/auth.js';
import Teacher from './graphql/modules/teacher/teacher.model.js';
import mongoose from "mongoose";
import User from './graphql/modules/user/user.model.js';
import ClassSession from './graphql/modules/session/session.model.js';

import AttendanceRecord from './graphql/modules/attendance/attendance.model.js';


dotenv.config();
await connectDB();


const server = new ApolloServer({
    schema
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
    context: async ({ req }) => {
        try {
          // Use the authenticateToken middleware
          const user = authenticateToken(req); // Authenticate the request
          return { user }; // Pass the user to the context
        } catch (error) {
          console.error("Authentication error:", error.message);
          throw new Error("Authentication failed");
        }
    },
});
  
console.log(`🚀  Server ready at: ${url}`);