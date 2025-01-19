import EnrollmentModel from './enrollment.model.js';
import { getUserByUID } from "../user/user.service.js";
import { getStudentByUserId } from "../student/student.service.js";

export const getEnrollments = async () => {
    return await EnrollmentModel.find();
}

export async function getEnrollment(course_id, student_id) {
    try {
      // Find the enrollment document matching both course_id and student_id
      const enrollment = await EnrollmentModel.findOne({ course_id, student_id });
  
      if (!enrollment) {
        return { message: 'Enrollment not found' };
      }
      
      return enrollment;
    } catch (error) {
      console.error('Error finding enrollment:', error);
      throw new Error('An error occurred while retrieving the enrollment');
    }
}

export const addEnrollment = async (course_id,user) => {
    const student = await getUserByUID(user.uid);
    const studentDetails = await getStudentByUserId(student._id);  
    if(!studentDetails){
        throw new Error("Student not found");
    }
    const existingEnrollment = await EnrollmentModel.findOne({ course_id, student_id: studentDetails._id });
    if (existingEnrollment) {
        throw new Error("Student already enrolled in this course");
    }
    return await EnrollmentModel.create({course_id,student_id:studentDetails._id});
}

export const updateEnrollment = async (id, status) => {
    return await EnrollmentModel.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true }
    );
}

export const deleteEnrollment = async (id) => {
    return await EnrollmentModel.findByIdAndDelete(id);
} 



  