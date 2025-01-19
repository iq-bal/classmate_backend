import User from "./user.model.js";

// Function to get all users
export const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Could not fetch users.");
  }
};

// Function to get a user by ID
export const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error(`User with ID: ${id} not found.`);
    }
    return user;
  } catch (error) {
    console.error(`Error fetching user with ID: ${id}`, error);
    throw new Error(`Could not fetch user with ID: ${id}.`);
  }
};


export const getUserByUID = async (uid) => {
    try {
      const user = await User.findOne({ uid }); // Query the database using UID
      if(!user){
        throw new Error(`User with UID: ${user.uid} not found`);
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user with UID: ${uid}`, error);
      throw new Error(`Could not fetch user with UID: ${uid}`);
    }
};