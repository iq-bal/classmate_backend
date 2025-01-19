import mongoose from "mongoose";
import Course from "../course/course.model.js";  // Direct import of Course model

const syllabusSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Reference to the Course collection
    required: true,
    unique: true, // Ensure course_id is unique (if needed)
  },
  syllabus: {
    type: Map,
    of: [String], // Each module will be an array of subtopics (strings)
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to validate course_id asynchronously
syllabusSchema.pre("save", async function (next) {
  try {
    // Check if the course exists by its ID
    const course = await Course.findById(this.course_id);
    if (!course) {
      return next(new Error("Invalid course_id: Course does not exist."));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Create and export the model
const Syllabus = mongoose.model("Syllabus", syllabusSchema);

export default Syllabus;
