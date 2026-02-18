# Message Reactions Documentation 😀💬

The chat server provides comprehensive support for message reactions, allowing users to react to messages with emojis in real-time using both Socket.IO and GraphQL.

## 🎯 Features

- ✅ **Real-time reactions** via Socket.IO
- ✅ **GraphQL mutations** for reaction management
- ✅ **Multiple reactions per message** from different users
- ✅ **Reaction replacement** - one reaction per user per message
- ✅ **Real-time notifications** to all participants
- ✅ **Emoji support** - any Unicode emoji
- ✅ **Reaction removal** functionality
- ✅ **User information** with each reaction

## 📊 Data Structure

### MessageReaction Type
```graphql
type MessageReaction {
  id: ID!
  userId: ID!           # CamelCase field
  user_id: User!         # Snake_case field (populated user object)
  reaction: String!      # Emoji string (e.g., "👍", "❤️", "😂")
  createdAt: Date!       # CamelCase field
  created_at: Date!      # Snake_case field
}
```

### Message with Reactions
```graphql
type Message {
  id: ID!
  content: String!
  reactions: [MessageReaction!]  # Array of reactions
  # ... other message fields
}
```

## 🔌 Socket.IO Implementation

### Adding Reactions

**Client Side:**
```javascript
// React to a message
socket.emit('react', {
  messageId: 'message_id_here',
  reaction: '👍'  // Any emoji
});
```

**Server Response:**
```javascript
// Listen for reaction confirmations
socket.on('messageReacted', (data) => {
  console.log('Reaction added:', data);
  // {
  //   messageId: 'message_id_here',
  //   reaction: '👍',
  //   userId: 'user_id_who_reacted'
  // }
});

// Handle errors
socket.on('error', (error) => {
  console.error('Reaction failed:', error.message);
});
```

### JavaScript/React Example

```javascript
import io from 'socket.io-client';

class MessageReactions {
  constructor(socket) {
    this.socket = socket;
    this.setupListeners();
  }

  // Add reaction to message
  addReaction(messageId, emoji) {
    this.socket.emit('react', {
      messageId: messageId,
      reaction: emoji
    });
  }

  // Setup event listeners
  setupListeners() {
    this.socket.on('messageReacted', (data) => {
      this.handleReactionUpdate(data);
    });

    this.socket.on('error', (error) => {
      console.error('Reaction error:', error.message);
    });
  }

  // Handle reaction updates in UI
  handleReactionUpdate(data) {
    const messageElement = document.getElementById(`message-${data.messageId}`);
    if (messageElement) {
      this.updateReactionDisplay(messageElement, data);
    }
  }

  // Update reaction display
  updateReactionDisplay(messageElement, data) {
    let reactionContainer = messageElement.querySelector('.reactions');
    if (!reactionContainer) {
      reactionContainer = document.createElement('div');
      reactionContainer.className = 'reactions';
      messageElement.appendChild(reactionContainer);
    }

    // Add or update reaction
    const reactionButton = document.createElement('button');
    reactionButton.textContent = data.reaction;
    reactionButton.className = 'reaction-button';
    reactionButton.onclick = () => this.addReaction(data.messageId, data.reaction);
    
    reactionContainer.appendChild(reactionButton);
  }
}

// Usage
const socket = io('http://localhost:4002', {
  auth: { token: 'your_jwt_token' }
});

const reactions = new MessageReactions(socket);

// React to a message
reactions.addReaction('675c123456789abcdef12345', '❤️');
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const MessageWithReactions = ({ message, socket }) => {
  const [reactions, setReactions] = useState(message.reactions || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'];

  useEffect(() => {
    socket.on('messageReacted', (data) => {
      if (data.messageId === message.id) {
        // Update reactions for this message
        fetchUpdatedMessage();
      }
    });

    return () => {
      socket.off('messageReacted');
    };
  }, [message.id]);

  const addReaction = (emoji) => {
    socket.emit('react', {
      messageId: message.id,
      reaction: emoji
    });
    setShowEmojiPicker(false);
  };

  const groupReactions = () => {
    const grouped = {};
    reactions.forEach(reaction => {
      if (!grouped[reaction.reaction]) {
        grouped[reaction.reaction] = [];
      }
      grouped[reaction.reaction].push(reaction);
    });
    return grouped;
  };

  const groupedReactions = groupReactions();

  return (
    <div className="message">
      <div className="message-content">{message.content}</div>
      
      {/* Display reactions */}
      <div className="reactions">
        {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
          <button
            key={emoji}
            className="reaction-button"
            onClick={() => addReaction(emoji)}
            title={reactionList.map(r => r.user_id.name).join(', ')}
          >
            {emoji} {reactionList.length}
          </button>
        ))}
        
        {/* Add reaction button */}
        <button 
          className="add-reaction-button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          ➕
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          {commonEmojis.map(emoji => (
            <button
              key={emoji}
              className="emoji-option"
              onClick={() => addReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageWithReactions;
```

