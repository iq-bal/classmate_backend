import { getAllStudents, getStudentById } from "./student.service.js";
import { getAllSubmissions } from "../submission/submission.service.js";
import { getUserByUID } from "../user/user.service.js";
import { getStudentByUserId } from "./student.service.js";
import { getEnrollmentsByStudent } from "../enrollment/enrollment.service.js";
import { checkRole } from "../../utils/check_roles.js";
import { uploadToLocal } from '../../../services/local.storage.js';
import User from '../user/user.model.js';
import Student from './student.model.js';
import { GraphQLError } from 'graphql';
export const resolvers = {
  Query: {
    // Resolver for fetching all students
    students: async () => {
      try {
        return await getAllStudents();
      } catch (error) {
        console.error("Error fetching students:", error);
        throw new Error("Could not fetch students.");
      }
    },

    // Resolver for fetching a single student by ID
    student: async (_, { id }) => {
      try {
        return await getStudentById(id);
      } catch (error) {
        console.error(`Error fetching student with ID: ${id}`, error);
        throw new Error(`Could not fetch student with ID: ${id}.`);
      }
    },

    // Resolver for fetching current authenticated student
    currentStudent: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        // Check if user is a student
        await checkRole('student')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new Error('User not found');
        }

        // Get student details
        const student = await getStudentByUserId(userDetails._id);
        if (!student) {
          throw new Error('Student profile not found');
        }

        return student;
      } catch (error) {
        console.error('Error fetching current student:', error);
        throw new Error(error.message || 'Could not fetch current student profile.');
      }
    },
  },
  Student: {
    name: async (parent) => {
      try {
        // If user_id is populated, get name from there
        if (parent.user_id && parent.user_id.name) {
          return parent.user_id.name;
        }
        // If user_id is not populated, we need to populate it
        const Student = (await import('./student.model.js')).default;
        const student = await Student.findById(parent._id || parent.id).populate('user_id');
        return student?.user_id?.name || 'N/A';
      } catch (error) {
        console.error(`Error fetching name for student ID: ${parent.id}`, error);
        return 'N/A';
      }
    },
    email: async (parent) => {
      try {
        // If user_id is populated, get email from there
        if (parent.user_id && parent.user_id.email) {
          return parent.user_id.email;
        }
        // If user_id is not populated, we need to populate it
        const Student = (await import('./student.model.js')).default;
        const student = await Student.findById(parent._id || parent.id).populate('user_id');
        return student?.user_id?.email || 'N/A';
      } catch (error) {
        console.error(`Error fetching email for student ID: ${parent.id}`, error);
        return 'N/A';
      }
    },
    profile_picture: async (parent) => {
      try {
        // If user_id is populated, get profile_picture from there
        if (parent.user_id && parent.user_id.profile_picture) {
          return parent.user_id.profile_picture;
        }
        // If user_id is not populated, we need to populate it
        const Student = (await import('./student.model.js')).default;
        const student = await Student.findById(parent._id || parent.id).populate('user_id');
        return student?.user_id?.profile_picture || null;
      } catch (error) {
        console.error(`Error fetching profile_picture for student ID: ${parent.id}`, error);
        return null;
      }
    },
    department: async (parent) => {
      try {
        // Return department value or default if null/undefined
        return parent.department || "Computer Science and Engineering";
      } catch (error) {
        console.error(`Error fetching department for student ID: ${parent.id}`, error);
        return "Computer Science and Engineering";
      }
    },
    semester: async (parent) => {
      try {
        // Return semester value or default if null/undefined
        return parent.semester || "1";
      } catch (error) {
        console.error(`Error fetching semester for student ID: ${parent.id}`, error);
        return "1";
      }
    },
    cgpa: async (parent) => {
      try {
        // Return cgpa value or default if null/undefined
        return parent.cgpa || "0";
      } catch (error) {
        console.error(`Error fetching cgpa for student ID: ${parent.id}`, error);
        return "0";
      }
    },
    submissions: async (parent) => {
      try {
        const allSubmissions = await getAllSubmissions();
        return allSubmissions.filter(submission => submission.student_id === parent.id);
      } catch (error) {
        console.error(`Error fetching submissions for student ID: ${parent.id}`, error);
        throw new Error("Could not fetch submissions for the student.");
      }
    },
    enrollments: async (parent) => {
      try {
        return await getEnrollmentsByStudent(parent._id || parent.id);
      } catch (error) {
        console.error(`Error fetching enrollments for student ID: ${parent.id}`, error);
        throw new Error("Could not fetch enrollments for the student.");
      }
    },
  },
  Mutation: {
    updateStudentProfilePicture: async (_, { image }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        // Check if user is a student
        await checkRole('student')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        // Get student details
        const student = await getStudentByUserId(userDetails._id);
        if (!student) {
          throw new GraphQLError('Student profile not found');
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

        // Update user's profile picture
        const updatedUser = await User.findByIdAndUpdate(
          userDetails._id,
          { 
            profile_picture: imageUrl,
            updatedAt: new Date()
          },
          { new: true }
        );

        // Return updated student with populated user data
        const updatedStudent = await getStudentByUserId(userDetails._id);
        return updatedStudent;
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to update profile picture');
      }
    },

    updateStudentCoverPicture: async (_, { image }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        // Check if user is a student
        await checkRole('student')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        // Get student details
        const student = await getStudentByUserId(userDetails._id);
        if (!student) {
          throw new GraphQLError('Student profile not found');
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

        // Update user's cover picture
        const updatedUser = await User.findByIdAndUpdate(
          userDetails._id,
          { 
            cover_picture: imageUrl,
            updatedAt: new Date()
          },
          { new: true }
        );

        // Return updated student with populated user data
        const updatedStudent = await getStudentByUserId(userDetails._id);
        return updatedStudent;
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to update cover picture');
      }
    },

    updateStudentInfo: async (_, { studentInput }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        // Check if user is a student
        await checkRole('student')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        // Get student details
        const student = await getStudentByUserId(userDetails._id);
        if (!student) {
          throw new GraphQLError('Student profile not found');
        }

        // Update student information
        const updatedStudent = await Student.findByIdAndUpdate(
          student._id,
          {
            ...studentInput,
            updatedAt: new Date()
          },
          { new: true }
        ).populate('user_id', 'name email profile_picture cover_picture');

        if (!updatedStudent) {
          throw new GraphQLError('Failed to update student information');
        }

        return updatedStudent;
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to update student information');
      }
    },

    updateStudentAbout: async (_, { about }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        // Check if user is a student
        await checkRole('student')(user);

        // Get user details
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        // Get student details
        const student = await getStudentByUserId(userDetails._id);
        if (!student) {
          throw new GraphQLError('Student profile not found');
        }

        // Update student about field
        const updatedStudent = await Student.findByIdAndUpdate(
          student._id,
          {
            about: about.trim(),
            updatedAt: new Date()
          },
          { new: true }
        ).populate('user_id', 'name email profile_picture cover_picture');

        if (!updatedStudent) {
          throw new GraphQLError('Failed to update student about');
        }

        return updatedStudent;
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to update student about');
      }
    },
  },
};
