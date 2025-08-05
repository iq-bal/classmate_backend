import mongoose from "mongoose";
import Course from "../course/course.model.js";

const classSessionSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    start_time: {
        type: String, 
        required: true,
    },
    end_time: {
        type: String, 
        required: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
      required: true,
    },
    meeting_link: {
      type: String,
      trim: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    }
  },
  { timestamps: true }
);

// Pre-save hook to validate course_id
classSessionSchema.pre("save", async function (next) {
  try {
    const courseExists = await Course.exists({ _id: this.course_id });
    if (!courseExists) {
      return next(new Error("Invalid course_id: Course does not exist."));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Class Session Model
const ClassSession = mongoose.model("ClassSession", classSessionSchema);

export default ClassSession;