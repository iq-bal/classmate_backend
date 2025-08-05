import { ForumPost, ForumComment } from "./forum.model.js";
import { GraphQLError } from "graphql";

// Forum Post Services
export const getAllForumPosts = async (filter = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const query = {};
    
    if (filter.course_id) query.course_id = filter.course_id;
    if (filter.author_id) query.author_id = filter.author_id;
    if (filter.is_pinned !== undefined) query.is_pinned = filter.is_pinned;
    if (filter.is_resolved !== undefined) query.is_resolved = filter.is_resolved;
    if (filter.tags && filter.tags.length > 0) query.tags = { $in: filter.tags };
    if (filter.search) {
      query.$text = { $search: filter.search };
    }
    
    return await ForumPost.find(query)
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes')
      .sort({ is_pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new GraphQLError(`Failed to fetch forum posts: ${error.message}`);
  }
};

export const getForumPostById = async (id) => {
  try {
    const post = await ForumPost.findById(id)
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes');
    
    if (!post) {
      throw new GraphQLError('Forum post not found');
    }
    
    // Increment view count
    await ForumPost.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    return post;
  } catch (error) {
    throw new GraphQLError(`Failed to fetch forum post: ${error.message}`);
  }
};

export const getForumPostsByCourse = async (course_id, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    return await ForumPost.find({ course_id })
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes')
      .sort({ is_pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new GraphQLError(`Failed to fetch forum posts for course: ${error.message}`);
  }
};

export const getForumPostsByUser = async (user_id, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    return await ForumPost.find({ author_id: user_id })
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new GraphQLError(`Failed to fetch forum posts by user: ${error.message}`);
  }
};

export const searchForumPosts = async (course_id, query, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    return await ForumPost.find({
      course_id,
      $text: { $search: query }
    })
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes')
      .sort({ score: { $meta: 'textScore' }, is_pinned: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new GraphQLError(`Failed to search forum posts: ${error.message}`);
  }
};

export const createForumPost = async (postData, author_id) => {
  try {
    const newPost = new ForumPost({
      ...postData,
      author_id
    });
    
    const savedPost = await newPost.save();
    
    return await ForumPost.findById(savedPost._id)
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes');
  } catch (error) {
    throw new GraphQLError(`Failed to create forum post: ${error.message}`);
  }
};

export const updateForumPost = async (id, updateData, user_id) => {
  try {
    const post = await ForumPost.findById(id);
    
    if (!post) {
      throw new GraphQLError('Forum post not found');
    }
    
    // Check if user is the author
    if (post.author_id.toString() !== user_id.toString()) {
      throw new GraphQLError('Not authorized to update this post');
    }
    
    const updatedPost = await ForumPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes');
    
    return updatedPost;
  } catch (error) {
    throw new GraphQLError(`Failed to update forum post: ${error.message}`);
  }
};

export const deleteForumPost = async (id, user_id) => {
  try {
    const post = await ForumPost.findById(id);
    
    if (!post) {
      throw new GraphQLError('Forum post not found');
    }
    
    // Check if user is the author
    if (post.author_id.toString() !== user_id.toString()) {
      throw new GraphQLError('Not authorized to delete this post');
    }
    
    // Delete all comments associated with this post
    await ForumComment.deleteMany({ post_id: id });
    
    // Delete the post
    await ForumPost.findByIdAndDelete(id);
    
    return true;
  } catch (error) {
    throw new GraphQLError(`Failed to delete forum post: ${error.message}`);
  }
};

export const toggleForumPostPin = async (id, user_id, pin = true) => {
  try {
    const post = await ForumPost.findById(id).populate('course_id');
    
    if (!post) {
      throw new GraphQLError('Forum post not found');
    }
    
    // Check if user is the course teacher (only teachers can pin/unpin)
    if (post.course_id.teacher_id.toString() !== user_id.toString()) {
      throw new GraphQLError('Only course teachers can pin/unpin posts');
    }
    
    const updatedPost = await ForumPost.findByIdAndUpdate(
      id,
      { is_pinned: pin },
      { new: true }
    )
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes');
    
    return updatedPost;
  } catch (error) {
    throw new GraphQLError(`Failed to ${pin ? 'pin' : 'unpin'} forum post: ${error.message}`);
  }
};

export const toggleForumPostResolved = async (id, user_id, resolved = true) => {
  try {
    const post = await ForumPost.findById(id);
    
    if (!post) {
      throw new GraphQLError('Forum post not found');
    }
    
    // Check if user is the author
    if (post.author_id.toString() !== user_id.toString()) {
      throw new GraphQLError('Only the post author can mark as resolved/unresolved');
    }
    
    const updatedPost = await ForumPost.findByIdAndUpdate(
      id,
      { is_resolved: resolved },
      { new: true }
    )
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes');
    
    return updatedPost;
  } catch (error) {
    throw new GraphQLError(`Failed to mark post as ${resolved ? 'resolved' : 'unresolved'}: ${error.message}`);
  }
};

export const voteForumPost = async (id, user_id, voteType) => {
  try {
    const post = await ForumPost.findById(id);
    
    if (!post) {
      throw new GraphQLError('Forum post not found');
    }
    
    // Remove existing votes by this user
    await ForumPost.findByIdAndUpdate(id, {
      $pull: {
        upvotes: user_id,
        downvotes: user_id
      }
    });
    
    // Add new vote if specified
    if (voteType === 'upvote') {
      await ForumPost.findByIdAndUpdate(id, {
        $addToSet: { upvotes: user_id }
      });
    } else if (voteType === 'downvote') {
      await ForumPost.findByIdAndUpdate(id, {
        $addToSet: { downvotes: user_id }
      });
    }
    
    return await ForumPost.findById(id)
      .populate('course_id')
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes');
  } catch (error) {
    throw new GraphQLError(`Failed to vote on forum post: ${error.message}`);
  }
};

// Forum Comment Services
export const getForumComments = async (post_id, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    return await ForumComment.find({ post_id, parent_comment_id: null })
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes')
      .sort({ is_answer: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new GraphQLError(`Failed to fetch forum comments: ${error.message}`);
  }
};

export const getForumCommentById = async (id) => {
  try {
    const comment = await ForumComment.findById(id)
      .populate('post_id')
      .populate('author_id')
      .populate('parent_comment_id')
      .populate('upvotes')
      .populate('downvotes');
    
    if (!comment) {
      throw new GraphQLError('Forum comment not found');
    }
    
    return comment;
  } catch (error) {
    throw new GraphQLError(`Failed to fetch forum comment: ${error.message}`);
  }
};

export const getForumCommentsByUser = async (user_id, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    return await ForumComment.find({ author_id: user_id })
      .populate('post_id')
      .populate('author_id')
      .populate('parent_comment_id')
      .populate('upvotes')
      .populate('downvotes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new GraphQLError(`Failed to fetch forum comments by user: ${error.message}`);
  }
};

export const getRepliesForComment = async (parent_comment_id) => {
  try {
    return await ForumComment.find({ parent_comment_id })
      .populate('author_id')
      .populate('upvotes')
      .populate('downvotes')
      .sort({ createdAt: 1 });
  } catch (error) {
    throw new GraphQLError(`Failed to fetch comment replies: ${error.message}`);
  }
};

export const createForumComment = async (commentData, author_id) => {
  try {
    const newComment = new ForumComment({
      ...commentData,
      author_id
    });
    
    const savedComment = await newComment.save();
    
    return await ForumComment.findById(savedComment._id)
      .populate('post_id')
      .populate('author_id')
      .populate('parent_comment_id')
      .populate('upvotes')
      .populate('downvotes');
  } catch (error) {
    throw new GraphQLError(`Failed to create forum comment: ${error.message}`);
  }
};

export const updateForumComment = async (id, updateData, user_id) => {
  try {
    const comment = await ForumComment.findById(id);
    
    if (!comment) {
      throw new GraphQLError('Forum comment not found');
    }
    
    // Check if user is the author
    if (comment.author_id.toString() !== user_id.toString()) {
      throw new GraphQLError('Not authorized to update this comment');
    }
    
    const updatedComment = await ForumComment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('post_id')
      .populate('author_id')
      .populate('parent_comment_id')
      .populate('upvotes')
      .populate('downvotes');
    
    return updatedComment;
  } catch (error) {
    throw new GraphQLError(`Failed to update forum comment: ${error.message}`);
  }
};

export const deleteForumComment = async (id, user_id) => {
  try {
    const comment = await ForumComment.findById(id);
    
    if (!comment) {
      throw new GraphQLError('Forum comment not found');
    }
    
    // Check if user is the author
    if (comment.author_id.toString() !== user_id.toString()) {
      throw new GraphQLError('Not authorized to delete this comment');
    }
    
    // Delete all replies to this comment
    await ForumComment.deleteMany({ parent_comment_id: id });
    
    // Delete the comment
    await ForumComment.findByIdAndDelete(id);
    
    return true;
  } catch (error) {
    throw new GraphQLError(`Failed to delete forum comment: ${error.message}`);
  }
};

export const toggleCommentAnswer = async (id, user_id, isAnswer = true) => {
  try {
    const comment = await ForumComment.findById(id).populate('post_id');
    
    if (!comment) {
      throw new GraphQLError('Forum comment not found');
    }
    
    // Check if user is the post author (only post author can mark answers)
    if (comment.post_id.author_id.toString() !== user_id.toString()) {
      throw new GraphQLError('Only the post author can mark comments as answers');
    }
    
    // If marking as answer, unmark other answers for this post
    if (isAnswer) {
      await ForumComment.updateMany(
        { post_id: comment.post_id._id },
        { is_answer: false }
      );
    }
    
    const updatedComment = await ForumComment.findByIdAndUpdate(
      id,
      { is_answer: isAnswer },
      { new: true }
    )
      .populate('post_id')
      .populate('author_id')
      .populate('parent_comment_id')
      .populate('upvotes')
      .populate('downvotes');
    
    return updatedComment;
  } catch (error) {
    throw new GraphQLError(`Failed to mark comment as ${isAnswer ? 'answer' : 'not answer'}: ${error.message}`);
  }
};

export const voteForumComment = async (id, user_id, voteType) => {
  try {
    const comment = await ForumComment.findById(id);
    
    if (!comment) {
      throw new GraphQLError('Forum comment not found');
    }
    
    // Remove existing votes by this user
    await ForumComment.findByIdAndUpdate(id, {
      $pull: {
        upvotes: user_id,
        downvotes: user_id
      }
    });
    
    // Add new vote if specified
    if (voteType === 'upvote') {
      await ForumComment.findByIdAndUpdate(id, {
        $addToSet: { upvotes: user_id }
      });
    } else if (voteType === 'downvote') {
      await ForumComment.findByIdAndUpdate(id, {
        $addToSet: { downvotes: user_id }
      });
    }
    
    return await ForumComment.findById(id)
      .populate('post_id')
      .populate('author_id')
      .populate('parent_comment_id')
      .populate('upvotes')
      .populate('downvotes');
  } catch (error) {
    throw new GraphQLError(`Failed to vote on forum comment: ${error.message}`);
  }
};

// Helper function to get comment count for a post
export const getCommentCountForPost = async (post_id) => {
  try {
    return await ForumComment.countDocuments({ post_id });
  } catch (error) {
    return 0;
  }
};

// Helper function to get reply count for a comment
export const getReplyCountForComment = async (parent_comment_id) => {
  try {
    return await ForumComment.countDocuments({ parent_comment_id });
  } catch (error) {
    return 0;
  }
};