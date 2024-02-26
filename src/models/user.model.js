import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter username"],
      unique: [true, "Username already exist"],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: [true, "Email already exist"],
      lowercase: true,
    },
    fullName: {
      type: String,
      required: [true, "Please enter your name"],
    },
    avatar: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
    },
    refreshToken: {
      type: String,
      required: [true, "Please enter password"],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
