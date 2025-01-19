import Assignment from "./assignment.model.js";

// Function to get all assignments
export const getAllAssignments = async () => {
  try {
    const assignments = await Assignment.find(); // Fetch all assignments
    return assignments;
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    throw new Error("Could not fetch assignments.");
  }
};

// Function to get a single assignment by ID
export const getAssignmentById = async (id) => {
  try {
    const assignment = await Assignment.findById(id); // Fetch assignment by ID
    if (!assignment) {
      throw new Error(`Assignment with ID: ${id} not found.`);
    }
    return assignment;
  } catch (error) {
    console.error(`Error fetching assignment with ID: ${id}`, error);
    throw new Error(`Could not fetch assignment with ID: ${id}.`);
  }
};

export const getAssignmentsByCourse = async (courseId) => {
  try {
    const assignments = await Assignment.find({ course_id: courseId });
    return assignments;
  } catch (error) {
    console.error("Error fetching assignments by course:", error);
    throw new Error("Could not fetch assignments by course.");
  }
};
