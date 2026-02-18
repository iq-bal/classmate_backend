# Group Chat Documentation 👥💬

## Current Status: ❌ Not Implemented

The chat server currently **does not support group chat functionality**. The existing system is designed for **one-on-one conversations** between two users only.

## 🔍 Current Architecture Analysis

The existing chat system has the following limitations for group chat:

### Message Schema
```javascript
{
  sender_id: ObjectId,     // Single sender
  receiver_id: ObjectId,   // Single receiver only
  content: String,
  message_type: String,
  // ... other fields
}
```

### Socket.IO Events
- All events are designed for two-user conversations
- `message` event sends to one recipient
- `getConversation` retrieves messages between two users
- No group management events

### GraphQL Schema
- `conversation` query works with `with_user_id` (single user)
- No group-related types or mutations
- User conversations are one-to-one only

## 🚀 Implementation Plan for Group Chat

To add group chat functionality, the following changes would be required:

### 1. Database Schema Changes

#### New Group Model
```javascript
// group.model.js
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatar: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joined_at: { type: Date, default: Date.now }
  }],
  settings: {
    only_admins_can_send: { type: Boolean, default: false },
    only_admins_can_add_members: { type: Boolean, default: true }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
```

#### Updated Message Model
```javascript
// message.model.js - Updated
const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Either receiver_id OR group_id (not both)
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  
  content: { type: String, required: true },
  message_type: { type: String, enum: ['text', 'image', 'file', 'voice', 'video'], default: 'text' },
  
  // Group-specific fields
  read_by: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read_at: { type: Date }
  }],
  
  // ... existing fields
});
```

### 2. GraphQL Schema Extensions

```graphql
# New Types
type Group {
  id: ID!
  name: String!
  description: String
  avatar: String
  created_by: User!
  members: [GroupMember!]!
  settings: GroupSettings!
  created_at: Date!
  updated_at: Date!
}

type GroupMember {
  user_id: User!
  role: GroupRole!
  joined_at: Date!
}

enum GroupRole {
  ADMIN
  MEMBER
}

type GroupSettings {
  only_admins_can_send: Boolean!
  only_admins_can_add_members: Boolean!
}

# Updated Message Type
type Message {
  id: ID!
  sender_id: User!
  receiver_id: User      # Optional for group messages
  group_id: Group        # Optional for direct messages
  content: String!
  message_type: MessageType!
  read_by: [MessageReadStatus!]  # For group messages
  # ... existing fields
}

type MessageReadStatus {
  user_id: User!
  read_at: Date!
}

# New Queries
extend type Query {
  groups: [Group!]!                    # Get user's groups
  group(id: ID!): Group                # Get specific group
  groupMessages(groupId: ID!, page: Int, limit: Int): [Message!]!
}

# New Mutations
extend type Mutation {
  createGroup(input: CreateGroupInput!): Group!
  updateGroup(id: ID!, input: UpdateGroupInput!): Group!
  deleteGroup(id: ID!): Boolean!
  addGroupMember(groupId: ID!, userId: ID!): Group!
  removeGroupMember(groupId: ID!, userId: ID!): Group!
  leaveGroup(groupId: ID!): Boolean!
  updateMemberRole(groupId: ID!, userId: ID!, role: GroupRole!): Group!
}

input CreateGroupInput {
  name: String!
  description: String
  memberIds: [ID!]!
}

input UpdateGroupInput {
  name: String
  description: String
  avatar: String
  settings: GroupSettingsInput
}

input GroupSettingsInput {
  only_admins_can_send: Boolean
  only_admins_can_add_members: Boolean
}
```

### 3. Socket.IO Events for Group Chat

```javascript
// New Socket.IO events needed

// Group Management
socket.emit('createGroup', {
  name: 'Group Name',
  description: 'Group Description',
  memberIds: ['user1', 'user2', 'user3']
});

socket.emit('joinGroup', { groupId: 'group_id' });
socket.emit('leaveGroup', { groupId: 'group_id' });

// Group Messaging
socket.emit('groupMessage', {
  groupId: 'group_id',
  content: 'Hello everyone!',
  type: 'text'
});

// Group Events
socket.on('groupMessage', (message) => {
  // Handle incoming group message
});

socket.on('groupCreated', (group) => {
  // Handle new group creation
});

socket.on('memberAdded', (data) => {
  // Handle new member addition
});

socket.on('memberLeft', (data) => {
  // Handle member leaving
});

socket.on('groupUpdated', (group) => {
  // Handle group settings update
});
```

### 4. Service Layer Implementation

