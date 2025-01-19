import { getAllUsers, getUserById, getUserByUID } from "./user.service.js";

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

    // Resolver for fetching a single user by ID
    user: async (_, { id }) => {
      try {
        return await getUserById(id);
      } catch (error) {
        console.error(`Error fetching user with ID: ${id}`, error);
        throw new Error(`Could not fetch user with ID: ${id}.`);
      }
    },
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
    }
  }
};
