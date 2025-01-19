import Task from './task.model.js';
import { getUserByUID } from '../user/user.service.js';
import { sendTaskNotification, sendTaskUpdateNotification } from '../../../services/notification.service.js';

export const getAllTasks = async () => {
    return await Task.find()
        .populate('user_id')
        .populate('participants');
};

export const getTaskById = async (id) => {
    return await Task.findById(id)
        .populate('user_id')
        .populate('participants');
};

export const getTasksByUser = async (user) => {
    const userDetails = await getUserByUID(user.uid);
    return await Task.find({ user_id: userDetails._id })
        .populate('user_id')
        .populate('participants');
};

export const getTasksByParticipant = async (participant_id) => {
    return await Task.find({ participants: participant_id })
        .populate('user_id')
        .populate('participants');
};

export const getTasksByCategory = async (category) => {
    return await Task.find({ category })
        .populate('user_id')
        .populate('participants');
};

export const createTask = async (taskInput, user) => {
    try {        
        const userDetails = await getUserByUID(user.uid);
        const task = await Task.create({
            ...taskInput,
            user_id: userDetails._id
        });

        // Send notifications to participants
        if (taskInput.participants?.length > 0) {
            await sendTaskNotification(task, taskInput.participants);
        }

        return task;
    } catch (error) {
        throw new Error(`Failed to create task: ${error.message}`);
    }
};

export const updateTask = async (id, taskInput) => {
    const task = await Task.findByIdAndUpdate(
        id,
        taskInput,
        { new: true }
    ).populate('user_id')
     .populate('participants');

    // Send notifications to participants about the update
    if (task.participants?.length > 0) {
        await sendTaskUpdateNotification(task, task.participants);
    }

    return task;
};

export const updateTaskStatus = async (id, status) => {
    const task = await Task.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    ).populate('user_id')
     .populate('participants');

    // Send notifications to participants about the status update
    if (task.participants?.length > 0) {
        await sendTaskUpdateNotification(task, task.participants);
    }

    return task;
};

export const addParticipant = async (id, participant_id) => {
    const task = await Task.findByIdAndUpdate(
        id,
        { $addToSet: { participants: participant_id } },
        { new: true }
    ).populate('user_id')
     .populate('participants');

    // Send notification to the new participant
    await sendTaskNotification(task, [participant_id]);

    return task;
};

export const removeParticipant = async (id, participant_id) => {
    return await Task.findByIdAndUpdate(
        id,
        { $pull: { participants: participant_id } },
        { new: true }
    ).populate('user_id')
     .populate('participants');
};

export const deleteTask = async (id) => {
    return await Task.findByIdAndDelete(id);
}; 