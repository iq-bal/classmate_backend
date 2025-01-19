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

export const updateTeacher = async (id, teacherData) => {
    return await Teacher.findByIdAndUpdate(id, teacherData, { new: true });
};

export const deleteTeacher = async (id) => {
    return await Teacher.findByIdAndDelete(id);
}; 

