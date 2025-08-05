import {
  getConversation,
  getUserConversations,
  sendMessage,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  reactToMessage,
  removeReaction,
  getUnreadMessageCount,
  getUnreadMessages,
  searchMessages,
  forwardMessage,
  deleteConversation
} from './message.service.js';
import { getUserByUID } from '../user/user.service.js';
import { GraphQLError } from 'graphql';

export const resolvers = {
  Query: {
    conversation: async (_, { with_user_id, page, limit }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await getConversation(userDetails._id, with_user_id, page, limit);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to fetch conversation');
      }
    },

    getConversation: async (_, { withUserId, page, limit }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await getConversation(userDetails._id, withUserId, page, limit);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to fetch conversation');
      }
    },

    conversations: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await getUserConversations(userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to fetch conversations');
      }
    },

    unreadMessageCount: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await getUnreadMessageCount(userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to get unread message count');
      }
    },

    unreadMessages: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await getUnreadMessages(userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to get unread messages');
      }
    },

    searchMessages: async (_, { query, with_user_id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await searchMessages(userDetails._id, query, with_user_id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to search messages');
      }
    },
  },

  Mutation: {
    sendMessage: async (_, { messageInput }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await sendMessage(messageInput, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to send message');
      }
    },

    markMessagesAsRead: async (_, { with_user_id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await markMessagesAsRead(userDetails._id, with_user_id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to mark messages as read');
      }
    },

    editMessage: async (_, { message_id, new_content }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await editMessage(message_id, new_content, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to edit message');
      }
    },

    deleteMessage: async (_, { message_id, for_everyone }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await deleteMessage(message_id, userDetails._id, for_everyone);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to delete message');
      }
    },

    reactToMessage: async (_, { reactionInput }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await reactToMessage(
          reactionInput.message_id,
          reactionInput.reaction,
          userDetails._id
        );
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to react to message');
      }
    },

    removeReaction: async (_, { message_id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await removeReaction(message_id, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to remove reaction');
      }
    },

    forwardMessage: async (_, { message_id, to_user_ids }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await forwardMessage(message_id, to_user_ids, userDetails._id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to forward message');
      }
    },

    deleteConversation: async (_, { with_user_id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required');
        }

        const userDetails = await getUserByUID(user.uid);
        if (!userDetails) {
          throw new GraphQLError('User not found');
        }

        return await deleteConversation(userDetails._id, with_user_id);
      } catch (error) {
        throw new GraphQLError(error.message || 'Failed to delete conversation');
      }
    },
  },

  // Field resolvers
  Message: {
    sender_id: async (parent) => {
      return parent.sender_id;
    },
    receiver_id: async (parent) => {
      return parent.receiver_id;
    },
    reply_to: async (parent) => {
      if (!parent.reply_to) return null;
      
      // Ensure proper ID conversion for nested fields
      const replyTo = { ...parent.reply_to.toObject() };
      if (replyTo.sender_id) {
        replyTo.sender_id = {
          ...replyTo.sender_id,
          id: replyTo.sender_id._id?.toString() || replyTo.sender_id.id
        };
      }
      if (replyTo.receiver_id) {
        replyTo.receiver_id = {
          ...replyTo.receiver_id,
          id: replyTo.receiver_id._id?.toString() || replyTo.receiver_id.id
        };
      }
      replyTo.id = replyTo._id?.toString() || replyTo.id;
      
      return replyTo;
    },
    forwarded_from: async (parent) => {
      return parent.forwarded_from;
    },
    reactions: async (parent) => {
      return parent.reactions || [];
    },
    deleted_for: async (parent) => {
      return parent.deleted_for || [];
    },
    // CamelCase field resolvers
    senderId: async (parent) => {
      return parent.sender_id?._id || parent.sender_id;
    },
    receiverId: async (parent) => {
      return parent.receiver_id?._id || parent.receiver_id;
    },
    messageType: async (parent) => {
      return parent.message_type;
    },
    fileUrl: async (parent) => {
      return parent.file_url;
    },
    fileName: async (parent) => {
      return parent.file_name;
    },
    fileSize: async (parent) => {
      return parent.file_size;
    },
    fileType: async (parent) => {
      return parent.file_type;
    },
    thumbnailUrl: async (parent) => {
      return parent.thumbnail_url;
    },
    replyTo: async (parent) => {
      if (!parent.reply_to) return null;
      
      // Ensure proper ID conversion for nested fields
      const replyTo = { ...parent.reply_to.toObject() };
      if (replyTo.sender_id) {
        replyTo.sender_id = {
          ...replyTo.sender_id,
          id: replyTo.sender_id._id?.toString() || replyTo.sender_id.id
        };
      }
      if (replyTo.receiver_id) {
        replyTo.receiver_id = {
          ...replyTo.receiver_id,
          id: replyTo.receiver_id._id?.toString() || replyTo.receiver_id.id
        };
      }
      replyTo.id = replyTo._id?.toString() || replyTo.id;
      
      return replyTo;
    },
    forwardedFrom: async (parent) => {
      return parent.forwarded_from;
    },
    readAt: async (parent) => {
      return parent.read_at;
    },
    deliveredAt: async (parent) => {
      return parent.delivered_at;
    },
    deletedFor: async (parent) => {
      return parent.deleted_for || [];
    },
    editedAt: async (parent) => {
      return parent.edited_at;
    },
  },

  MessageReaction: {
    user_id: async (parent) => {
      return parent.user_id;
    },
    userId: async (parent) => {
      return parent.user_id?._id || parent.user_id;
    },
    createdAt: async (parent) => {
      return parent.created_at;
    },
  },

  MessageDeletedFor: {
    user_id: async (parent) => {
      return parent.user_id;
    },
  },

  Conversation: {
    with_user: async (parent) => {
      return parent.with_user;
    },
    messages: async (parent) => {
      return parent.messages || [];
    },
    last_message: async (parent) => {
      return parent.last_message;
    },
  },

  ConversationList: {
    conversations: async (parent) => {
      return parent.conversations || [];
    },
  },
};