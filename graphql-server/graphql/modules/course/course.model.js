import mongoose from "mongoose";

// Course Schema
const courseSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher", // Changed from "User" to "Teacher"
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  course_code: {
    type: String,
    required: true,
  },
  credit: {
    type: Number,
    required: true,
  },
  excerpt:{
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to validate teacher_id asynchronously
courseSchema.pre("save", async function (next) {
  try {
    const teacher = await mongoose.model("Teacher").findById(this.teacher_id);
    if (!teacher) {
      return next(new Error("Invalid teacher_id: Teacher does not exist."));
    }
    next();
  } catch (error) {
    next(error);
  }
});


// Add a text index for title, description, and course_code
courseSchema.index({ title: "text", description: "text", course_code: "text" });

// Course Model
const Course = mongoose.model("Course", courseSchema);

export default Course;