import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    uid:{
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
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    cover_picture: {
      type: String,
      required: false,
    },
    profile_picture: {
      type: String,
      required: false,
    },
    fcm_token: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;