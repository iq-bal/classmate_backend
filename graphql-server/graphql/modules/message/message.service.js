import Message from './message.model.js';
import { getUserByUID } from '../user/user.service.js';
import { uploadToLocal } from '../../../services/local.storage.js';

// Get conversation between two users
export const getConversation = async (userId, withUserId, page = 1, limit = 20) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: withUserId },
        { sender_id: withUserId, receiver_id: userId }
      ],
      deleted_for: { $not: { $elemMatch: { user_id: userId } } }
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('sender_id', 'name email profile_picture')
    .populate('receiver_id', 'name email profile_picture')
    .populate({
      path: 'reply_to',
      populate: [
        { path: 'sender_id', select: 'name email profile_picture' },
        { path: 'receiver_id', select: 'name email profile_picture' }
      ]
    })
    .populate('forwarded_from', 'name email profile_picture')
    .populate('reactions.user_id', 'name profile_picture');

    return messages.reverse();
  } catch (error) {
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }
};

// Get all conversations for a user
export const getUserConversations = async (userId) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender_id: userId },
            { receiver_id: userId }
          ],
          deleted_for: { $not: { $elemMatch: { user_id: userId } } }
        }
      },
      {
        $addFields: {
          other_user: {
            $cond: {
              if: { $eq: ['$sender_id', userId] },
              then: '$receiver_id',
              else: '$sender_id'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$other_user',
          last_message: { $first: '$$ROOT' },
          unread_count: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiver_id', userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'with_user'
        }
      },
      {
        $unwind: '$with_user'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'last_message.sender_id',
          foreignField: '_id',
          as: 'last_message.sender_id'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'last_message.receiver_id',
          foreignField: '_id',
          as: 'last_message.receiver_id'
        }
      },
      {
        $addFields: {
          'last_message.sender_id': { $arrayElemAt: ['$last_message.sender_id', 0] },
          'last_message.receiver_id': { $arrayElemAt: ['$last_message.receiver_id', 0] }
        }
      },
      {
        $sort: { 'last_message.createdAt': -1 }
      },
      {
        $addFields: {
          'last_message.id': { $toString: '$last_message._id' },
          'with_user.id': { $toString: '$with_user._id' },
          'last_message.senderId': { $toString: '$last_message.sender_id._id' },
          'last_message.receiverId': { $toString: '$last_message.receiver_id._id' }
        }
      }
    ]);

    // Transform the results to ensure proper ID conversion
    const transformedConversations = conversations.map(conv => ({
      ...conv,
      with_user: {
        ...conv.with_user,
        id: conv.with_user._id.toString()
      },
      last_message: conv.last_message ? {
        ...conv.last_message,
        id: conv.last_message._id.toString(),
        senderId: conv.last_message.sender_id?._id?.toString() || conv.last_message.sender_id?.toString(),
        receiverId: conv.last_message.receiver_id?._id?.toString() || conv.last_message.receiver_id?.toString()
      } : null
    }));

    return {
      conversations: transformedConversations,
      total: conversations.length
    };
  } catch (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }
};

