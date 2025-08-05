import { getAllSubmissions, getSubmissionById, getSubmissionsByAssignment, getSubmissionByAssignmentAndStudent, updateSubmission } from "./submission.service.js";
import { checkRole } from "../../utils/check_roles.js";

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

    // Resolver for fetching submissions by assignment
    submissionsByAssignment: async (_, { assignment_id }) => {
      try {
        return await getSubmissionsByAssignment(assignment_id);
      } catch (error) {
        console.error("Error fetching submissions for assignment:", error);
        throw new Error("Could not fetch submissions for this assignment.");
      }
    },

    getSubmissionByAssignmentAndStudent: async (_, { assignment_id, student_id }) => {
      try {
        return await getSubmissionByAssignmentAndStudent(assignment_id, student_id);
      } catch (error) {
        console.error("Error fetching specific submission:", error);
        throw new Error("Could not fetch specific submission.");
      }
    }
  },

  Mutation: {
    updateSubmission: async (_, { id, submissionInput }, { user }) => {
      try {
        await checkRole("teacher")(user);
        return await updateSubmission(id, submissionInput);
      } catch (error) {
        console.error("Error updating submission:", error);
        throw new Error("Could not update submission.");
      }
    }
  },

  Submission: {
    student_id: async (parent) => {
      try {
        // Convert ObjectId to string for GraphQL ID type
        return parent.student_id?._id?.toString() || parent.student_id?.toString() || parent.student_id;
      } catch (error) {
        console.error("Error converting student_id:", error);
        return null;
      }
    },
    student: async (parent) => {
      try {
        const student = parent.student_id;
        const user = student.user_id;
        
        return {
          id: student._id,
          name: user.name,
          email: user.email,
          profile_picture: user.profile_picture,
          roll: student.roll,
          section: student.section
        };
      } catch (error) {
        console.error("Error mapping student data:", error);
        return null;
      }
    },
    assignment_id: async (parent) => {
      try {
        // Convert ObjectId to string for GraphQL ID type
        return parent.assignment_id?._id?.toString() || parent.assignment_id?.toString() || parent.assignment_id;
      } catch (error) {
        console.error("Error converting assignment_id:", error);
        return null;
      }
    },
    assignment: async (parent) => {
      try {
        // Return the populated assignment data
        return parent.assignment_id;
      } catch (error) {
        console.error("Error returning assignment data:", error);
        return null;
      }
    }
  }
};
