import Task from './task.model.js';
import { getUserByUID } from '../user/user.service.js';
import { sendTaskNotification, sendTaskUpdateNotification } from '../../../services/notification.service.js';

const populateAndTransformTask = async (task) => {
    await task.populate(['user_id', 'participants.user']);
    
    // Transform the task to include flattened participant fields
    const transformedTask = task.toObject();
    
    if (transformedTask.participants) {
        transformedTask.participants = transformedTask.participants.map(p => ({
            id: p.user._id,
            user: p.user,
            status: p.status,
            profile_picture: p.user.profile_picture,
            name: p.user.name,
            email: p.user.email
        }));
    }
    return transformedTask;
};

export const getAllTasks = async () => {
    const tasks = await Task.find()
        .populate('user_id')
        .populate('participants.user');
    return Promise.all(tasks.map(populateAndTransformTask));
};

export const getTaskById = async (id) => {
    const task = await Task.findById(id);
    if (!task) return null;
    return populateAndTransformTask(task);
};

export const getTasksByUser = async (user) => {
    const userDetails = await getUserByUID(user.uid);
    const tasks = await Task.find({ user_id: userDetails._id });
    return tasks;
    return Promise.all(tasks.map(populateAndTransformTask));
};

export const getTasksByParticipant = async (participant_id) => {
    const tasks = await Task.find({ 'participants.user': participant_id });
    return Promise.all(tasks.map(populateAndTransformTask));
};

export const getTasksByCategory = async (category) => {
    const tasks = await Task.find({ category });
    return Promise.all(tasks.map(populateAndTransformTask));
};

export const createTask = async (taskInput, user) => {
    try {     
        const userDetails = await getUserByUID(user.uid);
        // Format participants with pending status
        const formattedParticipants = taskInput.participants?.map(participantId => ({
            user: participantId,
            status: 'pending'
        })) || [];
        const task = await Task.create({
            ...taskInput,
            user_id: userDetails._id,
            participants: formattedParticipants
        });
        if (taskInput.participants?.length > 0) {
            await sendTaskNotification(task, taskInput.participants);
        }
        return task;
    } catch (error) {
        throw new Error(`Failed to create task: ${error.message}`);
    }
};

export const respondToTaskInvitation = async (taskId, userId, response) => {
    try {
        const task = await Task.findOneAndUpdate(
            { 
                _id: taskId,
                'participants.user': userId
            },
            {
                $set: {
                    'participants.$.status': response
                }
            },
            { new: true }
        );

        if (!task) {
            throw new Error('Task not found or user is not a participant');
        }

        return populateAndTransformTask(task);
    } catch (error) {
        throw new Error(`Failed to respond to task invitation: ${error.message}`);
    }
};

export const updateTask = async (id, taskInput) => {
    // Format new participants with pending status
    const formattedParticipants = taskInput.participants?.map(participantId => ({
        user: participantId,
        status: 'pending'
    })) || [];

    const task = await Task.findByIdAndUpdate(
        id,
        {
            ...taskInput,
            participants: formattedParticipants
        },
        { new: true }
    );

    // Send notifications to new participants
    if (taskInput.participants?.length > 0) {
        await sendTaskNotification(task, taskInput.participants);
    }

    return populateAndTransformTask(task);
};

export const updateTaskStatus = async (id, status) => {
    const task = await Task.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    // Send notifications to participants about the status update
    const participantIds = task.participants.map(p => p.user);
    if (participantIds.length > 0) {
        await sendTaskUpdateNotification(task, participantIds);
    }

    return populateAndTransformTask(task);
};

export const addParticipant = async (id, participant_id) => {
    const task = await Task.findByIdAndUpdate(
        id,
        { 
            $addToSet: { 
                participants: {
                    user: participant_id,
                    status: 'pending'
                }
            } 
        },
        { new: true }
    );

    // Send notification to the new participant
    await sendTaskNotification(task, [participant_id]);

    return populateAndTransformTask(task);
};

export const removeParticipant = async (id, participant_id) => {
    const task = await Task.findByIdAndUpdate(
        id,
        { 
            $pull: { 
                participants: {
                    user: participant_id
                }
            } 
        },
        { new: true }
    );
    return populateAndTransformTask(task);
};

export const deleteTask = async (id) => {
    const task = await Task.findByIdAndDelete(id);
    return task ? populateAndTransformTask(task) : null;
}; 