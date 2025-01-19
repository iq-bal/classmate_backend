import Course from "../course/course.model.js";

// Function to get all courses
export const getAllCourses = async () => {
  try {
    const courses = await Course.find(); // Fetch all courses
    return courses;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw new Error("Could not fetch courses.");
  }
};

// Function to get a course by ID
export const getCourseById = async (id) => {
  try {
    const course = await Course.findById(id); // Fetch course by ID
    if (!course) {
      throw new Error(`Course with ID: ${id} not found.`);
    }
    return course;
  } catch (error) {
    console.error(`Error fetching course with ID: ${id}`, error);
    throw new Error(`Could not fetch course with ID: ${id}.`);
  }
};


export const searchCoursesInDatabase = async (keyword) => {
  try {
    return await Course.find({
      $text: { $search: keyword },
    });
  } catch (error) {
    console.error("Error searching courses in database:", error);
    throw new Error("Error searching courses in database.");
  }
};

