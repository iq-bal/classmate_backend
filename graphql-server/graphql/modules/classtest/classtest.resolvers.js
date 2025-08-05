import { getAllClassTests, getClassTestById, getClassTestsByCourse, createClassTest, updateClassTest, deleteClassTest } from './classtest.service.js';
import { getCourseById } from '../course/course.service.js';
import { checkRole } from '../../utils/check_roles.js';
import { getUserByUID } from '../user/user.service.js';
import { getTeacherByUserId } from '../teacher/teacher.service.js';

export const resolvers = {
  Query: {
    // Resolver for fetching all class tests
    classTests: async () => {
      try {
        return await getAllClassTests();
      } catch (error) {
        console.error('Error fetching class tests:', error);
        throw new Error('Could not fetch class tests.');
      }
    }, 

    // Resolver for fetching a class test by ID
    classTest: async (_, { id }) => {
      try {
        return await getClassTestById(id);
      } catch (error) {
        console.error(`Error fetching class test with ID: ${id}`, error);
        throw new Error(`Could not fetch class test with ID: ${id}.`);
      }
    },

    // Resolver for fetching class tests by course ID
    classTestsByCourse: async (_, { course_id }) => {
      try {
        return await getClassTestsByCourse(course_id);
      } catch (error) {
        console.error(`Error fetching class tests for course: ${course_id}`, error);
        throw new Error('Could not fetch class tests for course.');
      }
    },
  },

  Mutation: {
    // Resolver for creating a new class test
    createClassTest: async (_, { course_id, title, description, date, duration, total_marks }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Authentication required');
        }

        // Check if user is a teacher
        await checkRole('teacher')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new Error('User not found');
        }

        // Get teacher details
        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new Error('Teacher profile not found');
        }

        // Get course details to verify ownership
        const course = await getCourseById(course_id);
        if (!course) {
          throw new Error('Course not found');
        }

        // Check if the teacher owns the course
        console.log('Course teacher_id:', course.teacher_id._id);
        console.log('Current teacher _id:', teacher._id);
        console.log('Course teacher_id type:', typeof course.teacher_id._id);
        console.log('Current teacher _id type:', typeof teacher._id);
        
        if (course.teacher_id._id.toString() !== teacher._id.toString()) {
          throw new Error('Only the course teacher can create class tests for this course');
        }

        const classTestData = {
          course_id,
          title,
          description,
          date,
          duration,
          total_marks,
        };
        return await createClassTest(classTestData);
      } catch (error) {
        console.error('Error creating class test:', error);
        throw new Error(error.message || 'Could not create class test.');
      }
    },

    // Resolver for updating a class test
    updateClassTest: async (_, { id, ...updates }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Authentication required');
        }

        // Check if user is a teacher
        await checkRole('teacher')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new Error('User not found');
        }

        // Get teacher details
        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new Error('Teacher profile not found');
        }

        // Get class test details to verify ownership
        const classTest = await getClassTestById(id);
        if (!classTest) {
          throw new Error('Class test not found');
        }

        // Get course details to verify ownership
        const course = await getCourseById(classTest.course_id);
        if (!course) {
          throw new Error('Course not found');
        }

        // Check if the teacher owns the course
         if (course.teacher_id._id.toString() !== teacher._id.toString()) {
           throw new Error('Only the course teacher can update class tests for this course');
         }

        return await updateClassTest(id, updates);
      } catch (error) {
        console.error(`Error updating class test with ID: ${id}`, error);
        throw new Error(error.message || 'Could not update class test.');
      }
    },

    // Resolver for deleting a class test
    deleteClassTest: async (_, { id }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Authentication required');
        }

        // Check if user is a teacher
        await checkRole('teacher')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new Error('User not found');
        }

        // Get teacher details
        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new Error('Teacher profile not found');
        }

        // Get class test details to verify ownership
        const classTest = await getClassTestById(id);
        if (!classTest) {
          throw new Error('Class test not found');
        }

        // Get course details to verify ownership
        const course = await getCourseById(classTest.course_id);
        if (!course) {
          throw new Error('Course not found');
        }

        // Check if the teacher owns the course
         if (course.teacher_id._id.toString() !== teacher._id.toString()) {
           throw new Error('Only the course teacher can delete class tests for this course');
         }

        return await deleteClassTest(id);
      } catch (error) {
        console.error(`Error deleting class test with ID: ${id}`, error);
        throw new Error(error.message || 'Could not delete class test.');
      }
    },
  },

  ClassTest: {
    // Field resolver for the course field
    course: async (parent) => {
      try {
        return await getCourseById(parent.course_id);
      } catch (error) {
        console.error('Error fetching course for class test:', error);
        throw new Error('Could not fetch course for this class test.');
      }
    },
  },
};