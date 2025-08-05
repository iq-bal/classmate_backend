import { getAllCourses, getCourseById, getEnrollmentCount, searchCoursesInDatabase, updateCourseTeacher, deleteCourse } from "./course.service.js";
import { getSyllabusByCourseId } from "../syllabus/syllabus.service.js";
import { getTeacherById } from "../teacher/teacher.service.js";
import { getEnrollment, getEnrollmentsByCourse } from "../enrollment/enrollment.service.js";
import { checkRole } from "../../utils/check_roles.js";
import { getUserByUID } from "../user/user.service.js";
import { getStudentByUserId } from "../student/student.service.js";
import { getSessionsByCourse } from "../session/session.service.js";
import { getSchedulesByCourse, getScheduleByCourseAndDayAndTeacher, getScheduleByCourseAndDayAndSection } from "../schedule/schedule.service.js";
import { getAssignmentsByCourse } from "../assignment/assignment.service.js";
import { getClassTestsByCourse } from "../classtest/classtest.service.js";
import Teacher from '../teacher/teacher.model.js';
import Course from './course.model.js';
import { GraphQLError } from 'graphql';
import { uploadToLocal } from '../../../services/local.storage.js';
import Syllabus from "../syllabus/syllabus.model.js";
import { reviewService } from "../reviews/reviews.service.js";
import { getDriveFilesByCourse } from "../drive/drive.service.js";
import { getForumPostsByCourse } from "../forum/forum.service.js";

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
  Mutation: {
    updateCourseTeacher: async (_, { course_id, teacher_id }, { user }) => {
      try {
        await checkRole("teacher")(user);
        return await updateCourseTeacher(course_id, teacher_id);
      } catch (error) {
        console.error("Error updating course teacher:", error);
        throw new Error("Could not update course teacher.");
      }
    },
    createCourse: async (_, { title, course_code, credit, excerpt, description, image }, { user }) => {
      try {
          if (!user) {
              throw new GraphQLError('Authentication required');
          }
          const userDetails = await getUserByUID(user.uid);
          if (!userDetails) {
              throw new GraphQLError('User not found');
          }

          if (userDetails.role !== 'teacher') {
              throw new GraphQLError('Only teachers can create courses');
          }
          const teacher = await Teacher.findOne({ user_id: userDetails._id });

          
          if (!teacher) {
              throw new GraphQLError('Invalid teacher_id - Teacher does not exist');
          }
          

            let imageUrl = null;
            if (image) {
                const file = await image;
                const uploadResult = await uploadToLocal({
                    stream: file.file.createReadStream(),
                    name: file.file.filename,
                    mimetype: file.file.mimetype
                });
                imageUrl = uploadResult.url;
            } 

          const newCourse = await Course.create({
            
            teacher_id: teacher._id,
              title,
              course_code,
              credit,
              excerpt,
              description,
              image: imageUrl
          });
          await Syllabus.create({
            course_id: newCourse._id,
          }); 
          // await Schedule.create({
          //   course_id: newCourse._id,
          //   teacher_id: teacher._id,
          // });
          // console.log("Course created successfully:", newCourse);
          return newCourse;
      } catch (error) {
          throw new GraphQLError(error.message);
      }
  },
  deleteCourse: async (_, { id }, { user }) => {
      try {
          if (!user) {
              throw new GraphQLError('Authentication required');
          }
          const userDetails = await getUserByUID(user.uid);
          if (!userDetails) {
              throw new GraphQLError('User not found');
          }

          if (userDetails.role !== 'teacher') {
              throw new GraphQLError('Only teachers can delete courses');
          }

          return await deleteCourse(id, userDetails);
      } catch (error) {
          throw new GraphQLError(error.message);
      }
  }
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
    enrolled: async (parent)=>{
      try {
        return await getEnrollmentCount(parent._id);
      }
      catch (error) {
        console.error("Error fetching enrollment:", error);
        throw new Error("Could not fetch enrollment for this course.");
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
    enrollments: async (parent) => {
      try {
        return await getEnrollmentsByCourse(parent._id);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        throw new Error("Could not fetch enrollments for this course.");
      }
    },
    enrolled_students: async (parent, { section }) => {
      try {
        const enrollments = await getEnrollmentsByCourse(parent._id);
        // Filter to only include approved enrollments
        const approvedEnrollments = enrollments.filter(enrollment => enrollment.status === 'approved');
        const studentIds = approvedEnrollments.map(enrollment => enrollment.student_id);
        
        // Import Student model to populate student data
        const Student = (await import('../student/student.model.js')).default;
        const User = (await import('../user/user.model.js')).default;
        
        let students = await Student.find({ _id: { $in: studentIds } })
          .populate('user_id', 'name email profile_picture');
        
        // Filter by section if provided
        if (section) {
          students = students.filter(student => student.section === section);
        }
        
        // Transform to match the expected format
        return students.map(student => ({
          id: student._id,
          roll: student.roll,
          name: student.user_id.name,
          email: student.user_id.email,
          section: student.section,
          profile_picture: student.user_id.profile_picture
        }));
      } catch (error) {
        console.error("Error fetching enrolled students:", error);
        throw new Error("Could not fetch enrolled students for this course.");
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
    classTests: async (parent) => {
        try {
            return await getClassTestsByCourse(parent._id);
        } catch (error) {
            throw new Error("Failed to fetch class tests for course");
        }
    },
    schedule: async (parent, { section, day, teacher_id }) => {
        try {
            // If teacher_id is provided, use teacher-based lookup
            if (teacher_id) {
                return await getScheduleByCourseAndDayAndTeacher(parent._id, day, teacher_id);
            }
            // If section is provided, use section-based lookup
            else if (section) {
                return await getScheduleByCourseAndDayAndSection(parent._id, day, section);
            }
            // If neither is provided, throw an error
            else {
                throw new Error("Either section or teacher_id must be provided");
            }
        } catch (error) {
            throw new Error(error.message || "Failed to fetch schedule for course");
        }
    },
    assignments: async (parent) => {
        try {
            return await getAssignmentsByCourse(parent._id);
        } catch (error) {
            throw new Error("Failed to fetch assignments for course");
        }
    }, 
    reviews: async (parent) => {
      try {
        return await reviewService.getReviewsByCourse(parent._id);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw new Error("Could not fetch reviews for this course.");
      }
    },
    averageRating: async (parent) => {
      try {
        const reviews = await reviewService.getReviewsByCourse(parent._id);
        if (reviews.length === 0) {
          return null;
        }
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
      } catch (error) {
        console.error("Error calculating average rating:", error);
        throw new Error("Could not calculate average rating for this course.");
      }
    },
    drive: async (parent) => {
      try {
        return await getDriveFilesByCourse(parent._id);
      } catch (error) {
        console.error("Error fetching drive files for course:", error);
        throw new Error("Could not fetch drive files for this course.");
      }
    },
    forum: async (parent) => {
      try {
        return await getForumPostsByCourse(parent._id);
      } catch (error) {
        console.error("Error fetching forum posts for course:", error);
        throw new Error("Could not fetch forum posts for this course.");
      }
    }
  }
};
