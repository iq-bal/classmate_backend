import Assignment from "./assignment.model.js";
import { getAllSubmissions } from "../submission/submission.service.js";
import { getUserByUID } from "../user/user.service.js";
import { getStudentByUserId } from "../student/student.service.js";
import { getTeacherByUserId } from "../teacher/teacher.service.js";
import { getCourseById } from "../course/course.service.js";
import { ObjectId } from "mongodb";

// Function to get all assignments
export const getAllAssignments = async () => {
  try {
    const assignments = await Assignment.find(); // Fetch all assignments
    return assignments;
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    throw new Error("Could not fetch assignments.");
  }
};

// Function to get a single assignment by ID
export const getAssignmentById = async (id) => {
  try {
    const assignment = await Assignment.findById(id); // Fetch assignment by ID
    if (!assignment) {
      throw new Error(`Assignment with ID: ${id} not found.`);
    }
    return assignment;
  } catch (error) {
    console.error(`Error fetching assignment with ID: ${id}`, error);
    throw new Error(`Could not fetch assignment with ID: ${id}.`);
  }
};

export const getAssignmentsByCourse = async (courseId) => {
  try {
    const assignments = await Assignment.find({ course_id: courseId });
    return assignments;
  } catch (error) {
    console.error("Error fetching assignments by course:", error);
    throw new Error("Could not fetch assignments by course.");
  }
};

export const createAssignment = async (assignmentInput, user) => {
  try {
    const userDetails = await getUserByUID(user.uid);
    if (!userDetails) {
      throw new Error("User not found");
    }
    
    const teacherDetails = await getTeacherByUserId(userDetails._id);
    if (!teacherDetails) {
      throw new Error("Teacher not found");
    }

    // Get course details to verify ownership
    const course = await getCourseById(assignmentInput.course_id);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if the teacher owns the course
    if (course.teacher_id._id.toString() !== teacherDetails._id.toString()) {
      throw new Error("Only the course teacher can create assignments for this course");
    }

    return await Assignment.create({
      ...assignmentInput,
      teacher_id: teacherDetails._id
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw new Error(`Failed to create assignment: ${error.message}`);
  }
};

export const updateAssignment = async (id, updates, user) => {
  try {
    const userDetails = await getUserByUID(user.uid);
    if (!userDetails) {
      throw new Error("User not found");
    }
    
    const teacherDetails = await getTeacherByUserId(userDetails._id);
    if (!teacherDetails) {
      throw new Error("Teacher not found");
    }

    // Get assignment details to verify ownership
    const assignment = await getAssignmentById(id);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Get course details to verify ownership
    const course = await getCourseById(assignment.course_id);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if the teacher owns the course
    if (course.teacher_id._id.toString() !== teacherDetails._id.toString()) {
      throw new Error("Only the course teacher can update assignments for this course");
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return updatedAssignment;
  } catch (error) {
    console.error("Error updating assignment:", error);
    throw new Error(`Failed to update assignment: ${error.message}`);
  }
};

export const deleteAssignment = async (id, user) => {
  try {
    const userDetails = await getUserByUID(user.uid);
    if (!userDetails) {
      throw new Error("User not found");
    }
    
    const teacherDetails = await getTeacherByUserId(userDetails._id);
    if (!teacherDetails) {
      throw new Error("Teacher not found");
    }

    // Get assignment details to verify ownership
    const assignment = await getAssignmentById(id);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Get course details to verify ownership
    const course = await getCourseById(assignment.course_id);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if the teacher owns the course
    if (course.teacher_id._id.toString() !== teacherDetails._id.toString()) {
      throw new Error("Only the course teacher can delete assignments for this course");
    }

    await Assignment.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw new Error(`Failed to delete assignment: ${error.message}`);
  }
};

export const getSubmissionForAssignmentAndUser = async (assignmentId, user) => {
  try {
    if (!user) {
      throw new Error("User not authenticated");
    }
    const allSubmissions = await getAllSubmissions();
    const userDetails = await getUserByUID(user.uid);
    if (!userDetails) {
      throw new Error("User details not found");
    }
    const student = await getStudentByUserId(userDetails._id);
    if (!student) {
      throw new Error("Student not found");
    }
    const user_id = student._id;
    if (!user_id) {
      throw new Error("Invalid student ID");
    }

    const assignmentObjectId = new ObjectId(assignmentId);
    const submission = allSubmissions.find(
      (submission) =>
        submission.assignment_id && 
        submission.student_id &&
        submission.assignment_id.equals(assignmentObjectId) && 
        submission.student_id.equals(user_id)
    );
    return submission || null;
  } catch (error) {
    console.error(
      `Error fetching submission for assignment ID: ${assignmentId} and user: ${user?.uid}`,
      error
    );
    throw new Error("Could not fetch submission for the assignment and student.");
  }
};



