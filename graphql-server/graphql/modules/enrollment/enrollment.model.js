import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  enrolled_at: {
    type: Date,
    default: Date.now,
  }
});

// Create compound index to prevent duplicate enrollments
enrollmentSchema.index({ course_id: 1, student_id: 1 }, { unique: true });

// Pre-save hook to validate student and course
enrollmentSchema.pre('save', async function (next) {
  try {
    // Validate course
    const course = await mongoose.model('Course').findById(this.course_id);
    if (!course) {
      return next(new Error('Invalid course_id: Course does not exist.'));
    }
    
    // Validate student
    const student = await mongoose.model('Student').findById(this.student_id);
    if (!student) {
      return next(new Error('Invalid student_id: User does not exist or is not a student.'));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Enrollment Model
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;