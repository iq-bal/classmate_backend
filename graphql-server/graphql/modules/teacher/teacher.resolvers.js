import { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from './teacher.service.js';
import { checkRole } from '../../utils/check_roles.js';
import { getUserByUID } from '../user/user.service.js';
import Teacher from './teacher.model.js';
import User from '../user/user.model.js';

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
        updateTeacher: async (_, { teacherInput }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await updateTeacher(user, teacherInput);
            } catch (error) {
                throw new Error(error.message);
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
    },
    Teacher: {
        name: async (parent) => {
            try {
                return parent.user_id?.name || null;
            } catch (error) {
                console.error('Error resolving teacher name:', error);
                return null;
            }
        },
        profile_picture: async (parent) => {
            try {
                return parent.user_id?.profile_picture || null;
            } catch (error) {
                console.error('Error resolving teacher profile picture:', error);
                return null;
            }
        }
    }
};