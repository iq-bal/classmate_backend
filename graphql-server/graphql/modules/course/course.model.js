import mongoose from "mongoose";

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  course_code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User collection
    required: true,
  },
  
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to validate teacher_id asynchronously
courseSchema.pre("save", async function (next) {
  try {
    const user = await mongoose.model("User").findById(this.teacher_id);
    if (!user || user.role !== "teacher") {
      return next(new Error("Invalid teacher_id: User does not exist or is not a teacher."));
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