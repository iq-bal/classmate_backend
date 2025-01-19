import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Connect to MongoDB and Redis
await connectDB();
await connectRedis();

// API Routes
app.use("/api/v1/auth", authRoutes);

// Start the server
const PORT = process.env.AUTH_SERVER_PORT || 6000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
