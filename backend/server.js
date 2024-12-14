import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import Course from "./models/courseModel.js";
import Enrollment from "./models/enrollmentModel.js";
import User from "./models/userModel.js";
import Assignment from "./models/assignmentModel.js";
import Submission from "./models/submissionModel.js";
import { graphqlHTTP } from 'express-graphql';
import Student from "./models/studentModel.js";

import mongoose from "mongoose";

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt
} from 'graphql';



// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());


connectDB();


// const CourseType = new GraphQLObjectType({
//   name: "Course",
//   description: "This is a course offered by a Teacher",
//   fields: () => ({
//     id: { type: new GraphQLNonNull(GraphQLString) }, // ID of the course (same as _id in Mongo)
//     title: { type: new GraphQLNonNull(GraphQLString) }, // Title of the course
//     course_code: { type: new GraphQLNonNull(GraphQLString) },
//     description: { type: new GraphQLNonNull(GraphQLString) }, // Description of the course
//     teacher_id: { type: new GraphQLNonNull(GraphQLString) }, // Teacher's ObjectId, referenced
//     teacher: {
//       type: UserType, // Resolve the teacher field by referencing the UserType
//       resolve: (course) => {
//         // Assuming the teacher_id corresponds to the User collection
//         return mongoose.model("User").findById(course.teacher_id); // Fetch the teacher user data by ID
//       },
//     },
//     schedule: { 
//       type: new GraphQLList(ScheduleType), // List of schedule entries for the course
//       resolve: (course) => {
//         return course.schedule; // Directly return the schedule array
//       }
//     },
//     assignments: {
//       type: new GraphQLList(AssignmentType),
//       resolve: async (course) => {
//         const assignments = await mongoose.model('Assignment').find({ course_id: course._id });
//         return assignments;
//       },
//     },
//     enrolled_students: {
//       type: new GraphQLList(UserType),
//       resolve: async (course) => {
//         // Find all enrollments for the given course
//         const enrollments = await mongoose.model('Enrollment').find({ course_id: course._id });

//         // Get the student ids from the enrollments
//         const studentIds = enrollments.map((enrollment) => enrollment.student_id);

//         // Fetch all students who are enrolled in this course
//         const students = await mongoose.model('User').find({ '_id': { $in: studentIds } });

//         return students;
//       },
//     },
//     created_at: { type: GraphQLString }, // Created timestamp for the course
//   }),
// });



const CourseType = new GraphQLObjectType({
  name: 'Course',
  description: 'Course information with filtering options.',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    course_code: { type: new GraphQLNonNull(GraphQLString) },
    enrolled_students: {
      type: new GraphQLList(StudentType),
      args: {
        section: { type: GraphQLString },
      },
      resolve: async (course, { section }) => {
        const enrollments = await mongoose.model('Enrollment').find({ course_id: course._id });
        const studentIds = enrollments.map((enrollment) => enrollment.student_id);

        const filter = { _id: { $in: studentIds } };
        if (section) {
          filter.section = section;
        }

        return mongoose.model('Student').find(filter);
      },
    },
    assignments: {
      type: new GraphQLList(AssignmentType),
      resolve: async (course) => {
        return mongoose.model('Assignment').find({ course_id: course._id });
      },
    },
    // schedule: {
    //   type: new GraphQLList(ScheduleType),
    //   args: {
    //     section: { type: GraphQLString },
    //     day: { type: GraphQLString },
    //   },
    //   resolve: (course, { section, day }) => {
    //     let schedules = course.schedule;

    //     if (section) {
    //       schedules = schedules.filter((schedule) => schedule.section === section);
    //     }
    //     if (day) {
    //       schedules = schedules.filter((schedule) => schedule.day === day);
    //     }

    //     return schedules;
    //   },
    // },
    schedule: {
      type: ScheduleType, // Change to a single ScheduleType
      args: {
        section: { type: new GraphQLNonNull(GraphQLString) }, // Make section required
        day: { type: new GraphQLNonNull(GraphQLString) }, // Make day required
      },
      resolve: (course, { section, day }) => {
        return course.schedule.find(
          (schedule) => schedule.section === section && schedule.day === day
        );
      },
    },
  }),
});






const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'A user in the system, which could be a student, teacher, etc.',
  fields: () => ({
    id: { 
      type: new GraphQLNonNull(GraphQLString), 
      resolve: (user) => user._id.toString() // Resolving the MongoDB _id to a string
    },
    uid: { 
      type: new GraphQLNonNull(GraphQLString), 
    },
    name: { 
      type: new GraphQLNonNull(GraphQLString) 
    },
    email: { 
      type: new GraphQLNonNull(GraphQLString) 
    },
    password: { 
      type: new GraphQLNonNull(GraphQLString) 
    },
    role: { 
      type: new GraphQLNonNull(GraphQLString) 
    },
    created_at: {
      type: GraphQLString, // Timestamp for when the user was created
      resolve: (user) => user.createdAt.toString(),
    },
    updated_at: {
      type: GraphQLString, // Timestamp for when the user was last updated
      resolve: (user) => user.updatedAt.toString(),
    },
  }),
});













