import { 
    getAllAttendances,
    getAttendanceById,
    getAttendanceBySession,
    getAttendanceByStudent,
    markAttendance,
    updateAttendance,
    deleteAttendance
} from "./attendance.service.js";
import { checkRole } from "../../utils/check_roles.js";

export const resolvers = {
    Query: {
        attendances: async (_, __, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getAllAttendances();
            } catch (error) {
                throw new Error("Failed to fetch attendances");
            }
        },
        attendance: async (_, { id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getAttendanceById(id);
            } catch (error) {
                throw new Error("Attendance not found");
            }
        },
        attendanceBySession: async (_, { session_id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getAttendanceBySession(session_id);
            } catch (error) {
                throw new Error("Failed to fetch attendances for this session");
            }
        },
        attendanceByStudent: async (_, { student_id }, { user }) => {
            try {
                await checkRole("teacher")(user);
                return await getAttendanceByStudent(student_id);
            } catch (error) {
                throw new Error("Failed to fetch attendances for this student");
            }
        }
    },
    Mutation: {
        markAttendance: async (_, { attendanceInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await markAttendance(attendanceInput);
            } catch (error) {
                throw new Error(`Failed to mark attendance: ${error.message}`);
            }
        },
        updateAttendance: async (_, { id, status }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await updateAttendance(id, status);
            } catch (error) {
                throw new Error("Failed to update attendance");
            }
        },
        deleteAttendance: async (_, { id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await deleteAttendance(id);
            } catch (error) {
                throw new Error("Failed to delete attendance");
            }
        }
    }
};
