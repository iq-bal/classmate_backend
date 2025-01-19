import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { typeDefs as courseTypeDefs } from "./course/course.typeDefs.js";
import { typeDefs as assignmentTypeDefs} from "./assignment/assignment.typeDefs.js";
import { typeDefs as submissionTypeDefs} from "./submission/submission.typeDefs.js";
import { typeDefs as studentTypeDefs } from './student/student.typeDefs.js';
import { typeDefs as userTypeDefs } from './user/user.typeDef.js';
import { typeDefs as enrollmentTypeDefs } from './enrollment/enrollment.typeDefs.js';
import { typeDefs as syllabusTypeDefs } from './syllabus/syllabus.typeDefs.js';
import { typeDefs as teacherTypeDefs } from './teacher/teacher.typeDefs.js';
import { typeDefs as sessionTypeDefs } from './session/session.typeDefs.js';
import { typeDefs as attendanceTypeDefs } from './attendance/attendance.typeDefs.js';
import { typeDefs as scheduleTypeDefs } from './schedule/schedule.typeDefs.js';
import { typeDefs as taskTypeDefs } from './task/task.typeDefs.js';


import { resolvers as submissionResolvers } from './submission/submission.resolvers.js';
import { resolvers as courseResolvers} from './course/course.resolvers.js';
import { resolvers as assignmentResolvers } from './assignment/assignment.resolvers.js';
import { resolvers as studentResolvers } from './student/student.resolver.js';
import { resolvers as userResolvers } from './user/user.resolver.js';
import { resolvers as enrollmentResolvers } from './enrollment/enrollment.resolvers.js'; 
import { resolvers as syllabusResolvers } from './syllabus/syllabus.resolver.js';
import { resolvers as teacherResolvers } from './teacher/teacher.resolvers.js';
import { resolvers as sessionResolvers } from './session/session.resolver.js';
import { resolvers as attendanceResolvers } from './attendance/attendance.resolver.js';
import { resolvers as scheduleResolvers } from './schedule/schedule.resolver.js';
import { resolvers as taskResolvers } from './task/task.resolver.js';

export const typeDefs = mergeTypeDefs([
    courseTypeDefs,
    assignmentTypeDefs,
    submissionTypeDefs,
    studentTypeDefs,
    userTypeDefs,
    enrollmentTypeDefs,
    syllabusTypeDefs,
    teacherTypeDefs,
    sessionTypeDefs,
    attendanceTypeDefs,
    scheduleTypeDefs,
    taskTypeDefs
]);

export const resolvers = mergeResolvers([
    submissionResolvers,
    courseResolvers,
    assignmentResolvers,
    studentResolvers,
    userResolvers,
    enrollmentResolvers,
    syllabusResolvers,
    teacherResolvers,
    sessionResolvers,
    attendanceResolvers,
    scheduleResolvers,
    taskResolvers
]);



