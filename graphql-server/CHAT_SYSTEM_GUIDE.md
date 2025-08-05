# Chat System Implementation Guide

This guide explains how to use the comprehensive chat system that includes both real-time Socket.IO messaging and GraphQL API for message management.

## Overview

The chat system consists of two main components:

1. **Real-time Chat Server** (`chat-server.js`) - Socket.IO based real-time messaging
2. **GraphQL Message API** - RESTful message management through GraphQL

## Features

### Real-time Features (Socket.IO)
- ✅ Real-time messaging (text, images, files, voice, video)
- ✅ Message reactions and editing
- ✅ Message deletion (for self or everyone)
- ✅ Voice/Video calling with WebRTC signaling
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message delivery and read receipts
- ✅ File sharing with Firebase Storage
- ✅ Message forwarding and replies

### GraphQL API Features
- ✅ Conversation history retrieval
- ✅ Message search functionality
- ✅ Unread message management
- ✅ Message CRUD operations
- ✅ File upload support
- ✅ Message reactions
- ✅ Conversation list management

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Make sure your `.env` file includes:

```env
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
CHAT_PORT=4002
PORT=4001
```

### 3. Start the Servers

```bash
# Start GraphQL server
npm run dev

# Start Chat server (in another terminal)
npm run chat
```

## Socket.IO Real-time Chat

### Client Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4002', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to chat server');
});

socket.on('userOnline', (data) => {
  console.log('User online:', data.userId);
  console.log('All online users:', data.onlineUsers);
});

socket.on('userOffline', (data) => {
  console.log('User offline:', data.userId);
});
```

### Sending Messages

```javascript
// Send text message
socket.emit('message', {
  to: 'recipient_user_id',
  content: 'Hello, how are you?',
  type: 'text'
});

// Send file message
socket.emit('message', {
  to: 'recipient_user_id',
  content: 'Check out this file!',
  type: 'file',
  file: {
    name: 'document.pdf',
    size: 1024000,
    type: 'application/pdf',
    buffer: fileBuffer
  }
});

// Reply to a message
socket.emit('message', {
  to: 'recipient_user_id',
  content: 'This is a reply',
  type: 'text',
  replyTo: 'original_message_id'
});

// Forward a message
socket.emit('message', {
  to: 'recipient_user_id',
  content: 'Forwarded message content',
  type: 'text',
  forward: true,
  forwardFrom: 'original_sender_id'
});
```

### Receiving Messages

```javascript
socket.on('message', (message) => {
  console.log('New message:', message);
  // message structure:
  // {
  //   _id: 'message_id',
  //   sender_id: { name, email, profile_picture },
  //   receiver_id: { name, email, profile_picture },
  //   content: 'message content',
  //   message_type: 'text|image|file|voice|video',
  //   file_url: 'url_if_file',
  //   reactions: [],
  //   reply_to: message_object_if_reply,
  //   forwarded: boolean,
  //   createdAt: timestamp
  // }
});

socket.on('messageSent', (message) => {
  console.log('Message sent successfully:', message);
});
```

### Message Reactions

```javascript
// Add reaction
socket.emit('react', {
  messageId: 'message_id',
  reaction: '👍' // emoji
});

// Listen for reactions
socket.on('messageReacted', (data) => {
  console.log('Message reacted:', data);
  // { messageId, reaction, userId }
});
```

### Message Editing and Deletion

```javascript
// Edit message
socket.emit('editMessage', {
  messageId: 'message_id',
  newContent: 'Updated message content'
});

// Delete message
socket.emit('deleteMessage', {
  messageId: 'message_id',
  forEveryone: false // true to delete for everyone
});

// Listen for edits/deletions
socket.on('messageEdited', (data) => {
  console.log('Message edited:', data);
});

socket.on('messageDeleted', (data) => {
  console.log('Message deleted:', data);
});
```

### Typing Indicators

```javascript
// Start typing
socket.emit('typing', { to: 'recipient_user_id' });

// Stop typing
socket.emit('stopTyping', { to: 'recipient_user_id' });

// Listen for typing
socket.on('userTyping', (data) => {
  console.log('User is typing:', data.userId);
});

socket.on('userStoppedTyping', (data) => {
  console.log('User stopped typing:', data.userId);
});
```

### Voice/Video Calls

```javascript
// Initiate call
socket.emit('callUser', {
  to: 'recipient_user_id',
  signalData: webrtcSignalData,
  callType: 'voice' // or 'video'
});

