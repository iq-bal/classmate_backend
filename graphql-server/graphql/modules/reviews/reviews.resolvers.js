import { reviewService } from './reviews.service.js';

const reviewResolvers = {
  Query: {
    reviews: async (_, __, { user }) => {
      return await reviewService.getAllReviews();
    },
    reviewsByCourse: async (_, { course_id }) => {
      return await reviewService.getReviewsByCourse(course_id);
    },
    reviewsByStudent: async (_, { student_id }) => {
      return await reviewService.getReviewsByStudent(student_id);
    }
  },

  Mutation: {
    createReview: async (_, { reviewInput }, { user }) => {
      return await reviewService.createReview(reviewInput, user);
    },
    updateReview: async (_, { id, reviewInput }, { user }) => {
      return await reviewService.updateReview(id, reviewInput, user);
    },
    deleteReview: async (_, { id }, { user }) => {
      return await reviewService.deleteReview(id, user);
    }
  },
  Review: {
    commented_by: async (parent) => {
      try {
        console.log("parent", parent);
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Could not fetch user for this review.");
      }
    }
  }
};

export const resolvers = reviewResolvers;