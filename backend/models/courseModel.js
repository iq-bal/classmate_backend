import mongoose from "mongoose";

// Schedule Schema for embedded schedule entries
const scheduleSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
  },
  room_no: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  start_time: {
    type: String, // Format: "HH:MM AM/PM"
    required: true,
  },
  end_time: {
    type: String, // Format: "HH:MM AM/PM"
    required: true,
  },
});

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
    required: true,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User collection
    required: true,
  },
  schedule: {
    type: [scheduleSchema],
    validate: {
      validator: function (v) {
        return v && v.length > 0; // Ensure at least one schedule entry is present
      },
      message: "A course must have at least one schedule entry.",
    },
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

// Course Model
const Course = mongoose.model("Course", courseSchema);

export default Course;
