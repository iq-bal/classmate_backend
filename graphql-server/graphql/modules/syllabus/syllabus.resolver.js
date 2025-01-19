import { getAllSyllabus, getSyllabusById } from "./syllabus.service.js";

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
    submission: async (_, { id }) => {
        try {
          return await getSyllabusById(id);
        } catch (error) {
          console.error(`Error fetching submission with ID: ${id}`, error);
          throw new Error(`Could not fetch submission with ID: ${id}.`);
        }
    },
  },
};
