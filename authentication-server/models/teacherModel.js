import mongoose from "mongoose";
import User from "./userModel.js";

// Teacher schema definition
const teacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  about:{
    type: String,
    required: true,
    default:'Tell your students more about yourself'
  },
  department: {
    type: String,
    required: true,
    default: 'Dept of Computer Science and Engineering'
  },
  designation: {
    type: String,
    required: true,
    default: 'Professor'
  },
  joining_date: {
    type: Date,
    default: Date.now
  },
  
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