// Answer call
socket.emit('answerCall', {
  to: 'caller_user_id',
  signalData: webrtcSignalData
});

// Reject call
socket.emit('rejectCall', { to: 'caller_user_id' });

// End call
socket.emit('endCall', { to: 'other_user_id' });

// Listen for call events
socket.on('incomingCall', (data) => {
  console.log('Incoming call from:', data.from);
});

socket.on('callAccepted', (signalData) => {
  console.log('Call accepted');
});

socket.on('callRejected', () => {
  console.log('Call rejected');
});

socket.on('callEnded', () => {
  console.log('Call ended');
});
```

### Get Conversation History

```javascript
socket.emit('getConversation', {
  with_user_id: 'other_user_id',
  page: 1,
  limit: 20
});

socket.on('conversationHistory', (data) => {
  console.log('Conversation history:', data);
  // {
  //   with: 'user_id',
  //   messages: [...],
  //   page: 1,
  //   limit: 20
  // }
});
```

## GraphQL Message API

### Queries

#### Get Conversation History

```graphql
query GetConversation($withUserId: ID!, $page: Int, $limit: Int) {
  conversation(with_user_id: $withUserId, page: $page, limit: $limit) {
    id
    content
    message_type
    file_url
    file_name
    createdAt
    sender_id {
      id
      name
      profile_picture
    }
    receiver_id {
      id
      name
      profile_picture
    }
    reactions {
      reaction
      user_id {
        id
        name
        profile_picture
      }
      created_at
    }
    reply_to {
      id
      content
      sender_id {
        name
      }
    }
    forwarded
    forwarded_from {
      id
      name
    }
    read
    delivered
    edited
  }
}
```

#### Get All Conversations

```graphql
query GetConversations {
  conversations {
    total
    conversations {
      with_user {
        id
        name
        profile_picture
      }
      unread_count
      last_message {
        id
        content
        message_type
        createdAt
        sender_id {
          name
        }
      }
    }
  }
}
```

#### Get Unread Messages

```graphql
query GetUnreadMessages {
  unreadMessageCount
  unreadMessages {
    id
    content
    message_type
    createdAt
    sender_id {
      id
      name
      profile_picture
    }
  }
}
```

#### Search Messages

```graphql
query SearchMessages($query: String!, $withUserId: ID) {
  searchMessages(query: $query, with_user_id: $withUserId) {
    id
    content
    message_type
    createdAt
    sender_id {
      id
      name
      profile_picture
    }
    receiver_id {
      id
      name
      profile_picture
    }
  }
}
```

### Mutations

#### Send Message

```graphql
mutation SendMessage($messageInput: MessageInput!) {
  sendMessage(messageInput: $messageInput) {
    id
    content
    message_type
    file_url
    createdAt
    sender_id {
      id
      name
      profile_picture
    }
    receiver_id {
      id
      name
      profile_picture
    }
  }
}
```

Variables:
```json
{
  "messageInput": {
    "receiver_id": "recipient_user_id",
    "content": "Hello from GraphQL!",
    "message_type": "text"
  }
}
```

#### Send Message with File

```graphql
mutation SendMessageWithFile($messageInput: MessageInput!) {
  sendMessage(messageInput: $messageInput) {
    id
    content
    message_type
    file_url
    file_name
    file_size
    createdAt
    sender_id {
      name
    }
    receiver_id {
      name
    }
  }
}
```

#### Mark Messages as Read

```graphql
mutation MarkMessagesAsRead($withUserId: ID!) {
  markMessagesAsRead(with_user_id: $withUserId)
}
```

#### Edit Message

```graphql
mutation EditMessage($messageId: ID!, $newContent: String!) {
  editMessage(message_id: $messageId, new_content: $newContent) {
    id
    content
    edited
    edited_at
  }
}
```

#### Delete Message

```graphql
mutation DeleteMessage($messageId: ID!, $forEveryone: Boolean) {
  deleteMessage(message_id: $messageId, for_everyone: $forEveryone)
}
```

#### React to Message

```graphql
mutation ReactToMessage($reactionInput: MessageReactionInput!) {
  reactToMessage(reactionInput: $reactionInput) {
    id
    reactions {
      reaction
      user_id {
        id
        name
        profile_picture
      }
      created_at
    }
  }
}
```

Variables:
```json
{
  "reactionInput": {
    "message_id": "message_id",
    "reaction": "👍"
  }
}
```

#### Forward Message

```graphql
mutation ForwardMessage($messageId: ID!, $toUserIds: [ID!]!) {
  forwardMessage(message_id: $messageId, to_user_ids: $toUserIds) {
    id
    content
    forwarded
    forwarded_from {
      id
      name
    }
    receiver_id {
      id
      name
    }
  }
}
```

## Flutter Integration Example

### Socket.IO Client Setup

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChatService {
  late IO.Socket socket;
  
  void connect(String token) {
    socket = IO.io('http://localhost:4002', <String, dynamic>{
      'transports': ['websocket'],
      'auth': {'token': token}
    });
    
    socket.on('connect', (_) {
      print('Connected to chat server');
    });
    
    socket.on('message', (data) {
      print('New message: $data');
      // Handle incoming message
    });
    
    socket.on('userOnline', (data) {
      print('User online: ${data['userId']}');
    });
  }
  
  void sendMessage(String to, String content, {String type = 'text'}) {
    socket.emit('message', {
      'to': to,
      'content': content,
      'type': type
    });
  }
  
  void disconnect() {
    socket.disconnect();
  }
}
```

