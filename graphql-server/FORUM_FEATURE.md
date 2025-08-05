# Course Forum Feature Documentation 📚💬

## Overview

The Course Forum feature allows users to ask questions and engage in discussions within specific courses. Students and teachers can create posts, comment on them, vote on content, and mark answers as helpful.

## Features

### Forum Posts
- ✅ **Create Posts** - Ask questions or start discussions
- ✅ **Edit/Delete Posts** - Manage your own posts
- ✅ **Pin Posts** - Teachers can pin important posts
- ✅ **Mark as Resolved** - Post authors can mark questions as resolved
- ✅ **Voting System** - Upvote/downvote posts
- ✅ **Tagging** - Add tags to categorize posts
- ✅ **Search** - Full-text search within course forums
- ✅ **View Tracking** - Track post views

### Forum Comments
- ✅ **Comment on Posts** - Reply to forum posts
- ✅ **Nested Replies** - Reply to specific comments
- ✅ **Mark as Answer** - Post authors can mark helpful answers
- ✅ **Voting System** - Upvote/downvote comments
- ✅ **Edit/Delete Comments** - Manage your own comments

## GraphQL API

### Queries

#### Get Forum Posts for a Course
```graphql
query GetForumPostsByCourse($courseId: ID!, $page: Int, $limit: Int) {
  forumPostsByCourse(course_id: $courseId, page: $page, limit: $limit) {
    id
    title
    content
    tags
    is_pinned
    is_resolved
    views
    upvote_count
    downvote_count
    comment_count
    author_id {
      id
      name
      profile_picture
    }
    createdAt
    updatedAt
  }
}
```

#### Get Single Forum Post with Comments
```graphql
query GetForumPost($id: ID!) {
  forumPost(id: $id) {
    id
    title
    content
    tags
    is_pinned
    is_resolved
    views
    upvote_count
    downvote_count
    author_id {
      id
      name
      profile_picture
    }
    comments {
      id
      content
      is_answer
      upvote_count
      downvote_count
      reply_count
      author_id {
        id
        name
        profile_picture
      }
      replies {
        id
        content
        upvote_count
        downvote_count
        author_id {
          id
          name
          profile_picture
        }
        createdAt
      }
      createdAt
    }
    createdAt
    updatedAt
  }
}
```

#### Search Forum Posts
```graphql
query SearchForumPosts($courseId: ID!, $query: String!, $page: Int, $limit: Int) {
  searchForumPosts(course_id: $courseId, query: $query, page: $page, limit: $limit) {
    id
    title
    content
    tags
    is_resolved
    upvote_count
    comment_count
    author_id {
      id
      name
    }
    createdAt
  }
}
```

#### Get Course with Forum
```graphql
query GetCourseWithForum($id: ID!) {
  course(id: $id) {
    id
    title
    course_code
    forum {
      id
      title
      content
      is_pinned
      is_resolved
      upvote_count
      comment_count
      author_id {
        id
        name
      }
      createdAt
    }
  }
}
```

### Mutations

#### Create Forum Post
```graphql
mutation CreateForumPost($input: CreateForumPostInput!) {
  createForumPost(input: $input) {
    id
    title
    content
    tags
    author_id {
      id
      name
    }
    createdAt
  }
}
```

Variables:
```json
{
  "input": {
    "course_id": "course_id_here",
    "title": "How to implement authentication?",
    "content": "I'm having trouble understanding how to implement user authentication in this project. Can someone help?",
    "tags": ["authentication", "security", "help"]
  }
}
```

#### Create Forum Comment
```graphql
mutation CreateForumComment($input: CreateForumCommentInput!) {
  createForumComment(input: $input) {
    id
    content
    author_id {
      id
      name
    }
    createdAt
  }
}
```

Variables:
```json
{
  "input": {
    "post_id": "post_id_here",
    "content": "You can use Firebase Authentication for this. Here's how...",
    "parent_comment_id": null
  }
}
```

#### Vote on Post
```graphql
mutation UpvoteForumPost($id: ID!) {
  upvoteForumPost(id: $id) {
    id
    upvote_count
    downvote_count
  }
}

mutation DownvoteForumPost($id: ID!) {
  downvoteForumPost(id: $id) {
    id
    upvote_count
    downvote_count
  }
}

mutation RemoveForumPostVote($id: ID!) {
  removeForumPostVote(id: $id) {
    id
    upvote_count
    downvote_count
  }
}
```

#### Mark Comment as Answer
```graphql
mutation MarkCommentAsAnswer($id: ID!) {
  markCommentAsAnswer(id: $id) {
    id
    is_answer
    content
    author_id {
      id
      name
    }
  }
}
```

#### Pin/Unpin Post (Teachers Only)
```graphql
mutation PinForumPost($id: ID!) {
  pinForumPost(id: $id) {
    id
    is_pinned
    title
  }
}

mutation UnpinForumPost($id: ID!) {
  unpinForumPost(id: $id) {
    id
    is_pinned
    title
  }
}
```

