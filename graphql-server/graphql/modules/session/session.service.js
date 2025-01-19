import Session from './session.model.js';
import Attendance from '../attendance/attendance.model.js';
import { getUserByUID } from '../user/user.service.js';
import { getTeacherByUserId } from '../teacher/teacher.service.js';

export const getAllSessions = async () => {
    return await Session.find()
        .populate('course_id')
        .populate('teacher_id');
};

export const getSessionById = async (id) => {
    return await Session.findById(id)
        .populate('course_id')
        .populate('teacher_id');
};

export const getSessionsByCourse = async (course_id) => {
    return await Session.find({ course_id })
        .populate('course_id');
};

export const getAttendancesBySessionId = async (session_id) => {
    return await Attendance.find({ session_id })
        .populate('session_id')
        .populate('student_id');
};

export const createSession = async (sessionInput, user) => {
    try {
        const userDetails = await getUserByUID(user.uid);
        const teacherDetails = await getTeacherByUserId(userDetails._id);
        
        if (!teacherDetails) {
            throw new Error("Teacher not found");
        }

        return await Session.create({
            ...sessionInput,
            teacher_id: teacherDetails._id,
            status: 'scheduled'
        });
    } catch (error) {
        throw new Error(`Failed to create session: ${error.message}`);
    }
};

export const updateSession = async (id, sessionInput) => {
    return await Session.findByIdAndUpdate(
        id,
        sessionInput,
        { new: true }
    ).populate('course_id')
     .populate('teacher_id');
};

export const updateSessionStatus = async (id, status) => {
    return await Session.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    ).populate('course_id')
     .populate('teacher_id');
};

export const deleteSession = async (id) => {
    return await Session.findByIdAndDelete(id)
        .populate('course_id')
        .populate('teacher_id');
};

export const getAttendanceBySessionAndStudent = async (session_id, student_id) => {
    try {
        return await Attendance.findOne({
            session_id,
            student_id
        })
        .populate('session_id')
        .populate('student_id');
    } catch (error) {
        throw new Error(`Failed to fetch attendance: ${error.message}`);
    }
};

