import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    message_type: {
        type: String,
        enum: ['text', 'image', 'file', 'voice', 'video', 'location', 'contact'],
        default: 'text'
    },
    file_url: {
        type: String,
        default: null
    },
    file_name: {
        type: String,
        default: null
    },
    file_size: {
        type: Number,
        default: null
    },
    file_type: {
        type: String,
        default: null
    },
    duration: {  // For voice/video messages
        type: Number,
        default: null
    },
    thumbnail_url: {  // For images/videos
        type: String,
        default: null
    },
    reactions: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reaction: String,  // emoji code
        created_at: {
            type: Date,
            default: Date.now
        }
    }],
    reply_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    forwarded: {
        type: Boolean,
        default: false
    },
    forwarded_from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    read_at: {
        type: Date,
        default: null
    },
    delivered: {
        type: Boolean,
        default: false
    },
    delivered_at: {
        type: Date,
        default: null
    },
    deleted_for: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deleted_at: {
            type: Date,
            default: Date.now
        }
    }],
    edited: {
        type: Boolean,
        default: false
    },
    edited_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

messageSchema.index({ sender_id: 1, receiver_id: 1, createdAt: -1 });
messageSchema.index({ receiver_id: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message; 