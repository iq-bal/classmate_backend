import Syllabus from "./syllabus.model.js";

export const getAllSyllabus = async () => {
    try {
      const syllabuses = await Syllabus.find(); // Fetch all syllabus records
      return syllabuses;
    } catch (error) {
      console.error("Error fetching all syllabus records:", error);
      throw new Error("Could not fetch syllabus records.");
    }
};

export const getSyllabusByCourseId = async (courseId) => {
    try {
      const syllabus = await Syllabus.findOne({ course_id: courseId }); // Fetch syllabus by course_id
      if (!syllabus) {
        throw new Error(`Syllabus not found for course_id: ${courseId}`);
      }
      return syllabus;
    } catch (error) {
      console.error(`Error fetching syllabus for course_id ${courseId}:`, error);
      throw new Error("Could not fetch syllabus by course_id.");
    }
};


export const getSyllabusById = async (id) => {
    try {
        const syllabus = await Syllabus.findById(id);
        if (!syllabus) {
            throw new Error(`Syllabus not found with id: ${id}`);
        }
        return syllabus;
    } catch (error) {
        console.error(`Error fetching syllabus with id ${id}:`, error);
        throw new Error("Could not fetch syllabus by id.");
    }
};

export const updateSyllabus = async (course_id, syllabusData) => {
    try {
        const syllabus = await Syllabus.findOneAndUpdate(
            { course_id },
            { 
                syllabus: syllabusData,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        if (!syllabus) {
            throw new Error(`Syllabus not found for course_id: ${course_id}`);
        }
        return syllabus;
    } catch (error) {
        console.error(`Error updating syllabus for course_id ${course_id}:`, error);
        throw new Error("Could not update syllabus.");
    }
};