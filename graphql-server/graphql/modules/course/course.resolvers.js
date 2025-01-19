import { getAllCourses, getCourseById } from "./course.service.js";
import { searchCoursesInDatabase } from "./course.service.js";
import { getSyllabusByCourseId } from "../syllabus/syllabus.service.js";
import { getTeacherById } from "../teacher/teacher.service.js";
import { getEnrollment } from "../enrollment/enrollment.service.js";
import { checkRole } from "../../utils/check_roles.js";
import { getUserByUID } from "../user/user.service.js";
import { getStudentByUserId } from "../student/student.service.js";
import { getSessionsByCourse } from "../session/session.service.js";
import { getSchedulesByCourse, getScheduleByCourseAndDayAndTeacher } from "../schedule/schedule.service.js";
import { getAssignmentsByCourse } from "../assignment/assignment.service.js";

export const resolvers = {
  Query: {
    // Resolver for fetching all courses
    courses: async () => {
      try {
        return await getAllCourses();
      } catch (error) {
        console.error("Error fetching courses:", error);
        throw new Error("Could not fetch courses.");
      }
    },

    // Resolver for fetching a course by ID
    course: async (_, { id }) => {
      try {
        return await getCourseById(id);
      } catch (error) {
        console.error(`Error fetching course with ID: ${id}`, error);
        throw new Error(`Could not fetch course with ID: ${id}.`);
      }
    },
    // New resolver for search
    searchCourses: async (_, { keyword }) => {
      try {
        return await searchCoursesInDatabase(keyword);
      } catch (error) {
        console.error("Error searching courses:", error);
        throw new Error("Could not search courses.");
      }
    },
    
  },
  Course: {
    syllabus: async (parent) => {
      try {
        return await getSyllabusByCourseId(parent._id);
      } catch (error) {
        console.error("Error fetching syllabus:", error);
        throw new Error("Could not fetch syllabus for this course.");
      }
    }, 
    teacher: async (parent)=>{
      try {
        return await getTeacherById(parent.teacher_id);
      } catch (error) {
        console.error("Error fetching teacher:", error);
        throw new Error("Could not fetch teacher for this course.");
      }
    },
    enrollment: async (parent,_,{user})=>{
      try {
        
        if (!user) {
          throw new Error("User not authenticated");
        }
        await checkRole("student")(user);
        
        const userDetails = await getUserByUID(user.uid);
        const student = await getStudentByUserId(userDetails._id);
        return await getEnrollment(parent._id,student._id);
      } catch (error) {
        console.error("Error fetching enrollment:", error);
        throw new Error("Could not fetch enrollment for this course.");
      }
    },
    sessions: async (parent) => {
        try {      
          return await getSessionsByCourse(parent._id);
        } catch (error) {
            throw new Error("Failed to fetch sessions for course");
        }
    },
    schedules: async (parent) => {
        try {      
          return await getSchedulesByCourse(parent._id);
        } catch (error) {
            throw new Error("Failed to fetch schedules for course");
        }
    },
    schedule: async (parent, { day, teacher_id }) => {
        try {
            return await getScheduleByCourseAndDayAndTeacher (parent._id, day, teacher_id);
        } catch (error) {
            throw new Error("Failed to fetch schedule for course");
        }
    },
    assignments: async (parent) => {
        try {
            return await getAssignmentsByCourse(parent._id);
        } catch (error) {
            throw new Error("Failed to fetch assignments for course");
        }
    },
    

  }
};
