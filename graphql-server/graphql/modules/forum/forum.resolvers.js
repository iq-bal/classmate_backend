import {
  getAllForumPosts,
  getForumPostById,
  getForumPostsByCourse,
  getForumPostsByUser,
  searchForumPosts,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  toggleForumPostPin,
  toggleForumPostResolved,
  voteForumPost,
  getForumComments,
  getForumCommentById,
  getForumCommentsByUser,
  getRepliesForComment,
  createForumComment,
  updateForumComment,
  deleteForumComment,
  toggleCommentAnswer,
  voteForumComment,
  getCommentCountForPost,
  getReplyCountForComment
} from "./forum.service.js";
import { getUserByUID } from "../user/user.service.js";
import { getTeacherByUserId } from "../teacher/teacher.service.js";
import { GraphQLError } from "graphql";

export const resolvers = {
  Query: {
    forumPosts: async (_, { filter, page, limit }) => {
      try {
        return await getAllForumPosts(filter, page, limit);
      } catch (error) {
        throw new GraphQLError("Failed to fetch forum posts");
      }
    },
    
    forumPost: async (_, { id }) => {
      try {
        return await getForumPostById(id);
      } catch (error) {
        throw new GraphQLError("Forum post not found");
      }
    },
    
    forumPostsByCourse: async (_, { course_id, page, limit }) => {
      try {
        return await getForumPostsByCourse(course_id, page, limit);
      } catch (error) {
        throw new GraphQLError("Failed to fetch forum posts for this course");
      }
    },
    
    forumPostsByUser: async (_, { user_id, page, limit }) => {
      try {
        return await getForumPostsByUser(user_id, page, limit);
      } catch (error) {
        throw new GraphQLError("Failed to fetch forum posts by user");
      }
    },
    
    searchForumPosts: async (_, { course_id, query, page, limit }) => {
      try {
        return await searchForumPosts(course_id, query, page, limit);
      } catch (error) {
        throw new GraphQLError("Failed to search forum posts");
      }
    },
    
    forumComments: async (_, { post_id, page, limit }) => {
      try {
        return await getForumComments(post_id, page, limit);
      } catch (error) {
        throw new GraphQLError("Failed to fetch forum comments");
      }
    },
    
    forumComment: async (_, { id }) => {
      try {
        return await getForumCommentById(id);
      } catch (error) {
        throw new GraphQLError("Forum comment not found");
      }
    },
    
    forumCommentsByUser: async (_, { user_id, page, limit }) => {
      try {
        return await getForumCommentsByUser(user_id, page, limit);
      } catch (error) {
        throw new GraphQLError("Failed to fetch forum comments by user");
      }
    }
  },
  
  Mutation: {
    createForumPost: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await createForumPost(input, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to create forum post");
      }
    },
    
    updateForumPost: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await updateForumPost(id, input, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to update forum post");
      }
    },
    
    deleteForumPost: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await deleteForumPost(id, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to delete forum post");
      }
    },
    
    pinForumPost: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        const teacherDetails = await getTeacherByUserId(userDetails._id);
        if (!teacherDetails) {
          throw new GraphQLError("Only teachers can pin posts");
        }
        
        return await toggleForumPostPin(id, teacherDetails._id, true);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to pin forum post");
      }
    },
    
    unpinForumPost: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        const teacherDetails = await getTeacherByUserId(userDetails._id);
        if (!teacherDetails) {
          throw new GraphQLError("Only teachers can unpin posts");
        }
        
        return await toggleForumPostPin(id, teacherDetails._id, false);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to unpin forum post");
      }
    },
    
    markForumPostResolved: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await toggleForumPostResolved(id, userDetails._id, true);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to mark forum post as resolved");
      }
    },
    
    markForumPostUnresolved: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await toggleForumPostResolved(id, userDetails._id, false);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to mark forum post as unresolved");
      }
    },
    
    upvoteForumPost: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await voteForumPost(id, userDetails._id, 'upvote');
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to upvote forum post");
      }
    },
    
    downvoteForumPost: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await voteForumPost(id, userDetails._id, 'downvote');
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to downvote forum post");
      }
    },
    
    removeForumPostVote: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await voteForumPost(id, userDetails._id, null);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to remove vote from forum post");
      }
    },
    
    createForumComment: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await createForumComment(input, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to create forum comment");
      }
    },
    
    updateForumComment: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await updateForumComment(id, input, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to update forum comment");
      }
    },
    
    deleteForumComment: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await deleteForumComment(id, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to delete forum comment");
      }
    },
    
    markCommentAsAnswer: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await toggleCommentAnswer(id, userDetails._id, true);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to mark comment as answer");
      }
    },
    
    unmarkCommentAsAnswer: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await toggleCommentAnswer(id, userDetails._id, false);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to unmark comment as answer");
      }
    },
    
    upvoteForumComment: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await voteForumComment(id, userDetails._id, 'upvote');
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to upvote forum comment");
      }
    },
    
    downvoteForumComment: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await voteForumComment(id, userDetails._id, 'downvote');
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to downvote forum comment");
      }
    },
    
    removeForumCommentVote: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError("User not authenticated");
        }
        
        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError("User not found");
        }
        
        return await voteForumComment(id, userDetails._id, null);
      } catch (error) {
        throw new GraphQLError(error.message || "Failed to remove vote from forum comment");
      }
    }
  },
  
  // Field resolvers
  ForumPost: {
    comments: async (parent) => {
      try {
        return await getForumComments(parent._id || parent.id);
      } catch (error) {
        return [];
      }
    },
    
    comment_count: async (parent) => {
      try {
        return await getCommentCountForPost(parent._id || parent.id);
      } catch (error) {
        return 0;
      }
    },
    
    upvote_count: async (parent) => {
      return parent.upvotes ? parent.upvotes.length : 0;
    },
    
    downvote_count: async (parent) => {
      return parent.downvotes ? parent.downvotes.length : 0;
    }
  },
  
  ForumComment: {
    replies: async (parent) => {
      try {
        return await getRepliesForComment(parent._id || parent.id);
      } catch (error) {
        return [];
      }
    },
    
    reply_count: async (parent) => {
      try {
        return await getReplyCountForComment(parent._id || parent.id);
      } catch (error) {
        return 0;
      }
    },
    
    upvote_count: async (parent) => {
      return parent.upvotes ? parent.upvotes.length : 0;
    },
    
    downvote_count: async (parent) => {
      return parent.downvotes ? parent.downvotes.length : 0;
    }
  }
};