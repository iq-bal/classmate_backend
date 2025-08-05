# Message Deletion Documentation 🗑️💬

The chat server provides comprehensive message deletion functionality, allowing users to delete individual messages or entire conversations using both Socket.IO and GraphQL implementations.

## 🎯 Features

- ✅ **Individual message deletion** via Socket.IO and GraphQL
- ✅ **Delete for self only** - message hidden from your view
- ✅ **Delete for everyone** - message removed completely (sender only)
- ✅ **Conversation deletion** - delete entire chat history
- ✅ **Real-time notifications** to all participants
- ✅ **File cleanup** - automatic file deletion when message is deleted for everyone
- ✅ **Soft deletion** - messages marked as deleted for specific users
- ✅ **Permission control** - only senders can delete for everyone

## 📊 Data Structure

### Message Deletion Fields
```javascript
{
  deleted_for: [{
    user_id: ObjectId,     // User who deleted the message
    deleted_at: Date       // When the message was deleted
  }],
  edited: Boolean,         // Whether message was edited
  edited_at: Date         // When message was last edited
}
```

### Deletion Types
1. **Delete for Me**: Message hidden from your view only
2. **Delete for Everyone**: Message completely removed (sender only)
3. **Delete Conversation**: All messages between two users removed

## 🔌 Socket.IO Implementation

### Delete Individual Message

**Client Side:**
```javascript
// Delete message for yourself only
socket.emit('deleteMessage', {
  messageId: 'message_id_here',
  forEveryone: false
});

// Delete message for everyone (sender only)
socket.emit('deleteMessage', {
  messageId: 'message_id_here',
  forEveryone: true
});
```

**Server Response:**
```javascript
// Listen for deletion confirmations
socket.on('messageDeleted', (data) => {
  console.log('Message deleted:', data);
  // {
  //   messageId: 'message_id_here',
  //   forEveryone: true/false
  // }
});

// Handle errors
socket.on('error', (error) => {
  console.error('Deletion failed:', error.message);
});
```

### Delete Entire Conversation

**Client Side:**
```javascript
// Delete entire conversation with a user
socket.emit('deleteConversation', {
  with_user_id: 'user_id_here'
});
```

**Server Response:**
```javascript
// Listen for conversation deletion confirmations
socket.on('conversationDeleted', (data) => {
  console.log('Conversation deleted:', data);
  // {
  //   with_user_id: 'user_id_here',
  //   deletedCount: 25,
  //   success: true
  // }
});
```

### JavaScript/React Implementation

