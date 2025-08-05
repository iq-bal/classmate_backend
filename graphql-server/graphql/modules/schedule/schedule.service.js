import Schedule from './schedule.model.js';
import { getUserByUID } from '../user/user.service.js';
import { getTeacherByUserId } from '../teacher/teacher.service.js';

export const getAllSchedules = async () => {
    return await Schedule.find()
        .populate('course_id')
        .populate('teacher_id');
};

export const getScheduleById = async (id) => {
    return await Schedule.findById(id)
        .populate('course_id')
        .populate('teacher_id');
};

export const getSchedulesByCourse = async (course_id) => {
    return await Schedule.find({ course_id });
};

export const getScheduleByCourseAndDay = async (course_id, day) => {
    return await Schedule.findOne({ course_id, day });
};

export const getScheduleByCourseAndDayAndTeacher = async (course_id, day, teacher_id) => {
    return await Schedule.findOne({ course_id, day, teacher_id });
};

export const getScheduleByCourseAndDayAndSection = async (course_id, day, section) => {
    return await Schedule.findOne({ course_id, day, section });
};

export const getSchedulesByTeacher = async (teacher_id) => {
    return await Schedule.find({ teacher_id })
        .populate('course_id')
        .populate('teacher_id');
};

export const createSchedule = async (scheduleInput, user) => {
    try {
        const userDetails = await getUserByUID(user.uid);
        const teacherDetails = await getTeacherByUserId(userDetails._id);
        
        if (!teacherDetails) {
            throw new Error("Teacher not found");
        }

        // console.log(scheduleInput);

        return await Schedule.create({
            ...scheduleInput,
            teacher_id: teacherDetails._id
        });
    } catch (error) {
        throw new Error(`Failed to create schedule: ${error.message}`);
    }
};

export const updateSchedule = async (id, scheduleInput) => {
    return await Schedule.findByIdAndUpdate(
        id,
        scheduleInput,
        { new: true }
    ).populate('course_id')
     .populate('teacher_id');
};

export const deleteSchedule = async (id) => {
    return await Schedule.findByIdAndDelete(id);
};