import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Add configuration options for better connection management
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      connectTimeoutMS: 10000,         // 10 seconds timeout for initial connection
      socketTimeoutMS: 45000,          // 45 seconds timeout for socket inactivity
      maxPoolSize: 10,                 // Maximum number of connections in the pool
      minPoolSize: 5,                  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000,           // Close connections after 30 seconds of inactivity
      retryWrites: true,              // Retry writes on network errors
      retryReads: true,               // Retry reads on network errors
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`🔍 Error details:`, error);
    
    // Don't exit immediately, allow for retry
    setTimeout(() => {
      console.log('🔄 Retrying database connection...');
      connectDB();
    }, 5000);
  }
};

// Debugging mongoose connection events
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to the database.");
});

mongoose.connection.on("error", (err) => {
  console.error(`🔴 Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🟢 Mongoose reconnected to the database.");
});

// Handle process termination gracefully
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🔴 Mongoose connection closed due to app termination.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error closing mongoose connection:", error);
    process.exit(1);
  }
});

export default connectDB;



// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     // Add configuration options for better connection management
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,         // Parse MongoDB connection strings properly
//       useUnifiedTopology: true,      // Use the new Server Discover and Monitoring engine
//       serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`MongoDB Connection Error: ${error.message}`);
//     process.exit(1); // Exit the process with failure
//   }

//   // Debugging mongoose connection events
//   mongoose.connection.on("connected", () => {
//     console.log("Mongoose connected to the database.");
//   });

//   mongoose.connection.on("error", (err) => {
//     console.error(`Mongoose connection error: ${err}`);
//   });

//   mongoose.connection.on("disconnected", () => {
//     console.log("Mongoose disconnected.");
//   });

//   // Handle process termination gracefully
//   process.on("SIGINT", async () => {
//     await mongoose.connection.close();
//     console.log("Mongoose connection closed due to app termination.");
//     process.exit(0);
//   });
// };

// export default connectDB;



// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 30000, // Optional: Set server selection timeout
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`MongoDB Connection Error: ${error.message}`);
//     process.exit(1);
//   }

//   mongoose.connection.on("connected", () => {
//     console.log("Mongoose connected to the database.");
//   });

//   mongoose.connection.on("error", (err) => {
//     console.error(`Mongoose connection error: ${err}`);
//   });

//   mongoose.connection.on("disconnected", () => {
//     console.log("Mongoose disconnected.");
//   });

//   process.on("SIGINT", async () => {
//     await mongoose.connection.close();
//     console.log("Mongoose connection closed due to app termination.");
//     process.exit(0);
//   });
// };

// export default connectDB;
