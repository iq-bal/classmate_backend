import mongoose from "mongoose";
import Course from "../course/course.model.js";

const classTestSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  total_marks: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to validate course_id asynchronously
classTestSchema.pre("save", async function (next) {
  try {
    const course = await Course.findById(this.course_id);
    if (!course) {
      return next(new Error("Invalid course_id: Course does not exist."));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ClassTest Model
const ClassTest = mongoose.model("ClassTest", classTestSchema);

export default ClassTest;