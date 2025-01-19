import { getAllAssignments, getAssignmentById } from "./assignment.service.js";
import { getAllSubmissions } from "../submission/submission.service.js";
import { getUserByUID } from "../user/user.service.js";
import Student from "../student/student.model.js";
import { getStudentByUserId } from "../student/student.service.js";

export const resolvers = {
  Query: {
    // Resolver for fetching all assignments
    assignments: async () => {
      try {
        return await getAllAssignments();
      } catch (error) {
        console.error("Error fetching assignments:", error);
        throw new Error("Could not fetch assignments.");
      }
    },

    // Resolver for fetching a single assignment by ID
    assignment: async (_, { id }) => {
      try {
        return await getAssignmentById(id);
      } catch (error) {
        console.error(`Error fetching assignment with ID: ${id}`, error);
        throw new Error(`Could not fetch assignment with ID: ${id}.`);
      }
    },
  },
  Assignment: {
    submissions: async (parent) => {
      try {
        const allSubmissions = await getAllSubmissions();
        return allSubmissions.filter((submission) =>
            submission.assignment_id.equals(parent.id)
        );
      } catch (error) {
        console.error(`Error fetching submissions for assignment ID: ${parent.id}`, error);
        throw new Error("Could not fetch submissions for the assignment.");
      }
    },
    submission: async (parent, _, { user }) => {
        try {
          if (!user) {
            throw new Error("User not authenticated");
          }
          const allSubmissions = await getAllSubmissions();
          const userDetails = await getUserByUID(user.uid);
          const student = await getStudentByUserId(userDetails._id);
          const user_id = student._id;
          return allSubmissions.find(
            (submission) =>
                submission.assignment_id.equals(parent.id) && 
                submission.student_id.equals(user_id)  
          );
        } catch (error) {
          console.error(
            `Error fetching submission for assignment ID: ${parent.id} and student ID: ${user?.id}`,
            error
          );
          throw new Error(
            "Could not fetch submission for the assignment and student."
          );
        }
    },
  },
};
