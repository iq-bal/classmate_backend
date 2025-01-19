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
        enum: ['text', 'image', 'file'],
        default: 'text'
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
    }
}, {
    timestamps: true
});

messageSchema.index({ sender_id: 1, receiver_id: 1, createdAt: -1 });
const Message = mongoose.model('Message', messageSchema);
export default Message; 