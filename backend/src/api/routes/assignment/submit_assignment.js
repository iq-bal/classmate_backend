import express from "express";
import multer from "multer"; // For handling file uploads
import path from "path"; // For managing file paths
import Submission from "../../../../models/submissionModel.js";
import Assignment from "../../../../models/assignmentModel.js";
import Student from "../../../../models/studentModel.js";
import User from "../../../../models/userModel.js";
import mongoose from "mongoose";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// POST route to submit an assignment
router.post(
  "/submit-assignment/:assignment_id",
  upload.single("file"), // Handle single file upload with "file" field name
  async (req, res) => {
    try {
      const { assignment_id } = req.params; // Get assignment_id from route parameters
      
      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Fetch the user_id from req.user.uid (provided by authenticateToken middleware)
      
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
        return res.status(400).json({ error: "User not found with the provided uid" });
      }
      // Find the student entry for the user
      const student = await Student.findOne({ user_id: user._id });
      if (!student) {
        return res.status(400).json({ error: "Student entry not found for the user" });
      }
      const student_id = student._id; // Use the student_id for submission


      // Validate the assignment_id
      const assignment = await Assignment.findById(assignment_id);
      
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // File URL (relative path for now, can be converted to absolute/public path if needed)
      const file_url = `/uploads/${req.file.filename}`;


      // Create a new submission
      const newSubmission = new Submission({
        assignment_id,
        student_id,
        file_url,
      });

      
      // Save the submission
      const savedSubmission = await newSubmission.save();
      res.status(201).json({ message: "Submission successful", submission: savedSubmission });
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ error: "An error occurred while submitting the assignment" });
    }
  }
);

export default router;
