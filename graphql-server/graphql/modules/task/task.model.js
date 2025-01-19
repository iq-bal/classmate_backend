import mongoose from "mongoose";
import User from "../user/user.model.js";

const taskSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['project', 'meeting', 'management', 'product', 'class test', 'other'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Pre-save hook to validate user and participants
taskSchema.pre('save', async function(next) {
    try {
        // Validate creator user exists
        const user = await User.findById(this.user_id);
        if (!user) {
            throw new Error('Invalid user_id - User does not exist');
        }

        // Validate all participants exist
        if (this.participants?.length>0) {
            const participants = await User.find({
                '_id': { $in: this.participants }
            });

            if (participants.length !== this.participants.length) {
                throw new Error('One or more participants do not exist');
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Task = mongoose.model('Task', taskSchema);
export default Task; 