#### Mark Post as Resolved
```graphql
mutation MarkForumPostResolved($id: ID!) {
  markForumPostResolved(id: $id) {
    id
    is_resolved
    title
  }
}
```

## Database Schema

### ForumPost Model
```javascript
{
  course_id: ObjectId,        // Reference to Course
  author_id: ObjectId,        // Reference to User
  title: String,              // Post title
  content: String,            // Post content
  tags: [String],             // Tags for categorization
  is_pinned: Boolean,         // Pinned by teacher
  is_resolved: Boolean,       // Marked as resolved by author
  upvotes: [ObjectId],        // Users who upvoted
  downvotes: [ObjectId],      // Users who downvoted
  views: Number,              // View count
  createdAt: Date,
  updatedAt: Date
}
```

### ForumComment Model
```javascript
{
  post_id: ObjectId,          // Reference to ForumPost
  author_id: ObjectId,        // Reference to User
  content: String,            // Comment content
  parent_comment_id: ObjectId, // Reference to parent comment (for replies)
  upvotes: [ObjectId],        // Users who upvoted
  downvotes: [ObjectId],      // Users who downvoted
  is_answer: Boolean,         // Marked as answer by post author
  createdAt: Date,
  updatedAt: Date
}
```

## Permissions

### Forum Posts
- **Create**: Any authenticated user enrolled in the course
- **Edit**: Post author only
- **Delete**: Post author only
- **Pin/Unpin**: Course teacher only
- **Mark Resolved**: Post author only
- **Vote**: Any authenticated user enrolled in the course

### Forum Comments
- **Create**: Any authenticated user enrolled in the course
- **Edit**: Comment author only
- **Delete**: Comment author only
- **Mark as Answer**: Post author only
- **Vote**: Any authenticated user enrolled in the course

## Usage Examples

### Frontend Integration (React)

```javascript
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORUM_POSTS, CREATE_FORUM_POST } from './queries';

function CourseForum({ courseId }) {
  const { data, loading } = useQuery(GET_FORUM_POSTS, {
    variables: { courseId }
  });
  
  const [createPost] = useMutation(CREATE_FORUM_POST, {
    refetchQueries: [{ query: GET_FORUM_POSTS, variables: { courseId } }]
  });
  
  const handleCreatePost = async (postData) => {
    try {
      await createPost({
        variables: {
          input: {
            course_id: courseId,
            ...postData
          }
        }
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };
  
  if (loading) return <div>Loading forum...</div>;
  
  return (
    <div className="forum">
      <h2>Course Forum</h2>
      <CreatePostForm onSubmit={handleCreatePost} />
      <PostList posts={data?.forumPostsByCourse || []} />
    </div>
  );
}
```

### Mobile Integration (Flutter)

```dart
class ForumService {
  static const String _baseUrl = 'http://localhost:4001/graphql';
  
  Future<List<ForumPost>> getForumPosts(String courseId) async {
    const query = '''
      query GetForumPosts(\$courseId: ID!) {
        forumPostsByCourse(course_id: \$courseId) {
          id
          title
          content
          is_pinned
          is_resolved
          upvote_count
          comment_count
          author_id { id name }
          createdAt
        }
      }
    ''';
    
    // GraphQL request implementation
    // Return parsed ForumPost objects
  }
  
  Future<ForumPost> createForumPost(CreateForumPostInput input) async {
    const mutation = '''
      mutation CreateForumPost(\$input: CreateForumPostInput!) {
        createForumPost(input: \$input) {
          id
          title
          content
          author_id { id name }
          createdAt
        }
      }
    ''';
    
    // GraphQL mutation implementation
    // Return created ForumPost object
  }
}
```

## Best Practices

1. **Pagination**: Always use pagination for forum posts and comments
2. **Search**: Implement client-side filtering combined with server-side search
3. **Real-time Updates**: Consider implementing subscriptions for real-time forum updates
4. **Moderation**: Add moderation features for inappropriate content
5. **Notifications**: Notify users when their posts receive comments or votes
6. **Rich Text**: Support markdown or rich text formatting in posts and comments
7. **File Attachments**: Allow file attachments in forum posts
8. **Email Notifications**: Send email notifications for important forum activities

## Security Considerations

1. **Authentication**: All forum operations require user authentication
2. **Authorization**: Users can only edit/delete their own content
3. **Course Enrollment**: Verify user enrollment before allowing forum access
4. **Rate Limiting**: Implement rate limiting to prevent spam
5. **Content Validation**: Sanitize and validate all user input
6. **XSS Prevention**: Escape HTML content to prevent XSS attacks

## Future Enhancements

- [ ] Real-time notifications
- [ ] File attachments in posts
- [ ] Rich text editor support
- [ ] Forum moderation tools
- [ ] Advanced search filters
- [ ] Forum analytics and insights
- [ ] Integration with course assignments
- [ ] Mobile push notifications
- [ ] Forum export functionality
- [ ] Anonymous posting option

---

**Status**: ✅ Implemented and Ready  
**Version**: 1.0.0  
**Last Updated**: December 2024