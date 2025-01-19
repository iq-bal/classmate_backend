import mongoose from "mongoose";
import Student from "../student/student.model.js";
import ClassSession from "../session/session.model.js";

// Attendance Record Schema
const AttendanceRecordSchema = new mongoose.Schema(
  {
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSession",
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "absent",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Add a unique index to prevent duplicate attendance records for the same (session, student) pair
AttendanceRecordSchema.index({ session_id: 1, student_id: 1 }, { unique: true });

// Pre-save hook to validate session and student IDs
AttendanceRecordSchema.pre("save", async function (next) {
  if (!this.isNew && !this.isModified("session_id") && !this.isModified("student_id")) {
    return next();
  }

  try {
    const sessionExists = await ClassSession.exists({ _id: this.session_id });
    if (!sessionExists) {
      return next(new Error(`Invalid session: Class session with ID ${this.session_id} does not exist.`));
    }

    const studentExists = await Student.exists({ _id: this.student_id });
    if (!studentExists) {
      return next(new Error(`Invalid student: Student with ID ${this.student_id} does not exist.`));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Attendance Record Model
const AttendanceRecord = mongoose.model("AttendanceRecord", AttendanceRecordSchema);

export default AttendanceRecord;