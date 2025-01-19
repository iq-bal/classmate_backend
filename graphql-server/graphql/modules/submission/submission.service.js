import Submission from "./submission.model.js";

// Function to get all submissions
export const getAllSubmissions = async () => {
  try {
    const submissions = await Submission.find(); // Fetch all submissions
    return submissions;
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    throw new Error("Could not fetch submissions.");
  }
};

// Function to get a single submission by ID
export const getSubmissionById = async (id) => {
  try {
    const submission = await Submission.findById(id); // Fetch submission by ID
    if (!submission) {
      throw new Error(`Submission with ID: ${id} not found.`);
    }
    return submission;
  } catch (error) {
    console.error(`Error fetching submission with ID: ${id}`, error);
    throw new Error(`Could not fetch submission with ID: ${id}.`);
  }
};
