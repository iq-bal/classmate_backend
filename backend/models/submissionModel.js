import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment", // Reference to the Assignment collection
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Reference to the User collection
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  plagiarism_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0, // Default score
  },
  ai_generated:{
    type:Number,
    min:0,
    max:100,
    default:0
  },
  teacher_comments: {
    type: String,
    default: "", // Optional comments
  },
  grade: {
    type: String,
    enum: ["A", "B", "C", "D", "F", null], // Optional grade
    default: null,
  },
  submitted_at: {
    type: Date,
    default: Date.now, // Automatically set to current date/time
  },
  evaluated_at: {
    type: Date,
  },
});


submissionSchema.index({ assignment_id: 1, student_id: 1 }, { unique: true });


// Pre-save hook to validate `assignment_id` and `student_id`
submissionSchema.pre("save", async function (next) {
  try {
    // Validate assignment_id
    const assignment = await mongoose.model("Assignment").findById(this.assignment_id);
    if (!assignment) {
      return next(new Error("Invalid assignment_id: Assignment does not exist."));
    }

    // Validate student_id
    const student = await mongoose.model("Student").findById(this.student_id);
   
    if (!student) {
      return next(new Error("Invalid student_id: User does not exist or is not a student."));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Submission Model
const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
