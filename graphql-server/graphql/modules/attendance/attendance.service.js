import Attendance from './attendance.model.js';
import { getUserByUID } from '../user/user.service.js';
import { getStudentByUserId } from '../student/student.service.js';

export const getAllAttendances = async () => {
    return await Attendance.find()
        .populate('session_id')
        .populate('student_id');
};

export const getAttendanceById = async (id) => {
    return await Attendance.findById(id)
        .populate('session_id')
        .populate('student_id');
};

export const getAttendanceBySession = async (session_id) => {
    return await Attendance.find({ session_id })
        .populate('session_id')
        .populate('student_id');
};

export const getAttendanceByStudent = async (student_id) => {
    return await Attendance.find({ student_id })
        .populate('session_id')
        .populate('student_id');
};

export const markAttendance = async (attendanceInput) => {
    try {
        const existingAttendance = await Attendance.findOne({
            session_id: attendanceInput.session_id,
            student_id: attendanceInput.student_id
        });

        if (existingAttendance) {
            throw new Error('Attendance already marked for this student in this session');
        }

        return await Attendance.create({
            ...attendanceInput,
            timestamp: new Date()
        });
    } catch (error) {
        throw new Error(`Failed to mark attendance: ${error.message}`);
    }
};

export const updateAttendance = async (id, status) => {
    return await Attendance.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    ).populate('session_id')
     .populate('student_id');
};

export const deleteAttendance = async (id) => {
    return await Attendance.findByIdAndDelete(id);
};
