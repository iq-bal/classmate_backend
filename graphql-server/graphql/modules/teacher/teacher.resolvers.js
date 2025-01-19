import { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from './teacher.service.js';
import { checkRole } from '../../utils/check_roles.js';

export const resolvers = {
    Query: {
        teachers: async (_, __, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getAllTeachers();
            } catch (error) {
                throw new Error("Failed to fetch teachers");
            }
        },
        teacher: async (_, { id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getTeacherById(id);
            } catch (error) {
                throw new Error("Teacher not found");
            }
        }
    },
    Mutation: {
        createTeacher: async (_, { teacherInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await createTeacher(teacherInput);
            } catch (error) {
                throw new Error("Failed to create teacher");
            }
        },
        updateTeacher: async (_, { id, teacherInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await updateTeacher(id, teacherInput);
            } catch (error) {
                throw new Error("Failed to update teacher");
            }
        },
        deleteTeacher: async (_, { id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await deleteTeacher(id);
            } catch (error) {
                throw new Error("Failed to delete teacher");
            }
        }
    }
}; 