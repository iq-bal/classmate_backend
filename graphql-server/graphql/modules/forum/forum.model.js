import mongoose from "mongoose";
import Course from "../course/course.model.js";
import User from "../user/user.model.js";

// Forum Post Schema
const forumPostSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  is_pinned: {
    type: Boolean,
    default: false,
  },
  is_resolved: {
    type: Boolean,
    default: false,
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

// Forum Comment Schema
const forumCommentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    required: true,
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  parent_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumComment",
    default: null,
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  is_answer: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

// Pre-save hooks for validation
forumPostSchema.pre("save", async function (next) {
  try {
    const courseExists = await Course.exists({ _id: this.course_id });
    if (!courseExists) {
      return next(new Error("Invalid course_id: Course does not exist."));
    }
    
    const userExists = await User.exists({ _id: this.author_id });
    if (!userExists) {
      return next(new Error("Invalid author_id: User does not exist."));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

forumCommentSchema.pre("save", async function (next) {
  try {
    const userExists = await User.exists({ _id: this.author_id });
    if (!userExists) {
      return next(new Error("Invalid author_id: User does not exist."));
    }
    
    if (this.parent_comment_id) {
      const parentExists = await mongoose.model("ForumComment").exists({ _id: this.parent_comment_id });
      if (!parentExists) {
        return next(new Error("Invalid parent_comment_id: Parent comment does not exist."));
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Add text indexes for search functionality
forumPostSchema.index({ title: "text", content: "text", tags: "text" });
forumCommentSchema.index({ content: "text" });

// Models
const ForumPost = mongoose.model("ForumPost", forumPostSchema);
const ForumComment = mongoose.model("ForumComment", forumCommentSchema);

export { ForumPost, ForumComment };
export default ForumPost;