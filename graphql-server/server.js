import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { schema } from './schema.js'; 
import dotenv from "dotenv";
import connectDB from './database/connection.js';
import authenticateToken from './middleware/auth.js';
import staticMiddleware from './middleware/static.js';
import cors from 'cors';
import http from 'http';
import { graphqlUploadExpress } from 'graphql-upload-minimal';

// Load environment variables first
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

// Serve static files from uploads directory
app.use('/uploads', staticMiddleware);

const httpServer = http.createServer(app);

const server = new ApolloServer({
    schema,
    csrfPrevention: {
        requestHeaders: ['x-apollo-operation-name', 'content-type', 'multipart/form-data']
    },
    uploads: false
});

await server.start();

// Configure Apollo Server middleware with proper request parsing
app.use('/graphql', 
    express.json({ limit: '50mb' }), 
    express.urlencoded({ extended: true, limit: '50mb' }), 
    expressMiddleware(server, {
        context: async ({ req }) => {
            try {
                const user = authenticateToken(req);
                return { user };
            } catch (error) {
                console.error("Authentication error:", error.message);
                throw new Error("Authentication failed");
            }
        },
    })
);

const PORT = process.env.PORT || 4001;
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
console.log(`📁 File uploads available at http://localhost:${PORT}/uploads`);