import { getAllUsers, getUserById, getUserByUID, searchUsers } from "./user.service.js";
import Teacher from "../teacher/teacher.model.js";
import Course from "../course/course.model.js";
import User from "./user.model.js";
import { GraphQLError } from 'graphql';
import { uploadToLocal } from '../../../services/local.storage.js';

export const resolvers = {
  Query: {
    // Resolver for fetching all users
    users: async () => {
      try {
        return await getAllUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Could not fetch users.");
      }
    },

    // Resolver for fetching a single user by ID or current authenticated user
    user: async (_, { id }, { user: authUser }) => {
      try {

        // If no ID is provided, return the authenticated user
        if (!id && authUser) {
          return await getUserByUID(authUser.uid);
        }

        // If ID is provided, return the requested user
        return await getUserById(id);
      } catch (error) {
        console.error(`Error fetching user:`, error);
        throw new Error(`Could not fetch user.`);
      }
    },

    // Resolver for searching users by name or email
    searchUsers: async (_, { query }) => {
      try {
        if (!query || query.trim().length < 2) {
          throw new GraphQLError('Search query must be at least 2 characters long', {
            extensions: { code: 'INVALID_INPUT' }
          });
        }
        return await searchUsers(query.trim());
      } catch (error) {
        console.error('Error searching users:', error);
        throw new GraphQLError('Could not search users', {
          extensions: { code: 'SEARCH_ERROR' }
        });
      }
    },
  },
  User: {
    // Resolver for teacher field
    teacher: async (parent) => {
      try {
        return await Teacher.findOne({ user_id: parent._id });
      } catch (error) {
        console.error("Error fetching teacher:", error);
        return null;
      }
    },
    // Resolver for course field
    courses: async (parent) => {
      try {
        
        const teacher = await Teacher.findOne({ user_id: parent._id });
        if (!teacher) {
          return [];
        } 
        return await Course.find({ teacher_id: teacher._id }); 
      } catch (error) {
        console.error("Error fetching course:", error);
        return null;
      }
    }
  },
  Mutation: {
    updateFCMToken: async (_, { fcm_token }, { user }) => {
      try {
        const userDetails = await getUserByUID(user.uid);
        userDetails.fcm_token = fcm_token;
        await userDetails.save();
        return userDetails;
      } catch (error) {
        console.error("Error updating FCM token:", error);
        throw new Error("Could not update FCM token.");
      }
    },
      updateProfilePicture: async (_, { image }, { user }) => {
        try {
          if (!user) {
            throw new GraphQLError('Authentication required');
          }
          const userDetails = await getUserByUID(user.uid);
          if (!userDetails) {
            throw new GraphQLError('User not found');
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
          const updatedUser = await User.findByIdAndUpdate(
            userDetails._id,
            { 
              profile_picture: imageUrl,
              updatedAt: new Date()
            },
            { new: true }
          );
          return updatedUser;
        } catch (error) {
          throw new GraphQLError(error.message);
        }
      },
      updateCoverPicture: async (_, { image }, { user }) => {
        try {
          if (!user) {
            throw new GraphQLError('Authentication required');
          }
          const userDetails = await getUserByUID(user.uid);
          if (!userDetails) {
            throw new GraphQLError('User not found');
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
          const updatedUser = await User.findByIdAndUpdate(
            userDetails._id,
            { 
              cover_picture: imageUrl,
              updatedAt: new Date()
            },
            { new: true }
          );
          return updatedUser;
        } catch (error) {
          throw new GraphQLError(error.message);
        }
      }
    
  }
};
