# Message Editing Documentation ✏️💬

The chat server provides comprehensive message editing functionality, allowing users to edit their own messages in real-time using both Socket.IO and GraphQL implementations.

## 🎯 Features

- ✅ **Real-time message editing** via Socket.IO
- ✅ **GraphQL mutations** for message editing
- ✅ **Permission control** - only message senders can edit their messages
- ✅ **Edit tracking** - messages are marked as edited with timestamp
- ✅ **Real-time notifications** to all participants
- ✅ **Content validation** - ensure edited content is valid
- ✅ **Edit history** - track when messages were last edited
- ✅ **Cross-platform support** - works on web, mobile, and desktop

## 📊 Data Structure

### Message Edit Fields
```javascript
{
  content: String,         // Updated message content
  edited: Boolean,         // Whether message has been edited
  edited_at: Date,        // Timestamp of last edit
  createdAt: Date,        // Original creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

### Edit Permissions
- ✅ **Message sender** can edit their own messages
- ❌ **Message receiver** cannot edit messages from others
- ✅ **No time limit** on editing (configurable)
- ✅ **All message types** can be edited (text content only)

## 🔌 Socket.IO Implementation

### Edit Message

**Client Side:**
```javascript
// Edit a message
socket.emit('editMessage', {
  messageId: 'message_id_here',
  newContent: 'Updated message content'
});
```

**Server Response:**
```javascript
// Listen for edit confirmations
socket.on('messageEdited', (data) => {
  console.log('Message edited:', data);
  // {
  //   messageId: 'message_id_here',
  //   newContent: 'Updated message content'
  // }
});

// Handle errors
socket.on('error', (error) => {
  console.error('Edit failed:', error.message);
});
```

### JavaScript/React Implementation

```javascript
import io from 'socket.io-client';

class MessageEditor {
  constructor(socket) {
    this.socket = socket;
    this.setupListeners();
  }

  // Edit message
  editMessage(messageId, newContent) {
    if (!newContent.trim()) {
      throw new Error('Message content cannot be empty');
    }

    this.socket.emit('editMessage', {
      messageId: messageId,
      newContent: newContent.trim()
    });
  }

  // Setup event listeners
  setupListeners() {
    this.socket.on('messageEdited', (data) => {
      this.handleMessageEdited(data);
    });

    this.socket.on('error', (error) => {
      console.error('Edit error:', error.message);
      this.handleEditError(error);
    });
  }

  // Handle message edit in UI
  handleMessageEdited(data) {
    const messageElement = document.getElementById(`message-${data.messageId}`);
    if (messageElement) {
      // Update message content
      const contentElement = messageElement.querySelector('.message-content');
      if (contentElement) {
        contentElement.textContent = data.newContent;
      }

      // Add edited indicator
      this.addEditedIndicator(messageElement);
    }
  }

  // Add edited indicator to message
  addEditedIndicator(messageElement) {
    let editedIndicator = messageElement.querySelector('.edited-indicator');
    if (!editedIndicator) {
      editedIndicator = document.createElement('span');
      editedIndicator.className = 'edited-indicator';
      editedIndicator.textContent = ' (edited)';
      editedIndicator.style.fontSize = '12px';
      editedIndicator.style.color = '#666';
      editedIndicator.style.fontStyle = 'italic';
      
      const contentElement = messageElement.querySelector('.message-content');
      if (contentElement) {
        contentElement.appendChild(editedIndicator);
      }
    }
  }

  // Handle edit errors
  handleEditError(error) {
    // Show error notification
    this.showNotification(error.message, 'error');
  }

