import { getEnrollments, addEnrollment, updateEnrollment, deleteEnrollment, getEnrollment, getEnrollmentsWithStudentsByCourse, updateEnrollmentStatusByTeacher, getEnrollmentsByStudentAndDay, getCurrentClassForStudent } from "./enrollment.service.js";
import { checkRole } from "../../utils/check_roles.js";
import EnrollmentModel from "./enrollment.model.js";
import { getUserByUID } from "../user/user.service.js";
import { getStudentByUserId } from "../student/student.service.js";
import { getTeacherByUserId } from "../teacher/teacher.service.js";

const resolvers = {
    Query: {
        enrollments: async (_, __, { user }) => {
            try {
                // Ensure user is authenticated
                if (!user) {
                    throw new Error("Authentication required");
                }
                return await getEnrollments();
            } catch (error) {
                console.error("Error in enrollments resolver:", error);
                throw new Error(error.message || "Failed to fetch enrollments");
            }
        },
        enrollment: async (_, { id }, { user }) => {
            try {
                // Ensure user is authenticated
                if (!user) {
                    throw new Error("Authentication required");
                }
                
                // Get enrollment by ID
                const enrollment = await EnrollmentModel.findById(id);
                if (!enrollment) {
                    throw new Error(`Enrollment with ID: ${id} not found`);
                }
                
                return enrollment;
            } catch (error) {
                console.error(`Error fetching enrollment with ID: ${id}`, error);
                throw new Error(error.message || "Failed to fetch enrollment");
            }
        },
        enrollmentStatus: async (_, { course_id }, { user }) => {
            try {
                // Ensure user is authenticated
                if (!user) {
                    throw new Error("Authentication required");
                }
                
                // Check if user is a student
                await checkRole("student")(user);
                
                // Get user details
                const userDetails = await getUserByUID(user.uid);
                if (!userDetails) {
                    throw new Error("User not found");
                }
                
                // Get student details
                const student = await getStudentByUserId(userDetails._id);
                if (!student) {
                    throw new Error("Student profile not found");
                }
                
                // Get enrollment status
                const enrollment = await getEnrollment(course_id, student._id);
                return enrollment;
            } catch (error) {
                console.error(`Error fetching enrollment status for course: ${course_id}`, error);
                throw new Error(error.message || "Failed to fetch enrollment status");
            }
        },
        courseEnrollments: async (_, { course_id }, { user }) => {
            try {
                // Ensure user is authenticated
                if (!user) {
                    throw new Error("Authentication required");
                }
                
                // Check if user is a teacher
                await checkRole("teacher")(user);
                
                // Get user details
                const userDetails = await getUserByUID(user.uid);
                if (!userDetails) {
                    throw new Error("User not found");
                }
                
                // Get teacher details
                const teacher = await getTeacherByUserId(userDetails._id);
                if (!teacher) {
                    throw new Error("Teacher profile not found");
                }
                
                // Get enrollments with student details
                return await getEnrollmentsWithStudentsByCourse(course_id);
            } catch (error) {
                console.error(`Error fetching course enrollments for course: ${course_id}`, error);
                throw new Error(error.message || "Failed to fetch course enrollments");
            }
        },
        enrollmentsByDay: async (_, { day }, { user }) => {
            try {
                // Ensure user is authenticated
                if (!user) {
                    throw new Error("Authentication required");
                }
                
                // Get user details
                const userDetails = await getUserByUID(user.uid);
                if (!userDetails) {
                    throw new Error("User not found");
                }
                
                // Get student details
                const student = await getStudentByUserId(userDetails._id);
                if (!student) {
                    throw new Error("Student profile not found");
                }
                
                // Get enrollments for the student filtered by day
                return await getEnrollmentsByStudentAndDay(student._id, day);
            } catch (error) {
                console.error(`Error fetching enrollments for day: ${day}`, error);
                throw new Error(error.message || "Failed to fetch enrollments for the specified day");
            }
        },
        currentClassForStudent: async (_, { day, current_time }, { user }) => {
            try {
                // Ensure user is authenticated
                if (!user) {
                    throw new Error("Authentication required");
                }
                
                // Check if user is a student
                await checkRole("student")(user);
                
                // Get user details
                const userDetails = await getUserByUID(user.uid);
                if (!userDetails) {
                    throw new Error("User not found");
                }
                
                // Get student details
                const student = await getStudentByUserId(userDetails._id);
                if (!student) {
                    throw new Error("Student profile not found");
                }
                
                // Get current class for the student
                return await getCurrentClassForStudent(student._id, day, current_time);
            } catch (error) {
                console.error(`Error fetching current class for day: ${day} and time: ${current_time}`, error);
                throw new Error(error.message || "Failed to fetch current class");
            }
        }
    },
    Mutation: {
        addEnrollment: async (_, { course_id }, { user }) => {
            try {
                await checkRole("student")(user);
                // console.log("user", user);
                return await addEnrollment(course_id, user);
            } catch (error) {
                console.error("Error in addEnrollment resolver:", error);
                throw new Error(error.message || "Failed to enroll in course");
            }
        },
        updateEnrollment: async (_, { id, status }, { user }) => {
            try {
                await checkRole("teacher")(user);
                return await updateEnrollment(id, status);
            } catch (error) {
                console.error("Error in updateEnrollment resolver:", error);
                throw new Error(error.message || "Failed to update enrollment status");
            }
        },
        updateEnrollmentStatusByTeacher: async (_, { enrollment_id, status }, { user }) => {
            try {
                // Ensure user is authenticated
                if (!user) {
                    throw new Error("Authentication required");
                }
                
                // Check if user is a teacher
                await checkRole("teacher")(user);
                
                return await updateEnrollmentStatusByTeacher(enrollment_id, status, user);
            } catch (error) {
                console.error("Error in updateEnrollmentStatusByTeacher resolver:", error);
                throw new Error(error.message || "Failed to update enrollment status");
            }
        },
        deleteEnrollment: async (_, { id }, { user }) => {
            try {
                // Ensure user is authorized (teacher or admin)
                await checkRole("teacher")(user);
                return await deleteEnrollment(id);
            } catch (error) {
                console.error("Error in deleteEnrollment resolver:", error);
                throw new Error(error.message || "Failed to delete enrollment");
            }
        }
    },
    Enrollment: {
        courses: async (parent) => {
            try {
                // Import Course model to get course details
                const Course = (await import('../course/course.model.js')).default;
                
                // Get the course by course_id from the enrollment
                const course = await Course.findById(parent.course_id)
                    .populate({
                        path: 'teacher_id',
                        populate: {
                            path: 'user_id',
                            select: 'name profile_picture'
                        }
                    });
                
                // Return as array since courses is defined as [Course!]
                return course ? [course] : [];
            } catch (error) {
                console.error('Error fetching course for enrollment:', error);
                return [];
            }
        }
    }
}

export { resolvers };