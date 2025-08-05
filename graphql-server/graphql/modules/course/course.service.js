import Course from "../course/course.model.js";
import { getEnrollmentsByCourse } from "../enrollment/enrollment.service.js";

// Function to get all courses
export const getAllCourses = async () => {
  try {
    const courses = await Course.find()
      .populate({
        path: 'teacher_id',
        populate: {
          path: 'user_id',
          select: 'name profile_picture'
        }
      });
    return courses;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw new Error("Could not fetch courses.");
  }
};

export const getEnrollmentCount = async (courseId) => {
  try {
    const enrollments = await getEnrollmentsByCourse(courseId);
    if (!enrollments) {
      return 0;
    }
    return enrollments.length;
  } catch (error) {
    console.error(`Error fetching enrollment count for course with ID: ${courseId}`, error);
    throw new Error(`Could not fetch enrollment count for course with ID: ${courseId}.`);
  }
}

// Function to get a course by ID
export const getCourseById = async (id) => {
  try {
    const course = await Course.findById(id)
      .populate({
        path: 'teacher_id',
        populate: {
          path: 'user_id',
          select: 'name profile_picture'
        }
      });
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
    }).populate({
      path: 'teacher_id',
      populate: {
        path: 'user_id',
        select: 'name profile_picture'
      }
    });
  } catch (error) {
    console.error("Error searching courses in database:", error);
    throw new Error("Error searching courses in database.");
  } 
};

export const updateCourseTeacher = async (course_id, teacher_id) => {
  try {
    const course = await Course.findByIdAndUpdate(
      course_id,
      { teacher_id }, 
      { new: true }
    ).populate({
      path: 'teacher_id',
      populate: {
        path: 'user_id',
        select: 'name profile_picture'
      }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    return course;
  } catch (error) {
    console.error('Error updating course teacher:', error);
    throw new Error('Could not update course teacher.');
  }
};

export const deleteCourse = async (id, user) => {
  try {
    const course = await Course.findById(id).populate('teacher_id');
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if the user is the teacher of the course
    if (course.teacher_id.user_id.toString() !== user._id.toString()) {
      throw new Error('Only the course teacher can delete this course');
    }

    await course.deleteOne();
    return course;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('Could not delete course.');
  }
};

