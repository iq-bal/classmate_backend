import { getAllAssignments, getAssignmentById, getSubmissionForAssignmentAndUser, createAssignment, updateAssignment, deleteAssignment, getAssignmentsByCourse } from "./assignment.service.js";
import { getAllSubmissions } from "../submission/submission.service.js";
import { getUserByUID } from "../user/user.service.js";
import Student from "../student/student.model.js";
import { getStudentByUserId } from "../student/student.service.js";
import {ObjectId} from "mongodb";
import { getCourseById } from "../course/course.service.js";
import { checkRole } from "../../utils/check_roles.js";

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

    // Resolver for fetching assignments by course ID
    assignmentsByCourse: async (_, { course_id }) => {
      try {
        return await getAssignmentsByCourse(course_id);
      } catch (error) {
        console.error(`Error fetching assignments for course: ${course_id}`, error);
        throw new Error('Could not fetch assignments for course.');
      }
    },
  },
  Assignment: {
    course: async (parent) => {
      try {
        return await getCourseById(parent.course_id);
      } catch (error) {
        console.error(`Error fetching course for assignment ID: ${parent.id}`, error);
        throw new Error("Could not fetch course for this assignment.");
      }
    },
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
        return await getSubmissionForAssignmentAndUser(parent.id, user);
      } catch (error) {
        console.error(
          `Error fetching submission for assignment ID: ${parent.id} and user: ${user?.uid}`,
          error
        );
        throw new Error("Could not fetch submission for the assignment and student.");
      }
    },
    submissionCount: async (parent) => {
      try {
        const allSubmissions = await getAllSubmissions();
        const assignmentSubmissions = allSubmissions.filter((submission) =>
            submission.assignment_id.equals(parent.id)
        );
        return assignmentSubmissions.length;
      } catch (error) {
        console.error(`Error counting submissions for assignment ID: ${parent.id}`, error);
        throw new Error("Could not count submissions for the assignment.");
      }
    },
    teacher: async (parent) => {
      try {
        // Get the course for this assignment
        const course = await getCourseById(parent.course_id);
        if (!course || !course.teacher_id) {
          return null;
        }
        
        // Return teacher details from the course
        return {
          id: course.teacher_id._id,
          name: course.teacher_id.user_id?.name || 'Unknown Teacher',
          profile_picture: course.teacher_id.user_id?.profile_picture || null
        };
      } catch (error) {
        console.error(`Error fetching teacher for assignment ID: ${parent.id}`, error);
        return null;
      }
    },
  },
  Mutation: {
    createAssignment: async (_, { assignmentInput }, { user }) => {
      await checkRole("teacher")(user);
      try {
        return await createAssignment(assignmentInput, user);
      } catch (error) {
        console.error("Error creating assignment:", error);
        throw new Error(`Failed to create assignment: ${error.message}`);
      }
    },
    updateAssignment: async (_, { id, ...updates }, { user }) => {
      await checkRole("teacher")(user);
      try {
        return await updateAssignment(id, updates, user);
      } catch (error) {
        console.error("Error updating assignment:", error);
        throw new Error(`Failed to update assignment: ${error.message}`);
      }
    },
    deleteAssignment: async (_, { id }, { user }) => {
      await checkRole("teacher")(user);
      try {
        return await deleteAssignment(id, user);
      } catch (error) {
        console.error("Error deleting assignment:", error);
        throw new Error(`Failed to delete assignment: ${error.message}`);
      }
    },
  },
};