### Flutter/Dart Implementation

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class MessageReactionService {
  late IO.Socket socket;
  
  MessageReactionService(this.socket) {
    _setupListeners();
  }

  // Add reaction to message
  void addReaction(String messageId, String emoji) {
    socket.emit('react', {
      'messageId': messageId,
      'reaction': emoji
    });
  }

  // Setup event listeners
  void _setupListeners() {
    socket.on('messageReacted', (data) {
      print('Reaction added: $data');
      _handleReactionUpdate(data);
    });

    socket.on('error', (error) {
      print('Reaction error: ${error['message']}');
    });
  }

  void _handleReactionUpdate(dynamic data) {
    // Update UI with new reaction
    // This would typically update a state management solution
    // like Provider, Bloc, or Riverpod
  }
}

// Usage in Flutter widget
class MessageWidget extends StatefulWidget {
  final Message message;
  final MessageReactionService reactionService;

  const MessageWidget({
    Key? key,
    required this.message,
    required this.reactionService,
  }) : super(key: key);

  @override
  _MessageWidgetState createState() => _MessageWidgetState();
}

class _MessageWidgetState extends State<MessageWidget> {
  final List<String> commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'];
  bool showEmojiPicker = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Message content
        Container(
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue[100],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(widget.message.content),
        ),
        
        // Reactions
        if (widget.message.reactions.isNotEmpty)
          Wrap(
            children: _buildReactionButtons(),
          ),
        
        // Add reaction button
        IconButton(
          icon: Icon(Icons.add_reaction),
          onPressed: () {
            setState(() {
              showEmojiPicker = !showEmojiPicker;
            });
          },
        ),
        
