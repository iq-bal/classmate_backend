import { 
    getAllTasks, 
    getTaskById, 
    getTasksByUser,
    getTasksByParticipant,
    getTasksByCategory,
    createTask, 
    updateTask, 
    updateTaskStatus,
    addParticipant,
    removeParticipant,
    deleteTask,
    respondToTaskInvitation
} from "./task.service.js";
import { getUserByUID } from "../user/user.service.js";

export const resolvers = {
    Query: {
        tasks: async () => {
            try {
                return await getAllTasks();
            } catch (error) {
                throw new Error("Failed to fetch tasks");
            }
        },
        task: async (_, { id }) => {
            try {
                return await getTaskById(id);
            } catch (error) {
                throw new Error("Task not found");
            }
        },
        tasksByUser: async (_, {}, {user}) => {
            try {
                return await getTasksByUser(user);
            } catch (error) {
                throw new Error("Failed to fetch tasks for this user");
            }
        },
        tasksByParticipant: async (_, { participant_id }) => {
            try {
                return await getTasksByParticipant(participant_id);
            } catch (error) {
                throw new Error("Failed to fetch tasks for this participant");
            }
        },
        tasksByCategory: async (_, { category }) => {
            try {
                return await getTasksByCategory(category);
            } catch (error) {
                throw new Error("Failed to fetch tasks for this category");
            }
        }
    },
    Mutation: {
        createTask: async (_, { taskInput }, { user }) => {
            try {
                return await createTask(taskInput, user);
            } catch (error) {
                throw new Error(`Failed to create task: ${error.message}`);
            }
        },
        respondToTaskInvitation: async (_, { taskId, response }, { user }) => {
            try {
                const userDetails = await getUserByUID(user.uid);
                return await respondToTaskInvitation(taskId, userDetails._id, response);
            } catch (error) {
                throw new Error(`Failed to respond to task invitation: ${error.message}`);
            }
        },
        updateTask: async (_, { id, taskInput }, { user }) => {
            try {
                return await updateTask(id, taskInput);
            } catch (error) {
                throw new Error("Failed to update task");
            }
        },
        updateTaskStatus: async (_, { id, status }) => {
            try {
                return await updateTaskStatus(id, status);
            } catch (error) {
                throw new Error("Failed to update task status");
            }
        },
        addParticipant: async (_, { id, participant_id }) => {
            try {
                return await addParticipant(id, participant_id);
            } catch (error) {
                throw new Error("Failed to add participant");
            }
        },
        removeParticipant: async (_, { id, participant_id }) => {
            try {
                return await removeParticipant(id, participant_id);
            } catch (error) {
                throw new Error("Failed to remove participant");
            }
        },
        deleteTask: async (_, { id }) => {
            try {
                return await deleteTask(id);
            } catch (error) {
                throw new Error("Failed to delete task");
            }
        }
    }
}; 