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
export const getEnrollmentsByCourse = async (course_id) => {
    return await EnrollmentModel.find({ course_id });
}
export const addEnrollment = async (course_id,user) => {
    try {
         // Get user by UID
         const student = await getUserByUID(user.uid);
         if (!student) {
             throw new Error("User not found");
         }
         
         // Get student details by user ID
         const studentDetails = await getStudentByUserId(student._id);
         if (!studentDetails) {
             throw new Error("Student profile not found. Please complete your student profile before enrolling.");
         }
         
         // Check if already enrolled
         const existingEnrollment = await EnrollmentModel.findOne({ course_id, student_id: studentDetails._id });
         if (existingEnrollment) {
             throw new Error("Student already enrolled in this course");
         }
         
        //  console.log("studentDetails", studentDetails);
         // Create new enrollment with pending status
         return await EnrollmentModel.create({course_id, student_id: studentDetails._id});
     } catch (error) {
         console.error("Error in addEnrollment service:", error);
         throw new Error(error.message || "Failed to create enrollment");
     } 
}

export const updateEnrollment = async (id, status) => {
    try {
        const enrollment = await EnrollmentModel.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        
        if (!enrollment) {
            throw new Error(`Enrollment with ID: ${id} not found`);
        }
        
        return enrollment;
    } catch (error) {
        console.error(`Error updating enrollment status:`, error);
        throw new Error(error.message || `Failed to update enrollment status`);
    }
}

export const deleteEnrollment = async (id) => {
    try {
        const enrollment = await EnrollmentModel.findByIdAndDelete(id);
        
        if (!enrollment) {
            throw new Error(`Enrollment with ID: ${id} not found`);
        }
        
        return enrollment;
    } catch (error) {
        console.error(`Error deleting enrollment:`, error);
        throw new Error(error.message || `Failed to delete enrollment`);
    }
} 

export const getEnrollmentsByStudent = async (student_id) => {
    try {
        return await EnrollmentModel.find({ student_id });
    } catch (error) {
        console.error('Error finding enrollments:', error);
        throw new Error('An error occurred while retrieving student enrollments');
    }
}

export const updateEnrollmentStatusByTeacher = async (enrollment_id, status, user) => {
    try {
        // Get enrollment details
        const enrollment = await EnrollmentModel.findById(enrollment_id).populate('course_id');
        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        // Get user details
        const { getUserByUID } = await import('../user/user.service.js');
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
            throw new Error('User not found');
        }

        // Get teacher details
        const { getTeacherByUserId } = await import('../teacher/teacher.service.js');
        const teacher = await getTeacherByUserId(userDetails._id);
        if (!teacher) {
            throw new Error('Teacher profile not found');
        }

        // Check if teacher is the course creator
        if (enrollment.course_id.teacher_id.toString() !== teacher._id.toString()) {
            throw new Error('Only the course creator can update enrollment status');
        }

        // Update enrollment status
        const updatedEnrollment = await EnrollmentModel.findByIdAndUpdate(
            enrollment_id,
            { status },
            { new: true }
        );

        return updatedEnrollment;
    } catch (error) {
        console.error('Error updating enrollment status by teacher:', error);
        throw new Error(error.message || 'Failed to update enrollment status');
    }
};

export const getEnrollmentsWithStudentsByCourse = async (course_id) => {
    try {
        // Get all enrollments for the course
        const enrollments = await EnrollmentModel.find({ course_id })
            .populate({
                path: 'student_id',
                populate: {
                    path: 'user_id',
                    select: 'name email profile_picture'
                }
            });

        // Format the response to match EnrollmentWithStudent type
        return enrollments.map(enrollment => ({
            id: enrollment._id,
            status: enrollment.status,
            enrolled_at: enrollment.enrolled_at,
            student: {
                id: enrollment.student_id._id,
                roll: enrollment.student_id.roll || 'N/A',
                section: enrollment.student_id.section || 'N/A',
                user_id: {
                    id: enrollment.student_id.user_id._id,
                    name: enrollment.student_id.user_id.name,
                    email: enrollment.student_id.user_id.email,
                    profile_picture: enrollment.student_id.user_id.profile_picture
                }
            }
        }));
    } catch (error) {
        console.error('Error fetching enrollments with students:', error);
        throw new Error('Failed to fetch enrollments with student details');
    }
}

export const getEnrollmentsByStudentAndDay = async (student_id, day) => {
    try {
        // Import Schedule model to check schedules
        const Schedule = (await import('../schedule/schedule.model.js')).default;
        
        // Get all enrollments for the student with approved status
        const enrollments = await EnrollmentModel.find({ 
            student_id, 
            status: 'approved' 
        });

        // Get course IDs from enrollments
        const courseIds = enrollments.map(enrollment => enrollment.course_id);
        
        // Find schedules that match the day for these courses
        const schedulesForDay = await Schedule.find({
            course_id: { $in: courseIds },
            day: day
        });
        
        // Get course IDs that have schedules for the specified day
        const courseIdsWithSchedules = schedulesForDay.map(schedule => schedule.course_id.toString());
        
        // Filter enrollments to only include courses with schedules for the day
        const filteredEnrollments = enrollments.filter(enrollment => 
            courseIdsWithSchedules.includes(enrollment.course_id.toString())
        );
        
        return filteredEnrollments;
    } catch (error) {
        console.error('Error fetching enrollments by student and day:', error);
        throw new Error('Failed to fetch enrollments for the specified day');
    }
}

export const getCurrentClassForStudent = async (student_id, day, current_time) => {
    try {
        // Import Schedule model to check schedules
        const Schedule = (await import('../schedule/schedule.model.js')).default;
        
        // Get all enrollments for the student with approved status
        const enrollments = await EnrollmentModel.find({ 
            student_id, 
            status: 'approved' 
        });

        // Get course IDs from enrollments
        const courseIds = enrollments.map(enrollment => enrollment.course_id);
        
        // Helper function to convert time string to minutes for comparison
        const timeToMinutes = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            let totalMinutes = hours * 60 + minutes;
            
            if (period === 'PM' && hours !== 12) {
                totalMinutes += 12 * 60;
            } else if (period === 'AM' && hours === 12) {
                totalMinutes = minutes;
            }
            
            return totalMinutes;
        };
        
        const currentTimeMinutes = timeToMinutes(current_time);
        
        // Find schedules that match the day and current time for these courses
        const schedulesForDay = await Schedule.find({
            course_id: { $in: courseIds },
            day: day
        });
        
        // Filter schedules where current time is between start and end time
        const currentSchedules = schedulesForDay.filter(schedule => {
            const startTimeMinutes = timeToMinutes(schedule.start_time);
            const endTimeMinutes = timeToMinutes(schedule.end_time);
            
            return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
        });
        
        // Get course IDs that have current schedules
        const courseIdsWithCurrentSchedules = currentSchedules.map(schedule => schedule.course_id.toString());
        
        // Filter enrollments to only include courses with current schedules
        const filteredEnrollments = enrollments.filter(enrollment => 
            courseIdsWithCurrentSchedules.includes(enrollment.course_id.toString())
        );
        
        return filteredEnrollments;
    } catch (error) {
        console.error('Error fetching current class for student:', error);
        throw new Error('Failed to fetch current class');
    }
}




  