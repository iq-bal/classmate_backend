import { getAllStudents, getStudentById } from "./student.service.js";
import { getAllSubmissions } from "../submission/submission.service.js";
export const resolvers = {
  Query: {
    // Resolver for fetching all students
    students: async () => {
      try {
        return await getAllStudents();
      } catch (error) {
        console.error("Error fetching students:", error);
        throw new Error("Could not fetch students.");
      }
    },

    // Resolver for fetching a single student by ID
    student: async (_, { id }) => {
      try {
        return await getStudentById(id);
      } catch (error) {
        console.error(`Error fetching student with ID: ${id}`, error);
        throw new Error(`Could not fetch student with ID: ${id}.`);
      }
    },
  },
  Student: {
    submissions: async (parent) => {
      try {
        const allSubmissions = await getAllSubmissions();
        return allSubmissions.filter(submission => submission.student_id === parent.id);
      } catch (error) {
        console.error(`Error fetching submissions for student ID: ${parent.id}`, error);
        throw new Error("Could not fetch submissions for the student.");
      }
    },
  },
};
