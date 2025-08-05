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
    profile_picture: {
      type: String,
      required: false,
      default:"https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?t=st=1745877124~exp=1745880724~hmac=2c6e05574eb27bded385015c8ffc1e7b0ea1e7e4fbef60df1cc0f2464cb447d0&w=1060",
    },
    cover_picture: {
      type: String,
      required: false,
      default:"https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?t=st=1745877124~exp=1745880724~hmac=2c6e05574eb27bded385015c8ffc1e7b0ea1e7e4fbef60df1cc0f2464cb447d0&w=1060",
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