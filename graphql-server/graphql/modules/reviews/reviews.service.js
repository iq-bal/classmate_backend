import Review from './reviews.model.js';
import { GraphQLError } from 'graphql';

export const reviewService = {
  getAllReviews: async () => {
    try {
      const reviews = await Review.find()
        .populate('course_id')
        .populate('student_id');
      return reviews;
    } catch (error) {
      throw new GraphQLError('Failed to fetch reviews');
    }
  },

  getReviewsByCourse: async (course_id) => {
    try {
      const reviews = await Review.find({ course_id })
        .populate('course_id')
        .populate('student_id');
      return reviews;
    } catch (error) {
      throw new GraphQLError('Failed to fetch course reviews');
    }
  },

  getReviewsByStudent: async (student_id) => {
    try {
      const reviews = await Review.find({ student_id })
        .populate('course_id')
        .populate('student_id');
      return reviews;
    } catch (error) {
      throw new GraphQLError('Failed to fetch student reviews');
    }
  },

  createReview: async (reviewData, user) => {
    try {
      // Ensure the user is a student
      if (!user || !user.student_id) {
        throw new GraphQLError('Only students can create reviews');
      }

      // Check if student has already reviewed this course
      const existingReview = await Review.findOne({
        course_id: reviewData.course_id,
        student_id: user.student_id
      });

      if (existingReview) {
        throw new GraphQLError('You have already reviewed this course');
      }

      const review = new Review({
        ...reviewData,
        student_id: user.student_id
      });

      await review.save();
      return await review.populate(['course_id', 'student_id']);
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Failed to create review');
    }
  },

  updateReview: async (id, reviewData, user) => {
    try {
      // Ensure the user is a student
      if (!user || !user.student_id) {
        throw new GraphQLError('Only students can update reviews');
      }

      const review = await Review.findOne({ _id: id, student_id: user.student_id });
      if (!review) {
        throw new GraphQLError('Review not found or you are not authorized to update it');
      }

      Object.assign(review, reviewData);
      await review.save();
      return await review.populate(['course_id', 'student_id']);
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Failed to update review');
    }
  },

  deleteReview: async (id, user) => {
    try {
      // Ensure the user is a student
      if (!user || !user.student_id) {
        throw new GraphQLError('Only students can delete reviews');
      }

      const review = await Review.findOne({ _id: id, student_id: user.student_id });
      if (!review) {
        throw new GraphQLError('Review not found or you are not authorized to delete it');
      }

      await review.populate(['course_id', 'student_id']);
      await review.deleteOne();
      return review;
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Failed to delete review');
    }
  }
};