const StudentType = new GraphQLObjectType({
  name: 'Student',
  description: 'A student entity with academic and personal details.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (student) => student._id.toString(), // Resolving MongoDB _id
    },
    roll: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The roll number of the student.',
    },
    section: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The section the student belongs to.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The full name of the student.',
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The email address of the student.',
    },
    created_at: {
      type: GraphQLString,
      description: 'Timestamp for when the student was created.',
      resolve: (student) => student.createdAt.toISOString(),
    },
    updated_at: {
      type: GraphQLString,
      description: 'Timestamp for when the student was last updated.',
      resolve: (student) => student.updatedAt.toISOString(),
    },
  }),
});









const ScheduleType = new GraphQLObjectType({
  name: 'Schedule',
  description: 'Schedule information for a course, including section, room number, day, and timeslot.',
  fields: () => ({
    section: { 
      type: new GraphQLNonNull(GraphQLString),
    },
    room_no: { 
      type: new GraphQLNonNull(GraphQLString),
    },
    day: { 
      type: new GraphQLNonNull(GraphQLString),
    },
    start_time: { 
      type: new GraphQLNonNull(GraphQLString), 
    },
    end_time: { 
      type: new GraphQLNonNull(GraphQLString), 
    },
  }),
});



const AssignmentType = new GraphQLObjectType({
  name: 'Assignment',
  description: 'Represents an assignment related to a course.',
  fields: () => ({
    id: { 
      type: new GraphQLNonNull(GraphQLString), 
    },
    course_id: { 
      type: new GraphQLNonNull(GraphQLString), 
      description: 'ID of the associated course',
    },
    title: { 
      type: new GraphQLNonNull(GraphQLString), 
      description: 'Title of the assignment',
    },
    description: { 
      type: new GraphQLNonNull(GraphQLString), 
      description: 'Description of the assignment',
    },
    deadline: { 
      type: new GraphQLNonNull(GraphQLString), 
      description: 'Deadline for submitting the assignment',
    },
    created_at: { 
      type: GraphQLString, 
      description: 'Creation timestamp of the assignment',
    },
    course: { 
      type: CourseType, // Nested CourseType to resolve the course details
      resolve: async (assignment) => {
        const course = await mongoose.model('Course').findById(assignment.course_id);
        return course;
      },
    },
  }),
});


const EnrollmentType = new GraphQLObjectType({
  name: 'Enrollment',
  description: 'Represents the enrollment of a student in a course.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique ID of the enrollment',
    },
    course_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the associated course',
    },
    student_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of the student who is enrolled',
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Current enrollment status of the student',
    },
    enrolled_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'Timestamp when the student enrolled',
    },
    course: {
      type: CourseType, // Resolving course details using CourseType
      resolve: async (enrollment) => {
        const course = await mongoose.model('Course').findById(enrollment.course_id);
        return course;
      },
    },
    student: {
      type: UserType, // Resolving student details using UserType
      resolve: async (enrollment) => {
        const student = await mongoose.model('User').findById(enrollment.student_id);
        return student;
      },
    },
  }),
});




// Define the root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  description: 'Root Query for fetching data',
  fields: {
    course: {
      type: CourseType, // The CourseType we defined earlier
      args: {
        id: { type: GraphQLString }, // Accepts an ID as an argument to get a specific course
      },
      resolve: async (parent, { id }) => {
        // Find the course by its ID
        const course = await mongoose.model('Course').findById(id);

        if (!course) {
          throw new Error('Course not found');
        }

        return course;
      },
    },
  },
});


// GraphQL Schema with root query
const schema = new GraphQLSchema({
  query: RootQuery,
});

// Protected Route - Requires Valid Access Token
app.get("/protected", authenticateToken, async (req, res) => {
  try {
    res.json({ message: "Welcome to the protected route!", user: req.user });
  } catch (error) {
    console.error("Error in /protected:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.use(
  "/graphql",
  // authenticateToken,
  // checkIfTeacher,
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);


// async function insertDummyData() {
//   const dummyStudents = [
//     { roll: 1, section: 'A', name: 'John Doe', email: 'john.doe@example.com' },
//     { roll: 2, section: 'B', name: 'Jane Smith', email: 'jane.smith@example.com' },
//     { roll: 3, section: 'C', name: 'Sam Wilson', email: 'sam.wilson@example.com' },
//   ];

//   try {
//     await Student.insertMany(dummyStudents);
//     console.log('Dummy data inserted successfully!');
//   } catch (error) {
//     console.error('Error inserting dummy data:', error);
//   }
// }

// insertDummyData();



// async function createEnrollment() {
//   try {
//     // Replace these with valid ObjectIds from your database
//     const courseId = "675c910186e75d98dc7c5cae"; 
//     const studentId = "675cb131c80792e9f500f2d5";

//     const enrollment = new Enrollment({
//       course_id: courseId,
//       student_id: studentId,
//     });

//     await enrollment.save();
//     console.log("Enrollment created successfully:", enrollment);
//     return enrollment;
//   } catch (error) {
//     console.error("Error creating enrollment:", error.message);
//     throw error;
//   }
// }


// (async () => {
//   try {
//     const result = await createEnrollment();
//     console.log("Result:", result);
//   } catch (error) {
//     console.error("Failed to create enrollment:", error.message);
//   }
// })();










function checkIfTeacher(req, res, next) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied. Teachers only." });
  }
  next();
}



// Middleware to Authenticate Access Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // if (err) return res.status(403).json({ message: "Invalid token" });
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({
          tokenExpired: true,
          message: "Token expired",
          expiredAt: err.expiredAt, // Optionally send the expiry time
        });
      } else {
        // Other token verification errors
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    req.user = user;
    next();
  });
}



const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
