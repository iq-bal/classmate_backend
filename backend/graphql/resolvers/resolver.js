import Assignment from "../../models/assignmentModel";
import Course from "../../models/courseModel";
import Submission from "../../models/submissionModel";

const resolvers = {
  Query: {
    // Fetch all courses
    courses: async () => {
      try {
        return await Course.find();
      } catch (error) {
        throw new Error("Failed to fetch courses");
      }
    },

    // Fetch a single course by ID
    course: async (_, { id }) => {
      try {
        return await Course.findById(id);
      } catch (error) {
        throw new Error(`Failed to fetch course with ID: ${id}`);
      }
    },

    // Fetch all assignments
    assignments: async () => {
      try {
        return await Assignment.find();
      } catch (error) {
        throw new Error("Failed to fetch assignments");
      }
    },

    // Fetch a single assignment by ID
    assignment: async (_, { id }) => {
      try {
        return await Assignment.findById(id);
      } catch (error) {
        throw new Error(`Failed to fetch assignment with ID: ${id}`);
      }
    },

    // Fetch all submissions
    submissions: async () => {
      try {
        return await Submission.find();
      } catch (error) {
        throw new Error("Failed to fetch submissions");
      }
    },

    // Fetch a single submission by ID
    submission: async (_, { id }) => {
      try {
        return await Submission.findById(id);
      } catch (error) {
        throw new Error(`Failed to fetch submission with ID: ${id}`);
      }
    },
  },
  Assignment:{
    submissions: async (parent) => {
        try {
          return await Submission.find({ assignment_id: parent.id });
        } catch (error) {
          throw new Error(`Failed to fetch submissions for assignment with ID: ${parent.id}`);
        }
    },
  }
};

export default resolvers;