        // Emoji picker
        if (showEmojiPicker)
          Container(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: commonEmojis.length,
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () {
                    widget.reactionService.addReaction(
                      widget.message.id,
                      commonEmojis[index],
                    );
                    setState(() {
                      showEmojiPicker = false;
                    });
                  },
                  child: Container(
                    padding: EdgeInsets.all(8),
                    child: Text(
                      commonEmojis[index],
                      style: TextStyle(fontSize: 24),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  List<Widget> _buildReactionButtons() {
    // Group reactions by emoji
    Map<String, List<MessageReaction>> grouped = {};
    for (var reaction in widget.message.reactions) {
      if (!grouped.containsKey(reaction.reaction)) {
        grouped[reaction.reaction] = [];
      }
      grouped[reaction.reaction]!.add(reaction);
    }

    return grouped.entries.map((entry) {
      return GestureDetector(
        onTap: () {
          widget.reactionService.addReaction(
            widget.message.id,
            entry.key,
          );
        },
        child: Container(
          margin: EdgeInsets.only(right: 4),
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text('${entry.key} ${entry.value.length}'),
        ),
      );
    }).toList();
  }
}
```

## 🔗 GraphQL Implementation

### Add Reaction Mutation

```graphql
mutation ReactToMessage($reactionInput: MessageReactionInput!) {
  reactToMessage(reactionInput: $reactionInput) {
    id
    content
    reactions {
      id
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

**Variables:**
```json
{
  "reactionInput": {
    "message_id": "675c123456789abcdef12345",
    "reaction": "👍"
  }
}
```

### Remove Reaction Mutation

```graphql
mutation RemoveReaction($messageId: ID!) {
  removeReaction(message_id: $messageId) {
    id
    reactions {
      id
      reaction
      user_id {
        id
        name
      }
      created_at
    }
  }
}
```

**Variables:**
```json
{
  "messageId": "675c123456789abcdef12345"
}
```

### JavaScript/Apollo Client Example

```javascript
import { gql, useMutation } from '@apollo/client';

const REACT_TO_MESSAGE = gql`
  mutation ReactToMessage($reactionInput: MessageReactionInput!) {
    reactToMessage(reactionInput: $reactionInput) {
      id
      reactions {
        id
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
`;

const REMOVE_REACTION = gql`
  mutation RemoveReaction($messageId: ID!) {
    removeReaction(message_id: $messageId) {
      id
      reactions {
        id
        reaction
        user_id {
          id
          name
        }
        created_at
      }
    }
  }
`;

function MessageReactions({ message }) {
  const [reactToMessage] = useMutation(REACT_TO_MESSAGE);
  const [removeReaction] = useMutation(REMOVE_REACTION);

  const handleReaction = async (emoji) => {
    try {
      const { data } = await reactToMessage({
        variables: {
          reactionInput: {
            message_id: message.id,
            reaction: emoji
          }
        }
      });
      console.log('Reaction added:', data.reactToMessage);
    } catch (error) {
      console.error('Failed to add reaction:', error.message);
    }
  };

  const handleRemoveReaction = async () => {
    try {
      const { data } = await removeReaction({
        variables: {
          messageId: message.id
        }
      });
      console.log('Reaction removed:', data.removeReaction);
    } catch (error) {
      console.error('Failed to remove reaction:', error.message);
    }
  };

  return (
    <div className="message-reactions">
      {/* Reaction buttons */}
      <button onClick={() => handleReaction('👍')}>👍</button>
      <button onClick={() => handleReaction('❤️')}>❤️</button>
      <button onClick={() => handleReaction('😂')}>😂</button>
      <button onClick={handleRemoveReaction}>Remove Reaction</button>
      
      {/* Display existing reactions */}
      <div className="existing-reactions">
        {message.reactions.map(reaction => (
          <span key={reaction.id} className="reaction">
            {reaction.reaction} by {reaction.user_id.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MessageReactions;
```

### Flutter/GraphQL Example

```dart
import 'package:graphql_flutter/graphql_flutter.dart';

class MessageReactionGraphQL {
  static const String reactToMessageMutation = '''
    mutation ReactToMessage(\$reactionInput: MessageReactionInput!) {
      reactToMessage(reactionInput: \$reactionInput) {
        id
        reactions {
          id
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
  ''';

  static const String removeReactionMutation = '''
    mutation RemoveReaction(\$messageId: ID!) {
      removeReaction(message_id: \$messageId) {
        id
        reactions {
          id
          reaction
          user_id {
            id
            name
          }
          created_at
        }
      }
    }
  ''';

  static Future<void> addReaction(
    GraphQLClient client,
    String messageId,
    String emoji,
  ) async {
    try {
      final MutationOptions options = MutationOptions(
        document: gql(reactToMessageMutation),
        variables: {
          'reactionInput': {
            'message_id': messageId,
            'reaction': emoji,
          },
        },
      );

      final QueryResult result = await client.mutate(options);

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      print('Reaction added successfully');
    } catch (e) {
      print('Error adding reaction: $e');
      throw e;
    }
  }

  static Future<void> removeReaction(
    GraphQLClient client,
    String messageId,
  ) async {
    try {
      final MutationOptions options = MutationOptions(
        document: gql(removeReactionMutation),
        variables: {
          'messageId': messageId,
        },
      );

      final QueryResult result = await client.mutate(options);

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      print('Reaction removed successfully');
    } catch (e) {
      print('Error removing reaction: $e');
      throw e;
    }
  }
}
```

## 🎨 UI/UX Best Practices

### Reaction Display

```css
/* CSS for reaction buttons */
.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.reaction-button {
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reaction-button:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.reaction-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.add-reaction-button {
  background: transparent;
  border: 1px dashed #ccc;
  border-radius: 12px;
  padding: 4px 8px;
  cursor: pointer;
  opacity: 0.7;
}

.add-reaction-button:hover {
  opacity: 1;
  border-color: #007bff;
}

.emoji-picker {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.emoji-option {
  background: none;
  border: none;
  font-size: 20px;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
}

.emoji-option:hover {
  background: #f0f0f0;
}
```

## 🔧 Advanced Features

### Reaction Analytics

```javascript
// Track reaction statistics
function getReactionStats(messages) {
  const stats = {};
  
  messages.forEach(message => {
    message.reactions.forEach(reaction => {
      if (!stats[reaction.reaction]) {
        stats[reaction.reaction] = 0;
      }
      stats[reaction.reaction]++;
    });
  });
  
  return stats;
}

// Most popular reactions
function getMostPopularReactions(stats) {
  return Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
}
```

### Custom Emoji Support

```javascript
// Custom emoji configuration
const customEmojis = {
  ':thumbsup:': '👍',
  ':heart:': '❤️',
  ':laugh:': '😂',
  ':wow:': '😮',
  ':sad:': '😢',
  ':angry:': '😡',
  ':party:': '🎉',
  ':fire:': '🔥'
};

// Convert text to emoji
function parseEmoji(text) {
  return text.replace(/:([a-z]+):/g, (match, name) => {
    return customEmojis[match] || match;
  });
}
```

### Reaction Notifications

```javascript
// Show notification when someone reacts to your message
socket.on('messageReacted', (data) => {
  if (data.messageId && isMyMessage(data.messageId)) {
    showNotification({
      title: 'New Reaction',
      body: `Someone reacted ${data.reaction} to your message`,
      icon: '/reaction-icon.png'
    });
  }
});

function showNotification(options) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(options.title, {
      body: options.body,
      icon: options.icon
    });
  }
}
```

## 🛡️ Security & Validation

### Input Validation

- **Emoji validation**: Only valid Unicode emojis are accepted
- **Authentication**: Users must be authenticated to react
- **Message existence**: Reactions only work on existing messages
- **Rate limiting**: Prevent spam reactions (implemented server-side)

### Error Handling

```javascript
// Comprehensive error handling
socket.on('error', (error) => {
  switch (error.code) {
    case 'MESSAGE_NOT_FOUND':
      showError('Message not found');
      break;
    case 'INVALID_REACTION':
      showError('Invalid emoji reaction');
      break;
    case 'RATE_LIMITED':
      showError('Too many reactions. Please wait.');
      break;
    default:
      showError('Failed to add reaction');
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

1. **Debounce reactions** to prevent spam
2. **Cache reaction data** for better performance
3. **Limit reaction history** to recent messages
4. **Use efficient data structures** for reaction grouping
5. **Implement pagination** for messages with many reactions

## 🔍 Troubleshooting

### Common Issues

1. **Reactions not appearing**: Check authentication and message ID
2. **Duplicate reactions**: Server automatically handles replacement
3. **Emoji not displaying**: Ensure proper Unicode support
4. **Real-time updates failing**: Verify Socket.IO connection

### Debug Mode

```javascript
// Enable reaction debugging
const DEBUG_REACTIONS = true;

if (DEBUG_REACTIONS) {
  socket.on('messageReacted', (data) => {
    console.log('Reaction debug:', {
      messageId: data.messageId,
      reaction: data.reaction,
      userId: data.userId,
      timestamp: new Date().toISOString()
    });
  });
}
```

## 📊 API Endpoints Summary

- **Socket.IO Events:**
  - `react` - Add reaction to message
  - `messageReacted` - Reaction added notification

- **GraphQL Mutations:**
  - `reactToMessage` - Add/update reaction
  - `removeReaction` - Remove user's reaction

- **GraphQL Queries:**
  - Reactions are included in message queries automatically

The message reaction system provides a complete, real-time emoji reaction experience for your chat application! 🎉