  // Show notification
  showNotification(message, type = 'info') {
    // Implementation depends on your notification system
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}

// Usage
const socket = io('http://localhost:4002', {
  auth: { token: 'your_jwt_token' }
});

const messageEditor = new MessageEditor(socket);

// Edit a message
messageEditor.editMessage('675c123456789abcdef12345', 'This is the updated content');
```

### React Component Example

```jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const EditableMessage = ({ message, currentUserId, socket }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [messageContent, setMessageContent] = useState(message.content);
  const [isEdited, setIsEdited] = useState(message.edited || false);
  const textareaRef = useRef(null);

  const isMyMessage = message.sender_id.id === currentUserId;

  useEffect(() => {
    socket.on('messageEdited', (data) => {
      if (data.messageId === message.id) {
        setMessageContent(data.newContent);
        setIsEdited(true);
        setIsEditing(false);
      }
    });

    socket.on('error', (error) => {
      console.error('Edit error:', error.message);
      setIsEditing(false);
    });

    return () => {
      socket.off('messageEdited');
      socket.off('error');
    };
  }, [message.id]);

  const handleStartEdit = () => {
    if (!isMyMessage) return;
    setIsEditing(true);
    setEditContent(messageContent);
    
    // Focus textarea after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  };

  const handleSaveEdit = () => {
    const trimmedContent = editContent.trim();
    
    if (!trimmedContent) {
      alert('Message content cannot be empty');
      return;
    }

    if (trimmedContent === messageContent) {
      setIsEditing(false);
      return;
    }

    socket.emit('editMessage', {
      messageId: message.id,
      newContent: trimmedContent
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(messageContent);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={`message ${isMyMessage ? 'my-message' : 'other-message'}`}>
      <div className="message-header">
        <span className="sender-name">{message.sender_id.name}</span>
        <span className="message-time">
          {new Date(message.createdAt).toLocaleTimeString()}
          {isEdited && <span className="edited-indicator"> (edited)</span>}
        </span>
      </div>
      
      <div className="message-body">
        {isEditing ? (
          <div className="edit-mode">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyPress}
              className="edit-textarea"
              rows={3}
              placeholder="Edit your message..."
            />
            <div className="edit-actions">
              <button 
                onClick={handleSaveEdit}
                className="save-button"
                disabled={!editContent.trim()}
              >
                Save
              </button>
              <button 
                onClick={handleCancelEdit}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
            <div className="edit-hint">
              Press Enter to save, Esc to cancel
            </div>
          </div>
        ) : (
          <div className="view-mode">
            <div className="message-content">{messageContent}</div>
            {isMyMessage && (
              <div className="message-actions">
                <button 
                  onClick={handleStartEdit}
                  className="edit-button"
                  title="Edit message"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatMessages = ({ messages, currentUserId, socket }) => {
  return (
    <div className="chat-messages">
      {messages.map(message => (
        <EditableMessage
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          socket={socket}
        />
      ))}
    </div>
  );
};

export { EditableMessage, ChatMessages };
```

### Flutter/Dart Implementation

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class MessageEditService {
  late IO.Socket socket;
  
  MessageEditService(this.socket) {
    _setupListeners();
  }

  // Edit message
  void editMessage(String messageId, String newContent) {
    if (newContent.trim().isEmpty) {
      throw Exception('Message content cannot be empty');
    }

    socket.emit('editMessage', {
      'messageId': messageId,
      'newContent': newContent.trim()
    });
  }

  // Setup event listeners
  void _setupListeners() {
    socket.on('messageEdited', (data) {
      print('Message edited: $data');
      _handleMessageEdited(data);
    });

    socket.on('error', (error) {
      print('Edit error: ${error['message']}');
      _handleEditError(error);
    });
  }

  void _handleMessageEdited(dynamic data) {
    // Update UI with edited message
    // This would typically update a state management solution
    // like Provider, Bloc, or Riverpod
  }

  void _handleEditError(dynamic error) {
    // Show error message to user
    print('Failed to edit message: ${error['message']}');
  }
}

// Usage in Flutter widget
class EditableMessageWidget extends StatefulWidget {
  final Message message;
  final String currentUserId;
  final MessageEditService editService;

  const EditableMessageWidget({
    Key? key,
    required this.message,
    required this.currentUserId,
    required this.editService,
  }) : super(key: key);

  @override
  _EditableMessageWidgetState createState() => _EditableMessageWidgetState();
}

class _EditableMessageWidgetState extends State<EditableMessageWidget> {
  bool isEditing = false;
  late TextEditingController editController;
  late FocusNode editFocusNode;
  String messageContent = '';
  bool isEdited = false;

  @override
  void initState() {
    super.initState();
    messageContent = widget.message.content;
    isEdited = widget.message.edited;
    editController = TextEditingController(text: messageContent);
    editFocusNode = FocusNode();
  }

  @override
  void dispose() {
    editController.dispose();
    editFocusNode.dispose();
    super.dispose();
  }

  bool get isMyMessage => widget.message.senderId == widget.currentUserId;

  void _startEdit() {
    if (!isMyMessage) return;
    
    setState(() {
      isEditing = true;
      editController.text = messageContent;
    });
    
    // Focus and select all text
    WidgetsBinding.instance.addPostFrameCallback((_) {
      editFocusNode.requestFocus();
      editController.selection = TextSelection(
        baseOffset: 0,
        extentOffset: editController.text.length,
      );
    });
  }

  void _saveEdit() {
    final trimmedContent = editController.text.trim();
    
    if (trimmedContent.isEmpty) {
      _showError('Message content cannot be empty');
      return;
    }

    if (trimmedContent == messageContent) {
      _cancelEdit();
      return;
    }

    try {
      widget.editService.editMessage(widget.message.id, trimmedContent);
      setState(() {
        messageContent = trimmedContent;
        isEdited = true;
        isEditing = false;
      });
    } catch (e) {
      _showError(e.toString());
    }
  }

  void _cancelEdit() {
    setState(() {
      isEditing = false;
      editController.text = messageContent;
    });
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: Row(
        mainAxisAlignment: isMyMessage 
          ? MainAxisAlignment.end 
          : MainAxisAlignment.start,
        children: [
          Flexible(
            child: Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isMyMessage ? Colors.blue[100] : Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Message header
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        widget.message.senderName,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      SizedBox(width: 8),
                      Text(
                        _formatTime(widget.message.createdAt),
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey[600],
                        ),
                      ),
                      if (isEdited)
                        Text(
                          ' (edited)',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.grey[600],
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 4),
                  
                  // Message content
                  if (isEditing) ..._buildEditMode() else ..._buildViewMode(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildViewMode() {
    return [
      Row(
        children: [
          Expanded(
            child: Text(
              messageContent,
              style: TextStyle(fontSize: 14),
            ),
          ),
          if (isMyMessage)
            IconButton(
              icon: Icon(Icons.edit, size: 16),
              onPressed: _startEdit,
              padding: EdgeInsets.all(4),
              constraints: BoxConstraints(),
            ),
        ],
      ),
    ];
  }

  List<Widget> _buildEditMode() {
    return [
      TextField(
        controller: editController,
        focusNode: editFocusNode,
        maxLines: null,
        decoration: InputDecoration(
          hintText: 'Edit your message...',
          border: OutlineInputBorder(),
          contentPadding: EdgeInsets.all(8),
        ),
        onSubmitted: (_) => _saveEdit(),
      ),
      SizedBox(height: 8),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          ElevatedButton(
            onPressed: _saveEdit,
            child: Text('Save'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
          ),
          SizedBox(width: 8),
          TextButton(
            onPressed: _cancelEdit,
            child: Text('Cancel'),
            style: TextButton.styleFrom(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
          ),
        ],
      ),
      Text(
        'Press Enter to save',
        style: TextStyle(
          fontSize: 10,
          color: Colors.grey[600],
          fontStyle: FontStyle.italic,
        ),
      ),
    ];
  }

  String _formatTime(DateTime dateTime) {
    return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
```

## 🔗 GraphQL Implementation

### Edit Message Mutation

```graphql
mutation EditMessage($messageId: ID!, $newContent: String!) {
  editMessage(message_id: $messageId, new_content: $newContent) {
    id
    content
    edited
    edited_at
    sender_id {
      id
      name
      profile_picture
    }
    receiver_id {
      id
      name
    }
  }
}
```

**Variables:**
```json
{
  "messageId": "675c123456789abcdef12345",
  "newContent": "This is the updated message content"
}
```

### JavaScript/Apollo Client Example

```javascript
import { gql, useMutation } from '@apollo/client';

const EDIT_MESSAGE = gql`
  mutation EditMessage($messageId: ID!, $newContent: String!) {
    editMessage(message_id: $messageId, new_content: $newContent) {
      id
      content
      edited
      edited_at
      sender_id {
        id
        name
        profile_picture
      }
    }
  }
`;

function MessageEditor({ message }) {
  const [editMessage, { loading, error }] = useMutation(EDIT_MESSAGE);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEditMessage = async () => {
    const trimmedContent = editContent.trim();
    
    if (!trimmedContent) {
      alert('Message content cannot be empty');
      return;
    }

    if (trimmedContent === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      const { data } = await editMessage({
        variables: {
          messageId: message.id,
          newContent: trimmedContent
        }
      });
      
      if (data.editMessage) {
        console.log('Message edited successfully:', data.editMessage);
        setIsEditing(false);
        // Update local state or refetch queries
      }
    } catch (error) {
      console.error('Failed to edit message:', error.message);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  if (isEditing) {
    return (
      <div className="message-editor">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Edit your message..."
          rows={3}
          disabled={loading}
        />
        <div className="editor-actions">
          <button 
            onClick={handleEditMessage}
            disabled={loading || !editContent.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={handleCancelEdit}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
        {error && (
          <div className="error-message">
            Error: {error.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="message-display">
      <div className="message-content">
        {message.content}
        {message.edited && (
          <span className="edited-indicator"> (edited)</span>
        )}
      </div>
      <button 
        onClick={() => setIsEditing(true)}
        className="edit-button"
      >
        Edit
      </button>
    </div>
  );
}

export default MessageEditor;
```

### Flutter/GraphQL Example

```dart
import 'package:graphql_flutter/graphql_flutter.dart';

class MessageEditGraphQL {
  static const String editMessageMutation = '''
    mutation EditMessage(\$messageId: ID!, \$newContent: String!) {
      editMessage(message_id: \$messageId, new_content: \$newContent) {
        id
        content
        edited
        edited_at
        sender_id {
          id
          name
          profile_picture
        }
      }
    }
  ''';

  static Future<Message?> editMessage(
    GraphQLClient client,
    String messageId,
    String newContent,
  ) async {
    try {
      final MutationOptions options = MutationOptions(
        document: gql(editMessageMutation),
        variables: {
          'messageId': messageId,
          'newContent': newContent,
        },
      );

      final QueryResult result = await client.mutate(options);

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      final messageData = result.data?['editMessage'];
      if (messageData != null) {
        return Message.fromJson(messageData);
      }
      
      return null;
    } catch (e) {
      print('Error editing message: $e');
      throw e;
    }
  }
}

// Usage in Flutter widget
class GraphQLMessageEditor extends StatefulWidget {
  final Message message;
  final GraphQLClient client;

  const GraphQLMessageEditor({
    Key? key,
    required this.message,
    required this.client,
  }) : super(key: key);

  @override
  _GraphQLMessageEditorState createState() => _GraphQLMessageEditorState();
}

class _GraphQLMessageEditorState extends State<GraphQLMessageEditor> {
  bool isEditing = false;
  bool isLoading = false;
  late TextEditingController editController;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    editController = TextEditingController(text: widget.message.content);
  }

  @override
  void dispose() {
    editController.dispose();
    super.dispose();
  }

  Future<void> _saveEdit() async {
    final newContent = editController.text.trim();
    
    if (newContent.isEmpty) {
      setState(() {
        errorMessage = 'Message content cannot be empty';
      });
      return;
    }

    if (newContent == widget.message.content) {
      _cancelEdit();
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final editedMessage = await MessageEditGraphQL.editMessage(
        widget.client,
        widget.message.id,
        newContent,
      );

      if (editedMessage != null) {
        setState(() {
          isEditing = false;
          isLoading = false;
        });
        // Update parent widget or state management
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  void _cancelEdit() {
    setState(() {
      isEditing = false;
      errorMessage = null;
      editController.text = widget.message.content;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isEditing) {
      return Container(
        padding: EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: editController,
              maxLines: null,
              enabled: !isLoading,
              decoration: InputDecoration(
                hintText: 'Edit your message...',
                border: OutlineInputBorder(),
                errorText: errorMessage,
              ),
            ),
            SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton(
                  onPressed: isLoading ? null : _saveEdit,
                  child: isLoading 
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text('Save'),
                ),
                SizedBox(width: 8),
                TextButton(
                  onPressed: isLoading ? null : _cancelEdit,
                  child: Text('Cancel'),
                ),
              ],
            ),
          ],
        ),
      );
    }

    return Container(
      padding: EdgeInsets.all(12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.message.content,
                  style: TextStyle(fontSize: 14),
                ),
                if (widget.message.edited)
                  Text(
                    'Edited',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(Icons.edit, size: 16),
            onPressed: () {
              setState(() {
                isEditing = true;
              });
            },
          ),
        ],
      ),
    );
  }
}
```

## 🎨 UI/UX Best Practices

### CSS Styling for Message Editing

```css
/* Message container */
.message {
  margin: 8px 0;
  padding: 12px;
  border-radius: 12px;
  max-width: 70%;
  position: relative;
}

.my-message {
  background: #007bff;
  color: white;
  margin-left: auto;
  margin-right: 0;
}

.other-message {
  background: #f1f1f1;
  color: #333;
  margin-left: 0;
  margin-right: auto;
}

/* Message header */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.edited-indicator {
  font-style: italic;
  font-size: 10px;
  opacity: 0.7;
}

/* Edit mode */
.edit-mode {
  width: 100%;
}

.edit-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.save-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.save-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.cancel-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-hint {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}

/* View mode */
.view-mode {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.message-content {
  flex: 1;
  word-wrap: break-word;
}

.message-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message:hover .message-actions {
  opacity: 1;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.edit-button:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* Error states */
.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

/* Loading states */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Responsive design */
@media (max-width: 768px) {
  .message {
    max-width: 85%;
  }
  
  .edit-textarea {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
```

## 🔧 Advanced Features

### Edit History Tracking

```javascript
// Track edit history (client-side)
class EditHistoryTracker {
  constructor() {
    this.editHistory = new Map();
  }

  addEdit(messageId, originalContent, newContent, timestamp) {
    if (!this.editHistory.has(messageId)) {
      this.editHistory.set(messageId, []);
    }
    
    this.editHistory.get(messageId).push({
      originalContent,
      newContent,
      timestamp,
      editNumber: this.editHistory.get(messageId).length + 1
    });
  }

  getEditHistory(messageId) {
    return this.editHistory.get(messageId) || [];
  }

  getEditCount(messageId) {
    return this.editHistory.get(messageId)?.length || 0;
  }
}
```

### Auto-save Draft

```javascript
// Auto-save edit drafts
class EditDraftManager {
  constructor() {
    this.drafts = new Map();
    this.autoSaveInterval = 2000; // 2 seconds
  }

  startAutoSave(messageId, getContentCallback) {
    const intervalId = setInterval(() => {
      const content = getContentCallback();
      if (content.trim()) {
        this.saveDraft(messageId, content);
      }
    }, this.autoSaveInterval);

    return intervalId;
  }

  stopAutoSave(intervalId) {
    clearInterval(intervalId);
  }

  saveDraft(messageId, content) {
    this.drafts.set(messageId, {
      content,
      timestamp: new Date()
    });
    
    // Save to localStorage for persistence
    localStorage.setItem(
      `edit_draft_${messageId}`,
      JSON.stringify(this.drafts.get(messageId))
    );
  }

  getDraft(messageId) {
    // Try memory first, then localStorage
    let draft = this.drafts.get(messageId);
    if (!draft) {
      const stored = localStorage.getItem(`edit_draft_${messageId}`);
      if (stored) {
        draft = JSON.parse(stored);
        this.drafts.set(messageId, draft);
      }
    }
    return draft;
  }

  clearDraft(messageId) {
    this.drafts.delete(messageId);
    localStorage.removeItem(`edit_draft_${messageId}`);
  }
}
```

### Edit Permissions & Time Limits

```javascript
// Edit permission checker
class EditPermissionChecker {
  constructor(options = {}) {
    this.editTimeLimit = options.editTimeLimit || null; // null = no limit
    this.allowedRoles = options.allowedRoles || ['sender'];
  }

  canEdit(message, currentUser) {
    // Check if user is the sender
    if (!message.sender_id.equals(currentUser._id)) {
      return {
        allowed: false,
        reason: 'Only the message sender can edit this message'
      };
    }

    // Check time limit
    if (this.editTimeLimit) {
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      if (messageAge > this.editTimeLimit) {
        return {
          allowed: false,
          reason: `Messages can only be edited within ${this.editTimeLimit / 1000 / 60} minutes`
        };
      }
    }

    // Check if message type is editable
    if (message.message_type !== 'text') {
      return {
        allowed: false,
        reason: 'Only text messages can be edited'
      };
    }

    return { allowed: true };
  }

  getTimeRemaining(message) {
    if (!this.editTimeLimit) return null;
    
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const remaining = this.editTimeLimit - messageAge;
    
    return remaining > 0 ? remaining : 0;
  }
}
```

## 🛡️ Security & Validation

### Input Validation

```javascript
// Message content validator
class MessageValidator {
  static validate(content) {
    const errors = [];

    // Check if content is empty
    if (!content || !content.trim()) {
      errors.push('Message content cannot be empty');
    }

    // Check length limits
    if (content.length > 2000) {
      errors.push('Message content cannot exceed 2000 characters');
    }

    // Check for prohibited content
    const prohibitedPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi
    ];

    for (const pattern of prohibitedPatterns) {
      if (pattern.test(content)) {
        errors.push('Message contains prohibited content');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitize(content) {
    // Basic HTML sanitization
    return content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }
}
```

### Rate Limiting

```javascript
// Edit rate limiter
class EditRateLimiter {
  constructor(options = {}) {
    this.maxEditsPerMinute = options.maxEditsPerMinute || 10;
    this.editCounts = new Map();
  }

  canEdit(userId) {
    const now = Date.now();
    const userEdits = this.editCounts.get(userId) || [];
    
    // Remove edits older than 1 minute
    const recentEdits = userEdits.filter(timestamp => 
      now - timestamp < 60000
    );
    
    if (recentEdits.length >= this.maxEditsPerMinute) {
      return {
        allowed: false,
        reason: 'Too many edits. Please wait before editing again.',
        retryAfter: 60000 - (now - recentEdits[0])
      };
    }

    return { allowed: true };
  }

  recordEdit(userId) {
    const now = Date.now();
    const userEdits = this.editCounts.get(userId) || [];
    
    userEdits.push(now);
    
    // Keep only recent edits
    const recentEdits = userEdits.filter(timestamp => 
      now - timestamp < 60000
    );
    
    this.editCounts.set(userId, recentEdits);
  }
}
```

## 📱 Platform Support

- ✅ **Web browsers** (Chrome, Firefox, Safari, Edge)
- ✅ **React Native** (iOS & Android)
- ✅ **Flutter** (iOS & Android)
- ✅ **Node.js** applications
- ✅ **Desktop applications** (Electron)

## 🚀 Performance Tips

1. **Debounce edit requests** to prevent spam
2. **Cache edit drafts** locally for better UX
3. **Validate content** on client-side before sending
4. **Use optimistic updates** for immediate feedback
5. **Implement edit history** efficiently

## 🔍 Troubleshooting

### Common Issues

1. **Edit not saving**: Check user permissions and content validation
2. **Real-time updates failing**: Verify Socket.IO connection
3. **Content not updating**: Ensure proper state management
4. **Permission denied**: Verify user is the message sender

### Debug Mode

```javascript
// Enable edit debugging
const DEBUG_EDITING = true;

if (DEBUG_EDITING) {
  socket.on('messageEdited', (data) => {
    console.log('Edit debug:', {
      messageId: data.messageId,
      newContent: data.newContent,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('error', (error) => {
    console.log('Edit error debug:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
  });
}
```

## 📊 API Endpoints Summary

- **Socket.IO Events:**
  - `editMessage` - Edit message content
  - `messageEdited` - Message edit notification

- **GraphQL Mutations:**
  - `editMessage` - Edit message content

## 🔄 Real-time Behavior

1. **Edit Notification**: Both sender and receiver see the edit in real-time
2. **Edit Indicator**: Messages show "(edited)" indicator after editing
3. **Immediate Feedback**: UI updates immediately with optimistic updates
4. **Error Handling**: Failed edits are reverted with error messages

The message editing system provides a seamless, real-time editing experience with proper validation, permissions, and cross-platform support! ✏️✨