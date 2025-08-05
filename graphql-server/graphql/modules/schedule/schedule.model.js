import mongoose from "mongoose";
import Course from "../course/course.model.js";
import Teacher from "../teacher/teacher.model.js";

const scheduleSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    day: {
        type: String,
        required: false,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    section: {
        type: String,
        required: false
    },
    start_time: {
        type: String,
        required: false
    },
    end_time: {
        type: String,
        required: false
    },
    room_number: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});


scheduleSchema.index({ course_id: 1, day: 1, teacher_id: 1 }, { unique: true });


// Pre-save hook to validate course and teacher
scheduleSchema.pre('save', async function(next) {
    try {
        const course = await Course.findById(this.course_id);
        if (!course) {
            throw new Error('Invalid course_id - Course does not exist');
        }
        const teacher = await Teacher.findById(this.teacher_id);
        if (!teacher) {
            throw new Error('Invalid teacher_id - Teacher does not exist');
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
