import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  roll: {
    type: Number,
    required: true,
    unique: true,
  },
  section: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
      'Please enter a valid email address.'
    ],
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
