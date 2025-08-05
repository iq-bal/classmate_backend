import Submission from "./submission.model.js";

// Function to get all submissions
export const getAllSubmissions = async () => {
  try {
    const submissions = await Submission.find()
      .populate({
        path: 'student_id',
        populate: {
          path: 'user_id'
        }
      })
      .populate('assignment_id');
    return submissions;
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    throw new Error("Could not fetch submissions.");
  }
};

// Function to get a single submission by ID
export const getSubmissionById = async (id) => {
  try {
    const submission = await Submission.findById(id)
      .populate({
        path: 'student_id',
        populate: {
          path: 'user_id'
        }
      })
      .populate('assignment_id');
    if (!submission) {
      throw new Error(`Submission with ID: ${id} not found.`);
    }
    return submission;
  } catch (error) {
    console.error(`Error fetching submission with ID: ${id}`, error);
    throw new Error(`Could not fetch submission with ID: ${id}.`);
  }
};

// Function to get submissions by assignment ID
export const getSubmissionsByAssignment = async (assignment_id) => {
  try {
    const submissions = await Submission.find({ assignment_id })
      .populate({
        path: 'student_id',
        populate: {
          path: 'user_id'
        }
      })
      .populate('assignment_id');
    return submissions;
  } catch (error) {
    console.error(`Error fetching submissions for assignment: ${assignment_id}`, error);
    throw new Error("Could not fetch submissions for this assignment.");
  }
};

// Function to get specific submission by assignment and student
export const getSubmissionByAssignmentAndStudent = async (assignment_id, student_id) => {
  try {
    const submission = await Submission.findOne({ 
      assignment_id, 
      student_id 
    })
    .populate({
      path: 'student_id',
      populate: {
        path: 'user_id',
        select: 'name email profile_picture'
      }
    })
    .populate({
      path: 'assignment_id',
      populate: {
        path: 'course_id',
        populate: {
          path: 'teacher_id',
          populate: {
            path: 'user_id',
            select: 'name profile_picture'
          }
        }
      }
    });

    if (!submission) {
      throw new Error('Submission not found for this assignment and student.');
    }

    return submission;
  } catch (error) {
    console.error('Error fetching specific submission:', error);
    throw new Error('Could not fetch submission for this assignment and student.');
  }
};

// Function to update submission
export const updateSubmission = async (id, submissionInput) => {
  try {
    const updateData = {
      teacher_comments: submissionInput.teacher_comments,
      grade: submissionInput.grade,
      evaluated_at: new Date()
    };

    const submission = await Submission.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate({
      path: 'student_id',
      populate: {
        path: 'user_id'
      }
    })
    .populate({
      path: 'assignment_id',
      populate: {
        path: 'course_id',
        populate: {
          path: 'teacher_id',
          populate: {
            path: 'user_id',
            select: 'name profile_picture'
          }
        }
      }
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    return submission;
  } catch (error) {
    console.error('Error updating submission:', error);
    throw new Error('Could not update submission.');
  }
};
