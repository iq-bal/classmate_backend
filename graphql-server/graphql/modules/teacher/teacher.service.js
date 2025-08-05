import Teacher from './teacher.model.js';
import { getUserByUID } from '../user/user.service.js';

export const getAllTeachers = async () => {
    return await Teacher.find().populate('user_id');
};

export const getTeacherById = async (id) => {
    return await Teacher.findById(id).populate('user_id');
};

export const getTeacherByUserId = async (user_id) => {
    return await Teacher.findOne({ user_id }).populate('user_id');
};

export const createTeacher = async (teacherData) => {
    return await Teacher.create(teacherData);
};

export const updateTeacher = async (user, teacherData) => {
    try {
        const userDetails = await getUserByUID(user.uid);
        const teacher = await Teacher.findOne({ user_id: userDetails._id });
        if (!teacher) {
            throw new Error('Teacher not found');
        }

        // Only update fields that are provided
        Object.keys(teacherData).forEach(key => {
            if (teacherData[key] !== undefined) {
                teacher[key] = teacherData[key];
            }
        });

        await teacher.save();
        return await teacher.populate('user_id');
    } catch (error) {
        throw new Error(`Failed to update teacher: ${error.message}`);
    } 
};

export const deleteTeacher = async (id) => {
    return await Teacher.findByIdAndDelete(id);
};  

