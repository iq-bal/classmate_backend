import mongoose from "mongoose";
import ClassSession from "./classSessionModel.js";
import Student from "./studentModel.js";

// Attendance Record Schema
const AttendanceRecordSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSession", // Reference to ClassSession
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Reference to Student
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "absent",
      required: true,
    },
    remarks: {
      type: String, // Optional remarks or comments
      trim: true,
    },
  },
  { timestamps: true }
);

// Add a unique index to prevent duplicate attendance records for the same (session, student) pair
AttendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });

// Pre-save hook to validate session and student IDs
AttendanceRecordSchema.pre("save", async function (next) {
  try {
    // Check if the session exists
    const sessionExists = await ClassSession.exists({ _id: this.session });
    if (!sessionExists) {
      return next(new Error("Invalid session: Class session does not exist."));
    }

    // Check if the student exists
    const studentExists = await Student.exists({ _id: this.student });
    if (!studentExists) {
      return next(new Error("Invalid student: Student does not exist."));
    }

    next(); // Proceed if both checks pass
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

// Attendance Record Model
const AttendanceRecord = mongoose.model("AttendanceRecord", AttendanceRecordSchema);

export default AttendanceRecord;
