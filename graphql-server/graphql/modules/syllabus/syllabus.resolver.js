import { getAllSyllabus, getSyllabusById, updateSyllabus } from "./syllabus.service.js";
import { checkRole } from "../../utils/check_roles.js";

export const resolvers = {
  Query: {
    syllabuses: async () => {
        try {
          return await getAllSyllabus();
        } catch (error) {
          console.error("Error fetching syllabuses:", error);
          throw new Error("Could not fetch syllabuses.");
        }
    },
    syllabus: async (_, { id }) => {
        try {
          return await getSyllabusById(id);
        } catch (error) {
          console.error(`Error fetching syllabus with ID: ${id}`, error);
          throw new Error(`Could not fetch syllabus with ID: ${id}.`);
        }
    },
  },
  Mutation: {
    updateSyllabus: async (_, { course_id, syllabus }, { user }) => {
      await checkRole("teacher")(user);
      try {
        return await updateSyllabus(course_id, syllabus);
      } catch (error) {
        console.error(`Error updating syllabus for course ID: ${course_id}`, error);
        throw new Error("Could not update syllabus.");
      }
    },
  },
};
