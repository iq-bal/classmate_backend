import { getAllSubmissions, getSubmissionById } from "./submission.service.js";

export const resolvers = {
  Query: {
    // Resolver for fetching all submissions
    submissions: async () => {
      try {
        return await getAllSubmissions();
      } catch (error) {
        console.error("Error fetching submissions:", error);
        throw new Error("Could not fetch submissions.");
      }
    },

    // Resolver for fetching a submission by ID
    submission: async (_, { id }) => {
      try {
        return await getSubmissionById(id);
      } catch (error) {
        console.error(`Error fetching submission with ID: ${id}`, error);
        throw new Error(`Could not fetch submission with ID: ${id}.`);
      }
    },
  },
};
