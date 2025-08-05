import Attendance from './attendance.model.js';
import { getUserByUID } from '../user/user.service.js';
import { getStudentByUserId } from '../student/student.service.js';
import { getEnrollmentsByCourse } from '../enrollment/enrollment.service.js';
import Session from '../session/session.model.js';
import Course from '../course/course.model.js';

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

// Real-time attendance functions
export const startAttendanceSession = async (session_id, teacher_id) => {
    try {
        // Verify session exists and teacher owns the course
        const session = await Session.findById(session_id).populate('course_id');
        if (!session) {
            throw new Error('Session not found');
        }

        const course = await Course.findById(session.course_id._id);
        if (course.teacher_id.toString() !== teacher_id.toString()) {
            throw new Error('Only the course teacher can start attendance');
        }

        // Get all enrolled students for this course
        const enrollments = await getEnrollmentsByCourse(session.course_id._id);
        const approvedEnrollments = enrollments.filter(enrollment => enrollment.status === 'approved');
        
        // Create attendance records for all enrolled students with 'absent' status
        const attendanceRecords = [];
        for (const enrollment of approvedEnrollments) {
            try {
                // Check if attendance already exists
                const existingAttendance = await Attendance.findOne({
                    session_id: session_id,
                    student_id: enrollment.student_id
                });

                if (!existingAttendance) {
                    const attendanceRecord = await Attendance.create({
                        session_id: session_id,
                        student_id: enrollment.student_id,
                        status: 'absent',
                        remarks: 'Attendance session started'
                    });
                    attendanceRecords.push(attendanceRecord);
                }
            } catch (error) {
                console.error(`Error creating attendance for student ${enrollment.student_id}:`, error);
            }
        }

        return {
            session,
            attendanceRecords,
            totalStudents: approvedEnrollments.length
        };
    } catch (error) {
        throw new Error(`Failed to start attendance session: ${error.message}`);
    }
};

export const markStudentPresent = async (session_id, student_id, teacher_id) => {
    try {
        // Verify session and teacher authorization
        const session = await Session.findById(session_id).populate('course_id');
        if (!session) {
            throw new Error('Session not found');
        }

        const course = await Course.findById(session.course_id._id);
        if (course.teacher_id.toString() !== teacher_id.toString()) {
            throw new Error('Only the course teacher can mark attendance');
        }

        // Update or create attendance record
        const attendanceRecord = await Attendance.findOneAndUpdate(
            { session_id, student_id },
            { 
                status: 'present',
                remarks: 'Marked present by teacher',
                timestamp: new Date()
            },
            { 
                new: true, 
                upsert: true,
                populate: [
                    { path: 'session_id' },
                    { 
                        path: 'student_id',
                        populate: {
                            path: 'user_id',
                            select: 'name email profile_picture'
                        }
                    }
                ]
            }
        );

        return attendanceRecord;
    } catch (error) {
        throw new Error(`Failed to mark student present: ${error.message}`);
    }
};

export const markStudentAbsent = async (session_id, student_id, teacher_id) => {
    try {
        // Verify session and teacher authorization
        const session = await Session.findById(session_id).populate('course_id');
        if (!session) {
            throw new Error('Session not found');
        }

        const course = await Course.findById(session.course_id._id);
        if (course.teacher_id.toString() !== teacher_id.toString()) {
            throw new Error('Only the course teacher can mark attendance');
        }

        // Update attendance record
        const attendanceRecord = await Attendance.findOneAndUpdate(
            { session_id, student_id },
            { 
                status: 'absent',
                remarks: 'Marked absent by teacher',
                timestamp: new Date()
            },
            { 
                new: true,
                populate: [
                    { path: 'session_id' },
                    { 
                        path: 'student_id',
                        populate: {
                            path: 'user_id',
                            select: 'name email profile_picture'
                        }
                    }
                ]
            }
        );

        return attendanceRecord;
    } catch (error) {
        throw new Error(`Failed to mark student absent: ${error.message}`);
    }
};

export const getAttendanceSessionData = async (session_id, teacher_id) => {
    try {
        // Verify session and teacher authorization
        const session = await Session.findById(session_id).populate('course_id');
        if (!session) {
            throw new Error('Session not found');
        }

        const course = await Course.findById(session.course_id._id);
        if (course.teacher_id.toString() !== teacher_id.toString()) {
            throw new Error('Only the course teacher can view attendance data');
        }

        // Get all attendance records for this session
        const attendanceRecords = await Attendance.find({ session_id })
            .populate({
                path: 'student_id',
                populate: {
                    path: 'user_id',
                    select: 'name email profile_picture roll section'
                }
            })
            .sort({ 'student_id.user_id.name': 1 });

        // Get enrollment count for comparison
        const enrollments = await getEnrollmentsByCourse(session.course_id._id);
        const approvedEnrollments = enrollments.filter(enrollment => enrollment.status === 'approved');

        // Calculate statistics
        const totalStudents = approvedEnrollments.length;
        const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
        const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;
        const lateCount = attendanceRecords.filter(record => record.status === 'late').length;
        const excusedCount = attendanceRecords.filter(record => record.status === 'excused').length;

        return {
            session,
            attendanceRecords,
            statistics: {
                totalStudents,
                presentCount,
                absentCount,
                lateCount,
                excusedCount,
                attendanceRate: totalStudents > 0 ? ((presentCount + lateCount) / totalStudents * 100).toFixed(2) : 0
            }
        };
    } catch (error) {
        throw new Error(`Failed to get attendance session data: ${error.message}`);
    }
};