```javascript
import io from 'socket.io-client';

class MessageDeletion {
  constructor(socket) {
    this.socket = socket;
    this.setupListeners();
  }

  // Delete individual message
  deleteMessage(messageId, forEveryone = false) {
    this.socket.emit('deleteMessage', {
      messageId: messageId,
      forEveryone: forEveryone
    });
  }

  // Delete entire conversation
  deleteConversation(withUserId) {
    this.socket.emit('deleteConversation', {
      with_user_id: withUserId
    });
  }

  // Setup event listeners
  setupListeners() {
    this.socket.on('messageDeleted', (data) => {
      this.handleMessageDeleted(data);
    });

    this.socket.on('conversationDeleted', (data) => {
      this.handleConversationDeleted(data);
    });

    this.socket.on('error', (error) => {
      console.error('Deletion error:', error.message);
    });
  }

  // Handle message deletion in UI
  handleMessageDeleted(data) {
    const messageElement = document.getElementById(`message-${data.messageId}`);
    if (messageElement) {
      if (data.forEveryone) {
        // Remove message completely
        messageElement.remove();
      } else {
        // Show "Message deleted" placeholder
        messageElement.innerHTML = '<div class="deleted-message">🗑️ Message deleted</div>';
      }
    }
  }

  // Handle conversation deletion in UI
  handleConversationDeleted(data) {
    const conversationElement = document.getElementById(`conversation-${data.with_user_id}`);
    if (conversationElement) {
      // Clear all messages in conversation
      const messagesContainer = conversationElement.querySelector('.messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = '<div class="empty-conversation">No messages</div>';
      }
    }
    
    // Show success notification
    this.showNotification(`Conversation deleted (${data.deletedCount} messages)`);
  }

  // Show notification
  showNotification(message) {
    // Implementation depends on your notification system
    console.log('Notification:', message);
  }
}

// Usage
const socket = io('http://localhost:4002', {
  auth: { token: 'your_jwt_token' }
});

const messageDeletion = new MessageDeletion(socket);

// Delete a message for yourself only
messageDeletion.deleteMessage('675c123456789abcdef12345', false);

// Delete a message for everyone (if you're the sender)
messageDeletion.deleteMessage('675c123456789abcdef12345', true);

// Delete entire conversation
messageDeletion.deleteConversation('675c123456789abcdef67890');
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const MessageWithDeletion = ({ message, currentUserId, socket }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const isMyMessage = message.sender_id.id === currentUserId;
  const isDeletedForMe = message.deleted_for?.some(d => d.user_id === currentUserId);

  useEffect(() => {
    socket.on('messageDeleted', (data) => {
      if (data.messageId === message.id) {
        if (data.forEveryone) {
          setIsDeleted(true);
        } else {
          // Check if current user deleted it
          setIsDeleted(true);
        }
      }
    });

    return () => {
      socket.off('messageDeleted');
    };
  }, [message.id]);

  const handleDeleteForMe = () => {
    socket.emit('deleteMessage', {
      messageId: message.id,
      forEveryone: false
    });
    setShowDeleteMenu(false);
  };

  const handleDeleteForEveryone = () => {
    if (window.confirm('Delete this message for everyone?')) {
      socket.emit('deleteMessage', {
        messageId: message.id,
        forEveryone: true
      });
    }
    setShowDeleteMenu(false);
  };

  if (isDeleted || isDeletedForMe) {
    return (
      <div className="message deleted">
        <div className="deleted-placeholder">
          🗑️ Message deleted
        </div>
      </div>
    );
  }

  return (
    <div className="message">
      <div className="message-content">{message.content}</div>
      
      {/* Delete menu */}
      <div className="message-actions">
        <button 
          className="delete-button"
          onClick={() => setShowDeleteMenu(!showDeleteMenu)}
        >
          ⋮
        </button>
        
        {showDeleteMenu && (
          <div className="delete-menu">
            <button onClick={handleDeleteForMe}>
              Delete for me
            </button>
            {isMyMessage && (
              <button onClick={handleDeleteForEveryone}>
                Delete for everyone
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationWithDeletion = ({ conversation, currentUserId, socket }) => {
  const [messages, setMessages] = useState(conversation.messages);

  const handleDeleteConversation = () => {
    if (window.confirm('Delete entire conversation? This cannot be undone.')) {
      socket.emit('deleteConversation', {
        with_user_id: conversation.with_user.id
      });
    }
  };

  useEffect(() => {
    socket.on('conversationDeleted', (data) => {
      if (data.with_user_id === conversation.with_user.id) {
        setMessages([]);
      }
    });

    return () => {
      socket.off('conversationDeleted');
    };
  }, [conversation.with_user.id]);

  return (
    <div className="conversation">
      <div className="conversation-header">
        <h3>{conversation.with_user.name}</h3>
        <button 
          className="delete-conversation-button"
          onClick={handleDeleteConversation}
        >
          🗑️ Delete Conversation
        </button>
      </div>
      
      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-conversation">No messages</div>
        ) : (
          messages.map(message => (
            <MessageWithDeletion
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              socket={socket}
            />
          ))
        )}
      </div>
    </div>
  );
};

export { MessageWithDeletion, ConversationWithDeletion };
```

### Flutter/Dart Implementation

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class MessageDeletionService {
  late IO.Socket socket;
  
  MessageDeletionService(this.socket) {
    _setupListeners();
  }

  // Delete individual message
  void deleteMessage(String messageId, {bool forEveryone = false}) {
    socket.emit('deleteMessage', {
      'messageId': messageId,
      'forEveryone': forEveryone
    });
  }

  // Delete entire conversation
  void deleteConversation(String withUserId) {
    socket.emit('deleteConversation', {
      'with_user_id': withUserId
    });
  }

  // Setup event listeners
  void _setupListeners() {
    socket.on('messageDeleted', (data) {
      print('Message deleted: $data');
      _handleMessageDeleted(data);
    });

    socket.on('conversationDeleted', (data) {
      print('Conversation deleted: $data');
      _handleConversationDeleted(data);
    });

    socket.on('error', (error) {
      print('Deletion error: ${error['message']}');
    });
  }

  void _handleMessageDeleted(dynamic data) {
    // Update UI - remove or mark message as deleted
    // This would typically update a state management solution
  }

  void _handleConversationDeleted(dynamic data) {
    // Update UI - clear conversation messages
    // Show success notification
  }
}

