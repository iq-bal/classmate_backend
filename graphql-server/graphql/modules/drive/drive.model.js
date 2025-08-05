import mongoose from "mongoose";

const driveFileSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  file_name: {
    type: String,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  file_size: {
    type: Number,
    required: true,
  },
  file_type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to validate course_id and teacher_id
driveFileSchema.pre("save", async function (next) {
  try {
    // Validate course_id
    const course = await mongoose.model("Course").findById(this.course_id);
    if (!course) {
      return next(new Error("Invalid course_id: Course does not exist."));
    }

    // Validate teacher_id
    const teacher = await mongoose.model("Teacher").findById(this.teacher_id);
    if (!teacher) {
      return next(new Error("Invalid teacher_id: Teacher does not exist."));
    }

    // Verify that the teacher is the owner of the course
    if (course.teacher_id.toString() !== this.teacher_id.toString()) {
      return next(new Error("Teacher is not authorized to upload files to this course."));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Index for efficient queries
driveFileSchema.index({ course_id: 1, uploaded_at: -1 });
driveFileSchema.index({ teacher_id: 1, uploaded_at: -1 });

const DriveFile = mongoose.model("DriveFile", driveFileSchema);

export default DriveFile;