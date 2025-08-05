import { getSchedulesByCourse } from '../schedule/schedule.service.js';
import { getTasksByUser } from '../task/task.service.js';
import { getUserByUID } from '../user/user.service.js';
import { getStudentByUserId } from '../student/student.service.js';
import { getEnrollmentsByStudent } from '../enrollment/enrollment.service.js';
import { getClassTestsByCourse } from '../classtest/classtest.service.js';
import { getCourseById } from '../course/course.service.js';

export const resolvers = {
    DashboardClass: {
        course: async (parent) => {
            try {
                return await getCourseById(parent.course_id);
            } catch (error) {
                throw new Error(`Failed to fetch course for class: ${error.message}`);
            }
        },
        teacher: async (parent) => {
            try {
                const course = await getCourseById(parent.course_id);
                return course.teacher;
            } catch (error) {
                throw new Error(`Failed to fetch teacher for class: ${error.message}`);
            }
        }
    },
    DashboardAssignment: {
        course: async (parent) => {
            try {
                return await getCourseById(parent.course_id);
            } catch (error) {
                throw new Error(`Failed to fetch course for assignment: ${error.message}`);
            }
        }
    },
    DashboardClassTest: {
        course: async (parent) => {
            try {
                return await getCourseById(parent.course_id);
            } catch (error) {
                throw new Error(`Failed to fetch course for class test: ${error.message}`);
            }
        }
    },
    Query: {
        studentDashboard: async (_, { date }, { user }) => {
            try {
                // Get user and student details
                const userDetails = await getUserByUID(user.uid);
                const studentDetails = await getStudentByUserId(userDetails._id);
                
                if (!studentDetails) {
                    throw new Error('Student not found');
                }

                // Get student's enrolled courses
                const enrollments = await getEnrollmentsByStudent(studentDetails._id);
                const courseIds = enrollments.map(enrollment => enrollment.course_id);

                // Get schedules for the given date
                const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                const classPromises = courseIds.map(courseId => getSchedulesByCourse(courseId));
                const allSchedules = await Promise.all(classPromises);
                const todayClasses = allSchedules
                    .flat()
                    .filter(schedule => schedule.day === dayOfWeek)
                    .map(schedule => ({
                        id: schedule._id,
                        title: schedule.title,
                        course_id: schedule.course_id.toString(),
                        teacher: schedule.teacher
                    }));

                // Get upcoming assignments
                const tasks = await getTasksByUser(user);
                const upcomingAssignments = tasks.filter(task => 
                    task.category === 'project' && 
                    new Date(task.date) >= new Date(date) &&
                    task.course_id // Only include tasks with a course_id
                ).map(task => ({
                    id: task._id,
                    title: task.title,
                    deadline: task.date,
                    course_id: task.course_id.toString() // Ensure course_id is properly converted to string
                }));

                // Get upcoming class tests
                const classTestPromises = courseIds.map(courseId => getClassTestsByCourse(courseId));
                const allClassTests = await Promise.all(classTestPromises);
                const upcomingClassTests = allClassTests
                    .flat()
                    .filter(test => new Date(test.date) >= new Date(date));

                // Get course details for enrolled courses
                const coursesPromises = courseIds.map(courseId => getCourseById(courseId));
                const courses = await Promise.all(coursesPromises);

                return {
                    courses,
                    classes: todayClasses,
                    upcomingAssignments,
                    upcomingClassTests
                };
            } catch (error) {
                throw new Error(`Failed to fetch dashboard data: ${error.message}`);
            }
        }
    }
};