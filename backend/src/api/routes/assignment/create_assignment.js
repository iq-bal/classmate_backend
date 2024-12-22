import express from "express";
import Assignment from "../../../../models/assignmentModel.js";

const router = express.Router();

// Create Assignment Route
router.post("/create-assignment", async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const { courseId } = req.query;

    console.log(title,description,deadline,courseId);
    

    // Validate required fields
    if (!courseId || !title || !description || !deadline) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    
    // Create a new assignment
    const newAssignment = new Assignment({
      course_id: courseId,
      title,
      description,
      deadline: new Date(deadline),
    });

    // Save the assignment to the database
    const savedAssignment = await newAssignment.save();

    res.status(201).json({
      message: "Assignment created successfully.",
      assignment: savedAssignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred.", error: error.message });
  }
});

export default router;