```javascript
// group.service.js
export const createGroup = async (creatorId, groupData) => {
  // Create new group with creator as admin
};

export const addGroupMember = async (groupId, userId, addedBy) => {
  // Add member to group (check permissions)
};

export const sendGroupMessage = async (senderId, groupId, messageData) => {
  // Send message to all group members
};

export const getGroupMessages = async (groupId, userId, page, limit) => {
  // Get group conversation history
};

// message.service.js - Updated
export const sendMessage = async (senderId, messageData) => {
  // Handle both direct and group messages
  if (messageData.groupId) {
    return await sendGroupMessage(senderId, messageData.groupId, messageData);
  } else {
    return await sendDirectMessage(senderId, messageData.receiverId, messageData);
  }
};
```

### 5. Frontend Implementation Examples

#### React/JavaScript
```javascript
// Group Chat Component
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function GroupChat({ groupId, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);

  useEffect(() => {
    // Join group room
    socket.emit('joinGroup', { groupId });

    // Listen for group messages
    socket.on('groupMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for group updates
    socket.on('groupUpdated', (group) => {
      setGroupInfo(group);
    });

    return () => {
      socket.emit('leaveGroup', { groupId });
      socket.off('groupMessage');
      socket.off('groupUpdated');
    };
  }, [groupId]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('groupMessage', {
        groupId,
        content: newMessage,
        type: 'text'
      });
      setNewMessage('');
    }
  };

  return (
    <div className="group-chat">
      <div className="group-header">
        <h3>{groupInfo?.name}</h3>
        <span>{groupInfo?.members?.length} members</span>
      </div>
      
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.sender_id.name}:</strong>
            <span>{message.content}</span>
          </div>
        ))}
      </div>
      
      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

#### Flutter/Dart
```dart
// Group Chat Service
class GroupChatService {
  late IO.Socket socket;
  
  void joinGroup(String groupId) {
    socket.emit('joinGroup', {'groupId': groupId});
  }
  
  void sendGroupMessage(String groupId, String content) {
    socket.emit('groupMessage', {
      'groupId': groupId,
      'content': content,
      'type': 'text'
    });
  }
  
  void listenForGroupMessages(Function(Map<String, dynamic>) onMessage) {
    socket.on('groupMessage', (data) {
      onMessage(data);
    });
  }
  
  void createGroup(String name, List<String> memberIds) {
    socket.emit('createGroup', {
      'name': name,
      'memberIds': memberIds
    });
  }
}
```

## 🔧 Implementation Steps

1. **Phase 1: Database Schema**
   - Create Group model
   - Update Message model
   - Add migration scripts

2. **Phase 2: Backend Services**
   - Implement group service functions
   - Update message service for group support
   - Add group-related GraphQL resolvers

3. **Phase 3: Socket.IO Integration**
   - Add group management events
   - Update message broadcasting for groups
   - Implement group rooms

4. **Phase 4: Frontend Integration**
   - Create group chat UI components
   - Update message handling logic
   - Add group management features

5. **Phase 5: Advanced Features**
   - Message read receipts for groups
   - Group admin controls
   - File sharing in groups
   - Group notifications

## 🎯 Key Features to Implement

### Core Features
- ✅ Create/delete groups
- ✅ Add/remove members
- ✅ Send group messages
- ✅ Group message history
- ✅ Member role management

### Advanced Features
- ✅ Group settings (admin-only messaging, etc.)
- ✅ Message read receipts
- ✅ Group file sharing
- ✅ Group voice/video calls
- ✅ Group message reactions
- ✅ Group message search
- ✅ Group notifications

## 🔒 Security Considerations

1. **Permission Checks**
   - Verify user is group member before allowing actions
   - Check admin permissions for management actions
   - Validate group existence before operations

2. **Rate Limiting**
   - Limit group creation per user
   - Limit message sending in groups
   - Prevent spam member additions

3. **Data Validation**
   - Validate group names and descriptions
   - Check member limits
   - Sanitize group content

## 📊 Estimated Development Time

- **Backend Implementation**: 2-3 weeks
- **Frontend Integration**: 1-2 weeks
- **Testing & Debugging**: 1 week
- **Advanced Features**: 2-3 weeks

**Total Estimated Time**: 6-9 weeks

## 🚀 Getting Started

To implement group chat functionality:

1. Start with the database schema changes
2. Implement basic group CRUD operations
3. Add Socket.IO group events
4. Create frontend group management UI
5. Implement group messaging
6. Add advanced features incrementally

## 📝 Conclusion

While group chat is not currently supported, the existing architecture provides a solid foundation for implementation. The one-on-one chat system would need significant extensions to support multiple participants, group management, and group-specific features.

The implementation would require changes across all layers: database, backend services, Socket.IO events, GraphQL schema, and frontend components. However, the existing patterns and infrastructure make this a feasible addition to the chat system.

---

**Status**: 🔴 Not Implemented  
**Priority**: High for multi-user chat applications  
**Complexity**: Medium to High  
**Dependencies**: Database migration, API changes, Frontend updates