import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    roll: {
      type: Number,
      required: false,
      default:"0000000"
    },
    section: {
      type: String,
      required: false,
      default: "A",
    },
    about:{
      type: String,
      required: false,
      default: "tell about yourself",
    },
    department:{
      type: String,
      required: false,
      default: "Computer Science and Engineering",
    },
    semester:{
      type: String,
      required: false,
      default: 1,
    },
    cgpa:{
      type: String,
      required: false,
      default: 0, 
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

studentSchema.pre("save", async function (next) {
  try {
    // Check if the referenced user exists
    const user = await mongoose.model("User").findById(this.user_id);
    if (!user) {
      return next(new Error(`Invalid user_id (${this.user_id}): User does not exist.`));
    }

    next(); // Proceed if user exists
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error); // Pass error to Mongoose
  }
});


const Student = mongoose.model("Student", studentSchema);
export default Student;