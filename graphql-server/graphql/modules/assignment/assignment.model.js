import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Reference to the Course collection
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
  deadline: {
    type: Date,
    required: true,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});



// Pre-save hook to validate course_id asynchronously
assignmentSchema.pre("save", async function (next) {
  try {
    const course = await mongoose.model("Course").findById(this.course_id);
    if (!course) {
      return next(new Error("Invalid course_id: Course does not exist."));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Assignment Model
const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;