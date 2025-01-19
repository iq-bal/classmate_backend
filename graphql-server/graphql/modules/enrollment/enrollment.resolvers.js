import { getEnrollments, addEnrollment,updateEnrollment,deleteEnrollment } from "./enrollment.service.js";
import { checkRole } from "../../utils/check_roles.js";

const resolvers = {
    Query: {
        enrollments: async () => {
            return await getEnrollments();
        }
    },
    Mutation: {
        addEnrollment: async (_, { course_id }, { user }) => {
            await checkRole("student")(user);
            return await addEnrollment(course_id, user);
        },
        updateEnrollment: async (_, { id, status }, { user }) => {
            await checkRole("teacher")(user);
            return await updateEnrollment(id, status);
        },
        deleteEnrollment: async (_, { id }, { user }) => {
            return await deleteEnrollment(id);
        }
    }   
}

export { resolvers };   