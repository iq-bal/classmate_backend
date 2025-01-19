import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

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
