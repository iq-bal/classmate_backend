export const typeDefs = `#graphql
  type ForumPost {
    id: ID!
    course_id: Course!
    author_id: User!
    title: String!
    content: String!
    tags: [String!]
    is_pinned: Boolean!
    is_resolved: Boolean!
    upvotes: [User!]
    downvotes: [User!]
    views: Int!
    comments: [ForumComment!]
    comment_count: Int!
    upvote_count: Int!
    downvote_count: Int!
    createdAt: String!
    updatedAt: String!
  }

  type ForumComment {
    id: ID!
    post_id: ForumPost!
    author_id: User!
    content: String!
    parent_comment_id: ForumComment
    upvotes: [User!]
    downvotes: [User!]
    is_answer: Boolean!
    replies: [ForumComment!]
    reply_count: Int!
    upvote_count: Int!
    downvote_count: Int!
    createdAt: String!
    updatedAt: String!
  }

  input CreateForumPostInput {
    course_id: ID!
    title: String!
    content: String!
    tags: [String!]
  }

  input UpdateForumPostInput {
    title: String
    content: String
    tags: [String!]
    is_resolved: Boolean
  }

  input CreateForumCommentInput {
    post_id: ID!
    content: String!
    parent_comment_id: ID
  }

  input UpdateForumCommentInput {
    content: String
    is_answer: Boolean
  }

  input ForumPostFilter {
    course_id: ID
    author_id: ID
    is_pinned: Boolean
    is_resolved: Boolean
    tags: [String!]
    search: String
  }

  type Query {
    # Forum Post Queries
    forumPosts(filter: ForumPostFilter, page: Int = 1, limit: Int = 10): [ForumPost!]!
    forumPost(id: ID!): ForumPost
    forumPostsByCourse(course_id: ID!, page: Int = 1, limit: Int = 10): [ForumPost!]!
    forumPostsByUser(user_id: ID!, page: Int = 1, limit: Int = 10): [ForumPost!]!
    searchForumPosts(course_id: ID!, query: String!, page: Int = 1, limit: Int = 10): [ForumPost!]!
    
    # Forum Comment Queries
    forumComments(post_id: ID!, page: Int = 1, limit: Int = 20): [ForumComment!]!
    forumComment(id: ID!): ForumComment
    forumCommentsByUser(user_id: ID!, page: Int = 1, limit: Int = 10): [ForumComment!]!
  }

  type Mutation {
    # Forum Post Mutations
    createForumPost(input: CreateForumPostInput!): ForumPost!
    updateForumPost(id: ID!, input: UpdateForumPostInput!): ForumPost!
    deleteForumPost(id: ID!): Boolean!
    pinForumPost(id: ID!): ForumPost!
    unpinForumPost(id: ID!): ForumPost!
    markForumPostResolved(id: ID!): ForumPost!
    markForumPostUnresolved(id: ID!): ForumPost!
    upvoteForumPost(id: ID!): ForumPost!
    downvoteForumPost(id: ID!): ForumPost!
    removeForumPostVote(id: ID!): ForumPost!
    
    # Forum Comment Mutations
    createForumComment(input: CreateForumCommentInput!): ForumComment!
    updateForumComment(id: ID!, input: UpdateForumCommentInput!): ForumComment!
    deleteForumComment(id: ID!): Boolean!
    markCommentAsAnswer(id: ID!): ForumComment!
    unmarkCommentAsAnswer(id: ID!): ForumComment!
    upvoteForumComment(id: ID!): ForumComment!
    downvoteForumComment(id: ID!): ForumComment!
    removeForumCommentVote(id: ID!): ForumComment!
  }
`;