### GraphQL Client Setup

```dart
import 'package:graphql_flutter/graphql_flutter.dart';

class MessageGraphQLService {
  static const String _getConversationQuery = '''
    query GetConversation(\$withUserId: ID!, \$page: Int, \$limit: Int) {
      conversation(with_user_id: \$withUserId, page: \$page, limit: \$limit) {
        id
        content
        message_type
        file_url
        createdAt
        sender_id {
          id
          name
          profile_picture
        }
        receiver_id {
          id
          name
          profile_picture
        }
        read
        delivered
      }
    }
  ''';
  
  static Future<List<Message>?> getConversation(
    GraphQLClient client,
    String withUserId, {
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final QueryOptions options = QueryOptions(
        document: gql(_getConversationQuery),
        variables: {
          'withUserId': withUserId,
          'page': page,
          'limit': limit,
        },
      );

      final QueryResult result = await client.query(options);

      if (result.hasException) {
        print('GraphQL Error: ${result.exception.toString()}');
        return null;
      }

      if (result.data != null && result.data!['conversation'] != null) {
        final List<dynamic> messagesJson = result.data!['conversation'];
        return messagesJson.map((json) => Message.fromJson(json)).toList();
      }

      return [];
    } catch (e) {
      print('Error fetching conversation: $e');
      return null;
    }
  }
}
```

## Security Considerations

1. **Authentication**: All Socket.IO connections and GraphQL requests require valid JWT tokens
2. **Authorization**: Users can only access their own conversations and messages
3. **File Upload**: Files are uploaded to Firebase Storage with proper access controls
4. **Rate Limiting**: Consider implementing rate limiting for message sending
5. **Input Validation**: All message content is validated before storage

## Performance Tips

1. **Pagination**: Use pagination for conversation history to avoid loading too many messages
2. **Caching**: Implement client-side caching for frequently accessed conversations
3. **Connection Management**: Properly handle Socket.IO connection lifecycle
4. **File Optimization**: Compress images and files before uploading
5. **Database Indexing**: The message model includes proper indexes for performance

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if chat server is running on correct port
2. **Authentication Error**: Verify JWT token is valid and not expired
3. **File Upload Failed**: Check Firebase Storage configuration and permissions
4. **Messages Not Delivering**: Ensure recipient is online or check database connection

### Debug Mode

Enable debug logging:

```javascript
// Client side
const socket = io('http://localhost:4002', {
  auth: { token: 'your_token' },
  debug: true
});

// Server side - add to chat-server.js
console.log('Debug: Message received', messageData);
```

## API Endpoints Summary

- **GraphQL Server**: `http://localhost:4001/graphql`
- **Chat Server**: `http://localhost:4002`
- **File Uploads**: Handled through GraphQL mutations or Socket.IO events
- **Static Files**: `http://localhost:4001/uploads/`

This comprehensive chat system provides both real-time messaging capabilities and a robust API for message management, making it suitable for modern chat applications with rich features.