// Send a message
export const sendMessage = async (messageInput, senderUserId) => {
  try {
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;
    let thumbnailUrl = null;
    let duration = null;

    // Handle file upload if present
    if (messageInput.file) {
      const file = await messageInput.file;
      const uploadResult = await uploadToLocal({
        stream: file.file.createReadStream(),
        name: file.file.filename,
        mimetype: file.file.mimetype
      });
      fileUrl = uploadResult.url;
      fileName = file.file.filename;
      fileSize = file.file.size || null;
      fileType = file.file.mimetype;
    }

    const newMessage = await Message.create({
      sender_id: senderUserId,
      receiver_id: messageInput.receiver_id,
      content: messageInput.content,
      message_type: messageInput.message_type || 'text',
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      thumbnail_url: thumbnailUrl,
      duration,
      reply_to: messageInput.reply_to || null,
      forwarded: messageInput.forwarded || false,
      forwarded_from: messageInput.forwarded_from || null,
      delivered: false, // Will be updated by socket server
      read: false
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender_id', 'name email profile_picture')
      .populate('receiver_id', 'name email profile_picture')
      .populate('reply_to')
      .populate('forwarded_from', 'name email profile_picture')
      .populate('reactions.user_id', 'name profile_picture');

    return populatedMessage;
  } catch (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

// Mark messages as read
export const markMessagesAsRead = async (userId, withUserId) => {
  try {
    await Message.updateMany(
      {
        sender_id: withUserId,
        receiver_id: userId,
        read: false
      },
      {
        read: true,
        read_at: new Date()
      }
    );
    return true;
  } catch (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
};

// Edit a message
export const editMessage = async (messageId, newContent, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (!message.sender_id.equals(userId)) {
      throw new Error('You can only edit your own messages');
    }

    message.content = newContent;
    message.edited = true;
    message.edited_at = new Date();
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('sender_id', 'name email profile_picture')
      .populate('receiver_id', 'name email profile_picture')
      .populate('reply_to')
      .populate('forwarded_from', 'name email profile_picture')
      .populate('reactions.user_id', 'name profile_picture');

    return populatedMessage;
  } catch (error) {
    throw new Error(`Failed to edit message: ${error.message}`);
  }
};

// Delete a message
export const deleteMessage = async (messageId, userId, forEveryone = false) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (forEveryone && message.sender_id.equals(userId)) {
      // Delete for everyone
      await message.deleteOne();
    } else {
      // Delete for current user only
      message.deleted_for.push({
        user_id: userId,
        deleted_at: new Date()
      });
      await message.save();
    }

    return true;
  } catch (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
};

// React to a message
export const reactToMessage = async (messageId, reaction, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(r => !r.user_id.equals(userId));
    
    // Add new reaction
    message.reactions.push({
      user_id: userId,
      reaction,
      created_at: new Date()
    });

    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('sender_id', 'name email profile_picture')
      .populate('receiver_id', 'name email profile_picture')
      .populate('reply_to')
      .populate('forwarded_from', 'name email profile_picture')
      .populate('reactions.user_id', 'name profile_picture');

    return populatedMessage;
  } catch (error) {
    throw new Error(`Failed to react to message: ${error.message}`);
  }
};

// Remove reaction from a message
export const removeReaction = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Remove reaction from this user
    message.reactions = message.reactions.filter(r => !r.user_id.equals(userId));
    await message.save();

    const populatedMessage = await Message.findById(messageId)
      .populate('sender_id', 'name email profile_picture')
      .populate('receiver_id', 'name email profile_picture')
      .populate('reply_to')
      .populate('forwarded_from', 'name email profile_picture')
      .populate('reactions.user_id', 'name profile_picture');

    return populatedMessage;
  } catch (error) {
    throw new Error(`Failed to remove reaction: ${error.message}`);
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId) => {
  try {
    const count = await Message.countDocuments({
      receiver_id: userId,
      read: false,
      deleted_for: { $not: { $elemMatch: { user_id: userId } } }
    });
    return count;
  } catch (error) {
    throw new Error(`Failed to get unread message count: ${error.message}`);
  }
};

// Get unread messages
export const getUnreadMessages = async (userId) => {
  try {
    const messages = await Message.find({
      receiver_id: userId,
      read: false,
      deleted_for: { $not: { $elemMatch: { user_id: userId } } }
    })
    .sort({ createdAt: -1 })
    .populate('sender_id', 'name email profile_picture')
    .populate('receiver_id', 'name email profile_picture')
    .populate('reply_to')
    .populate('forwarded_from', 'name email profile_picture')
    .populate('reactions.user_id', 'name profile_picture');

    return messages;
  } catch (error) {
    throw new Error(`Failed to get unread messages: ${error.message}`);
  }
};

// Search messages
export const searchMessages = async (userId, query, withUserId = null) => {
  try {
    const searchConditions = {
      $or: [
        { sender_id: userId },
        { receiver_id: userId }
      ],
      content: { $regex: query, $options: 'i' },
      deleted_for: { $not: { $elemMatch: { user_id: userId } } }
    };

    if (withUserId) {
      searchConditions.$or = [
        { sender_id: userId, receiver_id: withUserId },
        { sender_id: withUserId, receiver_id: userId }
      ];
    }

    const messages = await Message.find(searchConditions)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender_id', 'name email profile_picture')
      .populate('receiver_id', 'name email profile_picture')
      .populate('reply_to')
      .populate('forwarded_from', 'name email profile_picture')
      .populate('reactions.user_id', 'name profile_picture');

    return messages;
  } catch (error) {
    throw new Error(`Failed to search messages: ${error.message}`);
  }
};

// Forward messages
export const forwardMessage = async (messageId, toUserIds, fromUserId) => {
  try {
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      throw new Error('Message not found');
    }

    const forwardedMessages = [];
    
    for (const toUserId of toUserIds) {
      const newMessage = await Message.create({
        sender_id: fromUserId,
        receiver_id: toUserId,
        content: originalMessage.content,
        message_type: originalMessage.message_type,
        file_url: originalMessage.file_url,
        file_name: originalMessage.file_name,
        file_size: originalMessage.file_size,
        file_type: originalMessage.file_type,
        thumbnail_url: originalMessage.thumbnail_url,
        duration: originalMessage.duration,
        forwarded: true,
        forwarded_from: originalMessage.sender_id,
        delivered: false,
        read: false
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender_id', 'name email profile_picture')
        .populate('receiver_id', 'name email profile_picture')
        .populate('reply_to')
        .populate('forwarded_from', 'name email profile_picture')
        .populate('reactions.user_id', 'name profile_picture');

      forwardedMessages.push(populatedMessage);
    }

    return forwardedMessages;
  } catch (error) {
    throw new Error(`Failed to forward message: ${error.message}`);
  }
};

// Delete entire conversation between two users
export const deleteConversation = async (userId, withUserId) => {
  try {
    // Delete all messages between the two users
    const deleteResult = await Message.deleteMany({
      $or: [
        { sender_id: userId, receiver_id: withUserId },
        { sender_id: withUserId, receiver_id: userId }
      ]
    });

    return deleteResult.deletedCount > 0;
  } catch (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
};