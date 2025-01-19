import { 
    getAllSchedules, 
    getScheduleById, 
    getSchedulesByCourse,
    getSchedulesByTeacher,
    createSchedule, 
    updateSchedule, 
    deleteSchedule 
} from "./schedule.service.js";
import { checkRole } from "../../utils/check_roles.js";

export const resolvers = {
    Query: {
        schedules: async () => {
            try {
                return await getAllSchedules();
            } catch (error) {
                throw new Error("Failed to fetch schedules");
            }
        },
        schedule: async (_, { id }) => {
            try {
                return await getScheduleById(id);
            } catch (error) {
                throw new Error("Schedule not found");
            }
        },
        schedulesByCourse: async (_, { course_id }) => {
            try {
                return await getSchedulesByCourse(course_id);
            } catch (error) {
                throw new Error("Failed to fetch schedules for this course");
            }
        },
        schedulesByTeacher: async (_, { teacher_id }) => {
            try {
                return await getSchedulesByTeacher(teacher_id);
            } catch (error) {
                throw new Error("Failed to fetch schedules for this teacher");
            }
        }
    },
    Mutation: {
        createSchedule: async (_, { scheduleInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await createSchedule(scheduleInput, user);
            } catch (error) {
                throw new Error(`Failed to create schedule: ${error.message}`);
            }
        },
        updateSchedule: async (_, { id, scheduleInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await updateSchedule(id, scheduleInput);
            } catch (error) {
                throw new Error("Failed to update schedule");
            }
        },
        deleteSchedule: async (_, { id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await deleteSchedule(id);
            } catch (error) {
                throw new Error("Failed to delete schedule");
            }
        }
    }
}; 