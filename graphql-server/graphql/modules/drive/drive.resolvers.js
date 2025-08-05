import {
  getDriveFilesByCourse,
  getDriveFileById,
  uploadDriveFile,
  deleteDriveFile,
  updateDriveFileDescription,
  renameDriveFile,
  getDriveFilesByTeacher
} from "./drive.service.js";
import { checkRole } from "../../utils/check_roles.js";
import { getUserByUID } from "../user/user.service.js";
import { getTeacherByUserId } from "../teacher/teacher.service.js";
import { getCourseById } from "../course/course.service.js";
import { uploadToLocal } from '../../../services/local.storage.js';
import { GraphQLError } from 'graphql';

export const resolvers = {
  Query: {
    // Get all drive files for a specific course
    driveFiles: async (_, { course_id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        // Verify course exists
        const course = await getCourseById(course_id);
        if (!course) {
          throw new GraphQLError('Course not found');
        }

        return await getDriveFilesByCourse(course_id);
      } catch (error) {
        console.error(`Error fetching drive files for course: ${course_id}`, error);
        throw new GraphQLError(error.message || "Could not fetch drive files.");
      }
    },

    // Get a specific drive file by ID
    driveFile: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        return await getDriveFileById(id);
      } catch (error) {
        console.error(`Error fetching drive file with ID: ${id}`, error);
        throw new GraphQLError(error.message || "Could not fetch drive file.");
      }
    },

    // Get all drive files uploaded by the authenticated teacher
    myDriveFiles: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        await checkRole('teacher')(user);

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new GraphQLError('Teacher profile not found');
        }

        return await getDriveFilesByTeacher(teacher._id);
      } catch (error) {
        console.error('Error fetching teacher drive files:', error);
        throw new GraphQLError(error.message || "Could not fetch your drive files.");
      }
    },
  },

  Mutation: {
    // Upload a file to course drive
    uploadDriveFile: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        await checkRole('teacher')(user);

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new GraphQLError('Teacher profile not found');
        }

        // Verify course exists and teacher owns it
        const course = await getCourseById(input.course_id);
        if (!course) {
          throw new GraphQLError('Course not found');
        }

        if (course.teacher_id._id.toString() !== teacher._id.toString()) {
          throw new GraphQLError('Not authorized to upload files to this course');
        }

        // Handle file upload
        const file = await input.file;
        const uploadResult = await uploadToLocal({
          stream: file.file.createReadStream(),
          name: file.file.filename,
          mimetype: file.file.mimetype
        });

        // Create drive file record
        const fileData = {
          course_id: input.course_id,
          teacher_id: teacher._id,
          file_name: file.file.filename,
          file_url: uploadResult.url,
          file_size: file.file.size || 0,
          file_type: file.file.mimetype,
          description: input.description || null
        };

        return await uploadDriveFile(fileData);
      } catch (error) {
        console.error('Error uploading drive file:', error);
        throw new GraphQLError(error.message || "Could not upload file to drive.");
      }
    },

    // Delete a drive file
    deleteDriveFile: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        await checkRole('teacher')(user);

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new GraphQLError('Teacher profile not found');
        }

        return await deleteDriveFile(id, teacher._id);
      } catch (error) {
        console.error(`Error deleting drive file with ID: ${id}`, error);
        throw new GraphQLError(error.message || "Could not delete drive file.");
      }
    },

    // Update drive file description
    updateDriveFileDescription: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        await checkRole('teacher')(user);

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new GraphQLError('Teacher profile not found');
        }

        return await updateDriveFileDescription(id, input.description, teacher._id);
      } catch (error) {
        console.error(`Error updating drive file description with ID: ${id}`, error);
        throw new GraphQLError(error.message || "Could not update drive file description.");
      }
    },

    // Rename a drive file
    renameDriveFile: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        await checkRole('teacher')(user);

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
          throw new GraphQLError('Teacher profile not found');
        }

        return await renameDriveFile(id, input.file_name, teacher._id);
      } catch (error) {
        console.error(`Error renaming drive file with ID: ${id}`, error);
        throw new GraphQLError(error.message || "Could not rename drive file.");
      }
    },
  },

  DriveFile: {
    // Resolve course field
    course: async (parent) => {
      try {
        return await getCourseById(parent.course_id);
      } catch (error) {
        console.error('Error resolving course for drive file:', error);
        return null;
      }
    },

    // Resolve teacher field
    teacher: async (parent) => {
      try {
        return parent.teacher_id;
      } catch (error) {
        console.error('Error resolving teacher for drive file:', error);
        return null;
      }
    },
  },
};