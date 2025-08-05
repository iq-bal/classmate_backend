import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only review a course once
reviewSchema.index({ course_id: 1, student_id: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;