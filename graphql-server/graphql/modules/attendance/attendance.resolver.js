import { 
    getAllAttendances,
    getAttendanceById,
    getAttendanceBySession,
    getAttendanceByStudent,
    markAttendance,
    updateAttendance,
    deleteAttendance,
    startAttendanceSession,
    markStudentPresent,
    markStudentAbsent,
    getAttendanceSessionData,
    bulkUpdateAttendance,
    getActiveSession,
    getAllActiveSessions
} from "./attendance.service.js";
import { getUserByUID } from '../user/user.service.js';
import { getTeacherByUserId } from '../teacher/teacher.service.js';
import { checkRole } from "../../utils/check_roles.js";

export const resolvers = {
    Query: {
        attendances: async (_, __, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getAllAttendances();
            } catch (error) {
                throw new Error("Failed to fetch attendances");
            }
        },
        attendance: async (_, { id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getAttendanceById(id);
            } catch (error) {
                throw new Error("Attendance not found");
            }
        },
        attendanceBySession: async (_, { session_id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                return await getAttendanceBySession(session_id);
            } catch (error) {
                throw new Error("Failed to fetch attendances for this session");
            }
        },
        attendanceByStudent: async (_, { student_id }, { user }) => {
            try {
                await checkRole("teacher")(user);
                return await getAttendanceByStudent(student_id);
            } catch (error) {
                throw new Error("Failed to fetch attendances for this student");
            }
        },
        activeSession: async (_, { course_id }, { user }) => {
            try {
                // This query can be accessed by both teachers and students
                // The service function will handle permission checks
                const userObj = await getUserByUID(user.uid);
                if (!userObj) {
                    throw new Error("User not found");
                }
                
                return await getActiveSession(course_id, userObj._id);
            } catch (error) {
                throw new Error(`Failed to get active session: ${error.message}`);
            }
        },
        allActiveSessions: async (_, __, { user }) => {
            try {
                // Only teachers and admins can see all active sessions
                await checkRole("teacher")(user);
                return await getAllActiveSessions();
            } catch (error) {
                throw new Error(`Failed to get all active sessions: ${error.message}`);
            }
        },
        attendanceSessionData: async (_, { session_id }, { user }) => {
            await checkRole("teacher")(user);
            try {
                const userDetails = await getUserByUID(user.uid);
                const teacher = await getTeacherByUserId(userDetails._id);
                if (!teacher) {
                    throw new Error("Teacher profile not found");
                }
                return await getAttendanceSessionData(session_id, teacher._id);
            } catch (error) {
                throw new Error(`Failed to get attendance session data: ${error.message}`);
            }
        }
    },
    Mutation: {
        markAttendance: async (_, { attendanceInput }, { user }) => {
            console.log('🎯 [DEBUG] markAttendance mutation called');
            console.log('📝 [DEBUG] Input:', JSON.stringify(attendanceInput, null, 2));
            console.log('👤 [DEBUG] User:', user?.name || 'Unknown', '(ID:', user?._id || 'Unknown', ')');
            
            await checkRole("teacher")(user);
            try {
                const result = await markAttendance(attendanceInput);
                console.log('✅ [DEBUG] markAttendance successful:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('❌ [DEBUG] markAttendance failed:', error.message);
                throw new Error(`Failed to mark attendance: ${error.message}`);
            }
        },
        updateAttendance: async (_, { id, status }, { user }) => {
            console.log('🎯 [DEBUG] updateAttendance mutation called');
            console.log('📝 [DEBUG] Attendance ID:', id, 'New Status:', status);
            console.log('👤 [DEBUG] User:', user?.name || 'Unknown', '(ID:', user?._id || 'Unknown', ')');
            
            await checkRole("teacher")(user);
            try {
                const result = await updateAttendance(id, status);
                console.log('✅ [DEBUG] updateAttendance successful:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('❌ [DEBUG] updateAttendance failed:', error.message);
                throw new Error("Failed to update attendance");
            }
        },
        deleteAttendance: async (_, { id }, { user }) => {
            console.log('🎯 [DEBUG] deleteAttendance mutation called');
            console.log('📝 [DEBUG] Attendance ID:', id);
            console.log('👤 [DEBUG] User:', user?.name || 'Unknown', '(ID:', user?._id || 'Unknown', ')');
            
            await checkRole("teacher")(user);
            try {
                const result = await deleteAttendance(id);
                console.log('✅ [DEBUG] deleteAttendance successful:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('❌ [DEBUG] deleteAttendance failed:', error.message);
                throw new Error("Failed to delete attendance");
            }
        },
        startAttendanceSession: async (_, { session_id }, { user }) => {
            console.log('🎯 [DEBUG] startAttendanceSession mutation called');
            console.log('📝 [DEBUG] Session ID:', session_id);
            console.log('👤 [DEBUG] User:', user?.name || 'Unknown', '(ID:', user?._id || 'Unknown', ')');
            
            await checkRole("teacher")(user);
            try {
                const userDetails = await getUserByUID(user.uid);
                const teacher = await getTeacherByUserId(userDetails._id);
                if (!teacher) {
                    console.error('❌ [DEBUG] Teacher profile not found for user:', user?.name);
                    throw new Error("Teacher profile not found");
                }
                console.log('👨‍🏫 [DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
                const result = await startAttendanceSession(session_id, teacher._id);
                console.log('✅ [DEBUG] startAttendanceSession successful:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('❌ [DEBUG] startAttendanceSession failed:', error.message);
                throw new Error(`Failed to start attendance session: ${error.message}`);
            }
        },
        markStudentPresent: async (_, { session_id, student_id }, { user }) => {
            console.log('🎯 [DEBUG] markStudentPresent mutation called');
            console.log('📝 [DEBUG] Session ID:', session_id, 'Student ID:', student_id);
            console.log('👤 [DEBUG] User:', user?.name || 'Unknown', '(ID:', user?._id || 'Unknown', ')');
            
            await checkRole("teacher")(user);
            try {
                const userDetails = await getUserByUID(user.uid);
                const teacher = await getTeacherByUserId(userDetails._id);
                if (!teacher) {
                    console.error('❌ [DEBUG] Teacher profile not found for user:', user?.name);
                    throw new Error("Teacher profile not found");
                }
                console.log('👨‍🏫 [DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
                const result = await markStudentPresent(session_id, student_id, teacher._id);
                console.log('✅ [DEBUG] markStudentPresent successful:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('❌ [DEBUG] markStudentPresent failed:', error.message);
                throw new Error(`Failed to mark student present: ${error.message}`);
            }
        },
        markStudentAbsent: async (_, { session_id, student_id }, { user }) => {
            console.log('🎯 [DEBUG] markStudentAbsent mutation called');
            console.log('📝 [DEBUG] Session ID:', session_id, 'Student ID:', student_id);
            console.log('👤 [DEBUG] User:', user?.name || 'Unknown', '(ID:', user?._id || 'Unknown', ')');
            
            await checkRole("teacher")(user);
            try {
                const userDetails = await getUserByUID(user.uid);
                const teacher = await getTeacherByUserId(userDetails._id);
                if (!teacher) {
                    console.error('❌ [DEBUG] Teacher profile not found for user:', user?.name);
                    throw new Error("Teacher profile not found");
                }
                console.log('👨‍🏫 [DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
                const result = await markStudentAbsent(session_id, student_id, teacher._id);
                console.log('✅ [DEBUG] markStudentAbsent successful:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('❌ [DEBUG] markStudentAbsent failed:', error.message);
                throw new Error(`Failed to mark student absent: ${error.message}`);
            }
        },
        bulkUpdateAttendance: async (_, { session_id, attendanceUpdates }, { user }) => {
            console.log('🎯 [DEBUG] bulkUpdateAttendance mutation called');
            console.log('📝 [DEBUG] Session ID:', session_id, 'Updates:', JSON.stringify(attendanceUpdates, null, 2));
            console.log('👤 [DEBUG] User:', user?.name || 'Unknown', '(ID:', user?._id || 'Unknown', ')');
            
            await checkRole("teacher")(user);
            try {
                const userDetails = await getUserByUID(user.uid);
                const teacher = await getTeacherByUserId(userDetails._id);
                if (!teacher) {
                    console.error('❌ [DEBUG] Teacher profile not found for user:', user?.name);
                    throw new Error("Teacher profile not found");
                }
                console.log('👨‍🏫 [DEBUG] Teacher found:', teacher.name, '(ID:', teacher._id, ')');
                const result = await bulkUpdateAttendance(session_id, attendanceUpdates, teacher._id);
                console.log('✅ [DEBUG] bulkUpdateAttendance successful:', JSON.stringify(result, null, 2));
                return result;
            } catch (error) {
                console.error('❌ [DEBUG] bulkUpdateAttendance failed:', error.message);
                throw new Error(`Failed to bulk update attendance: ${error.message}`);
            }
        }
    }
};