export const bulkUpdateAttendance = async (session_id, attendanceUpdates, teacher_id) => {
    try {
        // Verify session and teacher authorization
        const session = await Session.findById(session_id).populate('course_id');
        if (!session) {
            throw new Error('Session not found');
        }

        const course = await Course.findById(session.course_id._id);
        if (course.teacher_id.toString() !== teacher_id.toString()) {
            throw new Error('Only the course teacher can update attendance');
        }

        const updatedRecords = [];
        
        for (const update of attendanceUpdates) {
            try {
                const attendanceRecord = await Attendance.findOneAndUpdate(
                    { session_id, student_id: update.student_id },
                    { 
                        status: update.status,
                        remarks: update.remarks || `Bulk updated to ${update.status}`,
                        timestamp: new Date()
                    },
                    { 
                        new: true,
                        upsert: true,
                        populate: [
                            { path: 'session_id' },
                            { 
                                path: 'student_id',
                                populate: {
                                    path: 'user_id',
                                    select: 'name email profile_picture'
                                }
                            }
                        ]
                    }
                );
                updatedRecords.push(attendanceRecord);
            } catch (error) {
                console.error(`Error updating attendance for student ${update.student_id}:`, error);
            }
        }

        return updatedRecords;
    } catch (error) {
        throw new Error(`Failed to bulk update attendance: ${error.message}`);
    }
};

// Get active attendance session for a course
export const getActiveSession = async (course_id, user_id) => {
    try {
        // Verify user has access to this course (either teacher or enrolled student)
        const course = await Course.findById(course_id);
        if (!course) {
            throw new Error('Course not found');
        }

        // Check if user is the teacher
        const isTeacher = course.teacher_id.toString() === user_id.toString();
        
        // If not teacher, check if user is an enrolled student
        if (!isTeacher) {
            const enrollments = await getEnrollmentsByCourse(course_id);
            const userStudent = await getStudentByUserId(user_id);
            if (!userStudent) {
                throw new Error('User is not a student');
            }
            
            const isEnrolled = enrollments.some(enrollment => 
                enrollment.student_id.toString() === userStudent._id.toString() && 
                enrollment.status === 'approved'
            );
            
            if (!isEnrolled) {
                throw new Error('User is not enrolled in this course');
            }
        }

        // Find sessions for this course
        const sessions = await Session.find({ course_id }).sort({ created_at: -1 });
        
        // Check if any session has active attendance (from activeAttendanceSessions Map)
        // Note: This requires access to the activeAttendanceSessions Map from chat-server.js
        // For now, we'll check for recent attendance activity as a proxy
        
        for (const session of sessions) {
            // Check if there are recent attendance records (within last 4 hours)
            const recentAttendance = await Attendance.findOne({
                session_id: session._id,
                updated_at: { $gte: new Date(Date.now() - 4 * 60 * 60 * 1000) } // 4 hours ago
            }).populate([
                { path: 'session_id' },
                { 
                    path: 'student_id',
                    populate: {
                        path: 'user_id',
                        select: 'name email profile_picture'
                    }
                }
            ]);
            
            if (recentAttendance) {
                // Get all attendance for this session
                const sessionAttendance = await Attendance.find({ session_id: session._id })
                    .populate([
                        { path: 'session_id' },
                        { 
                            path: 'student_id',
                            populate: {
                                path: 'user_id',
                                select: 'name email profile_picture'
                            }
                        }
                    ]);
                
                return {
                    session: session,
                    attendance: sessionAttendance,
                    isActive: true,
                    lastActivity: recentAttendance.updated_at
                };
            }
        }
        
        return {
            session: null,
            attendance: [],
            isActive: false,
            lastActivity: null
        };
    } catch (error) {
        throw new Error(`Failed to get active session: ${error.message}`);
    }
};

// Get all active sessions across all courses (for admin/teacher dashboard)
export const getAllActiveSessions = async () => {
    try {
        // Find all attendance records updated in the last 4 hours
        const recentAttendance = await Attendance.find({
            updated_at: { $gte: new Date(Date.now() - 4 * 60 * 60 * 1000) }
        }).populate([
            { 
                path: 'session_id',
                populate: {
                    path: 'course_id',
                    select: 'title course_code'
                }
            }
        ]);
        
        // Group by session
        const activeSessionsMap = new Map();
        
        recentAttendance.forEach(attendance => {
            const sessionId = attendance.session_id._id.toString();
            if (!activeSessionsMap.has(sessionId)) {
                activeSessionsMap.set(sessionId, {
                    session: attendance.session_id,
                    lastActivity: attendance.updated_at,
                    attendanceCount: 0
                });
            }
            
            const sessionData = activeSessionsMap.get(sessionId);
            sessionData.attendanceCount++;
            
            // Update last activity if this record is more recent
            if (attendance.updated_at > sessionData.lastActivity) {
                sessionData.lastActivity = attendance.updated_at;
            }
        });
        
        return Array.from(activeSessionsMap.values());
    } catch (error) {
        throw new Error(`Failed to get all active sessions: ${error.message}`);
    }
};
