import express from "express";
import mongoose from "mongoose";
import Submission from "../../../../models/submissionModel.js";
import User from "../../../../models/userModel.js";
import Student from "../../../../models/studentModel.js";

const router = express.Router();

// Route to check if a submission exists
router.get("/check-submission/:assignment_id", async (req, res) => {
  try {
    const { assignment_id } = req.params;

    // Verify `req.user` is present
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user details" });
    }

    // Fetch the user and student information
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found with the provided UID" });
    }

    const student = await Student.findOne({ user_id: user._id });
    if (!student) {
      return res.status(404).json({ error: "Student entry not found for the user" });
    }

    const student_id = student._id;

    // Validate assignment_id
    if (!mongoose.Types.ObjectId.isValid(assignment_id)) {
      return res.status(400).json({ error: "Invalid assignment_id" });
    }

    // Check if a submission exists with the given assignment_id and student_id
    const submission = await Submission.findOne({ assignment_id, student_id });

    if (submission) {
      return res.status(200).json({
        exists: true,
        message: "Submission found",
        submission,
      });
    } else {
      return res.status(404).json({
        exists: false,
        message: "No submission found for the given assignment_id and student_id",
      });
    }
  } catch (error) {
    console.error("Error checking submission:", error);
    res.status(500).json({ error: "An error occurred while checking the submission" });
  }
});

export default router;