// Usage in Flutter widget
class MessageWidget extends StatefulWidget {
  final Message message;
  final String currentUserId;
  final MessageDeletionService deletionService;

  const MessageWidget({
    Key? key,
    required this.message,
    required this.currentUserId,
    required this.deletionService,
  }) : super(key: key);

  @override
  _MessageWidgetState createState() => _MessageWidgetState();
}

class _MessageWidgetState extends State<MessageWidget> {
  bool isDeleted = false;
  bool showDeleteMenu = false;

  @override
  void initState() {
    super.initState();
    // Check if message is already deleted for current user
    isDeleted = widget.message.deletedFor.any(
      (deletion) => deletion.userId == widget.currentUserId
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isDeleted) {
      return Container(
        padding: EdgeInsets.all(8),
        child: Row(
          children: [
            Icon(Icons.delete, color: Colors.grey),
            SizedBox(width: 8),
            Text(
              'Message deleted',
              style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      );
    }

    bool isMyMessage = widget.message.senderId == widget.currentUserId;

    return Container(
      padding: EdgeInsets.all(12),
      margin: EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: isMyMessage ? Colors.blue[100] : Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Message content
          Text(widget.message.content),
          
          // Delete options
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              PopupMenuButton<String>(
                icon: Icon(Icons.more_vert, size: 16),
                onSelected: (value) {
                  switch (value) {
                    case 'delete_for_me':
                      _showDeleteConfirmation(false);
                      break;
                    case 'delete_for_everyone':
                      if (isMyMessage) {
                        _showDeleteConfirmation(true);
                      }
                      break;
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'delete_for_me',
                    child: Text('Delete for me'),
                  ),
                  if (isMyMessage)
                    PopupMenuItem(
                      value: 'delete_for_everyone',
                      child: Text('Delete for everyone'),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirmation(bool forEveryone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete Message'),
        content: Text(
          forEveryone 
            ? 'Delete this message for everyone?' 
            : 'Delete this message for you?'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              widget.deletionService.deleteMessage(
                widget.message.id,
                forEveryone: forEveryone,
              );
              setState(() {
                isDeleted = true;
              });
              Navigator.pop(context);
            },
            child: Text('Delete'),
          ),
        ],
      ),
    );
  }
}

// Conversation deletion widget
class ConversationHeader extends StatelessWidget {
  final Conversation conversation;
  final MessageDeletionService deletionService;

  const ConversationHeader({
    Key? key,
    required this.conversation,
    required this.deletionService,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(conversation.withUser.name),
      actions: [
        PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'delete_conversation') {
              _showDeleteConversationDialog(context);
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'delete_conversation',
              child: Row(
                children: [
                  Icon(Icons.delete, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Delete Conversation'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showDeleteConversationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete Conversation'),
        content: Text(
          'Delete entire conversation with ${conversation.withUser.name}? This cannot be undone.'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              deletionService.deleteConversation(conversation.withUser.id);
              Navigator.pop(context);
              // Navigate back or clear messages
            },
            child: Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
```

## 🔗 GraphQL Implementation

### Delete Individual Message

```graphql
mutation DeleteMessage($messageId: ID!, $forEveryone: Boolean) {
  deleteMessage(message_id: $messageId, for_everyone: $forEveryone)
}
```

**Variables:**
```json
{
  "messageId": "675c123456789abcdef12345",
  "forEveryone": false
}
```

### Delete Entire Conversation

```graphql
mutation DeleteConversation($withUserId: ID!) {
  deleteConversation(with_user_id: $withUserId)
}
```

**Variables:**
```json
{
  "withUserId": "675c123456789abcdef67890"
}
```

### JavaScript/Apollo Client Example

```javascript
import { gql, useMutation } from '@apollo/client';

const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!, $forEveryone: Boolean) {
    deleteMessage(message_id: $messageId, for_everyone: $forEveryone)
  }
`;

const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($withUserId: ID!) {
    deleteConversation(with_user_id: $withUserId)
  }
`;

function MessageDeletion({ message, conversationUserId }) {
  const [deleteMessage] = useMutation(DELETE_MESSAGE);
  const [deleteConversation] = useMutation(DELETE_CONVERSATION);

  const handleDeleteMessage = async (forEveryone = false) => {
    try {
      const { data } = await deleteMessage({
        variables: {
          messageId: message.id,
          forEveryone: forEveryone
        }
      });
      
      if (data.deleteMessage) {
        console.log('Message deleted successfully');
        // Update UI - remove message or show deleted placeholder
      }
    } catch (error) {
      console.error('Failed to delete message:', error.message);
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm('Delete entire conversation? This cannot be undone.')) {
      return;
    }

    try {
      const { data } = await deleteConversation({
        variables: {
          withUserId: conversationUserId
        }
      });
      
      if (data.deleteConversation) {
        console.log('Conversation deleted successfully');
        // Update UI - clear conversation or navigate away
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error.message);
    }
  };

  return (
    <div className="message-deletion">
      {/* Message deletion buttons */}
      <button onClick={() => handleDeleteMessage(false)}>
        Delete for me
      </button>
      
      {message.senderId === currentUserId && (
        <button onClick={() => handleDeleteMessage(true)}>
          Delete for everyone
        </button>
      )}
      
      {/* Conversation deletion button */}
      <button 
        onClick={handleDeleteConversation}
        className="delete-conversation-btn"
      >
        Delete Conversation
      </button>
    </div>
  );
}

export default MessageDeletion;
```

### Flutter/GraphQL Example

```dart
import 'package:graphql_flutter/graphql_flutter.dart';

class MessageDeletionGraphQL {
  static const String deleteMessageMutation = '''
    mutation DeleteMessage(\$messageId: ID!, \$forEveryone: Boolean) {
      deleteMessage(message_id: \$messageId, for_everyone: \$forEveryone)
    }
  ''';

  static const String deleteConversationMutation = '''
    mutation DeleteConversation(\$withUserId: ID!) {
      deleteConversation(with_user_id: \$withUserId)
    }
  ''';

  static Future<bool> deleteMessage(
    GraphQLClient client,
    String messageId, {
    bool forEveryone = false,
  }) async {
    try {
      final MutationOptions options = MutationOptions(
        document: gql(deleteMessageMutation),
        variables: {
          'messageId': messageId,
          'forEveryone': forEveryone,
        },
      );

      final QueryResult result = await client.mutate(options);

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      return result.data?['deleteMessage'] ?? false;
    } catch (e) {
      print('Error deleting message: $e');
      throw e;
    }
  }

  static Future<bool> deleteConversation(
    GraphQLClient client,
    String withUserId,
  ) async {
    try {
      final MutationOptions options = MutationOptions(
        document: gql(deleteConversationMutation),
        variables: {
          'withUserId': withUserId,
        },
      );

      final QueryResult result = await client.mutate(options);

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      return result.data?['deleteConversation'] ?? false;
    } catch (e) {
      print('Error deleting conversation: $e');
      throw e;
    }
  }
}
```

## 🎨 UI/UX Best Practices

### CSS Styling for Deleted Messages

```css
/* Deleted message placeholder */
.deleted-message {
  background: #f5f5f5;
  color: #999;
  font-style: italic;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px dashed #ddd;
  text-align: center;
}

/* Delete menu */
.delete-menu {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}

.delete-menu button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}

.delete-menu button:hover {
  background: #f0f0f0;
}

.delete-menu button.danger {
  color: #dc3545;
}

.delete-menu button.danger:hover {
  background: #f8d7da;
}

/* Delete conversation button */
.delete-conversation-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-conversation-button:hover {
  background: #c82333;
}

/* Empty conversation state */
.empty-conversation {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-style: italic;
}
```

## 🔧 Advanced Features

### Bulk Message Deletion

```javascript
// Delete multiple messages at once
function bulkDeleteMessages(messageIds, forEveryone = false) {
  messageIds.forEach(messageId => {
    socket.emit('deleteMessage', {
      messageId: messageId,
      forEveryone: forEveryone
    });
  });
}

// Usage
const selectedMessages = ['msg1', 'msg2', 'msg3'];
bulkDeleteMessages(selectedMessages, false);
```

### Auto-delete Messages

```javascript
// Auto-delete messages after certain time
function scheduleMessageDeletion(messageId, delayMs) {
  setTimeout(() => {
    socket.emit('deleteMessage', {
      messageId: messageId,
      forEveryone: true
    });
  }, delayMs);
}

// Delete message after 24 hours
scheduleMessageDeletion('message_id', 24 * 60 * 60 * 1000);
```

### Deletion Analytics

```javascript
// Track deletion statistics
function trackDeletionStats() {
  let deletionStats = {
    deletedForMe: 0,
    deletedForEveryone: 0,
    conversationsDeleted: 0
  };

  socket.on('messageDeleted', (data) => {
    if (data.forEveryone) {
      deletionStats.deletedForEveryone++;
    } else {
      deletionStats.deletedForMe++;
    }
  });

  socket.on('conversationDeleted', (data) => {
    deletionStats.conversationsDeleted++;
  });

  return deletionStats;
}
```

## 🛡️ Security & Permissions

### Permission Rules

1. **Delete for Me**: Any user can delete any message from their view
2. **Delete for Everyone**: Only the message sender can delete for everyone
3. **File Cleanup**: Files are automatically deleted when message is deleted for everyone
4. **Conversation Deletion**: Any participant can delete the entire conversation

### Error Handling

```javascript
// Comprehensive error handling
socket.on('error', (error) => {
  switch (error.code) {
    case 'MESSAGE_NOT_FOUND':
      showError('Message not found or already deleted');
      break;
    case 'PERMISSION_DENIED':
      showError('You can only delete your own messages for everyone');
      break;
    case 'CONVERSATION_NOT_FOUND':
      showError('Conversation not found');
      break;
    default:
      showError('Failed to delete message');
  }
});
```

## 📱 Platform Support

- ✅ **Web browsers** (Chrome, Firefox, Safari, Edge)
- ✅ **React Native** (iOS & Android)
- ✅ **Flutter** (iOS & Android)
- ✅ **Node.js** applications
- ✅ **Desktop applications** (Electron)

## 🚀 Performance Tips

1. **Batch deletions** for better performance
2. **Soft delete first** - mark as deleted before actual removal
3. **Background file cleanup** - delete files asynchronously
4. **Cache deletion states** for better UX
5. **Implement undo functionality** for accidental deletions

## 🔍 Troubleshooting

### Common Issues

1. **Message not deleting**: Check user permissions and message ownership
2. **Files not cleaned up**: Verify file deletion service is running
3. **Real-time updates failing**: Check Socket.IO connection
4. **Conversation not clearing**: Ensure proper user IDs are used

### Debug Mode

```javascript
// Enable deletion debugging
const DEBUG_DELETION = true;

if (DEBUG_DELETION) {
  socket.on('messageDeleted', (data) => {
    console.log('Deletion debug:', {
      messageId: data.messageId,
      forEveryone: data.forEveryone,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('conversationDeleted', (data) => {
    console.log('Conversation deletion debug:', {
      withUserId: data.with_user_id,
      deletedCount: data.deletedCount,
      timestamp: new Date().toISOString()
    });
  });
}
```

## 📊 API Endpoints Summary

- **Socket.IO Events:**
  - `deleteMessage` - Delete individual message
  - `deleteConversation` - Delete entire conversation
  - `messageDeleted` - Message deletion notification
  - `conversationDeleted` - Conversation deletion notification

- **GraphQL Mutations:**
  - `deleteMessage` - Delete individual message
  - `deleteConversation` - Delete entire conversation

## 🔄 Real-time Behavior

1. **Message Deletion**: Both users see the deletion in real-time
2. **Conversation Deletion**: Both users are notified of the deletion
3. **File Cleanup**: Files are removed from storage automatically
4. **UI Updates**: Messages are hidden or removed from the interface immediately

The message deletion system provides comprehensive control over message and conversation management with real-time updates and proper permission handling! 🗑️✨