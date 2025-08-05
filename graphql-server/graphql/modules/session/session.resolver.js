import { 
    getAllSessions, 
    getSessionById, 
    getSessionsByCourse,
    createSession, 
    updateSession, 
    deleteSession,
    updateSessionStatus,
    getAttendanceBySessionAndStudent
} from "./session.service.js";
import { checkRole } from "../../utils/check_roles.js";
import { getUserByUID } from "../user/user.service.js";
import { getStudentByUserId } from "../student/student.service.js";

export const resolvers = {
    Query: {
        sessions: async (_, __, { user }) => {
            try {
                return await getAllSessions();
            } catch (error) {
                throw new Error("Failed to fetch sessions");
            }
        },
        session: async (_, { id }, { user }) => {
            try {
                return await getSessionById(id);
            } catch (error) {
                throw new Error("Session not found");
            }
        },
        sessionsByCourse: async (_, { course_id }, { user }) => {
            try {
                return await getSessionsByCourse(course_id);
            } catch (error) {
                throw new Error("Failed to fetch sessions for this course");
            }
        }
    },
    Session: {
        title: (parent) => parent.topic, // Map database topic field to GraphQL title field
        date: (parent) => parent.date, // Ensure date field is returned
        attendance: async (parent, _, { user }) => {
            try {
                if (!user) {
                    throw new Error("User not authenticated");
                }
                await checkRole("student")(user);
                const userDetails = await getUserByUID(user.uid);
                const student = await getStudentByUserId(userDetails._id);
                return await getAttendanceBySessionAndStudent(parent._id, student._id);
            } catch (error) {
                throw new Error(`Failed to fetch attendance: ${error.message}`);
            }
        }
    },
    Mutation: {
        createSession: async (_, { sessionInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                // Map GraphQL fields to database model fields
                const mappedInput = {
                    ...sessionInput,
                    topic: sessionInput.title // Map title to topic for database
                };
                delete mappedInput.title; // Remove title field
                return await createSession(mappedInput, user);
            } catch (error) {
                throw new Error(`Failed to create session: ${error.message}`);
            }
        },
        updateSession: async (_, { id, sessionInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await updateSession(id, sessionInput);
            } catch (error) {
                throw new Error("Failed to update session");
            }
        },
        updateSessionStatus: async (_, { id, status }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await updateSessionStatus(id, status);
            } catch (error) {
                throw new Error("Failed to update session status");
            }
        },
        deleteSession: async (_, { id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await deleteSession(id);
            } catch (error) {
                throw new Error("Failed to delete session");
            }
        }
    }
};
