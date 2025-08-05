export const typeDefs = `#graphql
  scalar Upload
  scalar Date

  type MessageReaction {
    id: ID!
    userId: ID!
    user_id: User!
    reaction: String!
    createdAt: Date!
    created_at: Date!
  }

  type MessageDeletedFor {
    user_id: User!
    deleted_at: Date!
  }

  type Message {
    id: ID!
    senderId: ID!
    receiverId: ID!
    sender_id: User!
    receiver_id: User!
    content: String!
    messageType: String!
    message_type: String!
    fileUrl: String
    file_url: String
    fileName: String
    file_name: String
    fileSize: Int
    file_size: Int
    fileType: String
    file_type: String
    duration: Int
    thumbnailUrl: String
    thumbnail_url: String
    reactions: [MessageReaction!]
    replyTo: Message
    reply_to: Message
    forwarded: Boolean!
    forwardedFrom: User
    forwarded_from: User
    read: Boolean!
    readAt: Date
    read_at: Date
    delivered: Boolean!
    deliveredAt: Date
    delivered_at: Date
    deletedFor: [MessageDeletedFor!]
    deleted_for: [MessageDeletedFor!]
    edited: Boolean!
    editedAt: Date
    edited_at: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type Conversation {
    with_user: User!
    messages: [Message!]!
    unread_count: Int!
    last_message: Message
  }

  type ConversationList {
    conversations: [Conversation!]!
    total: Int!
  }

  input MessageInput {
    receiver_id: ID!
    content: String!
    message_type: String = "text"
    file: Upload
    reply_to: ID
    forwarded: Boolean = false
    forwarded_from: ID
  }

  input MessageReactionInput {
    message_id: ID!
    reaction: String!
  }

  type Query {
    # Get conversation history between current user and another user
    conversation(with_user_id: ID!, page: Int = 1, limit: Int = 20): [Message!]!
    getConversation(withUserId: ID!, page: Int = 1, limit: Int = 20): [Message!]!
    
    # Get all conversations for current user
    conversations: ConversationList!
    
    # Get unread message count
    unreadMessageCount: Int!
    
    # Get unread messages
    unreadMessages: [Message!]!
    
    # Search messages
    searchMessages(query: String!, with_user_id: ID): [Message!]!
  }

  type Mutation {
    # Send a new message
    sendMessage(messageInput: MessageInput!): Message!
    
    # Mark messages as read
    markMessagesAsRead(with_user_id: ID!): Boolean!
    
    # Edit a message
    editMessage(message_id: ID!, new_content: String!): Message!
    
    # Delete a message
    deleteMessage(message_id: ID!, for_everyone: Boolean = false): Boolean!
    
    # React to a message
    reactToMessage(reactionInput: MessageReactionInput!): Message!
    
    # Remove reaction from a message
    removeReaction(message_id: ID!): Message!
    
    # Forward a message
    forwardMessage(message_id: ID!, to_user_ids: [ID!]!): [Message!]!
    
    # Delete entire conversation
    deleteConversation(with_user_id: ID!): Boolean!
  }
`;