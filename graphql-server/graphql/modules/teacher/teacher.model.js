import mongoose from "mongoose";
import User from "../user/user.model.js";

// Teacher schema definition
const teacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name:{
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  joining_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to validate user exists and has teacher role
teacherSchema.pre('save', async function(next) {
  try {
    const user = await User.findById(this.user_id);
    if (!user) {
      return next(new Error('Invalid user_id - User does not exist'));
    }
    if (user.role !== 'teacher') {
      return next(new Error('Invalid user_id - User is not a teacher'));
    }
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error); // Log the error
    next(error); // Pass error to next middleware
  }
});

// Teacher model
const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
