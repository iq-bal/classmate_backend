import Student from "./student.model.js";

// Function to get all students
export const getAllStudents = async () => {
  try {
    // Fetch all students from the database
    return await Student.find();
  } catch (error) {
    console.error("Error fetching students:", error);
    throw new Error("Could not fetch students.");
  }
};

// Function to get a student by ID
export const getStudentById = async (id) => {
  try {
    // Fetch a single student by ID
    const student = await Student.findById(id);
    if (!student) {
      throw new Error(`Student with ID: ${id} not found.`);
    }
    return student;
  } catch (error) {
    console.error(`Error fetching student with ID: ${id}`, error);
    throw new Error("Could not fetch student.");
  }
};



export const getStudentByUserId = async (userId) => {
    try {
      // Search for the student document where user_id matches the provided userId
      const student = await Student.findOne({ user_id: userId });
  
      if (!student) {
        throw new Error(`No student found for user_id: ${userId}`);
      }
  
      return student; // Return the student document
    } catch (error) {
      console.error(`Error finding student with user_id: ${userId}`, error);
      throw new Error("Error occurred while fetching student.");
    }
  };